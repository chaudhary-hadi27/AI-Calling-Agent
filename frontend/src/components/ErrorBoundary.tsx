"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "./ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-[var(--color-error-500)]/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-[var(--color-error-500)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-[var(--color-text-secondary)] text-center mb-6">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-lg p-4 overflow-auto max-h-64">
                  <p className="text-sm font-mono text-[var(--color-error-400)] mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm text-[var(--color-text-tertiary)] cursor-pointer hover:text-[var(--color-text-secondary)]">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-[var(--color-text-tertiary)] mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = "/"}
                >
                  Go to Homepage
                </Button>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t border-[var(--color-border-primary)] text-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  If this problem persists, please contact{" "}
                  <a
                    href="mailto:support@example.com"
                    className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors"
                  >
                    support@example.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;