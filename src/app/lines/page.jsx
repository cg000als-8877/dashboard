"use client";

import { useKpiData } from '@/utils/useKpiData';
import { Card } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LinesSkeleton } from '@/components/ui/Skeletons';

export default function ProductionLines() {
  const { lines, loading, error } = useKpiData();

  if (loading) {
    return <LinesSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      <header className="pt-4 md:pt-0 mb-10 relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-xl md:text-4xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] mb-1 md:mb-2">
          Production Lines
        </h1>
        <p className="text-[var(--color-primary)] font-medium tracking-wide uppercase text-[10px] md:text-xs mt-1 md:mt-2">Detailed overview of all active manufacturing lines.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lines.map((line, idx) => {
          const LINE_COLORS = {
            'a': '#10B981', // Emerald
            'b': '#3B82F6', // Blue
            'c': '#A855F7', // Purple
            'd': '#F59E0B'  // Amber
          };
          const lineAccentColor = LINE_COLORS[line.id.toLowerCase()] || 'var(--color-primary)';
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
              <div className="flex items-center justify-between mb-4 w-full">
                <div className="flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] [filter:var(--shadow-text)]">{line.name}</h2>
                  <p className="text-[10px] md:text-xs text-[var(--color-primary)] font-semibold tracking-tight uppercase mt-1">
                    <span className="text-[var(--color-text-muted)]">ITEM &mdash; </span>
                    {
                      line.name.includes('A') ? 'Flannel Shirt' :
                      line.name.includes('B') ? 'Ladies Top' :
                      line.name.includes('C') ? 'Ladies Bottom' :
                      line.name.includes('D') ? "Men's Tshirt" : 'Unknown'
                    }
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all ${
                  line.netProfit >= 0 
                  ? 'bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.2)]' 
                  : 'bg-[var(--color-danger-glow)] text-[var(--color-danger-text)] border border-[rgba(255,59,48,0.4)] shadow-[0_0_10px_rgba(255,59,48,0.3)] animate-[pulse_0.6s_ease-in-out_infinite]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${line.netProfit >= 0 ? 'bg-emerald-400 shadow-[0_0_5px_#10b981] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_#ff3b30]'}`}></span>
                  {line.netProfit >= 0 ? 'Optimal' : 'Critical'}
                </span>
              </div>

              {/* Stats flex wrap */}
              <div className="flex flex-row flex-wrap w-full gap-2 md:gap-3 mb-5">
                <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] flex-1 basis-[45%] shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Production</p>
                  <p className="text-sm md:text-lg font-semibold md:font-bold text-[var(--color-text-main)]">{line.totalProduction} <span className="text-[9px] md:text-xs text-[var(--color-text-muted)]">PCS</span></p>
                </div>
                <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] flex-1 basis-[45%] shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Income</p>
                  <p className="text-sm md:text-lg font-semibold md:font-bold text-[var(--color-primary)]">BDT {Math.round(line.totalIncome).toLocaleString()}</p>
                </div>
                <div className="bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border border-[var(--color-border)] flex-1 basis-[45%] shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Cost</p>
                  <p className="text-sm md:text-lg font-semibold md:font-bold text-amber-500">BDT {Math.round(line.totalCost).toLocaleString()}</p>
                </div>
                <div className={`bg-[var(--color-surface)] p-2.5 md:p-3 rounded-xl border flex-1 basis-[45%] shadow-sm transition-transform hover:-translate-y-1 duration-300 ${line.netProfit >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-[var(--color-success-glow)]' : 'border-[rgba(255,59,48,0.15)] bg-[var(--color-danger-glow)]'}`}>
                  <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">{line.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                  <p className={`text-sm md:text-lg font-semibold md:font-bold [filter:var(--shadow-text)] ${line.netProfit >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                    BDT {Math.round(line.netProfit).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* View Details Button */}
              <div className="mt-auto pt-3 w-full">
                <Link 
                  href={`/lines/${line.id}`}
                  className="group relative flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-[var(--color-border)] hover:border-transparent overflow-hidden transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-[var(--color-primary)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-text-secondary)] group-hover:text-[var(--color-on-primary)] relative z-10 transition-colors duration-300">View Details</span>
                  <ArrowRight size={16} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-on-primary)] group-hover:translate-x-1 relative z-10 transition-all duration-300" />
                </Link>
              </div>
            </div>
            {/* Decorative side accent */}
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: line.netProfit >= 0 ? '#10b981' : '#ff3b30' }}></div>
          </Card>
        );
      })}
      </div>
    </div>
  );
}
