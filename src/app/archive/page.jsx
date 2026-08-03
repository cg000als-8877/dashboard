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
        <h1 className="text-2xl md:text-4xl font-bold md:font-black tracking-tight text-white">Archive</h1>
        <p className="text-gray-400 mt-1 text-xs md:text-sm">Past Records</p>
      </header>

      {/* Months List */}
      <div className="flex flex-col gap-4">
        {ARCHIVE_MONTHS.map((month) => (
          <Link 
            key={month.id}
            href={`/archive/${month.id}`}
            className="flex flex-row items-center justify-between gap-3 bg-[rgba(10,13,20,0.8)] backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-md hover:bg-[rgba(255,255,255,0.02)] transition-all group"
          >
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold sm:font-bold text-white mb-0.5">{month.name}</h2>
              <p className="text-xs sm:text-sm text-gray-500">{month.description}</p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(79,140,255,0.4)] group-hover:shadow-[0_0_25px_rgba(79,140,255,0.6)] transition-all flex items-center gap-1.5">
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
