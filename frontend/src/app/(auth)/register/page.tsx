"use client";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-xl">
              <svg
                className="w-8 h-8"
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
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Create Account
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">
            Join us to start managing AI-powered calls
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-8 rounded-2xl shadow-2xl animate-slide-up">
          <RegisterForm />
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--color-text-tertiary)] text-sm mt-8">
          By creating an account, you agree to our{" "}
          <a
            href="#"
            className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}