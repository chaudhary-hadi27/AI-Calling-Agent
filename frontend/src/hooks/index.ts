import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useThemeStore, useWebSocketStore } from '@/store';
import { useNotificationActions } from '@/store';
import { debounce } from '@/utils/helpers';

// Re-export store hooks for convenience
export {
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthActions
} from '@/store/authStore';

export {
  useTheme,
  useResolvedTheme,
  useIsDarkMode,
  useThemeActions,
  useThemeInfo
} from '@/store/themeStore';

export {
  useWebSocketConnection,
  useActiveCalls,
  useActiveCallsCount,
  useWebSocketActions,
  useWebSocketEvent
} from '@/store/websocketStore';

// Custom hook for managing localStorage with type safety
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = React.useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setStoredValue];
}

// Custom hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom hook for managing async operations
export function useAsyncOperation<T = any, E = Error>() {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: E | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = React.useCallback(async (asyncFunction: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as E }));
      throw error;
    }
  }, []);

  const reset = React.useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.error && !state.data,
  };
}

// Custom hook for managing form state
export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = React.useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const setError = React.useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = React.useCallback(<K extends keyof T>(field: K, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const resetForm = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setValue,
    setError,
    setFieldTouched,
    resetForm,
  };
}

// Custom hook for managing pagination
export function usePagination(initialPage = 1, initialPageSize = 50) {
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const nextPage = React.useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = React.useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = React.useCallback((pageNumber: number) => {
    setPage(Math.max(1, pageNumber));
  }, []);

  const reset = React.useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  const getSkip = React.useCallback(() => {
    return (page - 1) * pageSize;
  }, [page, pageSize]);

  return {
    page,
    pageSize,
    skip: getSkip(),
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    reset,
  };
}

// Custom hook for managing table state
export function useTableState<T = any>() {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  const handleSort = React.useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const toggleRowSelection = React.useCallback((rowId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  const selectAllRows = React.useCallback((rowIds: string[]) => {
    setSelectedRows(new Set(rowIds));
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const updateFilter = React.useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setFilters({});
  }, []);

  return {
    sortColumn,
    sortDirection,
    selectedRows: Array.from(selectedRows),
    selectedRowsSet: selectedRows,
    filters,
    handleSort,
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    updateFilter,
    clearFilters,
  };
}

// Custom hook for managing modal state
export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const openModal = React.useCallback((modalData?: any) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal,
  };
}

// Custom hook for managing document title
export function useDocumentTitle(title: string) {
  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

// Custom hook for managing keyboard shortcuts
export function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  deps: React.DependencyList = []
) {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const keysPressed = keys.every(key => {
        switch (key) {
          case 'ctrl':
          case 'cmd':
            return e.ctrlKey || e.metaKey;
          case 'shift':
            return e.shiftKey;
          case 'alt':
            return e.altKey;
          default:
            return e.key.toLowerCase() === key.toLowerCase();
        }
      });

      if (keysPressed) {
        e.preventDefault();
        callback(e);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, deps);
}

// Custom hook for managing window size
export function useWindowSize() {
  const [size, setSize] = React.useState(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  React.useEffect(() => {
    const handleResize = debounce(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Custom hook for managing media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Custom hook for managing notifications
export function useNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationActions();

  const notifySuccess = React.useCallback((message: string, title = 'Success') => {
    showSuccess(title, message);
  }, [showSuccess]);

  const notifyError = React.useCallback((message: string, title = 'Error') => {
    showError(title, message);
  }, [showError]);

  const notifyWarning = React.useCallback((message: string, title = 'Warning') => {
    showWarning(title, message);
  }, [showWarning]);

  const notifyInfo = React.useCallback((message: string, title = 'Info') => {
    showInfo(title, message);
  }, [showInfo]);

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}

// Custom hook for managing copy to clipboard
export function useCopyToClipboard() {
  const [copied, setCopied] = React.useState(false);
  const { notifySuccess, notifyError } = useNotifications();

  const copyToClipboard = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      notifySuccess('Copied to clipboard');

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      notifyError('Failed to copy to clipboard');
    }
  }, [notifySuccess, notifyError]);

  return { copied, copyToClipboard };
}