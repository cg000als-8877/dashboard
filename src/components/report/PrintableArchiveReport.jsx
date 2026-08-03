import React, { forwardRef } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard } from '@/components/ui/Card';
import { DailyPerformanceChart, IncomeVsCostChart } from '@/components/dashboard/DashboardCharts';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';

export const PrintableArchiveReport = forwardRef(({ month }, ref) => {
  const { stats, dailyTrends, lines, loading, error } = useKpiData(month);

  if (loading || error || !stats || !lines) {
    return <div ref={ref} className="hidden">Loading PDF data...</div>;
  }

  // Calculate some basic text values
  const startDate = dailyTrends?.length > 0 ? dailyTrends[0].date : null;
  const endDate = dailyTrends?.length > 0 ? dailyTrends[dailyTrends.length - 1].date : null;
  
  return (
    // The wrapper has fixed width (1200px) so charts render predictably for PDF.
    <div 
      ref={ref} 
      className="bg-[#050A15] text-white p-10" 
      style={{ width: '1200px', minHeight: '1697px', position: 'absolute', top: '-9999px', left: '-9999px', fontFamily: "'Inter', sans-serif" }}
    >
      
      {/* ---------------- SECTION 1: SYSTEM OVERVIEW ---------------- */}
      <div className="mb-12">
        <div className="flex justify-between items-end border-b border-[rgba(255,255,255,0.1)] pb-6 mb-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              {month.toUpperCase()} ARCHIVE
            </h1>
            <p className="text-[var(--color-primary)] font-bold tracking-widest uppercase mt-2">
              Byzid Apparels Pvt. Ltd. Official Report
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{startDate} to {endDate}</p>
          </div>
        </div>

        <h2 className="text-2xl font-black mb-6 uppercase tracking-widest">System Overview</h2>
        <div className="grid grid-cols-3 gap-6 mb-12">
          <MetricCard title="Total Cost" value={`BDT ${Math.round(stats.totalCost).toLocaleString()}`} color="warning" />
          <MetricCard title="Total Income" value={`BDT ${Math.round(stats.totalIncome).toLocaleString()}`} color="primary" />
          <MetricCard title={stats.netProfit >= 0 ? "Net Profit" : "Net Loss"} value={`${stats.netProfit > 0 ? '+BDT ' : 'BDT '}${Math.round(stats.netProfit).toLocaleString()}`} color={stats.netProfit >= 0 ? 'success' : 'danger'} />
          <MetricCard title="Working Days" value={`${stats.workingDays} Days`} />
          <MetricCard title="Production Lines" value={`${stats.activeLinesCount} Active`} />
          <MetricCard title={stats.averageDailyProfit >= 0 ? "Avg Daily Profit" : "Avg Daily Loss"} value={`${stats.averageDailyProfit > 0 ? '+' : ''}${Math.round(stats.averageDailyProfit).toLocaleString()} / day`} color={stats.averageDailyProfit >= 0 ? 'success' : 'danger'} />
        </div>

        {/* ---------------- SECTION 2: TELEMETRY CHARTS ---------------- */}
        <div className="page-break-after" style={{ pageBreakAfter: 'always', marginBottom: '100px' }}>
          <h2 className="text-xl font-black mb-6 uppercase tracking-widest border-b border-[rgba(255,255,255,0.1)] pb-2">Performance Telemetry</h2>
          <div className="flex flex-col gap-10">
            {/* Set fixed height for charts to render perfectly off-screen */}
            <div style={{ height: '400px' }}>
              <DailyPerformanceChart data={dailyTrends} />
            </div>
            <div style={{ height: '400px' }}>
              <IncomeVsCostChart data={dailyTrends} />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 3: LINE DETAILS ---------------- */}
      {lines.sort((a,b) => a.id.localeCompare(b.id)).map((line, index) => (
        <div 
          key={line.id} 
          className="html2pdf__page-break" 
          style={{ pageBreakBefore: 'always', paddingTop: '40px', paddingBottom: '40px' }}
        >
          {/* We reuse LineDetailsContent with isEmbed=true so it hides the back button and uses embedded styling */}
          <LineDetailsContent id={line.id} month={month} isEmbed={true} />
        </div>
      ))}

    </div>
  );
});

PrintableArchiveReport.displayName = 'PrintableArchiveReport';
