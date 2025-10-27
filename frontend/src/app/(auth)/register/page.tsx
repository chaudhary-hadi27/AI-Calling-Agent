// File: frontend/src/app/(auth)/register/page.tsx
// ✅ CORRECTED: Matches backend email verification flow

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { isValidEmail, validatePasswordEnterprise } from "@/lib/utils/validators";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { authService } from "@/lib/api/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Validate form
  const validateForm = async (): Promise<boolean> => {
    const newErrors = {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: "",
    };
    let isValid = true;

    // Full name
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      newErrors.full_name = "Full name is required (min 2 characters)";
      isValid = false;
    }

    // Email
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else {
      const passwordValidation = await validatePasswordEnterprise(formData.password, {
        checkPwned: false, // Skip pwned check during registration
        minLength: 8,
      });
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
        isValid = false;
      }
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Terms
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) return;

    setIsLoading(true);

    try {
      // ✅ Call backend register endpoint
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.full_name,
        formData.username || undefined
      );

      if (response.success) {
        // ✅ Store email for verification page
        sessionStorage.setItem("verification_email", formData.email);

        // ✅ Show verification code in development (backend returns it)
        if (response.verification_code) {
          console.log("🔐 Verification Code:", response.verification_code);
          toast.success(`Verification code: ${response.verification_code} (Dev Mode)`);
        }

        toast.success("Registration successful! Check your email for verification code.");

        // ✅ Redirect to verification page
        router.push("/verify-email");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(errorMessage);
      setErrors((prev) => ({ ...prev, email: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Create Account
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Join thousands of teams using Smartkode AI
          </p>
        </div>

        {/* Register Card */}
        <div className="card-professional p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              value={formData.full_name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, full_name: e.target.value }));
                setErrors((prev) => ({ ...prev, full_name: "" }));
              }}
              error={errors.full_name}
              placeholder="John Doe"
              disabled={isLoading}
              required
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />

            {/* Email */}
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

            {/* Username (Optional) */}
            <Input
              label="Username (Optional)"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="johndoe"
              disabled={isLoading}
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
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
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                }
              />
              {formData.password && <PasswordStrength password={formData.password} />}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }));
                    setErrors((prev) => ({ ...prev, agreeToTerms: "" }));
                  }}
                  className="mt-1 w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] cursor-pointer"
                  disabled={isLoading}
                />
                <span className="ml-3 text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1.5 text-sm text-[var(--color-error-500)]">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--color-text-tertiary)] text-sm mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}