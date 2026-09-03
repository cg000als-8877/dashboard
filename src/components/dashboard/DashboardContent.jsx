import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, subMonths } from 'date-fns';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { DailyPerformanceChart, IncomeVsCostChart } from '@/components/dashboard/DashboardCharts';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Sparkles, ArrowRight, Download, FileText, Ship, Siren } from 'lucide-react';
import Link from 'next/link';
import { RealTimeClock } from '@/components/ui/RealTimeClock';
import { PrintableArchiveReport } from '@/components/report/PrintableArchiveReport';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { DashboardSkeleton } from '@/components/ui/Skeletons';
import { cn } from '@/components/layout/Sidebar';

// High-speed emergency ambulance siren beacon
function AmbulanceBeacon() {
  return (
    <span className="relative flex items-center justify-center shrink-0 w-3.5 h-3.5 mr-0.5">
      {/* Outer pulsing red emergency halo */}
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-80 duration-200" />
      {/* Rotating emergency strobe ring */}
      <span className="animate-spin absolute inline-flex h-4 w-4 rounded-full border border-red-300/60 border-t-white" style={{ animationDuration: '0.35s' }} />
      {/* High-visibility Siren icon with rapid red/white strobe flash */}
      <Siren className="relative w-3.5 h-3.5 text-white drop-shadow-[0_0_8px_#ff0000] animate-[pulse_0.2s_infinite]" />
    </span>
  );
}

// Helper function to render superscript ordinal suffixes (e.g. 1ˢᵗ, 23ʳᵈ, 30ᵗʰ)
function renderOrdinal(dayStr) {
  if (!dayStr) return null;
  const match = String(dayStr).match(/^(\d+)([a-zA-Z]+)$/);
  if (match) {
    const [, num, suffix] = match;
    return (
      <span className="inline-flex items-baseline font-semibold">
        <span>{num}</span>
        <sup className="text-[68%] font-bold -top-[0.45em] ml-[0.5px]">{suffix}</sup>
      </span>
    );
  }
  return <span>{dayStr}</span>;
}

const LINE_CARD_META = {
  'A': {
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.25)',
    btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30'
  },
  'B': {
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.25)',
    btnClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950/30'
  },
  'C': {
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.25)',
    btnClass: 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/30'
  },
  'D': {
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.25)',
    btnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/30'
  }
};

export function DashboardContent({ month, isArchive = false }) {
  const { stats, dailyTrends, insights, lines, loading, error } = useKpiData(month);

  // For Live Dashboard: Load August ('2026-08') and July ('2026-07') archives for tabs & comparisons
  const { stats: augustStats, dailyTrends: augustDailyTrends, lines: augustLines } = useKpiData('2026-08');
  const { stats: julyStats, dailyTrends: julyDailyTrends, lines: julyLines } = useKpiData('2026-07');
  const [selectedCardMonth, setSelectedCardMonth] = useState('current'); // 'current' | 'august' | 'july'
  const [selectedMobileLine, setSelectedMobileLine] = useState('A');
  const [interactiveDay, setInteractiveDay] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef(null);

  const generatePdf = async () => {
    // We use the browser's native print engine for perfect color rendering (supports LAB/OKLCH colors natively)
    setIsGeneratingPdf(true);
    
    // Give React a tiny moment to ensure the PrintableArchiveReport is fully in the DOM
    setTimeout(() => {
      window.print();
      setIsGeneratingPdf(false);
    }, 500);
  };

  useEffect(() => {
    setInteractiveDay(null);
  }, [month]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20 font-medium bg-[rgba(255,0,0,0.1)] p-4 rounded-xl border border-red-500/20">Error loading data: {error}</div>;
  }

  const startDate = dailyTrends?.length > 0 ? dailyTrends[0].date : null;
  const endDate = dailyTrends?.length > 0 ? dailyTrends[dailyTrends.length - 1].date : null;
  
  let dateText = '';
  let dateComponents = null;
  let currentCalendarDay = 1;
  if (startDate && endDate) {
    const formatStr = 'do MMMM, yyyy';
    dateText = `from ${format(parseISO(startDate), 'do')} to ${format(parseISO(endDate), formatStr)}`;
    dateComponents = {
      startDay: format(parseISO(startDate), 'do'),
      endDay: format(parseISO(endDate), 'do'),
      month: format(parseISO(endDate), 'MMMM'),
      year: format(parseISO(endDate), 'yyyy')
    };
    currentCalendarDay = parseInt(endDate.split('-')[2], 10);
  }

  const augustDateComponents = {
    startDay: '1st',
    endDay: '31st',
    month: 'August',
    year: '2026'
  };

  const julyDateComponents = {
    startDay: '1st',
    endDay: '31st',
    month: 'July',
    year: '2026'
  };

  const maxDays = dailyTrends?.length || 1;
  const displayDay = interactiveDay !== null ? interactiveDay : currentCalendarDay;
  const currentDayData = dailyTrends && dailyTrends.length >= displayDay ? dailyTrends[displayDay - 1] : null;

  // ── LIKE-FOR-LIKE COMPARISON WITH AUGUST (Exact Same Elapsed Working Days in August) ──
  let augustComparisonStats = augustStats;
  if (augustDailyTrends && augustDailyTrends.length > 0 && stats?.workingDays > 0) {
    const elapsedAugustDays = augustDailyTrends.slice(0, stats.workingDays);
    let prevCost = 0;
    let prevIncome = 0;
    let prevProfit = 0;
    let prevProduction = 0;
    let prevWorkingDays = 0;

    elapsedAugustDays.forEach(d => {
      prevCost += d.cost || 0;
      prevIncome += d.income || 0;
      prevProfit += d.profit || 0;
      prevProduction += d.production || 0;
      if ((d.production && d.production > 0) || (d.cost && d.cost > 0)) {
        prevWorkingDays += 1;
      }
    });

    const activeDaysCount = prevWorkingDays > 0 ? prevWorkingDays : elapsedAugustDays.length;
    const avgDailyProfit = activeDaysCount > 0 ? (prevProfit / activeDaysCount) : 0;

    augustComparisonStats = {
      totalCost: prevCost,
      totalIncome: prevIncome,
      netProfit: prevProfit,
      totalProduction: prevProduction,
      workingDays: activeDaysCount,
      averageDailyProfit: avgDailyProfit
    };
  }

  const prevComparisonStats = augustComparisonStats;

  if (!stats) return <DashboardSkeleton />;

  // Contextual KPI delta computations (Dynamically matches the active date range of the month)
  let prevPeriodLabel = isArchive ? "Previous Period" : "August";
  if (!isArchive) {
    if (dateComponents?.startDay && dateComponents?.endDay) {
      prevPeriodLabel = dateComponents.startDay === dateComponents.endDay
        ? `August (${dateComponents.startDay})`
        : `August (${dateComponents.startDay}–${dateComponents.endDay})`;
    }
  }

  let costComparison = null;
  if (stats && prevComparisonStats?.totalCost > 0) {
    const currCost = stats.totalCost;
    const prevCost = prevComparisonStats.totalCost;
    const costDiff = currCost - prevCost;
    const isHigherCost = costDiff > 0;
    const pct = Math.round((Math.abs(costDiff) / prevCost) * 100);
    
    if (pct === 0 || Math.abs(costDiff) < 5000) {
      costComparison = {
        highlight: `Flat (0%)`,
        label: `matching ${prevPeriodLabel}`,
        trend: 'neutral',
        isPositive: true
      };
    } else {
      costComparison = {
        highlight: isHigherCost ? `+${pct}% more Cost` : `-${pct}% less Cost`,
        label: `compared to ${prevPeriodLabel}`,
        trend: isHigherCost ? 'down' : 'up',
        isPositive: !isHigherCost
      };
    }
  }

  let incomeComparison = null;
  if (stats && prevComparisonStats?.totalIncome > 0) {
    const currInc = stats.totalIncome;
    const prevInc = prevComparisonStats.totalIncome;
    const incDiff = currInc - prevInc;
    const isHigherInc = incDiff > 0;
    const pct = Math.round((Math.abs(incDiff) / prevInc) * 100);

    if (pct === 0 || Math.abs(incDiff) < 5000) {
      incomeComparison = {
        highlight: `Flat (0%)`,
        label: `matching ${prevPeriodLabel}`,
        trend: 'neutral',
        isPositive: true
      };
    } else {
      incomeComparison = {
        highlight: isHigherInc ? `+${pct}% more Revenue` : `-${pct}% less Revenue`,
        label: `compared to ${prevPeriodLabel}`,
        trend: isHigherInc ? 'up' : 'down',
        isPositive: isHigherInc
      };
    }
  }

  let netComparison = null;
  if (stats && prevComparisonStats?.netProfit !== undefined && prevComparisonStats?.netProfit !== null) {
    const currNet = stats.netProfit;
    const prevNet = prevComparisonStats.netProfit;
    const netDiff = currNet - prevNet;
    const isLessLoss = currNet > prevNet;
    const pct = Math.round((Math.abs(netDiff) / Math.abs(prevNet || 1)) * 100);

    if (currNet < 0 && prevNet < 0) {
      if (pct === 0 || Math.abs(netDiff) < 5000) {
        netComparison = {
          highlight: `Same Deficit`,
          label: `matching ${prevPeriodLabel}`,
          trend: 'neutral',
          isPositive: true
        };
      } else {
        netComparison = {
          highlight: isLessLoss ? `-${pct}% less Loss` : `+${pct}% more Loss`,
          label: `compared to ${prevPeriodLabel}`,
          trend: isLessLoss ? 'up' : 'down',
          isPositive: isLessLoss
        };
      }
    } else if (currNet >= 0) {
      netComparison = {
        highlight: `Profitable`,
        label: `improved compared to ${prevPeriodLabel}`,
        trend: 'up',
        isPositive: true
      };
    } else {
      netComparison = {
        highlight: `In Loss`,
        label: `down compared to ${prevPeriodLabel}`,
        trend: 'down',
        isPositive: false
      };
    }
  }

  let daysComparison = null;
  if (stats?.workingDays > 0) {
    daysComparison = {
      highlight: `${stats.workingDays} of ${stats.workingDays} Days`,
      label: `matching ${prevPeriodLabel} pace`,
      trend: 'neutral',
      isPositive: true
    };
  }

  const totalLines = stats?.totalLinesCount || lines?.length || 4;
  const currentActiveLines = stats?.activeLinesCount !== undefined ? stats.activeLinesCount : 4;
  const linesComparison = {
    highlight: currentActiveLines === totalLines ? `All ${totalLines} Lines` : `${currentActiveLines} of ${totalLines} Lines`,
    label: `active & producing`,
    trend: 'neutral',
    isPositive: true
  };

  let avgDailyComparison = null;
  if (stats && prevComparisonStats?.averageDailyProfit !== undefined && prevComparisonStats?.averageDailyProfit !== null) {
    const currAvg = stats.averageDailyProfit;
    const prevAvg = prevComparisonStats.averageDailyProfit;
    const avgDiff = currAvg - prevAvg;
    const diffK = Math.abs(Math.round(avgDiff / 1000));
    const isBetter = currAvg > prevAvg;

    if (diffK === 0) {
      avgDailyComparison = {
        highlight: `Same Daily Rate`,
        label: `matching ${prevPeriodLabel} run-rate`,
        trend: 'neutral',
        isPositive: true
      };
    } else {
      avgDailyComparison = {
        highlight: isBetter ? `-${diffK}k less Loss/Day` : `+${diffK}k more Loss/Day`,
        label: `compared to ${prevPeriodLabel}`,
        trend: isBetter ? 'up' : 'down',
        isPositive: isBetter
      };
    }
  }

  return (
    <>
      <div className="space-y-6 animate-[fade-up_0.4s_ease-out_both] no-print">
        {/* Titanic Animation (Live Dashboard Only) - 3:2 format, 0 top & left/right padding on mobile */}
        {!isArchive && showAnimation && (
          <div className="flex flex-col relative z-10 -mt-10 md:-mt-8 -mx-4 md:-mx-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] overflow-hidden">
            <div className="w-full transition-all duration-500 ease-in-out origin-top overflow-hidden border-none rounded-none opacity-100 mb-2 animate-[fade-down_0.3s_ease-out]">
              <TitanicAnimation netProfit={stats.netProfit} simDay={displayDay} />
            </div>
          </div>
        )}

        {/* Hide/Show Visuals Button (Above Factory Financials Title, Center Aligned on Desktop & Mobile) */}
        {!isArchive && (
          <div className={`flex justify-center items-center ${!showAnimation ? 'mt-[2px] md:mt-0 mb-3' : 'mt-2 mb-3'}`}>
            <button
              onClick={() => setShowAnimation(!showAnimation)}
              className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-strong,var(--color-primary))] bg-transparent text-[8.5px] md:text-[10px] font-medium tracking-wider uppercase transition-all active:scale-95 cursor-pointer select-none leading-tight ${!showAnimation ? 'animate-slow-blink' : ''}`}
            >
              {showAnimation ? 'Hide Visuals' : 'Show Visuals'}
            </button>
          </div>
        )}

        {/* FACTORY FINANCIALS HEADER */}
        <div className="relative flex flex-col items-center justify-center mb-4 sm:mb-5 px-1 sm:px-0">
          <h2 className="text-[20px] sm:text-[23px] md:text-[27px] font-bold tracking-[0.12em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] text-center leading-tight">
            Factory Financials
          </h2>
          <p className="text-[10.5px] sm:text-[11.5px] md:text-xs text-[var(--color-text-muted)] font-medium tracking-normal text-center mt-0.5 flex items-center justify-center flex-wrap gap-1">
            <span>Financial Data Analyst :</span>
            <span className="text-[var(--color-primary)] font-bold">Rofiqul Islam Zia</span>
            <span className="text-[var(--color-text-secondary)] font-semibold">(Merchandiser)</span>
          </p>
        </div>

        {/* KPI Overview Section (Unboxed on mobile to expand cards, card on desktop) */}
        <div className="relative rounded-none md:rounded-3xl border-0 md:border md:border-[var(--color-border)]/70 bg-transparent md:bg-[var(--color-bg-card)]/50 backdrop-blur-none md:backdrop-blur-md p-0 md:p-6 shadow-none md:shadow-xl overflow-visible md:overflow-hidden mb-6 -mx-2 sm:mx-0">
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Month Tab Switcher for 6 KPI Stat Cards (Live Dashboard Only) */}
          {!isArchive && (
            <div className="flex justify-center items-center w-full mb-2 sm:mb-2.5 relative z-10">
              <div className="inline-flex p-0.5 sm:p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl gap-1 shadow-sm backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setSelectedCardMonth('current')}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
                    selectedCardMonth === 'current'
                      ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] font-bold border border-[var(--color-border)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
                  )}
                >
                  <span>SEPTEMBER</span>
                  <span className="text-[8.5px] sm:text-[10px] text-rose-500 font-black tracking-wide">(LIVE)</span>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCardMonth('august')}
                  className={cn(
                    "px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
                    selectedCardMonth === 'august'
                      ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] font-bold border border-[var(--color-border)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
                  )}
                >
                  AUGUST
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCardMonth('july')}
                  className={cn(
                    "px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
                    selectedCardMonth === 'july'
                      ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] font-bold border border-[var(--color-border)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
                  )}
                >
                  JULY
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Date Context (Inside Card under Month Tabs) */}
          {(() => {
            let activeDateComp = dateComponents;
            if (!isArchive) {
              if (selectedCardMonth === 'august') {
                activeDateComp = augustDateComponents;
              } else if (selectedCardMonth === 'july') {
                activeDateComp = julyDateComponents;
              }
            }
            if (!activeDateComp) return null;

            return (
              <div className="flex justify-center items-center w-full mt-0.5 mb-2.5 sm:mb-3.5 relative z-10">
                <span className="inline-flex items-baseline gap-1 text-[10px] sm:text-[11px] md:text-xs font-bold tracking-wide text-[var(--color-text-secondary)]">
                  <span>From</span>
                  {renderOrdinal(activeDateComp.startDay)}
                  <span>to</span>
                  {renderOrdinal(activeDateComp.endDay)}
                  <span className="font-extrabold text-[var(--color-primary)] ml-0.5">{activeDateComp.month},</span>
                  <span>{activeDateComp.year}</span>
                </span>
              </div>
            );
          })()}

          {/* 6 KPI Metric Cards Grid */}
          {(() => {
            const isAugust = !isArchive && selectedCardMonth === 'august' && !!augustStats;
            const isJuly = !isArchive && selectedCardMonth === 'july' && !!julyStats;
            const displayStats = isAugust ? augustStats : (isJuly ? julyStats : stats);

            return (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-4 relative z-10 px-0.5 sm:px-0">
                <MetricCard 
                  title="Total Cost" 
                  value={<AnimatedNumber value={Math.round(displayStats.totalCost)} prefix="BDT " />} 
                  color="warning"
                  comparison={isArchive ? null : (
                    isAugust 
                      ? { highlight: "August Total", label: "full month actual spending", trend: "neutral", isPositive: true }
                      : (isJuly 
                          ? { highlight: "July Total", label: "full month actual spending", trend: "neutral", isPositive: true }
                          : costComparison
                        )
                  )}
                />
                <MetricCard 
                  title="Total Income" 
                  value={<AnimatedNumber value={Math.round(displayStats.totalIncome)} prefix="BDT " />}
                  color="primary"
                  comparison={isArchive ? null : (
                    isAugust 
                      ? { highlight: "August Total", label: "full month earned revenue", trend: "neutral", isPositive: true }
                      : (isJuly 
                          ? { highlight: "July Total", label: "full month earned revenue", trend: "neutral", isPositive: true }
                          : incomeComparison
                        )
                  )}
                />
                <MetricCard 
                  title={displayStats.netProfit >= 0 ? "Net Profit" : "Net Loss"} 
                  value={<AnimatedNumber value={Math.abs(Math.round(displayStats.netProfit))} prefix={displayStats.netProfit >= 0 ? "+BDT " : "BDT -"} />}
                  color={displayStats.netProfit >= 0 ? 'success' : 'danger'}
                  comparison={isArchive ? null : (
                    isAugust 
                      ? { highlight: "August Balance", label: displayStats.netProfit >= 0 ? "net monthly profit" : "net monthly loss", trend: "neutral", isPositive: displayStats.netProfit >= 0 }
                      : (isJuly 
                          ? { highlight: "July Balance", label: displayStats.netProfit >= 0 ? "net monthly profit" : "net monthly loss", trend: "neutral", isPositive: displayStats.netProfit >= 0 }
                          : netComparison
                        )
                  )}
                />
                <MetricCard 
                  title="Working Days" 
                  value={<AnimatedNumber value={displayStats.workingDays} suffix=" Days" />} 
                  comparison={isArchive ? null : (
                    isAugust 
                      ? { highlight: `${displayStats.workingDays} Days`, label: "total active factory days in August", trend: "neutral", isPositive: true }
                      : (isJuly 
                          ? { highlight: `${displayStats.workingDays} Days`, label: "total active factory days in July", trend: "neutral", isPositive: true }
                          : daysComparison
                        )
                  )}
                />
                <MetricCard 
                  title="Production Lines" 
                  value={<AnimatedNumber value={displayStats.activeLinesCount !== undefined ? displayStats.activeLinesCount : 4} suffix=" Active" />} 
                  comparison={isArchive ? null : (() => {
                    const actCount = displayStats.activeLinesCount !== undefined ? displayStats.activeLinesCount : 4;
                    const totCount = displayStats.totalLinesCount || totalLines || 4;
                    const isAll = actCount === totCount;
                    return {
                      highlight: isAll ? `All ${totCount} Lines` : `${actCount} of ${totCount} Lines`,
                      label: isAugust || isJuly ? "active manufacturing operations" : "active & producing",
                      trend: "neutral",
                      isPositive: true
                    };
                  })()}
                />
                <MetricCard 
                  title={displayStats.averageDailyProfit >= 0 ? "Avg Daily Profit" : "Avg Daily Loss"} 
                  value={<AnimatedNumber value={Math.abs(Math.round(displayStats.averageDailyProfit))} prefix={displayStats.averageDailyProfit >= 0 ? "+" : "-"} suffix=" / day" />}
                  color={displayStats.averageDailyProfit >= 0 ? 'success' : 'danger'}
                  comparison={isArchive ? null : (
                    isAugust 
                      ? { highlight: "August Pace", label: "overall daily average rate", trend: "neutral", isPositive: displayStats.averageDailyProfit >= 0 }
                      : (isJuly 
                          ? { highlight: "July Pace", label: "overall daily average rate", trend: "neutral", isPositive: displayStats.averageDailyProfit >= 0 }
                          : avgDailyComparison
                        )
                  )}
                />
              </div>
            );
          })()}
        </div>

        {/* PDF Download Action (Archive Only) - HIDDEN FOR NOW */}
      {isArchive && (
        <div className="hidden justify-center md:justify-end mt-10 relative z-10">
          <button 
            onClick={generatePdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-xl font-bold uppercase tracking-widest transition-all [box-shadow:0_0_20px_var(--color-primary-glow)] hover:[box-shadow:0_0_30px_var(--color-primary-glow-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                GENERATING PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                DOWNLOAD {month.toUpperCase()}
              </>
            )}
          </button>
        </div>
      )}

      {/* Archive PDF Download Buttons */}
      {isArchive && (
        (() => {
          const pdfLinks = {
            '2026-07': {
              url: 'https://drive.google.com/file/d/1GWGOeDtG3mvxW7T8y0w64UHg75jBR-Bv/view?usp=sharing',
              label: 'Download PDF of July Sheets'
            },
            '2026-08': {
              url: 'https://drive.google.com/file/d/1-Jug6L8J5_CttfrAyrh2NCFuV70g0pvu/view?usp=sharing',
              label: 'Download PDF of August Sheets'
            }
          };

          const activePdf = pdfLinks[month];
          if (!activePdf) return null;

          return (
            <div className="flex justify-center mt-10 mb-2 relative z-10">
              <button 
                onClick={() => window.open(activePdf.url, '_blank')}
                className="group flex items-center gap-3 bg-red-500 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 [box-shadow:0_0_20px_rgba(239,68,68,0.4)] hover:[box-shadow:0_0_25px_rgba(153,27,27,0.6)] text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 cursor-pointer min-w-[280px] sm:min-w-[320px] justify-center select-none"
              >
                <span className="group-hover:hidden transition-all duration-200">{activePdf.label}</span>
                <span className="hidden group-hover:inline font-black tracking-[0.2em] text-white transition-all duration-200">Click to See</span>
                <div className="w-[1px] h-5 bg-white/40 rounded-full mx-1"></div>
                <FileText size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          );
        })()
      )}

        {/* Production Lines Horizontal Dashboard */}
        {(() => {
          const activeLines = isArchive
            ? (lines || [])
            : (selectedCardMonth === 'august' ? (augustLines || lines || []) : (selectedCardMonth === 'july' ? (julyLines || lines || []) : (lines || [])));

          const activeMonthName = isArchive
            ? (dateComponents?.month || 'Archive')
            : (selectedCardMonth === 'august' ? 'August' : (selectedCardMonth === 'july' ? 'July' : (dateComponents?.month || 'September')));

          const activeDateSubtitle = (() => {
            if (isArchive) {
              if (dateComponents?.startDay === dateComponents?.endDay) {
                return (
                  <>
                    <span>Updated for</span>
                    <span className="font-bold text-[var(--color-primary)]">{dateComponents?.startDay}</span>
                    <span>{dateComponents?.month}, {dateComponents?.year}</span>
                  </>
                );
              }
              return (
                <>
                  <span>From</span>
                  <span className="font-bold text-[var(--color-primary)]">{dateComponents?.startDay || '1st'}</span>
                  <span>to</span>
                  <span className="font-bold text-[var(--color-primary)]">{dateComponents?.endDay || '31st'}</span>
                  <span>{dateComponents?.month || ''}, {dateComponents?.year || '2026'}</span>
                </>
              );
            }
            if (selectedCardMonth === 'august') {
              return (
                <>
                  <span>From</span>
                  <span className="font-bold text-[var(--color-primary)]">1st</span>
                  <span>to</span>
                  <span className="font-bold text-[var(--color-primary)]">31st</span>
                  <span>August, 2026</span>
                </>
              );
            }
            if (selectedCardMonth === 'july') {
              return (
                <>
                  <span>From</span>
                  <span className="font-bold text-[var(--color-primary)]">1st</span>
                  <span>to</span>
                  <span className="font-bold text-[var(--color-primary)]">31st</span>
                  <span>July, 2026</span>
                </>
              );
            }
            // Live current month (September)
            if (dateComponents?.startDay === dateComponents?.endDay) {
              return (
                <>
                  <span>Updated for</span>
                  <span className="font-bold text-[var(--color-primary)]">{dateComponents?.startDay || '1st'}</span>
                  <span>{dateComponents?.month || 'September'}, {dateComponents?.year || '2026'}</span>
                </>
              );
            }
            return (
              <>
                <span>From</span>
                <span className="font-bold text-[var(--color-primary)]">{dateComponents?.startDay || '1st'}</span>
                <span>to</span>
                <span className="font-bold text-[var(--color-primary)]">{dateComponents?.endDay || '1st'}</span>
                <span>{dateComponents?.month || 'September'}, {dateComponents?.year || '2026'}</span>
              </>
            );
          })();

          return (
            <div className="mt-12 mb-10 relative z-10">
              {/* Header Title & Date Subtitle */}
              <div className="flex flex-col items-center justify-center mb-5 sm:mb-6 text-center">
                <h2 className="text-[20px] sm:text-[23px] md:text-[27px] font-bold tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] text-center leading-tight">
                  LINE SUMMARY {activeMonthName.toUpperCase()}
                </h2>
                <p className="text-[11px] sm:text-[12.5px] md:text-[13px] text-[var(--color-text-muted)] font-medium tracking-normal mt-1 flex items-center justify-center gap-1.5">
                  {activeDateSubtitle}
                </p>
              </div>

              {/* Mobile Tab Series Side by Side (LINE A, LINE B, LINE C, LINE D) */}
              <div className="md:hidden flex justify-center items-center w-full mb-3 px-0.5">
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
                          "py-2 rounded-lg text-xs font-black uppercase transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center gap-1",
                          isSelected
                            ? "bg-[var(--color-bg-card)] shadow-sm border border-[var(--color-border)]"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                        )}
                        style={isSelected ? { color: meta.color, borderColor: `${meta.color}60` } : {}}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                        <span>LINE {lineId}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Line Cards Grid / List */}
              <div className="flex flex-col gap-4 sm:gap-5">
                {activeLines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => {
                  const meta = LINE_CARD_META[line.id.toUpperCase()] || LINE_CARD_META['A'];
                  const isHiddenOnMobile = selectedMobileLine !== line.id;
                  const lastDayDateStr = line.lastDayDate ? format(parseISO(line.lastDayDate), 'do MMMM, yyyy') : (dateComponents?.endDay ? `${dateComponents.endDay} ${dateComponents.month}, ${dateComponents.year}` : '1st September, 2026');

                  return (
                    <div key={line.id} className={cn("w-full", isHiddenOnMobile && "hidden md:block")}>
                      <Card className="relative overflow-hidden w-full p-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none rounded-[inherit]"></div>
                        
                        <div className="flex flex-col gap-3.5 p-3.5 sm:p-5 relative z-10">
                          
                          {/* Line Top Header: Name, Status Badge, Item, Month Efficiency */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)]/50 pb-3">
                            <div className="flex items-center justify-between sm:justify-start gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full shadow-md shrink-0" style={{ backgroundColor: meta.color }} />
                                <h2 className="text-[20px] md:text-[24px] font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] [filter:var(--shadow-text)]">
                                  {line.name}
                                </h2>
                              </div>
                              
                              {line.netProfit >= 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8.5px] md:text-[9px] font-bold uppercase tracking-widest bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.2)]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981] animate-pulse" />
                                  Optimal
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[8.5px] md:text-[9.5px] font-black uppercase tracking-widest transition-all animate-emergency-strobe cursor-default shadow-lg">
                                  <AmbulanceBeacon />
                                  <span>Critical</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] md:text-xs">
                              <div className="font-semibold tracking-tight uppercase flex items-center gap-1.5">
                                <span className="text-[var(--color-text-muted)]">ITEM :</span>
                                <span className="text-[var(--color-primary)] font-bold">
                                  {line.item || 'Unknown'}
                                </span>
                              </div>
                              <div className="font-semibold tracking-tight uppercase flex items-center gap-1.5">
                                <span className="text-[var(--color-text-muted)]">Month Efficiency :</span>
                                <span className={cn(
                                  "font-extrabold",
                                  parseFloat(line.monthCostRecovery || 0) >= 100 ? "text-emerald-400" : "text-amber-400"
                                )}>
                                  {line.monthCostRecovery || '0.0'}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Cumulative Month Performance Grid */}
                          <div>
                            <p className="text-[9.5px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1.5">
                              Month Total Summary ({activeMonthName})
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                              <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] shadow-xs">
                                <p className="text-[9px] md:text-[9.5px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">Production</p>
                                <p className="text-sm md:text-lg font-bold text-[var(--color-text-main)]">
                                  <AnimatedNumber value={line.totalProduction} />
                                  <span className="text-[10px] text-[var(--color-text-muted)] ml-1">PCS</span>
                                </p>
                              </div>
                              
                              <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] shadow-xs">
                                <p className="text-[9px] md:text-[9.5px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">Income</p>
                                <p className="text-sm md:text-lg font-bold text-[var(--color-primary)]">
                                  <AnimatedNumber value={Math.round(line.totalIncome)} prefix="BDT " />
                                </p>
                              </div>

                              <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] shadow-xs">
                                <p className="text-[9px] md:text-[9.5px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">Cost</p>
                                <p className="text-sm md:text-lg font-bold text-amber-500">
                                  <AnimatedNumber value={Math.round(line.totalCost)} prefix="BDT " />
                                </p>
                              </div>

                              <div className={cn(
                                "p-2.5 md:p-3 rounded-xl border shadow-xs",
                                line.netProfit >= 0 ? 'border-[rgba(16,185,129,0.2)] bg-[var(--color-success-glow)]/40' : 'border-[rgba(255,59,48,0.2)] bg-[var(--color-danger-glow)]/40'
                              )}>
                                <p className="text-[9px] md:text-[9.5px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5">{line.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                                <p className={cn(
                                  "text-sm md:text-lg font-bold [filter:var(--shadow-text)]",
                                  line.netProfit >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'
                                )}>
                                  <AnimatedNumber value={Math.round(line.netProfit)} prefix="BDT " />
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Last Recorded Day Input & Cost Recovery Efficiency */}
                          <div className="bg-[var(--color-surface)]/70 border border-[var(--color-border)] rounded-xl p-2.5 sm:p-3.5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                <span>Last Day Input ({lastDayDateStr})</span>
                              </span>
                              <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[var(--color-text-muted)]">
                                Cost Recovery : <span className={cn("font-extrabold", parseFloat(line.lastDayCostRecovery || 0) >= 100 ? "text-emerald-400" : "text-amber-400")}>{line.lastDayCostRecovery || '0.0'}%</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-[var(--color-bg-card)] p-2 rounded-lg border border-[var(--color-border)]/60 text-center">
                                <p className="text-[8.5px] sm:text-[9px] text-[var(--color-text-muted)] font-medium uppercase">Day Output</p>
                                <p className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-text-main)]">
                                  {(line.lastDayOutput || 0).toLocaleString()} <span className="text-[9px] text-[var(--color-text-muted)]">PCS</span>
                                </p>
                              </div>

                              <div className="bg-[var(--color-bg-card)] p-2 rounded-lg border border-[var(--color-border)]/60 text-center">
                                <p className="text-[8.5px] sm:text-[9px] text-[var(--color-text-muted)] font-medium uppercase">Day Income</p>
                                <p className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-primary)]">
                                  BDT {(line.lastDayIncome || 0).toLocaleString()}
                                </p>
                              </div>

                              <div className="bg-[var(--color-bg-card)] p-2 rounded-lg border border-[var(--color-border)]/60 text-center">
                                <p className="text-[8.5px] sm:text-[9px] text-[var(--color-text-muted)] font-medium uppercase">Day Net {line.lastDayProfit >= 0 ? 'Profit' : 'Loss'}</p>
                                <p className={cn(
                                  "text-xs sm:text-sm md:text-base font-bold",
                                  line.lastDayProfit >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                                )}>
                                  BDT {(line.lastDayProfit || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* View Full Details CTA Button with Line Specific Colors */}
                          <Link
                            href={isArchive ? `/archive/${month}/lines/${line.id}` : `/lines/${line.id}`}
                            className={cn(
                              "w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none group",
                              meta.btnClass
                            )}
                          >
                            <span>View Full Details</span>
                            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                          </Link>

                        </div>
                        {/* Decorative side accent */}
                        <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: meta.color }}></div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      {/* AI Insights Panel (Live Dashboard Only) */}
      {!isArchive && (
        <div className="mt-4">
          <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm overflow-hidden p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="hidden md:flex bg-[var(--color-surface)] p-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="w-full">
                <h3 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.16em] mb-4">
                  System Intelligence
                </h3>
                <ul className="space-y-2.5 w-full">
                  {insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3 bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0"></span>
                      <span className="text-sm font-medium text-[var(--color-text-main)] leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

        {/* Charts */}
        <div className="mt-14 relative z-10">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-[20px] sm:text-[23px] md:text-[27px] font-bold tracking-[0.12em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] text-center">
              Performance Telemetry
            </h2>
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyPerformanceChart data={dailyTrends} />
          <IncomeVsCostChart data={dailyTrends} />
        </div>
      </div>
      


      </div>

      {/* Hidden Printable PDF Component */}
      {isArchive && (
        <PrintableArchiveReport month={month} />
      )}
    </>
  );
}
