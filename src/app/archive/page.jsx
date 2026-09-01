"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useKpiData } from '@/utils/useKpiData';

function ArchiveMonthSkeletonCard() {
  return (
    <div className="relative p-[1px] rounded-2xl overflow-hidden bg-[var(--color-bg-card)]/40 border border-[var(--color-border)]/50 h-[110px] w-full shimmer">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 h-full w-full">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 bg-[var(--color-text-muted)]/15 rounded-md"></div>
          <div className="h-3 w-2/3 bg-[var(--color-text-muted)]/10 rounded-md"></div>
          <div className="h-3 w-1/2 bg-[var(--color-text-muted)]/10 rounded-md"></div>
        </div>
        <div className="h-9 w-28 bg-[var(--color-text-muted)]/15 rounded-lg shrink-0"></div>
      </div>
    </div>
  );
}

function ArchiveMonthCard({ month }) {
  const { stats, loading, error } = useKpiData(month.id);
  
  const isProfit = stats ? stats.netProfit >= 0 : true; // Default to profit while loading
  
  const summary = loading 
    ? 'Loading archive metrics...' 
    : error
      ? 'Error loading data.'
      : stats 
        ? `Recorded ${stats.workingDays} working days with a net ${isProfit ? 'profit' : 'loss'} of BDT ${Math.abs(Math.round(stats.netProfit)).toLocaleString()}.`
        : 'Data unavailable.';

  return (
    <div className="relative p-[1px] rounded-2xl overflow-hidden group transition-transform hover:-translate-y-0.5 duration-300">
      {/* Animated Border Background */}
      <div 
        className="absolute w-[400%] h-[400%] -left-[150%] -top-[150%] animate-[spin_4s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `conic-gradient(from 0deg, transparent 75%, ${isProfit ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)'} 100%)` }} 
      />
      
      <Link 
        href={`/archive/${month.id}`}
        className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-bg-card)]/75 backdrop-blur-md p-5 rounded-[15px] shadow-md hover:bg-[var(--color-surface-hover)] transition-colors h-full w-full"
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text-main)] font-display">{month.name}</h2>
            {!loading && stats && (
              isProfit ? (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp size={12} /> Profit
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  <TrendingDown size={12} /> Loss
                </span>
              )
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{month.description}</p>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] italic mt-2 line-clamp-2">{summary}</p>
        </div>
        
        <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
          <div className={`
            flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
            ${!loading && !isProfit 
              ? 'bg-rose-600 text-[var(--color-on-danger)] shadow-[0_0_15px_rgba(244,63,94,0.35)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] group-hover:bg-rose-500'
              : 'bg-emerald-600 text-[var(--color-on-success)] shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] group-hover:bg-emerald-500'}
          `}>
            <span>SEE DETAILS</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function ArchiveDirectoryPage() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/archive')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load archives');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setMonths(data.months || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both] md:pt-0">
      
      {/* Archive Header */}
      <header className="flex flex-col mb-8 relative z-10">
        <h1 className="text-[26px] md:text-[42px] font-bold tracking-[0.04em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] font-display">Archive</h1>
        <p className="text-[var(--color-primary)] font-medium tracking-wide uppercase text-[10px] md:text-xs mt-1 md:mt-2">Past Performance Records</p>
      </header>

      {/* Months List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <>
            <ArchiveMonthSkeletonCard />
            <ArchiveMonthSkeletonCard />
          </>
        ) : error ? (
          <div className="text-center p-8 bg-[var(--color-bg-card)]/50 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            Error loading archives: {error}
          </div>
        ) : months.length === 0 ? (
          <div className="text-center p-8 bg-[var(--color-bg-card)]/50 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            No archives available.
          </div>
        ) : (
          months.map((month) => (
            <ArchiveMonthCard key={month.id} month={month} />
          ))
        )}
      </div>
    </div>
  );
}
