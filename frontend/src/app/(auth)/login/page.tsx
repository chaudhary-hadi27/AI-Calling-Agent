"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLoginRateLimit } from "@/hooks/useRateLimit";
import { isValidEmail } from "@/lib/utils/validators";
import MFAVerification from "@/components/auth/MFAVerification";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import SecurityBadge from "@/components/auth/SecurityBadge";

export default function EnhancedLoginPage() {
  const { login, verifyMFA, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState("");

  // Rate limiting
  const {
    checkRateLimit,
    isLocked,
    remainingAttempts,
    retryAfter,
  } = useLoginRateLimit(formData.email);

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check rate limit
    if (!checkRateLimit()) return;

    try {
      const result = await login(formData.email, formData.password, {
        trustDevice: formData.rememberMe,
      });

      // Check if MFA is required
      if (result?.requiresMFA) {
        setMfaRequired(true);
        setTempToken(result.tempToken);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleMFAVerify = async (code: string) => {
    await verifyMFA(tempToken, code);
  };

  // Show MFA verification screen
  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
        <div className="w-full max-w-md">
          <div className="card-professional p-8 animate-slide-up">
            <MFAVerification
              onVerify={handleMFAVerify}
              onUseBackupCode={() => {
                // Handle backup code flow
              }}
              isLoading={isLoading}
            />
            <button
              onClick={() => setMfaRequired(false)}
              className="mt-4 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors mx-auto flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Sign in to your Smartkode AI account
          </p>
        </div>

        {/* Rate Limit Warning */}
        {isLocked && (
          <div className="mb-6 bg-[var(--color-error-500)]/10 border border-[var(--color-error-500)]/30 rounded-lg p-4 animate-slide-down">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--color-error-500)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-[var(--color-error-500)] mb-1">
                  Account Temporarily Locked
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Too many failed login attempts. Please try again in {retryAfter} seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Remaining Attempts Warning */}
        {!isLocked && remainingAttempts <= 2 && remainingAttempts > 0 && (
          <div className="mb-6 bg-[var(--color-warning-500)]/10 border border-[var(--color-warning-500)]/30 rounded-lg p-4 animate-slide-down">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[var(--color-warning-500)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-warning-500)]">{remainingAttempts}</span> login attempts remaining before temporary lockout
              </p>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="card-professional p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              placeholder="you@company.com"
              disabled={isLoading || isLocked}
              required
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            {/* Password Input */}
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
              placeholder="Enter your password"
              disabled={isLoading || isLocked}
              required
              fullWidth
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))}
                  className="w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-offset-[var(--color-bg-primary)]"
                  disabled={isLoading || isLocked}
                />
                <span className="ml-2 text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                  Trust this device
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || isLocked}
            >
              {isLocked ? `Locked (${retryAfter}s)` : isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-primary)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-surface-primary)] text-[var(--color-text-tertiary)]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <SocialLoginButtons disabled={isLoading || isLocked} />

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <SecurityBadge />

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[var(--color-text-tertiary)]">
          <p>
            Protected by enterprise-grade security • <Link href="/privacy" className="hover:text-[var(--color-text-secondary)] transition-colors">Privacy</Link> • <Link href="/terms" className="hover:text-[var(--color-text-secondary)] transition-colors">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}