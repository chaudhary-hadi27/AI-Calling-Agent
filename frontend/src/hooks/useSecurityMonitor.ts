/**
 * useSecurityMonitor Hook
 * Monitors and logs security events
 */

import { useEffect, useCallback, useState } from 'react';
import {
  logSecurityEvent,
  SecurityEventType,
  SecurityEvent,
} from '@/lib/security/logging';
import { getDeviceInfo, DeviceInfo } from '@/lib/security/deviceFingerprint';
import { useAuthStore } from '@/lib/store/authStore';

interface SecurityAlert {
  id: string;
  type: SecurityEventType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface SecurityMonitorState {
  alerts: SecurityAlert[];
  lastEvent: SecurityEvent | null;
  deviceInfo: DeviceInfo | null;
  isMonitoring: boolean;
}

interface UseSecurityMonitorOptions {
  autoStart?: boolean;
  enableAlerts?: boolean;
  maxAlerts?: number;
}

/**
 * Hook for monitoring and logging security events
 *
 * @example
 * ```tsx
 * const { logEvent, alerts, clearAlerts } = useSecurityMonitor({
 *   autoStart: true,
 *   enableAlerts: true,
 * });
 *
 * // Log a security event
 * await logEvent('login_attempt', {
 *   email: 'user@example.com',
 *   metadata: { loginMethod: 'password' }
 * });
 * ```
 */
export function useSecurityMonitor(options: UseSecurityMonitorOptions = {}) {
  const {
    autoStart = true,
    enableAlerts = true,
    maxAlerts = 10,
  } = options;

  const { user } = useAuthStore();

  const [state, setState] = useState<SecurityMonitorState>({
    alerts: [],
    lastEvent: null,
    deviceInfo: null,
    isMonitoring: false,
  });

  /**
   * Initialize device fingerprinting
   */
  useEffect(() => {
    if (autoStart) {
      const initDevice = async () => {
        try {
          const deviceInfo = await getDeviceInfo();
          setState(prev => ({ ...prev, deviceInfo }));
        } catch (error) {
          console.error('Failed to get device info:', error);
        }
      };

      initDevice();
    }
  }, [autoStart]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: true }));
  }, []);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  /**
   * Log security event
   */
  const logEvent = useCallback(
    async (
      type: SecurityEventType,
      data?: Partial<SecurityEvent>
    ): Promise<void> => {
      if (!state.isMonitoring && !autoStart) return;

      try {
        // Merge with device info and user data
        const eventData: Partial<SecurityEvent> = {
          ...data,
          userId: data?.userId || user?.id,
          email: data?.email || user?.email,
          deviceId: state.deviceInfo?.fingerprint,
        };

        // Log to backend
        await logSecurityEvent(type, eventData);

        // Update state
        const event: SecurityEvent = {
          type,
          severity: getSeverity(type),
          timestamp: new Date().toISOString(),
          ...eventData,
        } as SecurityEvent;

        setState(prev => ({
          ...prev,
          lastEvent: event,
        }));

        // Create alert if enabled
        if (enableAlerts && shouldCreateAlert(type)) {
          const alert: SecurityAlert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity: getSeverity(type),
            message: getAlertMessage(type, eventData),
            timestamp: new Date().toISOString(),
            metadata: eventData.metadata,
          };

          setState(prev => ({
            ...prev,
            alerts: [alert, ...prev.alerts].slice(0, maxAlerts),
          }));
        }
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    },
    [state.isMonitoring, state.deviceInfo, user, autoStart, enableAlerts, maxAlerts]
  );

  /**
   * Clear all alerts
   */
  const clearAlerts = useCallback(() => {
    setState(prev => ({ ...prev, alerts: [] }));
  }, []);

  /**
   * Clear specific alert
   */
  const clearAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId),
    }));
  }, []);

  /**
   * Get alerts by severity
   */
  const getAlertsBySeverity = useCallback(
    (severity: 'info' | 'warning' | 'critical') => {
      return state.alerts.filter(a => a.severity === severity);
    },
    [state.alerts]
  );

  /**
   * Check if there are critical alerts
   */
  const hasCriticalAlerts = useCallback(() => {
    return state.alerts.some(a => a.severity === 'critical');
  }, [state.alerts]);

  /**
   * Log login attempt
   */
  const logLoginAttempt = useCallback(
    async (email: string, method: string = 'password') => {
      await logEvent('login_attempt', {
        email,
        metadata: { method },
      });
    },
    [logEvent]
  );

  /**
   * Log login success
   */
  const logLoginSuccess = useCallback(
    async (email: string, method: string = 'password') => {
      await logEvent('login_success', {
        email,
        metadata: { method },
      });
    },
    [logEvent]
  );

  /**
   * Log login failure
   */
  const logLoginFailure = useCallback(
    async (email: string, reason: string) => {
      await logEvent('login_failure', {
        email,
        metadata: { reason },
      });
    },
    [logEvent]
  );

  /**
   * Log suspicious activity
   */
  const logSuspiciousActivity = useCallback(
    async (description: string, metadata?: Record<string, any>) => {
      await logEvent('suspicious_activity', {
        metadata: { description, ...metadata },
      });
    },
    [logEvent]
  );

  /**
   * Log password change
   */
  const logPasswordChange = useCallback(
    async (success: boolean) => {
      await logEvent('password_change', {
        metadata: { success },
      });
    },
    [logEvent]
  );

  /**
   * Log MFA events
   */
  const logMFAEnabled = useCallback(async () => {
    await logEvent('mfa_enabled');
  }, [logEvent]);

  const logMFADisabled = useCallback(async () => {
    await logEvent('mfa_disabled');
  }, [logEvent]);

  const logMFAVerified = useCallback(async () => {
    await logEvent('mfa_verified');
  }, [logEvent]);

  const logMFAFailed = useCallback(async () => {
    await logEvent('mfa_failed');
  }, [logEvent]);

  /**
   * Log OAuth events
   */
  const logOAuthInitiated = useCallback(
    async (provider: string) => {
      await logEvent('oauth_initiated', {
        metadata: { provider },
      });
    },
    [logEvent]
  );

  const logOAuthSuccess = useCallback(
    async (provider: string) => {
      await logEvent('oauth_success', {
        metadata: { provider },
      });
    },
    [logEvent]
  );

  const logOAuthFailed = useCallback(
    async (provider: string, error: string) => {
      await logEvent('oauth_failed', {
        metadata: { provider, error },
      });
    },
    [logEvent]
  );

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }

    return () => {
      if (autoStart) {
        stopMonitoring();
      }
    };
  }, [autoStart, startMonitoring, stopMonitoring]);

  return {
    // State
    alerts: state.alerts,
    lastEvent: state.lastEvent,
    deviceInfo: state.deviceInfo,
    isMonitoring: state.isMonitoring,

    // Core actions
    startMonitoring,
    stopMonitoring,
    logEvent,

    // Alert management
    clearAlerts,
    clearAlert,
    getAlertsBySeverity,
    hasCriticalAlerts,

    // Convenience methods
    logLoginAttempt,
    logLoginSuccess,
    logLoginFailure,
    logSuspiciousActivity,
    logPasswordChange,
    logMFAEnabled,
    logMFADisabled,
    logMFAVerified,
    logMFAFailed,
    logOAuthInitiated,
    logOAuthSuccess,
    logOAuthFailed,
  };
}

/**
 * Determine if event should create an alert
 */
function shouldCreateAlert(type: SecurityEventType): boolean {
  const alertableEvents: SecurityEventType[] = [
    'login_failure',
    'login_locked',
    'suspicious_activity',
    'new_device_login',
    'mfa_failed',
    'oauth_failed',
    'session_expired',
  ];

  return alertableEvents.includes(type);
}

/**
 * Get severity level for event type
 */
function getSeverity(type: SecurityEventType): 'info' | 'warning' | 'critical' {
  const criticalEvents: SecurityEventType[] = [
    'login_locked',
    'suspicious_activity',
    'mfa_failed',
  ];

  const warningEvents: SecurityEventType[] = [
    'login_failure',
    'password_reset_request',
    'new_device_login',
    'session_expired',
    'oauth_failed',
  ];

  if (criticalEvents.includes(type)) return 'critical';
  if (warningEvents.includes(type)) return 'warning';
  return 'info';
}

/**
 * Generate user-friendly alert message
 */
function getAlertMessage(
  type: SecurityEventType,
  data?: Partial<SecurityEvent>
): string {
  const messages: Record<SecurityEventType, string> = {
    login_attempt: 'Login attempt detected',
    login_success: 'Successfully logged in',
    login_failure: `Failed login attempt${data?.metadata?.reason ? `: ${data.metadata.reason}` : ''}`,
    login_locked: 'Account temporarily locked due to multiple failed attempts',
    logout: 'Logged out successfully',
    password_reset_request: 'Password reset requested',
    password_reset_success: 'Password reset successful',
    password_change: 'Password changed',
    mfa_enabled: 'Two-factor authentication enabled',
    mfa_disabled: 'Two-factor authentication disabled',
    mfa_verified: 'Two-factor authentication verified',
    mfa_failed: 'Two-factor authentication failed',
    oauth_initiated: `OAuth login initiated with ${data?.metadata?.provider || 'provider'}`,
    oauth_success: `OAuth login successful with ${data?.metadata?.provider || 'provider'}`,
    oauth_failed: `OAuth login failed with ${data?.metadata?.provider || 'provider'}`,
    suspicious_activity: `Suspicious activity detected: ${data?.metadata?.description || 'Unknown'}`,
    new_device_login: 'Login from new device detected',
    session_expired: 'Your session has expired',
    token_refresh: 'Session token refreshed',
  };

  return messages[type] || 'Security event logged';
}

/**
 * Hook for detecting new device logins
 */
export function useNewDeviceDetection() {
  const { logEvent } = useSecurityMonitor();
  const { user } = useAuthStore();

  useEffect(() => {
    const checkNewDevice = async () => {
      if (!user) return;

      try {
        const deviceInfo = await getDeviceInfo();
        const isKnownDevice = await checkIfDeviceIsKnown(user.id, deviceInfo.fingerprint);

        if (!isKnownDevice) {
          await logEvent('new_device_login', {
            userId: user.id,
            deviceId: deviceInfo.fingerprint,
            metadata: {
              browser: deviceInfo.browser,
              os: deviceInfo.os,
              device: deviceInfo.device,
            },
          });
        }
      } catch (error) {
        console.error('Failed to check new device:', error);
      }
    };

    checkNewDevice();
  }, [user, logEvent]);
}

/**
 * Check if device is known
 */
async function checkIfDeviceIsKnown(userId: string, fingerprint: string): Promise<boolean> {
  try {
    const knownDevices = localStorage.getItem(`known_devices_${userId}`);
    if (!knownDevices) return false;

    const devices = JSON.parse(knownDevices) as string[];
    return devices.includes(fingerprint);
  } catch {
    return false;
  }
}

/**
 * Hook for monitoring suspicious activity patterns
 */
export function useSuspiciousActivityDetection() {
  const { logSuspiciousActivity } = useSecurityMonitor();
  const [activityLog, setActivityLog] = useState<Array<{ action: string; timestamp: number }>>([]);

  const logActivity = useCallback(
    (action: string) => {
      const now = Date.now();
      setActivityLog(prev => [...prev, { action, timestamp: now }].slice(-100)); // Keep last 100

      // Check for suspicious patterns
      const recentActivity = activityLog.filter(a => now - a.timestamp < 60000); // Last minute

      // Too many actions in short time
      if (recentActivity.length > 20) {
        logSuspiciousActivity('Unusual activity rate detected', {
          actionsPerMinute: recentActivity.length,
        });
      }

      // Multiple failed actions
      const failedActions = recentActivity.filter(a => a.action.includes('failed'));
      if (failedActions.length > 5) {
        logSuspiciousActivity('Multiple failed actions detected', {
          failedCount: failedActions.length,
        });
      }
    },
    [activityLog, logSuspiciousActivity]
  );

  return { logActivity };
}

/**
 * Hook for session activity monitoring
 */
export function useSessionActivityMonitor() {
  const { logEvent } = useSecurityMonitor();
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Log extended inactivity
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;

      // Log if user has been inactive for 10 minutes
      if (inactiveTime > 10 * 60 * 1000) {
        logEvent('session_expired', {
          metadata: {
            inactiveMinutes: Math.floor(inactiveTime / 60000),
          },
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [lastActivity, logEvent]);

  return { lastActivity };
}