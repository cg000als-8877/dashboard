"use client";

import React, { useEffect } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import Dashboard from '@/app/page';
import ProductionLines from '@/app/lines/page';
import LineDetailsPage from '@/app/lines/[id]/page';
import { useMonth } from '@/components/providers/MonthProvider';
import { Printer } from 'lucide-react';

export default function ReportPage() {
  const { lines, loading } = useKpiData();
  const { selectedMonth } = useMonth();

  useEffect(() => {
    if (!loading && lines && lines.length > 0) {
      // Auto-print after a short delay to ensure rendering is complete
      const timer = setTimeout(() => {
        window.print();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, lines]);

  // Stabilize the promises passed to LineDetailsPage to prevent infinite suspense loops
  const linePromises = React.useMemo(() => {
    if (!lines) return {};
    const promises = {};
    lines.forEach(line => {
      promises[line.id] = Promise.resolve({ id: line.id });
    });
    return promises;
  }, [lines]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[var(--color-bg-main)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white font-bold tracking-widest uppercase">Generating Report...</p>
      </div>
    );
  }

  const monthLabel = selectedMonth === 'live' ? 'August 2026 (Live)' : 'July 2026 (Archive)';

  return (
    <div className="bg-[var(--color-bg-main)] min-h-screen text-white pb-20">
      
      {/* Print Controls (hidden on print) */}
      <div className="hide-on-print p-6 flex justify-between items-center bg-[rgba(0,0,0,0.5)] border-b border-[rgba(255,255,255,0.05)] sticky top-0 z-50 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-white">Full System Report</h1>
          <p className="text-[var(--color-primary)] text-xs font-bold">{monthLabel}</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(79,140,255,0.4)]"
        >
          <Printer size={18} /> Print PDF Now
        </button>
      </div>

      <div className="report-container p-8 max-w-7xl mx-auto space-y-20">
        
        {/* Section 1: Dashboard */}
        <div className="report-section">
          <div className="print-header hidden text-center mb-10 border-b border-gray-800 pb-4">
            <h1 className="text-3xl font-black text-black">BAPL System Report - {monthLabel}</h1>
            <p className="text-gray-500">Executive Summary</p>
          </div>
          <Dashboard />
        </div>

        {/* Section 2: Lines Overview */}
        <div className="report-section" style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
          <ProductionLines />
        </div>

        {/* Section 3: Individual Line Details */}
        {lines.map(line => (
          <div key={line.id} className="report-section" style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
            <LineDetailsPage params={linePromises[line.id]} />
          </div>
        ))}

      </div>
    </div>
  );
}
