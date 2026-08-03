import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useKpiData } from '@/utils/useKpiData';

export function LineDetailsContent({ id, month, backUrl, isEmbed = false }) {
  const { dailyTrends, lines, rawEngine, loading, error } = useKpiData(month);

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

  // Get raw daily production for this line
  const lineData = rawEngine.kpiData.dailyProduction.filter(d => d.line_id.toLowerCase() === id.toLowerCase());

  if (!lineData || lineData.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl text-[var(--color-text-main)]">Line data not found for ID: {id}</h1>
        <Link href={backUrl} className="text-[var(--color-primary)] mt-4 inline-block hover:underline">Go Back</Link>
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

  // Extract date range and style
  const firstDateStr = lineData[0]?.date || '';
  const lastDateStr = lineData[lineData.length - 1]?.date || '';
  
  let dateRange = 'N/A';
  if (firstDateStr && lastDateStr) {
    const startParts = firstDateStr.split('-');
    const endParts = lastDateStr.split('-');
    if (startParts[1] === endParts[1] && startParts[0] === endParts[0]) {
      const monthNames = [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      dateRange = `${startParts[2]} - ${endParts[2]} ${monthNames[parseInt(startParts[1])]}, ${startParts[0]}`;
    } else {
      dateRange = `${firstDateStr} to ${lastDateStr}`;
    }
  }
  
  const itemName = activeRows.find(r => r.item)?.item || 'N/A';

  return (
    <div className={`space-y-6 animate-[fade-up_0.4s_ease-out_both] ${isEmbed ? '' : 'p-2 md:p-0'}`} id={`line-${id}`}>
      
      {!isEmbed && (
        <header className="flex items-center gap-5 mb-8 relative z-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          <Link 
            href={backUrl} 
            className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-main)] transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold md:font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
              Line {id.toUpperCase()} Telemetry
            </h1>
            <p className="text-[var(--color-primary)] font-medium tracking-widest uppercase text-xs mt-1">Detailed breakdown synced from source records.</p>
          </div>
        </header>
      )}

      {isEmbed && (
        <div className="flex items-center gap-3 mb-6 mt-12 pt-12 border-t border-[var(--color-border)]">
          <div className="h-6 w-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)]"></div>
          <h2 className="text-3xl font-bold tracking-widest uppercase text-[var(--color-text-main)]">Line {id.toUpperCase()} Telemetry Details</h2>
        </div>
      )}

      {/* Beautiful Summary Card */}
      <div className="relative bg-[var(--color-bg-card)]/40 backdrop-blur-3xl p-5 md:p-8 rounded-3xl border border-[var(--color-border)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
        <h3 className="text-xs md:text-sm font-semibold md:font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-6 flex items-center gap-2">
          Operations Summary <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] animate-pulse"></span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-5 relative z-10">
          <div className="bg-[var(--color-surface)] p-4 lg:p-5 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Date Range</p>
            <p className="text-sm md:text-lg font-semibold md:font-bold text-[var(--color-text-main)] leading-tight">{dateRange}</p>
          </div>
          <div className="bg-[var(--color-surface)] p-4 lg:p-5 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Item</p>
            <p className="text-sm md:text-lg font-semibold md:font-bold text-[var(--color-primary)] leading-tight">{itemName}</p>
          </div>
          <div className="bg-[var(--color-surface)] p-4 lg:p-5 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Production</p>
            <p className="text-lg md:text-2xl font-semibold md:font-bold text-[var(--color-text-main)] leading-tight">{Math.round(parseFloat(totalProduction)).toLocaleString()}</p>
          </div>
          <div className="bg-[var(--color-surface)] p-4 lg:p-5 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Total Cost</p>
            <p className="text-lg md:text-2xl font-semibold md:font-bold text-amber-500 leading-tight">{Math.round(parseFloat(totalCost)).toLocaleString()}</p>
          </div>
          <div className="bg-[var(--color-surface)] p-4 lg:p-5 rounded-2xl border border-[var(--color-border)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Total Income</p>
            <p className="text-lg md:text-2xl font-semibold md:font-bold text-[var(--color-text-main)] leading-tight">{Math.round(parseFloat(totalIncome)).toLocaleString()}</p>
          </div>
          <div className={`bg-[var(--color-surface)] p-4 lg:p-5 rounded-2xl border shadow-inner transition-transform hover:-translate-y-1 duration-300 ${parseFloat(totalNetProfitLoss) >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-gradient-to-b from-[rgba(16,185,129,0.05)] to-transparent' : 'border-[rgba(255,59,48,0.15)] bg-gradient-to-b from-[rgba(255,59,48,0.05)] to-transparent'}`}>
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">
              {parseFloat(totalNetProfitLoss) >= 0 ? 'Net Profit' : 'Net Loss'}
            </p>
            <p className={`text-lg md:text-2xl font-semibold md:font-bold leading-tight [filter:var(--shadow-text)] ${parseFloat(totalNetProfitLoss) >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
              {Math.round(parseFloat(totalNetProfitLoss)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Dark-Themed Table */}
      <div className="w-full max-h-[70vh] overflow-auto bg-[var(--color-bg-card)]/60 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[var(--color-border)] hide-scrollbar relative">
        <table className="w-full text-sm text-left border-collapse table-auto relative">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[var(--color-bg-card)]/95 backdrop-blur-xl shadow-lg border-b border-[var(--color-border)]">
              {['Date', 'Line', 'Style', 'Item', 'Workers', 'Per Head Cost', 'Total Cost', 'Prod Qty', 'Prod DZN', 'CM/DZN', 'Total Income', 'Net Profit'].map((headerText, colIndex) => {
                const isNumericCol = colIndex > 3;
                const isTightCol = colIndex <= 3;
                return (
                  <th 
                    key={colIndex} 
                    className={`
                      px-5 py-4 text-[10px] md:text-[11px] uppercase tracking-widest font-semibold md:font-bold text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-primary)] to-indigo-300 leading-tight drop-shadow-sm
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
                          px-5 py-3.5 text-[var(--color-text-main)] font-light
                          ${isTightCol ? 'w-[1%] whitespace-nowrap' : 'whitespace-nowrap md:whitespace-normal break-words'}
                          ${isNumber ? "text-center font-mono tracking-wide" : ""}
                          ${isNegative ? "!text-red-400 font-medium" : ""} 
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
            <tr className="bg-[var(--color-surface)] backdrop-blur-md">
              <td colSpan={6} className="px-5 py-3.5 text-right font-bold text-[var(--color-text-main)] text-[16px] tracking-wide">TOTAL</td>
              <td className="px-5 py-3.5 text-center font-mono font-bold text-amber-500 text-[16px] tracking-wide">{Math.round(totalCost).toLocaleString()}</td>
              <td className="px-5 py-3.5 text-center font-mono font-bold text-[var(--color-text-main)] text-[16px] tracking-wide">{Math.round(totalProduction).toLocaleString()}</td>
              <td colSpan={2}></td>
              <td className="px-5 py-3.5 text-center font-mono font-bold text-[var(--color-text-main)] text-[16px] tracking-wide">{Math.round(totalIncome).toLocaleString()}</td>
              <td className={`px-5 py-3.5 text-center font-mono font-bold text-[16px] tracking-wide ${totalNetProfitLoss >= 0 ? "text-[var(--color-success-text)] bg-[var(--color-success-glow)] [box-shadow:inset_0_0_10px_var(--color-success-glow)]" : "text-[var(--color-danger-text)] bg-[var(--color-danger-glow)] [box-shadow:inset_0_0_10px_var(--color-danger-glow)]"}`}>
                {Math.round(totalNetProfitLoss).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
