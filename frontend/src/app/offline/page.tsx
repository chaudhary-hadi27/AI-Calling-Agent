"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Auto-redirect when back online
    if (isOnline) {
      window.location.href = "/dashboard";
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-6">
      <div className="max-w-md w-full">
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[var(--color-warning-500)]/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[var(--color-warning-500)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
            </div>
          </div>

          {/* Title & Message */}
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            You're Offline
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            It looks like you've lost your internet connection. Some features may be unavailable until you reconnect.
          </p>

          {/* Status Indicator */}
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-error-500)]'} animate-pulse`} />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {isOnline ? "Connection Restored!" : "Waiting for connection..."}
              </span>
            </div>
          </div>

          {/* Cached Data Notice */}
          <div className="bg-[var(--color-info-500)]/10 border border-[var(--color-info-500)]/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--color-info-500)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Limited Functionality
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  You can still view cached data, but new information won't be available until you're back online.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isOnline}
            >
              {isOnline ? "Reload Page" : "Checking Connection..."}
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="md"
              fullWidth
            >
              Go Back
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border-primary)]">
            <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
              <strong>Troubleshooting Tips:</strong>
            </p>
            <ul className="text-xs text-[var(--color-text-tertiary)] space-y-1 text-left">
              <li>• Check your WiFi or mobile data connection</li>
              <li>• Make sure airplane mode is turned off</li>
              <li>• Try restarting your router or device</li>
              <li>• Contact your ISP if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}