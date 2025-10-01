import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { useGlobalStore } from '@/store';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const { sidebarOpen } = useGlobalStore(state => ({
    sidebarOpen: state.sidebarOpen,
  }));

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => useGlobalStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;