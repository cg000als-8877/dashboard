import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, subMonths } from 'date-fns';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Sparkles, ArrowRight, Download, FileText, Ship, Siren, ChevronDown, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Check } from 'lucide-react';
import Link from 'next/link';
import { RealTimeClock } from '@/components/ui/RealTimeClock';
import { PrintableArchiveReport } from '@/components/report/PrintableArchiveReport';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { DashboardSkeleton } from '@/components/ui/Skeletons';
import { cn } from '@/components/layout/Sidebar';
import { CostRecoveryJar } from '@/components/dashboard/CostRecoveryJar';
import { CostRecoveryPie } from '@/components/dashboard/CostRecoveryPie';
import { MonthSelectorBar } from '@/components/dashboard/MonthSelectorBar';
import { useLanguage } from '@/components/providers/LanguageProvider';

const DEFAULT_LINE_ITEMS = {
  A: 'Sherpa Jacket, Boys Shirt',
  B: 'Boxer, Boys Shirt',
  C: 'Boxer',
  D: 'Fleece Hoodie'
};

function toTitleCase(str) {
  if (!str) return '';
  return str.split(/(\s+|,|\/|-)/).map(part => {
    if (!part || /^\s+$/.test(part) || part === ',' || part === '/' || part === '-') return part;
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }).join('');
}

// Hot red emergency siren indicator
function AmbulanceBeacon() {
  return (
    <span className="relative flex items-center justify-center shrink-0 w-3 h-3 mr-0.5">
      <Siren className="w-3.5 h-3.5 text-[#FF1744] shrink-0 drop-shadow-[0_0_8px_rgba(255,23,68,0.95)]" />
    </span>
  );
}

// Formats date range as e.g. FROM "01 OCT TO 02 OCT, 2026" with highlight (all uppercase)
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

function DashboardDateRange({ dateInfo, workingDays = null, className = "" }) {
  const { isBangla, toDigits } = useLanguage();
  if (!dateInfo) return null;
  const { isRange, startDay, endDay, startMonthShort, endMonthShort, year } = dateInfo;

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

  return (
    <span className={cn("inline-flex items-center justify-center flex-wrap whitespace-nowrap text-[13px] sm:text-[14px] md:text-[17px] font-bold tracking-wide text-[var(--color-primary)] leading-tight uppercase select-none", className)}>
      {isRange ? (
        <span>
          {isBangla ? toDigits(startDay) : startDay} {getMonthShort(startMonthShort)} - {isBangla ? toDigits(endDay) : endDay} {getMonthShort(endMonthShort)}, {isBangla ? toDigits(year) : year}
        </span>
      ) : (
        <span>
          {isBangla ? toDigits(startDay) : startDay} {getMonthShort(endMonthShort)}, {isBangla ? toDigits(year) : year}
        </span>
      )}
      {workingDays !== null && workingDays !== undefined && (
        <span className="font-bold ml-1.5 tracking-wider">
          ({isBangla ? toDigits(workingDays) : workingDays} {isBangla ? 'দিন' : (workingDays === 1 ? 'DAY' : 'DAYS')})
        </span>
      )}
    </span>
  );
}

function AnimatedTrendCurve({ isProfit = false, className = "", strokeWidth = 4.5 }) {
  const reactId = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `trendGrad_${reactId}`;

  const strokeColorStart = isProfit ? "#34D399" : "#F87171";
  const strokeColorEnd = isProfit ? "#059669" : "#EF4444";
  const solidColor = isProfit ? "#10B981" : "#EF4444";

  return (
    <div className={cn("relative flex items-center justify-center shrink-0 select-none", className)}>
      <svg
        viewBox="0 0 128 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColorStart} />
            <stop offset="100%" stopColor={strokeColorEnd} />
          </linearGradient>
        </defs>

        {/* Smoothly Rounded Downward / Upward Trend Curve Line */}
        <path
          d={
            isProfit
              ? "M 6 92 C 12 76, 16 56, 22 56 C 28 56, 30 72, 36 72 C 42 72, 44 42, 50 42 C 58 42, 62 68, 68 68 C 72 68, 74 52, 77 52 C 79 52, 80 58, 83 58 C 86 58, 88 36, 92 36 C 95 36, 97 48, 100 48 C 104 48, 106 30, 110 24"
              : "M 6 8 C 12 24, 16 44, 22 44 C 28 44, 30 28, 36 28 C 42 28, 44 58, 50 58 C 58 58, 62 32, 68 32 C 72 32, 74 48, 77 48 C 79 48, 80 42, 83 42 C 86 42, 88 64, 92 64 C 95 64, 97 52, 100 52 C 104 52, 106 70, 110 76"
          }
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 280,
            strokeDashoffset: 0,
            animation: "drawJaggedArrow 1.1s cubic-bezier(0.2, 0.8, 0.25, 1) 0.05s forwards"
          }}
        />

        {/* Softly Rounded Triangular Arrowhead */}
        <polygon
          points={
            isProfit
              ? "122,8 115,28 99,16"
              : "122,92 99,80 115,68"
          }
          fill={solidColor}
          stroke={solidColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            transformOrigin: isProfit ? "108px 24px" : "108px 76px",
            animation: "popArrowHead 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.75s forwards"
          }}
        />
      </svg>
    </div>
  );
}



function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function getPacedMonthData(dailyTrends, lines, rawEngine, targetDays) {
  if (!dailyTrends || dailyTrends.length === 0 || !targetDays || targetDays <= 0) {
    return null;
  }

  // Take the first targetDays entries from the month's daily trends (chronologically sorted)
  const slicedTrends = dailyTrends.slice(0, targetDays);
  if (slicedTrends.length === 0) return null;

  let totalCost = 0;
  let totalIncome = 0;
  let totalProfit = 0;
  let totalProduction = 0;
  let workingDays = 0;
  const activeDatesSet = new Set();

  slicedTrends.forEach(d => {
    totalCost += d.cost || 0;
    totalIncome += d.income || 0;
    totalProfit += d.profit || 0;
    totalProduction += d.production || 0;
    if ((d.production && d.production > 0) || (d.cost && d.cost > 0)) {
      workingDays += 1;
    }
    if (d.date) {
      activeDatesSet.add(d.date);
    }
  });

  const activeDaysCount = workingDays > 0 ? workingDays : slicedTrends.length;
  const averageDailyProfit = activeDaysCount > 0 ? (totalProfit / activeDaysCount) : 0;
  const netProfit = totalIncome - totalCost;

  const startDate = slicedTrends[0]?.date;
  const endDate = slicedTrends[slicedTrends.length - 1]?.date;

  // Build paced line stats for the Production Lines card and Line Summary
  let pacedLines = lines || [];
  if (rawEngine?.kpiData?.dailyProduction && Array.isArray(rawEngine.kpiData.dailyProduction)) {
    const rawDaily = rawEngine.kpiData.dailyProduction.filter(d => activeDatesSet.has(d.date) && d.status === 'ACTIVE');
    const linesMeta = rawEngine.kpiData.lines || lines || [];
    
    pacedLines = linesMeta.map(l => {
      const lineEntries = rawDaily.filter(d => d.line_id?.toUpperCase() === l.id?.toUpperCase());
      let lineIncome = 0;
      let lineCost = 0;
      let lineProd = 0;
      let workerSum = 0;
      let activeDays = 0;
      let lastDayEntry = null;
      const itemsSet = new Set();
      const itemTotals = {};

      lineEntries.forEach(d => {
        lineIncome += d.total_income || 0;
        lineCost += d.total_cost || 0;
        lineProd += d.production_qty || 0;
        workerSum += d.worker_count || 0;
        if (d.production_qty > 0 || d.total_cost > 0) activeDays++;
        if (d.item && typeof d.item === 'string' && d.item.trim()) {
          const splitItems = d.item.split(/[,/&]+/).map(s => s.trim()).filter(Boolean);
          if (splitItems.length > 0) {
            splitItems.forEach(it => {
              itemsSet.add(it);
              if (splitItems.length === 1) {
                itemTotals[it] = (itemTotals[it] || 0) + (d.production_qty || 0);
              }
            });
            if (splitItems.length > 1) {
              const perItemQty = Math.round((d.production_qty || 0) / splitItems.length);
              splitItems.forEach(it => {
                itemTotals[it] = (itemTotals[it] || 0) + perItemQty;
              });
            }
          } else {
            const rawItem = d.item.trim();
            itemsSet.add(rawItem);
            itemTotals[rawItem] = (itemTotals[rawItem] || 0) + (d.production_qty || 0);
          }
        }
        if (!lastDayEntry || (d.date && d.date >= lastDayEntry.date)) {
          lastDayEntry = d;
        }
      });

      const uniqueItems = Array.from(itemsSet);
      const itemBreakdown = uniqueItems.map(it => ({
        name: it,
        qty: Math.round(itemTotals[it] || 0)
      }));
      const itemProdSummary = itemBreakdown.length > 1 && itemBreakdown.some(ib => ib.qty > 0)
        ? itemBreakdown.map(ib => ib.qty.toLocaleString()).join(', ')
        : null;
      const avgWorkers = activeDays > 0 ? Math.round(workerSum / activeDays) : 0;
      const lineNetProfit = lineIncome - lineCost;
      const monthCostRecovery = lineCost > 0 ? ((lineIncome / lineCost) * 100).toFixed(1) : '0.0';
      const lastDayOutput = lastDayEntry ? Math.round(lastDayEntry.production_qty || 0) : 0;
      const lastDayIncome = lastDayEntry ? Math.round(lastDayEntry.total_income || 0) : 0;
      const lastDayCost = lastDayEntry ? Math.round(lastDayEntry.total_cost || 0) : 0;
      const lastDayProfit = lastDayEntry ? Math.round(lastDayEntry.net_profit !== undefined ? lastDayEntry.net_profit : (lastDayIncome - lastDayCost)) : 0;
      const lastDayCostRecovery = lastDayCost > 0 ? ((lastDayIncome / lastDayCost) * 100).toFixed(1) : '0.0';

      return {
        ...l,
        totalIncome: Math.round(lineIncome),
        totalCost: Math.round(lineCost),
        netProfit: Math.round(lineNetProfit),
        totalProduction: Math.round(lineProd),
        averageWorkers: avgWorkers,
        activeDaysCount: activeDays,
        item: uniqueItems.join(', ') || DEFAULT_LINE_ITEMS[l.id] || 'Polo Shirt',
        items: uniqueItems,
        itemBreakdown,
        itemProdSummary,
        lastDay: lastDayEntry,
        lastDayDate: lastDayEntry?.date || endDate,
        monthCostRecovery,
        lastDayOutput,
        lastDayIncome,
        lastDayCost,
        lastDayProfit,
        lastDayCostRecovery
      };
    });
  }

  const actLines = pacedLines.filter(l => l.totalProduction > 0 || l.totalCost > 0 || (l.activeDaysCount && l.activeDaysCount > 0));

  return {
    stats: {
      totalCost: Math.round(totalCost),
      totalIncome: Math.round(totalIncome),
      netProfit: Math.round(netProfit),
      totalProduction: Math.round(totalProduction),
      workingDays: activeDaysCount,
      activeLinesCount: actLines.length > 0 ? actLines.length : 4,
      totalLinesCount: pacedLines.length || 4,
      averageDailyProfit: Math.round(averageDailyProfit)
    },
    lines: pacedLines,
    startDate,
    endDate,
    dateInfo: formatDateRangeInfo(startDate, endDate)
  };
}

function computeMetricComparison(currStats, compStats, compLabel) {
  if (!currStats || !compStats) {
    return {
      costComp: null,
      incomeComp: null,
      netComp: null,
      avgDailyComp: null
    };
  }

  // 1. Cost Comparison
  let costComp = null;
  if (compStats.totalCost > 0) {
    const costDiff = currStats.totalCost - compStats.totalCost;
    const isHigherCost = costDiff > 0;
    const pct = Math.round((Math.abs(costDiff) / compStats.totalCost) * 100);

    if (pct === 0 || Math.abs(costDiff) < 5000) {
      costComp = {
        highlight: `Flat (0%)`,
        label: `matching ${compLabel}`,
        trend: 'neutral',
        isPositive: true
      };
    } else {
      costComp = {
        highlight: isHigherCost ? `+${pct}% more Cost` : `-${pct}% less Cost`,
        label: `compared to ${compLabel}`,
        trend: isHigherCost ? 'down' : 'up',
        isPositive: !isHigherCost
      };
    }
  }

  // 2. Income Comparison
  let incomeComp = null;
  if (compStats.totalIncome > 0) {
    const incDiff = currStats.totalIncome - compStats.totalIncome;
    const isHigherInc = incDiff > 0;
    const pct = Math.round((Math.abs(incDiff) / compStats.totalIncome) * 100);

    if (pct === 0 || Math.abs(incDiff) < 5000) {
      incomeComp = {
        highlight: `Flat (0%)`,
        label: `matching ${compLabel}`,
        trend: 'neutral',
        isPositive: true
      };
    } else {
      incomeComp = {
        highlight: isHigherInc ? `+${pct}% more Revenue` : `-${pct}% less Revenue`,
        label: `compared to ${compLabel}`,
        trend: isHigherInc ? 'up' : 'down',
        isPositive: isHigherInc
      };
    }
  }

  // 3. Net Deficit / Profit Comparison
  let netComp = null;
  if (compStats.netProfit !== undefined && compStats.netProfit !== null) {
    const currNet = currStats.netProfit;
    const prevNet = compStats.netProfit;
    const netDiff = currNet - prevNet;
    const isLessLoss = currNet > prevNet;
    const pct = Math.round((Math.abs(netDiff) / Math.abs(prevNet || 1)) * 100);

    if (currNet < 0 && prevNet < 0) {
      if (pct === 0 || Math.abs(netDiff) < 5000) {
        netComp = {
          highlight: `Same Deficit`,
          label: `matching ${compLabel}`,
          trend: 'neutral',
          isPositive: true
        };
      } else {
        netComp = {
          highlight: isLessLoss ? `-${pct}% less Loss` : `+${pct}% more Loss`,
          label: `compared to ${compLabel}`,
          trend: isLessLoss ? 'up' : 'down',
          isPositive: isLessLoss
        };
      }
    } else if (currNet >= 0 && prevNet < 0) {
      netComp = {
        highlight: `Profitable`,
        label: `improved vs. ${compLabel}`,
        trend: 'up',
        isPositive: true
      };
    } else if (currNet < 0 && prevNet >= 0) {
      netComp = {
        highlight: `In Deficit`,
        label: `down vs. ${compLabel}`,
        trend: 'down',
        isPositive: false
      };
    } else {
      netComp = {
        highlight: currNet >= prevNet ? `+${pct}% more Profit` : `-${pct}% less Profit`,
        label: `compared to ${compLabel}`,
        trend: currNet >= prevNet ? 'up' : 'down',
        isPositive: currNet >= prevNet
      };
    }
  }

  // 4. Average Daily Run-Rate Comparison
  let avgDailyComp = null;
  if (compStats.averageDailyProfit !== undefined && compStats.averageDailyProfit !== null) {
    const currAvg = currStats.averageDailyProfit;
    const prevAvg = compStats.averageDailyProfit;
    const avgDiff = currAvg - prevAvg;
    const diffK = Math.abs(Math.round(avgDiff / 1000));
    const isBetter = currAvg > prevAvg;

    if (diffK === 0) {
      avgDailyComp = {
        highlight: `Same Daily Rate`,
        label: `matching ${compLabel} run-rate`,
        trend: 'neutral',
        isPositive: true
      };
    } else {
      if (currAvg < 0 && prevAvg < 0) {
        avgDailyComp = {
          highlight: isBetter ? `-${diffK}k less Loss / Day` : `+${diffK}k more Loss / Day`,
          label: `compared to ${compLabel}`,
          trend: isBetter ? 'up' : 'down',
          isPositive: isBetter
        };
      } else {
        avgDailyComp = {
          highlight: isBetter ? `+${diffK}k more Profit / Day` : `-${diffK}k less Profit / Day`,
          label: `compared to ${compLabel}`,
          trend: isBetter ? 'up' : 'down',
          isPositive: isBetter
        };
      }
    }
  }

  return { costComp, incomeComp, netComp, avgDailyComp };
}

export function DashboardContent({ month, isArchive = false }) {
  const { stats, dailyTrends, insights, lines, loading, error } = useKpiData(month);

  // For Live Dashboard: Load October ('2026-10'), September ('2026-09'), August ('2026-08'), and July ('2026-07') archives for tabs & comparisons
  const { stats: octoberStats, dailyTrends: octoberDailyTrends, lines: octoberLines, rawEngine: octoberEngine } = useKpiData('2026-10');
  const { stats: septemberStats, dailyTrends: septemberDailyTrends, lines: septemberLines, rawEngine: septemberEngine } = useKpiData('2026-09');
  const { stats: augustStats, dailyTrends: augustDailyTrends, lines: augustLines, rawEngine: augustEngine } = useKpiData('2026-08');
  const { stats: julyStats, dailyTrends: julyDailyTrends, lines: julyLines, rawEngine: julyEngine } = useKpiData('2026-07');
  const [selectedCardMonth, setSelectedCardMonth] = useState('current'); // 'current' | 'october' | 'september' | 'august' | 'july'
  const [selectedMobileLine, setSelectedMobileLine] = useState('A');
  const [interactiveDay, setInteractiveDay] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef(null);
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
    
    // Only handle horizontal swipes with at least 25px motion where horizontal exceeds vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 25) {
      const linesOrder = ['A', 'B', 'C', 'D'];
      const currentIndex = linesOrder.indexOf(selectedMobileLine);
      
      if (deltaX < 0) {
        // Swiped left -> Advance to next line (exactly 1 step)
        if (currentIndex < linesOrder.length - 1) {
          setSelectedMobileLine(linesOrder[currentIndex + 1]);
        }
      } else if (deltaX > 0) {
        // Swiped right -> Go back to previous line (exactly 1 step)
        if (currentIndex > 0) {
          setSelectedMobileLine(linesOrder[currentIndex - 1]);
        }
      }
    }
    
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

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
    return <div className="text-red-500 text-center mt-20 font-medium bg-[rgba(255,0,0,0.1)] p-4 rounded-xl">Error loading data: {error}</div>;
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

  const octoberDateComponents = {
    startDay: '1st',
    endDay: '31st',
    month: 'October',
    year: '2026'
  };

  const septemberDateComponents = {
    startDay: '1st',
    endDay: '30th',
    month: 'September',
    year: '2026'
  };

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

  // ── LIKE-FOR-LIKE / PACE-MATCHED SLICES FOR PAST MONTHS ──
  const currentWorkingDays = stats?.workingDays > 0 ? stats.workingDays : (dailyTrends?.length || 1);
  const octoberPaced = getPacedMonthData(octoberDailyTrends, octoberLines, octoberEngine, currentWorkingDays);
  const septemberPaced = getPacedMonthData(septemberDailyTrends, septemberLines, septemberEngine, currentWorkingDays);
  const augustPaced = getPacedMonthData(augustDailyTrends, augustLines, augustEngine, currentWorkingDays);
  const julyPaced = getPacedMonthData(julyDailyTrends, julyLines, julyEngine, currentWorkingDays);

  if (!stats) return <DashboardSkeleton />;

  // Contextual labels - benchmark directly against October (replacing September)
  let livePeriodLabel = "October";
  if (!isArchive) {
    if (octoberPaced?.dateInfo?.startDay && octoberPaced?.dateInfo?.endDay) {
      const sD = parseInt(octoberPaced.dateInfo.startDay, 10);
      const eD = parseInt(octoberPaced.dateInfo.endDay, 10);
      livePeriodLabel = `October (${sD}${getOrdinal(sD)}–${eD}${getOrdinal(eD)})`;
    } else if (dateComponents?.startDay && dateComponents?.endDay) {
      livePeriodLabel = `October (${dateComponents.startDay}–${dateComponents.endDay})`;
    }
  }

  const livePaceLabel = dateComponents?.startDay && dateComponents?.endDay
    ? `November (${dateComponents.startDay}–${dateComponents.endDay})`
    : `November (Current Pace)`;

  // Bidirectional comparisons
  const liveComparison = computeMetricComparison(stats, octoberPaced?.stats || octoberStats, livePeriodLabel);
  const octoberComparison = computeMetricComparison(octoberPaced?.stats || octoberStats, stats, livePaceLabel);
  const septemberComparison = computeMetricComparison(septemberPaced?.stats || septemberStats, stats, livePaceLabel);
  const augustComparison = computeMetricComparison(augustPaced?.stats || augustStats, stats, livePaceLabel);
  const julyComparison = computeMetricComparison(julyPaced?.stats || julyStats, stats, livePaceLabel);

  const totalLines = stats?.totalLinesCount || lines?.length || 4;

  let activeDateInfo = formatDateRangeInfo(startDate, endDate);
  let displayStats = stats;
  let activeActiveLines = lines || [];
  let activeComp = liveComparison;

  if (!isArchive) {
    if (selectedCardMonth === 'october' && (octoberPaced || octoberStats)) {
      displayStats = octoberPaced?.stats || octoberStats;
      activeDateInfo = octoberPaced?.dateInfo || formatDateRangeInfo(null, null, 'october', '2026');
      activeActiveLines = octoberPaced?.lines || octoberLines || lines || [];
      activeComp = octoberComparison;
    } else if (selectedCardMonth === 'september' && (septemberPaced || septemberStats)) {
      displayStats = septemberPaced?.stats || septemberStats;
      activeDateInfo = septemberPaced?.dateInfo || formatDateRangeInfo(null, null, 'september', '2026');
      activeActiveLines = septemberPaced?.lines || septemberLines || lines || [];
      activeComp = septemberComparison;
    } else if (selectedCardMonth === 'august' && (augustPaced || augustStats)) {
      displayStats = augustPaced?.stats || augustStats;
      activeDateInfo = augustPaced?.dateInfo || formatDateRangeInfo(null, null, 'august', '2026');
      activeActiveLines = augustPaced?.lines || augustLines || lines || [];
      activeComp = augustComparison;
    } else if (selectedCardMonth === 'july' && (julyPaced || julyStats)) {
      displayStats = julyPaced?.stats || julyStats;
      activeDateInfo = julyPaced?.dateInfo || formatDateRangeInfo(null, null, 'july', '2026');
      activeActiveLines = julyPaced?.lines || julyLines || lines || [];
      activeComp = julyComparison;
    }
  }

  const isPastMonth = !isArchive && selectedCardMonth !== 'current';

  return (
    <>
      <div className="space-y-6 animate-[fade-up_0.4s_ease-out_both] no-print">
        {/* Mobile Attached Visual Condition Trigger (Attached directly to top nav bar) */}
        {!isArchive && (
          <div className="md:hidden -mx-3.5 sm:-mx-5 -mt-3.5 sm:-mt-5 mb-2 relative overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAnimation(!showAnimation)}
              className="w-full pt-1.5 pb-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors active:bg-[var(--color-surface-hover)]/30 cursor-pointer group select-none border-none shadow-none"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                background: 'linear-gradient(to bottom, var(--color-bg-card) 0%, var(--color-bg-card) 35%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, transparent 100%)',
              }}
              aria-expanded={showAnimation}
            >
              <span className="text-[8.5px] italic text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors leading-none">
                {showAnimation ? 'hide visual condition of factory' : 'see visual condition of factory'}
              </span>
              <ChevronDown 
                size={11} 
                className={cn(
                  "transition-transform duration-300 text-[var(--color-text-muted)]",
                  showAnimation 
                    ? "rotate-180 text-[var(--color-primary)]" 
                    : "animate-fast-arrow-blink"
                )} 
              />
            </button>
          </div>
        )}

        {/* Titanic Animation (Live Dashboard Only) - Smoothly descends from above */}
        {!isArchive && showAnimation && (() => {
          const liveRecovery = (stats?.totalCost || 0) > 0 
            ? ((stats.totalIncome / stats.totalCost) * 100) 
            : (stats?.netProfit >= 0 ? 100 : 0);
          const activeNet = interactiveDay !== null && currentDayData?.profit !== undefined
            ? currentDayData.profit
            : stats.netProfit;
          const activeRecovery = interactiveDay !== null && currentDayData?.cost > 0
            ? ((currentDayData.income / currentDayData.cost) * 100)
            : liveRecovery;

          return (
            <div className="flex flex-col relative z-10 -mx-3.5 sm:-mx-5 md:-mx-8 w-[calc(100%+1.75rem)] sm:w-[calc(100%+2.5rem)] md:w-[calc(100%+4rem)] overflow-hidden mb-3 animate-[fade-down_0.35s_cubic-bezier(0.16,1,0.3,1)] origin-top">
              <div className="w-full transition-all duration-500 ease-in-out origin-top overflow-hidden border-none rounded-none opacity-100">
                <TitanicAnimation 
                  netProfit={activeNet} 
                  recoveryPercentage={activeRecovery}
                  totalIncome={stats.totalIncome}
                  totalCost={stats.totalCost}
                  simDay={displayDay} 
                />
              </div>
            </div>
          );
        })()}

        {/* Desktop Visuals Toggle (Hidden on Mobile) */}
        {!isArchive && (
          <div className="hidden md:flex justify-center items-center mb-3">
            <button
              onClick={() => setShowAnimation(!showAnimation)}
              className="px-3 py-1 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface)] text-[10px] font-medium tracking-wider uppercase transition-all active:scale-95 cursor-pointer select-none leading-tight"
            >
              {showAnimation ? 'Hide Visuals' : 'Show Visuals'}
            </button>
          </div>
        )}

        {/* FACTORY FINANCIALS HEADER */}
        <div className="relative flex flex-col items-center justify-center mb-3 sm:mb-4 md:mb-5 px-1 sm:px-0">
          <h2 className="text-[20px] sm:text-[23px] md:text-[27px] font-bold tracking-normal uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] text-center leading-tight">
            FACTORY FINANCIALS
          </h2>
          <p className="text-[8.5px] sm:text-[11.5px] md:text-xs text-[var(--color-text-muted)] font-medium tracking-normal text-center mt-0.5 flex items-center justify-center whitespace-nowrap gap-1">
            <span className="hidden sm:inline">Financial Data Analyst :</span>
            <span className="sm:hidden">Analyst :</span>
            <span className="text-[var(--color-primary)] font-bold uppercase italic">Rofiqul Islam Zia</span>
            <span className="text-[var(--color-text-secondary)] font-semibold">(Merchandiser)</span>
          </p>

          {/* PC View Month & Date Selector: Placed under Title & Analyst with kind space, out of the shape */}
          <div className="hidden md:flex w-full justify-center mt-3.5 md:mt-4">
            <MonthSelectorBar
              selectedMonth={selectedCardMonth}
              onSelectMonth={setSelectedCardMonth}
              dateInfo={activeDateInfo}
              workingDays={displayStats?.workingDays}
              isPastMonth={isPastMonth}
              isArchive={isArchive}
            />
          </div>
        </div>

        {/* KPI Overview Section */}
        <div className="relative rounded-none border-0 bg-transparent backdrop-blur-none p-0 shadow-none overflow-visible mb-6 -mx-2 sm:mx-0">
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Dynamic Date Context & 6 KPI Metric Cards Grid (Pace-Matched) */}
          {(() => {
            const costComp = isArchive ? null : activeComp.costComp;
            const incomeComp = isArchive ? null : activeComp.incomeComp;
            const netComp = isArchive ? null : activeComp.netComp;
            const avgDailyComp = isArchive ? null : activeComp.avgDailyComp;

            const actLinesCount = displayStats?.activeLinesCount !== undefined ? displayStats.activeLinesCount : 4;
            const totLinesCount = displayStats?.totalLinesCount || totalLines || 4;
            const isAllLines = actLinesCount === totLinesCount;

            const linesComp = isArchive ? null : {
              highlight: isAllLines ? `All ${totLinesCount} Lines` : `${actLinesCount} of ${totLinesCount} Lines`,
              label: "active manufacturing operations",
              trend: "neutral",
              isPositive: true
            };

            const daysComp = isArchive ? null : {
              highlight: `${displayStats?.workingDays || 0} Days`,
              label: isPastMonth ? `matching November pace (${displayStats?.workingDays} active days)` : `matching ${livePeriodLabel} pace`,
              trend: "neutral",
              isPositive: true
            };

            const isNetProfit = (displayStats?.netProfit || 0) >= 0;
            const isAvgDailyProfit = (displayStats?.averageDailyProfit || 0) >= 0;
            const currentActiveLines = activeActiveLines;
            const activeLinesToRender = ['A', 'B', 'C', 'D'].filter((lineId) => {
              const lineData = currentActiveLines?.find(l => l.id?.toUpperCase() === lineId);
              if (!lineData) return false;
              return (lineData.totalProduction > 0 || lineData.totalCost > 0 || (lineData.activeDaysCount && lineData.activeDaysCount > 0));
            });
            const renderedActiveLines = activeLinesToRender.length > 0 ? activeLinesToRender : ['A', 'B', 'C'];

            // Calculate line loss and max loss across rendered lines for dynamic red heat map effect
            const getLineLoss = (lData) => {
              if (!lData) return 0;
              if (typeof lData.netProfit === 'number' && lData.netProfit < 0) return Math.abs(lData.netProfit);
              const diff = (lData.totalCost || 0) - (lData.totalIncome || 0);
              return diff > 0 ? diff : 0;
            };

            const maxLineLoss = Math.max(
              ...renderedActiveLines.map(id => {
                const ld = currentActiveLines?.find(l => l.id?.toUpperCase() === id);
                return getLineLoss(ld);
              }),
              1
            );

            const recoveryPercent = (displayStats?.totalCost || 0) > 0 
              ? (((displayStats?.totalIncome || 0) / displayStats.totalCost) * 100) 
              : 0;

            let activeDailyTrends = dailyTrends;
            if (!isArchive) {
              if (selectedCardMonth === 'october' && octoberDailyTrends) {
                activeDailyTrends = octoberDailyTrends.slice(0, currentWorkingDays);
              } else if (selectedCardMonth === 'september' && septemberDailyTrends) {
                activeDailyTrends = septemberDailyTrends.slice(0, currentWorkingDays);
              } else if (selectedCardMonth === 'august' && augustDailyTrends) {
                activeDailyTrends = augustDailyTrends.slice(0, currentWorkingDays);
              } else if (selectedCardMonth === 'july' && julyDailyTrends) {
                activeDailyTrends = julyDailyTrends.slice(0, currentWorkingDays);
              }
            }

            const lastDayEntry = (activeDailyTrends && activeDailyTrends.length > 0)
              ? activeDailyTrends[activeDailyTrends.length - 1]
              : null;
            const lastDayProfit = lastDayEntry?.profit !== undefined ? lastDayEntry.profit : 0;
            const isLastDayProfit = lastDayProfit >= 0;
            const lastDayDateFormatted = lastDayEntry?.date 
              ? `${format(parseISO(lastDayEntry.date), 'MMM').toUpperCase()} ${format(parseISO(lastDayEntry.date), 'do')}` 
              : '';

            return (
              <>
                {/* Mobile View Only: Month & Date Selector Bar kept inside mobile container */}
                <div className="md:hidden">
                  <MonthSelectorBar
                    selectedMonth={selectedCardMonth}
                    onSelectMonth={setSelectedCardMonth}
                    dateInfo={activeDateInfo}
                    workingDays={displayStats?.workingDays}
                    isPastMonth={isPastMonth}
                    isArchive={isArchive}
                  />
                </div>
                {/* ── MOBILE VIEW ONLY: Wireframe-matched Redesign Layout ── */}
                <div className="md:hidden flex flex-col gap-1.5 relative z-10 px-0.5">
                  
                  {/* 1. TOP COMBINED CARD: NET LOSS (TOP) + AVERAGE DAILY LOSS (BOTTOM) */}
                  <Card 
                    hover 
                    data-color={isNetProfit ? 'success' : 'danger'}
                    className="p-3.5 sm:p-4 rounded-2xl transition-all flex flex-col justify-between shadow-sm overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      backgroundImage: isNetProfit 
                        ? 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(16, 185, 129, 0.12) 100%)' 
                        : 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(239, 68, 68, 0.12) 100%)'
                    }}
                  >
                    {/* Top Row: Net Loss Title & Value + Animated Trend Curve */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none">
                          {isNetProfit ? "Net Profit" : "Net Loss"}
                        </h3>

                        <p className={cn(
                          "font-black tracking-tight text-[28px] sm:text-[34px] leading-tight mt-1 mb-0.5 [filter:var(--shadow-text)] truncate",
                          isNetProfit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                        )}>
                          <AnimatedNumber 
                            value={Math.abs(Math.round(displayStats.netProfit))} 
                            prefix={isNetProfit ? "+BDT " : "BDT -"} 
                          />
                        </p>
                      </div>

                      {/* Right Side Trend Curve */}
                      <div className="shrink-0 flex items-center justify-center pl-1">
                        <AnimatedTrendCurve isProfit={isNetProfit} className="w-14 sm:w-16 h-10 sm:h-11" />
                      </div>
                    </div>

                    {/* Spacing */}
                    <div className="w-full my-1.5" />

                    {/* Bottom Row: Comparing Context (Left) + Average Daily Loss (Right) */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      {/* Left: Comparing Text (Vertically centered / under divider) */}
                      <div className="min-w-0 flex-1 pr-1">
                        {netComp && (
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10.5px] leading-tight italic">
                            <span className={cn(
                              "font-bold inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap",
                              netComp.trend === 'neutral'
                                ? "text-[var(--color-primary)]"
                                : netComp.isPositive
                                  ? "text-[var(--color-success-text)]"
                                  : "text-[var(--color-danger-text)]"
                            )}>
                              {netComp.trend === 'up' && '▲ '}
                              {netComp.trend === 'down' && '▼ '}
                              {netComp.trend === 'neutral' && '• '}
                              {netComp.highlight}
                            </span>
                            <span className="text-[var(--color-text-secondary)] font-medium break-words">
                              {netComp.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Average Daily Loss Metric */}
                      <div className="shrink-0 text-right flex flex-col items-end justify-center">
                        <span className="text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] leading-none">
                          {isAvgDailyProfit ? "Avg Daily Profit" : "Average Daily Loss"}
                        </span>
                        <p className={cn(
                          "font-extrabold text-[14.5px] sm:text-[16px] tracking-tight mt-1 leading-none [filter:var(--shadow-text)] whitespace-nowrap",
                          isAvgDailyProfit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                        )}>
                          <AnimatedNumber 
                            value={Math.abs(Math.round(displayStats.averageDailyProfit))} 
                            prefix={isAvgDailyProfit ? "+BDT " : "BDT -"} 
                            suffix=" / day"
                          />
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* 1b. MOBILE ONLY: LAST RECORDED DAY PROFIT/LOSS CARD */}
                  {lastDayEntry && (
                    <Card
                      hover
                      data-color={isLastDayProfit ? 'success' : 'danger'}
                      className="p-3 sm:p-3.5 rounded-2xl transition-all shadow-sm overflow-hidden border-0"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        backgroundImage: isLastDayProfit 
                          ? 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(16, 185, 129, 0.12) 100%)' 
                          : 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(239, 68, 68, 0.12) 100%)'
                      }}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        {/* Left: Last day loss (OCT 13th) */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs sm:text-[13px] font-bold text-[var(--color-text-secondary)] whitespace-nowrap">
                            {isLastDayProfit ? 'Last day profit' : 'Last day loss'}{' '}
                            <span className="text-[var(--color-text-main)] font-extrabold">({lastDayDateFormatted})</span>
                          </span>
                        </div>

                        {/* Right: Actual Loss/Profit with BDT prefix */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <p className={cn(
                            "font-black tracking-tight text-[15px] sm:text-[16px] leading-none [filter:var(--shadow-text)] whitespace-nowrap",
                            isLastDayProfit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                          )}>
                            <AnimatedNumber 
                              value={Math.abs(Math.round(lastDayProfit))} 
                              prefix={isLastDayProfit ? "+BDT " : "BDT -"} 
                            />
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* 2. TOTAL INCOME & TOTAL COST SIDE-BY-SIDE IN ONE ROW */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {/* 2a. Total Income Card */}
                    <Card
                      hover
                      data-color="primary"
                      className="p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between shadow-sm transition-all"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <div>
                        <h4 className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] leading-tight">
                          Total Income
                        </h4>
                        <p className="font-black text-[18px] sm:text-[20px] tracking-tight text-[var(--color-primary)] mt-1 mb-0.5 leading-tight [filter:var(--shadow-text)] truncate">
                          <AnimatedNumber value={Math.round(displayStats.totalIncome)} prefix="BDT " />
                        </p>
                      </div>
                      {incomeComp && (
                        <div className="flex flex-col items-start gap-y-0.5 text-[9px] sm:text-[9.5px] leading-snug italic pt-1 mt-1">
                          <span className={cn("font-bold shrink-0 leading-normal", incomeComp.isPositive ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]")}>
                            {incomeComp.highlight}
                          </span>
                          <span className="text-[var(--color-text-muted)] text-[8.5px] sm:text-[9px] leading-normal truncate w-full">{incomeComp.label}</span>
                        </div>
                      )}
                    </Card>

                    {/* 2b. Total Cost Card */}
                    <Card
                      hover
                      className="p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between shadow-sm transition-all"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <div>
                        <h4 className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] leading-tight">
                          Total Cost
                        </h4>
                        <p className="font-black text-[18px] sm:text-[20px] tracking-tight text-[var(--color-text-main)] mt-1 mb-0.5 leading-tight [filter:var(--shadow-text)] truncate">
                          <AnimatedNumber value={Math.round(displayStats.totalCost)} prefix="BDT " />
                        </p>
                      </div>
                      {costComp && (
                        <div className="flex flex-col items-start gap-y-0.5 text-[9px] sm:text-[9.5px] leading-snug italic pt-1 mt-1">
                          <span className={cn("font-bold shrink-0 leading-normal", costComp.isPositive ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]")}>
                            {costComp.highlight}
                          </span>
                          <span className="text-[var(--color-text-muted)] text-[8.5px] sm:text-[9px] leading-normal truncate w-full">{costComp.label}</span>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* 2c. COST RECOVERY & PROFIT (3 DONUTS FULL-LENGTH FROM LEFT TO RIGHT) */}
                  <Card
                    hover
                    data-color={displayStats.totalIncome >= displayStats.totalCost ? "success" : "primary"}
                    className="px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm relative overflow-hidden transition-all w-full"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                  >
                    <CostRecoveryPie
                      percentage={recoveryPercent}
                      isProfitable={displayStats.totalIncome >= displayStats.totalCost}
                      totalIncome={displayStats.totalIncome}
                      totalCost={displayStats.totalCost}
                      netProfit={displayStats.netProfit}
                      className="w-full"
                    />
                  </Card>

                  {/* 3. BOTTOM FULL-WIDTH PRODUCTION LINES OVERVIEW CARD */}
                  <Card
                    hover
                    className="p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-col gap-2.5 transition-all"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                  >
                    {/* Header Row: Title & Active Lines Counter (One line on mobile from left to right) */}
                    <div className="flex items-center justify-between w-full">
                      <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none">
                        Production Lines
                      </h4>
                      <p className="font-black text-[14px] sm:text-[16px] text-[var(--color-text-main)] tracking-tight leading-none [filter:var(--shadow-text)] flex items-center gap-1">
                        <AnimatedNumber value={actLinesCount} /> of <AnimatedNumber value={totLinesCount} /> <span className="text-[11px] sm:text-[12px] font-bold text-[var(--color-primary)] uppercase ml-0.5">Active</span>
                      </p>
                    </div>

                    {/* Lines Badges List: Line Name, Item, & Total Production (Stacked view in mobile with dynamic Red Heat Map) */}
                    <div className="flex flex-col gap-1.5 pt-1.5 sm:pt-2">
                      {renderedActiveLines.map((lineId) => {
                        const lineData = currentActiveLines?.find(l => l.id?.toUpperCase() === lineId);
                        const itemDesc = (lineData?.items && lineData.items.length > 0 ? lineData.items.join(', ') : null) || lineData?.item || lineData?.lastActiveDay?.item || lineData?.today?.item || DEFAULT_LINE_ITEMS[lineId] || 'Polo Shirt';
                        const totalProd = lineData?.totalProduction || 0;
                        const lineLoss = getLineLoss(lineData);
                        const lossRatio = maxLineLoss > 0 ? Math.min(1, Math.max(0, lineLoss / maxLineLoss)) : 0;
                        const activeBreakdown = lineData?.itemBreakdown?.filter(ib => (ib.qty || 0) > 0) || [];
                        const hasMultipleItems = activeBreakdown.length > 1;

                        return (
                          <div
                            key={lineId}
                            className="rounded-[6px] transition-all min-w-0 flex items-center justify-between p-2 sm:p-2.5 gap-2 relative overflow-hidden"
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              backgroundImage: lineLoss > 0
                                ? `linear-gradient(270deg, rgba(239, 68, 68, ${(0.06 + lossRatio * 0.14).toFixed(3)}) 0%, rgba(239, 68, 68, ${(0.015 + lossRatio * 0.04).toFixed(3)}) 45%, transparent 85%)`
                                : undefined,
                              border: '1px solid',
                              borderColor: lineLoss > 0
                                ? `rgba(239, 68, 68, ${(0.12 + lossRatio * 0.20).toFixed(2)})`
                                : 'var(--color-border)',
                              borderRight: lineLoss > 0
                                ? `3.5px solid rgba(239, 68, 68, ${(0.35 + lossRatio * 0.50).toFixed(2)})`
                                : '3.5px solid transparent',
                              boxShadow: lineLoss > 0
                                ? `0 1px 3px rgba(0,0,0,0.2), inset -6px 0 12px rgba(239, 68, 68, ${(0.05 + lossRatio * 0.15).toFixed(3)})`
                                : undefined
                            }}
                          >
                            {/* Line Info: Line Name & Item Breakdown */}
                            <div className="min-w-0 flex-1 pr-1">
                              <span className="font-bold text-[var(--color-text-main)] truncate block leading-tight text-[10.5px] sm:text-xs">
                                Line {lineId}
                              </span>
                              <p className="font-medium text-[var(--color-text-muted)] truncate mt-0.5 leading-tight text-[8.5px] sm:text-[9.5px]">
                                {hasMultipleItems ? (
                                  activeBreakdown.map((ib, idx) => (
                                    <span key={ib.name}>
                                      {idx > 0 && ", "}
                                      <span className="font-bold text-[var(--color-text-secondary)]">{ib.qty.toLocaleString()}</span>{" "}
                                      <span>{toTitleCase(ib.name)}</span>
                                    </span>
                                  ))
                                ) : (
                                  toTitleCase(itemDesc)
                                )}
                              </p>
                            </div>

                            {/* Total Production Output */}
                            <div className="text-right shrink-0 pl-1.5">
                              <span 
                                className="font-bold text-[var(--color-text-main)] block leading-tight text-[10.5px] sm:text-xs whitespace-nowrap"
                                title={hasMultipleItems ? activeBreakdown.map(ib => `${ib.qty.toLocaleString()} ${toTitleCase(ib.name)}`).join(', ') + ` (Total: ${totalProd.toLocaleString()} pcs)` : undefined}
                              >
                                <AnimatedNumber value={totalProd} />
                              </span>
                              <span className="font-semibold uppercase text-[var(--color-text-muted)] block leading-none text-[7.5px] sm:text-[8px] mt-0.5">
                                {hasMultipleItems ? 'total pcs' : 'pcs'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                {/* ── DESKTOP/PC VIEW: Wireframe-matched Responsive 3-Column Layout ── */}
                <div className="hidden md:grid md:grid-cols-12 gap-3.5 lg:gap-4 xl:gap-5 relative z-10 px-0 items-stretch">
                  
                  {/* COLUMN 1 (LEFT): Net Loss Card (Top) + Stacked Income & Cost Cards (Bottom) */}
                  <div className="md:col-span-12 lg:col-span-4 xl:col-span-4 flex flex-col gap-3 xl:gap-3.5 justify-between">
                    
                    {/* Top Combined Card: Net Loss & Average Daily Loss */}
                    <Card 
                      hover 
                      data-color={isNetProfit ? 'success' : 'danger'}
                      className="p-4 sm:p-5 xl:p-6 rounded-2xl transition-all flex flex-col justify-between shadow-sm md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] md:hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] border-0 md:border-0 overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        backgroundImage: isNetProfit 
                          ? 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(16, 185, 129, 0.12) 100%)' 
                          : 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(239, 68, 68, 0.12) 100%)'
                      }}
                    >
                      {/* Top Row: Net Loss Title & Value + Animated Trend Curve */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs xl:text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none">
                            {isNetProfit ? "Net Profit" : "Net Loss"}
                          </h3>

                          <p className={cn(
                            "font-black tracking-tight text-2xl sm:text-3xl lg:text-[32px] xl:text-[34px] leading-tight mt-1.5 mb-0.5 [filter:var(--shadow-text)] truncate",
                            isNetProfit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                          )}>
                            <span className="text-sm sm:text-base lg:text-lg font-bold opacity-80 mr-0.5">{isNetProfit ? "+BDT " : "BDT -"}</span>
                            <AnimatedNumber value={Math.abs(Math.round(displayStats.netProfit))} />
                          </p>
                        </div>

                        {/* Right Side Trend Curve */}
                        <div className="shrink-0 flex items-center justify-center pl-1.5">
                          <AnimatedTrendCurve isProfit={isNetProfit} className="w-14 sm:w-16 xl:w-20 h-10 sm:h-11 xl:h-13" />
                        </div>
                      </div>

                      {/* Divider Separator Line */}
                      <div className="w-full h-px bg-[var(--color-border)]/20 my-2 xl:my-2.5" />

                      {/* Bottom Row: Comparing Context (PC View Only - Average Daily Loss moved to Card below) */}
                      {netComp && (
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11px] xl:text-xs leading-snug italic pt-0.5">
                          <span className={cn(
                            "font-bold inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap leading-normal",
                            netComp.trend === 'neutral'
                              ? "text-[var(--color-primary)]"
                              : netComp.isPositive
                                ? "text-[var(--color-success-text)]"
                                : "text-[var(--color-danger-text)]"
                          )}>
                            {netComp.trend === 'up' && '▲ '}
                            {netComp.trend === 'down' && '▼ '}
                            {netComp.trend === 'neutral' && '• '}
                            {netComp.highlight}
                          </span>
                          <span className="text-[var(--color-text-secondary)] font-medium leading-normal">
                            {netComp.label}
                          </span>
                        </div>
                      )}
                    </Card>

                    {/* Combined Last Day Loss & Average Daily Loss Card (Desktop) */}
                    <Card
                      hover
                      data-color={isLastDayProfit ? 'success' : 'danger'}
                      className="p-3 px-3.5 xl:p-3.5 xl:px-4 rounded-2xl transition-all shadow-sm md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] md:hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] border-0 overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        backgroundImage: isLastDayProfit 
                          ? 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(16, 185, 129, 0.10) 100%)' 
                          : 'linear-gradient(135deg, var(--color-bg-card) 55%, rgba(239, 68, 68, 0.10) 100%)'
                      }}
                    >
                      <div className="flex flex-col gap-2 xl:gap-2.5 w-full">
                        {/* Row 1: Last day loss with date & value */}
                        {lastDayEntry && (
                          <div className="flex items-center justify-between w-full gap-1.5">
                            <span className="text-[11px] xl:text-xs font-semibold text-[var(--color-text-secondary)] whitespace-nowrap">
                              {isLastDayProfit ? 'Last day profit' : 'Last day loss'}{' '}
                              <span className="text-[var(--color-text-main)] font-bold">({lastDayDateFormatted})</span>
                            </span>
                            <p className={cn(
                              "font-black tracking-tight text-xs xl:text-sm leading-none [filter:var(--shadow-text)] whitespace-nowrap",
                              isLastDayProfit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                            )}>
                              <AnimatedNumber 
                                value={Math.abs(Math.round(lastDayProfit))} 
                                prefix={isLastDayProfit ? "+BDT " : "BDT -"} 
                              />
                            </p>
                          </div>
                        )}

                        {lastDayEntry && <div className="w-full h-px bg-[var(--color-border)]/20" />}

                        {/* Row 2: Average daily loss with average amount */}
                        <div className="flex items-center justify-between w-full gap-1.5">
                          <span className="text-[11px] xl:text-xs font-semibold text-[var(--color-text-secondary)] whitespace-nowrap">
                            {isAvgDailyProfit ? "Avg daily profit" : "Average daily loss"}
                          </span>
                          <p className={cn(
                            "font-black tracking-tight text-xs xl:text-sm leading-none [filter:var(--shadow-text)] whitespace-nowrap",
                            isAvgDailyProfit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                          )}>
                            <AnimatedNumber 
                              value={Math.abs(Math.round(displayStats.averageDailyProfit))} 
                              prefix={isAvgDailyProfit ? "+BDT " : "BDT -"} 
                              suffix=" / day"
                            />
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Bottom Row: 2 Separate Cards (Total Income & Total Cost) */}
                    <div className="grid grid-cols-2 gap-2 xl:gap-3 flex-1">
                      {/* Total Income Card */}
                      <Card
                        hover
                        data-color="primary"
                        className="p-3 xl:p-4 rounded-2xl flex flex-col justify-between shadow-sm md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] md:hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] border-0 md:border-0 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                      >
                        <div>
                          <h4 className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] leading-tight truncate">
                            Total Income
                          </h4>
                          <p className="font-black text-[13.5px] xl:text-base 2xl:text-lg tracking-tight text-[var(--color-primary)] mt-1 mb-0.5 leading-tight [filter:var(--shadow-text)] truncate">
                            <AnimatedNumber value={Math.round(displayStats.totalIncome)} prefix="BDT " />
                          </p>
                        </div>
                        {incomeComp && (
                          <div className="flex flex-col items-start gap-y-0.5 text-[10px] xl:text-[11px] leading-snug italic pt-1 mt-1">
                            <span className={cn("font-bold shrink-0 leading-normal", incomeComp.isPositive ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]")}>
                              {incomeComp.highlight}
                            </span>
                            <span className="text-[var(--color-text-muted)] text-[9.5px] xl:text-[10px] leading-normal truncate w-full">{incomeComp.label}</span>
                          </div>
                        )}
                      </Card>

                      {/* Total Cost Card */}
                      <Card
                        hover
                        className="p-3 xl:p-4 rounded-2xl flex flex-col justify-between shadow-sm md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] md:hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] border-0 md:border-0 transition-all"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                      >
                        <div>
                          <h4 className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] leading-tight truncate">
                            Total Cost
                          </h4>
                          <p className="font-black text-[13.5px] xl:text-base 2xl:text-lg tracking-tight text-[var(--color-text-main)] mt-1 mb-0.5 leading-tight [filter:var(--shadow-text)] truncate">
                            <AnimatedNumber value={Math.round(displayStats.totalCost)} prefix="BDT " />
                          </p>
                        </div>
                        {costComp && (
                          <div className="flex flex-col items-start gap-y-0.5 text-[10px] xl:text-[11px] leading-snug italic pt-1 mt-1">
                            <span className={cn("font-bold shrink-0 leading-normal", costComp.isPositive ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]")}>
                              {costComp.highlight}
                            </span>
                            <span className="text-[var(--color-text-muted)] text-[9.5px] xl:text-[10px] leading-normal truncate w-full">{costComp.label}</span>
                          </div>
                        )}
                      </Card>
                    </div>

                  </div>

                  {/* COLUMN 2 (MIDDLE): Cost Recovery 3-Donut Card */}
                  <div className="md:col-span-6 lg:col-span-4 xl:col-span-4 flex flex-col">
                    <Card
                      hover
                      data-color={displayStats.totalIncome >= displayStats.totalCost ? "success" : "primary"}
                      className="p-4 sm:p-5 xl:p-6 rounded-2xl flex flex-col justify-between shadow-sm md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] md:hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] border-0 md:border-0 relative overflow-hidden transition-all h-full"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      {/* 3 Large Donuts Fulfilling the Center of the Card */}
                      <div className="w-full flex-1 flex flex-col justify-center items-center py-2 xl:py-3 my-auto">
                        <CostRecoveryPie
                          percentage={recoveryPercent}
                          isProfitable={displayStats.totalIncome >= displayStats.totalCost}
                          totalIncome={displayStats.totalIncome}
                          totalCost={displayStats.totalCost}
                          netProfit={displayStats.netProfit}
                          hideFooter={true}
                          className="w-full my-auto"
                        />
                      </div>

                      {/* 1 Title & 1 Subtitle placed under the 3 Donuts (PC View Only) */}
                      <div className="w-full text-center pt-2 sm:pt-2.5 mt-auto px-1">
                        <h4 className="text-xs xl:text-[13px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none text-center">
                          Cost Recovery & Margin
                        </h4>
                        <p className="text-[10px] min-[1150px]:text-[10.5px] xl:text-[11px] text-[var(--color-text-muted)] font-medium text-center mt-1 leading-tight">
                          {displayStats.totalIncome >= displayStats.totalCost ? (
                            <span className="text-[var(--color-success-text)] font-semibold">Target Met • Production costs fully recovered</span>
                          ) : (
                            <>
                              <span className="text-[var(--color-primary)] font-bold">Recovered {Math.round(recoveryPercent)}%</span>
                              <span className="mx-1.5 opacity-40">•</span>
                              <span>BDT {Math.max(0, Math.round(displayStats.totalCost - displayStats.totalIncome)).toLocaleString()} needed to break-even</span>
                            </>
                          )}
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* COLUMN 3 (RIGHT): Production Lines Card */}
                  <div className="md:col-span-6 lg:col-span-4 xl:col-span-4 flex flex-col">
                    <Card
                      hover
                      className="p-4 sm:p-5 xl:p-6 rounded-2xl shadow-sm md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] md:hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] border-0 md:border-0 flex flex-col justify-between transition-all h-full"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      {/* Header Row: Title & Active Lines Counter */}
                      <div className="w-full text-left">
                        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none">
                          Production Lines
                        </h4>
                        <p className="font-black text-2xl sm:text-3xl xl:text-[34px] text-[var(--color-text-main)] tracking-tight mt-1.5 leading-none [filter:var(--shadow-text)]">
                          <AnimatedNumber value={actLinesCount} /> of <AnimatedNumber value={totLinesCount} /> <span className="text-sm sm:text-base xl:text-lg font-bold text-[var(--color-primary)] uppercase ml-0.5">Active</span>
                        </p>
                        <p className="text-[11px] sm:text-xs xl:text-[13px] text-[var(--color-text-muted)] font-medium mt-1 truncate">
                          Details lines and items
                        </p>
                      </div>

                      {/* Lines Badges List: Line & Item In Production (Spaced evenly to fulfill the card) */}
                      <div className="flex flex-col gap-3 xl:gap-3.5 flex-1 justify-around my-auto py-2">
                        {renderedActiveLines.map((lineId) => {
                          const lineData = currentActiveLines?.find(l => l.id?.toUpperCase() === lineId);
                          const itemDesc = (lineData?.items && lineData.items.length > 0 ? lineData.items.join(', ') : null) || lineData?.item || lineData?.lastActiveDay?.item || lineData?.today?.item || DEFAULT_LINE_ITEMS[lineId] || 'Polo Shirt';
                          const workers = lineData?.lastDay?.worker_count || lineData?.averageWorkers || 0;
                          const output = lineData?.totalProduction || 0;
                          const lineLoss = getLineLoss(lineData);
                          const lossRatio = maxLineLoss > 0 ? Math.min(1, Math.max(0, lineLoss / maxLineLoss)) : 0;
                          const activeBreakdown = lineData?.itemBreakdown?.filter(ib => (ib.qty || 0) > 0) || [];
                          const hasMultipleItems = activeBreakdown.length > 1;

                          return (
                            <div
                              key={lineId}
                              className="flex items-center justify-between gap-3 p-2.5 xl:p-3 rounded-xl transition-all relative overflow-hidden"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                backgroundImage: lineLoss > 0
                                  ? `linear-gradient(270deg, rgba(239, 68, 68, ${(0.06 + lossRatio * 0.14).toFixed(3)}) 0%, rgba(239, 68, 68, ${(0.015 + lossRatio * 0.04).toFixed(3)}) 45%, transparent 85%)`
                                  : undefined,
                                border: '1px solid',
                                borderColor: lineLoss > 0
                                  ? `rgba(239, 68, 68, ${(0.12 + lossRatio * 0.20).toFixed(2)})`
                                  : 'var(--color-border)',
                                borderRight: lineLoss > 0
                                  ? `3.5px solid rgba(239, 68, 68, ${(0.35 + lossRatio * 0.50).toFixed(2)})`
                                  : '3.5px solid transparent',
                                boxShadow: lineLoss > 0
                                  ? `inset -6px 0 12px rgba(239, 68, 68, ${(0.05 + lossRatio * 0.15).toFixed(3)})`
                                  : undefined
                              }}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {/* Line Letter Pill */}
                                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg flex items-center justify-center text-xs xl:text-sm font-black shrink-0 tracking-tight bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-xs md:shadow-none">
                                  {lineId}
                                </div>

                                {/* Line Info */}
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs xl:text-[13.5px] font-bold text-[var(--color-text-main)] truncate block leading-tight">
                                    Line {lineId}
                                  </span>
                                  <p className="text-[10px] xl:text-[11px] font-medium text-[var(--color-text-muted)] truncate leading-tight mt-0.5">
                                    {hasMultipleItems ? (
                                      activeBreakdown.map((ib, idx) => (
                                        <span key={ib.name}>
                                          {idx > 0 && ", "}
                                          <span className="font-bold text-[var(--color-text-secondary)]">{ib.qty.toLocaleString()}</span>{" "}
                                          <span>{toTitleCase(ib.name)}</span>
                                        </span>
                                      ))
                                    ) : (
                                      toTitleCase(itemDesc)
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0 pl-1.5">
                                <span 
                                  className="text-xs xl:text-[14px] font-black text-[var(--color-text-main)] block leading-tight whitespace-nowrap"
                                  title={hasMultipleItems ? activeBreakdown.map(ib => `${ib.qty.toLocaleString()} ${toTitleCase(ib.name)}`).join(', ') + ` (Total: ${output.toLocaleString()} pcs)` : undefined}
                                >
                                  {output > 0 ? (
                                    <AnimatedNumber value={output} />
                                  ) : (
                                    <><AnimatedNumber value={workers} /> w</>
                                  )}
                                </span>
                                <span className="text-[9px] xl:text-[10px] text-[var(--color-text-muted)] uppercase font-semibold block leading-none mt-0.5 whitespace-nowrap">
                                  {hasMultipleItems ? 'total pcs' : 'pcs'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                </div>
              </>
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
            },
            '2026-09': {
              url: 'https://drive.google.com/file/d/1w_yHdr0iV1AHTQcfw1TFh3igL9E9l_OQ/view?usp=sharing',
              label: 'Download PDF of September Sheets'
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
            : (selectedCardMonth === 'october' 
                ? (octoberPaced?.lines || octoberLines || lines || []) 
                : (selectedCardMonth === 'september' 
                    ? (septemberPaced?.lines || septemberLines || lines || []) 
                    : (selectedCardMonth === 'august' 
                        ? (augustPaced?.lines || augustLines || lines || []) 
                        : (selectedCardMonth === 'july'
                            ? (julyPaced?.lines || julyLines || lines || [])
                            : (lines || [])))));

          const activeMonthName = isArchive
            ? (dateComponents?.month || 'Archive')
            : (selectedCardMonth === 'october' ? 'October' : (selectedCardMonth === 'september' ? 'September' : (selectedCardMonth === 'august' ? 'August' : (selectedCardMonth === 'july' ? 'July' : (dateComponents?.month || 'November')))));

          const activeDateInfo = (() => {
            if (isArchive) {
              return formatDateRangeInfo(startDate, endDate, dateComponents?.month, dateComponents?.year);
            }
            if (selectedCardMonth === 'october') {
              return octoberPaced?.dateInfo || formatDateRangeInfo(null, null, 'october', '2026');
            }
            if (selectedCardMonth === 'september') {
              return septemberPaced?.dateInfo || formatDateRangeInfo(null, null, 'september', '2026');
            }
            if (selectedCardMonth === 'august') {
              return augustPaced?.dateInfo || formatDateRangeInfo(null, null, 'august', '2026');
            }
            if (selectedCardMonth === 'july') {
              return julyPaced?.dateInfo || formatDateRangeInfo(null, null, 'july', '2026');
            }
            return formatDateRangeInfo(startDate, endDate);
          })();

          const currentStatsForDate = isArchive
            ? stats
            : (selectedCardMonth === 'october' 
                ? (octoberPaced?.stats || octoberStats) 
                : (selectedCardMonth === 'september' 
                    ? (septemberPaced?.stats || septemberStats) 
                    : (selectedCardMonth === 'august' 
                        ? (augustPaced?.stats || augustStats) 
                        : (selectedCardMonth === 'july'
                            ? (julyPaced?.stats || julyStats)
                            : stats))));

          return (
            <div className="mt-8 md:mt-12 mb-0 md:mb-8 relative z-10">
              {/* Header Title & Date Subtitle */}
              <div className="flex flex-col items-center justify-center mb-5 sm:mb-6 text-center">
                <h2 className="text-[20px] sm:text-[23px] md:text-[27px] font-bold tracking-normal uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] text-center leading-tight">
                  LINE SUMMARY {activeMonthName.toUpperCase()}
                </h2>
                <div className="mt-1 flex flex-col items-center justify-center text-center">
                  <DashboardDateRange dateInfo={activeDateInfo} workingDays={currentStatsForDate?.workingDays} />
                  {!isArchive && selectedCardMonth !== 'current' && (
                    <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-muted)] font-medium tracking-normal mt-0.5 select-none">
                      Comparing {selectedCardMonth.slice(0, 3).toUpperCase()} (same days) with current month (NOV)
                    </p>
                  )}
                </div>
              </div>

              {/* Line Cards: Desktop 2x2 Grid + Mobile Smooth Sliding Track with Scroll Dots */}
              {(() => {
                const linesOrder = ['A', 'B', 'C', 'D'];
                const sortedActiveLines = [...activeLines].sort((a,b) => a.id.localeCompare(b.id));
                const activeLineIndex = Math.max(0, linesOrder.indexOf(selectedMobileLine));

                const renderCardInner = (line, isMobile = false) => {
                  const lastDayDateFull = line.lastDayDate ? format(parseISO(line.lastDayDate), 'do MMMM, yyyy') : (dateComponents?.endDay ? `${dateComponents.endDay} ${dateComponents.month}, ${dateComponents.year}` : '1st September, 2026');
                  const lastDayDateShort = line.lastDayDate ? format(parseISO(line.lastDayDate), 'd MMM').toUpperCase() : (dateComponents?.endDay ? `${parseInt(dateComponents.endDay, 10) || dateComponents.endDay} ${dateComponents.month.slice(0, 3)}`.toUpperCase() : '1 SEP');
                  const isLiveCurrent = !isArchive && selectedCardMonth === 'current';
                  const isInactive = (line.totalProduction || 0) === 0 && (line.totalCost || 0) === 0;
                  const isProfitable = !isInactive && (line.netProfit || 0) >= 0;

                  return (
                    <Card className={cn(
                      "relative overflow-hidden w-full p-0 flex flex-col transition-all duration-300 md:shadow-[0_3px_10px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.12)] md:hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)]",
                      isMobile ? "h-auto justify-start" : "h-full justify-between"
                    )}>
                      {/* Top-Right Corner Ambient Red Breathing Glow (Mobile view only for critical lines) */}
                      {isMobile && !isInactive && !isProfitable && (
                        <div 
                          aria-hidden="true"
                          className="absolute -top-12 -right-12 w-48 sm:w-64 h-48 sm:h-64 rounded-full pointer-events-none z-0 animate-corner-breathe"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.45) 0%, rgba(239, 68, 68, 0.18) 45%, transparent 75%)',
                            filter: 'blur(22px)'
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)] to-transparent pointer-events-none rounded-[inherit]"></div>
                      <div className={cn(
                        "flex flex-col relative z-10 flex-1",
                        isMobile 
                          ? "gap-2 p-3 sm:p-5 pt-2.5 justify-start" 
                          : "gap-3.5 p-3.5 sm:p-5 pt-4.5 justify-between"
                      )}>
                        {/* Line Top Header: Name, Status Badge, Item, Month Efficiency */}
                        <div className={cn(
                          "flex justify-between",
                          isMobile 
                            ? "flex-col gap-0.5 pb-1.5" 
                            : "flex-col sm:flex-row sm:items-center gap-2 pb-3"
                        )}>
                          <div className="flex items-center justify-between sm:justify-start gap-3">
                            <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] [filter:var(--shadow-text)]">
                              {line.name}
                            </h2>
                            
                            {isInactive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[8.5px] md:text-[9px] font-bold uppercase tracking-widest bg-zinc-500/15 text-zinc-700 dark:text-zinc-400">
                                Idle
                              </span>
                            ) : isProfitable ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[8.5px] md:text-[9px] font-bold uppercase tracking-widest bg-[var(--color-success-glow)] text-[var(--color-success-text)]">
                                Optimal
                              </span>
                            ) : isMobile ? (
                              <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-[4px] text-[8.5px] md:text-[9.5px] font-black uppercase tracking-widest border border-rose-500/40 bg-rose-500/15 text-rose-300 transition-all animate-critical-badge-breathe cursor-default select-none">
                                <Siren className="w-3 h-3 text-rose-400 shrink-0" />
                                <span>Critical</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] text-[8.5px] md:text-[9.5px] font-black uppercase tracking-widest border md:border-0 transition-all animate-emergency-strobe cursor-default">
                                <AmbulanceBeacon />
                                <span>Critical</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] md:text-xs">
                            <span className="text-[var(--color-text-muted)] text-[10px] font-semibold uppercase">ITEM :</span>
                            <span className="text-[var(--color-primary)] font-bold uppercase">
                              {isInactive ? 'Standby / Idle' : (line.item || 'Unknown')}
                            </span>
                          </div>
                        </div>

                        {/* Cost Recovery Progress Bar & Percentage */}
                        <div className={cn(isMobile ? "space-y-1 mb-0.5" : "space-y-1.5 mb-2.5")}>
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                            <span className="text-[var(--color-text-muted)]">Cost Recovery</span>
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

                          {/* Progress Bar towards 100% Cost Recovery */}
                          <div className="w-full bg-[var(--color-surface)] h-2 rounded-full overflow-hidden relative">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-700",
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

                        {/* Cumulative Month Performance Grid */}
                        <div>
                          <div className={cn("grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4", isMobile ? "gap-1.5" : "gap-2")}>
                            <div className={cn("bg-[var(--color-surface)] shadow-xs flex flex-col justify-between min-w-0", isMobile ? "p-1.5 rounded-lg" : "p-2 sm:p-2.5 xl:p-3 rounded-xl")}>
                              <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5 truncate">Production</p>
                              <p className="text-xs sm:text-sm md:text-xs xl:text-sm 2xl:text-base font-black text-[var(--color-text-main)] truncate flex items-baseline">
                                <AnimatedNumber value={line.totalProduction} />
                                <span className="text-[9px] sm:text-[10px] font-semibold text-[var(--color-text-muted)] ml-1">PCS</span>
                              </p>
                            </div>
                            
                            <div className={cn("bg-[var(--color-surface)] shadow-xs flex flex-col justify-between min-w-0", isMobile ? "p-1.5 rounded-lg" : "p-2 sm:p-2.5 xl:p-3 rounded-xl")}>
                              <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5 truncate">Income</p>
                              <p className="text-xs sm:text-sm md:text-xs xl:text-sm 2xl:text-base font-black text-[var(--color-primary)] truncate flex items-baseline">
                                <span className="text-[9.5px] sm:text-[10px] font-semibold opacity-75 mr-0.5 shrink-0">BDT</span>
                                <AnimatedNumber value={Math.round(line.totalIncome)} />
                              </p>
                            </div>

                            <div className={cn("bg-[var(--color-surface)] shadow-xs flex flex-col justify-between min-w-0", isMobile ? "p-1.5 rounded-lg" : "p-2 sm:p-2.5 xl:p-3 rounded-xl")}>
                              <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5 truncate">Cost</p>
                              <p className="text-xs sm:text-sm md:text-xs xl:text-sm 2xl:text-base font-black text-[var(--color-text-main)] truncate flex items-baseline">
                                <span className="text-[9.5px] sm:text-[10px] font-semibold opacity-75 mr-0.5 shrink-0">BDT</span>
                                <AnimatedNumber value={Math.round(line.totalCost)} />
                              </p>
                            </div>

                            <div className={cn(
                              "shadow-xs flex flex-col justify-between min-w-0",
                              isMobile ? "p-1.5 rounded-lg" : "p-2 sm:p-2.5 xl:p-3 rounded-xl",
                              isInactive
                                ? 'bg-[var(--color-surface)]'
                                : isProfitable 
                                  ? 'bg-[var(--color-success-glow)]/40' 
                                  : 'bg-[var(--color-danger-glow)]/40'
                            )}>
                              <p className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-0.5 truncate">
                                {isInactive ? 'Net Balance' : isProfitable ? 'Net Profit' : 'Net Loss'}
                              </p>
                              <p className={cn(
                                "text-xs sm:text-sm md:text-xs xl:text-sm 2xl:text-base font-black [filter:var(--shadow-text)] truncate flex items-baseline",
                                isInactive
                                  ? 'text-[var(--color-text-muted)]'
                                  : isProfitable 
                                    ? 'text-[var(--color-success-text)]' 
                                    : 'text-[var(--color-danger-text)]'
                              )}>
                                <span className="text-[9.5px] sm:text-[10px] font-semibold opacity-75 mr-0.5 shrink-0">BDT</span>
                                <AnimatedNumber value={Math.round(line.netProfit || 0)} />
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Last Recorded Day Input & Cost Recovery Efficiency */}
                        <div className={cn("bg-[var(--color-surface)]", isMobile ? "p-2 rounded-lg" : "p-2 sm:p-2.5 md:p-3 rounded-xl")}>
                          <div className={cn("flex items-center justify-between gap-1", isMobile ? "mb-1" : "mb-2")}>
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] truncate">
                              <span className="md:hidden">Last Day Input ({lastDayDateShort})</span>
                              <span className="hidden md:inline">Last Day Input ({lastDayDateFull})</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] md:text-[10.5px] font-bold text-[var(--color-text-muted)] shrink-0">
                              Cost Recovery: <span className={cn("font-extrabold", isInactive ? "text-[var(--color-text-muted)]" : (parseFloat(line.lastDayCostRecovery || 0) >= 100 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"))}>
                                <AnimatedNumber value={parseFloat(line.lastDayCostRecovery || 0)} suffix="%" decimals={1} />
                              </span>
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                            <div className={cn("bg-[var(--color-bg-card)] text-center min-w-0 flex flex-col justify-center", isMobile ? "p-1 rounded-md" : "p-1.5 sm:p-2 rounded-lg")}>
                              <p className="text-[8px] sm:text-[9px] text-[var(--color-text-muted)] font-medium uppercase truncate">Day Output</p>
                              <p className="text-[11px] sm:text-xs md:text-sm font-bold text-[var(--color-text-main)] truncate">
                                <AnimatedNumber value={line.lastDayOutput || 0} /> <span className="text-[8.5px] sm:text-[9px] text-[var(--color-text-muted)]">PCS</span>
                              </p>
                            </div>

                            <div className={cn("bg-[var(--color-bg-card)] text-center min-w-0 flex flex-col justify-center", isMobile ? "p-1 rounded-md" : "p-1.5 sm:p-2 rounded-lg")}>
                              <p className="text-[8px] sm:text-[9px] text-[var(--color-text-muted)] font-medium uppercase truncate">Day Income</p>
                              <p className="text-[11px] sm:text-xs md:text-sm font-bold text-[var(--color-primary)] truncate flex items-center justify-center">
                                <span className="text-[8.5px] sm:text-[9.5px] font-semibold opacity-75 mr-0.5">BDT</span>
                                <AnimatedNumber value={Math.round(line.lastDayIncome || 0)} />
                              </p>
                            </div>

                            <div className={cn("bg-[var(--color-bg-card)] text-center min-w-0 flex flex-col justify-center", isMobile ? "p-1 rounded-md" : "p-1.5 sm:p-2 rounded-lg")}>
                              <p className="text-[8px] sm:text-[9px] text-[var(--color-text-muted)] font-medium uppercase truncate">
                                Day Net {isInactive ? 'Bal' : (line.lastDayProfit >= 0 ? 'Profit' : 'Loss')}
                              </p>
                              <p className={cn(
                                "text-[11px] sm:text-xs md:text-sm font-bold truncate flex items-center justify-center",
                                isInactive || ((line.lastDayOutput || 0) === 0 && (line.lastDayCost || 0) === 0)
                                    ? "text-[var(--color-text-muted)]"
                                    : line.lastDayProfit >= 0 
                                      ? "text-[var(--color-success-text)]" 
                                      : "text-[var(--color-danger-text)]"
                              )}>
                                <span className="text-[8.5px] sm:text-[9.5px] font-semibold opacity-75 mr-0.5">BDT</span>
                                <AnimatedNumber value={Math.round(line.lastDayProfit || 0)} />
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* View Full Details CTA Button */}
                        <Link
                          href={
                            isArchive
                              ? `/archive/${month}/lines/${line.id}`
                              : selectedCardMonth === 'october'
                                ? `/archive/2026-10/lines/${line.id}`
                                : selectedCardMonth === 'september'
                                  ? `/archive/2026-09/lines/${line.id}`
                                  : selectedCardMonth === 'august'
                                    ? `/archive/2026-08/lines/${line.id}`
                                    : selectedCardMonth === 'july'
                                      ? `/archive/2026-07/lines/${line.id}`
                                      : `/lines/${line.id}`
                          }
                          className={cn(
                            "w-full px-4 font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none group bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary,white)] shadow-md",
                            isMobile ? "py-2 rounded-lg text-xs mt-0" : "py-2.5 rounded-xl text-xs sm:text-sm mt-0.5"
                          )}
                        >
                          <span>View Full Details</span>
                          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </Card>
                  );
                };

                return (
                  <div>
                    {/* Desktop View (2-Column Grid) */}
                    <div className="hidden md:grid md:grid-cols-2 gap-4 sm:gap-4 md:gap-5">
                      {sortedActiveLines.map(line => (
                        <div key={line.id} className="w-full flex flex-col">
                          {renderCardInner(line, false)}
                        </div>
                      ))}
                    </div>

                    {/* Mobile View: Smooth Touch Carousel + Minimal Animated Arrows + Scroll Indicator Dots */}
                    {(() => {
                      const activeLineIds = sortedActiveLines.length > 0 ? sortedActiveLines.map(l => l.id) : linesOrder;

                      const handlePrevLine = (e) => {
                        e.stopPropagation();
                        const currentIndex = activeLineIds.indexOf(selectedMobileLine);
                        const prevIndex = (currentIndex - 1 + activeLineIds.length) % activeLineIds.length;
                        setSelectedMobileLine(activeLineIds[prevIndex]);
                      };

                      const handleNextLine = (e) => {
                        e.stopPropagation();
                        const currentIndex = activeLineIds.indexOf(selectedMobileLine);
                        const nextIndex = (currentIndex + 1) % activeLineIds.length;
                        setSelectedMobileLine(activeLineIds[nextIndex]);
                      };

                      return (
                        <div className="md:hidden flex flex-col gap-3 -mx-2 sm:mx-0">
                          <div className="relative w-full">
                            {/* Minimal Left Animated Arrow (Theme Adaptive) */}
                            <button
                              type="button"
                              onClick={handlePrevLine}
                              className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-10 flex items-center justify-center bg-transparent border-none outline-none cursor-pointer select-none active:scale-75 transition-all p-0 text-[var(--color-primary)]"
                              aria-label="Previous Line"
                            >
                              <ChevronLeft 
                                size={22} 
                                strokeWidth={2.4} 
                                className="animate-arrow-nudge-left drop-shadow-[0_0_8px_var(--color-primary-glow)]" 
                              />
                            </button>

                            {/* Carousel Touch Track */}
                            <div 
                              className="w-full overflow-hidden touch-pan-y select-none"
                              onTouchStart={handleTouchStart}
                              onTouchEnd={handleTouchEnd}
                            >
                              <div 
                                className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                                style={{ transform: `translateX(-${activeLineIndex * 100}%)` }}
                              >
                                {sortedActiveLines.map(line => (
                                  <div key={line.id} className="w-full flex-none shrink-0 px-0.5">
                                    {renderCardInner(line, true)}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Minimal Right Animated Arrow (Theme Adaptive) */}
                            <button
                              type="button"
                              onClick={handleNextLine}
                              className="absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-10 flex items-center justify-center bg-transparent border-none outline-none cursor-pointer select-none active:scale-75 transition-all p-0 text-[var(--color-primary)]"
                              aria-label="Next Line"
                            >
                              <ChevronRight 
                                size={22} 
                                strokeWidth={2.4} 
                                className="animate-arrow-nudge-right drop-shadow-[0_0_8px_var(--color-primary-glow)]" 
                              />
                            </button>
                          </div>

                          {/* Small Scroll Indicator Dots */}
                          <div className="flex items-center justify-center gap-1.5 pt-1">
                            {linesOrder.map(lineId => {
                              const isSelected = selectedMobileLine === lineId;
                              return (
                                <button
                                  key={lineId}
                                  type="button"
                                  onClick={() => setSelectedMobileLine(lineId)}
                                  className={cn(
                                    "transition-all duration-300 rounded-full cursor-pointer p-0 border-0 outline-none",
                                    isSelected 
                                      ? "w-7 h-1.5 bg-[var(--color-primary)]" 
                                      : "w-1.5 h-1.5 bg-[var(--color-border)]/60 hover:bg-[var(--color-primary)]/50"
                                  )}
                                  aria-label={`Select Line ${lineId}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>
          );
        })()}




      


      </div>

      {/* Hidden Printable PDF Component */}
      {isArchive && (
        <PrintableArchiveReport month={month} />
      )}
    </>
  );
}
