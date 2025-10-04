"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] p-8 rounded-2xl shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-lg">
              AI
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--color-text-secondary)] text-center mb-8">
            Sign in to your account to continue
          </p>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                />
                <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-700)] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--color-text-secondary)]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[var(--color-text-tertiary)] text-sm mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}