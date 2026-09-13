"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useKpiData } from '@/utils/useKpiData';
import { useDensity } from '@/components/providers/DensityProvider';
import { DensitySwitcher } from '@/components/ui/DensitySwitcher';

export function LineDetailsContent({ id, month, backUrl, isEmbed = false }) {
  const { dailyTrends, lines, rawEngine, loading, error } = useKpiData(month);
  const { density: globalDensity } = useDensity();
  const [expandedRows, setExpandedRows] = useState({});
  const [density, setDensityState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('telemetry_density');
      if (stored && ['compact', 'normal', 'detailed'].includes(stored)) return stored;
      if (window.innerWidth < 768) return 'compact';
    }
    return 'compact';
  });

  const toggleRow = (idx) => {
    setExpandedRows(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const setDensity = (newDensity) => {
    setDensityState(newDensity);
    try {
      localStorage.setItem('telemetry_density', newDensity);
    } catch (e) {}
  };

  const lineIdStr = String(id || 'A').toLowerCase();
  const safeId = String(id || 'A').toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 p-8">
        <p className="text-[var(--color-danger-text)] font-semibold mb-3">Error loading data: {error}</p>
        <Link href={backUrl || '/lines'} className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]">
          Go Back
        </Link>
      </div>
    );
  }

  // Get raw daily production for this line safely
  const dailyProd = rawEngine?.kpiData?.dailyProduction || [];
  const lineData = dailyProd.filter(d => String(d?.line_id || '').toLowerCase() === lineIdStr);

  if (!lineData || lineData.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Line telemetry not found for Line {safeId}</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">No production records found for the requested line.</p>
        <Link href={backUrl || '/lines'} className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
          Return to Lines
        </Link>
      </div>
    );
  }

  const activeRows = lineData.filter(d => d.status === 'ACTIVE');

  // Filter lineData to only show rows between the first and last active production dates
  let firstActiveIndex = -1;
  let lastActiveIndex = -1;
  lineData.forEach((row, idx) => {
    if (row.status !== 'HOLIDAY') {
      if (firstActiveIndex === -1) firstActiveIndex = idx;
      lastActiveIndex = idx;
    }
  });

  const filteredLineData = firstActiveIndex !== -1 
    ? lineData.slice(firstActiveIndex, lastActiveIndex + 1) 
    : [];
  
  // Calculate totals
  const totalProduction = activeRows.reduce((sum, d) => sum + (d.production_qty || 0), 0);
  const totalCost = activeRows.reduce((sum, d) => sum + (d.total_cost || 0), 0);
  const totalIncome = activeRows.reduce((sum, d) => sum + (d.total_income || 0), 0);
  const totalNetProfitLoss = activeRows.reduce((sum, d) => sum + (d.net_profit || 0), 0);

  // Extract date range from first to last active updated day
  const firstDateStr = (firstActiveIndex !== -1 ? lineData[firstActiveIndex]?.date : lineData[0]?.date) || '';
  const lastDateStr = (lastActiveIndex !== -1 ? lineData[lastActiveIndex]?.date : lineData[lineData.length - 1]?.date) || '';
  
  let dateRange = 'N/A';
  if (firstDateStr && lastDateStr) {
    const startParts = firstDateStr.split('-');
    const endParts = lastDateStr.split('-');
    if (startParts[1] === endParts[1] && startParts[0] === endParts[0]) {
      const monthNames = [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      dateRange = `${startParts[2]} - ${endParts[2]} ${monthNames[parseInt(startParts[1])]}, ${startParts[0]}`;
    } else {
      dateRange = `${firstDateStr} to ${lastDateStr}`;
    }
  }
  
  const uniqueItems = Array.from(new Set(
    activeRows
      .filter(r => r.item && typeof r.item === 'string' && r.item.trim() !== '')
      .flatMap(r => r.item.split(/[,/&]+/).map(s => s.trim()).filter(Boolean))
  ));
  const itemName = uniqueItems.length > 0
    ? uniqueItems.join(', ')
    : (activeRows.find(r => r.item)?.item || (
        lineIdStr === 'a' ? 'Flannel Shirt' :
        lineIdStr === 'b' ? 'Ladies Top' :
        lineIdStr === 'c' ? 'Ladies Bottom' :
        lineIdStr === 'd' ? "Men's Tshirt" : 'N/A'
      ));

  const summaryPadding = density === 'compact' ? 'p-3 md:p-4' : density === 'detailed' ? 'p-6 md:p-8' : 'p-4 md:p-6';
  const summaryGap = density === 'compact' ? 'gap-2 md:gap-3' : density === 'detailed' ? 'gap-2 md:gap-4' : 'gap-2 md:gap-3';
  const summaryCellPadding = density === 'compact' ? 'p-2 md:p-2.5' : density === 'detailed' ? 'p-3 md:p-4' : 'p-2.5 md:p-3';
  const summaryValSize = density === 'compact' ? 'text-xs md:text-sm' : density === 'detailed' ? 'text-base md:text-xl' : 'text-sm md:text-base';
  const tableThPadding = density === 'compact' ? 'px-2.5 py-1.5 text-[9px]' : density === 'detailed' ? 'px-4 py-3 text-xs' : 'px-3 py-2 text-[10px]';
  const tableTdPadding = density === 'compact' ? 'px-2.5 py-1.5 text-xs' : density === 'detailed' ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-xs';
  const tableTotalPadding = density === 'compact' ? 'px-2.5 py-2 text-xs' : density === 'detailed' ? 'px-4 py-3.5 text-sm' : 'px-3 py-2.5 text-xs';

  return (
    <div 
      className={`space-y-4 md:space-y-6 animate-[fade-up_0.4s_ease-out_both] ${isEmbed ? '' : 'p-2 md:p-0'}`} 
      id={`line-${safeId}`}
    >
      
      {!isEmbed && (
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-8 relative z-10">
          <div className="flex flex-col gap-1.5 md:gap-2">
            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Dashboard</Link>
              <ChevronRight size={12} className="opacity-60" />
              <Link href={backUrl || '/lines'} className="hover:text-[var(--color-primary)] transition-colors">Lines</Link>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-[var(--color-primary)] font-bold">Line {safeId}</span>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-[var(--color-text-main)] font-bold">Telemetry</span>
            </nav>

            <div className="flex items-center justify-between gap-2 mt-0.5 md:mt-1">
              <div className="flex items-center gap-2.5 md:gap-5">
                <Link 
                  href={backUrl || '/lines'} 
                  className="p-1.5 md:p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-main)] transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </Link>
                <div>
                  <h1 className="text-base md:text-3xl font-semibold md:font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)] leading-tight">
                    Line {safeId} Telemetry
                  </h1>
                  <p className="hidden md:block text-[var(--color-primary)] font-normal text-xs mt-0.5 tracking-normal">
                    Detailed breakdown synced from source records.
                  </p>
                </div>
              </div>

              {/* Density Switcher on Mobile (Right-Aligned in Header) */}
              <div className="md:hidden flex items-center shrink-0">
                <DensitySwitcher value={density} onChange={setDensity} />
              </div>
            </div>
          </div>

          {/* Density Switcher on Desktop */}
          <div className="hidden md:flex items-center gap-2 self-start md:self-auto">
            <DensitySwitcher value={density} onChange={setDensity} />
          </div>
        </header>
      )}

      {isEmbed && (
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-6 mt-6 md:mt-12 pt-6 md:pt-12 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-4 md:h-6 w-1.5 md:w-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)]"></div>
            <h2 className="text-base md:text-3xl font-bold tracking-widest uppercase text-[var(--color-text-main)]">Line {id.toUpperCase()} Telemetry Details</h2>
          </div>
          <DensitySwitcher value={density} onChange={setDensity} />
        </div>
      )}

      {/* Summary Section - Bento Grid on Mobile & 6-Col Grid on Desktop */}
      <div className="mb-4 md:mb-8">
        <div className="hidden md:flex items-center justify-between mb-4 px-0.5">
          <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
            Operations Summary
          </h3>
        </div>

        {/* Mobile Centered Date Range */}
        <div className="md:hidden flex justify-center items-center mb-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">Period</span>
            <span className="text-[10.5px] font-bold text-[var(--color-text-main)] tracking-wide">{dateRange}</span>
          </div>
        </div>
        
        {/* Outer container: transparent on mobile, card on desktop */}
        <div className={`relative bg-transparent md:bg-[var(--color-bg-card)] md:${summaryPadding} md:rounded-3xl md:border md:border-[var(--color-border)] md:shadow-sm overflow-hidden`}>
          <div className={`grid grid-cols-2 md:grid-cols-6 ${summaryGap} relative z-10`}>
            
            {/* 1. Date Range (Desktop Only - Mobile is centered above) */}
            <div className={`hidden md:block col-span-1 bg-[var(--color-surface)] ${summaryCellPadding} rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-0.5 duration-200`}>
              <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Date Range</p>
              <p className="text-base font-bold text-[var(--color-text-main)] leading-tight">{dateRange}</p>
            </div>

            {/* 2. Item (Bento Hero Tile on Mobile: spans 2 columns) */}
            <div className={`col-span-2 md:col-span-1 bg-[var(--color-bg-card)] md:bg-[var(--color-surface)] ${summaryCellPadding} rounded-xl md:rounded-2xl border border-[var(--color-border)] shadow-sm md:shadow-inner transition-transform hover:-translate-y-0.5 duration-200 flex items-center justify-between md:block`}>
              <div>
                <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-0.5 md:mb-1">Item</p>
                <p className="text-xs md:text-base font-semibold md:font-bold text-[var(--color-primary)] leading-tight truncate">{itemName}</p>
              </div>
              <span className="md:hidden text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                Line {safeId}
              </span>
            </div>

            {/* 3. Production */}
            <div className={`col-span-1 bg-[var(--color-bg-card)] md:bg-[var(--color-surface)] ${summaryCellPadding} rounded-xl md:rounded-2xl border border-[var(--color-border)] shadow-sm md:shadow-inner transition-transform hover:-translate-y-0.5 duration-200`}>
              <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-0.5 md:mb-1">Production</p>
              <p className={`${summaryValSize} font-semibold md:font-bold text-[var(--color-text-main)] leading-tight`}>{Math.round(parseFloat(totalProduction)).toLocaleString()}</p>
            </div>

            {/* 4. Total Cost */}
            <div className={`col-span-1 bg-[var(--color-bg-card)] md:bg-[var(--color-surface)] ${summaryCellPadding} rounded-xl md:rounded-2xl border border-[var(--color-border)] shadow-sm md:shadow-inner transition-transform hover:-translate-y-0.5 duration-200`}>
              <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-0.5 md:mb-1">Total Cost</p>
              <p className={`${summaryValSize} font-semibold md:font-bold text-[var(--color-text-main)] leading-tight`}>{Math.round(parseFloat(totalCost)).toLocaleString()}</p>
            </div>

            {/* 5. Total Income */}
            <div className={`col-span-1 bg-[var(--color-bg-card)] md:bg-[var(--color-surface)] ${summaryCellPadding} rounded-xl md:rounded-2xl border border-[var(--color-border)] shadow-sm md:shadow-inner transition-transform hover:-translate-y-0.5 duration-200`}>
              <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-0.5 md:mb-1">Total Income</p>
              <p className={`${summaryValSize} font-semibold md:font-bold text-[var(--color-primary)] leading-tight`}>{Math.round(parseFloat(totalIncome)).toLocaleString()}</p>
            </div>

            {/* 6. Net Profit / Loss */}
            <div className={`col-span-1 bg-[var(--color-bg-card)] md:bg-[var(--color-surface)] ${summaryCellPadding} rounded-xl md:rounded-2xl border shadow-sm md:shadow-inner transition-transform hover:-translate-y-0.5 duration-200 ${parseFloat(totalNetProfitLoss) >= 0 ? 'border-[rgba(16,185,129,0.25)] md:border-[rgba(16,185,129,0.15)] bg-gradient-to-b from-[rgba(16,185,129,0.08)] to-transparent' : 'border-[rgba(255,59,48,0.25)] md:border-[rgba(255,59,48,0.15)] bg-gradient-to-b from-[rgba(255,59,48,0.08)] to-transparent'}`}>
              <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-0.5 md:mb-1">
                {parseFloat(totalNetProfitLoss) >= 0 ? 'Net Profit' : 'Net Loss'}
              </p>
              <p className={`${summaryValSize} font-semibold md:font-bold leading-tight [filter:var(--shadow-text)] ${parseFloat(totalNetProfitLoss) >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                {Math.round(parseFloat(totalNetProfitLoss)).toLocaleString()}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEW: Card-Based Responsive Breakdown (< 768px)                   */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-2">
        <div className="flex items-center justify-between px-0.5 mb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Daily Production Logs ({filteredLineData.length} Days)
          </p>
          <span className="text-[9px] text-[var(--color-text-muted)]">Tap to expand details</span>
        </div>

        {filteredLineData.map((row, rowIndex) => {
          if (row.status === 'HOLIDAY') {
            const dateObj = new Date(row.date);
            const isFriday = dateObj.getDay() === 5;
            return (
              <div 
                key={rowIndex} 
                className="px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/60 text-center select-none"
              >
                <p className="text-[9.5px] font-medium tracking-widest uppercase text-[var(--color-text-muted)]">
                  {row.date} • {isFriday ? 'FRIDAY / HOLIDAY' : 'NO PRODUCTION / HOLIDAY'}
                </p>
              </div>
            );
          }

          const isExpanded = !!expandedRows[rowIndex];
          const netProfit = row.net_profit || 0;
          const isProfit = netProfit >= 0;

          return (
            <div 
              key={rowIndex} 
              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-2.5 shadow-sm transition-all duration-200"
            >
              {/* Card Header: Date, Item/Style & Net Profit Badge */}
              <div 
                onClick={() => toggleRow(rowIndex)}
                className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]/50 cursor-pointer select-none active:opacity-80"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[9px] font-bold uppercase tracking-wider text-[var(--color-primary)] whitespace-nowrap">
                    {row.date}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--color-text-main)] truncate">
                    {row.style || row.item || `Line ${safeId}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold font-mono tracking-tight ${
                    isProfit 
                      ? 'bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.2)]' 
                      : 'bg-[var(--color-danger-glow)] text-[var(--color-danger-text)] border border-[rgba(255,59,48,0.2)]'
                  }`}>
                    {isProfit ? '+' : ''}{Math.round(netProfit).toLocaleString()}
                  </span>
                  <div className="text-[var(--color-text-muted)]">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              {/* Primary Key Metrics Grid (Always Visible) */}
              <div 
                onClick={() => toggleRow(rowIndex)}
                className="grid grid-cols-3 gap-1.5 pt-2 cursor-pointer active:opacity-90 select-none"
              >
                <div className="bg-[var(--color-surface)]/70 rounded-lg p-1.5 border border-[var(--color-border)]/40">
                  <p className="text-[8.5px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">Production</p>
                  <p className="text-[11px] font-bold font-mono text-[var(--color-text-main)] mt-0.5 leading-tight">
                    {Math.round(row.production_qty || 0).toLocaleString()} <span className="text-[8px] font-normal text-[var(--color-text-muted)]">pcs</span>
                  </p>
                </div>

                <div className="bg-[var(--color-surface)]/70 rounded-lg p-1.5 border border-[var(--color-border)]/40">
                  <p className="text-[8.5px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">Total Cost</p>
                  <p className="text-[11px] font-bold font-mono text-[var(--color-text-main)] mt-0.5 leading-tight">
                    {Math.round(row.total_cost || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-[var(--color-surface)]/70 rounded-lg p-1.5 border border-[var(--color-border)]/40">
                  <p className="text-[8.5px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">Total Income</p>
                  <p className="text-[11px] font-bold font-mono text-[var(--color-primary)] mt-0.5 leading-tight">
                    {Math.round(row.total_income || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Collapsible Accordion Drawer */}
              {isExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-[var(--color-border)]/50 space-y-1.5 animate-[fade-up_0.2s_ease-out]">
                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)]/30">
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Workers</span>
                      <span className="font-mono font-bold text-[var(--color-text-main)]">{row.worker_count || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)]/30">
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Per Head</span>
                      <span className="font-mono font-bold text-[var(--color-text-main)]">{row.per_head_cost ? `${Math.round(row.per_head_cost).toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)]/30">
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Prod (DZN)</span>
                      <span className="font-mono font-bold text-[var(--color-text-main)]">{row.production_dzn ? Number(row.production_dzn).toFixed(1) : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)]/30">
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">CM / DZN</span>
                      <span className="font-mono font-bold text-[var(--color-primary)]">{row.cm_per_dzn ? `${Math.round(row.cm_per_dzn).toLocaleString()}` : '-'}</span>
                    </div>
                  </div>

                  {(row.item || row.style) && (
                    <div className="p-1.5 rounded-lg bg-[var(--color-surface)]/50 border border-[var(--color-border)]/30 flex items-center justify-between text-[10px]">
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Item Name</span>
                      <span className="font-semibold text-[var(--color-text-main)] truncate max-w-[200px]">
                        {row.item || row.style}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Mobile Total Card */}
        <div className="mt-3 bg-[var(--color-bg-card)] border border-[var(--color-primary)]/40 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]/60">
            <span className="text-[10.5px] font-black uppercase tracking-widest text-[var(--color-primary)]">Total Cumulative</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
              totalNetProfitLoss >= 0 
                ? 'bg-[var(--color-success-glow)] text-[var(--color-success-text)]' 
                : 'bg-[var(--color-danger-glow)] text-[var(--color-danger-text)]'
            }`}>
              {totalNetProfitLoss >= 0 ? '+' : ''}{Math.round(totalNetProfitLoss).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-2">
            <div>
              <p className="text-[8.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Total Output</p>
              <p className="text-[11px] font-bold font-mono text-[var(--color-text-main)]">{Math.round(totalProduction).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[8.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Total Cost</p>
              <p className="text-[11px] font-bold font-mono text-[var(--color-text-main)]">{Math.round(totalCost).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[8.5px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Total Income</p>
              <p className="text-[11px] font-bold font-mono text-[var(--color-primary)]">{Math.round(totalIncome).toLocaleString()}</p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW: Standard 12-Column Table (>= 768px)                         */}
      {/* ========================================================================= */}
      <div className="hidden md:block w-full max-h-[75vh] overflow-auto bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border)] hide-scrollbar relative">
        <table className="w-full text-left border-collapse table-auto relative">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[var(--color-bg-card)] shadow-sm border-b border-[var(--color-border)]">
              {['Date', 'Line', 'Style', 'Item', 'Workers', 'Per Head Cost', 'Total Cost', 'Prod Qty', 'Prod DZN', 'CM/DZN', 'Total Income', 'Net Profit'].map((headerText, colIndex) => {
                const isNumericCol = colIndex > 3;
                const isTightCol = colIndex <= 3;
                return (
                  <th 
                    key={colIndex} 
                    className={`
                      ${tableThPadding} uppercase tracking-widest font-semibold md:font-bold text-[var(--color-primary)] leading-tight
                      ${isNumericCol ? 'text-center' : 'text-left'}
                      ${isTightCol ? 'w-[1%] whitespace-nowrap' : 'whitespace-nowrap md:whitespace-normal break-words'}
                    `}
                  >
                    {headerText}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filteredLineData.map((row, rowIndex) => {
              if (row.status === 'HOLIDAY') {
                const dateObj = new Date(row.date);
                const isFriday = dateObj.getDay() === 5;
                return (
                  <tr key={rowIndex} className="h-8 bg-[var(--color-surface)]">
                    <td colSpan={12} className="px-5 py-2 text-center text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] font-medium">
                      {row.date} - {isFriday ? 'FRIDAY / HOLIDAY' : 'NO PRODUCTION / HOLIDAY'}
                    </td>
                  </tr>
                );
              }

              const cells = [
                row.date, row.line_id, row.style, row.item,
                row.worker_count, row.per_head_cost, row.total_cost,
                row.production_qty, row.production_dzn, row.cm_per_dzn,
                row.total_income, row.net_profit
              ];

              return (
                <tr 
                  key={rowIndex} 
                  className={`hover:bg-[var(--color-surface-hover)] transition-colors group`}
                >
                  {cells.map((cell, cellIndex) => {
                    const isNegative = String(cell).startsWith('-');
                    const isNumber = typeof cell === 'number';
                    const isDate = cellIndex === 0;
                    const isTightCol = cellIndex <= 3;
                    
                    return (
                      <td 
                        key={cellIndex} 
                        className={`
                          ${tableTdPadding} text-[var(--color-text-main)] font-light
                          ${isTightCol ? 'w-[1%] whitespace-nowrap' : 'whitespace-nowrap md:whitespace-normal break-words'}
                          ${isNumber ? "text-center font-mono tracking-wide" : ""}
                          ${isNegative ? "!text-[var(--color-danger-text)] font-medium" : ""} 
                          ${isDate ? "text-[var(--color-primary)] font-medium tracking-widest text-left uppercase text-[10px]" : ""}
                        `}
                      >
                        {isNumber && cellIndex > 3 ? Math.round(cell).toLocaleString() : cell || '-'}
                      </td>
                    );
                  })}
                </tr>
              )
            })}
            
            {/* Total Row */}
            <tr className="bg-[var(--color-surface)] font-bold">
              <td colSpan={6} className={`${tableTotalPadding} text-right text-[var(--color-text-main)] tracking-wide`}>TOTAL</td>
              <td className={`${tableTotalPadding} text-center font-mono text-[var(--color-text-main)] tracking-wide`}>{Math.round(totalCost).toLocaleString()}</td>
              <td className={`${tableTotalPadding} text-center font-mono text-[var(--color-text-main)] tracking-wide`}>{Math.round(totalProduction).toLocaleString()}</td>
              <td colSpan={2}></td>
              <td className={`${tableTotalPadding} text-center font-mono text-[var(--color-text-main)] tracking-wide`}>{Math.round(totalIncome).toLocaleString()}</td>
              <td className={`${tableTotalPadding} text-center font-mono tracking-wide ${totalNetProfitLoss >= 0 ? "text-[var(--color-success-text)] bg-[var(--color-success-glow)] [box-shadow:inset_0_0_10px_var(--color-success-glow)]" : "text-[var(--color-danger-text)] bg-[var(--color-danger-glow)] [box-shadow:inset_0_0_10px_var(--color-danger-glow)]"}`}>
                {Math.round(totalNetProfitLoss).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default LineDetailsContent;
