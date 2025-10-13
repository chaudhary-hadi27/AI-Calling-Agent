/**
 * useRateLimit Hook
 * Client-side rate limiting to prevent abuse
 */

import { useState, useCallback, useEffect } from 'react';
import { rateLimiter, RateLimitConfigs } from '@/lib/security/rateLimit';
import { useToast } from './useToast';
import { formatLockoutMessage } from '@/lib/security/rateLimit';

interface UseRateLimitOptions {
  key: string;
  maxAttempts?: number;
  windowMs?: number;
  lockoutDurationMs?: number;
  onLockout?: () => void;
  showToast?: boolean;
}

interface RateLimitState {
  isAllowed: boolean;
  remainingAttempts: number;
  isLocked: boolean;
  lockedUntil?: number;
  retryAfter?: number;
}

/**
 * Hook for rate limiting actions (login, API calls, etc.)
 *
 * @example
 * ```tsx
 * const { checkRateLimit, isLocked, remainingAttempts, resetLimit } = useRateLimit({
 *   key: 'login',
 *   maxAttempts: 5,
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   lockoutDurationMs: 30 * 60 * 1000, // 30 minutes
 * });
 *
 * const handleLogin = async () => {
 *   const canProceed = checkRateLimit();
 *   if (!canProceed) return;
 *
 *   // Proceed with login...
 * };
 * ```
 */
export function useRateLimit(options: UseRateLimitOptions) {
  const { toast } = useToast();

  const {
    key,
    maxAttempts = RateLimitConfigs.LOGIN.maxAttempts,
    windowMs = RateLimitConfigs.LOGIN.windowMs,
    lockoutDurationMs = RateLimitConfigs.LOGIN.lockoutDurationMs,
    onLockout,
    showToast = true,
  } = options;

  const config = { maxAttempts, windowMs, lockoutDurationMs };

  const [state, setState] = useState<RateLimitState>(() => {
    const status = rateLimiter.getStatus(key, config);
    return {
      isAllowed: !status.isLocked,
      remainingAttempts: status.remainingAttempts,
      isLocked: status.isLocked,
      lockedUntil: status.lockedUntil,
      retryAfter: status.lockedUntil
        ? Math.ceil((status.lockedUntil - Date.now()) / 1000)
        : undefined,
    };
  });

  /**
   * Update state from rate limiter
   */
  const updateState = useCallback(() => {
    const status = rateLimiter.getStatus(key, config);
    const now = Date.now();

    setState({
      isAllowed: !status.isLocked,
      remainingAttempts: status.remainingAttempts,
      isLocked: status.isLocked,
      lockedUntil: status.lockedUntil,
      retryAfter: status.lockedUntil
        ? Math.ceil((status.lockedUntil - now) / 1000)
        : undefined,
    });
  }, [key, config]);

  /**
   * Check if action is allowed and increment counter
   */
  const checkRateLimit = useCallback((): boolean => {
    const result = rateLimiter.check(key, config);

    setState({
      isAllowed: result.allowed,
      remainingAttempts: result.remainingAttempts,
      isLocked: !result.allowed && result.lockedUntil !== undefined,
      lockedUntil: result.lockedUntil,
      retryAfter: result.retryAfter,
    });

    // Show toast if locked
    if (!result.allowed && showToast) {
      const message = formatLockoutMessage(result.retryAfter);
      toast.error(message);
      onLockout?.();
    }

    // Show warning if few attempts remaining
    if (result.allowed && result.remainingAttempts <= 2 && showToast) {
      toast.warning(
        `${result.remainingAttempts} attempt${result.remainingAttempts !== 1 ? 's' : ''} remaining before lockout`
      );
    }

    return result.allowed;
  }, [key, config, showToast, toast, onLockout]);

  /**
   * Reset rate limit (call after successful action)
   */
  const resetLimit = useCallback(() => {
    rateLimiter.reset(key);
    updateState();
  }, [key, updateState]);

  /**
   * Get current status without incrementing
   */
  const getStatus = useCallback(() => {
    updateState();
    return state;
  }, [state, updateState]);

  // Update retry timer every second when locked
  useEffect(() => {
    if (!state.isLocked) return;

    const timer = setInterval(() => {
      const status = rateLimiter.getStatus(key, config);
      const now = Date.now();

      if (status.lockedUntil && now >= status.lockedUntil) {
        // Lockout expired
        updateState();
      } else if (status.lockedUntil) {
        // Update countdown
        setState(prev => ({
          ...prev,
          retryAfter: Math.ceil((status.lockedUntil! - now) / 1000),
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isLocked, key, config, updateState]);

  return {
    // State
    isAllowed: state.isAllowed,
    remainingAttempts: state.remainingAttempts,
    isLocked: state.isLocked,
    lockedUntil: state.lockedUntil,
    retryAfter: state.retryAfter,

    // Actions
    checkRateLimit,
    resetLimit,
    getStatus,
  };
}

/**
 * Specialized hook for login rate limiting
 */
export function useLoginRateLimit(email: string) {
  return useRateLimit({
    key: `login:${email}`,
    ...RateLimitConfigs.LOGIN,
    showToast: true,
  });
}

/**
 * Specialized hook for password reset rate limiting
 */
export function usePasswordResetRateLimit(email: string) {
  return useRateLimit({
    key: `password-reset:${email}`,
    ...RateLimitConfigs.PASSWORD_RESET,
    showToast: true,
  });
}

/**
 * Specialized hook for OTP verification rate limiting
 */
export function useOTPRateLimit(identifier: string) {
  return useRateLimit({
    key: `otp:${identifier}`,
    ...RateLimitConfigs.OTP_VERIFICATION,
    showToast: true,
  });
}

/**
 * Specialized hook for MFA rate limiting
 */
export function useMFARateLimit(userId: string) {
  return useRateLimit({
    key: `mfa:${userId}`,
    ...RateLimitConfigs.MFA,
    showToast: true,
  });
}

/**
 * Hook for API endpoint rate limiting
 */
export function useAPIRateLimit(endpoint: string, options?: Partial<UseRateLimitOptions>) {
  return useRateLimit({
    key: `api:${endpoint}`,
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    lockoutDurationMs: 5 * 60 * 1000, // 5 minutes
    showToast: false,
    ...options,
  });
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}