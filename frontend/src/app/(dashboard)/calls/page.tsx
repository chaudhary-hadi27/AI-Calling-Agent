"use client";

import { Suspense } from "react";
import { SkeletonTable } from "@/components/ui";

/**
 * ✅ Calls Loading Skeleton
 */
function CallsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-[var(--color-surface-secondary)] rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-[var(--color-surface-secondary)] rounded-lg animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-[var(--color-surface-secondary)] rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl p-6">
        <SkeletonTable rows={8} />
      </div>
    </div>
  );
}

/**
 * ✅ Calls List Component (Async)
 */
async function CallsList() {
  // Simulate async data fetching
  // In production, replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 100));

  return (
    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
        Recent Calls
      </h2>
      <div className="space-y-4">
        <p className="text-[var(--color-text-secondary)]">
          Your call history will appear here...
        </p>
        {/* Add actual calls list here */}
      </div>
    </div>
  );
}

/**
 * ✅ Main Calls Page with Suspense
 */
export default function CallsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
        Calls
      </h1>

      <Suspense fallback={<CallsLoadingSkeleton />}>
        <CallsList />
      </Suspense>
    </div>
  );
}