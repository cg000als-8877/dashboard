"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from '@/components/layout/Sidebar';
import { useLanguage } from '@/components/providers/LanguageProvider';

const MONTHS_LIST = [
  { id: 'current', short: 'NOV', bnShort: 'নভে', full: 'NOVEMBER', bnFull: 'নভেম্বর', isLive: true, key: 'live' },
  { id: 'october', short: 'OCT', bnShort: 'অক্টো', full: 'OCTOBER', bnFull: 'অক্টোবর', isLive: false, key: '2026-10' },
  { id: 'september', short: 'SEP', bnShort: 'সেপ্টে', full: 'SEPTEMBER', bnFull: 'সেপ্টেম্বর', isLive: false, key: '2026-09' },
  { id: 'august', short: 'AUG', bnShort: 'আগস্ট', full: 'AUGUST', bnFull: 'আগস্ট', isLive: false, key: '2026-08' },
  { id: 'july', short: 'JUL', bnShort: 'জুলাই', full: 'JULY', bnFull: 'জুলাই', isLive: false, key: '2026-07' },
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
  const { isBangla, toDigits } = useLanguage();

  if (isArchive) return null;

  const currentMonthIdx = MONTHS_LIST.findIndex(m => m.id === selectedMonth);
  const selectedObj = MONTHS_LIST[currentMonthIdx] || MONTHS_LIST[0];

  const getMonthShort = (monthStr) => {
    if (!monthStr) return '';
    const upper = monthStr.toUpperCase();
    if (!isBangla) return upper;
    if (upper.startsWith('NOV')) return 'নভে';
    if (upper.startsWith('OCT')) return 'অক্টো';
    if (upper.startsWith('SEP')) return 'সেপ্টে';
    if (upper.startsWith('AUG')) return 'আগস্ট';
    if (upper.startsWith('JUL')) return 'জুলাই';
    return upper;
  };

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
      <div className="w-full bg-[var(--color-surface)]/70 md:bg-transparent backdrop-blur-md md:backdrop-blur-none rounded-2xl md:rounded-none p-2.5 sm:p-3 md:p-0 border border-[var(--color-border)] md:border-0 shadow-xs md:shadow-none transition-all duration-300">
        
        {/* Row 1: Month Capsules + Date Range (Mobile: Justified between | PC: Side-by-side & Center aligned) */}
        <div className="flex items-center justify-between md:justify-center gap-2 md:gap-5 lg:gap-6 xl:gap-7 w-full">
          
          {/* Left: Capsule System Track */}
          <div 
            ref={scrollTrackRef}
            className="flex items-center gap-1 sm:gap-1.5 md:gap-2 xl:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 max-w-[215px] min-[390px]:max-w-[230px] md:max-w-none shrink md:shrink-0 min-w-0"
          >
            {MONTHS_LIST.map((m) => {
              const isSelected = selectedMonth === m.id;
              const displayShort = isBangla ? m.bnShort : m.short;
              return (
                <button
                  key={m.id}
                  type="button"
                  data-active={isSelected ? "true" : "false"}
                  onClick={() => onSelectMonth(m.id)}
                  className={cn(
                    "px-2 sm:px-2.5 py-1 sm:py-1.5 md:px-3.5 md:py-1.5 rounded-full text-[10px] sm:text-[11px] md:text-xs xl:text-[13px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-0.5 md:gap-1 shrink-0 select-none",
                    isSelected
                      ? "bg-white text-slate-900 dark:bg-white dark:text-slate-900 shadow-md scale-[1.02]"
                      : "bg-slate-800/70 dark:bg-slate-800/70 text-slate-300 dark:text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50"
                  )}
                >
                  <span>{displayShort}</span>
                  {m.isLive && (
                    <span className={cn(
                      "inline-flex items-center gap-0.5 ml-0.5 md:ml-1 text-[8.5px] sm:text-[9.5px] md:text-[10px] xl:text-[11px] font-black tracking-tight",
                      isSelected ? "text-red-600" : "text-red-400"
                    )}>
                      <span>(LIVE</span>
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.95)] animate-pulse shrink-0 mx-0.5" />
                      <span>)</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Date Range: Right-aligned on mobile, beside capsules and left-aligned on PC (side-by-side with days count) */}
          {dateInfo && (
            <div className="text-right md:text-left shrink-0 select-none leading-tight pl-1.5 md:pl-0 flex flex-col md:flex-row md:items-center md:gap-2">
              <div className="text-[10px] sm:text-[11px] md:text-[13.5px] xl:text-[14.5px] font-extrabold text-[var(--color-primary)] uppercase tracking-tight whitespace-nowrap">
                {dateInfo.isRange ? (
                  <span>
                    {isBangla ? toDigits(dateInfo.startDay) : dateInfo.startDay} {getMonthShort(dateInfo.startMonthShort)} - {isBangla ? toDigits(dateInfo.endDay) : dateInfo.endDay} {getMonthShort(dateInfo.endMonthShort)}, {isBangla ? toDigits(dateInfo.year) : dateInfo.year}
                  </span>
                ) : (
                  <span>
                    {isBangla ? toDigits(dateInfo.startDay) : dateInfo.startDay} {getMonthShort(dateInfo.endMonthShort)}, {isBangla ? toDigits(dateInfo.year) : dateInfo.year}
                  </span>
                )}
              </div>
              {workingDays !== null && workingDays !== undefined && (
<<<<<<< Updated upstream
                <div className="text-[8.5px] sm:text-[9.5px] md:text-[12px] xl:text-[13px] font-extrabold text-[var(--color-text-muted)] tracking-wider whitespace-nowrap">
                  ({workingDays} {workingDays === 1 ? 'DAY' : 'DAYS'})
=======
                <div className="text-[8.5px] sm:text-[9.5px] font-extrabold text-[var(--color-text-muted)] tracking-wider">
                  ({isBangla ? toDigits(workingDays) : workingDays} {isBangla ? 'দিন' : (workingDays === 1 ? 'DAY' : 'DAYS')})
>>>>>>> Stashed changes
                </div>
              )}
            </div>
          )}

        </div>

        {/* Row 2: Underneath both, centered comparing subline in matching grey color */}
        {isPastMonth && (
<<<<<<< Updated upstream
          <div className="w-full text-center mt-1.5 sm:mt-2 pt-1 border-t border-[var(--color-border)]/40 md:border-t-0 md:pt-1 select-none">
            <p className="text-[9.5px] sm:text-[10.5px] md:text-xs xl:text-[13px] text-[var(--color-text-muted)] font-medium leading-tight">
              Comparing {selectedObj.short} (same days) with current month (NOV)
=======
          <div className="w-full text-center mt-1.5 sm:mt-2 pt-1 border-t border-[var(--color-border)]/40 select-none">
            <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-muted)] font-medium leading-tight">
              {isBangla 
                ? `চলতি মাস (নভে)-এর সাথে ${selectedObj.bnShort}-এর (একই দিন) তুলনা`
                : `Comparing ${selectedObj.short} (same days) with current month (NOV)`}
>>>>>>> Stashed changes
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
