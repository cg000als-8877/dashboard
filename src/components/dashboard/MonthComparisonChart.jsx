"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { useKpiData } from '@/utils/useKpiData';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const DEFAULT_MONTHS = [
  { id: 'live', name: 'October 2026 (Live)', short: 'October' },
  { id: '2026-09', name: 'September 2026', short: 'September' },
  { id: '2026-08', name: 'August 2026', short: 'August' },
  { id: '2026-07', name: 'July 2026', short: 'July' }
];

const METRICS = [
  { id: 'profit', label: 'Net Profit', unit: 'BDT', isFinancial: true },
  { id: 'income', label: 'Revenue', unit: 'BDT', isFinancial: true },
  { id: 'cost', label: 'Cost', unit: 'BDT', isFinancial: true },
  { id: 'production', label: 'Output', unit: 'PCS', isFinancial: false }
];

const VIEW_MODES = [
  { id: 'daily', label: 'Daily Progression' },
  { id: 'cumulative', label: 'Cumulative Pace' },
  { id: 'totals', label: 'Totals Overview' }
];

function formatMetricVal(val, metricId) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : val > 0 && metricId === 'profit' ? '+' : '';
  
  if (metricId === 'production') {
    if (abs >= 1000000) return `${(val / 1000000).toFixed(1)}M pcs`;
    if (abs >= 1000) return `${Math.round(val / 1000)}k pcs`;
    return `${Math.round(val)} pcs`;
  }

  // Financial (BDT)
  if (abs >= 10000000) return `${sign}BDT ${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}BDT ${(abs / 100000).toFixed(1)} Lac`;
  if (abs >= 1000) return `${sign}BDT ${Math.round(abs / 1000)}k`;
  return `${sign}BDT ${Math.round(abs).toLocaleString()}`;
}

export function MonthComparisonChart() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [availableMonths, setAvailableMonths] = useState(DEFAULT_MONTHS);
  const [month1, setMonth1] = useState('live');
  const [month2, setMonth2] = useState('2026-09');
  const [activeMetric, setActiveMetric] = useState('profit');
  const [viewMode, setViewMode] = useState('daily');

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetch('/api/archive')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.months) && data.months.length > 0) {
          const fetched = data.months.map(m => ({
            id: m.isRunning ? 'live' : m.id,
            name: m.name + (m.isRunning ? ' (Live)' : ''),
            short: m.name.split(' ')[0]
          }));
          const seen = new Set();
          const merged = [...fetched, ...DEFAULT_MONTHS].filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
          setAvailableMonths(merged);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data for the 4 core factory months (they share app memory cache)
  const octData = useKpiData('live');
  const sepData = useKpiData('2026-09');
  const augData = useKpiData('2026-08');
  const julData = useKpiData('2026-07');

  // Dynamic fallback for any additional month selection
  const dynamicM1 = useKpiData(month1);
  const dynamicM2 = useKpiData(month2);

  const getMonthPayload = (mId) => {
    if (mId === 'live' || mId === '2026-10') return octData;
    if (mId === '2026-09') return sepData;
    if (mId === '2026-08') return augData;
    if (mId === '2026-07') return julData;
    if (month1 === mId) return dynamicM1;
    if (month2 === mId) return dynamicM2;
    return null;
  };

  const m1Payload = getMonthPayload(month1);
  const m2Payload = getMonthPayload(month2);

  const m1Meta = availableMonths.find(m => m.id === month1) || { name: 'Month 1', short: 'Month 1' };
  const m2Meta = availableMonths.find(m => m.id === month2) || { name: 'Month 2', short: 'Month 2' };

  // Generate day-by-day unified trajectory
  const { chartData, totalsData, m1Total, m2Total, variancePct, varianceDiff, m1PacedTotal, m2PacedTotal } = useMemo(() => {
    const trends1 = m1Payload?.dailyTrends || [];
    const trends2 = m2Payload?.dailyTrends || [];
    const stats1 = m1Payload?.stats;
    const stats2 = m2Payload?.stats;

    const map1 = {};
    trends1.forEach(d => {
      const dayNum = parseInt(d.date.split('-')[2], 10);
      if (!isNaN(dayNum)) map1[dayNum] = d;
    });

    const map2 = {};
    trends2.forEach(d => {
      const dayNum = parseInt(d.date.split('-')[2], 10);
      if (!isNaN(dayNum)) map2[dayNum] = d;
    });

    const maxDay1 = trends1.length > 0 ? Math.max(...Object.keys(map1).map(Number)) : 0;
    const maxDay2 = trends2.length > 0 ? Math.max(...Object.keys(map2).map(Number)) : 0;
    const maxDayOverall = Math.max(maxDay1, maxDay2, 30);

    let cum1 = 0;
    let cum2 = 0;
    const dailyPoints = [];

    // Like-for-like elapsed days (e.g. if Month 1 is live with 10 days, compare first 10 days of both)
    const pacedDaysLimit = Math.min(maxDay1 > 0 ? maxDay1 : 10, maxDay2 > 0 ? maxDay2 : 10);
    let pacedSum1 = 0;
    let pacedSum2 = 0;

    for (let day = 1; day <= maxDayOverall; day++) {
      const d1 = map1[day];
      const d2 = map2[day];

      const rawVal1 = d1 ? (d1[activeMetric] || 0) : null;
      const rawVal2 = d2 ? (d2[activeMetric] || 0) : null;

      if (rawVal1 !== null) cum1 += rawVal1;
      if (rawVal2 !== null) cum2 += rawVal2;

      if (day <= pacedDaysLimit) {
        if (rawVal1 !== null) pacedSum1 += rawVal1;
        if (rawVal2 !== null) pacedSum2 += rawVal2;
      }

      dailyPoints.push({
        day,
        dayLabel: `${day}`,
        // Daily progression values (null for unelapsed future days)
        val1Daily: day <= maxDay1 ? (rawVal1 ?? 0) : null,
        val2Daily: day <= maxDay2 ? (rawVal2 ?? 0) : null,
        // Cumulative values
        val1Cum: day <= maxDay1 ? cum1 : null,
        val2Cum: day <= maxDay2 ? cum2 : null
      });
    }

    // Totals comparison dataset
    const totalsPoints = [
      {
        category: 'Net Profit',
        val1: stats1?.netProfit ?? 0,
        val2: stats2?.netProfit ?? 0,
        unit: 'BDT'
      },
      {
        category: 'Revenue',
        val1: stats1?.totalIncome ?? 0,
        val2: stats2?.totalIncome ?? 0,
        unit: 'BDT'
      },
      {
        category: 'Cost',
        val1: stats1?.totalCost ?? 0,
        val2: stats2?.totalCost ?? 0,
        unit: 'BDT'
      },
      {
        category: 'Output (pcs)',
        val1: stats1?.totalProduction ?? 0,
        val2: stats2?.totalProduction ?? 0,
        unit: 'PCS'
      }
    ];

    // Total metrics for active metric
    let tot1 = 0;
    let tot2 = 0;
    if (activeMetric === 'profit') {
      tot1 = stats1?.netProfit ?? 0;
      tot2 = stats2?.netProfit ?? 0;
    } else if (activeMetric === 'income') {
      tot1 = stats1?.totalIncome ?? 0;
      tot2 = stats2?.totalIncome ?? 0;
    } else if (activeMetric === 'cost') {
      tot1 = stats1?.totalCost ?? 0;
      tot2 = stats2?.totalCost ?? 0;
    } else if (activeMetric === 'production') {
      tot1 = stats1?.totalProduction ?? 0;
      tot2 = stats2?.totalProduction ?? 0;
    }

    const diff = tot1 - tot2;
    const pct = tot2 !== 0 ? Math.round((diff / Math.abs(tot2)) * 100) : 0;

    return {
      chartData: dailyPoints,
      totalsData: totalsPoints,
      m1Total: tot1,
      m2Total: tot2,
      variancePct: pct,
      varianceDiff: diff,
      m1PacedTotal: pacedSum1,
      m2PacedTotal: pacedSum2
    };
  }, [m1Payload, m2Payload, activeMetric]);

  const activeMetricMeta = METRICS.find(m => m.id === activeMetric) || METRICS[0];

  // Primary Month uses theme primary, Comparison Month uses Amber (#F59E0B) for high contrast across all themes
  const color1 = "var(--color-primary)";
  const color2 = "#F59E0B";

  return (
    <Card className="flex flex-col relative z-20 p-3 sm:p-5 md:p-6 bg-[var(--color-bg-card)] rounded-2xl shadow-sm md:shadow-[0_10px_25px_-4px_var(--shadow-color,rgba(0,0,0,0.12))] border-0 transition-all">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <h2 className="text-xs sm:text-sm md:text-base font-bold tracking-normal uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] leading-tight">
            MONTH-TO-MONTH COMPARISON
          </h2>
          <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] font-normal mt-0.5">
            Compare financial velocity, operational cost, and output volume across any two months
          </p>
        </div>

        {/* Dropdown Selectors: Mobile Stacked Full-Width with Floating Modern VS Badge | Desktop Inline Row */}
        <div className="relative w-full lg:w-auto flex flex-col lg:flex-row lg:items-center gap-2.5 lg:gap-2">
          {/* Base Month Selector */}
          <div className="w-full lg:w-auto flex items-center gap-2 bg-[var(--color-surface)] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border-0 shadow-xs">
            <span className="text-[9px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider shrink-0 select-none">
              Base:
            </span>
            <select
              value={month1}
              onChange={(e) => setMonth1(e.target.value)}
              className="bg-transparent text-[var(--color-text-main)] font-bold text-xs uppercase tracking-wider border-0 outline-none cursor-pointer focus:ring-0 select-none w-full min-w-0 pr-1"
            >
              {availableMonths.map(m => (
                <option key={m.id} value={m.id} className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Floating Modern VS Badge on Mobile, Clean Separator on Desktop */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 lg:static lg:translate-x-0 lg:translate-y-0 pointer-events-none select-none">
            <div className="flex items-center justify-center w-[26px] h-[26px] sm:w-7 sm:h-7 lg:w-auto lg:h-auto rounded-full bg-[var(--color-bg-card)] lg:bg-transparent border border-[var(--color-border)]/60 lg:border-0 shadow-[0_2px_8px_rgba(0,0,0,0.14)] lg:shadow-none">
              <span className="text-[8.5px] sm:text-[9px] lg:text-[11px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] lg:text-[var(--color-text-muted)] lg:px-1">
                VS
              </span>
            </div>
          </div>

          {/* Comparison Month Selector */}
          <div className="w-full lg:w-auto flex items-center gap-2 bg-[var(--color-surface)] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border-0 shadow-xs">
            <span className="text-[9px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider shrink-0 select-none">
              Compare:
            </span>
            <select
              value={month2}
              onChange={(e) => setMonth2(e.target.value)}
              className="bg-transparent text-[var(--color-text-main)] font-bold text-xs uppercase tracking-wider border-0 outline-none cursor-pointer focus:ring-0 select-none w-full min-w-0 pr-1"
            >
              {availableMonths.map(m => (
                <option key={m.id} value={m.id} className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Selector Pills & View Modes Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
        {/* Metric Switcher Pills */}
        <div className="grid grid-cols-4 gap-0.5 sm:gap-1 bg-[var(--color-surface)] p-1 rounded-xl w-full sm:w-auto">
          {METRICS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMetric(m.id)}
              className={cn(
                "px-1.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all border-0 cursor-pointer select-none text-center truncate",
                activeMetric === m.id
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-xs"
                  : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* View Mode Pills */}
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1 bg-[var(--color-surface)] p-1 rounded-xl w-full sm:w-auto">
          {VIEW_MODES.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => setViewMode(v.id)}
              className={cn(
                "px-1 sm:px-2.5 py-1.5 rounded-lg text-[8.5px] sm:text-[10.5px] font-bold uppercase tracking-wider transition-all border-0 cursor-pointer select-none text-center truncate",
                viewMode === v.id
                  ? "bg-white text-gray-900 md:bg-[var(--color-bg-card)] md:text-[var(--color-text-main)] shadow-xs"
                  : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Comparison Summary Badges (No strokes, no icons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {/* Badge 1: Base Month Total */}
        <div className="bg-[var(--color-surface)] p-2 sm:p-3 rounded-xl flex flex-col justify-between border-0 shadow-xs">
          <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider truncate">
            {m1Meta.short} Total
          </span>
          <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-primary)] tracking-tight mt-0.5 truncate">
            {formatMetricVal(m1Total, activeMetric)}
          </p>
          <span className="text-[8px] sm:text-[8.5px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 truncate">
            {m1Payload?.stats?.workingDays || 0} active days
          </span>
        </div>

        {/* Badge 2: Comparison Month Total */}
        <div className="bg-[var(--color-surface)] p-2 sm:p-3 rounded-xl flex flex-col justify-between border-0 shadow-xs">
          <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider truncate">
            {m2Meta.short} Total
          </span>
          <p className="text-xs sm:text-sm md:text-base font-black text-[#F59E0B] tracking-tight mt-0.5 truncate">
            {formatMetricVal(m2Total, activeMetric)}
          </p>
          <span className="text-[8px] sm:text-[8.5px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 truncate">
            {m2Payload?.stats?.workingDays || 0} active days
          </span>
        </div>

        {/* Badge 3: Variance / Delta */}
        <div className="bg-[var(--color-surface)] p-2 sm:p-3 rounded-xl flex flex-col justify-between border-0 shadow-xs">
          <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider truncate">
            Variance Gap
          </span>
          <p className={cn(
            "text-xs sm:text-sm md:text-base font-black tracking-tight mt-0.5 truncate",
            activeMetric === 'cost'
              ? (varianceDiff < 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]")
              : (varianceDiff >= 0 ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]")
          )}>
            {variancePct > 0 ? `+${variancePct}%` : `${variancePct}%`}
          </p>
          <span className="text-[8px] sm:text-[8.5px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 truncate">
            {formatMetricVal(varianceDiff, activeMetric)} diff
          </span>
        </div>

        {/* Badge 4: Like-for-Like Working Days Pace */}
        <div className="bg-[var(--color-surface)] p-2 sm:p-3 rounded-xl flex flex-col justify-between border-0 shadow-xs">
          <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider truncate">
            Like-For-Like Pace
          </span>
          <p className="text-xs sm:text-sm md:text-base font-black text-[var(--color-text-main)] tracking-tight mt-0.5 truncate">
            {formatMetricVal(m1PacedTotal, activeMetric)}
          </p>
          <span className="text-[8px] sm:text-[8.5px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 truncate">
            vs {formatMetricVal(m2PacedTotal, activeMetric)} matched
          </span>
        </div>
      </div>

      {/* Custom DOM Legend placed cleanly above graph (prevents card overlap) */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 mb-2 px-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color1 }} />
          <span className="text-[var(--color-text-main)] truncate max-w-[130px] sm:max-w-none">{m1Meta.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color2 }} />
          <span className="text-[var(--color-text-main)] truncate max-w-[130px] sm:max-w-none">{m2Meta.name}</span>
        </div>
      </div>

      {/* Main Graph Container */}
      <div className="w-full h-[270px] sm:h-[340px] min-h-[210px] min-w-0 relative z-10 outline-none select-none focus:outline-none focus:ring-0 [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus:ring-0 [-webkit-tap-highlight-color:transparent]">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)] rounded-xl border-0 animate-pulse">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              Initializing Analytics Engine...
            </span>
          </div>
        ) : viewMode === 'totals' ? (
          /* Totals Overview Bar Chart */
          <ResponsiveContainer width="100%" height="100%" debounce={50} style={{ outline: 'none' }}>
            <BarChart accessibilityLayer={false} style={{ outline: 'none' }} data={totalsData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="category" 
                stroke="var(--color-border)" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 9, fill: 'var(--color-text-muted)', fontWeight: 600 }}
                dy={6}
              />
              <YAxis 
                stroke="var(--color-border)" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 9, fill: 'var(--color-text-muted)', fontWeight: 500 }}
                tickFormatter={(val) => {
                  if (Math.abs(val) >= 1000000) return `${Math.round(val / 1000000)}M`;
                  if (Math.abs(val) >= 1000) return `${Math.round(val / 1000)}k`;
                  return val;
                }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--color-surface)', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-card)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  padding: '8px 12px'
                }}
                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
                formatter={(val, name) => [
                  name.includes(m1Meta.short) ? formatMetricVal(val, 'profit') : formatMetricVal(val, 'profit'),
                  name
                ]}
              />
              <Bar dataKey="val1" name={m1Meta.name} fill={color1} radius={[4, 4, 0, 0]} isAnimationActive={!isMobile} />
              <Bar dataKey="val2" name={m2Meta.name} fill={color2} radius={[4, 4, 0, 0]} isAnimationActive={!isMobile} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Daily Progression or Cumulative Pace Area Chart */
          <ResponsiveContainer width="100%" height="100%" debounce={50} style={{ outline: 'none' }}>
            <AreaChart accessibilityLayer={false} style={{ outline: 'none' }} data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="cmpGradM1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color1} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color1} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cmpGradM2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color2} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={color2} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="day" 
                stroke="var(--color-border)" 
                tickLine={false} 
                axisLine={false} 
                interval={isMobile ? 2 : 1}
                tick={{ fontSize: 9, fill: 'var(--color-text-muted)', fontWeight: 500 }}
                tickFormatter={(d) => `D${d}`}
                dy={6}
              />
              <YAxis 
                stroke="var(--color-border)" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 9, fill: 'var(--color-text-muted)', fontWeight: 500 }}
                tickFormatter={(val) => {
                  if (Math.abs(val) >= 1000000) return `${Math.round(val / 1000000)}M`;
                  if (Math.abs(val) >= 1000) return `${Math.round(val / 1000)}k`;
                  return val;
                }}
              />
              <Tooltip 
                cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-card)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  padding: '8px 12px'
                }}
                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
                formatter={(val, name) => [
                  formatMetricVal(val, activeMetric),
                  name
                ]}
                labelFormatter={(label) => `Calendar Day ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey={viewMode === 'cumulative' ? 'val1Cum' : 'val1Daily'} 
                name={m1Meta.name} 
                stroke={color1} 
                strokeWidth={isMobile ? 1.5 : 2} 
                fillOpacity={1} 
                fill="url(#cmpGradM1)" 
                connectNulls={false}
                isAnimationActive={!isMobile}
                activeDot={{ r: 3.5, strokeWidth: 0, fill: color1 }} 
              />
              <Area 
                type="monotone" 
                dataKey={viewMode === 'cumulative' ? 'val2Cum' : 'val2Daily'} 
                name={m2Meta.name} 
                stroke={color2} 
                strokeWidth={isMobile ? 1.5 : 2} 
                fillOpacity={1} 
                fill="url(#cmpGradM2)" 
                connectNulls={false}
                isAnimationActive={!isMobile}
                activeDot={{ r: 3.5, strokeWidth: 0, fill: color2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
