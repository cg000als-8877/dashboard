import React from 'react';

// Reusable Shimmering block helper
export function ShimmerBlock({ className = "" }) {
  return <div className={`shimmer rounded-md ${className}`} />;
}

// 1. Dashboard Skeleton View
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 KPI cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 p-4 rounded-2xl flex flex-col space-y-3 h-[100px] md:h-[130px] shimmer">
            <ShimmerBlock className="h-3 w-1/3 opacity-40 bg-[var(--color-text-muted)]/20" />
            <ShimmerBlock className="h-7 w-2/3 opacity-60 bg-[var(--color-text-muted)]/30" />
            <ShimmerBlock className="h-3.5 w-1/2 opacity-30 bg-[var(--color-text-muted)]/10" />
          </div>
        ))}
      </div>

      {/* Main analytical elements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left OEE card */}
        <div className="lg:col-span-1 bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 p-6 rounded-2xl h-[380px] flex flex-col justify-between shimmer">
          <div className="space-y-2">
            <ShimmerBlock className="h-4 w-1/4 bg-[var(--color-text-muted)]/20" />
            <ShimmerBlock className="h-3 w-1/2 bg-[var(--color-text-muted)]/10" />
          </div>
          <div className="flex justify-center my-6">
            <div className="w-48 h-48 rounded-full border-[10px] border-[var(--color-text-muted)]/10 flex items-center justify-center">
              <ShimmerBlock className="w-20 h-8 bg-[var(--color-text-muted)]/20" />
            </div>
          </div>
          <ShimmerBlock className="h-4 w-2/3 bg-[var(--color-text-muted)]/10 mx-auto" />
        </div>

        {/* Right Charts card */}
        <div className="lg:col-span-2 bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 p-6 rounded-2xl h-[380px] flex flex-col justify-between shimmer">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <ShimmerBlock className="h-4 w-1/3 bg-[var(--color-text-muted)]/20" />
              <ShimmerBlock className="h-3 w-2/3 bg-[var(--color-text-muted)]/10" />
            </div>
            <div className="flex gap-2">
              <ShimmerBlock className="h-6 w-16 bg-[var(--color-text-muted)]/10 rounded-full" />
              <ShimmerBlock className="h-6 w-16 bg-[var(--color-text-muted)]/10 rounded-full" />
            </div>
          </div>
          {/* Shimmering chart lines */}
          <div className="flex-1 flex items-end gap-3 mt-8 mb-4 h-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center h-full justify-end">
                <ShimmerBlock className="w-full bg-[var(--color-text-muted)]/20 rounded-t-md" style={{ height: `${20 + Math.random() * 60}%` }} />
                <ShimmerBlock className="w-full bg-[var(--color-text-muted)]/10 rounded-t-md" style={{ height: `${10 + Math.random() * 40}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-[var(--color-border)]/40">
            <ShimmerBlock className="h-3 w-12 bg-[var(--color-text-muted)]/10" />
            <ShimmerBlock className="h-3 w-12 bg-[var(--color-text-muted)]/10" />
            <ShimmerBlock className="h-3 w-12 bg-[var(--color-text-muted)]/10" />
            <ShimmerBlock className="h-3 w-12 bg-[var(--color-text-muted)]/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Hourly Skeleton View
export function HourlySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-8 w-64 bg-[var(--color-text-muted)]/30 rounded-lg" />
          <ShimmerBlock className="h-4 w-40 bg-[var(--color-text-muted)]/15" />
        </div>
        <ShimmerBlock className="h-11 w-48 bg-[var(--color-text-muted)]/20 rounded-xl" />
      </div>

      {/* Main card panel */}
      <div className="bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 rounded-2xl p-6 space-y-6 h-[500px] flex flex-col shimmer">
        <div className="flex justify-between items-center border-b border-[var(--color-border)]/40 pb-4">
          <ShimmerBlock className="h-6 w-32 bg-[var(--color-text-muted)]/20" />
          <div className="flex gap-1.5 w-1/3">
            {[1, 2, 3, 4].map(idx => (
              <ShimmerBlock key={idx} className="h-8 flex-1 bg-[var(--color-text-muted)]/15 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Charts area skeleton */}
        <div className="flex-1 flex items-end gap-2 mt-4 mb-4">
          {[...Array(8)].map((_, i) => (
            <ShimmerBlock key={i} className="flex-1 bg-[var(--color-text-muted)]/20 rounded-t-lg" style={{ height: `${30 + Math.random() * 50}%` }} />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map(row => (
            <div key={row} className="flex justify-between py-2.5 border-t border-[var(--color-border)]/40">
              <ShimmerBlock className="h-4 w-12 bg-[var(--color-text-muted)]/15" />
              <ShimmerBlock className="h-4 w-24 bg-[var(--color-text-muted)]/15" />
              <ShimmerBlock className="h-4 w-16 bg-[var(--color-text-muted)]/15" />
              <ShimmerBlock className="h-4 w-16 bg-[var(--color-text-muted)]/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Lines Overview Skeleton
export function LinesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-36 bg-[var(--color-text-muted)]/30" />
        <ShimmerBlock className="h-4 w-48 bg-[var(--color-text-muted)]/15" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1, 2, 3, 4].map(line => (
          <div key={line} className="bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 p-6 rounded-2xl h-[220px] flex flex-col justify-between shimmer">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <ShimmerBlock className="h-5 w-24 bg-[var(--color-text-muted)]/25" />
                <ShimmerBlock className="h-3 w-32 bg-[var(--color-text-muted)]/15" />
              </div>
              <ShimmerBlock className="h-6 w-16 bg-[var(--color-text-muted)]/15 rounded-full" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4 border-t border-[var(--color-border)]/40 pt-4">
              {[1, 2, 3].map(col => (
                <div key={col} className="space-y-1.5">
                  <ShimmerBlock className="h-3 w-12 bg-[var(--color-text-muted)]/10" />
                  <ShimmerBlock className="h-5 w-16 bg-[var(--color-text-muted)]/20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Analytics Skeleton View
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-44 bg-[var(--color-text-muted)]/30" />
        <ShimmerBlock className="h-4 w-56 bg-[var(--color-text-muted)]/15" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 p-6 rounded-2xl h-[420px] flex flex-col justify-between shimmer">
          <ShimmerBlock className="h-5 w-32 bg-[var(--color-text-muted)]/25" />
          <div className="flex-1 flex items-end gap-3 mt-6 mb-4">
            {[...Array(12)].map((_, i) => (
              <ShimmerBlock key={i} className="flex-1 bg-[var(--color-text-muted)]/20 rounded-t-md" style={{ height: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          {[1, 2].map(idx => (
            <div key={idx} className="bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 p-6 rounded-2xl h-[198px] flex flex-col justify-between shimmer">
              <ShimmerBlock className="h-4 w-20 bg-[var(--color-text-muted)]/20" />
              <ShimmerBlock className="h-7 w-32 bg-[var(--color-text-muted)]/25" />
              <ShimmerBlock className="h-3 w-40 bg-[var(--color-text-muted)]/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Simulator Skeleton View
export function SimulatorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-40 bg-[var(--color-text-muted)]/30" />
        <ShimmerBlock className="h-4 w-48 bg-[var(--color-text-muted)]/15" />
      </div>

      {/* Simulator canvas skeleton */}
      <div className="bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 rounded-2xl h-[340px] flex items-center justify-center shimmer">
        <div className="w-5/6 h-20 rounded-full border-4 border-dashed border-[var(--color-text-muted)]/10 animate-spin" style={{ animationDuration: '6s' }} />
      </div>

      {/* Controls card skeleton */}
      <div className="bg-[var(--color-bg-card)]/60 border border-[var(--color-border)]/50 p-6 rounded-2xl h-[160px] flex flex-col justify-between shimmer">
        <div className="flex justify-between items-center">
          <ShimmerBlock className="h-5 w-36 bg-[var(--color-text-muted)]/25" />
          <ShimmerBlock className="h-4 w-20 bg-[var(--color-text-muted)]/15" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map(btn => (
            <ShimmerBlock key={btn} className="h-10 flex-1 bg-[var(--color-text-muted)]/20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
