"use client";

import { useKpiData } from '@/utils/useKpiData';
import { Card } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductionLines() {
  const { lines, loading, error } = useKpiData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      <header className="mb-10 relative z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
          Production Lines
        </h1>
        <p className="text-[var(--color-primary)] font-medium tracking-widest uppercase text-xs mt-2">Detailed overview of all active manufacturing lines.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lines.map((line, idx) => (
          <Card 
            key={line.id} 
            hover 
            className="flex flex-col relative overflow-hidden border-l-4" 
            style={{
              animationDelay: `${idx * 0.1}s`,
              borderLeftColor: line.netProfit >= 0 ? '#10b981' : '#ff3b30'
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold md:font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] [filter:var(--shadow-text)]">{line.name}</h2>
                <p className="text-xs text-[var(--color-primary)] font-medium tracking-[0.2em] uppercase mt-1">
                  {
                    line.name.includes('A') ? 'Flannel Shirt' :
                    line.name.includes('B') ? 'Ladies Top' :
                    line.name.includes('C') ? 'Ladies Bottom' :
                    line.name.includes('D') ? "Men's Tshirt" : 'Unknown'
                  }
                </p>
                <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-widest mt-2">Avg Workers: <span className="text-[var(--color-text-main)]">{line.averageWorkers}</span></p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-inner ${
                line.netProfit >= 0 ? 'bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.2)]' : 'bg-[var(--color-danger-glow)] text-[var(--color-danger-text)] border border-[rgba(255,59,48,0.2)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${line.netProfit >= 0 ? 'bg-[#10b981] shadow-[0_0_5px_#10b981]' : 'bg-[#ff3b30] shadow-[0_0_5px_#ff3b30]'}`}></span>
                {line.netProfit >= 0 ? 'Optimal' : 'Critical'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[var(--color-surface)] backdrop-blur-md p-4 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Total Production</p>
                <p className="text-lg md:text-xl font-semibold md:font-bold text-[var(--color-text-main)]">{line.totalProduction} <span className="text-xs text-[var(--color-text-muted)]">PCS</span></p>
              </div>
              <div className={`bg-[var(--color-surface)] backdrop-blur-md p-4 rounded-2xl border shadow-inner transition-transform hover:-translate-y-1 duration-300 ${line.netProfit >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-[var(--color-success-glow)]' : 'border-[rgba(255,59,48,0.15)] bg-[var(--color-danger-glow)]'}`}>
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">{line.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                <p className={`text-lg md:text-xl font-semibold md:font-bold [filter:var(--shadow-text)] ${line.netProfit >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                  BDT {Math.round(line.netProfit).toLocaleString()}
                </p>
              </div>
              <div className="bg-[var(--color-surface)] backdrop-blur-md p-4 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Total Income</p>
                <p className="text-lg md:text-xl font-semibold md:font-bold text-[var(--color-primary)]">BDT {Math.round(line.totalIncome).toLocaleString()}</p>
              </div>
              <div className="bg-[var(--color-surface)] backdrop-blur-md p-4 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Total Cost</p>
                <p className="text-lg md:text-xl font-semibold md:font-bold text-amber-500">BDT {Math.round(line.totalCost).toLocaleString()}</p>
              </div>
            </div>

            <Link 
              href={`/lines/${line.id}`}
              className="mt-auto group flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all duration-300"
            >
              <span className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">View Details</span>
              <ArrowRight size={16} className="text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-surface)] to-transparent pointer-events-none"></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
