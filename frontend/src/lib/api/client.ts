/**
 * ✅ SECURE API Client - Fixed for Production
 * - Tokens in httpOnly cookies (backend managed)
 * - CSRF protection via server-generated tokens
 * - Automatic retry with exponential backoff
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { logSecurityEvent } from "@/lib/security/logging";


const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true, // ✅ Already set!
});

// const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
//   timeout: 30000,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, // ✅ CRITICAL: Send httpOnly cookies automatically
// });

const retryCountMap = new Map<string, number>();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function getRequestKey(config: AxiosRequestConfig): string {
  return `${config.method}-${config.url}`;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getRetryDelay(retryCount: number): number {
  return RETRY_DELAY * Math.pow(2, retryCount);
}

function isRetryableError(error: AxiosError): boolean {
  if (!error.response) return true;
  const status = error.response.status;
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
}

// ============================================
// REQUEST INTERCEPTOR - ✅ SECURE VERSION
// ============================================
apiClient.interceptors.request.use(
  async (config) => {
    // 1. ✅ CSRF Token from backend (read from cookie or meta tag)
    if (config.method !== 'get') {
      try {
        // Backend should set CSRF token in cookie: csrf-token
        // Or in meta tag: <meta name="csrf-token" content="...">
        const csrfToken = getCsrfTokenFromCookie() || getCsrfTokenFromMeta();

        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }
    }

    // 2. ❌ REMOVED: Authorization header (token now in httpOnly cookie)
    // Backend will read token from cookie automatically

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
    const requestKey = getRequestKey(response.config);
    retryCountMap.delete(requestKey);
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // ============================================
    // HANDLE 401 UNAUTHORIZED
    // ============================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ SECURE: Call backend refresh endpoint
        // Backend will refresh the httpOnly cookie
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry original request with new cookie
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        if (typeof window !== "undefined") {
          // Clear local storage
          localStorage.removeItem("auth-storage");

          logSecurityEvent('session_expired', {
            metadata: { reason: 'token_refresh_failed' },
          });

          window.location.href = "/login?reason=session_expired";
        }

        return Promise.reject(refreshError);
      }
    }

    // ============================================
    // HANDLE 403 FORBIDDEN (CSRF)
    // ============================================
    if (error.response?.status === 403) {
      logSecurityEvent('api_forbidden', {
        metadata: {
          endpoint: originalRequest.url,
          method: originalRequest.method,
        },
      });

      const csrfError = error.response.data?.error?.toLowerCase().includes('csrf');
      if (csrfError) {
        // Fetch fresh CSRF token from backend
        try {
          await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/csrf`, {
            withCredentials: true,
          });
          // Retry with new CSRF token
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

      const requestKey = getRequestKey(originalRequest);
      const retryCount = retryCountMap.get(requestKey) || 0;

      if (retryCount < MAX_RETRIES) {
        retryCountMap.set(requestKey, retryCount + 1);
        await delay(retryDelay);
        return apiClient(originalRequest);
      }
    }

    // ============================================
    // HANDLE RETRYABLE ERRORS
    // ============================================
    if (isRetryableError(error) && !originalRequest._retry) {
      const requestKey = getRequestKey(originalRequest);
      const retryCount = retryCountMap.get(requestKey) || 0;

      if (retryCount < MAX_RETRIES) {
        retryCountMap.set(requestKey, retryCount + 1);
        const retryDelay = getRetryDelay(retryCount);
        await delay(retryDelay);

        console.log(
          `Retrying request (${retryCount + 1}/${MAX_RETRIES}):`,
          originalRequest.url
        );

        return apiClient(originalRequest);
      } else {
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
    // LOG ERRORS
    // ============================================
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: originalRequest.url,
      });
    } else if (error.request) {
      console.error('API No Response:', {
        url: originalRequest.url,
        message: error.message,
      });
    } else {
      console.error('API Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * ✅ Get CSRF token from cookie (set by backend)
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/csrf[_-]?token=([^;]+)/i);
  return match ? match[1] : null;
}

/**
 * ✅ Get CSRF token from meta tag (alternative method)
 */
function getCsrfTokenFromMeta(): string | null {
  if (typeof document === 'undefined') return null;

  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
}

export default apiClient;

// Type-safe request wrappers
export async function apiRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response as unknown as T;
}

export async function apiGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, method: 'GET', url });
}

export async function apiPost<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, method: 'POST', url, data });
}

export async function apiPut<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, method: 'PUT', url, data });
}

export async function apiDelete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, method: 'DELETE', url });
}

export async function apiPatch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiRequest<T>({ ...config, method: 'PATCH', url, data });
}