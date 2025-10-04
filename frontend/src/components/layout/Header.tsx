"use client";

export default function Header() {
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
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error-500)] rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">User Name</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Admin</p>
            </div>
            <span className="text-[var(--color-text-tertiary)]">▼</span>
          </div>
        </div>
      </div>
    </header>
  );
}