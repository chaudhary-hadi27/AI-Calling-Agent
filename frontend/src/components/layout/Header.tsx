"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils/helpers";

export default function Header() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-[var(--color-surface-primary)] border-b border-[var(--color-border-primary)] shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search calls, agents, campaigns..."
            className="px-4 py-2 w-96 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
            <svg
              className="w-6 h-6 text-[var(--color-text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error-500)] rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] flex items-center justify-center text-white font-semibold shadow-lg">
                {user ? getInitials(user.name) : "U"}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {user?.role || "User"}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg shadow-xl z-50 animate-slide-down">
                <div className="p-3 border-b border-[var(--color-border-primary)]">
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {user?.name}
                  </p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {user?.email}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to profile
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-left"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to settings
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-left"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </button>
                </div>

                <div className="p-2 border-t border-[var(--color-border-primary)]">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-error-500)]/10 text-[var(--color-error-500)] transition-colors text-left"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
}