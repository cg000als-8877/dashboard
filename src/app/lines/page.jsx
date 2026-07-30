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
        <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
          Production Lines
        </h1>
        <p className="text-[var(--color-primary)] font-bold tracking-widest uppercase text-xs mt-2">Detailed overview of all active manufacturing lines.</p>
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
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-md">{line.name}</h2>
                <p className="text-xs text-[var(--color-primary)] font-bold tracking-[0.2em] uppercase mt-1">
                  {
                    line.name.includes('A') ? 'Flannel Shirt' :
                    line.name.includes('B') ? 'Ladies Top' :
                    line.name.includes('C') ? 'Ladies Bottom' :
                    line.name.includes('D') ? "Men's Tshirt" : 'Unknown'
                  }
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Avg Workers: <span className="text-gray-300">{line.averageWorkers}</span></p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-inner ${
                line.netProfit >= 0 ? 'bg-[rgba(16,185,129,0.1)] text-emerald-400 border border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(255,59,48,0.1)] text-red-400 border border-[rgba(255,59,48,0.2)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${line.netProfit >= 0 ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-red-400 shadow-[0_0_5px_#ff3b30]'}`}></span>
                {line.netProfit >= 0 ? 'Optimal' : 'Critical'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[rgba(0,0,0,0.2)] backdrop-blur-md p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Production</p>
                <p className="text-xl font-black text-gray-200">{line.totalProduction} <span className="text-xs text-gray-600">PCS</span></p>
              </div>
              <div className={`bg-[rgba(0,0,0,0.2)] backdrop-blur-md p-4 rounded-2xl border shadow-inner transition-transform hover:-translate-y-1 duration-300 ${line.netProfit >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-gradient-to-b from-[rgba(16,185,129,0.05)] to-transparent' : 'border-[rgba(255,59,48,0.15)] bg-gradient-to-b from-[rgba(255,59,48,0.05)] to-transparent'}`}>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{line.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                <p className={`text-xl font-black drop-shadow-md ${line.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  BDT {Math.round(line.netProfit).toLocaleString()}
                </p>
              </div>
              <div className="bg-[var(--color-bg-main)] p-4 rounded-xl border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Total Income</p>
                <p className="text-lg font-semibold text-[var(--color-primary)]">BDT {Math.round(line.totalIncome).toLocaleString()}</p>
              </div>
              <div className="bg-[var(--color-bg-main)] p-4 rounded-xl border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Total Cost</p>
                <p className="text-lg font-semibold text-[var(--color-warning)]">BDT {Math.round(line.totalCost).toLocaleString()}</p>
              </div>
            </div>

            <Link 
              href={`/lines/${line.id}`}
              className="mt-auto group flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] transition-all duration-300"
            >
              <span className="text-sm font-bold tracking-widest uppercase text-white group-hover:text-[var(--color-primary)] transition-colors">View Details</span>
              <ArrowRight size={16} className="text-white group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none"></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
