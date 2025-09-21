import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Store types
interface GlobalState {
  // App state
  isLoading: boolean;
  error: string | null;

  // UI state
  sidebarOpen: boolean;
  notifications: NotificationData[];

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
  read?: boolean;
}

// Main global store
export const useGlobalStore = create<GlobalState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        isLoading: false,
        error: null,
        sidebarOpen: false,
        notifications: [],

        // Actions
        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

        setSidebarOpen: (open) => {
          set((state) => {
            state.sidebarOpen = open;
          });
        },

        addNotification: (notification) => {
          set((state) => {
            const newNotification: NotificationData = {
              ...notification,
              id: Math.random().toString(36).substring(7),
              timestamp: new Date(),
            };
            state.notifications.unshift(newNotification);

            // Keep only last 50 notifications
            if (state.notifications.length > 50) {
              state.notifications = state.notifications.slice(0, 50);
            }
          });
        },

        removeNotification: (id) => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          });
        },

        clearAllNotifications: () => {
          set((state) => {
            state.notifications = [];
          });
        },
      }))
    ),
    { name: 'global-store' }
  )
);

// Store selectors (for performance optimization)
export const useIsLoading = () => useGlobalStore(state => state.isLoading);
export const useError = () => useGlobalStore(state => state.error);
export const useSidebarOpen = () => useGlobalStore(state => state.sidebarOpen);
export const useNotifications = () => useGlobalStore(state => state.notifications);

// Store actions
export const useGlobalActions = () => useGlobalStore(state => ({
  setLoading: state.setLoading,
  setError: state.setError,
  setSidebarOpen: state.setSidebarOpen,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearAllNotifications: state.clearAllNotifications,
}));

// Helper hooks for common patterns
export const useAsyncState = () => {
  return useGlobalStore(state => ({
    isLoading: state.isLoading,
    error: state.error,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
};

export const useNotificationActions = () => {
  const { addNotification } = useGlobalActions();

  return {
    showSuccess: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'success', title, message, duration });
    },
    showError: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'error', title, message, duration });
    },
    showWarning: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'warning', title, message, duration });
    },
    showInfo: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'info', title, message, duration });
    },
  };
};

// Persist certain parts of store to localStorage
if (typeof window !== 'undefined') {
  // Subscribe to sidebar state changes
  useGlobalStore.subscribe(
    (state) => state.sidebarOpen,
    (sidebarOpen) => {
      localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
    }
  );

  // Initialize sidebar state from localStorage
  const savedSidebarState = localStorage.getItem('sidebar-open');
  if (savedSidebarState) {
    try {
      const isOpen = JSON.parse(savedSidebarState);
      useGlobalStore.getState().setSidebarOpen(isOpen);
    } catch (error) {
      console.warn('Failed to parse saved sidebar state:', error);
    }
  }
}

export default useGlobalStore;