"use client";

import { useKpiData } from '@/utils/useKpiData';
import { DailyPerformanceChart, IncomeVsCostChart, MonthlyProfitBarChart } from '@/components/dashboard/DashboardCharts';
import { MonthComparisonChart } from '@/components/dashboard/MonthComparisonChart';
import { AnalyticsSkeleton } from '@/components/ui/Skeletons';

export default function Analytics() {
  const { dailyTrends, loading, error } = useKpiData();

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      <header className="flex flex-col items-center text-center md:items-start md:text-left mb-6 md:mb-8 relative z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-[24px] sm:text-[30px] md:text-[38px] font-black tracking-normal leading-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
          Analytics
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-muted)] font-normal tracking-normal mt-1 md:mt-2 max-w-2xl">
          Comprehensive trends, cost efficiency breakdowns, and performance analytics.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <IncomeVsCostChart data={dailyTrends} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyPerformanceChart data={dailyTrends} />
        <MonthlyProfitBarChart data={dailyTrends} />
      </div>

      {/* Month-to-Month Comparative Analytics Graph */}
      <MonthComparisonChart />
    </div>
  );
}
