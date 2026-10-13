"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useKpiData } from '@/utils/useKpiData';
import { createKpiEngine } from '@/utils/kpiEngine';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const LINE_META = {
  'A': { color: '#10B981', name: 'LINE A' },
  'B': { color: '#3B82F6', name: 'LINE B' },
  'C': { color: '#A855F7', name: 'LINE C' },
  'D': { color: '#F59E0B', name: 'LINE D' }
};

// Shimmer block helper
function ShimmerBlock({ className = "" }) {
  return <div className={`shimmer rounded-md ${className}`} />;
}

// Custom Page Skeleton (Stroke-free)
function CompareSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left">
        <ShimmerBlock className="h-6 w-48 bg-[var(--color-text-muted)]/30 rounded-lg" />
        <ShimmerBlock className="h-3.5 w-64 bg-[var(--color-text-muted)]/15 rounded-lg" />
      </div>
      <div className="flex justify-center sm:justify-start gap-1.5 pb-1">
        {[1, 2, 3].map(t => (
          <ShimmerBlock key={t} className="h-8 w-24 bg-[var(--color-text-muted)]/15 rounded-xl border-0" />
        ))}
      </div>
      <div className="bg-[var(--color-bg-card)] border-0 rounded-2xl p-6 h-[400px] shimmer" />
    </div>
  );
}

export default function ComparePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('line'); // 'line', 'date', 'month'

  // Dynamic selector values
  const [line1, setLine1] = useState('A');
  const [line2, setLine2] = useState('B');

  const [availableDates, setAvailableDates] = useState([]);
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [date1Data, setDate1Data] = useState(null);
  const [date2Data, setDate2Data] = useState(null);
  const [loadingDates, setLoadingDates] = useState(false);

  const [availableMonths, setAvailableMonths] = useState([]);
  const [month1, setMonth1] = useState('live');
  const [month2, setMonth2] = useState('2026-09');
  const [month1Data, setMonth1Data] = useState(null);
  const [month2Data, setMonth2Data] = useState(null);
  const [loadingMonths, setLoadingMonths] = useState(false);

  // Fetch base live data (pre-calculated values)
  const { lines, loading: baseLoading } = useKpiData('live');

  // Client mounting check to prevent Recharts hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch available dates index
  useEffect(() => {
    fetch('/api/hourly')
      .then(res => res.json())
      .then(json => {
        if (json.availableDates && json.availableDates.length > 0) {
          setAvailableDates(json.availableDates);
          setDate1(json.availableDates[0]);
          setDate2(json.availableDates[1] || json.availableDates[0]);
        }
      })
      .catch(e => console.error("Error fetching dates for comparator:", e));
  }, []);

  // Fetch available months index
  useEffect(() => {
    fetch('/api/archive')
      .then(res => res.json())
      .then(json => {
        if (json.months && json.months.length > 0) {
          setAvailableMonths(json.months);
        }
      })
      .catch(e => console.error("Error fetching months for comparator:", e));
  }, []);

  // Fetch hourly details for Date 1 & Date 2 comparator
  useEffect(() => {
    if (!date1) return;
    setLoadingDates(true);
    fetch(`/api/hourly?date=${date1}`)
      .then(res => res.json())
      .then(json => {
        setDate1Data(json);
        if (date2Data && date2 === date1) {
          setDate2Data(json);
          setLoadingDates(false);
        }
      })
      .catch(e => console.error(e))
      .finally(() => {
        if (!date2 || date1 === date2) setLoadingDates(false);
      });
  }, [date1]);

  useEffect(() => {
    if (!date2) return;
    setLoadingDates(true);
    fetch(`/api/hourly?date=${date2}`)
      .then(res => res.json())
      .then(json => {
        setDate2Data(json);
      })
      .catch(e => console.error(e))
      .finally(() => setLoadingDates(false));
  }, [date2]);

  // Fetch month data for Month 1 & Month 2 comparator
  useEffect(() => {
    if (!month1) return;
    setLoadingMonths(true);
    fetch(`/api/data?month=${month1}`)
      .then(res => res.json())
      .then(json => {
        if (json.dailyProduction && json.lines) {
          const engine = createKpiEngine(json);
          setMonth1Data({
            stats: engine.getOverallStats(),
            lines: engine.getLinePerformance()
          });
        }
      })
      .catch(e => console.error(e))
      .finally(() => {
        if (!month2) setLoadingMonths(false);
      });
  }, [month1]);

  useEffect(() => {
    if (!month2) return;
    setLoadingMonths(true);
    fetch(`/api/data?month=${month2}`)
      .then(res => res.json())
      .then(json => {
        if (json.dailyProduction && json.lines) {
          const engine = createKpiEngine(json);
          setMonth2Data({
            stats: engine.getOverallStats(),
            lines: engine.getLinePerformance()
          });
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoadingMonths(false));
  }, [month2]);

  if (!mounted || baseLoading) {
    return <CompareSkeleton />;
  }

  // ----------------------------------------------------
  // DATA PREPARATION FOR CHARTS
  // ----------------------------------------------------

  // 1. Line vs Line: Hourly output overlay & Radar Comparison
  const getLineComparisonData = () => {
    const hData = date1Data;
    if (!hData || !hData.lines || hData.lines.length === 0) return [];

    const line1Data = hData.lines.find(l => l.line_id === line1);
    const line2Data = hData.lines.find(l => l.line_id === line2);

    if (!line1Data || !line2Data) return [];

    return hData.timeLabels.map((label, idx) => ({
      hour: label,
      line1Actual: line1Data.actual[idx] || 0,
      line1Target: line1Data.target[idx] || 0,
      line2Actual: line2Data.actual[idx] || 0,
      line2Target: line2Data.target[idx] || 0
    }));
  };

  const getLineRadarData = () => {
    const l1 = lines?.find(l => l.id === line1);
    const l2 = lines?.find(l => l.id === line2);

    if (!l1 || !l2) return [];

    const maxProd = Math.max(l1.totalProduction, l2.totalProduction, 1);
    const maxProfit = Math.max(Math.abs(l1.netProfit), Math.abs(l2.netProfit), 1);
    const maxCm = Math.max(l1.averageCm || 0, l2.averageCm || 0, 1);
    const maxRecovery = Math.max(parseFloat(l1.monthCostRecovery || 0), parseFloat(l2.monthCostRecovery || 0), 100);

    return [
      {
        metric: 'Volume Yield',
        line1: Math.round((l1.totalProduction / maxProd) * 100),
        line2: Math.round((l2.totalProduction / maxProd) * 100)
      },
      {
        metric: 'Financial Return',
        line1: Math.round((Math.max(0, l1.netProfit + maxProfit) / (2 * maxProfit)) * 100),
        line2: Math.round((Math.max(0, l2.netProfit + maxProfit) / (2 * maxProfit)) * 100)
      },
      {
        metric: 'CM Pricing',
        line1: Math.round(((l1.averageCm || 0) / maxCm) * 100),
        line2: Math.round(((l2.averageCm || 0) / maxCm) * 100)
      },
      {
        metric: 'Cost Recovery',
        line1: Math.min(100, Math.round((parseFloat(l1.monthCostRecovery || 0) / maxRecovery) * 100)),
        line2: Math.min(100, Math.round((parseFloat(l2.monthCostRecovery || 0) / maxRecovery) * 100))
      }
    ];
  };

  // 2. Date vs Date: Hourly overlay comparison
  const getDateComparisonData = () => {
    if (!date1Data || !date2Data || !date1Data.lines || !date2Data.lines) return [];

    const labels = date1Data.timeLabels || date2Data.timeLabels || [];

    return labels.map((label, idx) => {
      let d1Sum = 0;
      date1Data.lines.forEach(l => { d1Sum += (l.actual[idx] || 0); });

      let d2Sum = 0;
      date2Data.lines.forEach(l => { d2Sum += (l.actual[idx] || 0); });

      return {
        hour: label,
        date1Actual: d1Sum,
        date2Actual: d2Sum
      };
    });
  };

  const getShiftContrastData = () => {
    if (!date1Data || !date2Data) return [];

    let d1Day = 0;
    let d1Night = 0;
    let d2Day = 0;
    let d2Night = 0;

    date1Data.lines.forEach(l => {
      l.actual.slice(0, 6).forEach(v => d1Day += (v || 0));
      l.actual.slice(6).forEach(v => d1Night += (v || 0));
    });

    date2Data.lines.forEach(l => {
      l.actual.slice(0, 6).forEach(v => d2Day += (v || 0));
      l.actual.slice(6).forEach(v => d2Night += (v || 0));
    });

    return [
      { shift: 'Day Shift (1-6h)', date1: d1Day, date2: d2Day },
      { shift: 'Night Shift (7-11h)', date1: d1Night, date2: d2Night }
    ];
  };

  // 3. Month vs Month: Total delta bar chart
  const getMonthComparisonData = () => {
    if (!month1Data || !month2Data) return [];

    const m1Stats = month1Data.stats;
    const m2Stats = month2Data.stats;

    return [
      {
        metric: 'Total Output',
        month1: Math.round(m1Stats.totalProduction / 1000),
        month2: Math.round(m2Stats.totalProduction / 1000),
        unit: 'k pcs'
      },
      {
        metric: 'Total Cost',
        month1: Math.round(m1Stats.totalCost / 100000),
        month2: Math.round(m2Stats.totalCost / 100000),
        unit: 'Lac BDT'
      },
      {
        metric: 'Net Revenue',
        month1: Math.round(m1Stats.totalIncome / 100000),
        month2: Math.round(m2Stats.totalIncome / 100000),
        unit: 'Lac BDT'
      },
      {
        metric: 'Net Profit',
        month1: Math.round(m1Stats.netProfit / 100000),
        month2: Math.round(m2Stats.netProfit / 100000),
        unit: 'Lac BDT'
      }
    ];
  };

  return (
    <div className="space-y-5 md:space-y-6 md:pt-0 animate-[fade-up_0.4s_ease-out_both]">
      
      {/* Page Header (Matching Dashboard typography) */}
      <header className="flex flex-col items-center text-center md:items-start md:text-left mb-4 sm:mb-6 relative z-10">
        <h1 className="text-[20px] sm:text-[23px] md:text-[27px] font-bold tracking-normal uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] leading-tight">
          Comparison Center
        </h1>
        <p className="text-[10.5px] sm:text-[11.5px] md:text-xs text-[var(--color-text-muted)] font-medium tracking-normal mt-0.5 max-w-2xl">
          Side-by-side performance evaluation, line variance metrics, and timeline comparative analysis.
        </p>
      </header>

      {/* Selector Tabs (Stroke-free, Icon-free, Dashboard-matched font size) */}
      <div className="flex justify-center sm:justify-start items-center w-full mb-3 sm:mb-4">
        <div className="inline-flex p-0.5 sm:p-1 bg-[var(--color-surface)] border-0 rounded-xl gap-0.5 sm:gap-1 shadow-none sm:shadow-xs items-center">
          {[
            { id: 'line', label: 'Line vs Line' },
            { id: 'date', label: 'Date vs Date' },
            { id: 'month', label: 'Month vs Month' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[9.5px] sm:text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border-0 select-none",
                  isSelected
                    ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] shadow-xs"
                    : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 1. LINE VS LINE COMPARATOR ── */}
      {activeTab === 'line' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Controls Card (Stroke-free, Icon-free) */}
          <Card className="p-3.5 sm:p-4 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
              <div>
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none">
                  Select Production Lines
                </h3>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1">
                    Line 1
                  </label>
                  <select
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="w-full sm:w-32 bg-[var(--color-surface)] border-0 text-[var(--color-text-main)] text-[11px] sm:text-xs rounded-xl p-2 sm:p-2.5 font-bold focus:outline-none cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors shadow-xs"
                  >
                    {Object.keys(LINE_META).map(id => <option key={id} value={id} disabled={id === line2} className="bg-[var(--color-bg-card)]">LINE {id}</option>)}
                  </select>
                </div>

                <span className="text-[var(--color-text-muted)] mt-4 text-[10px] sm:text-xs font-black uppercase px-1 select-none">
                  VS
                </span>

                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1">
                    Line 2
                  </label>
                  <select
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="w-full sm:w-32 bg-[var(--color-surface)] border-0 text-[var(--color-text-main)] text-[11px] sm:text-xs rounded-xl p-2 sm:p-2.5 font-bold focus:outline-none cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors shadow-xs"
                  >
                    {Object.keys(LINE_META).map(id => <option key={id} value={id} disabled={id === line1} className="bg-[var(--color-bg-card)]">LINE {id}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Side-by-Side Dual Telemetry Grid (Stroke-free, Dashboard-matched mobile sizes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-6">
            {/* Line 1 Card */}
            {(() => {
              const meta1 = LINE_META[line1];
              const stats1 = lines?.find(l => l.id === line1);
              if (!stats1) return null;
              return (
                <Card className="p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs sm:text-sm md:text-base font-black tracking-wide" style={{ color: meta1.color }}>
                      {meta1.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[8.5px] sm:text-[9px] font-bold uppercase tracking-widest bg-[var(--color-surface)] text-[var(--color-text-muted)] border-0">
                      Aggregated Data
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Total Output
                      </span>
                      <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                        {stats1.totalProduction.toLocaleString()} <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)]">pcs</span>
                      </p>
                    </div>

                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Net Profit
                      </span>
                      <p className={cn(
                        "text-xs sm:text-sm md:text-base font-black truncate",
                        stats1.netProfit >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                      )}>
                        {stats1.netProfit >= 0 ? `+BDT ${stats1.netProfit.toLocaleString()}` : `BDT ${stats1.netProfit.toLocaleString()}`}
                      </p>
                    </div>

                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Avg Manpower
                      </span>
                      <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                        {stats1.averageWorkers} <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)]">operators</span>
                      </p>
                    </div>

                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Avg Cost CM
                      </span>
                      <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                        BDT {stats1.averageCm.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Line 2 Card */}
            {(() => {
              const meta2 = LINE_META[line2];
              const stats2 = lines?.find(l => l.id === line2);
              if (!stats2) return null;
              return (
                <Card className="p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs sm:text-sm md:text-base font-black tracking-wide" style={{ color: meta2.color }}>
                      {meta2.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[8.5px] sm:text-[9px] font-bold uppercase tracking-widest bg-[var(--color-surface)] text-[var(--color-text-muted)] border-0">
                      Aggregated Data
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Total Output
                      </span>
                      <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                        {stats2.totalProduction.toLocaleString()} <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)]">pcs</span>
                      </p>
                    </div>

                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Net Profit
                      </span>
                      <p className={cn(
                        "text-xs sm:text-sm md:text-base font-black truncate",
                        stats2.netProfit >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                      )}>
                        {stats2.netProfit >= 0 ? `+BDT ${stats2.netProfit.toLocaleString()}` : `BDT ${stats2.netProfit.toLocaleString()}`}
                      </p>
                    </div>

                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Avg Manpower
                      </span>
                      <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                        {stats2.averageWorkers} <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)]">operators</span>
                      </p>
                    </div>

                    <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                      <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                        Avg Cost CM
                      </span>
                      <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                        BDT {stats2.averageCm.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>

          {/* Charts Grid (Stroke-free) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
            {/* Overlap Hourly Chart */}
            <Card className="lg:col-span-2 p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                Overlap Hourly Outputs
              </h4>
              <div className="h-[260px] sm:h-[300px]">
                {loadingDates ? (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getLineComparisonData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                      <XAxis dataKey="hour" stroke="var(--color-text-muted)" fontSize={9.5} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={9.5} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                        labelStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                      <Line type="monotone" name={`LINE ${line1} (Solid)`} dataKey="line1Actual" stroke={LINE_META[line1].color} strokeWidth={2.5} dot={{ r: 3.5 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" name={`LINE ${line2} (Dashed)`} dataKey="line2Actual" stroke={LINE_META[line2].color} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3.5 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* KPI Efficiency Radar */}
            <Card className="lg:col-span-1 p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                KPI Efficiency Index
              </h4>
              <div className="h-[260px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="70%" data={getLineRadarData()}>
                    <PolarGrid stroke="var(--color-border)" opacity={0.4} />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--color-text-secondary)', fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--color-border)" tick={{ fill: 'var(--color-text-muted)', fontSize: 8 }} />
                    <Radar name={`LINE ${line1}`} dataKey="line1" stroke={LINE_META[line1].color} fill={LINE_META[line1].color} fillOpacity={0.15} />
                    <Radar name={`LINE ${line2}`} dataKey="line2" stroke={LINE_META[line2].color} fill={LINE_META[line2].color} fillOpacity={0.15} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── 2. DATE VS DATE COMPARATOR ── */}
      {activeTab === 'date' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Controls Card (Stroke-free, Icon-free) */}
          <Card className="p-3.5 sm:p-4 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
              <div>
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none">
                  Select Production Dates
                </h3>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1">
                    Date 1
                  </label>
                  <select
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border-0 text-[var(--color-text-main)] text-[11px] sm:text-xs rounded-xl p-2 sm:p-2.5 font-bold focus:outline-none cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors shadow-xs"
                  >
                    {availableDates.map(d => <option key={d} value={d} className="bg-[var(--color-bg-card)]">{d}</option>)}
                  </select>
                </div>

                <span className="text-[var(--color-text-muted)] mt-4 text-[10px] sm:text-xs font-black uppercase px-1 select-none">
                  VS
                </span>

                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1">
                    Date 2
                  </label>
                  <select
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border-0 text-[var(--color-text-main)] text-[11px] sm:text-xs rounded-xl p-2 sm:p-2.5 font-bold focus:outline-none cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors shadow-xs"
                  >
                    {availableDates.map(d => <option key={d} value={d} className="bg-[var(--color-bg-card)]">{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Intraday speed matching chart (Stroke-free) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
            <Card className="lg:col-span-2 p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                Intraday Speed Matching (Total Factory Output)
              </h4>
              <div className="h-[260px] sm:h-[300px]">
                {loadingDates ? (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getDateComparisonData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                      <XAxis dataKey="hour" stroke="var(--color-text-muted)" fontSize={9.5} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={9.5} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                      <Line type="monotone" name={date1} dataKey="date1Actual" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3.5 }} />
                      <Line type="monotone" name={date2} dataKey="date2Actual" stroke="var(--color-warning)" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Shift efficiency bar chart */}
            <Card className="lg:col-span-1 p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                Shift Efficiency Contrast
              </h4>
              <div className="h-[260px] sm:h-[300px]">
                {loadingDates ? (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getShiftContrastData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                      <XAxis dataKey="shift" stroke="var(--color-text-muted)" fontSize={9.5} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={9.5} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                      <Bar dataKey="date1" name={date1} fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="date2" name={date2} fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── 3. MONTH VS MONTH COMPARATOR ── */}
      {activeTab === 'month' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Controls Card (Stroke-free, Icon-free) */}
          <Card className="p-3.5 sm:p-4 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
              <div>
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none">
                  Select Archive Months
                </h3>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1">
                    Month 1
                  </label>
                  <select
                    value={month1}
                    onChange={(e) => setMonth1(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border-0 text-[var(--color-text-main)] text-[11px] sm:text-xs rounded-xl p-2 sm:p-2.5 font-bold focus:outline-none cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors shadow-xs"
                  >
                    <option value="live" className="bg-[var(--color-bg-card)]">October 2026 (Live)</option>
                    {availableMonths.map(m => <option key={m.id} value={m.id} className="bg-[var(--color-bg-card)]">{m.name}</option>)}
                  </select>
                </div>

                <span className="text-[var(--color-text-muted)] mt-4 text-[10px] sm:text-xs font-black uppercase px-1 select-none">
                  VS
                </span>

                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1">
                    Month 2
                  </label>
                  <select
                    value={month2}
                    onChange={(e) => setMonth2(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border-0 text-[var(--color-text-main)] text-[11px] sm:text-xs rounded-xl p-2 sm:p-2.5 font-bold focus:outline-none cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors shadow-xs"
                  >
                    <option value="live" className="bg-[var(--color-bg-card)]">October 2026 (Live)</option>
                    {availableMonths.map(m => <option key={m.id} value={m.id} className="bg-[var(--color-bg-card)]">{m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Historical snapshot grids (Stroke-free, Dashboard-matched mobile sizes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-6">
            {/* Month 1 Stats */}
            {month1Data && (
              <Card className="p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs sm:text-sm md:text-base font-black text-[var(--color-primary)]">
                    {month1 === 'live' ? 'October 2026' : availableMonths.find(m => m.id === month1)?.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[8.5px] sm:text-[9px] font-bold uppercase tracking-widest bg-[var(--color-surface)] text-[var(--color-text-muted)] border-0">
                    Snapshot Totals
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Production
                    </span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                      {month1Data.stats.totalProduction.toLocaleString()} <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)]">pcs</span>
                    </p>
                  </div>

                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Net Profit
                    </span>
                    <p className={cn(
                      "text-xs sm:text-sm md:text-base font-black truncate",
                      month1Data.stats.netProfit >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                    )}>
                      {month1Data.stats.netProfit >= 0 ? `+BDT ${month1Data.stats.netProfit.toLocaleString()}` : `BDT ${month1Data.stats.netProfit.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Revenue
                    </span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                      BDT {month1Data.stats.totalIncome.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Operation Cost
                    </span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                      BDT {month1Data.stats.totalCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Month 2 Stats */}
            {month2Data && (
              <Card className="p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs sm:text-sm md:text-base font-black text-[var(--color-warning)]">
                    {month2 === 'live' ? 'October 2026' : availableMonths.find(m => m.id === month2)?.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[8.5px] sm:text-[9px] font-bold uppercase tracking-widest bg-[var(--color-surface)] text-[var(--color-text-muted)] border-0">
                    Snapshot Totals
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Production
                    </span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                      {month2Data.stats.totalProduction.toLocaleString()} <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)]">pcs</span>
                    </p>
                  </div>

                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Net Profit
                    </span>
                    <p className={cn(
                      "text-xs sm:text-sm md:text-base font-black truncate",
                      month2Data.stats.netProfit >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"
                    )}>
                      {month2Data.stats.netProfit >= 0 ? `+BDT ${month2Data.stats.netProfit.toLocaleString()}` : `BDT ${month2Data.stats.netProfit.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Revenue
                    </span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                      BDT {month2Data.stats.totalIncome.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-[var(--color-surface)] p-2 sm:p-2.5 rounded-xl border-0 shadow-xs flex flex-col justify-between min-w-0">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-0.5 truncate">
                      Operation Cost
                    </span>
                    <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] truncate">
                      BDT {month2Data.stats.totalCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Monthly overlay trends (Stroke-free) */}
          <Card className="p-3.5 sm:p-4 md:p-5 bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))]">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
              Macro Performance Overlays (Normalized comparison)
            </h4>
            <div className="h-[260px] sm:h-[300px]">
              {loadingMonths ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthComparisonData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                    <XAxis dataKey="metric" stroke="var(--color-text-muted)" fontSize={9.5} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={9.5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                      formatter={(value, name, props) => [`${value} ${props.payload.unit}`, name === 'month1' ? (month1 === 'live' ? 'October 2026' : (availableMonths.find(m => m.id === month1)?.name || 'Month 1')) : (month2 === 'live' ? 'October 2026' : (availableMonths.find(m => m.id === month2)?.name || 'Month 2'))]}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      formatter={(value) => value === 'month1' ? (month1 === 'live' ? 'October 2026' : (availableMonths.find(m => m.id === month1)?.name || 'Month 1')) : (month2 === 'live' ? 'October 2026' : (availableMonths.find(m => m.id === month2)?.name || 'Month 2'))}
                    />
                    <Bar dataKey="month1" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="month2" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
