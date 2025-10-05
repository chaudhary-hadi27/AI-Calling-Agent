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
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={`${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            {label}
            {props.required && <span className="text-[var(--color-error-500)] ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
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

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-error-500)] flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
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

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--color-text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;