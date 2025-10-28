// frontend/src/app/(dashboard)/page.tsx
// ✅ BASIC: Simple dashboard to test login redirect

"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authService } from "@/lib/api/services/auth.service";
import { useToast } from "@/hooks/useToast";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Verify authentication
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
          Welcome back, {user.full_name || user.email}! 👋
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          You're successfully logged in to your Smartkode AI dashboard
        </p>
      </div>

      {/* User Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[var(--color-primary-500)]"
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
            Your Profile
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Email</p>
              <p className="text-[var(--color-text-primary)] font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Name</p>
              <p className="text-[var(--color-text-primary)] font-medium">
                {user.full_name || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Role</p>
              <p className="text-[var(--color-text-primary)] font-medium capitalize">
                {user.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">
                Verification Status
              </p>
              <div className="flex items-center gap-2">
                {user.is_verified ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-600 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-yellow-600 font-medium">Pending</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[var(--color-primary-500)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
              <span className="text-[var(--color-text-secondary)]">Total Calls</span>
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
              <span className="text-[var(--color-text-secondary)]">Active Campaigns</span>
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
              <span className="text-[var(--color-text-secondary)]">Contacts</span>
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
          Quick Actions
        </h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium">
            Create Campaign
          </button>
          <button className="px-6 py-3 bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-tertiary)] transition-colors font-medium border border-[var(--color-border-primary)]">
            Add Contact
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Debug Info (Development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="font-bold mb-2">🛠️ Debug - User Object:</p>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}