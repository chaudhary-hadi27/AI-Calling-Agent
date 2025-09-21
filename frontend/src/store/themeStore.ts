import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEYS } from '@/utils/constants';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

// Helper function to get system theme preference
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper function to resolve theme
const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

// Helper function to apply theme to DOM
const applyThemeToDOM = (resolvedTheme: ResolvedTheme) => {
  const root = document.documentElement;
  const body = document.body;

  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  body.classList.remove('light', 'dark');

  // Add new theme class
  root.classList.add(resolvedTheme);
  body.classList.add(resolvedTheme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const color = resolvedTheme === 'dark' ? '#111827' : '#ffffff';
    metaThemeColor.setAttribute('content', color);
  }

  // Update CSS custom properties
  root.style.colorScheme = resolvedTheme;

  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme: resolvedTheme }
  }));
};

export const useThemeStore = create<ThemeState>()(
  persist(
    immer((set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme: Theme) => {
        const resolvedTheme = resolveTheme(theme);

        set((state) => {
          state.theme = theme;
          state.resolvedTheme = resolvedTheme;
        });

        // Apply theme to DOM
        if (typeof window !== 'undefined') {
          applyThemeToDOM(resolvedTheme);
        }
      },

      toggleTheme: () => {
        const { theme, resolvedTheme } = get();

        if (theme === 'system') {
          // If system theme, switch to opposite of current resolved theme
          const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
          get().setTheme(newTheme);
        } else {
          // Toggle between light and dark
          const newTheme = theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        }
      },

      initializeTheme: () => {
        const { theme } = get();
        const resolvedTheme = resolveTheme(theme);

        set((state) => {
          state.resolvedTheme = resolvedTheme;
        });

        if (typeof window !== 'undefined') {
          // Apply initial theme
          applyThemeToDOM(resolvedTheme);

          // Listen for system theme changes
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

          const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const { theme } = get();
            if (theme === 'system') {
              const newResolvedTheme = e.matches ? 'dark' : 'light';

              set((state) => {
                state.resolvedTheme = newResolvedTheme;
              });

              applyThemeToDOM(newResolvedTheme);
            }
          };

          // Add listener with proper cleanup
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemThemeChange);
          } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleSystemThemeChange);
          }

          // Store cleanup function for potential future use
          (window as any).__themeCleanup = () => {
            if (mediaQuery.removeEventListener) {
              mediaQuery.removeEventListener('change', handleSystemThemeChange);
            } else {
              mediaQuery.removeListener(handleSystemThemeChange);
            }
          };
        }
      },
    })),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Initialize theme after rehydration
        if (state) {
          setTimeout(() => state.initializeTheme(), 0);
        }
      },
    }
  )
);

// Selectors
export const useTheme = () => useThemeStore(state => state.theme);
export const useResolvedTheme = () => useThemeStore(state => state.resolvedTheme);
export const useIsDarkMode = () => useThemeStore(state => state.resolvedTheme === 'dark');

// Actions
export const useThemeActions = () => useThemeStore(state => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  initializeTheme: state.initializeTheme,
}));

// Hook for components that need theme information
export const useThemeInfo = () => {
  const theme = useTheme();
  const resolvedTheme = useResolvedTheme();
  const isDarkMode = useIsDarkMode();
  const { setTheme, toggleTheme } = useThemeActions();

  return {
    theme,
    resolvedTheme,
    isDarkMode,
    isSystemTheme: theme === 'system',
    setTheme,
    toggleTheme,
    // Utility functions
    getThemeClass: (lightClass: string, darkClass: string) =>
      isDarkMode ? darkClass : lightClass,
    getThemeValue: <T>(lightValue: T, darkValue: T) =>
      isDarkMode ? darkValue : lightValue,
  };
};