interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutDurationMs: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

/**
 * ✅ FIXED: Rate Limiter with SessionStorage Persistence
 * Survives page refreshes within same session
 */
class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'rate_limit_data';

  constructor() {
    this.loadFromSessionStorage();
    this.startCleanup();
  }

  /**
   * ✅ Load rate limit data from sessionStorage
   */
  private loadFromSessionStorage(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;

    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as Array<[string, RateLimitEntry]>;
        this.storage = new Map(data);

        // Clean expired entries
        const now = Date.now();
        for (const [key, entry] of this.storage.entries()) {
          if (entry.lockedUntil && now > entry.lockedUntil) {
            this.storage.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load rate limit data:', error);
      this.storage.clear();
    }
  }

  /**
   * ✅ Save rate limit data to sessionStorage
   */
  private saveToSessionStorage(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;

    try {
      const data = Array.from(this.storage.entries());
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save rate limit data:', error);
    }
  }

  /**
   * Check if action is allowed
   */
  check(
    key: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remainingAttempts: number;
    lockedUntil?: number;
    retryAfter?: number;
  } {
    const entry = this.storage.get(key);
    const now = Date.now();

    // No entry, allow and create new
    if (!entry) {
      this.storage.set(key, {
        attempts: 1,
        firstAttemptAt: now,
      });
      this.saveToSessionStorage();
      return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }

    // Check if locked
    if (entry.lockedUntil && now < entry.lockedUntil) {
      const retryAfter = Math.ceil((entry.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: entry.lockedUntil,
        retryAfter,
      };
    }

    // Check if window has expired
    if (now - entry.firstAttemptAt > config.windowMs) {
      // Reset window
      this.storage.set(key, {
        attempts: 1,
        firstAttemptAt: now,
      });
      this.saveToSessionStorage();
      return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }

    // Increment attempts
    entry.attempts += 1;

    // Check if exceeded max attempts
    if (entry.attempts > config.maxAttempts) {
      entry.lockedUntil = now + config.lockoutDurationMs;
      this.storage.set(key, entry);
      this.saveToSessionStorage();

      const retryAfter = Math.ceil(config.lockoutDurationMs / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: entry.lockedUntil,
        retryAfter,
      };
    }

    this.storage.set(key, entry);
    this.saveToSessionStorage();

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - entry.attempts,
    };
  }

  /**
   * Reset rate limit for a key (e.g., after successful action)
   */
  reset(key: string): void {
    this.storage.delete(key);
    this.saveToSessionStorage();
  }

  /**
   * Get current status without incrementing
   */
  getStatus(key: string, config: RateLimitConfig): {
    attempts: number;
    remainingAttempts: number;
    isLocked: boolean;
    lockedUntil?: number;
  } {
    const entry = this.storage.get(key);
    const now = Date.now();

    if (!entry) {
      return {
        attempts: 0,
        remainingAttempts: config.maxAttempts,
        isLocked: false,
      };
    }

    const isLocked = !!(entry.lockedUntil && now < entry.lockedUntil);

    return {
      attempts: entry.attempts,
      remainingAttempts: Math.max(0, config.maxAttempts - entry.attempts),
      isLocked,
      lockedUntil: entry.lockedUntil,
    };
  }

  /**
   * Cleanup expired entries every 5 minutes
   */
  private startCleanup(): void {
    if (typeof window === 'undefined') return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;

      for (const [key, entry] of this.storage.entries()) {
        // Remove if lockout expired and window passed
        if (
          (!entry.lockedUntil || now > entry.lockedUntil) &&
          now - entry.firstAttemptAt > 3600000 // 1 hour
        ) {
          this.storage.delete(key);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        this.saveToSessionStorage();
      }
    }, 300000); // 5 minutes
  }

  /**
   * Clear all rate limits (use with caution)
   */
  clearAll(): void {
    this.storage.clear();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAll();
  }
}

// Export singleton
export const rateLimiter = new RateLimiter();

// Predefined configs for common scenarios
export const RateLimitConfigs = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutDurationMs: 60 * 60 * 1000, // 1 hour
  },
  OTP_VERIFICATION: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
    lockoutDurationMs: 10 * 60 * 1000, // 10 minutes
  },
  MFA: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  },
};

// Utility function to format lockout message
export const formatLockoutMessage = (retryAfter?: number): string => {
  if (!retryAfter) return 'Too many attempts. Please try again later.';

  if (retryAfter < 60) {
    return `Too many attempts. Please try again in ${retryAfter} seconds.`;
  }

  const minutes = Math.ceil(retryAfter / 60);
  return `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
};