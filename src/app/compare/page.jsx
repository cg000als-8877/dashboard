"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useKpiData } from '@/utils/useKpiData';
import { createKpiEngine } from '@/utils/kpiEngine';
import { GitCompare, Clock, Calendar as CalendarIcon, TrendingUp, Sparkles, AlertTriangle, HelpCircle, LayoutDashboard, Calendar } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const cn = (...classes) => classes.filter(Boolean).join(" ");

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

// Custom Page Skeleton
function CompareSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-48 bg-[var(--color-text-muted)]/30" />
        <ShimmerBlock className="h-4 w-64 bg-[var(--color-text-muted)]/15" />
      </div>
      <div className="flex gap-2 border-b border-[var(--color-border)] pb-1.5">
        {[1, 2, 3].map(t => (
          <ShimmerBlock key={t} className="h-9 w-28 bg-[var(--color-text-muted)]/15 rounded-lg" />
        ))}
      </div>
      <div className="bg-[var(--color-bg-card)]/50 border border-[var(--color-border)]/60 rounded-2xl p-6 h-[400px] shimmer" />
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
  const [month2, setMonth2] = useState('2026-07');
  const [month1Data, setMonth1Data] = useState(null);
  const [month2Data, setMonth2Data] = useState(null);
  const [loadingMonths, setLoadingMonths] = useState(false);

  // Fetch base live data (pre-calculated values)
  const { stats, lines, dailyTrends, loading: baseLoading } = useKpiData('live');

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
    // We overlay the latest hourly report (Date 1) for the two chosen lines
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

    // Metrics scaled from 0 to 100 for visual comparison
    return [
      {
        metric: 'Target Achievement %',
        line1: Math.min(100, Math.round((l1.totalProduction / (l1.totalProduction * 0.95 + 1000)) * 100)), // estimated relative scale
        line2: Math.min(100, Math.round((l2.totalProduction / (l2.totalProduction * 0.95 + 1000)) * 100))
      },
      {
        metric: 'Consistency %',
        line1: Math.min(100, Math.round(l1.daysActive > 0 ? (l1.daysActive / 20) * 100 : 0)),
        line2: Math.min(100, Math.round(l2.daysActive > 0 ? (l2.daysActive / 20) * 100 : 0))
      },
      {
        metric: 'Manpower Efficiency',
        line1: Math.min(100, Math.round(l1.averageWorkers > 0 ? (l1.totalProduction / (l1.averageWorkers * 12)) : 0)),
        line2: Math.min(100, Math.round(l2.averageWorkers > 0 ? (l2.totalProduction / (l2.averageWorkers * 12)) : 0))
      },
      {
        metric: 'Output CM Value',
        line1: Math.min(100, Math.round((l1.averageCm / 1500) * 100)),
        line2: Math.min(100, Math.round((l2.averageCm / 1500) * 100))
      },
      {
        metric: 'Operational Velocity',
        line1: Math.min(100, Math.round((l1.totalProduction / 50000) * 100)),
        line2: Math.min(100, Math.round((l2.totalProduction / 50000) * 100))
      }
    ];
  };

  // 2. Date vs Date: Intraday Match & Shift Contrast
  const getDateComparisonData = () => {
    if (!date1Data || !date2Data) return [];

    const labels = date1Data.timeLabels || [];
    return labels.map((label, idx) => {
      // Sum all active lines for date 1
      let d1Sum = 0;
      date1Data.lines.forEach(l => { d1Sum += (l.actual[idx] || 0); });

      // Sum all active lines for date 2
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
      { shift: 'Day Shift (1st-6th Hr)', date1: d1Day, date2: d2Day },
      { shift: 'Night Shift (7th-11th Hr)', date1: d1Night, date2: d2Night }
    ];
  };

  // 3. Month vs Month: Total delta bar chart
  const getMonthComparisonData = () => {
    if (!month1Data || !month2Data) return [];

    const m1Stats = month1Data.stats;
    const m2Stats = month2Data.stats;

    return [
      {
        metric: 'Total Production',
        month1: Math.round(m1Stats.totalProduction / 1000), // in K
        month2: Math.round(m2Stats.totalProduction / 1000),
        unit: 'K Pieces'
      },
      {
        metric: 'Total Cost',
        month1: Math.round(m1Stats.totalCost / 100000), // in Lac BDT
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
    <div className="space-y-6 pb-24 md:pt-0">
      
      {/* Page Header */}
      <header className="flex flex-col mb-4 relative z-10">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--color-text-main)] font-display uppercase">Comparison Center</h1>
        <p className="text-[var(--color-text-muted)] mt-1 text-xs md:text-sm">Cross-sectional analysis across production lines, dates, and historical archives.</p>
      </header>

      {/* Selector Tabs */}
      <div className="flex gap-1.5 border-b border-[var(--color-border)]/50 pb-px">
        {[
          { id: 'line', label: 'Line vs Line', icon: GitCompare },
          { id: 'date', label: 'Date vs Date', icon: Clock },
          { id: 'month', label: 'Month vs Month', icon: Calendar }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer relative",
                isSelected
                  ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* COMPARATOR PANELS */}

      {/* 1. LINE VS LINE COMPARATOR */}
      {activeTab === 'line' && (
        <div className="space-y-6 animate-[fade-in_0.3s_ease-out_both]">
          {/* Controls Card */}
          <Card className="p-4 bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/60">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="text-[var(--color-primary)] h-5 w-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">Select Production Lines</h3>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-extrabold mb-1">Line 1</label>
                  <select
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="w-full sm:w-32 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 font-semibold"
                  >
                    {Object.keys(LINE_META).map(id => <option key={id} value={id} disabled={id === line2}>LINE {id}</option>)}
                  </select>
                </div>
                <span className="text-[var(--color-text-muted)] mt-4 font-mono font-bold">VS</span>
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-extrabold mb-1">Line 2</label>
                  <select
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="w-full sm:w-32 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 font-semibold"
                  >
                    {Object.keys(LINE_META).map(id => <option key={id} value={id} disabled={id === line1}>LINE {id}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Side-by-Side Dual Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Line 1 Card */}
            {(() => {
              const meta1 = LINE_META[line1];
              const stats1 = lines?.find(l => l.id === line1);
              if (!stats1) return null;
              return (
                <Card 
                  className="p-5 border-t-4 bg-[var(--color-bg-card)]/75"
                  style={{ borderTopColor: meta1.color, boxShadow: `0 4px 30px rgba(0, 0, 0, 0.15), inset 0 0 12px ${meta1.color}15` }}
                >
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)]/40 pb-2">
                    <h4 className="text-base font-bold font-display tracking-wide" style={{ color: meta1.color }}>{meta1.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">Aggregated Data</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Total Output</span>
                      <p className="text-xl font-bold text-[var(--color-text-main)]">{stats1.totalProduction.toLocaleString()} pcs</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Net Profit</span>
                      <p className={cn("text-xl font-bold", stats1.netProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        BDT {stats1.netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Avg Manpower</span>
                      <p className="text-xl font-bold text-[var(--color-text-main)]">{stats1.averageWorkers} operators</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Avg Cost CM</span>
                      <p className="text-xl font-bold text-[var(--color-text-main)]">BDT {stats1.averageCm.toLocaleString()}</p>
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
                <Card 
                  className="p-5 border-t-4 bg-[var(--color-bg-card)]/75"
                  style={{ borderTopColor: meta2.color, boxShadow: `0 4px 30px rgba(0, 0, 0, 0.15), inset 0 0 12px ${meta2.color}15` }}
                >
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)]/40 pb-2">
                    <h4 className="text-base font-bold font-display tracking-wide" style={{ color: meta2.color }}>{meta2.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">Aggregated Data</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Total Output</span>
                      <p className="text-xl font-bold text-[var(--color-text-main)]">{stats2.totalProduction.toLocaleString()} pcs</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Net Profit</span>
                      <p className={cn("text-xl font-bold", stats2.netProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        BDT {stats2.netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Avg Manpower</span>
                      <p className="text-xl font-bold text-[var(--color-text-main)]">{stats2.averageWorkers} operators</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Avg Cost CM</span>
                      <p className="text-xl font-bold text-[var(--color-text-main)]">BDT {stats2.averageCm.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overlap Hourly Chart */}
            <Card className="lg:col-span-2 p-5 bg-[var(--color-bg-card)]/75">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4 font-display">Overlap Hourly Outputs</h4>
              <div className="h-[300px]">
                {loadingDates ? (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getLineComparisonData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                      <XAxis dataKey="hour" stroke="var(--color-text-muted)" fontSize={10} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}
                        labelStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" name={`LINE ${line1} (Solid)`} dataKey="line1Actual" stroke={LINE_META[line1].color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" name={`LINE ${line2} (Dashed)`} dataKey="line2Actual" stroke={LINE_META[line2].color} strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* KPI Efficiency Radar */}
            <Card className="lg:col-span-1 p-5 bg-[var(--color-bg-card)]/75">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4 font-display">KPI Efficiency index</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="70%" data={getLineRadarData()}>
                    <PolarGrid stroke="var(--color-border)" opacity={0.4} />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--color-text-secondary)', fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--color-border)" tick={{ fill: 'var(--color-text-muted)', fontSize: 8 }} />
                    <Radar name={`LINE ${line1}`} dataKey="line1" stroke={LINE_META[line1].color} fill={LINE_META[line1].color} fillOpacity={0.15} />
                    <Radar name={`LINE ${line2}`} dataKey="line2" stroke={LINE_META[line2].color} fill={LINE_META[line2].color} fillOpacity={0.15} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. DATE VS DATE COMPARATOR */}
      {activeTab === 'date' && (
        <div className="space-y-6 animate-[fade-in_0.3s_ease-out_both]">
          {/* Controls Card */}
          <Card className="p-4 bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/60">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-[var(--color-primary)] h-5 w-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">Select Production Dates</h3>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-extrabold mb-1">Date 1</label>
                  <select
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 font-semibold"
                  >
                    {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <span className="text-[var(--color-text-muted)] mt-4 font-mono font-bold">VS</span>
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-extrabold mb-1">Date 2</label>
                  <select
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 font-semibold"
                  >
                    {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Intraday speed matching chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-5 bg-[var(--color-bg-card)]/75">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4 font-display">Intraday Speed Matching (Total Factory Output)</h4>
              <div className="h-[300px]">
                {loadingDates ? (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getDateComparisonData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                      <XAxis dataKey="hour" stroke="var(--color-text-muted)" fontSize={10} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" name={date1} dataKey="date1Actual" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" name={date2} dataKey="date2Actual" stroke="var(--color-warning)" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Shift efficiency bar chart */}
            <Card className="lg:col-span-1 p-5 bg-[var(--color-bg-card)]/75">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4 font-display">Shift Efficiency Contrast</h4>
              <div className="h-[300px]">
                {loadingDates ? (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getShiftContrastData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                      <XAxis dataKey="shift" stroke="var(--color-text-muted)" fontSize={10} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}
                      />
                      <Legend />
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

      {/* 3. MONTH VS MONTH COMPARATOR */}
      {activeTab === 'month' && (
        <div className="space-y-6 animate-[fade-in_0.3s_ease-out_both]">
          {/* Controls Card */}
          <Card className="p-4 bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/60">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-[var(--color-primary)] h-5 w-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">Select Archive Months</h3>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-extrabold mb-1">Month 1</label>
                  <select
                    value={month1}
                    onChange={(e) => setMonth1(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 font-semibold"
                  >
                    <option value="live">August 2026 (Live)</option>
                    {availableMonths.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <span className="text-[var(--color-text-muted)] mt-4 font-mono font-bold">VS</span>
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-extrabold mb-1">Month 2</label>
                  <select
                    value={month2}
                    onChange={(e) => setMonth2(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 font-semibold"
                  >
                    <option value="live">August 2026 (Live)</option>
                    {availableMonths.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Historical snapshot grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Month 1 Stats */}
            {month1Data && (
              <Card className="p-5 bg-[var(--color-bg-card)]/75 border border-[var(--color-border)]/60">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)]/40 pb-2">
                  <h4 className="text-base font-bold font-display text-[var(--color-primary)]">
                    {month1 === 'live' ? 'August 2026' : availableMonths.find(m => m.id === month1)?.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">Snapshot Totals</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Production</span>
                    <p className="text-xl font-bold text-[var(--color-text-main)]">{month1Data.stats.totalProduction.toLocaleString()} pcs</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Net Profit</span>
                    <p className={cn("text-xl font-bold", month1Data.stats.netProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      BDT {month1Data.stats.netProfit.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Revenue</span>
                    <p className="text-xl font-bold text-[var(--color-text-main)]">BDT {month1Data.stats.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Operation Cost</span>
                    <p className="text-xl font-bold text-[var(--color-text-main)]">BDT {month1Data.stats.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Month 2 Stats */}
            {month2Data && (
              <Card className="p-5 bg-[var(--color-bg-card)]/75 border border-[var(--color-border)]/60">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)]/40 pb-2">
                  <h4 className="text-base font-bold font-display text-warning-400 text-[var(--color-warning)]">
                    {month2 === 'live' ? 'August 2026' : availableMonths.find(m => m.id === month2)?.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">Snapshot Totals</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Production</span>
                    <p className="text-xl font-bold text-[var(--color-text-main)]">{month2Data.stats.totalProduction.toLocaleString()} pcs</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Net Profit</span>
                    <p className={cn("text-xl font-bold", month2Data.stats.netProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      BDT {month2Data.stats.netProfit.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Revenue</span>
                    <p className="text-xl font-bold text-[var(--color-text-main)]">BDT {month2Data.stats.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Operation Cost</span>
                    <p className="text-xl font-bold text-[var(--color-text-main)]">BDT {month2Data.stats.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Monthly overlay trends */}
          <Card className="p-5 bg-[var(--color-bg-card)]/75">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)] mb-4 font-display">Macro Performance Overlays (Normalized comparison)</h4>
            <div className="h-[300px]">
              {loadingMonths ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] shimmer rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthComparisonData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                    <XAxis dataKey="metric" stroke="var(--color-text-muted)" fontSize={10} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}
                      formatter={(value, name, props) => [`${value} ${props.payload.unit}`, name === 'month1' ? (month1 === 'live' ? 'August 2026' : 'Month 1') : (month2 === 'live' ? 'August 2026' : 'Month 2')]}
                    />
                    <Legend 
                      formatter={(value) => value === 'month1' ? (month1 === 'live' ? 'August 2026' : 'Month 1') : (month2 === 'live' ? 'August 2026' : 'Month 2')}
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
