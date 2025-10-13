/**
 * CSRF Protection Implementation
 * Prevents Cross-Site Request Forgery attacks
 */

import { generateSecureRandom } from './encryption';

interface CSRFTokenData {
  token: string;
  timestamp: number;
  expiresAt: number;
}

class CSRFProtection {
  private static instance: CSRFProtection;
  private tokenData: CSRFTokenData | null = null;
  private readonly TOKEN_VALIDITY = 3600000; // 1 hour
  private readonly STORAGE_KEY = 'csrf_token';

  private constructor() {
    this.loadTokenFromStorage();
  }

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  /**
   * Generate new CSRF token
   */
  async generateToken(): Promise<string> {
    const token = generateSecureRandom(32);
    const timestamp = Date.now();
    const expiresAt = timestamp + this.TOKEN_VALIDITY;

    this.tokenData = {
      token,
      timestamp,
      expiresAt,
    };

    this.saveTokenToStorage();
    return token;
  }

  /**
   * Get current CSRF token (generate if not exists or expired)
   */
  async getToken(): Promise<string> {
    // Check if token exists and is valid
    if (this.tokenData && Date.now() < this.tokenData.expiresAt) {
      return this.tokenData.token;
    }

    // Generate new token if expired or doesn't exist
    return await this.generateToken();
  }

  /**
   * Validate CSRF token
   * @param token - Token to validate
   * @returns True if valid, false otherwise
   */
  validateToken(token: string): boolean {
    if (!this.tokenData) {
      return false;
    }

    // Check if token matches
    if (this.tokenData.token !== token) {
      return false;
    }

    // Check if token is expired
    if (Date.now() >= this.tokenData.expiresAt) {
      this.clearToken();
      return false;
    }

    return true;
  }

  /**
   * Clear current token
   */
  clearToken(): void {
    this.tokenData = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Save token to sessionStorage
   */
  private saveTokenToStorage(): void {
    if (typeof window !== 'undefined' && this.tokenData) {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tokenData));
      } catch (error) {
        console.error('Failed to save CSRF token:', error);
      }
    }
  }

  /**
   * Load token from sessionStorage
   */
  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as CSRFTokenData;

          // Check if token is still valid
          if (Date.now() < data.expiresAt) {
            this.tokenData = data;
          } else {
            this.clearToken();
          }
        }
      } catch (error) {
        console.error('Failed to load CSRF token:', error);
        this.clearToken();
      }
    }
  }

  /**
   * Get token headers for API requests
   */
  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'X-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * Rotate token (generate new one)
   * Call this after sensitive operations or periodically
   */
  async rotateToken(): Promise<string> {
    this.clearToken();
    return await this.generateToken();
  }

  /**
   * Get time until token expiration (in seconds)
   */
  getTimeUntilExpiration(): number {
    if (!this.tokenData) {
      return 0;
    }

    const remaining = this.tokenData.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Check if token needs refresh (< 5 minutes remaining)
   */
  needsRefresh(): boolean {
    const timeRemaining = this.getTimeUntilExpiration();
    return timeRemaining < 300; // 5 minutes
  }
}

// Export singleton instance
export const csrfProtection = CSRFProtection.getInstance();

/**
 * Hook-friendly CSRF token getter
 */
export async function getCSRFToken(): Promise<string> {
  return await csrfProtection.getToken();
}

/**
 * Get CSRF headers for fetch/axios
 */
export async function getCSRFHeaders(): Promise<Record<string, string>> {
  return await csrfProtection.getHeaders();
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  return csrfProtection.validateToken(token);
}

/**
 * Clear CSRF token
 */
export function clearCSRFToken(): void {
  csrfProtection.clearToken();
}

/**
 * Rotate CSRF token
 */
export async function rotateCSRFToken(): Promise<string> {
  return await csrfProtection.rotateToken();
}

/**
 * Axios interceptor helper
 * Add this to your axios instance
 */
export async function addCSRFToAxios(config: any): Promise<any> {
  const headers = await getCSRFHeaders();
  config.headers = {
    ...config.headers,
    ...headers,
  };
  return config;
}
