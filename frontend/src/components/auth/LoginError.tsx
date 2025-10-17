"use client";

import React from "react";
import Link from "next/link";
import { LoginError } from "@/lib/errors/loginErrors";

interface LoginErrorProps {
  error: LoginError;
  onDismiss: () => void;
}

export default function LoginErrorDisplay({ error, onDismiss }: LoginErrorProps) {
  const getIcon = () => {
    switch (error.code) {
      case 'RATE_LIMITED':
      case 'ACCOUNT_LOCKED':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      case 'INVALID_CREDENTIALS':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'EMAIL_NOT_VERIFIED':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case 'NETWORK_ERROR':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div
      className="mb-6 bg-[var(--color-error-500)]/10 border border-[var(--color-error-500)]/30 rounded-lg p-4 animate-slide-down"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-[var(--color-error-500)]">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-error-500)] mb-1">
            {error.code.replace(/_/g, ' ')}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">
            {error.message}
          </p>

          {error.action && (
            <div className="flex items-center gap-3 mt-3">
              {error.actionLink ? (
                <Link
                  href={error.actionLink}
                  className="text-sm font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors underline"
                >
                  {error.action}
                </Link>
              ) : (
                <span className="text-sm text-[var(--color-text-tertiary)]">
                  {error.action}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Dismiss error"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}