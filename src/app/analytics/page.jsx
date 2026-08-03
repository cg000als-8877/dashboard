"use client";

import { useKpiData } from '@/utils/useKpiData';
import { DailyPerformanceChart, IncomeVsCostChart, MonthlyProfitBarChart } from '@/components/dashboard/DashboardCharts';
import { Card } from '@/components/ui/Card';

export default function Analytics() {
  const { dailyTrends, loading, error } = useKpiData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-text-main)]"></div>
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
          Analytics
        </h1>
        <p className="text-[var(--color-primary)] font-medium tracking-widest uppercase text-xs mt-2">Deep dive into financial and production metrics.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <IncomeVsCostChart data={dailyTrends} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyPerformanceChart data={dailyTrends} />
        <MonthlyProfitBarChart data={dailyTrends} />
      </div>
      
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
        <h3 className="text-xs md:text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-6 border-b border-[var(--color-border)] pb-3">Production Metrics Breakdown</h3>
        <p className="text-sm font-light text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
          Detailed telemetry, CM Distribution, and active worker distributions will be visualized in this module utilizing advanced 3D or pie-chart rendering engines.
        </p>
      </Card>
    </div>
  );
}
