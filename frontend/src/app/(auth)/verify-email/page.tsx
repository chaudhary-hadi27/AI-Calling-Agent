"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Spinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/lib/api/services/auth.service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid verification link");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      await authService.verifyEmail(token!);
      setStatus("success");
      toast.success("Email verified successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      const message = err?.response?.data?.message || "Email verification failed";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.resendVerificationEmail();
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to resend email";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
        <div className="max-w-md w-full">
          <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center">
            <Spinner size="lg" color="primary" />
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-6 mb-2">
              Verifying Your Email
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
        <div className="max-w-md w-full">
          <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[var(--color-success-500)]/20 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10 text-[var(--color-success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Email Verified! 🎉
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Your email has been successfully verified. You can now access all features of your account.
            </p>

            <Link href="/login">
              <Button variant="primary" size="lg" fullWidth>
                Continue to Login
              </Button>
            </Link>

            <p className="text-sm text-[var(--color-text-tertiary)] mt-4">
              Redirecting in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="max-w-md w-full">
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--color-error-500)]/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-error-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Verification Failed
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {errorMessage || "We couldn't verify your email address. The link may have expired or is invalid."}
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleResend}
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isResending}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>

            <Link href="/login">
              <Button variant="outline" size="lg" fullWidth>
                Back to Login
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-border-primary)]">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Need help?{" "}
              <Link
                href="/support"
                className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors underline"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}