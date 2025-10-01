import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { useGlobalStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common';
import Breadcrumbs from './Breadcrumbs';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const location = useLocation();
  const { setSidebarOpen } = useGlobalStore(state => ({
    setSidebarOpen: state.setSidebarOpen,
  }));

  const user = useAuthStore(state => state.user);

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'Dashboard';
    if (path.startsWith('/calls')) return 'Calls';
    if (path.startsWith('/campaigns')) return 'Campaigns';
    if (path.startsWith('/contacts')) return 'Contacts';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/settings')) return 'Settings';
    return 'AI Calling Agent';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left side - Mobile menu button + Breadcrumbs */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>

          {/* Page title for mobile */}
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white lg:hidden">
            {getPageTitle()}
          </h1>

          {/* Breadcrumbs for desktop */}
          <div className="hidden lg:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* Quick actions */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Notification bell - placeholder for future */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
              aria-label="View notifications"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-3.5-3.5a8.38 8.38 0 010-11L20 2H9l3.5 3.5a8.38 8.38 0 010 11L9 17z"
                />
              </svg>
              {/* Notification badge - placeholder */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
            </Button>

            {/* Search - placeholder for future */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              aria-label="Search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;