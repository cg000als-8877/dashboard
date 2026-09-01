"use client";

import { useKpiData } from '@/utils/useKpiData';
import { Card } from '@/components/ui/Card';
import { 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { LinesSkeleton } from '@/components/ui/Skeletons';

export default function ProductionLines() {
  const { lines, stats, loading, error } = useKpiData();

  if (loading) {
    return <LinesSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  const safeLines = lines || [];
  const profitableLinesCount = safeLines.filter(l => l.netProfit >= 0).length;
  const criticalLinesCount = safeLines.filter(l => l.netProfit < 0).length;

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      {/* Page Header */}
      <header className="pt-4 md:pt-0 mb-6 relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-[22px] sm:text-[26px] md:text-[42px] font-bold tracking-[0.04em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] mb-1 md:mb-2">
          Production Lines
        </h1>
        <p className="text-[var(--color-primary)] font-medium tracking-wide uppercase text-[10px] md:text-xs mt-1 md:mt-2">
          Detailed overview of all active manufacturing lines.
        </p>
      </header>

      {/* ── 1. FACTORY SUMMARY BAR ────────────────────────────────────── */}
      {stats && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 md:p-5 shadow-lg backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-32 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Floor Status Badge */}
            <div className="flex items-center gap-3 w-full lg:w-auto pb-3 lg:pb-0 border-b lg:border-b-0 border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">
                  Factory Floor Status
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-success-text)] bg-[var(--color-success-glow)] px-2 py-0.5 rounded-md border border-[rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={12} /> {profitableLinesCount} Optimal
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-danger-text)] bg-[var(--color-danger-glow)] px-2 py-0.5 rounded-md border border-[rgba(255,59,48,0.3)]">
                    <AlertTriangle size={12} /> {criticalLinesCount} Critical
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 w-full lg:w-auto flex-1 lg:max-w-3xl">
              {/* Total Output */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Output
                </span>
                <span className="text-sm md:text-base font-black text-[var(--color-text-main)] mt-0.5">
                  {Math.round(stats.totalProduction || 0).toLocaleString()}{' '}
                  <span className="text-[10px] text-[var(--color-text-muted)] font-normal">PCS</span>
                </span>
              </div>

              {/* Total Income */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Income
                </span>
                <span className="text-sm md:text-base font-black text-[var(--color-primary)] mt-0.5">
                  BDT {Math.round(stats.totalIncome || 0).toLocaleString()}
                </span>
              </div>

              {/* Total Cost */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Total Cost
                </span>
                <span className="text-sm md:text-base font-black text-amber-500 mt-0.5">
                  BDT {Math.round(stats.totalCost || 0).toLocaleString()}
                </span>
              </div>

              {/* Net P&L */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Net P&amp;L
                </span>
                <span className={`text-sm md:text-base font-black mt-0.5 flex items-center gap-1 ${
                  stats.netProfit >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'
                }`}>
                  {stats.netProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  BDT {Math.round(stats.netProfit || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. LINES GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {safeLines.map((line, idx) => {
          const LINE_COLORS = {
            'a': '#10B981', // Emerald
            'b': '#3B82F6', // Blue
            'c': '#A855F7', // Purple
            'd': '#F59E0B'  // Amber
          };
          const lineAccentColor = LINE_COLORS[line.id.toLowerCase()] || 'var(--color-primary)';
          
          // Efficiency / Cost-Coverage Calculation
          const cost = line.totalCost || 0;
          const income = line.totalIncome || 0;
          const efficiencyRatio = cost > 0 ? (income / cost) * 100 : (income > 0 ? 100 : 0);
          const visualBarPct = Math.min(Math.max(efficiencyRatio, 0), 100);
          const isProfitable = line.netProfit >= 0;

          // Today / Latest day snapshot
          const todayData = line.today;

          return (
            <Card 
              key={line.id} 
              hover 
              className="flex flex-col relative overflow-hidden w-full p-0"
              style={{ 
                '--color-primary': lineAccentColor,
                '--color-primary-glow': `${lineAccentColor}24`,
                '--color-primary-glow-hover': `${lineAccentColor}45`,
                animationDelay: `${idx * 0.1}s` 
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none"></div>
              
              <div className="flex flex-col p-4 md:p-5 relative z-10 h-full">
                {/* Header section */}
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] [filter:var(--shadow-text)]">
                      {line.name}
                    </h2>
                    <p className="text-[10px] md:text-xs text-[var(--color-primary)] font-semibold tracking-tight uppercase mt-1">
                      <span className="text-[var(--color-text-muted)]">ITEM &mdash; </span>
                      {
                        line.item || (line.items && line.items.length > 0 ? line.items.join(', ') : (line.today?.item || (
                          line.name.includes('A') ? 'Flannel Shirt' :
                          line.name.includes('B') ? 'Ladies Top' :
                          line.name.includes('C') ? 'Ladies Bottom' :
                          line.name.includes('D') ? "Men's Tshirt" : 'Unknown'
                        )))
                      }
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all ${
                    isProfitable 
                    ? 'bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.2)]' 
                    : 'bg-[var(--color-danger-glow)] text-[var(--color-danger-text)] border border-[rgba(255,59,48,0.4)] shadow-[0_0_10px_rgba(255,59,48,0.3)] animate-[pulse_0.6s_ease-in-out_infinite]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isProfitable ? 'bg-emerald-400 shadow-[0_0_5px_#10b981] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_#ff3b30]'}`}></span>
                    {isProfitable ? 'Optimal' : 'Critical'}
                  </span>
                </div>

                {/* ── 2. LINE EFFICIENCY RANK BAR ────────────────────────── */}
                <div className="mb-4 bg-[var(--color-bg-main)]/60 p-2.5 rounded-xl border border-[var(--color-border)]">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                      <Activity size={12} className={isProfitable ? "text-[var(--color-success-text)]" : "text-amber-400"} />
                      Cost Recovery Efficiency
                    </span>
                    <span className={isProfitable ? "text-[var(--color-success-text)] font-black" : "text-[var(--color-danger-text)] font-black"}>
                      {efficiencyRatio.toFixed(1)}% {isProfitable ? '• Self-Sustaining' : '• Deficit'}
                    </span>
                  </div>
                  
                  {/* Progress Track */}
                  <div className="w-full h-2 rounded-full bg-[var(--color-surface)] overflow-hidden border border-[var(--color-border)] relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isProfitable 
                          ? 'bg-gradient-to-r from-emerald-500 to-[var(--color-primary)]' 
                          : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`}
                      style={{ width: `${visualBarPct}%` }}
                    />
                  </div>
                </div>

                {/* Stats flex wrap */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
                  <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
                    <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Production</p>
                    <p className="text-sm md:text-lg font-semibold md:font-bold text-[var(--color-text-main)]">
                      {line.totalProduction.toLocaleString()} <span className="text-[9px] md:text-xs text-[var(--color-text-muted)]">PCS</span>
                    </p>
                  </div>
                  <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
                    <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Income</p>
                    <p className="text-sm md:text-lg font-semibold md:font-bold text-[var(--color-primary)]">
                      BDT {Math.round(line.totalIncome).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
                    <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Cost</p>
                    <p className="text-sm md:text-lg font-semibold md:font-bold text-amber-500">
                      BDT {Math.round(line.totalCost).toLocaleString()}
                    </p>
                  </div>
                  <div className={`bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border shadow-sm transition-transform hover:-translate-y-0.5 duration-200 ${
                    isProfitable ? 'border-[rgba(16,185,129,0.15)] bg-[var(--color-success-glow)]' : 'border-[rgba(255,59,48,0.15)] bg-[var(--color-danger-glow)]'
                  }`}>
                    <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">
                      {isProfitable ? 'Net Profit' : 'Net Loss'}
                    </p>
                    <p className={`text-sm md:text-lg font-semibold md:font-bold [filter:var(--shadow-text)] ${
                      isProfitable ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'
                    }`}>
                      BDT {Math.round(line.netProfit).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ── 3. LIVE "TODAY" SNAPSHOT ROW ─────────────────────── */}
                <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)]/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
                      <Clock size={11} className="text-[var(--color-primary)]" />
                      Latest Shift Snapshot
                      {todayData?.date && (
                        <span className="text-[9px] text-[var(--color-text-muted)] font-normal">
                          ({todayData.date})
                        </span>
                      )}
                    </span>
                    {todayData?.production_qty > 0 ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                        Active Shift
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-500/10 text-[var(--color-text-muted)] border border-[var(--color-border)]">
                        No Output Logged
                      </span>
                    )}
                  </div>

                  {todayData ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[var(--color-surface)]/60 rounded-lg p-1.5 border border-[var(--color-border)]/50">
                        <p className="text-[8px] uppercase text-[var(--color-text-muted)] font-medium">Output</p>
                        <p className="text-xs font-bold text-[var(--color-text-main)]">
                          {(todayData.production_qty || 0).toLocaleString()} <span className="text-[8px] font-normal text-[var(--color-text-muted)]">PCS</span>
                        </p>
                      </div>
                      <div className="bg-[var(--color-surface)]/60 rounded-lg p-1.5 border border-[var(--color-border)]/50">
                        <p className="text-[8px] uppercase text-[var(--color-text-muted)] font-medium">Income</p>
                        <p className="text-xs font-bold text-[var(--color-primary)]">
                          BDT {Math.round(todayData.total_income || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-[var(--color-surface)]/60 rounded-lg p-1.5 border border-[var(--color-border)]/50">
                        <p className="text-[8px] uppercase text-[var(--color-text-muted)] font-medium">Day Net</p>
                        <p className={`text-xs font-bold ${
                          (todayData.net_profit || 0) >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'
                        }`}>
                          BDT {Math.round(todayData.net_profit || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-1">
                      No shift records available for this line.
                    </p>
                  )}
                </div>

                {/* View Details Button */}
                <div className="mt-auto pt-1 w-full">
                  <Link 
                    href={`/lines/${line.id}`}
                    className="group relative flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-[var(--color-border)] hover:border-transparent overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-[var(--color-primary)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-text-secondary)] group-hover:text-[var(--color-on-primary)] relative z-10 transition-colors duration-300">
                      View Details
                    </span>
                    <ArrowRight size={16} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-on-primary)] group-hover:translate-x-1 relative z-10 transition-all duration-300" />
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

