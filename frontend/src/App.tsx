import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Layout
import Layout from '@/components/layout/Layout';

// Pages
import Dashboard from '@/pages/Dashboard';
import CallsPage from '@/pages/CallsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import ContactsPage from '@/pages/ContactsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Hooks and stores
import { useThemeStore } from '@/store/themeStore';
import { useGlobalStore } from '@/store';

// Services
import { apiClient } from '@/services/api';

// Types
import type { User } from '@/types';

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading AI Calling Agent...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  // Theme management
  const { theme, resolvedTheme, initializeTheme } = useThemeStore();
  const setError = useGlobalStore(state => state.setError);

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Apply theme class to html element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(resolvedTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#111827' : '#ffffff'
      );
    }
  }, [resolvedTheme]);

  // Health check query to verify backend connectivity
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError
  } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    retry: 3,
    retryDelay: 2000,
    refetchInterval: 60000, // Check health every minute
    onError: (error: any) => {
      console.warn('Backend health check failed:', error);
      setError('Unable to connect to the backend service');
    },
  });

  // Simulate auth check - replace with actual auth logic
  const {
    data: authData,
    isLoading: authLoading
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // For now, return mock user data
      // In production, replace with actual auth check
      return {
        id: '1',
        email: 'demo@aicallingagent.com',
        name: 'Demo User',
        role: 'admin'
      } as User;
    },
    enabled: !!healthData, // Only check auth if backend is healthy
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Show loading spinner while checking health and auth
  if (healthLoading || authLoading) {
    return <LoadingSpinner />;
  }

  // Show error if backend is not available
  if (healthError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Backend Unavailable
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Unable to connect to the AI Calling Agent backend. Please ensure the backend server is running.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Backend URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
          </div>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!authData;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        {/* Protected routes */}
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="campaigns/*" element={<CampaignsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings/*" element={<SettingsPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
