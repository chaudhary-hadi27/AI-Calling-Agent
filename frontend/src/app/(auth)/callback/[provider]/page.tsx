"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { socialAuthService } from "@/lib/api/services/socialAuth.service";
import { useToast } from "@/hooks/useToast";
import Spinner from "@/components/ui/Spinner";

export default function OAuthCallbackPage({ params }: { params: { provider: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(searchParams.get("error_description") || "Authentication failed");
        }

        if (!code || !state) {
          throw new Error("Missing required parameters");
        }

        // Exchange code for token
        const response = await socialAuthService.handleCallback(
          params.provider,
          code,
          state
        );

        // Store auth data
        login(response.user, response.token);

        // Show success message
        toast.success(`Successfully signed in with ${capitalizeProvider(params.provider)}!`);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        const message = err?.message || "Authentication failed. Please try again.";
        setError(message);
        toast.error(message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, params.provider, login, toast, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-6">
        <div className="max-w-md w-full">
          <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[var(--color-error-500)]/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--color-error-500)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Authentication Failed
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">{error}</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-6">
      <div className="max-w-md w-full">
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center">
          <Spinner size="lg" color="primary" />
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-6 mb-2">
            Completing Sign In
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Please wait while we complete your authentication with{" "}
            {capitalizeProvider(params.provider)}...
          </p>
        </div>
      </div>
    </div>
  );
}

function capitalizeProvider(provider: string): string {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}