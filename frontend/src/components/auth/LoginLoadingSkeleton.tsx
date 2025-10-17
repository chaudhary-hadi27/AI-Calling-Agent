"use client";

import React from "react";
import { Skeleton } from "@/components/ui";

export default function LoginLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md">
        {/* Logo Skeleton */}
        <div className="text-center mb-8 animate-fade-in">
          <Skeleton
            variant="circular"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <Skeleton width={200} height={32} className="mx-auto mb-2" />
          <Skeleton width={250} height={20} className="mx-auto" />
        </div>

        {/* Card Skeleton */}
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 shadow-2xl">
          {/* Email Input */}
          <div className="mb-5">
            <Skeleton width={100} height={16} className="mb-2" />
            <Skeleton width="100%" height={48} variant="rounded" />
          </div>

          {/* Password Input */}
          <div className="mb-5">
            <Skeleton width={80} height={16} className="mb-2" />
            <Skeleton width="100%" height={48} variant="rounded" />
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between mb-5">
            <Skeleton width={120} height={16} />
            <Skeleton width={110} height={16} />
          </div>

          {/* Submit Button */}
          <Skeleton width="100%" height={48} variant="rounded" className="mb-6" />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-primary)]"></div>
            </div>
            <div className="relative flex justify-center">
              <Skeleton width={140} height={16} className="bg-[var(--color-surface-primary)]" />
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Skeleton height={48} variant="rounded" />
            <Skeleton height={48} variant="rounded" />
          </div>

          {/* Sign Up Link */}
          <Skeleton width={200} height={16} className="mx-auto" />
        </div>

        {/* Security Badge Skeleton */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" width={32} height={32} />
              <div>
                <Skeleton width={60} height={12} className="mb-1" />
                <Skeleton width={50} height={10} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="mt-8">
          <Skeleton width={300} height={12} className="mx-auto" />
        </div>
      </div>
    </div>
  );
}