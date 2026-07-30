import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import * as XLSX from 'xlsx';

export default async function LineDetailsPage({ params }) {
  const { id } = await params; // 'a', 'b', 'c', or 'd'
  
  // Fetch live data directly from Google Sheets
  const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
  let sheetData = null;
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      // Find the matching sheet name (handle both "LINE-A" and "LINE A")
      const targetSheetName = workbook.SheetNames.find(s => {
        const normalized = s.trim().toLowerCase().replace(/\s+/g, '-');
        return normalized === `line-${id.toLowerCase()}`;
      });
      
      if (targetSheetName) {
        const sheet = workbook.Sheets[targetSheetName];
        sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      }
    }
  } catch (error) {
    console.error("Could not load excel data", error);
  }

  if (!sheetData || sheetData.length < 4) {
    return (
      <div className="p-8">
        <h1 className="text-2xl text-white">Line data not found for ID: {id}</h1>
        <Link href="/" className="text-[var(--color-primary)] mt-4 inline-block hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const headerRow = sheetData[3];
  const dataRows = sheetData.slice(4);

  // Find max columns to ensure all rows have same number of td
  const maxCols = Math.max(...sheetData.map(r => r.length), headerRow.length);

  // Find the last row with actual data to treat as the TOTAL row
  const lastNonEmptyRowIndex = dataRows.findLastIndex(row => !row.every(cell => cell === undefined || cell === ''));
  const totalRow = dataRows[lastNonEmptyRowIndex] || [];
  
  // Truncate the dataRows to remove trailing blank rows
  const cleanDataRows = lastNonEmptyRowIndex !== -1 ? dataRows.slice(0, lastNonEmptyRowIndex + 1) : dataRows;
  
  // Columns: DATE(0), LINE(1), STYLE(2), ITEM(3), ManPower(4), PerHeadCost(5), TotalCost(6), Prod(7), ProdCostDzn(8), CMCostDzn(9), TotalIncome(10), LossProfit(11)
  const totalProduction = totalRow[7] || 0;
  const totalCost = totalRow[6] || 0;
  const totalIncome = totalRow[10] || 0;
  const totalNetProfitLoss = totalRow[11] || 0;

  // Extract date range and style dynamically from the data rows (excluding the total row itself)
  const dataOnlyRows = cleanDataRows.slice(0, -1);
  
  // Find rows that actually have data (e.g. Total Cost or Production values)
  const validDataRows = dataOnlyRows.filter(r => (r[6] && r[6] !== '') || (r[7] && r[7] !== ''));
  
  const parseExcelDate = (val) => {
    if (typeof val === 'number') {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${d.d}-${monthNames[d.m - 1]}-${String(d.y).slice(-2)}`;
      }
    }
    return val;
  };
  
  const allDates = validDataRows.map(r => parseExcelDate(r[0])).filter(d => d && String(d).trim() !== '');
  const firstDateStr = allDates[0] || '';
  const lastDateStr = allDates[allDates.length - 1] || '';
  
  let dateRange = 'N/A';
  if (firstDateStr && lastDateStr) {
    const startParts = String(firstDateStr).split('-');
    const endParts = String(lastDateStr).split('-');
    
    if (startParts.length === 3 && endParts.length === 3 && startParts[1] === endParts[1] && startParts[2] === endParts[2]) {
      const monthNames = { 'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April', 'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August', 'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December' };
      const month = monthNames[startParts[1]] || startParts[1];
      const year = '20' + startParts[2];
      dateRange = `${startParts[0]} - ${endParts[0]} ${month}, ${year}`;
    } else {
      dateRange = `${firstDateStr} to ${lastDateStr}`;
    }
  }
  
  const itemName = validDataRows.find(r => r[3] && String(r[3]).trim() !== '')?.[3] || 'N/A';

  return (
    <div className="space-y-6 animate-[fade-up_0.4s_ease-out_both] p-2 md:p-0">
      <header className="flex items-center gap-5 mb-8 relative z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <Link 
          href="/lines" 
          className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Line {id.toUpperCase()} Telemetry
          </h1>
          <p className="text-[var(--color-primary)] font-bold tracking-widest uppercase text-xs mt-1">Detailed breakdown synced from source records.</p>
        </div>
      </header>

      {/* Beautiful Summary Card */}
      <div className="relative bg-[rgba(10,13,20,0.4)] backdrop-blur-3xl p-5 md:p-8 rounded-3xl border border-[rgba(255,255,255,0.05)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
        <h3 className="text-xs md:text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          Operations Summary <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] animate-pulse"></span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-5 relative z-10">
          <div className="bg-[rgba(0,0,0,0.2)] p-4 lg:p-5 rounded-2xl border border-[rgba(255,255,255,0.03)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Date Range</p>
            <p className="text-sm md:text-lg font-black text-gray-200 leading-tight">{dateRange}</p>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-4 lg:p-5 rounded-2xl border border-[rgba(255,255,255,0.03)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Item</p>
            <p className="text-sm md:text-lg font-black text-[var(--color-primary)] leading-tight">{itemName}</p>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-4 lg:p-5 rounded-2xl border border-[rgba(255,255,255,0.03)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Production</p>
            <p className="text-lg md:text-2xl font-black text-white leading-tight">{Math.round(parseFloat(totalProduction)).toLocaleString()}</p>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-4 lg:p-5 rounded-2xl border border-[rgba(255,255,255,0.03)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Cost</p>
            <p className="text-lg md:text-2xl font-black text-amber-500 leading-tight">{Math.round(parseFloat(totalCost)).toLocaleString()}</p>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-4 lg:p-5 rounded-2xl border border-[rgba(255,255,255,0.03)] shadow-inner transition-transform hover:-translate-y-1 duration-300">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Income</p>
            <p className="text-lg md:text-2xl font-black text-white leading-tight">{Math.round(parseFloat(totalIncome)).toLocaleString()}</p>
          </div>
          <div className={`bg-[rgba(0,0,0,0.2)] p-4 lg:p-5 rounded-2xl border shadow-inner transition-transform hover:-translate-y-1 duration-300 ${parseFloat(totalNetProfitLoss) >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-gradient-to-b from-[rgba(16,185,129,0.05)] to-transparent' : 'border-[rgba(255,59,48,0.15)] bg-gradient-to-b from-[rgba(255,59,48,0.05)] to-transparent'}`}>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
              {parseFloat(totalNetProfitLoss) >= 0 ? 'Net Profit' : 'Net Loss'}
            </p>
            <p className={`text-lg md:text-2xl font-black leading-tight drop-shadow-md ${parseFloat(totalNetProfitLoss) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {Math.round(parseFloat(totalNetProfitLoss)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Dark-Themed Table */}
      {/* Modern Dark-Themed Table */}
      <div className="w-full max-h-[70vh] overflow-auto bg-[rgba(10,13,20,0.6)] backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.05)] hide-scrollbar relative">
        <table className="w-full text-sm text-left border-collapse table-auto relative">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[rgba(20,25,35,0.95)] backdrop-blur-xl shadow-lg border-b border-[rgba(255,255,255,0.1)]">
              {Array.from({ length: maxCols }).map((_, colIndex) => {
                let headerText = headerRow[colIndex] || '';
                headerText = headerText.replace('(CM = Cut & Make)', '').trim();
                
                const isNumericCol = colIndex > 3;
                const isTightCol = colIndex <= 3; // DATE, LINE, STYLE, ITEM
                return (
                  <th 
                    key={colIndex} 
                    className={`
                      px-5 py-4 text-[10px] md:text-[11px] uppercase tracking-widest font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-primary)] to-indigo-300 leading-tight drop-shadow-sm
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
          <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
            {cleanDataRows.map((row, rowIndex) => {
              // Check if the entire row is empty (spacing row from excel)
              const isEmptyRow = row.every(cell => cell === undefined || cell === '');
              
              if (isEmptyRow) {
                return (
                  <tr key={rowIndex} className="h-8 bg-[rgba(0,0,0,0.1)]">
                    <td colSpan={maxCols}></td>
                  </tr>
                );
              }

              const isTotalRow = rowIndex === lastNonEmptyRowIndex;

              return (
                <tr 
                  key={rowIndex} 
                  className={`hover:bg-[rgba(255,255,255,0.03)] transition-colors group ${isTotalRow ? 'bg-[rgba(255,255,255,0.05)] backdrop-blur-md' : ''}`}
                >
                  {Array.from({ length: maxCols }).map((_, cellIndex) => {
                    let cell = row[cellIndex] !== undefined ? row[cellIndex] : '';
                    
                    // Format Excel Date serial (cellIndex 0)
                    if (cellIndex === 0 && !isTotalRow && typeof cell === 'number') {
                      const d = XLSX.SSF.parse_date_code(cell);
                      if (d) {
                        cell = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
                      }
                    }

                    // Logic to make values pop
                    const isNegative = String(cell).startsWith('-') && !String(cell).includes('Jul');
                    const isNumber = !isNaN(cell) && cell !== '';
                    const isDate = String(cell).includes('-'); // Simple heuristic for our parsed dates

                    const isTightCol = cellIndex <= 3; // DATE, LINE, STYLE, ITEM

                    const isTotalLossCol = isTotalRow && cellIndex === maxCols - 1;

                    return (
                      <td 
                        key={cellIndex} 
                        className={`
                          px-5 py-3.5 text-gray-300 font-medium
                          ${isTightCol ? 'w-[1%] whitespace-nowrap' : 'whitespace-nowrap md:whitespace-normal break-words'}
                          ${isNumber ? "text-center font-mono tracking-wide" : ""}
                          ${isNegative ? "!text-red-400 font-bold" : ""} 
                          ${isDate && !isNegative && !isTotalRow ? "text-[var(--color-primary)] font-bold tracking-widest text-left uppercase text-[10px]" : ""}
                          ${isTotalRow ? "font-sans font-black text-white text-[16px] tracking-wide" : ""}
                          ${isTotalLossCol && String(cell).startsWith('-') ? "text-red-400 bg-[rgba(255,0,0,0.1)] shadow-[inset_0_0_10px_rgba(255,0,0,0.2)]" : ""}
                          ${isTotalLossCol && !String(cell).startsWith('-') ? "text-emerald-400 bg-[rgba(16,185,129,0.1)] shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]" : ""}
                        `}
                      >
                        {isNumber && cellIndex > 3 ? Math.round(parseFloat(cell)).toLocaleString() : cell}
                      </td>
                    );
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
