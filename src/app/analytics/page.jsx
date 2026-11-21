"use client";

import React, { useState } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { DailyPerformanceChart, IncomeVsCostChart, MonthlyProfitBarChart } from '@/components/dashboard/DashboardCharts';
import { MonthComparisonChart } from '@/components/dashboard/MonthComparisonChart';
import { SystemIntelligenceCards } from '@/components/dashboard/SystemIntelligenceCards';
import { AnalyticsSkeleton } from '@/components/ui/Skeletons';
import { cn } from '@/components/layout/Sidebar';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'intelligence'
  const { dailyTrends, insights, loading, error } = useKpiData();

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-[fade-up_0.4s_ease-out_both]">
      {/* Page Header */}
      <header className="flex flex-col items-center text-center md:items-start md:text-left mb-3 sm:mb-4 relative z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-[24px] sm:text-[30px] md:text-[38px] font-black tracking-normal leading-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
          {activeTab === 'analytics' ? 'Analytics' : 'System Intelligence'}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-muted)] font-normal tracking-normal mt-1 md:mt-1.5 max-w-2xl">
          {activeTab === 'analytics' 
            ? 'Comprehensive trends, cost efficiency breakdowns, and performance analytics.'
            : 'Autonomous diagnostic telemetry, operational anomalies, and tactical directives.'}
        </p>
      </header>

      {/* ── 2-SIDED TAB SWITCHER (One side Analytics, one side System Intelligence; No dots, No strokes) ── */}
      <div className="flex items-center justify-center md:justify-start w-full">
        <div className="grid grid-cols-2 gap-1 p-1 w-full max-w-[420px] sm:w-[380px] bg-[var(--color-surface)]/80 backdrop-blur-md rounded-2xl border-0 shadow-xs select-none">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-0 outline-none text-center select-none",
              activeTab === 'analytics'
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-md scale-[1.02]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] bg-transparent"
            )}
          >
            Analytics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('intelligence')}
            className={cn(
              "py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-0 outline-none text-center select-none",
              activeTab === 'intelligence'
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-md scale-[1.02]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] bg-transparent"
            )}
          >
            System Intelligence
          </button>
        </div>
      </div>

      {/* ── TAB 1: ANALYTICS CHARTS ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 sm:space-y-8 -mx-2.5 sm:mx-0 animate-[fade-up_0.3s_ease-out_both]">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <IncomeVsCostChart data={dailyTrends} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <DailyPerformanceChart data={dailyTrends} />
            <MonthlyProfitBarChart data={dailyTrends} />
          </div>

          {/* Month-to-Month Comparative Analytics Graph */}
          <MonthComparisonChart />
        </div>
      )}

      {/* ── TAB 2: SYSTEM INTELLIGENCE PANEL ── */}
      {activeTab === 'intelligence' && (
        <div className="animate-[fade-up_0.3s_ease-out_both] -mx-1.5 sm:mx-0">
          <SystemIntelligenceCards insights={insights} />
        </div>
      )}
    </div>
  );
}
