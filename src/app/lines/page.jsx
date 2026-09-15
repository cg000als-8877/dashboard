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

function LinesDateRange({ dateInfo, workingDays = null, className = "" }) {
  if (!dateInfo) return null;
  const { isRange, startDay, endDay, startMonthShort, endMonthShort, year } = dateInfo;

  return (
    <span className={cn("inline-flex items-center justify-center flex-wrap whitespace-nowrap text-[13px] sm:text-[14px] md:text-[17px] font-medium tracking-wide text-[var(--color-text-muted)] leading-tight uppercase", className)}>
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
      {workingDays !== null && workingDays !== undefined && (
        <span className="font-bold text-[var(--color-text-secondary)] ml-1.5 tracking-wider">
          ({workingDays} {workingDays === 1 ? 'DAY' : 'DAYS'})
        </span>
      )}
    </span>
  );
}



export default function ProductionLinesPage() {
  const [selectedMonthTab, setSelectedMonthTab] = useState('current'); // 'current' | 'august' | 'july'
  const [selectedMobileLine, setSelectedMobileLine] = useState('A');
  const { density: globalDensity } = useDensity();
  const [density, setDensityState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lines_density');
      if (stored && ['compact', 'normal'].includes(stored)) return stored;
    }
    return 'compact';
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
    <div className="space-y-6 sm:space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      
      {/* ── 1. PAGE HEADER & TITLE ───────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center text-center pt-2 sm:pt-4">
        <h1 className="text-[22px] sm:text-[28px] md:text-[36px] font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] leading-tight">
          Production Lines
        </h1>
        <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] font-medium tracking-wide uppercase mt-1">
          Real-time performance, output, worker telemetry, and unit economics for all factory lines
        </p>

        {/* Month Switcher Tabs & Density Switcher — Strictly Single Row Side-by-Side on all screens */}
        <div className="flex flex-nowrap justify-center items-center gap-1.5 sm:gap-2.5 mt-3 sm:mt-4 mb-2 relative z-10 w-full max-w-full overflow-x-auto hide-scrollbar px-0.5">
          <div className="inline-flex p-0.5 sm:p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md shrink-0">
            <button
              type="button"
              onClick={() => setSelectedMonthTab('current')}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none shrink-0",
                isLive
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
              )}
            >
              <span>SEPTEMBER</span>
              <span className="text-[7.5px] sm:text-[9.5px] text-rose-500 font-black tracking-wide">(LIVE)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMonthTab('august')}
              className={cn(
                "px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none shrink-0",
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
                "px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none shrink-0",
                isJuly
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
              )}
            >
              JULY
            </button>
          </div>

          <DensitySwitcher value={density} onChange={setDensity} className="shrink-0" />
        </div>

        {/* Unified Date Range Subtitle */}
        <div className="flex justify-center items-center w-full mt-1 mb-2">
          <LinesDateRange dateInfo={activeDateInfo} workingDays={currentStats?.workingDays} />
        </div>
      </div>

      {/* ── 2. FACTORY FLOOR SUMMARY STRIP ───────────────────────────── */}
      {currentStats && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
            
            {/* Left Status Block */}
            <div className="flex items-center gap-3 w-full lg:w-[230px] xl:w-[260px] pb-3 lg:pb-0 border-b lg:border-b-0 border-[var(--color-border)] shrink-0">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 w-full flex-1">
              
              {/* Total Factory Output */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Output
                </span>
                <span className="text-sm sm:text-base font-black text-[var(--color-text-main)] mt-0.5 truncate">
                  <AnimatedNumber value={Math.round(currentStats.totalProduction || 0)} />{' '}
                  <span className="text-[10px] text-[var(--color-text-muted)] font-normal">PCS</span>
                </span>
              </div>

              {/* Total Income */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Income
                </span>
                <span className="text-sm sm:text-base font-black text-[var(--color-primary)] mt-0.5 truncate">
                  <AnimatedNumber value={Math.round(currentStats.totalIncome || 0)} prefix="BDT " />
                </span>
              </div>

              {/* Total Cost */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Cost
                </span>
                <span className="text-sm sm:text-base font-black text-[var(--color-text-main)] mt-0.5 truncate">
                  <AnimatedNumber value={Math.round(currentStats.totalCost || 0)} prefix="BDT " />
                </span>
              </div>

              {/* Net Profit / Loss */}
              <div className={cn(
                "border rounded-xl p-2.5 sm:p-3 flex flex-col justify-center",
                (currentStats.netProfit || 0) >= 0 
                  ? "bg-[var(--color-success-glow)]/40 border-[rgba(16,185,129,0.25)]" 
                  : "bg-[var(--color-danger-glow)]/40 border-[rgba(255,59,48,0.25)]"
              )}>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  {(currentStats.netProfit || 0) >= 0 ? "Net Profit" : "Net Loss"}
                </span>
                <span className={cn(
                  "text-sm sm:text-base font-black mt-0.5 flex items-center gap-1 truncate",
                  (currentStats.netProfit || 0) >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                )}>
                  {(currentStats.netProfit || 0) >= 0 ? <TrendingUp size={14} className="shrink-0" /> : <TrendingDown size={14} className="shrink-0" />}
                  <AnimatedNumber value={Math.abs(Math.round(currentStats.netProfit || 0))} prefix={(currentStats.netProfit || 0) >= 0 ? "+BDT " : "BDT -"} />
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 3. COMPACT LIST VIEW (When Density === 'compact') ───────────────────── */}
      {density === 'compact' ? (
        <div className="flex flex-col gap-3">
          {currentLines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => {
            const isInactive = (line.totalProduction || 0) === 0 && (line.totalCost || 0) === 0;
            const isProfitable = !isInactive && (line.netProfit || 0) >= 0;
            const detailsUrl = isAugust ? `/archive/2026-08/lines/${line.id}` : (isJuly ? `/archive/2026-07/lines/${line.id}` : `/lines/${line.id}`);

            // Floor Leadership Badges
            const isTopProfit = !isInactive && floorRankings.topProfitId === line.id;
            const isTopOutput = !isInactive && !isTopProfit && floorRankings.topOutputId === line.id;
            const isTopRecovery = !isInactive && !isTopProfit && !isTopOutput && floorRankings.topRecoveryId === line.id;

            const workerCount = line.lastDay?.worker_count || line.averageWorkers || 0;
            const recoveryVal = parseFloat(line.monthCostRecovery || 0);

            return (
              <Card key={line.id} className="relative overflow-hidden p-3.5 sm:p-4 border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xs hover:shadow-md transition-all duration-200">
                <div className="grid grid-cols-2 lg:grid-cols-[230px_repeat(4,1fr)_140px_100px] xl:grid-cols-[260px_repeat(4,1fr)_150px_110px] items-center gap-2.5 sm:gap-3.5">
                  
                  {/* Col 1: Line Pill + Name + Badges + Item & Workers */}
                  <div className="col-span-2 lg:col-span-1 flex items-center gap-3 min-w-0 pb-1 lg:pb-0 border-b lg:border-b-0 border-[var(--color-border)]/50">
                    <div className="hidden sm:flex w-10 h-10 rounded-xl font-black text-sm sm:text-base items-center justify-center text-[var(--color-on-primary,white)] shrink-0 bg-[var(--color-primary)] shadow-xs">
                      {line.id}
                    </div>
                    
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-[var(--color-text-main)] tracking-tight uppercase truncate">
                          {line.name}
                        </h3>
                        
                        {/* Status Badges */}
                        {isTopProfit ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.25)] shrink-0">
                            <Trophy size={10} /> Profit
                          </span>
                        ) : isTopOutput ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 shrink-0">
                            <Zap size={10} /> Top
                          </span>
                        ) : isTopRecovery ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 shrink-0">
                            <Activity size={10} /> Top Eff
                          </span>
                        ) : null}

                        {isInactive ? (
                          <span className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border border-zinc-500/30 shrink-0">
                            Idle
                          </span>
                        ) : isProfitable ? (
                          <span className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.25)] shrink-0">
                            Optimal
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 shrink-0">
                            Critical
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--color-text-muted)] min-w-0">
                        <span className="flex items-center gap-1 font-medium min-w-0 truncate">
                          <Shirt size={12} className="text-[var(--color-primary)] shrink-0" />
                          <span className="truncate text-[var(--color-text-secondary)] font-semibold">
                            {isInactive ? 'Standby / Idle' : (line.item || 'Standard Garment')}
                          </span>
                        </span>
                        <span className="text-[var(--color-border)] shrink-0">•</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Users size={12} className="text-[var(--color-text-muted)] shrink-0" />
                          <span>{isInactive ? '0' : workerCount} W</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Output */}
                  <div className="col-span-1 bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-xl px-3 py-2 flex flex-col justify-center min-w-0">
                    <span className="text-[8.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                      Output
                    </span>
                    <span className="text-xs xl:text-sm font-black text-[var(--color-text-main)] truncate mt-0.5">
                      {(line.totalProduction || 0).toLocaleString()} <span className="text-[8.5px] text-[var(--color-text-muted)] font-normal">PCS</span>
                    </span>
                  </div>

                  {/* Col 3: Income */}
                  <div className="col-span-1 bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-xl px-3 py-2 flex flex-col justify-center min-w-0">
                    <span className="text-[8.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                      Income
                    </span>
                    <span className="text-xs xl:text-sm font-black text-[var(--color-primary)] truncate mt-0.5">
                      BDT {(line.totalIncome || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Col 4: Cost */}
                  <div className="col-span-1 bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-xl px-3 py-2 flex flex-col justify-center min-w-0">
                    <span className="text-[8.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                      Cost
                    </span>
                    <span className="text-xs xl:text-sm font-black text-[var(--color-text-main)] truncate mt-0.5">
                      BDT {(line.totalCost || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Col 5: Net Profit / Loss */}
                  <div className={cn(
                    "col-span-1 border rounded-xl px-3 py-2 flex flex-col justify-center min-w-0",
                    isInactive
                      ? "bg-[var(--color-surface)] border-[var(--color-border)]/50"
                      : isProfitable
                        ? "bg-[var(--color-success-glow)]/40 border-[rgba(16,185,129,0.25)]"
                        : "bg-[var(--color-danger-glow)]/40 border-[rgba(255,59,48,0.25)]"
                  )}>
                    <span className="text-[8.5px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                      {isInactive ? "Net Balance" : isProfitable ? "Net Profit" : "Net Loss"}
                    </span>
                    <span className={cn(
                      "text-xs xl:text-sm font-black truncate mt-0.5",
                      isInactive ? "text-[var(--color-text-muted)]" : isProfitable ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                    )}>
                      {isInactive ? 'BDT 0' : (isProfitable ? `+BDT ${(line.netProfit || 0).toLocaleString()}` : `BDT ${(line.netProfit || 0).toLocaleString()}`)}
                    </span>
                  </div>

                  {/* Col 6: Cost Recovery */}
                  <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col justify-center px-1 min-w-0">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider mb-1">
                      <span className="text-[var(--color-text-muted)]">Recovery</span>
                      <span className={cn(
                        "font-extrabold",
                        isInactive ? "text-[var(--color-text-muted)]" : recoveryVal >= 100 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                      )}>
                        {line.monthCostRecovery || '0.0'}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-surface)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]/40">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isInactive ? "bg-zinc-600/30" : recoveryVal >= 100 ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"
                        )}
                        style={{ width: `${isInactive ? 0 : Math.min(recoveryVal, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Col 7: Action Link */}
                  <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex items-center justify-end">
                    <Link
                      href={detailsUrl}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary,white)] shadow-xs transition-all flex items-center justify-center gap-1.5 group"
                    >
                      <span>Details</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* ── 4. PRODUCTION LINES GRID (Cards Mode) ──────────────────────────── */}
            {currentLines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => {
              const isHiddenOnMobile = selectedMobileLine !== line.id;
              
              // Accurate active vs inactive vs profitability checks
              const isInactive = (line.totalProduction || 0) === 0 && (line.totalCost || 0) === 0;
              const isProfitable = !isInactive && (line.netProfit || 0) >= 0;
              const lastDayDateStr = line.lastDayDate ? format(parseISO(line.lastDayDate), 'dd MMM, yyyy') : '02 Sep, 2026';

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

                    {/* Attached Mobile Line Switcher Tabs (Directly on top of the card on mobile) */}
                    <div className="md:hidden w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/60 p-1 rounded-t-[inherit]">
                      <div className="grid grid-cols-4 gap-1">
                        {['A', 'B', 'C', 'D'].map(lineId => {
                          const isSelected = selectedMobileLine === lineId;
                          return (
                            <button
                              key={lineId}
                              type="button"
                              onClick={() => setSelectedMobileLine(lineId)}
                              className={cn(
                                "py-2 rounded-lg text-xs font-bold uppercase transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center",
                                isSelected
                                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-xs"
                                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                              )}
                            >
                              <span>LINE {lineId}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 p-4 sm:p-5 relative z-10 flex-1">
                      
                      {/* Line Card Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)]/50 pb-3">
                        
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] tracking-tight uppercase">
                            {line.name}
                          </h2>
                        </div>

                        {/* Clean Status & Leadership Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {isTopProfit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.25)]">
                              <Trophy size={11} />
                              <span>Profit Leader</span>
                            </span>
                          ) : isTopOutput ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                              <Zap size={11} />
                              <span>Top Output</span>
                            </span>
                          ) : isTopRecovery ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
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
                                  ? "text-[var(--color-success-text)]" 
                                  : "text-[var(--color-danger-text)]"
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
                                  ? "bg-[var(--color-success)]" 
                                  : "bg-[var(--color-danger)]"
                            )}
                            style={{ width: `${isInactive ? 0 : Math.min(parseFloat(line.monthCostRecovery || 0), 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* 4-Box Cumulative Month Metrics */}
                      <div>
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
                            <p className="text-sm sm:text-base font-black text-[var(--color-text-main)]">
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

                      {/* ── 5. TELEMETRY & PRODUCTIVITY SNAPSHOT ────────────────── */}
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
                                  ? "text-[var(--color-success-text)]" 
                                  : "text-[var(--color-danger-text)]"
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
                            <Target size={12} className="text-[var(--color-primary)] shrink-0" />
                            <span>Break-Even:</span>
                            <span className="font-bold text-[var(--color-text-main)]">
                              {breakEvenTarget > 0 ? `${breakEvenTarget} PCS` : 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] justify-end">
                            <Users size={12} className="text-[var(--color-primary)] shrink-0" />
                            <span>Operator Output:</span>
                            <span className="font-bold text-[var(--color-text-main)]">
                              {pcsPerOperator} <span className="text-[8.5px] text-[var(--color-text-muted)]">P/Head</span>
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* ── 6. ACTION BUTTON (VIEW DETAILS) ─────────── */}
                      <div className="mt-auto pt-1">
                        <Link
                          href={detailsUrl}
                          className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none group bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary,white)] shadow-md"
                        >
                          <span>View Full Details</span>
                          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
      )}

    </div>
  );
}
