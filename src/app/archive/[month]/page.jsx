"use client";

import React, { use } from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';
import Link from 'next/link';
import { ArrowLeft, FileText, Database } from 'lucide-react';

export default function ArchiveMonthPage({ params }) {
  const { month } = use(params);

  // All lines available in the dataset
  const availableLines = ['a', 'b', 'c', 'd'];

  return (
    <div className="relative scroll-smooth">
      {/* Archive-specific Context Header */}
      <div className="flex items-center justify-between gap-4 mb-6 md:mt-0 relative z-20">
        <Link 
          href="/archive"
          className="hidden md:flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] px-3 sm:px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> 
          <span className="hidden sm:inline">Back to Archives</span>
        </Link>
        

      </div>

      <DashboardContent month={month} isArchive={true} />

      {/* Render all Line Details embedded in the same page */}
      <div className="mt-20 relative z-10 animate-[fade-up_0.6s_ease-out_both]">
        <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent"></div>
          <div className="bg-[var(--background)] px-4 md:px-6 relative z-10">
            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] inline-block mb-2 md:mb-3">
              <Database className="text-gray-400 w-5 h-5 md:w-8 md:h-8" />
            </div>
            <h2 className="text-sm md:text-2xl font-bold text-[var(--color-text-main)] uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed md:leading-normal">Comprehensive Data Sheets</h2>
            <p className="text-[9px] md:text-sm text-[var(--color-text-muted)] mt-1 md:mt-2 font-light tracking-widest uppercase">Deep dive metrics for all active lines</p>
          </div>
        </div>

        <div className="space-y-10">
          {availableLines.map(lineId => (
            <LineDetailsContent 
              key={lineId} 
              id={lineId} 
              month={month} 
              isEmbed={true} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
