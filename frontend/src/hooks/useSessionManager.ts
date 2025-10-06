import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from './useToast';
import {
  sessionManager,
  tokenRefreshManager,
  parseJWT,
  getTokenExpiry,
  DEFAULT_SESSION_CONFIG,
} from '@/lib/security/sessionManager';
import { authService } from '@/lib/api/services/auth.service';

interface UseSessionManagerOptions {
  enabled?: boolean;
  timeoutMs?: number;
  warningMs?: number;
  onTimeout?: () => void;
}

export const useSessionManager = (options: UseSessionManagerOptions = {}) => {
  const {
    enabled = true,
    timeoutMs = DEFAULT_SESSION_CONFIG.timeoutMs,
    warningMs = DEFAULT_SESSION_CONFIG.warningMs,
    onTimeout,
  } = options;

  const router = useRouter();
  const { toast } = useToast();
  const { logout, token, isAuthenticated } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Session timeout handler
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const handleTimeout = () => {
      setShowWarning(false);
      logout();
      toast.warning('Your session has expired due to inactivity');
      router.push('/login?reason=timeout');
      onTimeout?.();
    };

    const handleWarning = (remaining: number) => {
      setShowWarning(true);
      setTimeRemaining(remaining);
    };

    // Start session monitoring
    sessionManager.start(
      { timeoutMs, warningMs },
      { onTimeout: handleTimeout, onWarning: handleWarning }
    );

    // Update time remaining every second when warning is shown
    let warningInterval: NodeJS.Timeout;
    if (showWarning) {
      warningInterval = setInterval(() => {
        const remaining = sessionManager.getTimeRemaining();
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          setShowWarning(false);
        }
      }, 1000);
    }

    return () => {
      sessionManager.stop();
      if (warningInterval) clearInterval(warningInterval);
    };
  }, [enabled, isAuthenticated, timeoutMs, warningMs, showWarning, onTimeout, logout, toast, router]);

  // Token refresh handler
  useEffect(() => {
    if (!enabled || !isAuthenticated || !token) return;

    const expiresAt = getTokenExpiry(token);
    if (!expiresAt) return;

    const refreshToken = async () => {
      try {
        const response = await authService.refreshToken();
        useAuthStore.getState().setToken(response.token);
      } catch (error) {
        // If refresh fails, logout
        logout();
        toast.error('Session expired. Please sign in again.');
        router.push('/login?reason=expired');
      }
    };

    // Schedule refresh 5 minutes before expiry
    tokenRefreshManager.scheduleRefresh(expiresAt, refreshToken);

    return () => {
      tokenRefreshManager.cancelRefresh();
    };
  }, [enabled, isAuthenticated, token, logout, toast, router]);

  // Extend session (called by user action)
  const extendSession = () => {
    sessionManager.resetActivity();
    setShowWarning(false);
  };

  return {
    showWarning,
    timeRemaining: Math.floor(timeRemaining / 1000), // Return seconds
    extendSession,
  };
};