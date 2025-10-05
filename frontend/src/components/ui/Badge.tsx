import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  pulse?: boolean;
  outline?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "neutral",
      size = "md",
      dot = false,
      pulse = false,
      outline = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200";

    const variantStyles = outline
      ? {
          primary:
            "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/30",
          secondary:
            "bg-[var(--color-secondary-500)]/10 text-[var(--color-secondary-400)] border border-[var(--color-secondary-500)]/30",
          success:
            "bg-[var(--color-success-500)]/10 text-[var(--color-success-400)] border border-[var(--color-success-500)]/30",
          warning:
            "bg-[var(--color-warning-500)]/10 text-[var(--color-warning-400)] border border-[var(--color-warning-500)]/30",
          error:
            "bg-[var(--color-error-500)]/10 text-[var(--color-error-400)] border border-[var(--color-error-500)]/30",
          info:
            "bg-[var(--color-info-500)]/10 text-[var(--color-info-400)] border border-[var(--color-info-500)]/30",
          neutral:
            "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-secondary)]",
        }
      : {
          primary:
            "bg-[var(--color-primary-600)] text-white",
          secondary:
            "bg-[var(--color-secondary-600)] text-white",
          success:
            "bg-[var(--color-success-600)] text-white",
          warning:
            "bg-[var(--color-warning-600)] text-white",
          error:
            "bg-[var(--color-error-600)] text-white",
          info:
            "bg-[var(--color-info-600)] text-white",
          neutral:
            "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
        };

    const sizeStyles = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    };

    const dotColors = {
      primary: "bg-[var(--color-primary-500)]",
      secondary: "bg-[var(--color-secondary-500)]",
      success: "bg-[var(--color-success-500)]",
      warning: "bg-[var(--color-warning-500)]",
      error: "bg-[var(--color-error-500)]",
      info: "bg-[var(--color-info-500)]",
      neutral: "bg-[var(--color-text-tertiary)]",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className={`
              w-1.5 h-1.5 rounded-full
              ${dotColors[variant]}
              ${pulse ? "animate-pulse" : ""}
            `}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;