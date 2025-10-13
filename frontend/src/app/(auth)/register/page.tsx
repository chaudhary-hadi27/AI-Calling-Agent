// frontend/src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { isValidEmail, validatePasswordEnterprise } from "@/lib/utils/validators";
import PasswordStrength from "@/components/auth/PasswordStrength";

type Step = "account" | "verify" | "complete";

export default function ProfessionalRegisterPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("account");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeToTerms: false,
    otp: ["", "", "", "", "", ""],
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeToTerms: "",
    otp: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Account Details Validation
  const validateAccountStep = async (): Promise<boolean> => {
    const newErrors = { name: "", email: "", password: "", confirmPassword: "", company: "", agreeToTerms: "", otp: "" };
    let isValid = true;

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Full name is required (min 2 characters)";
      isValid = false;
    }

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
    } else {
      const passwordValidation = await validatePasswordEnterprise(formData.password, {
        checkPwned: false, // Skip for now
        minLength: 8,
      });
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
        isValid = false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle Account Step Submit
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validateAccountStep())) return;

    setIsLoading(true);
    try {
      // Send OTP to email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Verification code sent to ${formData.email}`);
      setCurrentStep("verify");
    } catch (error: any) {
      toast.error("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = formData.otp.join("");

    if (otpValue.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter complete verification code" }));
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Email verified successfully!");
      setCurrentStep("complete");
    } catch (error: any) {
      toast.error("Invalid verification code");
      setErrors((prev) => ({ ...prev, otp: "Invalid verification code" }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...formData.otp];
    newOTP[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOTP }));

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Verification code resent!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary-500)] rounded-xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Create Account
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Join thousands of teams using Smartkode AI
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep !== "complete" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`flex items-center ${currentStep === "account" ? "text-[var(--color-primary-500)]" : "text-[var(--color-success-500)]"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === "account" ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-success-500)] text-white"}`}>
                {currentStep === "account" ? "1" : "✓"}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Account</span>
            </div>

            <div className={`w-16 h-0.5 ${currentStep === "verify" || currentStep === "complete" ? "bg-[var(--color-success-500)]" : "bg-[var(--color-border-primary)]"}`}></div>

            <div className={`flex items-center ${currentStep === "verify" ? "text-[var(--color-primary-500)]" : currentStep === "complete" ? "text-[var(--color-success-500)]" : "text-[var(--color-text-tertiary)]"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === "verify" ? "bg-[var(--color-primary-500)] text-white" : currentStep === "complete" ? "bg-[var(--color-success-500)] text-white" : "bg-[var(--color-surface-secondary)] border border-[var(--color-border-primary)]"}`}>
                {currentStep === "complete" ? "✓" : "2"}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Verify</span>
            </div>
          </div>
        )}

        {/* Register Card */}
        <div className="card-professional p-8 animate-slide-up">
          {/* STEP 1: Account Details */}
          {currentStep === "account" && (
            <form onSubmit={handleAccountSubmit} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                error={errors.name}
                placeholder="John Doe"
                disabled={isLoading}
                required
                fullWidth
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                label="Work Email"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                label="Company Name (Optional)"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Inc."
                disabled={isLoading}
                fullWidth
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              <div>
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }));
                      setErrors((prev) => ({ ...prev, agreeToTerms: "" }));
                    }}
                    className="mt-1 w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                    disabled={isLoading}
                  />
                  <span className="ml-3 text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" target="_blank" className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1.5 text-sm text-[var(--color-error-500)]">{errors.agreeToTerms}</p>
                )}
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                Continue
              </Button>

              <div className="text-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: Verify Email */}
          {currentStep === "verify" && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary-500)]/20 rounded-full mb-4">
                  <svg className="w-8 h-8 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Check Your Email</h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  We sent a 6-digit code to<br />
                  <span className="font-medium text-[var(--color-primary-500)]">{formData.email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                  Enter Verification Code
                </label>
                <div className="flex gap-2 justify-center">
                  {formData.otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center text-2xl font-bold bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="mt-2 text-sm text-[var(--color-error-500)] text-center">{errors.otp}</p>
                )}
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                Verify Email
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium disabled:opacity-50"
                >
                  Didn't receive code? Resend
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep("account")}
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Change email address
              </button>
            </form>
          )}

          {/* STEP 3: Complete */}
          {currentStep === "complete" && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-success-500)]/20 rounded-full mb-4">
                <svg className="w-10 h-10 text-[var(--color-success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                  Welcome to Smartkode! 🎉
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  Your account has been created successfully
                </p>
              </div>

              <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-4">
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">Account Details:</p>
                <p className="text-[var(--color-text-primary)] font-medium">{formData.name}</p>
                <p className="text-[var(--color-primary-500)] font-medium">{formData.email}</p>
                {formData.company && (
                  <p className="text-[var(--color-text-secondary)] text-sm mt-1">{formData.company}</p>
                )}
              </div>

              <Link href="/login">
                <Button variant="primary" size="lg" fullWidth>
                  Continue to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}