import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "error" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-700)] focus:ring-[var(--color-primary-500)] shadow-lg hover:shadow-xl active:scale-95",
      secondary:
        "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-primary)] focus:ring-[var(--color-secondary-500)] active:scale-95",
      success:
        "bg-[var(--color-success-600)] text-white hover:bg-[var(--color-success-700)] focus:ring-[var(--color-success-500)] shadow-md hover:shadow-lg active:scale-95",
      error:
        "bg-[var(--color-error-600)] text-white hover:bg-[var(--color-error-700)] focus:ring-[var(--color-error-500)] shadow-md hover:shadow-lg active:scale-95",
      ghost:
        "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus:ring-[var(--color-primary-500)] active:scale-95",
      outline:
        "border-2 border-[var(--color-primary-600)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-600)] hover:text-white focus:ring-[var(--color-primary-500)] active:scale-95",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2.5 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
      xl: "px-8 py-4 text-xl gap-3",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;