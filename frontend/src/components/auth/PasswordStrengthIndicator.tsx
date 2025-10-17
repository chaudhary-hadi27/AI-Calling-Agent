"use client";

import React, { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

interface StrengthCheck {
  label: string;
  passed: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  show
}: PasswordStrengthIndicatorProps) {
  const checks = useMemo((): StrengthCheck[] => {
    if (!password) return [];

    return [
      { label: "At least 8 characters", passed: password.length >= 8 },
      { label: "Contains uppercase letter", passed: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", passed: /[a-z]/.test(password) },
      { label: "Contains number", passed: /\d/.test(password) },
      { label: "Contains special character", passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;
    const percentage = (passed / total) * 100;

    if (percentage < 40) return { label: "Weak", color: "error", width: "33%" };
    if (percentage < 80) return { label: "Medium", color: "warning", width: "66%" };
    return { label: "Strong", color: "success", width: "100%" };
  }, [checks]);

  if (!show || !password) return null;

  return (
    <div className="mt-3 space-y-2 animate-slide-down">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-tertiary)]">Password strength:</span>
          <span className={`font-semibold text-[var(--color-${strength.color}-500)]`}>
            {strength.label}
          </span>
        </div>
        <div className="h-1.5 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
          <div
            className={`h-full bg-[var(--color-${strength.color}-500)] transition-all duration-500 ease-out`}
            style={{ width: strength.width }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1 pt-2">
        {checks.map((check, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-xs transition-all duration-200 ${
              check.passed
                ? 'text-[var(--color-success-500)]'
                : 'text-[var(--color-text-tertiary)]'
            }`}
          >
            {check.passed ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}