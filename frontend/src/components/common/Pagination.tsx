import React from 'react';
import { cn } from '@/utils/helpers';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 7,
  disabled = false,
  size = 'md',
  className,
}) => {
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn('flex items-center justify-center space-x-1', className)}
      aria-label="Pagination"
    >
      {/* First Page */}
      {showFirstLast && currentPage > Math.ceil(maxVisiblePages / 2) && (
        <>
          <Button
            variant="ghost"
            size={size}
            onClick={() => onPageChange(1)}
            disabled={disabled || !canGoPrevious}
            className="px-3"
          >
            1
          </Button>
          {visiblePages[0] > 2 && (
            <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
          )}
        </>
      )}

      {/* Previous */}
      {showPrevNext && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || !canGoPrevious}
          className="px-2"
          aria-label="Previous page"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "primary" : "ghost"}
          size={size}
          onClick={() => onPageChange(page)}
          disabled={disabled}
          className={cn(
            "px-3 min-w-[2.5rem]",
            page === currentPage && "font-medium"
          )}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      {/* Next */}
      {showPrevNext && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || !canGoNext}
          className="px-2"
          aria-label="Next page"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      )}

      {/* Last Page */}
      {showFirstLast && currentPage < totalPages - Math.floor(maxVisiblePages / 2) && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
          )}
          <Button
            variant="ghost"
            size={size}
            onClick={() => onPageChange(totalPages)}
            disabled={disabled || !canGoNext}
            className="px-3"
          >
            {totalPages}
          </Button>
        </>
      )}
    </nav>
  );
};

export default Pagination;