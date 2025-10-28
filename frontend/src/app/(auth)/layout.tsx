// frontend/src/app/(auth)/layout.tsx
// ✅ SIMPLIFIED: Basic auth layout without complex checks

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      console.log("✅ Already authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary-600)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-secondary-600)]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// "use client";
//
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/lib/store/authStore";
// import Spinner from "@/components/ui/Spinner";
//
// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const { isAuthenticated, isLoading } = useAuthStore();
//
//   useEffect(() => {
//     // Redirect to dashboard if already authenticated
//     if (isAuthenticated && !isLoading) {
//       router.push("/dashboard");
//     }
//   }, [isAuthenticated, isLoading, router]);
//
//   // Show loading while checking auth
//   if (isLoading) {
//     return <Spinner fullScreen label="Loading..." />;
//   }
//
//   // Don't render if authenticated (will redirect)
//   if (isAuthenticated) {
//     return null;
//   }
//
//   return (
//     <div className="min-h-screen bg-[var(--color-bg-primary)]">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary-600)]/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-secondary-600)]/10 rounded-full blur-3xl"></div>
//       </div>
//
//       {/* Content */}
//       <div className="relative z-10">
//         {children}
//       </div>
//     </div>
//   );
// }