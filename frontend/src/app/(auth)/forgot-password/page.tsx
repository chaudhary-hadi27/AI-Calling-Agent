"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { isValidEmail } from "@/lib/utils/validators";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid email format");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to send reset email
      // await authService.forgotPassword(email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to send reset email. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-8 rounded-2xl shadow-2xl text-center animate-slide-up">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[var(--color-success-500)]/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--color-success-500)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Check Your Email
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-[var(--color-primary-500)] font-medium mb-6">
              {email}
            </p>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-8">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>

            <Link href="/login">
              <Button variant="primary" size="lg" fullWidth>
                Back to Login
              </Button>
            </Link>

            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="mt-4 text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--color-warning-500)]/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--color-warning-500)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Forgot Password?
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-8 rounded-2xl shadow-2xl animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              error={error}
              placeholder="Enter your email"
              disabled={isLoading}
              required
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center pt-4 border-t border-[var(--color-border-primary)]">
              <Link
                href="/login"
                className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors font-medium inline-flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}