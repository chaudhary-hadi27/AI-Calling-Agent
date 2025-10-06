export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'login_locked'
  | 'logout'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'password_change'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_verified'
  | 'mfa_failed'
  | 'oauth_initiated'
  | 'oauth_success'
  | 'oauth_failed'
  | 'suspicious_activity'
  | 'new_device_login'
  | 'session_expired'
  | 'token_refresh';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  metadata?: Record<string, any>;
  timestamp: string;
  sessionId?: string;
}

class SecurityLogger {
  private static instance: SecurityLogger;
  private endpoint = '/api/logs/security';
  private queue: SecurityEvent[] = [];
  private isProcessing = false;
  private readonly maxQueueSize = 50;
  private readonly flushInterval = 5000; // 5 seconds

  private constructor() {
    // Start automatic queue flushing
    this.startAutoFlush();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  async log(
    type: SecurityEventType,
    data?: Partial<SecurityEvent>
  ): Promise<void> {
    const event = await this.createEvent(type, data);

    // Add to queue
    this.queue.push(event);

    // If queue is full or critical event, flush immediately
    if (this.queue.length >= this.maxQueueSize || event.severity === 'critical') {
      await this.flush();
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Security Event: ${type}]`, event);
    }
  }

  private async createEvent(
    type: SecurityEventType,
    data?: Partial<SecurityEvent>
  ): Promise<SecurityEvent> {
    const severity = this.getSeverity(type);
    const ip = await this.getClientIP();
    const location = await this.getLocationInfo(ip);

    return {
      type,
      severity,
      timestamp: new Date().toISOString(),
      ip,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      location,
      sessionId: this.getSessionId(),
      ...data,
    };
  }

  private getSeverity(type: SecurityEventType): SecuritySeverity {
    const criticalEvents: SecurityEventType[] = [
      'login_locked',
      'suspicious_activity',
      'mfa_failed',
      'oauth_failed',
    ];

    const warningEvents: SecurityEventType[] = [
      'login_failure',
      'password_reset_request',
      'new_device_login',
      'session_expired',
    ];

    if (criticalEvents.includes(type)) return 'critical';
    if (warningEvents.includes(type)) return 'warning';
    return 'info';
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  private async getLocationInfo(ip?: string): Promise<SecurityEvent['location']> {
    if (!ip) return undefined;

    try {
      // Using ipapi.co (100 requests/day free)
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      return {
        country: data.country_name,
        city: data.city,
        region: data.region,
      };
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startAutoFlush(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend }),
        keepalive: true, // Important for beforeunload
      });
    } catch (error) {
      console.error('Failed to send security logs:', error);
      // Re-queue events on failure
      this.queue.unshift(...eventsToSend);
    } finally {
      this.isProcessing = false;
    }
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance();

// Convenience functions
export const logSecurityEvent = (
  type: SecurityEventType,
  data?: Partial<SecurityEvent>
): Promise<void> => {
  return securityLogger.log(type, data);
};

export const logLoginAttempt = (email: string): Promise<void> => {
  return logSecurityEvent('login_attempt', { email });
};

export const logLoginSuccess = (userId: string, email: string): Promise<void> => {
  return logSecurityEvent('login_success', { userId, email });
};

export const logLoginFailure = (email: string, reason?: string): Promise<void> => {
  return logSecurityEvent('login_failure', {
    email,
    metadata: { reason }
  });
};

export const logSuspiciousActivity = (
  description: string,
  metadata?: Record<string, any>
): Promise<void> => {
  return logSecurityEvent('suspicious_activity', {
    severity: 'critical',
    metadata: { description, ...metadata },
  });
};