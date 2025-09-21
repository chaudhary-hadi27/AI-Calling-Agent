import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { apiClient } from '@/services/api';
import { STORAGE_KEYS } from '@/utils/constants';
import type { User } from '@/types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login action
        login: async (credentials: LoginCredentials) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // For now, simulate login - replace with actual API call
            const mockResponse: AuthResponse = {
              user: {
                id: '1',
                email: credentials.email,
                name: credentials.email.split('@')[0],
                role: 'admin',
                avatar: `https://ui-avatars.com/api/?name=${credentials.email.split('@')[0]}&background=3b82f6&color=fff`,
              },
              token: 'mock-jwt-token-' + Date.now(),
            };

            // In production, replace with:
            // const response = await apiClient.login(credentials);

            set((state) => {
              state.user = mockResponse.user;
              state.token = mockResponse.token;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });

            // Store token for API calls
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockResponse.token);
            }

          } catch (error: any) {
            set((state) => {
              state.isLoading = false;
              state.error = error.message || 'Login failed';
              state.isAuthenticated = false;
              state.user = null;
              state.token = null;
            });
            throw error;
          }
        },

        // Logout action
        logout: () => {
          set((state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
          });

          // Clear stored data
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
          }

          // Optional: call logout API endpoint
          // apiClient.logout().catch(() => {});
        },

        // Refresh authentication
        refreshAuth: async () => {
          const currentToken = get().token;

          if (!currentToken) {
            return;
          }

          set((state) => {
            state.isLoading = true;
          });

          try {
            // For now, validate current token - replace with actual refresh logic
            const isValidToken = currentToken.startsWith('mock-jwt-token-');

            if (!isValidToken) {
              throw new Error('Invalid token');
            }

            // In production, replace with:
            // const response = await apiClient.refreshToken();
            // or apiClient.getCurrentUser();

            const mockUser: User = {
              id: '1',
              email: 'demo@aicallingagent.com',
              name: 'Demo User',
              role: 'admin',
              avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff',
            };

            set((state) => {
              state.user = mockUser;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });

          } catch (error: any) {
            // Token is invalid, logout user
            get().logout();
            set((state) => {
              state.isLoading = false;
              state.error = error.message || 'Authentication expired';
            });
          }
        },

        // Update user data
        updateUser: (updates: Partial<User>) => {
          set((state) => {
            if (state.user) {
              state.user = { ...state.user, ...updates };
            }
          });
        },

        // Clear error
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Set loading state
        setLoading: (loading: boolean) => {
          set((state) => {
            state.isLoading = loading;
          });
        },
      })),
      {
        name: STORAGE_KEYS.AUTH_TOKEN,
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.token) {
            // Auto-refresh on app load if token exists
            state.refreshAuth();
          }
        },
      }
    ),
    { name: 'auth-store' }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);

// Actions
export const useAuthActions = () => useAuthStore(state => ({
  login: state.login,
  logout: state.logout,
  refreshAuth: state.refreshAuth,
  updateUser: state.updateUser,
  clearError: state.clearError,
}));

// Initialize auth on app start
if (typeof window !== 'undefined') {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token && !useAuthStore.getState().isAuthenticated) {
    useAuthStore.getState().refreshAuth();
  }
}