import React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "success" | "error" | "white";
  fullScreen?: boolean;
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = "md",
      color = "primary",
      fullScreen = false,
      label,
      className = "",
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      xs: "w-4 h-4 border-2",
      sm: "w-6 h-6 border-2",
      md: "w-10 h-10 border-3",
      lg: "w-16 h-16 border-4",
      xl: "w-24 h-24 border-4",
    };

    const colorStyles = {
      primary: "border-[var(--color-primary-600)] border-t-transparent",
      secondary: "border-[var(--color-secondary-600)] border-t-transparent",
      success: "border-[var(--color-success-600)] border-t-transparent",
      error: "border-[var(--color-error-600)] border-t-transparent",
      white: "border-white border-t-transparent",
    };

    const spinner = (
      <div
        ref={ref}
        className={`
          ${sizeStyles[size]}
          ${colorStyles[color]}
          rounded-full animate-spin
          ${className}
        `}
        role="status"
        aria-label={label || "Loading"}
        {...props}
      />
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col items-center justify-center bg-[var(--color-overlay-backdrop)] backdrop-blur-sm">
          {spinner}
          {label && (
            <p className="mt-4 text-lg text-[var(--color-text-primary)] font-medium">
              {label}
            </p>
          )}
        </div>
      );
    }

    if (label) {
      return (
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
        </div>
      );
    }

    return spinner;
  }
);

Spinner.displayName = "Spinner";

export default Spinner;