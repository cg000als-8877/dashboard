"use client";

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { DailyPerformanceChart, IncomeVsCostChart } from '@/components/dashboard/DashboardCharts';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RealTimeClock } from '@/components/ui/RealTimeClock';

export default function Dashboard() {
  const { stats, dailyTrends, insights, lines, loading, error } = useKpiData();

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

  const startDate = dailyTrends?.length > 0 ? dailyTrends[0].date : null;
  const endDate = dailyTrends?.length > 0 ? dailyTrends[dailyTrends.length - 1].date : null;
  
  let dateText = '';
  let currentCalendarDay = 1;
  if (startDate && endDate) {
    const formatStr = 'do MMMM, yyyy';
    dateText = `from ${format(parseISO(startDate), 'do')} to ${format(parseISO(endDate), formatStr)}`;
    currentCalendarDay = parseInt(endDate.split('-')[2], 10);
  }

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both]">


      {/* Titanic Fun Animation Section */}
      <div className="w-full">
        <TitanicAnimation netProfit={stats.netProfit} simDay={currentCalendarDay} />
      </div>

      {/* Hero Statistics */}
      <div className="mt-8">
        <div className="mb-8 md:mb-10 flex flex-col items-start relative z-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            System Overview
          </h2>
          {dateText && (
            <span className="block mt-2 px-3 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full text-xs font-bold tracking-widest text-[var(--color-primary)] uppercase">
              {dateText}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <MetricCard 
          title="Total Cost" 
          value={`BDT ${Math.round(stats.totalCost).toLocaleString()}`} 
          color="warning"
        />
        <MetricCard 
          title="Total Income" 
          value={`BDT ${Math.round(stats.totalIncome).toLocaleString()}`}
          color="primary"
        />
        <MetricCard 
          title={stats.netProfit >= 0 ? "Net Profit" : "Net Loss"} 
          value={`${stats.netProfit > 0 ? '+' : ''}${Math.round(stats.netProfit).toLocaleString()}`}
          color={stats.netProfit >= 0 ? 'success' : 'danger'}
        />
        <MetricCard 
          title="Working Days" 
          value={`${stats.workingDays} Days`} 
        />
        <MetricCard 
          title="Production Lines" 
          value={`${stats.activeLinesCount} Active`} 
        />
        <MetricCard 
          title={stats.averageDailyProfit >= 0 ? "Avg Daily Profit" : "Avg Daily Loss"} 
          value={`${Math.round(stats.averageDailyProfit).toLocaleString()} / day`}
          color={stats.averageDailyProfit >= 0 ? 'success' : 'danger'}
        />
      </div>
      </div>

      {/* Production Lines Horizontal Dashboard */}
      <div className="mt-12 mb-10 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-4 w-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)]"></div>
          <h2 className="text-xl font-black tracking-widest uppercase text-white">Line Diagnostics</h2>
        </div>
        <div className="flex flex-col gap-5">
          {lines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => (
            <Card key={line.id} className="relative overflow-hidden w-full p-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent pointer-events-none"></div>
              <div className="flex flex-col xl:flex-row items-center gap-6 justify-between w-full p-5 relative z-10">
                
                <div className="flex-shrink-0 w-full xl:w-56 xl:border-r xl:border-[rgba(255,255,255,0.05)] xl:pr-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-md">{line.name}</h2>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          line.netProfit >= 0 ? 'bg-[rgba(16,185,129,0.1)] text-emerald-400 border border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(255,59,48,0.1)] text-red-400 border border-[rgba(255,59,48,0.2)]'
                        }`}>
                          <span className={`w-1 h-1 rounded-full animate-pulse ${line.netProfit >= 0 ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-red-400 shadow-[0_0_5px_#ff3b30]'}`}></span>
                          {line.netProfit >= 0 ? 'Optimal' : 'Critical'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-primary)] font-bold tracking-[0.2em] uppercase">
                    {line.today?.item || (
                      line.name.includes('A') ? 'Flannel Shirt' :
                      line.name.includes('B') ? 'Ladies Top' :
                      line.name.includes('C') ? 'Ladies Bottom' :
                      line.name.includes('D') ? "Men's Tshirt" : 'Unknown'
                    )}
                  </p>
                </div>

                <div className="flex flex-row flex-wrap md:flex-nowrap w-full gap-3 md:gap-4 justify-between">
                  <div className="bg-[rgba(0,0,0,0.2)] backdrop-blur-md p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] flex-1 min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Production</p>
                    <p className="text-lg md:text-xl font-black text-gray-200">{line.totalProduction} <span className="text-xs text-gray-600">PCS</span></p>
                  </div>
                  
                  <div className="bg-[rgba(0,0,0,0.2)] backdrop-blur-md p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] flex-1 min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Income</p>
                    <p className="text-lg md:text-xl font-black text-[var(--color-primary)]">BDT {Math.round(line.totalIncome).toLocaleString()}</p>
                  </div>

                  <div className="bg-[rgba(0,0,0,0.2)] backdrop-blur-md p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] flex-1 min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Cost</p>
                    <p className="text-lg md:text-xl font-black text-amber-500">BDT {Math.round(line.totalCost).toLocaleString()}</p>
                  </div>

                  <div className={`bg-[rgba(0,0,0,0.2)] backdrop-blur-md p-4 rounded-2xl border flex-1 min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300 ${line.netProfit >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-gradient-to-b from-[rgba(16,185,129,0.05)] to-transparent' : 'border-[rgba(255,59,48,0.15)] bg-gradient-to-b from-[rgba(255,59,48,0.05)] to-transparent'}`}>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{line.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                    <p className={`text-lg md:text-xl font-black drop-shadow-md ${line.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      BDT {Math.round(line.netProfit).toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>
              {/* Decorative side accent */}
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: line.netProfit >= 0 ? '#10b981' : '#ff3b30' }}></div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <Card className="relative bg-[rgba(10,13,20,0.8)] backdrop-blur-2xl border-[rgba(255,255,255,0.05)] shadow-2xl overflow-hidden p-6">
          <div className="flex items-start gap-5">
            <div className="hidden md:flex bg-[rgba(79,140,255,0.1)] p-3 rounded-xl border border-[rgba(79,140,255,0.2)] text-[var(--color-primary)] shrink-0 shadow-[0_0_15px_rgba(79,140,255,0.2)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="w-full">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                System Intelligence
              </h3>
              <ul className="space-y-3 w-full">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0 shadow-[0_0_5px_var(--color-primary)]"></span>
                    <span className="text-sm font-medium text-gray-300 leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>


      {/* Charts */}
      <div className="mt-14 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-4 w-1 bg-purple-500 rounded-full shadow-[0_0_10px_purple]"></div>
          <h2 className="text-xl font-black tracking-widest uppercase text-white">Performance Telemetry</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyPerformanceChart data={dailyTrends} />
          <IncomeVsCostChart data={dailyTrends} />
        </div>
      </div>

      {/* Mobile only update status */}
      <div className="md:hidden mt-8 pb-4 text-center">
        <p className="text-[10px] text-gray-500 font-medium tracking-wide">Last updated data 25 july, 2026</p>
      </div>
    </div>
  );
}
