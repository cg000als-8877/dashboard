"use client";

import React from 'react';
import Link from 'next/link';
import { CalendarDays, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useKpiData } from '@/utils/useKpiData';

const ARCHIVE_MONTHS = [
  {
    id: '2026-07',
    name: 'July 2026',
    description: 'Archive data for July 2026.'
  }
];

function ArchiveMonthCard({ month }) {
  const { stats, loading, error } = useKpiData(month.id);
  
  const isProfit = stats ? stats.netProfit >= 0 : true; // Default to blue while loading
  
  const summary = loading 
    ? 'Loading archive data...' 
    : error
      ? 'Error loading data.'
      : stats 
        ? `Recorded ${stats.workingDays} working days with a net ${isProfit ? 'profit' : 'loss'} of BDT ${Math.abs(Math.round(stats.netProfit)).toLocaleString()}.`
        : 'Data unavailable.';

  return (
    <Link 
      href={`/archive/${month.id}`}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-surface)] backdrop-blur-md p-5 rounded-2xl border border-[var(--color-border)] shadow-md hover:bg-[var(--color-surface-hover)] transition-all group"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-medium text-[var(--color-text-main)]">{month.name}</h2>
          {!loading && stats && (
            isProfit ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp size={12} /> Profit
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                <TrendingDown size={12} /> Loss
              </span>
            )
          )}
        </div>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{month.description}</p>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] italic mt-2 line-clamp-2">{summary}</p>
      </div>
      
      <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        <div className={`
          flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
          ${!loading && !isProfit 
            ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] group-hover:bg-red-500'
            : 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] group-hover:bg-blue-500'}
        `}>
          <span>SEE DETAILS</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default function ArchiveDirectoryPage() {
  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both] pb-20 md:pt-0">
      
      {/* Archive Header */}
      <header className="flex flex-col mb-8 relative z-10">
        <h1 className="text-2xl md:text-4xl font-medium md:font-bold tracking-tight text-[var(--color-text-main)]">Archive</h1>
        <p className="text-[var(--color-text-muted)] mt-1 text-xs md:text-sm">Past Records</p>
      </header>

      {/* Months List */}
      <div className="flex flex-col gap-4">
        {ARCHIVE_MONTHS.map((month) => (
          <ArchiveMonthCard key={month.id} month={month} />
        ))}
      </div>
    </div>
  );
}
