"use client";

import React, { useState, useEffect } from "react";

interface RateLimitProgressProps {
  retryAfter: number; // seconds
}

export default function RateLimitProgress({ retryAfter }: RateLimitProgressProps) {
  const [timeLeft, setTimeLeft] = useState(retryAfter);

  useEffect(() => {
    setTimeLeft(retryAfter);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Reload page when timer ends
          setTimeout(() => window.location.reload(), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);

  const progress = ((retryAfter - timeLeft) / retryAfter) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-error-500)] to-[var(--color-warning-500)] transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-tertiary)]">
          Unlocks in:
        </span>
        <span className="font-mono font-semibold text-[var(--color-error-500)]">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Help Text */}
      <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
        💡 Tip: Use the "Forgot Password" link if you're having trouble logging in.
      </p>
    </div>
  );
}