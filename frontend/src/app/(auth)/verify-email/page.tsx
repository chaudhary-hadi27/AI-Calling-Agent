// File: frontend/src/app/(auth)/verify-email/page.tsx
// ✅ CORRECTED: Matches backend verification flow

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/lib/api/services/auth.service";
import { useAuthStore } from "@/lib/store/authStore";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // ✅ Get email from session storage
    const storedEmail = sessionStorage.getItem("verification_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to register
      toast.error("Please register first");
      router.push("/register");
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, toast]);

  // Handle code input change
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (newCode.every((digit) => digit !== "") && value) {
      handleVerify(newCode.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      setError("");

      // Focus last input
      inputRefs.current[5]?.focus();

      // Auto-submit
      handleVerify(pastedData);
    }
  };

  // ✅ Verify email with backend
  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");

    if (codeToVerify.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ Call backend verify endpoint
      const response = await authService.verifyEmail(email, codeToVerify);

      if (response.success) {
        // ✅ Update auth store with user data
        login({
          id: response.user.id,
          email: response.user.email,
          name: response.user.full_name,
          role: response.user.role,
        });

        // Clear stored email
        sessionStorage.removeItem("verification_email");

        toast.success("Email verified successfully! Welcome to Smartkode AI 🎉");

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorMessage =
        error.response?.data?.detail || "Invalid verification code. Please try again.";
      setError(errorMessage);

      // Clear code on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend verification code
  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    setError("");

    try {
      // ✅ Call backend resend endpoint
      const response = await authService.resendVerification(email);

      if (response.success) {
        // Show verification code in development
        if (response.verification_code) {
          console.log("🔐 New Verification Code:", response.verification_code);
          toast.success(`New code: ${response.verification_code} (Dev Mode)`);
        } else {
          toast.success("Verification code sent! Check your email.");
        }

        // Reset countdown
        setCountdown(60);
        setCanResend(false);

        // Clear current code
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error(error.response?.data?.detail || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Verify Your Email
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            We've sent a 6-digit code to
            <br />
            <strong className="text-[var(--color-primary-500)]">{email}</strong>
          </p>
        </div>

        {/* Verification Card */}
        <div className="card-professional p-8 animate-slide-up">
          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center space-x-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all ${
                    error
                      ? "border-[var(--color-error-500)]"
                      : digit
                      ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/5"
                      : "border-[var(--color-border-primary)]"
                  }`}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && <p className="text-[var(--color-error-500)] text-sm mt-3 text-center">{error}</p>}
            <p className="text-[var(--color-text-tertiary)] text-sm mt-3 text-center">
              Code expires in 10 minutes
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            disabled={loading || code.some((d) => !d)}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mb-4"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          {/* Resend Button */}
          <div className="text-center">
            <p className="text-sm text-[var(--color-text-tertiary)] mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || resending}
              className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? (
                "Sending..."
              ) : canResend ? (
                "Resend Code"
              ) : (
                `Resend in ${countdown}s`
              )}
            </button>
          </div>

          {/* Back Link */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border-primary)] text-center">
            <Link
              href="/register"
              className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] inline-flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Register
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-[var(--color-text-tertiary)] text-sm mt-6">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
}