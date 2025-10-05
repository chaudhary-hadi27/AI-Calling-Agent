"use client";

import React from "react";
import { validatePassword } from "@/lib/utils/validators";

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  const { strength, message } = validatePassword(password);

  const strengthConfig = {
    weak: {
      color: "bg-[var(--color-error-500)]",
      width: "w-1/3",
      text: "text-[var(--color-error-500)]",
      label: "Weak",
    },
    medium: {
      color: "bg-[var(--color-warning-500)]",
      width: "w-2/3",
      text: "text-[var(--color-warning-500)]",
      label: "Medium",
    },
    strong: {
      color: "bg-[var(--color-success-500)]",
      width: "w-full",
      text: "text-[var(--color-success-500)]",
      label: "Strong",
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="h-2 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
        <div
          className={`h-full ${config.color} transition-all duration-300 ${config.width}`}
        ></div>
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${config.text}`}>
          {config.label}
        </span>
        <span className="text-[var(--color-text-tertiary)]">
          {message}
        </span>
      </div>

      {/* Password Requirements */}
      <div className="mt-3 space-y-1">
        <PasswordRequirement
          met={password.length >= 8}
          text="At least 8 characters"
        />
        <PasswordRequirement
          met={/[A-Z]/.test(password)}
          text="One uppercase letter"
        />
        <PasswordRequirement
          met={/[a-z]/.test(password)}
          text="One lowercase letter"
        />
        <PasswordRequirement
          met={/\d/.test(password)}
          text="One number"
        />
        <PasswordRequirement
          met={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
          text="One special character"
        />
      </div>
    </div>
  );
};

const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({
  met,
  text,
}) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <svg
        className="w-4 h-4 text-[var(--color-success-500)]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-[var(--color-text-quaternary)]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    )}
    <span
      className={
        met ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-tertiary)]"
      }
    >
      {text}
    </span>
  </div>
);

export default PasswordStrength;