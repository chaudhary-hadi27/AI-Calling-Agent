import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "bordered" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "default",
      padding = "md",
      hover = false,
      clickable = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "rounded-xl transition-all duration-200";

    const variantStyles = {
      default:
        "bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)]",
      elevated:
        "bg-[var(--color-surface-secondary)] shadow-lg",
      glass:
        "bg-[var(--color-surface-primary)]/70 backdrop-blur-md border border-[var(--color-border-primary)]",
      bordered:
        "bg-transparent border-2 border-[var(--color-border-secondary)]",
      gradient:
        "bg-gradient-to-br from-[var(--color-surface-primary)] to-[var(--color-surface-secondary)] border border-[var(--color-border-primary)]",
    };

    const paddingStyles = {
      none: "",
      sm: "p-3",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };

    const hoverStyles = hover
      ? "hover:shadow-xl hover:border-[var(--color-primary-500)]/30 hover:-translate-y-0.5"
      : "";

    const clickableStyles = clickable
      ? "cursor-pointer active:scale-[0.98]"
      : "";

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hoverStyles}
          ${clickableStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Sub-components for better composition
export const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3 className={`text-xl font-bold text-[var(--color-text-primary)] ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`text-sm text-[var(--color-text-secondary)] mt-1 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`mt-6 pt-4 border-t border-[var(--color-border-primary)] ${className}`}>
    {children}
  </div>
);

export default Card;