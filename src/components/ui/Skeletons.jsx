"use client";

import React from 'react';

// Reusable Shimmering block helper
export function ShimmerBlock({ className = "", style = {} }) {
  return (
    <div 
      className={`shimmer rounded-md ${className}`} 
      style={style} 
    />
  );
}

// Reusable Solid Skeleton Card Container (Opaque background prevents canvas bleed-through)
export function SkeletonCard({ className = "", children, style = {} }) {
  return (
    <div 
      className={`relative z-10 rounded-2xl border border-[var(--color-border)]/40 shadow-sm md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        ...style
      }}
    >
      {children}
    </div>
  );
}

// 1. Dashboard Skeleton View (Matched to modern responsive 3-column PC & mobile layout)
export function DashboardSkeleton() {
  return (
    <div className="space-y-5 md:space-y-6 relative z-10 w-full select-none animate-in fade-in duration-300">
      
      {/* Header Placeholder */}
      <div className="flex flex-col items-center justify-center pt-1 pb-2">
        <ShimmerBlock className="h-6 sm:h-7 md:h-8 w-48 sm:w-56 md:w-64 rounded-lg bg-[var(--color-text-muted)]/20" />
        <ShimmerBlock className="h-3.5 sm:h-4 w-52 sm:w-64 md:w-72 rounded-md bg-[var(--color-text-muted)]/15 mt-2" />
        
        {/* Month Pills Track Placeholder */}
        <div className="flex items-center justify-center gap-2 mt-3.5 md:mt-4">
          <ShimmerBlock className="h-7 sm:h-8 w-16 sm:w-20 rounded-full bg-[var(--color-text-muted)]/20" />
          <ShimmerBlock className="h-7 sm:h-8 w-12 sm:w-14 rounded-full bg-[var(--color-text-muted)]/15" />
          <ShimmerBlock className="h-7 sm:h-8 w-12 sm:w-14 rounded-full bg-[var(--color-text-muted)]/15" />
          <ShimmerBlock className="h-7 sm:h-8 w-12 sm:w-14 rounded-full bg-[var(--color-text-muted)]/15" />
          <ShimmerBlock className="h-7 sm:h-8 w-12 sm:w-14 rounded-full bg-[var(--color-text-muted)]/15" />
          <ShimmerBlock className="h-4 w-32 rounded-md bg-[var(--color-text-muted)]/15 ml-2 hidden sm:block" />
        </div>
      </div>

      {/* ── DESKTOP VIEW SKELETON: 3-Column Wireframe Grid ── */}
      <div className="hidden md:grid md:grid-cols-12 gap-3.5 lg:gap-4 xl:gap-5 items-stretch relative z-10">
        
        {/* COLUMN 1: Net Loss, Combined Card, Total Income & Cost */}
        <div className="col-span-4 flex flex-col gap-3 xl:gap-3.5 justify-between">
          {/* Card 1: Net Loss */}
          <SkeletonCard className="p-4 sm:p-5 xl:p-6 h-[135px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <ShimmerBlock className="h-3.5 w-24 bg-[var(--color-text-muted)]/20 rounded-md" />
                <ShimmerBlock className="h-8 w-44 bg-[var(--color-text-muted)]/30 rounded-lg mt-2.5" />
              </div>
              <ShimmerBlock className="w-16 h-10 bg-[var(--color-text-muted)]/15 rounded-lg" />
            </div>
            <div className="pt-2 border-t border-[var(--color-border)]/20">
              <ShimmerBlock className="h-3 w-48 bg-[var(--color-text-muted)]/15 rounded-md" />
            </div>
          </SkeletonCard>

          {/* Card 2: Combined Last Day & Avg Daily Loss */}
          <SkeletonCard className="p-3.5 px-4 xl:px-5 h-[76px] flex flex-col justify-between">
            <div className="flex justify-between items-center w-full">
              <ShimmerBlock className="h-3.5 w-32 bg-[var(--color-text-muted)]/20 rounded-md" />
              <ShimmerBlock className="h-4 w-24 bg-[var(--color-text-muted)]/25 rounded-md" />
            </div>
            <div className="w-full h-px bg-[var(--color-border)]/20 my-1" />
            <div className="flex justify-between items-center w-full">
              <ShimmerBlock className="h-3.5 w-28 bg-[var(--color-text-muted)]/20 rounded-md" />
              <ShimmerBlock className="h-4 w-28 bg-[var(--color-text-muted)]/25 rounded-md" />
            </div>
          </SkeletonCard>

          {/* Card 3: Income & Cost Cards */}
          <div className="grid grid-cols-2 gap-2 xl:gap-3 h-[110px]">
            <SkeletonCard className="p-3 xl:p-4 flex flex-col justify-between">
              <div>
                <ShimmerBlock className="h-3 w-20 bg-[var(--color-text-muted)]/20 rounded-md" />
                <ShimmerBlock className="h-5 w-28 bg-[var(--color-text-muted)]/30 rounded-lg mt-2" />
              </div>
              <ShimmerBlock className="h-2.5 w-20 bg-[var(--color-text-muted)]/15 rounded-md" />
            </SkeletonCard>

            <SkeletonCard className="p-3 xl:p-4 flex flex-col justify-between">
              <div>
                <ShimmerBlock className="h-3 w-20 bg-[var(--color-text-muted)]/20 rounded-md" />
                <ShimmerBlock className="h-5 w-28 bg-[var(--color-text-muted)]/30 rounded-lg mt-2" />
              </div>
              <ShimmerBlock className="h-2.5 w-20 bg-[var(--color-text-muted)]/15 rounded-md" />
            </SkeletonCard>
          </div>
        </div>

        {/* COLUMN 2: Cost Recovery 3-Donut Card */}
        <div className="col-span-4 flex flex-col">
          <SkeletonCard className="p-5 xl:p-6 h-full flex flex-col justify-between items-center">
            {/* 3 Donut Rings Placeholder */}
            <div className="flex items-center justify-center gap-4 py-6 my-auto">
              {[1, 2, 3].map(donut => (
                <div key={donut} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-full border-[7px] border-[var(--color-text-muted)]/15 flex items-center justify-center">
                    <ShimmerBlock className="w-8 h-4 bg-[var(--color-text-muted)]/20 rounded" />
                  </div>
                  <ShimmerBlock className="h-3 w-12 bg-[var(--color-text-muted)]/15 rounded" />
                </div>
              ))}
            </div>

            {/* Bottom Subtitle Placeholder */}
            <div className="w-full flex flex-col items-center pt-2">
              <ShimmerBlock className="h-4 w-44 bg-[var(--color-text-muted)]/20 rounded-md" />
              <ShimmerBlock className="h-3 w-56 bg-[var(--color-text-muted)]/15 rounded-md mt-1.5" />
            </div>
          </SkeletonCard>
        </div>

        {/* COLUMN 3: Production Lines Card */}
        <div className="col-span-4 flex flex-col">
          <SkeletonCard className="p-5 xl:p-6 h-full flex flex-col justify-between">
            {/* Header */}
            <div>
              <ShimmerBlock className="h-3.5 w-32 bg-[var(--color-text-muted)]/20 rounded-md" />
              <ShimmerBlock className="h-7 w-28 bg-[var(--color-text-muted)]/30 rounded-lg mt-2" />
              <ShimmerBlock className="h-3 w-24 bg-[var(--color-text-muted)]/15 rounded-md mt-1" />
            </div>

            {/* 3 Line Cards */}
            <div className="flex flex-col gap-2.5 my-auto py-2">
              {[1, 2, 3].map(line => (
                <div key={line} className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/30 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <ShimmerBlock className="w-8 h-8 rounded-lg bg-[var(--color-text-muted)]/20" />
                    <div>
                      <ShimmerBlock className="h-3.5 w-20 bg-[var(--color-text-muted)]/25 rounded" />
                      <ShimmerBlock className="h-2.5 w-28 bg-[var(--color-text-muted)]/15 rounded mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <ShimmerBlock className="h-4 w-16 bg-[var(--color-text-muted)]/25 rounded" />
                    <ShimmerBlock className="h-2.5 w-10 bg-[var(--color-text-muted)]/15 rounded mt-1 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>

      </div>

      {/* ── MOBILE VIEW SKELETON: Stacked Mobile Cards ── */}
      <div className="md:hidden flex flex-col gap-2 relative z-10 px-0.5">
        {/* Card 1: Net Loss Top Card */}
        <SkeletonCard className="p-3.5 rounded-2xl h-[115px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <ShimmerBlock className="h-3.5 w-24 bg-[var(--color-text-muted)]/20 rounded" />
            <ShimmerBlock className="h-7 w-36 bg-[var(--color-text-muted)]/30 rounded" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]/20">
            <ShimmerBlock className="h-3 w-32 bg-[var(--color-text-muted)]/15 rounded" />
            <ShimmerBlock className="h-3.5 w-28 bg-[var(--color-text-muted)]/20 rounded" />
          </div>
        </SkeletonCard>

        {/* Card 2: Last Day Loss Card */}
        <SkeletonCard className="p-3.5 rounded-2xl h-[56px] flex justify-between items-center">
          <ShimmerBlock className="h-3.5 w-36 bg-[var(--color-text-muted)]/20 rounded" />
          <ShimmerBlock className="h-4 w-24 bg-[var(--color-text-muted)]/25 rounded" />
        </SkeletonCard>

        {/* Card 3: Total Income & Cost Cards */}
        <div className="grid grid-cols-2 gap-2 h-[90px]">
          <SkeletonCard className="p-3 flex flex-col justify-between">
            <ShimmerBlock className="h-3 w-16 bg-[var(--color-text-muted)]/20 rounded" />
            <ShimmerBlock className="h-5 w-24 bg-[var(--color-text-muted)]/30 rounded" />
          </SkeletonCard>
          <SkeletonCard className="p-3 flex flex-col justify-between">
            <ShimmerBlock className="h-3 w-16 bg-[var(--color-text-muted)]/20 rounded" />
            <ShimmerBlock className="h-5 w-24 bg-[var(--color-text-muted)]/30 rounded" />
          </SkeletonCard>
        </div>

        {/* Card 4: Donuts Card */}
        <SkeletonCard className="p-4 rounded-2xl h-[150px] flex items-center justify-around">
          {[1, 2, 3].map(donut => (
            <div key={donut} className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full border-[5px] border-[var(--color-text-muted)]/15 flex items-center justify-center">
                <ShimmerBlock className="w-6 h-3 bg-[var(--color-text-muted)]/20 rounded" />
              </div>
              <ShimmerBlock className="h-2.5 w-10 bg-[var(--color-text-muted)]/15 rounded" />
            </div>
          ))}
        </SkeletonCard>

        {/* Card 5: Lines Breakdown Card */}
        <SkeletonCard className="p-3.5 rounded-2xl h-[170px] flex flex-col justify-between">
          <div className="flex justify-between items-center pb-1">
            <ShimmerBlock className="h-3.5 w-28 bg-[var(--color-text-muted)]/20 rounded" />
            <ShimmerBlock className="h-3 w-16 bg-[var(--color-text-muted)]/15 rounded" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(l => (
              <div key={l} className="p-2 rounded-lg bg-[var(--color-surface)] flex justify-between items-center">
                <ShimmerBlock className="h-3.5 w-24 bg-[var(--color-text-muted)]/20 rounded" />
                <ShimmerBlock className="h-3.5 w-16 bg-[var(--color-text-muted)]/25 rounded" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

    </div>
  );
}

// 2. Hourly Skeleton View
export function HourlySkeleton() {
  return (
    <div className="space-y-6 relative z-10 w-full animate-in fade-in duration-300">
      {/* Top filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-8 w-64 bg-[var(--color-text-muted)]/30 rounded-lg" />
          <ShimmerBlock className="h-4 w-40 bg-[var(--color-text-muted)]/15" />
        </div>
        <ShimmerBlock className="h-11 w-48 bg-[var(--color-text-muted)]/20 rounded-xl" />
      </div>

      {/* Main card panel */}
      <SkeletonCard className="p-6 space-y-6 h-[500px] flex flex-col">
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
            <ShimmerBlock key={i} className="flex-1 bg-[var(--color-text-muted)]/20 rounded-t-lg" style={{ height: `${30 + (i % 4) * 15}%` }} />
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
      </SkeletonCard>
    </div>
  );
}

// 3. Lines Overview Skeleton
export function LinesSkeleton() {
  return (
    <div className="space-y-6 relative z-10 w-full animate-in fade-in duration-300">
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-36 bg-[var(--color-text-muted)]/30 rounded-lg" />
        <ShimmerBlock className="h-4 w-48 bg-[var(--color-text-muted)]/15 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1, 2, 3, 4].map(line => (
          <SkeletonCard key={line} className="p-6 h-[220px] flex flex-col justify-between">
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
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

// 4. Analytics Skeleton View
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 relative z-10 w-full animate-in fade-in duration-300">
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-44 bg-[var(--color-text-muted)]/30 rounded-lg" />
        <ShimmerBlock className="h-4 w-56 bg-[var(--color-text-muted)]/15 rounded-md" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 -mx-2.5 sm:mx-0">
        <div className="xl:col-span-2">
          <SkeletonCard className="p-6 h-[420px] flex flex-col justify-between">
            <ShimmerBlock className="h-5 w-32 bg-[var(--color-text-muted)]/25" />
            <div className="flex-1 flex items-end gap-3 mt-6 mb-4">
              {[...Array(12)].map((_, i) => (
                <ShimmerBlock key={i} className="flex-1 bg-[var(--color-text-muted)]/20 rounded-t-md" style={{ height: `${20 + (i % 6) * 12}%` }} />
              ))}
            </div>
          </SkeletonCard>
        </div>

        <div className="xl:col-span-1 space-y-6">
          {[1, 2].map(idx => (
            <SkeletonCard key={idx} className="p-6 h-[198px] flex flex-col justify-between">
              <ShimmerBlock className="h-4 w-20 bg-[var(--color-text-muted)]/20" />
              <ShimmerBlock className="h-7 w-32 bg-[var(--color-text-muted)]/25" />
              <ShimmerBlock className="h-3 w-40 bg-[var(--color-text-muted)]/15" />
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Simulator Skeleton View
export function SimulatorSkeleton() {
  return (
    <div className="space-y-6 relative z-10 w-full animate-in fade-in duration-300">
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-40 bg-[var(--color-text-muted)]/30 rounded-lg" />
        <ShimmerBlock className="h-4 w-48 bg-[var(--color-text-muted)]/15 rounded-md" />
      </div>

      {/* Simulator canvas skeleton */}
      <SkeletonCard className="h-[340px] flex items-center justify-center">
        <div className="w-5/6 h-20 rounded-full border-4 border-dashed border-[var(--color-text-muted)]/10 animate-spin" style={{ animationDuration: '6s' }} />
      </SkeletonCard>

      {/* Controls card skeleton */}
      <SkeletonCard className="p-6 h-[160px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <ShimmerBlock className="h-5 w-36 bg-[var(--color-text-muted)]/25" />
          <ShimmerBlock className="h-4 w-20 bg-[var(--color-text-muted)]/15" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map(btn => (
            <ShimmerBlock key={btn} className="h-10 flex-1 bg-[var(--color-text-muted)]/20 rounded-xl" />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
