"use client";

interface LoginEvent {
  event: 'login_attempt' | 'login_success' | 'login_failure' | 'mfa_required';
  email?: string;
  method: 'password' | 'google' | 'microsoft';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  timestamp: string;
  errorCode?: string;
}

class LoginAnalytics {
  private static instance: LoginAnalytics;
  private queue: LoginEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoFlush();
  }

  static getInstance(): LoginAnalytics {
    if (!LoginAnalytics.instance) {
      LoginAnalytics.instance = new LoginAnalytics();
    }
    return LoginAnalytics.instance;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    if (typeof navigator === 'undefined') return 'Unknown';

    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  track(event: Omit<LoginEvent, 'deviceType' | 'browser' | 'timestamp'>) {
    const trackingEvent: LoginEvent = {
      ...event,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      timestamp: new Date().toISOString(),
    };

    this.queue.push(trackingEvent);

    // If critical event or queue is large, flush immediately
    if (event.event === 'login_failure' || this.queue.length >= 10) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      // Send to analytics endpoint
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
        keepalive: true,
      });
    } catch (error) {
      console.error('Failed to track analytics:', error);
      // Don't re-queue to prevent infinite loop
    }
  }

  private startAutoFlush() {
    if (typeof window === 'undefined') return;

    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const loginAnalytics = LoginAnalytics.getInstance();

// Convenience functions
export function trackLoginAttempt(email: string, method: 'password' | 'google' | 'microsoft') {
  loginAnalytics.track({
    event: 'login_attempt',
    email: email.substring(0, 3) + '***', // Anonymize
    method,
  });
}

export function trackLoginSuccess(method: 'password' | 'google' | 'microsoft') {
  loginAnalytics.track({
    event: 'login_success',
    method,
  });
}

export function trackLoginFailure(errorCode: string, method: 'password' | 'google' | 'microsoft') {
  loginAnalytics.track({
    event: 'login_failure',
    method,
    errorCode,
  });
}

export function trackMFARequired(method: 'password' | 'google' | 'microsoft') {
  loginAnalytics.track({
    event: 'mfa_required',
    method,
  });
}