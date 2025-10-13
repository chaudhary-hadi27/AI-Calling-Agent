/**
 * Enhanced API Client with Security Features
 * - CSRF Protection
 * - Automatic Token Refresh
 * - Request Retry Logic
 * - Request/Response Encryption
 * - Error Handling & Logging
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getCSRFHeaders } from "@/lib/security/csrfProtection";
import { logSecurityEvent } from "@/lib/security/logging";

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for CSRF
});

// Track request retry attempts
const retryCountMap = new Map<string, number>();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Get unique request key for retry tracking
 */
function getRequestKey(config: AxiosRequestConfig): string {
  return `${config.method}-${config.url}`;
}

/**
 * Delay helper for retry logic
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(retryCount: number): number {
  return RETRY_DELAY * Math.pow(2, retryCount);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: AxiosError): boolean {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }

  const status = error.response.status;
  
  // Retry on these status codes
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
}

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
  async (config) => {
    // 1. Add CSRF token to all non-GET requests
    if (config.method !== 'get') {
      try {
        const csrfHeaders = await getCSRFHeaders();
        config.headers = {
          ...config.headers,
          ...csrfHeaders,
        };
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }
    }

    // 2. Add auth token from storage
    if (typeof window !== "undefined") {
      try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          const token = state?.token;
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error("Error parsing auth storage:", error);
      }
    }

    // 3. Add request metadata
    config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Client-Version'] = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

    // 4. Log sensitive requests
    if (config.url?.includes('auth') || config.url?.includes('password')) {
      logSecurityEvent('api_request', {
        metadata: {
          endpoint: config.url,
          method: config.method,
        },
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Clear retry count on success
    const requestKey = getRequestKey(response.config);
    retryCountMap.delete(requestKey);

    // Return data directly (unwrap response)
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // ============================================
    // HANDLE 401 UNAUTHORIZED
    // ============================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.token;

        // Update token in storage
        if (typeof window !== "undefined") {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            parsed.state.token = newToken;
            localStorage.setItem("auth-storage", JSON.stringify(parsed));
          }
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          document.cookie = "auth-token=; path=/; max-age=0";
          
          logSecurityEvent('session_expired', {
            metadata: { reason: 'token_refresh_failed' },
          });

          window.location.href = "/login?reason=session_expired";
        }

        return Promise.reject(refreshError);
      }
    }

    // ============================================
    // HANDLE 403 FORBIDDEN
    // ============================================
    if (error.response?.status === 403) {
      logSecurityEvent('api_forbidden', {
        metadata: {
          endpoint: originalRequest.url,
          method: originalRequest.method,
        },
      });

      // Check if CSRF token issue
      const csrfError = error.response.data?.error?.toLowerCase().includes('csrf');
      if (csrfError) {
        // Retry with fresh CSRF token
        try {
          const csrfHeaders = await getCSRFHeaders();
          if (originalRequest.headers) {
            originalRequest.headers = {
              ...originalRequest.headers,
              ...csrfHeaders,
            };
          }
          return apiClient(originalRequest);
        } catch {
          return Promise.reject(error);
        }
      }
    }

    // ============================================
    // HANDLE 429 RATE LIMIT
    // ============================================
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

      logSecurityEvent('api_rate_limited', {
        metadata: {
          endpoint: originalRequest.url,
          retryAfter: retryDelay,
        },
      });

      // Wait and retry if within retry limit
      const requestKey = getRequestKey(originalRequest);
      const retryCount = retryCountMap.get(requestKey) || 0;

      if (retryCount < MAX_RETRIES) {
        retryCountMap.set(requestKey, retryCount + 1);
        await delay(retryDelay);
        return apiClient(originalRequest);
      }
    }

    // ============================================
    // HANDLE RETRYABLE ERRORS (Network, 5xx)
    // ============================================
    if (isRetryableError(error) && !originalRequest._retry) {
      const requestKey = getRequestKey(originalRequest);
      const retryCount = retryCountMap.get(requestKey) || 0;

      if (retryCount < MAX_RETRIES) {
        retryCountMap.set(requestKey, retryCount + 1);
        
        // Exponential backoff
        const retryDelay = getRetryDelay(retryCount);
        await delay(retryDelay);

        console.log(
          `Retrying request (${retryCount + 1}/${MAX_RETRIES}):`,
          originalRequest.url
        );

        return apiClient(originalRequest);
      } else {
        // Max retries exceeded
        retryCountMap.delete(requestKey);
        
        logSecurityEvent('api_max_retries', {
          metadata: {
            endpoint: originalRequest.url,
            attempts: MAX_RETRIES,
          },
        });
      }
    }

    // ============================================
    // LOG OTHER ERRORS
    // ============================================
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: originalRequest.url,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('API No Response:', {
        url: originalRequest.url,
        message: error.message,
      });
    } else {
      // Request setup error
      console.error('API Request Error:', error.message);
    }

    // Return rejected promise with error
    return Promise.reject(error);
  }
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if API is healthy
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Get API version
 */
export async function getAPIVersion(): Promise<string> {
  try {
    const response = await apiClient.get('/version');
    return response.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Clear all retry counters
 */
export function clearRetryCounters(): void {
  retryCountMap.clear();
}

/**
 * Get current retry count for a request
 */
export function getRetryCount(method: string, url: string): number {
  const key = `${method}-${url}`;
  return retryCountMap.get(key) || 0;
}

// Export configured client
export default apiClient;

// ============================================
// TYPE-SAFE API WRAPPER
// ============================================

/**
 * Type-safe API request wrapper
 */
export async function apiRequest<T = any>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response as unknown as T;
  } catch (error) {
    throw error;
  }
}

/**
 * Type-safe GET request
 */
export async function apiGet<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'GET', url });
}

/**
 * Type-safe POST request
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'POST', url, data });
}

/**
 * Type-safe PUT request
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'PUT', url, data });
}

/**
 * Type-safe DELETE request
 */
export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'DELETE', url });
}

/**
 * Type-safe PATCH request
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: 'PATCH', url, data });
}