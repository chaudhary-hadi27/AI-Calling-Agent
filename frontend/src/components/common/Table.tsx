import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';
import Button from './Button';

const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      variant: {
        default: 'border-collapse',
        striped: 'border-collapse',
        bordered: 'border-collapse border border-gray-200 dark:border-gray-700',
      },
      size: {
        sm: '[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2',
        md: '[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3',
        lg: '[&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T = any> extends VariantProps<typeof tableVariants> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  empty?: React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: string[];
  onRowSelect?: (rowId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  getRowId?: (row: T, index: number) => string;
  stickyHeader?: boolean;
  maxHeight?: string;
  hoverable?: boolean;
  selectable?: boolean;
}

const Table = <T extends Record<string, any> = any>({
  data,
  columns,
  loading = false,
  empty,
  onRowClick,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSort,
  className,
  rowClassName,
  getRowId = (row, index) => row.id || index.toString(),
  variant,
  size,
  stickyHeader = false,
  maxHeight,
  hoverable = true,
  selectable = false,
  ...props
}: TableProps<T>) => {
  const tableRef = React.useRef<HTMLTableElement>(null);

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    const newDirection =
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';

    onSort(column.key as string, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    onRowSelect?.(rowId, checked);
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const renderCell = (column: TableColumn<T>, row: T, index: number) => {
    const value = row[column.key as keyof T];

    if (column.render) {
      return column.render(value, row, index);
    }

    return value?.toString() || '';
  };

  const getRowClassName = (row: T, index: number) => {
    const baseClass = cn(
      'border-b border-gray-200 dark:border-gray-700 transition-colors',
      hoverable && 'hover:bg-gray-50 dark:hover:bg-gray-800',
      onRowClick && 'cursor-pointer',
      variant === 'striped' && index % 2 === 0 && 'bg-gray-50 dark:bg-gray-900',
      selectedRows.includes(getRowId(row, index)) && 'bg-blue-50 dark:bg-blue-900/20'
    );

    if (typeof rowClassName === 'function') {
      return cn(baseClass, rowClassName(row, index));
    }

    return cn(baseClass, rowClassName);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 bg-gray-100 dark:bg-gray-800 rounded mb-2"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full">
        <table className={cn(tableVariants({ variant, size }), className)}>
          <thead className={cn(
            'bg-gray-50 dark:bg-gray-800',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {selectable && (
                <th className="w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={cn(
                    'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.headerClassName
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {column.headerRender ? (
                    column.headerRender()
                  ) : column.sortable ? (
                    <button
                      className="group inline-flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => handleSort(column)}
                    >
                      <span>{column.header}</span>
                      <span className="flex-none ml-2 text-gray-400 group-hover:text-gray-600">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 3a1 1 0 000 2h11l-4 4a1 1 0 001.414 1.414L16.586 5.414a2 2 0 000-2.828L11.414.586a1 1 0 00-1.414 1.414L14 6H3z"/>
                              <path d="M3 17a1 1 0 100-2h11l-4-4a1 1 0 011.414-1.414l5.172 5.172a2 2 0 010 2.828l-5.172 5.172A1 1 0 0110 21.414L14 17H3z"/>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M17 17a1 1 0 01-2 0V4l-4 4a1 1 0 01-1.414-1.414l5.172-5.172a2 2 0 012.828 0l5.172 5.172A1 1 0 0121.414 8L17 4v13z"/>
                              <path d="M17 3a1 1 0 012 0v11l4-4a1 1 0 111.414 1.414l-5.172 5.172a2 2 0 01-2.828 0l-5.172-5.172A1 1 0 0112.586 10L17 14V3z"/>
                            </svg>
                          )
                        ) : (
                          <svg className="w-3 h-3 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"/>
                          </svg>
                        )}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="text-center py-12">
          {empty || (
            <div className="text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No data available
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No records to display at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const tableContent = (
    <table
      ref={tableRef}
      className={cn(tableVariants({ variant, size }), className)}
      {...props}
    >
      <thead className={cn(
        'bg-gray-50 dark:bg-gray-800',
        stickyHeader && 'sticky top-0 z-10'
      )}>
        <tr>
          {selectable && (
            <th className="w-12">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key as string}
              className={cn(
                'text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.headerClassName
              )}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
            >
              {column.headerRender ? (
                column.headerRender()
              ) : column.sortable ? (
                <button
                  className="group inline-flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleSort(column)}
                >
                  <span>{column.header}</span>
                  <span className="flex-none ml-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {sortColumn === column.key ? (
                      sortDirection === 'asc' ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )
                    ) : (
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    )}
                  </span>
                </button>
              ) : (
                column.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
        {data.map((row, index) => {
          const rowId = getRowId(row, index);
          const isSelected = selectedRows.includes(rowId);

          return (
            <tr
              key={rowId}
              className={getRowClassName(row, index)}
              onClick={() => onRowClick?.(row, index)}
            >
              {selectable && (
                <td className="w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key as string}
                  className={cn(
                    'text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {renderCell(column, row, index)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  if (maxHeight) {
    return (
      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div
          className="overflow-auto"
          style={{ maxHeight }}
        >
          {tableContent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {tableContent}
    </div>
  );
};

// Table components for better composition
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-gray-50 dark:bg-gray-800', className)}
    {...props}
  />
));

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      'bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700',
      className
    )}
    {...props}
  />
));

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
      className
    )}
    {...props}
  />
));

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400',
      className
    )}
    {...props}
  />
));

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
      className
    )}
    {...props}
  />
));

Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableHead.displayName = 'TableHead';
TableCell.displayName = 'TableCell';

export default Table;
export { TableHeader, TableBody, TableRow, TableHead, TableCell };