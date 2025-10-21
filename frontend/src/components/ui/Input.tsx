import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      type = "text",
      id,
      required,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const widthClass = fullWidth ? "w-full" : "";

    // ✅ Generate unique IDs for accessibility
    const inputId = id || `input-${React.useId()}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const labelId = `${inputId}-label`;

    return (
      <div className={`${widthClass}`}>
        {/* ✅ ACCESSIBLE: Proper label with htmlFor */}
        {label && (
          <label
            id={labelId}
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
          >
            {label}
            {required && (
              <span
                className="text-[var(--color-error-500)] ml-1"
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {/* ✅ ACCESSIBLE: Left icon with proper semantics */}
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          {/* ✅ ACCESSIBLE: Comprehensive ARIA attributes */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? errorId
                : helperText
                  ? helperId
                  : undefined
            }
            aria-labelledby={label ? labelId : undefined}
            className={`
              w-full px-4 py-3
              bg-[var(--color-bg-secondary)]
              border ${
                hasError
                  ? "border-[var(--color-error-500)] focus:ring-[var(--color-error-500)]"
                  : "border-[var(--color-border-primary)] focus:ring-[var(--color-primary-500)]"
              }
              text-[var(--color-text-primary)]
              rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              placeholder:text-[var(--color-text-tertiary)]
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${className}
            `}
            {...props}
          />

          {/* ✅ ACCESSIBLE: Right icon with proper semantics */}
          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* ✅ ACCESSIBLE: Error message with proper ARIA */}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-[var(--color-error-500)] flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* ✅ ACCESSIBLE: Helper text with proper ID */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-[var(--color-text-tertiary)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;