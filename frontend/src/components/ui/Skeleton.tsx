import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "text",
      width,
      height,
      animation = "pulse",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "bg-gradient-to-r from-[var(--color-surface-secondary)] via-[var(--color-surface-tertiary)] to-[var(--color-surface-secondary)] bg-[length:200%_100%]";

    const variantStyles = {
      text: "rounded h-4",
      circular: "rounded-full",
      rectangular: "rounded-none",
      rounded: "rounded-lg",
    };

    const animationStyles = {
      pulse: "animate-pulse",
      wave: "animate-shimmer",
      none: "",
    };

    const inlineStyles: React.CSSProperties = {
      width: width || (variant === "text" ? "100%" : "40px"),
      height: height || (variant === "circular" ? "40px" : undefined),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${animationStyles[animation]}
          ${className}
        `}
        style={inlineStyles}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Pre-built Skeleton Patterns
export const SkeletonCard = () => (
  <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={16} />
      </div>
    </div>
    <Skeleton width="100%" height={12} />
    <Skeleton width="90%" height={12} />
    <Skeleton width="75%" height={12} />
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton width="30%" height={16} />
        <Skeleton width="20%" height={16} />
        <Skeleton width="15%" height={16} />
        <div className="ml-auto">
          <Skeleton width={80} height={32} variant="rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={100} height={16} />
          <Skeleton variant="circular" width={40} height={40} />
        </div>
        <Skeleton width={120} height={32} className="mb-2" />
        <Skeleton width={80} height={14} />
      </div>
    ))}
  </div>
);

export default Skeleton;