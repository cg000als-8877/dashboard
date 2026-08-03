"use client";

import React from 'react';
import Link from 'next/link';
import { CalendarDays, ArrowRight, TrendingDown } from 'lucide-react';

const ARCHIVE_MONTHS = [
  {
    id: '2026-07',
    name: 'July 2026',
    description: 'Archive data for July 2026.',
  }
];

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
          <Link 
            key={month.id}
            href={`/archive/${month.id}`}
            className="flex flex-row items-center justify-between gap-3 bg-[var(--color-surface)] backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] shadow-md hover:bg-[var(--color-surface-hover)] transition-all group"
          >
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-normal sm:font-medium text-[var(--color-text-main)] mb-0.5">{month.name}</h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{month.description}</p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] sm:text-xs font-medium uppercase tracking-wider [box-shadow:0_0_15px_var(--color-primary-glow)] group-hover:[box-shadow:0_0_25px_var(--color-primary-glow-hover)] transition-all flex items-center gap-1.5">
                <span>See Details</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
