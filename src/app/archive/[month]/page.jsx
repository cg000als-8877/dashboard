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
    <div className="relative pb-24 scroll-smooth">
      {/* Archive-specific Context Header */}
      <div className="flex items-center justify-between gap-4 mb-6 md:mt-0 relative z-20">
        <Link 
          href="/archive"
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] px-3 sm:px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> 
          <span className="hidden sm:inline">Back to Archives</span>
        </Link>
        
        {month === '2026-07' && (
          <button 
            onClick={() => window.open('https://drive.google.com/file/d/1GWGOeDtG3mvxW7T8y0w64UHg75jBR-Bv/view?usp=sharing', '_blank')}
            className="flex items-center gap-2 bg-[var(--color-danger)] hover:bg-red-500 text-white font-black py-2 px-4 rounded-xl transition-all [box-shadow:0_0_15px_var(--color-danger-glow)] hover:[box-shadow:0_0_25px_var(--color-danger-glow)] text-xs uppercase tracking-widest active:scale-95"
          >
            <FileText size={16} /> July Pdf
          </button>
        )}
      </div>

      <DashboardContent month={month} isArchive={true} />

      {/* Render all Line Details embedded in the same page */}
      <div className="mt-20 relative z-10 animate-[fade-up_0.6s_ease-out_both]">
        <div className="flex flex-col items-center justify-center text-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent"></div>
          <div className="bg-[var(--background)] px-6 relative z-10">
            <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] inline-block mb-3">
              <Database className="text-gray-400" size={32} />
            </div>
            <h2 className="text-2xl font-black text-[var(--color-text-main)] uppercase tracking-[0.3em]">Comprehensive Data Sheets</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 font-medium tracking-widest uppercase">Deep dive metrics for all active lines</p>
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
