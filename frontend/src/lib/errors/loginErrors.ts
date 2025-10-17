"use client";

export interface LoginError {
  code: string;
  message: string;
  action?: string;
  actionLink?: string;
}

export class LoginErrorHandler {
  static handle(error: any): LoginError {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const message = error?.response?.data?.message;

    // Rate limited
    if (status === 429) {
      return {
        code: 'RATE_LIMITED',
        message: 'Too many login attempts. Your account has been temporarily locked.',
        action: 'Try again later or reset your password',
        actionLink: '/forgot-password',
      };
    }

    // Account locked
    if (status === 423 || code === 'ACCOUNT_LOCKED') {
      return {
        code: 'ACCOUNT_LOCKED',
        message: 'Your account has been locked for security reasons.',
        action: 'Contact support or reset your password',
        actionLink: '/forgot-password',
      };
    }

    // Invalid credentials
    if (status === 401 || code === 'INVALID_CREDENTIALS') {
      return {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password. Please try again.',
        action: 'Forgot your password?',
        actionLink: '/forgot-password',
      };
    }

    // Email not verified
    if (code === 'EMAIL_NOT_VERIFIED') {
      return {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before logging in.',
        action: 'Resend verification email',
        actionLink: '/resend-verification',
      };
    }

    // Account disabled
    if (code === 'ACCOUNT_DISABLED') {
      return {
        code: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled.',
        action: 'Contact support for assistance',
        actionLink: '/support',
      };
    }

    // MFA required but not provided
    if (code === 'MFA_REQUIRED') {
      return {
        code: 'MFA_REQUIRED',
        message: 'Two-factor authentication is required for your account.',
        action: 'Enter your verification code',
      };
    }

    // Network error
    if (!error?.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        action: 'Try again',
      };
    }

    // Server error
    if (status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Our servers are experiencing issues. Please try again in a few moments.',
        action: 'Retry',
      };
    }

    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: message || 'An unexpected error occurred. Please try again.',
      action: 'Contact support if the problem persists',
      actionLink: '/support',
    };
  }
}