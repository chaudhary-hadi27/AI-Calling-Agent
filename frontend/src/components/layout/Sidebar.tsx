"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Calls", href: "/dashboard/calls", icon: "📞" },
  { name: "Live Calls", href: "/dashboard/calls/live", icon: "🔴" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "📈" },
  { name: "AI Agents", href: "/dashboard/agents", icon: "🤖" },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: "🎯" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[var(--color-surface-primary)] border-r border-[var(--color-border-primary)] text-[var(--color-text-primary)] flex flex-col">
      <div className="p-6 border-b border-[var(--color-border-primary)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
            AI
          </div>
          <h1 className="text-xl font-bold">AI Calling</h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white shadow-lg"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[var(--color-border-primary)]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">User Name</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}