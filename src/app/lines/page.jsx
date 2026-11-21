"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { Card } from '@/components/ui/Card';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { LinesSkeleton } from '@/components/ui/Skeletons';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';
import { cn } from '@/components/layout/Sidebar';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Formats date range as e.g. FROM "01 SEP TO 02 SEP, 2026" with highlight (all uppercase)
function formatDateRangeInfo(startDateStr, endDateStr, overrideMonth, overrideYear) {
  if (overrideMonth && overrideYear) {
    const isNov = overrideMonth.toLowerCase().startsWith('nov');
    const isOct = overrideMonth.toLowerCase().startsWith('oct');
    const isSep = overrideMonth.toLowerCase().startsWith('sep');
    const isAug = overrideMonth.toLowerCase().startsWith('aug');
    const isJul = overrideMonth.toLowerCase().startsWith('jul');
    if (isNov) {
      return {
        isRange: true,
        startDay: '01',
        endDay: '30',
        startMonthShort: 'NOV',
        endMonthShort: 'NOV',
        year: overrideYear
      };
    }
    if (isOct) {
      return {
        isRange: true,
        startDay: '01',
        endDay: '31',
        startMonthShort: 'OCT',
        endMonthShort: 'OCT',
        year: overrideYear
      };
    }
    if (isSep) {
      return {
        isRange: true,
        startDay: '01',
        endDay: '30',
        startMonthShort: 'SEP',
        endMonthShort: 'SEP',
        year: overrideYear
      };
    }
    if (isAug) {
      return {
        isRange: true,
        startDay: '01',
        endDay: '31',
        startMonthShort: 'AUG',
        endMonthShort: 'AUG',
        year: overrideYear
      };
    }
    if (isJul) {
      return {
        isRange: true,
        startDay: '01',
        endDay: '31',
        startMonthShort: 'JUL',
        endMonthShort: 'JUL',
        year: overrideYear
      };
    }
  }

  if (!startDateStr || !endDateStr) {
    const m = (overrideMonth || 'OCT').slice(0, 3).toUpperCase();
    return {
      isRange: false,
      startDay: '01',
      endDay: '01',
      startMonthShort: m,
      endMonthShort: m,
      year: overrideYear || '2026'
    };
  }

  try {
    const startD = parseISO(startDateStr);
    const endD = parseISO(endDateStr);
    const startDay = format(startD, 'dd');
    const endDay = format(endD, 'dd');
    const startMonthShort = format(startD, 'MMM').toUpperCase();
    const endMonthShort = format(endD, 'MMM').toUpperCase();
    const year = format(endD, 'yyyy');
    const isRange = startDateStr !== endDateStr;

    return {
      isRange,
      startDay,
      endDay,
      startMonthShort,
      endMonthShort,
      year
    };
  } catch (e) {
    return {
      isRange: false,
      startDay: '01',
      endDay: '01',
      startMonthShort: 'SEP',
      endMonthShort: 'SEP',
      year: '2026'
    };
  }
}

function LinesDateRange({ dateInfo, workingDays = null, className = "" }) {
  if (!dateInfo) return null;
  const { isRange, startDay, endDay, startMonthShort, endMonthShort, year } = dateInfo;

  return (
    <span className={cn("inline-flex items-center justify-center sm:justify-start flex-wrap whitespace-nowrap text-[10px] sm:text-[11.5px] font-bold tracking-tight text-[var(--color-primary)] leading-tight uppercase select-none", className)}>
      {isRange ? (
        <span>{startDay} {startMonthShort} - {endDay} {endMonthShort}, {year}</span>
      ) : (
        <span>{startDay} {endMonthShort}, {year}</span>
      )}
      {workingDays !== null && workingDays !== undefined && (
        <span className="font-bold ml-1 tracking-wider opacity-90">
          ({workingDays} {workingDays === 1 ? 'DAY' : 'DAYS'})
        </span>
      )}
    </span>
  );
}

const MONTHS_LIST = [
  { id: 'current', short: 'NOV', full: 'NOVEMBER', isLive: true, key: 'live' },
  { id: 'october', short: 'OCT', full: 'OCTOBER', isLive: false, key: '2026-10' },
  { id: 'september', short: 'SEP', full: 'SEPTEMBER', isLive: false, key: '2026-09' },
  { id: 'august', short: 'AUG', full: 'AUGUST', isLive: false, key: '2026-08' },
  { id: 'july', short: 'JUL', full: 'JULY', isLive: false, key: '2026-07' },
];

export default function ProductionLinesPage() {
  const [selectedMonthTab, setSelectedMonthTab] = useState('current');
  const [selectedLine, setSelectedLine] = useState('A');
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;
    
    // Check horizontal swipe threshold (minimum 30px motion where horizontal exceeds vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      const activeIds = currentLines.filter(l => (l.totalProduction || 0) > 0 || (l.totalCost || 0) > 0).map(l => l.id);
      const linesOrder = activeIds.length > 0 ? activeIds : ['A', 'B', 'C'];
      const currentIndex = linesOrder.indexOf(selectedLine);
      
      if (deltaX < 0) {
        // Swiped left -> Advance to next line
        if (currentIndex < linesOrder.length - 1) {
          setSelectedLine(linesOrder[currentIndex + 1]);
        }
      } else if (deltaX > 0) {
        // Swiped right -> Go back to previous line
        if (currentIndex > 0) {
          setSelectedLine(linesOrder[currentIndex - 1]);
        }
      }
    }
    
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Load datasets for Live (November), October archive, September archive, August archive, and July archive
  const { rawEngine: liveEngine, stats: liveStats, dailyTrends: liveDailyTrends, lines: liveLines, loading: liveLoading, error: liveError } = useKpiData('live');
  const { rawEngine: octoberEngine, stats: octoberStats, lines: octoberLines } = useKpiData('2026-10');
  const { rawEngine: septemberEngine, stats: septemberStats, lines: septemberLines } = useKpiData('2026-09');
  const { rawEngine: augustEngine, stats: augustStats, lines: augustLines } = useKpiData('2026-08');
  const { rawEngine: julyEngine, stats: julyStats, lines: julyLines } = useKpiData('2026-07');

  // Active dataset determination
  const isOctober = selectedMonthTab === 'october';
  const isSeptember = selectedMonthTab === 'september';
  const isAugust = selectedMonthTab === 'august';
  const isJuly = selectedMonthTab === 'july';
  const isLive = selectedMonthTab === 'current';

  const currentStats = isOctober ? (octoberStats || liveStats) : (isSeptember ? (septemberStats || liveStats) : (isAugust ? (augustStats || liveStats) : (isJuly ? (julyStats || liveStats) : liveStats)));
  const currentLines = isOctober ? (octoberLines || liveLines || []) : (isSeptember ? (septemberLines || liveLines || []) : (isAugust ? (augustLines || liveLines || []) : (isJuly ? (julyLines || liveLines || []) : (liveLines || []))));
  const activeMonthName = isOctober ? 'OCTOBER' : (isSeptember ? 'SEPTEMBER' : (isAugust ? 'AUGUST' : (isJuly ? 'JULY' : 'NOVEMBER')));
  const activeMonthKey = isOctober ? '2026-10' : (isSeptember ? '2026-09' : (isAugust ? '2026-08' : (isJuly ? '2026-07' : 'live')));

  const startDate = liveDailyTrends?.length > 0 ? liveDailyTrends[0].date : null;
  const endDate = liveDailyTrends?.length > 0 ? liveDailyTrends[liveDailyTrends.length - 1].date : null;

  const activeDateInfo = useMemo(() => {
    if (isOctober) return formatDateRangeInfo(null, null, 'october', '2026');
    if (isSeptember) return formatDateRangeInfo(null, null, 'september', '2026');
    if (isAugust) return formatDateRangeInfo(null, null, 'august', '2026');
    if (isJuly) return formatDateRangeInfo(null, null, 'july', '2026');
    return formatDateRangeInfo(startDate, endDate);
  }, [isOctober, isSeptember, isAugust, isJuly, startDate, endDate]);

  if (liveLoading && !liveStats) {
    return <LinesSkeleton />;
  }

  if (liveError) {
    return (
      <div className="text-rose-500 text-center mt-20 font-medium bg-[rgba(255,0,0,0.1)] p-4 rounded-xl border border-rose-500/20">
        Error loading production lines: {liveError}
      </div>
    );
  }

  const activeFloorLines = currentLines.filter(l => (l.totalProduction || 0) > 0 || (l.totalCost || 0) > 0);
  const profitableCount = activeFloorLines.filter(l => (l.netProfit || 0) >= 0).length;
  const criticalCount = activeFloorLines.filter(l => (l.netProfit || 0) < 0).length;
  const inactiveCount = currentLines.filter(l => (l.totalProduction || 0) === 0 && (l.totalCost || 0) === 0).length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-[fade-up_0.4s_ease-out_both] -mx-1.5 sm:mx-0">
      
      {/* ── 1. PAGE HEADER & TITLE ───────────────────────────────────── */}
      <header className="flex flex-col items-center text-center md:items-start md:text-left mb-3 sm:mb-4 relative z-10 px-1.5 sm:px-0">
        <h1 className="text-[24px] sm:text-[30px] md:text-[38px] font-black tracking-normal leading-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
          Production Lines
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-muted)] font-normal tracking-normal mt-0.5 md:mt-1 max-w-2xl">
          Floor telemetry, daily output metrics, and cost recovery tracking across all active lines.
        </p>
      </header>

      {/* ── 2. FACTORY FLOOR SUMMARY STRIP ───────────────────────────── */}
      {currentStats && (
        <div className="relative overflow-hidden rounded-2xl bg-[var(--color-bg-card)] p-3.5 sm:p-5 shadow-lg border-0">
          <div className="absolute top-0 right-0 w-64 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-3 sm:gap-4">
            
            {/* Status Header: Title, Date Context and Badges */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between text-center sm:text-left gap-2 sm:gap-2 w-full">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-normal text-[var(--color-text-main)]">
                  Floor Status ({activeMonthName})
                </h2>
                <div className="mt-0.5 flex justify-center sm:justify-start">
                  <LinesDateRange dateInfo={activeDateInfo} workingDays={currentStats?.workingDays} />
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-1.5 flex-wrap">
                {profitableCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[var(--color-success-text)] bg-[var(--color-success-glow)] px-2.5 py-0.5 rounded-md border-0">
                    <CheckCircle2 size={12} /> {profitableCount} {profitableCount === 1 ? 'Optimal Line' : 'Optimal Lines'}
                  </span>
                )}
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-md border-0">
                    <AlertTriangle size={12} /> {criticalCount} {criticalCount === 1 ? 'Critical Line' : 'Critical Lines'}
                  </span>
                )}
                {inactiveCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-400 bg-zinc-500/15 px-2.5 py-0.5 rounded-md border-0">
                    <Clock size={12} /> {inactiveCount} {inactiveCount === 1 ? 'Inactive Line' : 'Inactive Lines'}
                  </span>
                )}
              </div>
            </div>

            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
              
              {/* Total Factory Output */}
              <div className="bg-[var(--color-surface)] border-0 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center">
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Output
                </span>
                <span className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] mt-0.5 truncate">
                  <AnimatedNumber value={Math.round(currentStats.totalProduction || 0)} />{' '}
                  <span className="text-[9px] text-[var(--color-text-muted)] font-normal">PCS</span>
                </span>
              </div>

              {/* Total Income */}
              <div className="bg-[var(--color-surface)] border-0 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center">
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Income
                </span>
                <span className="text-xs sm:text-sm md:text-base font-black text-[var(--color-primary)] mt-0.5 truncate">
                  <AnimatedNumber value={Math.round(currentStats.totalIncome || 0)} prefix="BDT " />
                </span>
              </div>

              {/* Total Cost */}
              <div className="bg-[var(--color-surface)] border-0 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center">
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Cost
                </span>
                <span className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] mt-0.5 truncate">
                  <AnimatedNumber value={Math.round(currentStats.totalCost || 0)} prefix="BDT " />
                </span>
              </div>

              {/* Net Profit / Loss */}
              <div className={cn(
                "border-0 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center",
                (currentStats.netProfit || 0) >= 0 
                  ? "bg-[var(--color-success-glow)]/40" 
                  : "bg-[var(--color-danger-glow)]/40"
              )}>
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  {(currentStats.netProfit || 0) >= 0 ? "Net Profit" : "Net Loss"}
                </span>
                <span className={cn(
                  "text-xs sm:text-sm md:text-base font-black mt-0.5 flex items-center gap-1 truncate",
                  (currentStats.netProfit || 0) >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                )}>
                  {(currentStats.netProfit || 0) >= 0 ? <TrendingUp size={13} className="shrink-0" /> : <TrendingDown size={13} className="shrink-0" />}
                  <AnimatedNumber value={Math.abs(Math.round(currentStats.netProfit || 0))} prefix={(currentStats.netProfit || 0) >= 0 ? "+BDT " : "BDT -"} />
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 4. LINE TABS / PILLS (SIDE BY SIDE - ACTIVE LINES ONLY, NO DOTS) ── */}
      {(() => {
        const availableLineIds = activeFloorLines.length > 0 ? activeFloorLines.map(l => l.id) : ['A', 'B', 'C'];
        return (
          <div className="w-full">
            <div 
              className="grid gap-1.5 sm:gap-2.5 p-1 bg-[var(--color-surface)]/70 backdrop-blur-md rounded-2xl border border-[var(--color-border)] shadow-xs"
              style={{ gridTemplateColumns: `repeat(${availableLineIds.length}, minmax(0, 1fr))` }}
            >
              {availableLineIds.map(lineId => {
                const isSelected = selectedLine === lineId;

                return (
                  <button
                    key={lineId}
                    type="button"
                    onClick={() => setSelectedLine(lineId)}
                    className={cn(
                      "py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black uppercase transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center relative",
                      isSelected
                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-md scale-[1.02] z-10"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] bg-transparent"
                    )}
                  >
                    <span>LINE {lineId}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── 5. COMPLETE LINE TELEMETRY IN-PAGE (WITH TOUCH SWIPE GESTURES) ── */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full"
      >
        <LineDetailsContent 
          key={`${selectedLine}-${activeMonthKey}`}
          id={selectedLine}
          month={activeMonthKey}
          isEmbed={true}
          hideEmbedDivider={true}
          backUrl="/lines"
        />
      </div>

    </div>
  );
}
