"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { parseISO } from 'date-fns';

// ── PURE BENGALI CONVERSION HELPERS ──────────────────────────────────────────
// Converts any ASCII digits 0-9 inside string or number into Bengali digits ০-৯
export function toBn(val) {
  if (val === null || val === undefined) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

// Formats a number with Bengali digits (e.g. 1350 -> ১৩৫০)
export function formatBnNum(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '০';
  const rounded = Math.round(Number(num));
  return toBn(rounded);
}

// Formats difference in Bengali Taka (string version)
export function formatDifference(val) {
  if (val === null || val === undefined || isNaN(Number(val))) return '০ টাকা';
  const rounded = Math.round(Number(val));
  if (rounded < 0) {
    return `-${toBn(Math.abs(rounded))} টাকা`;
  } else if (rounded > 0) {
    return `${toBn(rounded)} টাকা`;
  }
  return `০ টাকা`;
}

// Renders difference in Bengali Taka with red styling for negative values matching the sheet
export function renderDifference(val) {
  if (val === null || val === undefined || isNaN(Number(val))) return <span>০ টাকা</span>;
  const rounded = Math.round(Number(val));
  if (rounded < 0) {
    return (
      <span className="text-red-600 font-bold" style={{ color: '#dc2626' }}>
        -{toBn(Math.abs(rounded))} টাকা
      </span>
    );
  } else if (rounded > 0) {
    return <span>{toBn(rounded)} টাকা</span>;
  }
  return <span>০ টাকা</span>;
}

// Bengali Months map
const BENGALI_MONTHS = {
  'january': 'জানুয়ারি',
  'february': 'ফেব্রুয়ারি',
  'march': 'মার্চ',
  'april': 'এপ্রিল',
  'may': 'মে',
  'june': 'জুন',
  'july': 'জুলাই',
  'august': 'আগস্ট',
  'september': 'সেপ্টেম্বর',
  'october': 'অক্টোবর',
  'november': 'নভেম্বর',
  'december': 'ডিসেম্বর'
};

// Factory line names formatted exactly as "এ (A)", "বি (B)", "সি (C)", "ডি (D)"
const BENGALI_LINE_LABELS = {
  'A': 'এ (A)',
  'B': 'বি (B)',
  'C': 'সি (C)',
  'D': 'ডি (D)'
};

export function PrintableBanglaDailyReport({
  stats,
  dailyTrends = [],
  lines = [],
  targetDate = null,
  rawDailyProduction = [],
  activeMonthName = 'November',
  activeMonthYear = '2026'
}) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Preload Noto Serif Bengali for instant print engine availability
  React.useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.load('bold 24px "Noto Serif Bengali"', 'বায়েজিদ অ্যাপারেলস');
      document.fonts.load('bold 14px "Noto Serif Bengali"', 'নভেম্বর ১ থেকে ২৩, ২০২৬');
      document.fonts.load('normal 12px "Noto Serif Bengali"', 'মেশিনের সংখ্যা');
    }
  }, []);

  if (!isMounted) return null;

  // ── 1. DATE COMPUTATIONS (TARGET DATE OR LATEST DATE) ───────────────────────
  const latestTrend = dailyTrends && dailyTrends.length > 0 ? dailyTrends[dailyTrends.length - 1] : null;
  const effectiveDateStr = targetDate || latestTrend?.date || `${activeMonthYear}-11-23`;
  
  let dateObj;
  try {
    dateObj = parseISO(effectiveDateStr);
  } catch (e) {
    dateObj = new Date(2026, 10, 23);
  }

  const selectedDayNum = dateObj.getDate();
  const monthKey = activeMonthName.toLowerCase();
  const banglaMonth = BENGALI_MONTHS[monthKey] || activeMonthName;

  // ── 2. CUMULATIVE & DAY METRICS (SLICED EXACTLY TO TARGET DATE) ─────────────
  const trendsUpToDate = (dailyTrends || []).filter(t => t.date && t.date <= effectiveDateStr);
  const passedWorkingDays = trendsUpToDate.length > 0 ? trendsUpToDate.length : 1;

  let totalCost = 0;
  let totalIncome = 0;
  let netProfit = 0;

  if (trendsUpToDate.length > 0) {
    totalCost = Math.round(trendsUpToDate.reduce((acc, t) => acc + (t.cost || 0), 0));
    totalIncome = Math.round(trendsUpToDate.reduce((acc, t) => acc + (t.income || 0), 0));
    netProfit = totalIncome - totalCost;
  } else {
    totalCost = Math.round(stats?.totalCost || 0);
    totalIncome = Math.round(stats?.totalIncome || 0);
    netProfit = Math.round(stats?.netProfit || (totalIncome - totalCost));
  }

  // Selected Day's Trend Metrics
  const selectedDayTrend = (dailyTrends || []).find(t => t.date === effectiveDateStr);
  let selectedDayCost = selectedDayTrend ? Math.round(selectedDayTrend.cost || 0) : 0;
  let selectedDayIncome = selectedDayTrend ? Math.round(selectedDayTrend.income || 0) : 0;
  let selectedDayProfit = selectedDayTrend ? Math.round(selectedDayTrend.netProfit || (selectedDayIncome - selectedDayCost)) : 0;

  // ── 3. DETAILED LINE-BY-LINE BREAKDOWN (MAN POWER -> মেশিনের সংখ্যা) ─────────
  let activeLines = [];
  const targetEntries = (rawDailyProduction || []).filter(d => d.date === effectiveDateStr && d.status === 'ACTIVE');

  if (targetEntries.length > 0) {
    if (!selectedDayTrend || (selectedDayCost === 0 && targetEntries.length > 0)) {
      selectedDayCost = Math.round(targetEntries.reduce((acc, d) => acc + (d.total_cost || 0), 0));
      selectedDayIncome = Math.round(targetEntries.reduce((acc, d) => acc + (d.total_income || 0), 0));
      selectedDayProfit = selectedDayIncome - selectedDayCost;
    }

    const lineIds = ['A', 'B', 'C', 'D'];
    activeLines = lineIds
      .map(id => {
        const entry = targetEntries.find(d => d.line_id?.toUpperCase() === id);
        if (!entry) return null;

        const dayProd = entry.production_qty || 0;
        const dayCost = entry.total_cost || 0;
        const dayIncome = entry.total_income || 0;
        const dayProfit = entry.net_profit !== undefined ? entry.net_profit : (dayIncome - dayCost);
        
        // Style Number: Use style if available, otherwise item name
        const style = entry.style || entry.item || '—';
        
        // Man Power used directly as "মেশিনের সংখ্যা" per user instruction
        const workers = entry.worker_count || 0;
        const cmPerDzn = entry.cm_per_dzn || 0;

        return {
          id,
          style,
          workers,
          cmPerDzn,
          dayProd,
          dayCost,
          dayIncome,
          dayProfit
        };
      })
      .filter(Boolean);
  } else {
    // Fallback: If rawDailyProduction is not available, use passed lines prop
    activeLines = (lines || []).map(l => {
      const dayProd = l.lastDayOutput || 0;
      const dayCost = l.lastDayCost || 0;
      const dayIncome = l.lastDayIncome || 0;
      const dayProfit = l.lastDayProfit || (dayIncome - dayCost);
      const workers = l.lastDayWorkers || l.lastDay?.worker_count || l.averageWorkers || 0;
      const cmPerDzn = l.lastDayCmPerDzn || l.lastDay?.cm_per_dzn || 0;
      const style = l.style || l.item || '—';

      return {
        id: l.id,
        style,
        workers,
        cmPerDzn,
        dayProd,
        dayCost,
        dayIncome,
        dayProfit
      };
    });
  }

  // Only include lines with activity on this day
  activeLines = activeLines.filter(l => (l.dayProd || 0) > 0 || (l.dayCost || 0) > 0 || (l.dayIncome || 0) > 0);
  activeLines.sort((a, b) => a.id.localeCompare(b.id));

  // If selectedDayCost is 0, sum from activeLines
  if (selectedDayCost === 0 && activeLines.length > 0) {
    selectedDayCost = activeLines.reduce((acc, l) => acc + (l.dayCost || 0), 0);
    selectedDayIncome = activeLines.reduce((acc, l) => acc + (l.dayIncome || 0), 0);
    selectedDayProfit = selectedDayIncome - selectedDayCost;
  }

  // Totals for table summary row
  const totalActiveProdQty = activeLines.reduce((acc, l) => acc + (l.dayProd || 0), 0);

  return createPortal(
    <div id="bangla-daily-printable-portal">
      {/* ── STRICT 1-PAGE BLACK & WHITE A4 LANDSCAPE PRINT STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700;800;900&display=swap');

        @font-face {
          font-family: 'Noto Serif Bengali';
          font-style: normal;
          font-weight: 400;
          font-stretch: normal;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/notoserifbengali/v31/hYkuPvggTvnzO14VSXltirUdnnkt1pwmWrprmO7RjE0a5BtdATYU1crFaM_5JfcAHnqn.ttf) format('truetype');
        }
        @font-face {
          font-family: 'Noto Serif Bengali';
          font-style: normal;
          font-weight: 700;
          font-stretch: normal;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/notoserifbengali/v31/hYkuPvggTvnzO14VSXltirUdnnkt1pwmWrprmO7RjE0a5BtdATYU1crFaM_5JffnGXqn.ttf) format('truetype');
        }

        @media screen {
          #bangla-daily-printable-portal {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm 15mm 10mm 15mm;
          }
          body > *:not(#bangla-daily-printable-portal) {
            display: none !important;
          }
          *, *::before, *::after {
            border-color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
            font-family: 'Noto Serif Bengali', 'Noto Serif', serif !important;
          }
          .text-red-600, .text-red-600 * {
            color: #dc2626 !important;
          }
          html, body {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
            font-family: 'Noto Serif Bengali', 'Noto Serif', serif !important;
          }
          #bangla-daily-printable-portal {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 999999 !important;
            background: #ffffff !important;
            font-family: 'Noto Serif Bengali', 'Noto Serif', serif !important;
          }
          #bangla-daily-printable-report {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 194mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 6mm 8mm !important;
            box-sizing: border-box !important;
            border: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            font-family: 'Noto Serif Bengali', 'Noto Serif', serif !important;
          }
          #bangla-daily-printable-report,
          #bangla-daily-printable-report *,
          #bangla-daily-printable-report table,
          #bangla-daily-printable-report th,
          #bangla-daily-printable-report td,
          #bangla-daily-printable-report h1,
          #bangla-daily-printable-report h2,
          #bangla-daily-printable-report h3,
          #bangla-daily-printable-report p,
          #bangla-daily-printable-report span,
          #bangla-daily-printable-report div {
            font-family: 'Noto Serif Bengali', 'Noto Serif', serif !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* ── ACTUAL PHYSICAL A4 SINGLE-PAGE LANDSCAPE SHEET WITH STANDARD TOP GAP ── */}
      <div 
        id="bangla-daily-printable-report"
        className="w-[297mm] max-h-[194mm] bg-white text-black px-6 pt-6 pb-4 select-text flex flex-col justify-between border-0"
        style={{ fontFamily: "'Noto Serif Bengali', 'Noto Serif', serif" }}
      >
        <div>
          {/* ── 1. CORPORATE HEADER (CENTERED, WITH STANDARD TOP MARGIN GAP) ── */}
          <div className="text-center mb-1 pt-3">
            <h1 className="text-2xl font-black text-black tracking-tight leading-tight">
              বায়েজিদ অ্যাপারেলস (প্রা.) লিমিটেড
            </h1>
            <p className="text-xs font-bold text-black mt-1">
              এবিএম টাওয়ার, ৬৭১/১, শোলকবহর, বহদ্দারহাট, চট্টগ্রাম
            </p>
          </div>

          {/* Banner: দৈনিক কারখানার খরচের বিবরণ */}
          <div className="border-y border-black py-1 mb-2 text-center">
            <h2 className="text-sm font-black text-black tracking-wider">
              দৈনিক কারখানার খরচের বিবরণ
            </h2>
          </div>

          {/* Date Box (Right Aligned) */}
          <div className="flex justify-end mb-2">
            <div className="border border-black px-4 py-0.5 text-xs font-bold text-black">
              তারিখ: {toBn(selectedDayNum)} {banglaMonth} {toBn(activeMonthYear)}
            </div>
          </div>

          {/* ── 2. MAIN LINE-BY-LINE SPREADSHEET TABLE (8 COLUMNS: মোট খরচ IN COL 4, সিএম IN COL 6) ── */}
          <table className="w-full border-collapse border border-black text-xs text-black mb-3">
            <thead>
              <tr className="border-b border-black">
                <th className="border border-black px-2 py-1.5 text-center font-bold">লাইন</th>
                <th className="border border-black px-2 py-1.5 text-center font-bold">স্টাইল</th>
                <th className="border border-black px-2 py-1.5 text-center font-bold">মেশিনের সংখ্যা</th>
                <th className="border border-black px-2 py-1.5 text-center font-bold">মোট খরচ</th>
                <th className="border border-black px-2 py-1.5 text-center font-bold">দৈনিক উৎপাদন</th>
                <th className="border border-black px-2 py-1.5 text-center font-bold">সিএম (CM)</th>
                <th className="border border-black px-2 py-1.5 text-center font-bold">মোট আয়</th>
                <th className="border border-black px-2 py-1.5 text-center font-bold">পার্থক্য</th>
              </tr>
            </thead>
            <tbody>
              {activeLines.map((line) => (
                <tr key={line.id} className="border-b border-black">
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {BENGALI_LINE_LABELS[line.id] || line.id}
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {line.style ? toBn(line.style) : '—'}
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {toBn(line.workers)}
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {formatBnNum(line.dayCost)} টাকা
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {formatBnNum(line.dayProd)} পিস
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {formatBnNum(line.cmPerDzn)} টাকা
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {formatBnNum(line.dayIncome)} টাকা
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-bold">
                    {renderDifference(line.dayProfit)}
                  </td>
                </tr>
              ))}

              {/* Total Row (মোট) */}
              <tr className="border-t border-black font-black">
                <td className="border border-black px-2 py-1 text-center font-bold">মোট</td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1 text-center font-bold">
                  {formatBnNum(selectedDayCost)} টাকা
                </td>
                <td className="border border-black px-2 py-1 text-center font-bold">
                  {formatBnNum(totalActiveProdQty)} পিস
                </td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1 text-center font-bold">
                  {formatBnNum(selectedDayIncome)} টাকা
                </td>
                <td className="border border-black px-2 py-1 text-center font-bold">
                  {renderDifference(selectedDayProfit)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── 3. DAY SUMMARY BOX (RIGHT ALIGNED, EXACT SPREADSHEET MINI TABLE) ── */}
          <div className="flex justify-end mb-4">
            <table className="border-collapse border border-black text-xs text-black w-80">
              <tbody>
                <tr className="border-b border-black">
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">মোট খরচ</td>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">
                    {formatBnNum(selectedDayCost)} টাকা
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">মোট আয়</td>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">
                    {formatBnNum(selectedDayIncome)} টাকা
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">মোট লাভ/ক্ষতি</td>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">
                    {renderDifference(selectedDayProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── 4. CUMULATIVE PERIOD SUMMARY (CENTERED MINI TABLE WITH (২০ দিন) WORKING DAYS COUNT) ── */}
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-sm font-black text-black mb-1">
              {banglaMonth} ১ থেকে {toBn(selectedDayNum)}, {toBn(activeMonthYear)} ({toBn(passedWorkingDays)} দিন)
            </h3>
            <table className="border-collapse border border-black text-xs text-black w-80">
              <tbody>
                <tr className="border-b border-black">
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">মোট খরচ</td>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">
                    {formatBnNum(totalCost)} টাকা
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">মোট আয়</td>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">
                    {formatBnNum(totalIncome)} টাকা
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">মোট লাভ/ক্ষতি</td>
                  <td className="border border-black px-3 py-1 font-bold text-center w-1/2">
                    {renderDifference(netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. OFFICIAL SIGNATURES (EXACTLY TWO ACROSS THE BOTTOM) ── */}
        <div className="pt-6 pb-2 flex justify-between items-end px-16">
          <div className="text-center">
            <div className="w-56 border-t border-black mb-1.5 mx-auto"></div>
            <p className="text-xs font-bold text-black">প্রোডাকশন ম্যানেজার (স্বাক্ষর)</p>
          </div>
          <div className="text-center">
            <div className="w-56 border-t border-black mb-1.5 mx-auto"></div>
            <p className="text-xs font-bold text-black">অপারেশন ডিরেক্টর (স্বাক্ষর)</p>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
