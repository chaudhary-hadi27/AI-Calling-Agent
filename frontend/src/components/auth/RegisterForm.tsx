"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { isValidEmail } from "@/lib/utils/validators";

type Step = "email" | "otp" | "password" | "complete";

const RegisterForm: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: ["", "", "", "", "", ""],
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
  });

  // Step 1: Validate email and name
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: "", email: "", otp: "", password: "", confirmPassword: "", agreeToTerms: "" });

    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      return;
    }
    if (formData.name.trim().length < 2) {
      setErrors((prev) => ({ ...prev, name: "Name must be at least 2 characters" }));
      return;
    }
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Verification code sent to ${formData.email}`);
      setCurrentStep("otp");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to send verification code";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOTPSubmit = async (e: React.FormEvent) => {
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
      setCurrentStep("password");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Invalid verification code";
      toast.error(message);
      setErrors((prev) => ({ ...prev, otp: message }));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set password and complete registration
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: "", email: "", otp: "", password: "", confirmPassword: "", agreeToTerms: "" });

    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }
    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters" }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }
    if (!formData.agreeToTerms) {
      setErrors((prev) => ({ ...prev, agreeToTerms: "You must agree to the terms" }));
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Account created successfully!");
      setCurrentStep("complete");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Verification code resent!");
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...formData.otp];
    newOTP[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOTP }));

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP paste
  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOTP = pastedData.split("").concat(Array(6 - pastedData.length).fill(""));
    setFormData((prev) => ({ ...prev, otp: newOTP }));
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              placeholder="Enter your full name"
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
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              placeholder="name@smartkode.io"
              disabled={isLoading}
              required
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={isLoading}>
              {isLoading ? "Sending Code..." : "Continue"}
            </Button>

            <p className="text-center text-sm text-[var(--color-text-tertiary)]">
              We'll send a 6-digit verification code to your email
            </p>
          </form>
        );

      case "otp":
        return (
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary-500)]/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Check Your Email</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                We sent a verification code to<br />
                <span className="font-medium text-[var(--color-primary-500)]">{formData.email}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                Enter 6-Digit Code
              </label>
              <div className="flex gap-2 justify-center" onPaste={handleOTPPaste}>
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
                    className="w-12 h-14 text-center text-2xl font-bold bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border-primary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-2 text-sm text-[var(--color-error-500)] text-center">{errors.otp}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors font-medium disabled:opacity-50"
              >
                Didn't receive code? Resend
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep("email")}
              className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Change email address
            </button>
          </form>
        );

      case "password":
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-success-500)]/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-[var(--color-success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Email Verified!</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">Create a secure password for your account</p>
            </div>

            <Input
              label="Create Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              error={errors.password}
              placeholder="Create a strong password"
              disabled={isLoading}
              required
              fullWidth
              helperText="Minimum 8 characters"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer"
                  disabled={isLoading}
                />
                <span className="ml-3 text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1.5 text-sm text-[var(--color-error-500)]">{errors.agreeToTerms}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-success-500)]/20 rounded-full mb-4">
              <svg className="w-10 h-10 text-[var(--color-success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                Welcome to Smartkode!
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Your account has been created successfully
              </p>
            </div>

            <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border-primary)] rounded-lg p-4">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Account Details:</p>
              <p className="text-[var(--color-text-primary)] font-medium">{formData.name}</p>
              <p className="text-[var(--color-primary-500)] font-medium">{formData.email}</p>
            </div>

            <Link href="/login">
              <Button variant="primary" size="lg" fullWidth>
                Continue to Login
              </Button>
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      {currentStep !== "complete" && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center ${currentStep === "email" ? "text-[var(--color-primary-500)]" : "text-[var(--color-success-500)]"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === "email" ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-success-500)] text-white"}`}>
              {currentStep === "email" ? "1" : "✓"}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Email</span>
          </div>

          <div className={`w-12 h-0.5 ${["otp", "password"].includes(currentStep) ? "bg-[var(--color-success-500)]" : "bg-[var(--color-border-secondary)]"}`}></div>

          <div className={`flex items-center ${currentStep === "otp" ? "text-[var(--color-primary-500)]" : currentStep === "password" ? "text-[var(--color-success-500)]" : "text-[var(--color-text-tertiary)]"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === "otp" ? "bg-[var(--color-primary-500)] text-white" : currentStep === "password" ? "bg-[var(--color-success-500)] text-white" : "bg-[var(--color-surface-secondary)] border-2 border-[var(--color-border-secondary)]"}`}>
              {currentStep === "password" ? "✓" : "2"}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Verify</span>
          </div>

          <div className={`w-12 h-0.5 ${currentStep === "password" ? "bg-[var(--color-success-500)]" : "bg-[var(--color-border-secondary)]"}`}></div>

          <div className={`flex items-center ${currentStep === "password" ? "text-[var(--color-primary-500)]" : "text-[var(--color-text-tertiary)]"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === "password" ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-surface-secondary)] border-2 border-[var(--color-border-secondary)]"}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Password</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      {renderStepContent()}

      {/* Sign In Link */}
      {currentStep === "email" && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-primary)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-surface-primary)] text-[var(--color-text-tertiary)]">
                Already have an account?
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button type="button" variant="outline" size="lg" fullWidth disabled={isLoading}>
              Sign In Instead
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default RegisterForm;