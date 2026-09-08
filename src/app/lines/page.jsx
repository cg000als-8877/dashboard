"use client";

import React, { useState, useMemo } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { useDensity } from '@/components/providers/DensityProvider';
import { DensitySwitcher } from '@/components/ui/DensitySwitcher';
import { Card } from '@/components/ui/Card';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { LinesSkeleton } from '@/components/ui/Skeletons';
import { cn } from '@/components/layout/Sidebar';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import {
  Factory,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shirt,
  DollarSign,
  Users,
  Target,
  Trophy,
  Zap,
  Activity,
  BarChart2,
  Table2
} from 'lucide-react';

// Formats date range as e.g. FROM "01 SEP TO 02 SEP, 2026" with highlight (all uppercase)
function formatDateRangeInfo(startDateStr, endDateStr, overrideMonth, overrideYear) {
  if (overrideMonth && overrideYear) {
    const isAug = overrideMonth.toLowerCase().startsWith('aug');
    const isJul = overrideMonth.toLowerCase().startsWith('jul');
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
    const m = (overrideMonth || 'SEP').slice(0, 3).toUpperCase();
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

function LinesDateRange({ dateInfo, className = "" }) {
  if (!dateInfo) return null;
  const { isRange, startDay, endDay, startMonthShort, endMonthShort, year } = dateInfo;

  return (
    <span className={cn("inline-flex items-center justify-center whitespace-nowrap text-[11px] sm:text-[12px] md:text-[13px] font-medium tracking-wide text-[var(--color-text-muted)] leading-tight uppercase", className)}>
      <span>FROM&nbsp;</span>
      {isRange ? (
        <>
          <span className="font-extrabold text-[var(--color-primary)] tracking-wide">{startDay} {startMonthShort}</span>
          <span>&nbsp;TO&nbsp;</span>
          <span className="font-extrabold text-[var(--color-primary)] tracking-wide">{endDay} {endMonthShort}, {year}</span>
        </>
      ) : (
        <span className="font-extrabold text-[var(--color-primary)] tracking-wide">{startDay} {endMonthShort}, {year}</span>
      )}
    </span>
  );
}

const LINE_CARD_META = {
  'A': {
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.25)',
    btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30',
    borderClass: 'border-emerald-500/30',
    bgBadge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
  },
  'B': {
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.25)',
    btnClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950/30',
    borderClass: 'border-blue-500/30',
    bgBadge: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
  },
  'C': {
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.25)',
    btnClass: 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/30',
    borderClass: 'border-purple-500/30',
    bgBadge: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30'
  },
  'D': {
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.25)',
    btnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/30',
    borderClass: 'border-amber-500/30',
    bgBadge: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30'
  }
};

export default function ProductionLinesPage() {
  const [selectedMonthTab, setSelectedMonthTab] = useState('current'); // 'current' | 'august' | 'july'
  const [selectedMobileLine, setSelectedMobileLine] = useState('A');
  const { density: globalDensity } = useDensity();
  const [density, setDensityState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lines_density');
      if (stored && ['compact', 'normal', 'detailed'].includes(stored)) return stored;
      if (window.innerWidth < 768) return 'detailed';
    }
    return 'detailed';
  });

  const setDensity = (newDensity) => {
    setDensityState(newDensity);
    try {
      localStorage.setItem('lines_density', newDensity);
    } catch (e) {}
  };

  // Load datasets for Live (September), August archive, and July archive
  const { rawEngine: liveEngine, stats: liveStats, dailyTrends: liveDailyTrends, lines: liveLines, loading: liveLoading, error: liveError } = useKpiData('live');
  const { rawEngine: augustEngine, stats: augustStats, dailyTrends: augustDailyTrends, lines: augustLines, loading: augustLoading } = useKpiData('2026-08');
  const { rawEngine: julyEngine, stats: julyStats, dailyTrends: julyDailyTrends, lines: julyLines, loading: julyLoading } = useKpiData('2026-07');

  // Active dataset determination
  const isAugust = selectedMonthTab === 'august';
  const isJuly = selectedMonthTab === 'july';
  const isLive = selectedMonthTab === 'current';

  const currentStats = isAugust ? (augustStats || liveStats) : (isJuly ? (julyStats || liveStats) : liveStats);
  const currentLines = isAugust ? (augustLines || liveLines || []) : (isJuly ? (julyLines || liveLines || []) : (liveLines || []));
  const currentEngine = isAugust ? augustEngine : (isJuly ? julyEngine : liveEngine);
  const activeMonthName = isAugust ? 'AUGUST' : (isJuly ? 'JULY' : 'SEPTEMBER');

  const startDate = liveDailyTrends?.length > 0 ? liveDailyTrends[0].date : null;
  const endDate = liveDailyTrends?.length > 0 ? liveDailyTrends[liveDailyTrends.length - 1].date : null;

  const activeDateInfo = useMemo(() => {
    if (isAugust) return formatDateRangeInfo(null, null, 'august', '2026');
    if (isJuly) return formatDateRangeInfo(null, null, 'july', '2026');
    return formatDateRangeInfo(startDate, endDate);
  }, [isAugust, isJuly, startDate, endDate]);

  // Compute Floor Leadership Rankings across lines (Only active lines with actual production and costs qualify)
  const floorRankings = useMemo(() => {
    if (!currentLines || currentLines.length === 0) return {};
    const activeLines = currentLines.filter(l => (l.totalProduction || 0) > 0 || (l.totalCost || 0) > 0);
    if (activeLines.length === 0) return {};

    // Top Output requires > 0 production
    const sortedByOutput = [...activeLines]
      .filter(l => (l.totalProduction || 0) > 0)
      .sort((a, b) => (b.totalProduction || 0) - (a.totalProduction || 0));

    // Profit Leader MUST have strictly positive profit (> 0) and active production
    const sortedByProfit = [...activeLines]
      .filter(l => (l.netProfit || 0) > 0 && (l.totalProduction || 0) > 0)
      .sort((a, b) => (b.netProfit || 0) - (a.netProfit || 0));

    // Top Efficiency requires positive cost recovery and active production
    const sortedByRecovery = [...activeLines]
      .filter(l => parseFloat(l.monthCostRecovery || 0) > 0 && (l.totalProduction || 0) > 0)
      .sort((a, b) => parseFloat(b.monthCostRecovery || 0) - parseFloat(a.monthCostRecovery || 0));

    return {
      topOutputId: sortedByOutput[0]?.id || null,
      topProfitId: sortedByProfit[0]?.id || null,
      topRecoveryId: sortedByRecovery[0]?.id || null
    };
  }, [currentLines]);

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
    <div className="space-y-6 sm:space-y-8 animate-[fade-up_0.4s_ease-out_both] pb-12">
      
      {/* ── 1. PAGE HEADER & TITLE ───────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center text-center pt-2 sm:pt-4">
        <h1 className="text-[22px] sm:text-[28px] md:text-[36px] font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] leading-tight">
          Production Lines
        </h1>
        <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] font-medium tracking-wide uppercase mt-1">
          Real-time performance, output, worker telemetry, and unit economics for all factory lines
        </p>

        {/* Month Switcher Tabs & Density Switcher */}
        <div className="flex flex-wrap justify-center items-center gap-2.5 mt-4 mb-2 relative z-10">
          <div className="inline-flex p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl gap-1 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => setSelectedMonthTab('current')}
              className={cn(
                "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none",
                isLive
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
              )}
            >
              <span>SEPTEMBER</span>
              <span className="text-[8.5px] sm:text-[9.5px] text-rose-500 font-black tracking-wide">(LIVE)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMonthTab('august')}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none",
                isAugust
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
              )}
            >
              AUGUST
            </button>

            <button
              type="button"
              onClick={() => setSelectedMonthTab('july')}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none",
                isJuly
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
              )}
            >
              JULY
            </button>
          </div>

          <DensitySwitcher value={density} onChange={setDensity} />
        </div>

        {/* Unified Date Range Subtitle */}
        <div className="flex justify-center items-center w-full mt-1 mb-2">
          <LinesDateRange dateInfo={activeDateInfo} />
        </div>
      </div>

      {/* ── 2. FACTORY FLOOR SUMMARY STRIP ───────────────────────────── */}
      {currentStats && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Left Status Block */}
            <div className="flex items-center gap-3 w-full lg:w-auto pb-3 lg:pb-0 border-b lg:border-b-0 border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                <Factory size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">
                  Floor Status ({activeMonthName})
                </span>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {profitableCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[var(--color-success-text)] bg-[var(--color-success-glow)] px-2.5 py-0.5 rounded-md border border-[rgba(16,185,129,0.2)]">
                      <CheckCircle2 size={12} /> {profitableCount} Optimal
                    </span>
                  )}
                  {criticalCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-md border border-rose-500/30">
                      <AlertTriangle size={12} /> {criticalCount} Critical
                    </span>
                  )}
                  {inactiveCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-400 bg-zinc-500/15 px-2.5 py-0.5 rounded-md border border-zinc-500/30">
                      <Clock size={12} /> {inactiveCount} Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full lg:w-auto flex-1 lg:max-w-3xl">
              
              {/* Total Factory Output */}
              <div className="bg-[var(--color-surface)]/60 border border-[var(--color-border)]/50 rounded-xl p-2.5 sm:p-3 flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Output
                </span>
                <span className="text-sm sm:text-base font-black text-[var(--color-text-main)] mt-0.5">
                  <AnimatedNumber value={Math.round(currentStats.totalProduction || 0)} />{' '}
                  <span className="text-[10px] text-[var(--color-text-muted)] font-normal">PCS</span>
                </span>
              </div>

              {/* Total Income */}
              <div className="bg-[var(--color-surface)]/60 border border-[var(--color-border)]/50 rounded-xl p-2.5 sm:p-3 flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Income
                </span>
                <span className="text-sm sm:text-base font-black text-[var(--color-primary)] mt-0.5">
                  <AnimatedNumber value={Math.round(currentStats.totalIncome || 0)} prefix="BDT " />
                </span>
              </div>

              {/* Total Cost */}
              <div className="bg-[var(--color-surface)]/60 border border-[var(--color-border)]/50 rounded-xl p-2.5 sm:p-3 flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Cost
                </span>
                <span className="text-sm sm:text-base font-black text-amber-500 mt-0.5">
                  <AnimatedNumber value={Math.round(currentStats.totalCost || 0)} prefix="BDT " />
                </span>
              </div>

              {/* Net Profit / Loss */}
              <div className={cn(
                "border rounded-xl p-2.5 sm:p-3 flex flex-col",
                (currentStats.netProfit || 0) >= 0 
                  ? "bg-[var(--color-success-glow)]/40 border-[rgba(16,185,129,0.25)]" 
                  : "bg-[var(--color-danger-glow)]/40 border-[rgba(255,59,48,0.25)]"
              )}>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  {(currentStats.netProfit || 0) >= 0 ? "Net Profit" : "Net Loss"}
                </span>
                <span className={cn(
                  "text-sm sm:text-base font-black mt-0.5 flex items-center gap-1",
                  (currentStats.netProfit || 0) >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                )}>
                  {(currentStats.netProfit || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <AnimatedNumber value={Math.abs(Math.round(currentStats.netProfit || 0))} prefix={(currentStats.netProfit || 0) >= 0 ? "+BDT " : "BDT -"} />
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 3. COMPACT EXECUTIVE SPREADSHEET TABLE (When Density === 'compact') ───────────────────── */}
      {density === 'compact' ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[9.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] select-none">
              <tr>
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-3">Active Item</th>
                <th className="py-3 px-3 text-right">Workers</th>
                <th className="py-3 px-3 text-right">Month Output</th>
                <th className="py-3 px-3 text-right">Total Income</th>
                <th className="py-3 px-3 text-right">Total Cost</th>
                <th className="py-3 px-3 text-right">Net Profit</th>
                <th className="py-3 px-3 text-right">Recovery</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/50">
              {currentLines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => {
                const meta = LINE_CARD_META[line.id.toUpperCase()] || LINE_CARD_META['A'];
                const isInactive = (line.totalProduction || 0) === 0 && (line.totalCost || 0) === 0;
                const isProfitable = !isInactive && (line.netProfit || 0) >= 0;
                const detailsUrl = isAugust ? `/archive/2026-08/lines/${line.id}` : (isJuly ? `/archive/2026-07/lines/${line.id}` : `/lines/${line.id}`);

                return (
                  <tr key={line.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    <td className="py-3 px-4 font-bold flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center text-white shrink-0" style={{ backgroundColor: meta.color }}>
                        {line.id}
                      </span>
                      <span className="text-[var(--color-text-main)] font-extrabold">{line.name}</span>
                    </td>
                    <td className="py-3 px-3 text-[var(--color-text-muted)] font-medium">
                      {isInactive ? 'Standby / Idle' : (line.item || 'Standard Garment')}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[var(--color-text-main)]">
                      {isInactive ? '0' : (line.averageWorkers || line.lastDay?.worker_count || 50)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[var(--color-text-main)]">
                      {(line.totalProduction || 0).toLocaleString()} <span className="text-[9px] text-[var(--color-text-muted)] font-normal">PCS</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[var(--color-primary)]">
                      BDT {(line.totalIncome || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-500">
                      BDT {(line.totalCost || 0).toLocaleString()}
                    </td>
                    <td className={cn("py-3 px-3 text-right font-black", isInactive ? "text-[var(--color-text-muted)]" : isProfitable ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]")}>
                      {isInactive ? 'BDT 0' : (isProfitable ? `+BDT ${(line.netProfit || 0).toLocaleString()}` : `BDT ${(line.netProfit || 0).toLocaleString()}`)}
                    </td>
                    <td className={cn("py-3 px-3 text-right font-bold", isInactive ? "text-[var(--color-text-muted)]" : parseFloat(line.monthCostRecovery || 0) >= 100 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400")}>
                      {line.monthCostRecovery || '0.0'}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isInactive ? (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border border-zinc-500/30">
                          Idle
                        </span>
                      ) : isProfitable ? (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.25)]">
                          Optimal
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                          Critical
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={detailsUrl} className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:underline uppercase tracking-wider">
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* ── 4. MOBILE SEGMENTED LINE TABS ────────────────────────────── */}
          <div className="md:hidden flex justify-center items-center w-full px-0.5">
            <div className="grid grid-cols-4 w-full p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl gap-1 shadow-sm">
              {['A', 'B', 'C', 'D'].map(lineId => {
                const isSelected = selectedMobileLine === lineId;
                const meta = LINE_CARD_META[lineId] || { color: '#3B82F6' };
                return (
                  <button
                    key={lineId}
                    type="button"
                    onClick={() => setSelectedMobileLine(lineId)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-black uppercase transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center",
                      isSelected
                        ? "bg-[var(--color-bg-card)] shadow-sm border border-[var(--color-border)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                    )}
                    style={isSelected ? { color: meta.color, borderColor: `${meta.color}60` } : {}}
                  >
                    <span>LINE {lineId}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 5. PRODUCTION LINES GRID (Detailed & Normal Modes) ──────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {currentLines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => {
              const meta = LINE_CARD_META[line.id.toUpperCase()] || LINE_CARD_META['A'];
              const isHiddenOnMobile = selectedMobileLine !== line.id;
              
              // Accurate active vs inactive vs profitability checks
              const isInactive = (line.totalProduction || 0) === 0 && (line.totalCost || 0) === 0;
              const isProfitable = !isInactive && (line.netProfit || 0) >= 0;
              const lastDayDateStr = line.lastDayDate ? format(parseISO(line.lastDayDate), 'dd MMM, yyyy') : '02 Sep, 2026';

              // Extract last 7 active production entries for 7-day sparkline
              const lineHistory = (currentEngine?.kpiData?.dailyProduction || [])
                .filter(d => d.line_id === line.id && d.status === 'ACTIVE' && (d.production_qty || 0) > 0)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-7);

              const maxSparklineQty = lineHistory.length > 0 
                ? Math.max(...lineHistory.map(h => h.production_qty || 0), 1)
                : 1000;

              // Unit economics & productivity calculations
              const lastDay = line.lastDay || null;
              const lastDayOutput = line.lastDayOutput || 0;
              const lastDayCost = line.lastDayCost || 0;
              const lastDayIncome = line.lastDayIncome || 0;
              const workerCount = lastDay?.worker_count || line.averageWorkers || 0;
              const pcsPerOperator = (workerCount > 0 && lastDayOutput > 0) 
                ? (lastDayOutput / workerCount).toFixed(1) 
                : '0.0';

              const cmPerDzn = lastDay?.cm_per_dzn || 1200;
              const cmPerPc = cmPerDzn / 12;
              const breakEvenTarget = (lastDayCost > 0 && cmPerPc > 0)
                ? Math.round(lastDayCost / cmPerPc)
                : 0;

              // Floor Leadership Badges (Only for active producing lines)
              const isTopProfit = !isInactive && floorRankings.topProfitId === line.id;
              const isTopOutput = !isInactive && !isTopProfit && floorRankings.topOutputId === line.id;
              const isTopRecovery = !isInactive && !isTopProfit && !isTopOutput && floorRankings.topRecoveryId === line.id;

              // Target line details URL
              const detailsUrl = isAugust 
                ? `/archive/2026-08/lines/${line.id}` 
                : (isJuly 
                    ? `/archive/2026-07/lines/${line.id}` 
                    : `/lines/${line.id}`);

              return (
                <div 
                  key={line.id} 
                  className={cn("w-full h-full", isHiddenOnMobile && "hidden md:block")}
                >
                  <Card className="relative overflow-hidden w-full h-full p-0 flex flex-col justify-between border border-[var(--color-border)] shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none rounded-[inherit]" />
                    
                    {/* Decorative Top Line Strip */}
                    <div className="w-full h-1" style={{ backgroundColor: meta.color }} />

                    <div className="flex flex-col gap-4 p-4 sm:p-5 relative z-10 flex-1">
                      
                      {/* Line Card Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)]/50 pb-3">
                        
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="text-white px-3 py-1 rounded-full text-xs font-black tracking-wider border"
                            style={{
                              backgroundColor: meta.color,
                              borderColor: `${meta.color}50`
                            }}
                          >
                            LINE {line.id}
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)]">
                            {line.name}
                          </h2>
                        </div>

                        {/* Clean Status & Leadership Badges (Without Dots) */}
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {isTopProfit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
                              <Trophy size={11} />
                              <span>Profit Leader</span>
                            </span>
                          ) : isTopOutput ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                              <Zap size={11} />
                              <span>Top Output</span>
                            </span>
                          ) : isTopRecovery ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
                              <Activity size={11} />
                              <span>Top Efficiency</span>
                            </span>
                          ) : null}

                          {isInactive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border border-zinc-500/30">
                              <Clock size={11} />
                              <span>No Production</span>
                            </span>
                          ) : isProfitable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.25)]">
                              <CheckCircle2 size={11} />
                              <span>Optimal</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              <AlertTriangle size={11} />
                              <span>Critical</span>
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Active Item & Efficiency Bar */}
                      <div className="flex flex-col gap-2 bg-[var(--color-surface)]/50 border border-[var(--color-border)]/60 rounded-xl p-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-muted)]">
                            <Shirt size={13} className="text-[var(--color-primary)]" />
                            <span>Active Item:</span>
                            <span className="text-[var(--color-text-main)] font-bold truncate max-w-[140px] sm:max-w-[180px]">
                              {isInactive ? 'Standby / Idle' : (line.item || 'Standard Garment')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-xs">
                            <span className="text-[var(--color-text-muted)] text-[10px] uppercase">Cost Recovery:</span>
                            <span className={cn(
                              "font-extrabold",
                              isInactive 
                                ? "text-[var(--color-text-muted)]" 
                                : parseFloat(line.monthCostRecovery || 0) >= 100 
                                  ? "text-emerald-700 dark:text-emerald-400" 
                                  : "text-amber-800 dark:text-amber-400"
                            )}>
                              {line.monthCostRecovery || '0.0'}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar towards 100% Cost Recovery */}
                        <div className="w-full bg-[var(--color-surface)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]/40 relative">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isInactive
                                ? "bg-zinc-600/30"
                                : parseFloat(line.monthCostRecovery || 0) >= 100 
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
                                  : "bg-gradient-to-r from-amber-500 to-rose-400"
                            )}
                            style={{ width: `${isInactive ? 0 : Math.min(parseFloat(line.monthCostRecovery || 0), 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* 4-Box Cumulative Month Metrics */}
                      <div>
                        <p className="text-[9.5px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-2">
                          Month Total Summary ({activeMonthName})
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                          
                          {/* Total Output */}
                          <div className="bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-border)] shadow-xs">
                            <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">
                              Total Output
                            </p>
                            <p className="text-sm sm:text-base font-black text-[var(--color-text-main)]">
                              <AnimatedNumber value={line.totalProduction || 0} />
                              <span className="text-[10px] text-[var(--color-text-muted)] font-normal ml-1">PCS</span>
                            </p>
                          </div>

                          {/* Total Income */}
                          <div className="bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-border)] shadow-xs">
                            <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">
                              Total Income
                            </p>
                            <p className="text-sm sm:text-base font-black text-[var(--color-primary)]">
                              <AnimatedNumber value={Math.round(line.totalIncome || 0)} prefix="BDT " />
                            </p>
                          </div>

                          {/* Total Cost */}
                          <div className="bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-border)] shadow-xs">
                            <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">
                              Total Cost
                            </p>
                            <p className="text-sm sm:text-base font-black text-amber-500">
                              <AnimatedNumber value={Math.round(line.totalCost || 0)} prefix="BDT " />
                            </p>
                          </div>

                          {/* Net Profit / Loss / Balance */}
                          <div className={cn(
                            "p-2.5 rounded-xl border shadow-xs",
                            isInactive
                              ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                              : isProfitable 
                                ? "border-[rgba(16,185,129,0.25)] bg-[var(--color-success-glow)]/30" 
                                : "border-[rgba(255,59,48,0.25)] bg-[var(--color-danger-glow)]/30"
                          )}>
                            <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">
                              {isInactive ? "Net Balance" : isProfitable ? "Net Profit" : "Net Loss"}
                            </p>
                            <p className={cn(
                              "text-sm sm:text-base font-black",
                              isInactive
                                ? "text-[var(--color-text-muted)]"
                                : isProfitable 
                                  ? "text-[var(--color-success-text)]" 
                                  : "text-[var(--color-danger-text)]"
                            )}>
                              <AnimatedNumber 
                                value={Math.abs(Math.round(line.netProfit || 0))} 
                                prefix={isInactive ? "BDT " : isProfitable ? "+BDT " : "BDT -"} 
                              />
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* ── 6. RECENT 7-DAY OUTPUT SPARKLINE (Only in Detailed Mode) ────────────────────── */}
                      {density === 'detailed' && (
                        lineHistory.length > 0 ? (
                          <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)]/60 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
                                <BarChart2 size={12} className="text-[var(--color-primary)]" />
                                <span>Recent Output Trend</span>
                              </span>
                              <span className="text-[9.5px] font-bold text-[var(--color-text-secondary)]">
                                Last {lineHistory.length} Days
                              </span>
                            </div>

                            {/* Mini Bar Sparkline */}
                            <div className="flex items-end gap-1.5 h-12 pt-1 pb-0.5 px-1 bg-[var(--color-bg-card)]/60 rounded-lg border border-[var(--color-border)]/40">
                              {lineHistory.map((day, idx) => {
                                const heightPct = Math.max(Math.round(((day.production_qty || 0) / maxSparklineQty) * 100), 12);
                                const dayLabel = format(parseISO(day.date), 'dd MMM');
                                const isDayProfitable = (day.net_profit !== undefined ? day.net_profit : ((day.total_income || 0) - (day.total_cost || 0))) >= 0;

                                return (
                                  <div 
                                    key={day.date || idx}
                                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-default"
                                  >
                                    {/* Hover Tooltip */}
                                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                                      {dayLabel}: {day.production_qty} pcs
                                    </div>

                                    <div 
                                      className={cn(
                                        "w-full rounded-t transition-all duration-300",
                                        isDayProfitable 
                                          ? "bg-emerald-500/70 group-hover:bg-emerald-400" 
                                          : "bg-blue-500/70 group-hover:bg-blue-400"
                                      )}
                                      style={{ height: `${heightPct}%` }}
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between text-[8.5px] text-[var(--color-text-muted)] mt-1 px-1">
                              <span>{format(parseISO(lineHistory[0].date), 'dd MMM')}</span>
                              <span>{format(parseISO(lineHistory[lineHistory.length - 1].date), 'dd MMM')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[var(--color-surface)]/30 border border-[var(--color-border)]/40 rounded-xl p-3 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                            <span className="flex items-center gap-1.5 uppercase font-bold text-[9.5px]">
                              <BarChart2 size={12} className="text-[var(--color-text-muted)]" />
                              <span>Recent Output Trend</span>
                            </span>
                            <span className="text-[9.5px] italic">No active production recorded</span>
                          </div>
                        )
                      )}

                      {/* ── 7. TELEMETRY & PRODUCTIVITY SNAPSHOT ────────────────── */}
                      <div className="bg-[var(--color-surface)]/70 border border-[var(--color-border)] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1">
                            <Clock size={12} className="text-[var(--color-primary)]" />
                            <span>Last Day ({lastDayDateStr})</span>
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                            Recovery: <strong className={cn(
                              isInactive 
                                ? "text-[var(--color-text-muted)]" 
                                : parseFloat(line.lastDayCostRecovery || 0) >= 100 
                                  ? "text-emerald-700 dark:text-emerald-400" 
                                  : "text-amber-800 dark:text-amber-400"
                            )}>{line.lastDayCostRecovery || '0.0'}%</strong>
                          </span>
                        </div>

                        {/* Main 3 Day Numbers */}
                        <div className="grid grid-cols-3 gap-2 text-center mb-2.5">
                          <div className="bg-[var(--color-bg-card)] p-2 rounded-lg border border-[var(--color-border)]/60">
                            <p className="text-[8.5px] text-[var(--color-text-muted)] font-medium uppercase">Day Output</p>
                            <p className="text-xs sm:text-sm font-bold text-[var(--color-text-main)]">
                              {(line.lastDayOutput || 0).toLocaleString()} <span className="text-[8.5px] text-[var(--color-text-muted)] font-normal">PCS</span>
                            </p>
                          </div>

                          <div className="bg-[var(--color-bg-card)] p-2 rounded-lg border border-[var(--color-border)]/60">
                            <p className="text-[8.5px] text-[var(--color-text-muted)] font-medium uppercase">Day Income</p>
                            <p className="text-xs sm:text-sm font-bold text-[var(--color-primary)]">
                              BDT {(line.lastDayIncome || 0).toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-[var(--color-bg-card)] p-2 rounded-lg border border-[var(--color-border)]/60">
                            <p className="text-[8.5px] text-[var(--color-text-muted)] font-medium uppercase">Day Net</p>
                            <p className={cn(
                              "text-xs sm:text-sm font-bold",
                              isInactive || ((line.lastDayOutput || 0) === 0 && (line.lastDayCost || 0) === 0)
                                ? "text-[var(--color-text-muted)]"
                                : (line.lastDayProfit || 0) >= 0 
                                  ? "text-[var(--color-success-text)]" 
                                  : "text-[var(--color-danger-text)]"
                            )}>
                              BDT {(line.lastDayProfit || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Break-Even Target & Productivity Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]/50 text-[10px]">
                          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                            <Target size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Break-Even:</span>
                            <span className="font-bold text-[var(--color-text-main)]">
                              {breakEvenTarget > 0 ? `${breakEvenTarget} PCS` : 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] justify-end">
                            <Users size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Operator Output:</span>
                            <span className="font-bold text-[var(--color-text-main)]">
                              {pcsPerOperator} <span className="text-[8.5px] text-[var(--color-text-muted)]">P/Head</span>
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* ── 8. ACTION BUTTONS (VIEW DETAILS & HOURLY LINK) ─────────── */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 mt-auto pt-1">
                        <Link
                          href={detailsUrl}
                          className={cn(
                            "w-full flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none group",
                            meta.btnClass
                          )}
                        >
                          <span>View Full Details</span>
                          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {isLive && (
                          <Link
                            href="/hourly"
                            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Clock size={13} className="text-[var(--color-primary)]" />
                            <span>Hourly Flow</span>
                          </Link>
                        )}
                      </div>

                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
