import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-r-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',
        sm: 'h-4 w-4 border',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-4',
        '2xl': 'h-16 w-16 border-4',
      },
      variant: {
        default: 'border-gray-300 border-r-transparent',
        primary: 'border-blue-600 border-r-transparent',
        success: 'border-green-600 border-r-transparent',
        warning: 'border-yellow-500 border-r-transparent',
        error: 'border-red-600 border-r-transparent',
        white: 'border-white border-r-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  text?: string;
  centerScreen?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, centerScreen = false, ...props }, ref) => {
    const spinner = (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );

    if (centerScreen) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            {spinner}
            {text && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
            )}
          </div>
        </div>
      );
    }

    if (text) {
      return (
        <div className="flex items-center space-x-3">
          {spinner}
          <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
        </div>
      );
    }

    return spinner;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;