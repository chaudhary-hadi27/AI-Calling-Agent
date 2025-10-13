"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { validatePasswordEnterprise } from "@/lib/utils/validators";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { authService } from "@/lib/api/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
        <div className="max-w-md w-full">
          <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[var(--color-error-500)]/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--color-error-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Invalid Reset Link</h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password">
              <Button variant="primary" size="lg" fullWidth>
                Request New Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ password: "", confirmPassword: "" });

    // Validate password
    const passwordValidation = await validatePasswordEnterprise(formData.password, {
      checkPwned: true,
      minLength: 12,
    });

    if (!passwordValidation.isValid) {
      setErrors((prev) => ({ ...prev, password: passwordValidation.message }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      setResetSuccess(true);
      toast.success("Password reset successful!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to reset password. Please try again.";
      toast.error(message);
      setErrors((prev) => ({ ...prev, password: message }));
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
        <div className="max-w-md w-full">
          <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[var(--color-success-500)]/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--color-success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Password Reset Successful!
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link href="/login">
              <Button variant="primary" size="lg" fullWidth>
                Go to Login
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--color-primary-500)]/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Reset Your Password
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">
            Choose a strong, unique password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-8 rounded-2xl shadow-2xl animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                error={errors.password}
                placeholder="Create a strong password"
                disabled={isLoading}
                required
                fullWidth
                helperText="Minimum 12 characters with uppercase, lowercase, numbers & symbols"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />
              {formData.password && <PasswordStrength password={formData.password} />}
            </div>

            <Input
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              disabled={isLoading}
              required
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>

            <div className="text-center pt-4 border-t border-[var(--color-border-primary)]">
              <Link
                href="/login"
                className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors font-medium inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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