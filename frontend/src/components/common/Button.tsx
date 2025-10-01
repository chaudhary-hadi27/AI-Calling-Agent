import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
        secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 active:bg-yellow-700',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-blue-500 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800',
        link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500 dark:text-blue-400',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400',
      },
      size: {
        xs: 'h-8 px-2 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    disabled,
    children,
    icon,
    iconPosition = 'left',
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    const renderIcon = () => {
      if (loading) {
        return (
          <svg
            className={cn(
              'animate-spin',
              size === 'xs' ? 'h-3 w-3' :
              size === 'sm' ? 'h-4 w-4' :
              size === 'md' ? 'h-4 w-4' :
              size === 'lg' ? 'h-5 w-5' : 'h-6 w-6',
              children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''
            )}
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      }

      if (icon) {
        return (
          <span
            className={cn(
              size === 'xs' ? 'h-3 w-3' :
              size === 'sm' ? 'h-4 w-4' :
              size === 'md' ? 'h-4 w-4' :
              size === 'lg' ? 'h-5 w-5' : 'h-6 w-6',
              children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''
            )}
          >
            {icon}
          </span>
        );
      }

      return null;
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {iconPosition === 'left' && renderIcon()}
        {loading && children ? (
          <span className="opacity-70">{children}</span>
        ) : (
          children
        )}
        {iconPosition === 'right' && renderIcon()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;