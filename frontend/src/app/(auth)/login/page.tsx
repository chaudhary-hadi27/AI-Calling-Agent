"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-xl animate-bounce">
              AI
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">
            Sign in to access your AI calling dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-8 rounded-2xl shadow-2xl animate-slide-up">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--color-text-tertiary)] text-sm mt-8">
          By signing in, you agree to our{" "}
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