export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">
              Total Calls
            </h3>
            <div className="w-10 h-10 bg-[var(--color-primary-500)]/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📞</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            1,234
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-success-500)]">↑ 12%</span>
            <span className="text-[var(--color-text-tertiary)]">vs last month</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">
              Active Calls
            </h3>
            <div className="w-10 h-10 bg-[var(--color-secondary-500)]/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔴</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            12
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-[var(--color-success-500)] rounded-full animate-pulse"></span>
            <span className="text-[var(--color-text-tertiary)]">Live now</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">
              Success Rate
            </h3>
            <div className="w-10 h-10 bg-[var(--color-success-500)]/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            87%
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-success-500)]">↑ 5%</span>
            <span className="text-[var(--color-text-tertiary)]">vs last month</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--color-text-secondary)] text-sm font-medium">
              Avg Duration
            </h3>
            <div className="w-10 h-10 bg-[var(--color-accent-500)]/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏱️</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            3m 24s
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-error-500)]">↓ 8s</span>
            <span className="text-[var(--color-text-tertiary)]">vs last month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Your recent calls and activities will appear here...
          </p>
        </div>
      </div>
    </div>
  );
}