"use client";

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/components/layout/Sidebar';

const MONTHS_LIST = [
  { id: 'current', short: 'NOV', full: 'NOVEMBER', isLive: true, key: 'live' },
  { id: 'october', short: 'OCT', full: 'OCTOBER', isLive: false, key: '2026-10' },
  { id: 'september', short: 'SEP', full: 'SEPTEMBER', isLive: false, key: '2026-09' },
  { id: 'august', short: 'AUG', full: 'AUGUST', isLive: false, key: '2026-08' },
  { id: 'july', short: 'JUL', full: 'JULY', isLive: false, key: '2026-07' },
];

export function MonthSelectorBar({
  selectedMonth = 'current',
  onSelectMonth,
  dateInfo,
  workingDays = null,
  isPastMonth = false,
  isArchive = false,
  className = ""
}) {
  const scrollTrackRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const handleTrackScroll = () => {
    if (scrollTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollTrackRef.current;
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
    }
  };

  if (isArchive) return null;

  const currentMonthIdx = MONTHS_LIST.findIndex(m => m.id === selectedMonth);
  const selectedObj = MONTHS_LIST[currentMonthIdx] || MONTHS_LIST[0];

  // Single unified date string for mobile: "01 - 21 NOV, 2026 (18 DAYS)"
  const formattedMobileDateRange = (() => {
    if (!dateInfo) return '';
    if (dateInfo.isRange) {
      if (dateInfo.startMonthShort === dateInfo.endMonthShort) {
        return `${dateInfo.startDay} - ${dateInfo.endDay} ${dateInfo.endMonthShort}, ${dateInfo.year}`;
      }
      return `${dateInfo.startDay} ${dateInfo.startMonthShort} - ${dateInfo.endDay} ${dateInfo.endMonthShort}, ${dateInfo.year}`;
    }
    return `${dateInfo.startDay} ${dateInfo.endMonthShort}, ${dateInfo.year}`;
  })();

  // Auto-scroll selected capsule into view when changed
  useEffect(() => {
    if (scrollTrackRef.current) {
      const activeEl = scrollTrackRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        const container = scrollTrackRef.current;
        const targetScrollLeft = activeEl.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      }
    }
  }, [selectedMonth]);

  return (
    <div className={cn("w-full relative z-20 flex flex-col items-center mb-2.5 sm:mb-3.5", className)}>
      <div className="w-full bg-transparent border-0 p-0 shadow-none transition-all duration-300">
        
        {/* Row 1: Month Buttons + Date Range (Mobile: Side-by-side & Center aligned | PC: Side-by-side & Center aligned) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-5 lg:gap-6 xl:gap-7 w-full px-0.5">
          
          {/* Left: Button System Track with 3 visible months + small scroll arrow on mobile */}
          <div className="flex items-center gap-0.5 md:gap-2 shrink-0 min-w-0">
            <div 
              ref={scrollTrackRef}
              onScroll={handleTrackScroll}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 xl:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 w-[152px] max-w-[152px] md:w-auto md:max-w-none shrink-0 min-w-0 touch-pan-x overscroll-x-contain"
            >
              {MONTHS_LIST.map((m) => {
                const isSelected = selectedMonth === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-active={isSelected ? "true" : "false"}
                    onClick={() => onSelectMonth(m.id)}
                    className={cn(
                      "px-1.5 py-1 sm:px-2 sm:py-1 md:px-3.5 md:py-1.5 rounded-[2px] text-[9.5px] sm:text-[10.5px] md:text-xs xl:text-[13px] font-black uppercase tracking-wide md:tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-0.5 md:gap-1 shrink-0 select-none",
                      isSelected
                        ? "bg-white text-slate-900 dark:bg-white dark:text-slate-900 shadow-sm"
                        : "bg-slate-800/70 dark:bg-slate-800/70 text-slate-300 dark:text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50"
                    )}
                  >
                    <span>{m.short}</span>
                    {m.isLive && (
                      <span className={cn(
                        "inline-flex items-center gap-0.5 ml-0.5 text-[8px] sm:text-[9px] md:text-[10px] xl:text-[11px] font-black tracking-tight",
                        isSelected ? "text-red-600" : "text-red-400"
                      )}>
                        <span>(LIVE</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.95)] animate-pulse shrink-0 mx-0.5" />
                        <span>)</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Very small arrow indicator after the 3 visible months on mobile */}
            <button
              type="button"
              onClick={() => {
                if (scrollTrackRef.current) {
                  const container = scrollTrackRef.current;
                  if (isAtEnd) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                  } else {
                    container.scrollBy({ left: 48, behavior: 'smooth' });
                  }
                }
              }}
              className="md:hidden flex items-center justify-center w-3.5 h-5 text-slate-400 dark:text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 select-none -ml-0.5"
              aria-label={isAtEnd ? "Scroll back to latest months" : "Scroll more months"}
            >
              <svg 
                className={cn("w-2.5 h-2.5 transition-transform duration-200", isAtEnd && "rotate-180")} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right: Date Range (Mobile: Frosted Glass Badge "01 - 21 NOV, 2026 (18 DAYS)" | PC: Unboxed Side-by-Side) */}
          {dateInfo && (
            <>
              {/* Mobile View: Frosted Glass / Half-transparent Shape */}
              <div className="md:hidden flex items-center justify-center shrink-0 select-none">
                <div className="inline-flex items-center px-1.5 py-0.5 min-[360px]:px-2 min-[360px]:py-0.5 sm:px-2.5 sm:py-1 rounded-[2px] bg-slate-900/40 dark:bg-white/[0.07] backdrop-blur-md border border-slate-700/50 dark:border-white/10 shadow-xs">
                  <span className="text-[9px] min-[360px]:text-[9.5px] font-bold text-[var(--color-primary)] uppercase tracking-tight whitespace-nowrap">
                    {formattedMobileDateRange}
                  </span>
                  {workingDays !== null && workingDays !== undefined && (
                    <span className="text-[8.5px] min-[360px]:text-[9px] font-bold text-slate-700 dark:text-slate-300 ml-1 whitespace-nowrap tracking-tight">
                      ({workingDays} {workingDays === 1 ? 'DAY' : 'DAYS'})
                    </span>
                  )}
                </div>
              </div>

              {/* PC View: Unboxed side-by-side */}
              <div className="hidden md:flex items-center justify-start gap-2 shrink-0 select-none leading-tight whitespace-nowrap">
                <div className="text-[13.5px] xl:text-[14.5px] font-extrabold text-[var(--color-primary)] uppercase tracking-tight whitespace-nowrap">
                  {dateInfo.isRange ? (
                    <span>
                      {dateInfo.startDay} {dateInfo.startMonthShort} - {dateInfo.endDay} {dateInfo.endMonthShort}, {dateInfo.year}
                    </span>
                  ) : (
                    <span>
                      {dateInfo.startDay} {dateInfo.endMonthShort}, {dateInfo.year}
                    </span>
                  )}
                </div>
                {workingDays !== null && workingDays !== undefined && (
                  <div className="text-[12px] xl:text-[13px] font-black text-[var(--color-text-muted)] tracking-wider whitespace-nowrap">
                    ({workingDays} {workingDays === 1 ? 'DAY' : 'DAYS'})
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Row 2: Underneath both, centered comparing subline in matching grey color */}
        {isPastMonth && (
          <div className="w-full text-center mt-1.5 sm:mt-2 pt-1 border-t border-[var(--color-border)]/40 md:border-t-0 md:pt-1 select-none">
            <p className="text-[9.5px] sm:text-[10.5px] md:text-xs xl:text-[13px] text-[var(--color-text-muted)] font-medium leading-tight">
              Comparing {selectedObj.short} (same days) with current month (NOV)
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
