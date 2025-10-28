// frontend/src/app/(dashboard)/layout.tsx
// ✅ SIMPLIFIED: Basic protected layout

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log("❌ Not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-500)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Simple Header */}
      <header className="bg-[var(--color-surface-primary)] border-b border-[var(--color-border-primary)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                Smartkode AI
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] capitalize">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center text-white font-semibold">
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="bg-[var(--color-surface-primary)] border-t border-[var(--color-border-primary)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-[var(--color-text-tertiary)]">
            © 2025 Smartkode AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// "use client";
//
// import { Suspense } from "react";
// import Sidebar from "@/components/layout/Sidebar";
// import Header from "@/components/layout/Header";
// import ErrorBoundary from "@/components/ErrorBoundary";
// import { Spinner } from "@/components/ui";
//
// /**
//  * ✅ Dashboard Error Fallback Component
//  */
// function DashboardErrorFallback() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-6">
//       <div className="max-w-2xl w-full bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center">
//         <div className="flex justify-center mb-6">
//           <div className="w-20 h-20 bg-[var(--color-error-500)]/20 rounded-full flex items-center justify-center">
//             <svg
//               className="w-10 h-10 text-[var(--color-error-500)]"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//               />
//             </svg>
//           </div>
//         </div>
//         <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
//           Dashboard Error
//         </h1>
//         <p className="text-[var(--color-text-secondary)] mb-6">
//           We encountered an unexpected error while loading the dashboard.
//         </p>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium"
//         >
//           Reload Dashboard
//         </button>
//       </div>
//     </div>
//   );
// }
//
// /**
//  * ✅ Dashboard Loading Component
//  */
// function DashboardLoading() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
//       <div className="text-center">
//         <Spinner size="xl" color="primary" />
//         <p className="mt-4 text-[var(--color-text-secondary)]">Loading dashboard...</p>
//       </div>
//     </div>
//   );
// }
//
// /**
//  * ✅ SECURE Dashboard Layout with Error Boundary
//  */
// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ErrorBoundary fallback={<DashboardErrorFallback />}>
//       <div className="flex h-screen bg-[var(--color-bg-primary)]">
//         <ErrorBoundary fallback={<div className="w-64 bg-[var(--color-surface-primary)]" />}>
//           <Sidebar />
//         </ErrorBoundary>
//
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <ErrorBoundary fallback={<div className="h-16 bg-[var(--color-surface-primary)]" />}>
//             <Header />
//           </ErrorBoundary>
//
//           <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--color-bg-primary)] p-6">
//             <ErrorBoundary>
//               <Suspense fallback={<DashboardLoading />}>
//                 {children}
//               </Suspense>
//             </ErrorBoundary>
//           </main>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// }