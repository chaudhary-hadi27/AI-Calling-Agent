import { logSecurityEvent } from './logging';

interface SessionConfig {
  timeoutMs: number; // Inactivity timeout
  warningMs: number; // Show warning before timeout
  checkIntervalMs: number; // How often to check
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  timeoutMs: 30 * 60 * 1000, // 30 minutes
  warningMs: 5 * 60 * 1000, // 5 minutes before timeout
  checkIntervalMs: 60 * 1000, // Check every minute
};

class SessionManager {
  private lastActivityTime: number = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private warningShown: boolean = false;
  private config: SessionConfig = DEFAULT_SESSION_CONFIG;
  private onTimeout?: () => void;
  private onWarning?: (timeRemaining: number) => void;
  private activityListeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupActivityListeners();
    }
  }

  /**
   * Start session monitoring
   */
  start(
    config?: Partial<SessionConfig>,
    callbacks?: {
      onTimeout?: () => void;
      onWarning?: (timeRemaining: number) => void;
    }
  ): void {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.onTimeout = callbacks?.onTimeout;
    this.onWarning = callbacks?.onWarning;
    this.lastActivityTime = Date.now();
    this.warningShown = false;

    // Start checking
    this.checkInterval = setInterval(() => {
      this.checkSession();
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop session monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.removeActivityListeners();
  }

  /**
   * Reset activity timer (called on user interaction)
   */
  resetActivity(): void {
    this.lastActivityTime = Date.now();
    this.warningShown = false;
  }

  /**
   * Get time since last activity
   */
  getInactiveTime(): number {
    return Date.now() - this.lastActivityTime;
  }

  /**
   * Get time remaining before timeout
   */
  getTimeRemaining(): number {
    const inactiveTime = this.getInactiveTime();
    return Math.max(0, this.config.timeoutMs - inactiveTime);
  }

  /**
   * Check if session should timeout
   */
  private checkSession(): void {
    const inactiveTime = this.getInactiveTime();
    const timeRemaining = this.config.timeoutMs - inactiveTime;

    // Show warning
    if (!this.warningShown && timeRemaining <= this.config.warningMs && timeRemaining > 0) {
      this.warningShown = true;
      this.onWarning?.(timeRemaining);
      logSecurityEvent('session_warning', {
        metadata: { timeRemaining: Math.floor(timeRemaining / 1000) }
      });
    }

    // Timeout
    if (inactiveTime >= this.config.timeoutMs) {
      this.stop();
      logSecurityEvent('session_expired', {
        metadata: { inactiveTime: Math.floor(inactiveTime / 1000) }
      });
      this.onTimeout?.();
    }
  }

  /**
   * Setup activity listeners
   */
  private setupActivityListeners(): void {
    const updateActivity = () => this.resetActivity();

    // Mouse and keyboard events
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('click', updateActivity);

    // Store for cleanup
    this.activityListeners = [
      () => window.removeEventListener('mousemove', updateActivity),
      () => window.removeEventListener('mousedown', updateActivity),
      () => window.removeEventListener('keydown', updateActivity),
      () => window.removeEventListener('scroll', updateActivity),
      () => window.removeEventListener('touchstart', updateActivity),
      () => window.removeEventListener('click', updateActivity),
    ];
  }

  /**
   * Remove activity listeners
   */
  private removeActivityListeners(): void {
    this.activityListeners.forEach(remove => remove());
    this.activityListeners = [];
  }
}

// Export singleton
export const sessionManager = new SessionManager();

/**
 * Token refresh manager
 */
class TokenRefreshManager {
  private refreshTimeout: NodeJS.Timeout | null = null;

  /**
   * Schedule token refresh before expiry
   */
  scheduleRefresh(
    expiresAt: number,
    refreshCallback: () => Promise<void>,
    bufferMs: number = 5 * 60 * 1000 // 5 minutes before expiry
  ): void {
    this.cancelRefresh();

    const now = Date.now();
    const refreshAt = expiresAt - bufferMs;
    const delay = refreshAt - now;

    if (delay > 0) {
      this.refreshTimeout = setTimeout(async () => {
        try {
          await refreshCallback();
          logSecurityEvent('token_refresh', {
            metadata: { success: true }
          });
        } catch (error) {
          logSecurityEvent('token_refresh', {
            metadata: { success: false, error: String(error) },
            severity: 'warning'
          });
        }
      }, delay);
    } else {
      // Token already expired or about to expire, refresh immediately
      refreshCallback().catch(error => {
        logSecurityEvent('token_refresh', {
          metadata: { success: false, error: String(error), immediate: true },
          severity: 'critical'
        });
      });
    }
  }

  /**
   * Cancel scheduled refresh
   */
  cancelRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}

// Export singleton
export const tokenRefreshManager = new TokenRefreshManager();

/**
 * Parse JWT token
 */
export const parseJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;

  return Date.now() >= payload.exp * 1000;
};

/**
 * Get token expiry time
 */
export const getTokenExpiry = (token: string): number | null => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return null;

  return payload.exp * 1000;
};