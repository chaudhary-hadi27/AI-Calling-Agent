"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import Spinner from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard Component
 * Protects routes based on authentication status
 *
 * @param requireAuth - If true, user must be authenticated to access
 * @param redirectTo - Custom redirect path (default: /login for protected, /dashboard for public)
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // Redirect to login if authentication is required but user is not authenticated
      const loginPath = redirectTo || "/login";
      router.push(loginPath);
    } else if (!requireAuth && isAuthenticated) {
      // Redirect to dashboard if user is authenticated but accessing public route
      const dashboardPath = redirectTo || "/dashboard";
      router.push(dashboardPath);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <Spinner fullScreen label="Verifying authentication..." />;
  }

  // Don't render children if authentication status doesn't match requirement
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;