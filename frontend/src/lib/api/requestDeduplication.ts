/**
 * ✅ Request Deduplication System
 * Prevents identical concurrent requests from being sent multiple times
 *
 * Use case: User clicks button multiple times, but only 1 request is sent
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly CACHE_DURATION = 1000; // 1 second

  /**
   * Generate unique key for request
   */
  private generateKey(config: AxiosRequestConfig): string {
    const method = config.method?.toLowerCase() || 'get';
    const url = config.url || '';
    const params = JSON.stringify(config.params || {});
    const data = config.method?.toLowerCase() !== 'get'
      ? JSON.stringify(config.data || {})
      : '';

    return `${method}:${url}:${params}:${data}`;
  }

  /**
   * Check if request should be deduplicated
   */
  private shouldDeduplicate(config: AxiosRequestConfig): boolean {
    // Don't deduplicate if explicitly disabled
    if ((config as any).noDeduplicate === true) {
      return false;
    }

    // Only deduplicate GET and safe methods
    const method = config.method?.toLowerCase() || 'get';
    const safeMethods = ['get', 'head', 'options'];

    // Also deduplicate POST/PUT/DELETE for idempotency
    // But check if there's a special flag
    if ((config as any).idempotent === true) {
      return true;
    }

    return safeMethods.includes(method);
  }

  /**
   * Get or create deduplicated request
   */
  async deduplicate<T = any>(
    config: AxiosRequestConfig,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if should deduplicate
    if (!this.shouldDeduplicate(config)) {
      return requestFn();
    }

    const key = this.generateKey(config);
    const now = Date.now();

    // Check for pending request
    const pending = this.pendingRequests.get(key);
    if (pending && now - pending.timestamp < this.CACHE_DURATION) {
      console.log(`[Dedup] Reusing pending request: ${key}`);
      return pending.promise as Promise<T>;
    }

    // Create new request
    console.log(`[Dedup] Creating new request: ${key}`);
    const promise = requestFn();

    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: now,
    });

    // Clean up after completion
    promise
      .finally(() => {
        // Remove from pending after a short delay
        // This allows quick subsequent requests to still use the same promise
        setTimeout(() => {
          const current = this.pendingRequests.get(key);
          if (current && current.timestamp === now) {
            this.pendingRequests.delete(key);
          }
        }, this.CACHE_DURATION);
      });

    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Clear specific request
   */
  clearRequest(config: AxiosRequestConfig): void {
    const key = this.generateKey(config);
    this.pendingRequests.delete(key);
  }

  /**
   * Get pending request count
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Export singleton
export const requestDeduplicator = new RequestDeduplicator();

/**
 * ✅ Usage in API client:
 *
 * import { requestDeduplicator } from './requestDeduplication';
 *
 * // In request interceptor:
 * apiClient.interceptors.request.use(async (config) => {
 *   // Deduplicate request
 *   config._deduplicatedPromise = await requestDeduplicator.deduplicate(
 *     config,
 *     () => axios(config)
 *   );
 *   return config;
 * });
 *
 * // Or use directly:
 * const data = await requestDeduplicator.deduplicate(
 *   { method: 'GET', url: '/api/users' },
 *   () => apiClient.get('/api/users')
 * );
 */

/**
 * React Hook for deduplicated requests
 */
export function useDeduplicate() {
  return {
    deduplicate: <T = any>(
      config: AxiosRequestConfig,
      requestFn: () => Promise<T>
    ) => requestDeduplicator.deduplicate(config, requestFn),

    clear: () => requestDeduplicator.clear(),

    clearRequest: (config: AxiosRequestConfig) =>
      requestDeduplicator.clearRequest(config),

    pendingCount: requestDeduplicator.getPendingCount(),
  };
}

/**
 * ✅ Example Usage:
 *
 * // In a component:
 * const { deduplicate } = useDeduplicate();
 *
 * const fetchData = async () => {
 *   const data = await deduplicate(
 *     { method: 'GET', url: '/api/data' },
 *     () => apiClient.get('/api/data')
 *   );
 *   return data;
 * };
 *
 * // Multiple calls within 1 second = only 1 actual request
 * fetchData(); // Request 1
 * fetchData(); // Reuses Request 1
 * fetchData(); // Reuses Request 1
 */