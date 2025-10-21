"use client";

import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Spinner } from "@/components/ui";

/**
 * ✅ Dashboard Error Fallback Component
 */
function DashboardErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-6">
      <div className="max-w-2xl w-full bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[var(--color-error-500)]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[var(--color-error-500)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
          Dashboard Error
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          We encountered an unexpected error while loading the dashboard.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium"
        >
          Reload Dashboard
        </button>
      </div>
    </div>
  );
}

/**
 * ✅ Dashboard Loading Component
 */
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <Spinner size="xl" color="primary" />
        <p className="mt-4 text-[var(--color-text-secondary)]">Loading dashboard...</p>
      </div>
    </div>
  );
}

/**
 * ✅ SECURE Dashboard Layout with Error Boundary
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={<DashboardErrorFallback />}>
      <div className="flex h-screen bg-[var(--color-bg-primary)]">
        <ErrorBoundary fallback={<div className="w-64 bg-[var(--color-surface-primary)]" />}>
          <Sidebar />
        </ErrorBoundary>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ErrorBoundary fallback={<div className="h-16 bg-[var(--color-surface-primary)]" />}>
            <Header />
          </ErrorBoundary>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--color-bg-primary)] p-6">
            <ErrorBoundary>
              <Suspense fallback={<DashboardLoading />}>
                {children}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}