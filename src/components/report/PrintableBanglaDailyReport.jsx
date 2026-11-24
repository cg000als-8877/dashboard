"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { format, parseISO, getDaysInMonth, getDay } from 'date-fns';

// ── PURE BENGALI CONVERSION HELPERS ──────────────────────────────────────────
// Converts any ASCII digits 0-9 inside string or number into Bengali digits ০-৯
export function toBn(val) {
  if (val === null || val === undefined) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

// Formats a number with comma separation and Bengali digits (e.g. 1350 -> ১,৩৫০)
export function formatBnNum(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '০';
  const rounded = Math.round(Number(num));
  return toBn(rounded.toLocaleString('en-US'));
}

// Formats currency in Bengali Taka with ৳ symbol and Bengali digits (e.g. 3800574 -> ৳ ৩,৮০০,৫৭৪)
export function formatBnCurrency(amount, showPlus = false) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '৳ ০';
  const num = Math.round(Number(amount));
  const isNegative = num < 0;
  const absFormatted = toBn(Math.abs(num).toLocaleString('en-US'));
  if (isNegative) {
    return `-৳ ${absFormatted}`;
  }
  if (showPlus && num > 0) {
    return `+৳ ${absFormatted}`;
  }
  return `৳ ${absFormatted}`;
}

// Formats percentage with Bengali digits (e.g. 47.9 -> ৪৭.৯%)
export function formatBnPercent(val) {
  if (val === null || val === undefined || isNaN(parseFloat(val))) return '০.০%';
  const num = typeof val === 'number' ? val.toFixed(1) : parseFloat(val).toFixed(1);
  return `${toBn(num)}%`;
}

// Bengali Day Names map
const BENGALI_DAYS = {
  0: 'রবিবার',
  1: 'সোমবার',
  2: 'মঙ্গলবার',
  3: 'বুধবার',
  4: 'বৃহস্পতিবার',
  5: 'শুক্রবার (ছুটি)',
  6: 'শনিবার'
};

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

// Factory line names in pure Bengali with garment floor code
const BENGALI_LINE_NAMES = {
  'A': 'লাইন-এ (LINE A)',
  'B': 'লাইন-বি (LINE B)',
  'C': 'লাইন-সি (LINE C)',
  'D': 'লাইন-ডি (LINE D)'
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
  const selectedDayOfWeek = getDay(dateObj);
  const selectedDayBangla = BENGALI_DAYS[selectedDayOfWeek] || '';
  const monthKey = activeMonthName.toLowerCase();
  const banglaMonth = BENGALI_MONTHS[monthKey] || activeMonthName;

  // Total calendar days in the active month
  const totalMonthDays = getDaysInMonth(dateObj);
  const calendarDaysLeft = Math.max(0, totalMonthDays - selectedDayNum);

  // Remaining working days calculation from selected date forward (excluding Fridays)
  let remainingWorkingDays = 0;
  for (let d = selectedDayNum + 1; d <= totalMonthDays; d++) {
    const checkDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), d);
    if (checkDate.getDay() !== 5) { // 5 = Friday
      remainingWorkingDays++;
    }
  }

  // ── 2. CUMULATIVE & DAY METRICS (SLICED EXACTLY TO TARGET DATE) ─────────────
  // Filter trends up to selected date
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

  const overallRecovery = totalCost > 0 ? ((totalIncome / totalCost) * 100).toFixed(1) : '0.0';
  const avgDailyProfit = passedWorkingDays > 0 ? Math.round(netProfit / passedWorkingDays) : 0;

  // Selected Day's Trend Metrics
  const selectedDayTrend = (dailyTrends || []).find(t => t.date === effectiveDateStr);
  let selectedDayCost = selectedDayTrend ? Math.round(selectedDayTrend.cost || 0) : 0;
  let selectedDayIncome = selectedDayTrend ? Math.round(selectedDayTrend.income || 0) : 0;
  let selectedDayProfit = selectedDayTrend ? Math.round(selectedDayTrend.netProfit || (selectedDayIncome - selectedDayCost)) : 0;

  // ── 3. DETAILED LINE-BY-LINE BREAKDOWN (WORKERS, CM/DZN, FLOOR DETAILS) ─────
  let activeLines = [];
  const targetEntries = (rawDailyProduction || []).filter(d => d.date === effectiveDateStr && d.status === 'ACTIVE');

  if (targetEntries.length > 0) {
    // If we didn't get selectedDayCost from trends, derive it from active entries
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
        const dayRecovery = dayCost > 0 ? ((dayIncome / dayCost) * 100).toFixed(1) : '0.0';
        const item = entry.item || entry.style || 'সাধারণ পোশাক';
        
        // Garment Floor Detailed Metrics
        const workers = entry.worker_count || 0;
        const perHeadCost = entry.per_head_cost || (workers > 0 ? Math.round(dayCost / workers) : 0);
        const cmPerDzn = entry.cm_per_dzn || 0;
        const prodDzn = entry.production_dzn !== undefined && entry.production_dzn !== null
          ? Number(entry.production_dzn)
          : (dayProd > 0 ? (dayProd / 12) : 0);

        // Monthly cumulative profit for this line up to selected date
        const lineHistory = (rawDailyProduction || []).filter(
          d => d.line_id?.toUpperCase() === id && d.status === 'ACTIVE' && d.date <= effectiveDateStr
        );
        const monthProfit = lineHistory.reduce((acc, d) => acc + (d.net_profit || 0), 0);

        return {
          id,
          item,
          workers,
          perHeadCost,
          cmPerDzn,
          prodDzn,
          dayProd,
          dayCost,
          dayIncome,
          dayProfit,
          dayRecovery,
          monthLoss: monthProfit
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
      const perHeadCost = l.lastDayPerHeadCost || (workers > 0 ? Math.round(dayCost / workers) : 0);
      const cmPerDzn = l.lastDayCmPerDzn || l.lastDay?.cm_per_dzn || 0;
      const prodDzn = l.lastDayProdDzn || (dayProd > 0 ? (dayProd / 12) : 0);

      return {
        id: l.id,
        item: l.item || 'সাধারণ পোশাক',
        workers,
        perHeadCost,
        cmPerDzn,
        prodDzn,
        dayProd,
        dayCost,
        dayIncome,
        dayProfit,
        dayRecovery: l.lastDayCostRecovery || (dayCost > 0 ? ((dayIncome / dayCost) * 100).toFixed(1) : '0.0'),
        monthLoss: l.netProfit || 0
      };
    });
  }

  // "if a line has no details, dont add it in report"
  activeLines = activeLines.filter(l => (l.dayProd || 0) > 0 || (l.dayCost || 0) > 0 || (l.dayIncome || 0) > 0);
  activeLines.sort((a, b) => a.id.localeCompare(b.id));

  const selectedDayRecovery = selectedDayCost > 0 ? ((selectedDayIncome / selectedDayCost) * 100).toFixed(1) : '0.0';

  // ── Totals for Line Summary Row ──
  const totalActiveWorkers = activeLines.reduce((acc, l) => acc + (l.workers || 0), 0);
  const totalActiveProdQty = activeLines.reduce((acc, l) => acc + (l.dayProd || 0), 0);
  const totalActiveProdDzn = activeLines.reduce((acc, l) => acc + (l.prodDzn || 0), 0);
  const avgCmPerDzn = totalActiveProdDzn > 0
    ? Math.round(activeLines.reduce((acc, l) => acc + ((l.cmPerDzn || 0) * (l.prodDzn || 0)), 0) / totalActiveProdDzn)
    : 0;
  const avgPerHeadCost = totalActiveWorkers > 0
    ? Math.round(selectedDayCost / totalActiveWorkers)
    : 0;

  // ── 4. RECOVERY TARGETS ───────────────────────────────────────────────────
  const totalAmountToRecover = netProfit < 0 ? Math.abs(netProfit) : 0;
  const dailyTargetToRecover = remainingWorkingDays > 0 && totalAmountToRecover > 0
    ? Math.round(totalAmountToRecover / remainingWorkingDays)
    : 0;

  return createPortal(
    <div id="bangla-daily-printable-portal">
      {/* ── STRICT 1-PAGE BLACK & WHITE A4 PRINT STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          #bangla-daily-printable-portal {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          *, *::before, *::after {
            color: #000000 !important;
            border-color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
          }
          body > *:not(#bangla-daily-printable-portal) {
            display: none !important;
          }
          #bangla-daily-printable-portal {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 285mm !important;
            max-height: 285mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          #bangla-daily-printable-report {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 285mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 4mm 6mm !important;
            box-sizing: border-box !important;
            border: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          #bangla-daily-printable-report * {
            font-family: var(--font-noto-serif-bengali), 'Noto Serif Bengali', serif !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* ── ACTUAL PHYSICAL A4 SINGLE-PAGE BLACK & WHITE LETTER SHEET ── */}
      <div 
        id="bangla-daily-printable-report"
        className="w-[210mm] max-h-[285mm] bg-white text-black p-6 select-text font-bengali flex flex-col justify-between border-0"
        style={{ fontFamily: "var(--font-noto-serif-bengali), 'Noto Serif Bengali', serif" }}
      >
        <div>
          {/* ── 1. CORPORATE HEADER (BLACK & WHITE) ── */}
          <div className="border-b-2 border-black pb-2 mb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-block px-2 py-0.5 border border-black bg-black text-white text-[9px] font-bold tracking-widest uppercase mb-1">
                  অফিসিয়াল দৈনিক প্রতিবেদন
                </div>
                <h1 className="text-xl font-black text-black tracking-tight leading-tight">
                  বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ
                </h1>
                <p className="text-[11px] font-semibold text-gray-800 mt-0.5">
                  দৈনিক কারখানা পর্যবেক্ষণ ও লাইনভিত্তিক লোকসান বিশ্লেষণ প্রতিবেদন
                </p>
              </div>

              <div className="border border-black bg-white rounded-xs p-2 text-right shrink-0">
                <p className="text-[9px] font-bold text-gray-800 tracking-wider">প্রতিবেদনের তারিখ</p>
                <p className="text-xs font-black text-black mt-0.5">
                  {toBn(selectedDayNum)} {banglaMonth}, {toBn(activeMonthYear)} ({selectedDayBangla})
                </p>
                <p className="text-[10px] text-gray-800 font-semibold mt-0.5">
                  সময়কাল: ০১ - {toBn(selectedDayNum)} {banglaMonth} ({toBn(passedWorkingDays)} কার্যদিবস)
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. TOP FINANCIAL SUMMARY & RECOVERY (PURE BLACK & WHITE GRID) ── */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between border-b border-black pb-1">
              <h2 className="text-[11px] font-black text-black uppercase tracking-wider">
                ১. সার্বিক আর্থিক চিত্র ও রিকভারি লক্ষ্য (তারিখ পর্যন্ত)
              </h2>
              <span className="text-[9.5px] font-bold text-gray-800">
                অবশিষ্ট কার্যদিবস: {toBn(remainingWorkingDays)} দিন (ক্যালেন্ডার বাকি {toBn(calendarDaysLeft)} দিন)
              </span>
            </div>

            {/* 2 Rows x 3 Columns High-Contrast Black & White Metric Boxes */}
            <div className="border border-black text-center overflow-hidden rounded-xs">
              
              {/* Row 1: 3 Columns (Total Cost, Total Income, Net Loss) */}
              <div className="grid grid-cols-3 divide-x divide-black border-b border-black">
                {/* Card 1: Total Cost */}
                <div className="p-2">
                  <p className="text-[8.5px] font-bold text-gray-700">তারিখ পর্যন্ত মোট খরচ</p>
                  <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(totalCost)}</p>
                  <p className="text-[8px] text-gray-600 mt-0.5">{toBn(passedWorkingDays)} দিনের মোট ব্যয়</p>
                </div>

                {/* Card 2: Total Income */}
                <div className="p-2">
                  <p className="text-[8.5px] font-bold text-gray-700">তারিখ পর্যন্ত মোট আয়</p>
                  <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(totalIncome)}</p>
                  <p className="text-[8px] text-gray-600 mt-0.5">উপার্জিত উৎপাদন মূল্য</p>
                </div>

                {/* Card 3: Total Net Loss */}
                <div className="p-2 bg-gray-50">
                  <p className="text-[8.5px] font-black text-black">মোট পুঞ্জীভূত লোকসান</p>
                  <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(netProfit)}</p>
                  <p className="text-[8px] font-bold text-black mt-0.5">কস্ট রিকভারি: {formatBnPercent(overallRecovery)}</p>
                </div>
              </div>

              {/* Row 2: 3 Columns (Avg Daily Loss, Selected Day Loss, Daily Recovery Target) */}
              <div className="grid grid-cols-3 divide-x divide-black">
                {/* Card 4: Average Daily Loss */}
                <div className="p-2">
                  <p className="text-[8.5px] font-bold text-gray-700">প্রতিদিনের গড় লোকসান</p>
                  <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(avgDailyProfit)}</p>
                  <p className="text-[8px] text-gray-600 mt-0.5">দৈনিক ঘাটতির হার</p>
                </div>

                {/* Card 5: Selected Day Loss */}
                <div className="p-2">
                  <p className="text-[8.5px] font-bold text-gray-700">সর্বশেষ দিনের লোকসান ({toBn(selectedDayNum)} {banglaMonth.slice(0, 4)})</p>
                  <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(selectedDayProfit)}</p>
                  <p className="text-[8px] text-gray-600 mt-0.5">দিনের রিকভারি: {formatBnPercent(selectedDayRecovery)}</p>
                </div>

                {/* Card 6: Daily Recovery Target */}
                <div className="p-2 bg-gray-100">
                  <p className="text-[8.5px] font-black text-black">দৈনিক রিকভারি লক্ষ্য</p>
                  <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(dailyTargetToRecover)} / দিন</p>
                  <p className="text-[8px] font-bold text-black mt-0.5">ব্রেক-ইভেনের জন্য</p>
                </div>
              </div>

            </div>
          </div>

          {/* ── 3. SEPARATE DETAILED LINE PERFORMANCE (WORKERS, CM/DZN, PRODUCTION DZN) ── */}
          {/* Only lines with details on this day are included; inactive lines excluded */}
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-black">
              <h2 className="text-[11px] font-black text-black uppercase tracking-wider">
                ২. লাইনভিত্তিক পারফরম্যান্স, শ্রমিক ও সিএম বিবরণী (পৃথক লাইন)
              </h2>
              <span className="text-[9.5px] font-bold text-gray-800">
                কার্যদিবস: {toBn(selectedDayNum)} {banglaMonth}, {toBn(activeMonthYear)} • সক্রিয় লাইন: {toBn(activeLines.length)}টি
              </span>
            </div>

            {/* Individual Separate Section for Each Active Line with Rich Details */}
            {activeLines.map((line) => {
              const dayProd = line.dayProd || 0;
              const dayCost = line.dayCost || 0;
              const dayIncome = line.dayIncome || 0;
              const dayProfit = line.dayProfit !== undefined ? line.dayProfit : (dayIncome - dayCost);
              const monthLoss = line.monthLoss || 0;

              return (
                <div key={line.id} className="border border-black rounded-xs overflow-hidden">
                  {/* Distinct Line Header Bar */}
                  <div className="bg-gray-100 px-3 py-1 border-b border-black flex items-center justify-between text-black">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wide">
                        {BENGALI_LINE_NAMES[line.id] || `লাইন ${toBn(line.id)}`}
                      </span>
                      <span className="text-[10px] font-bold text-gray-800">
                        • চলতি আইটেম: {line.item || 'সাধারণ পোশাক'}
                      </span>
                    </div>
                    <div className="text-[9.5px] font-bold text-black">
                      মাসিক পুঞ্জীভূত লোকসান: <span className="font-black">{formatBnCurrency(monthLoss)}</span>
                    </div>
                  </div>

                  {/* 7-Column Comprehensive Garment Floor & Financial Breakdown Grid */}
                  <div className="grid grid-cols-7 divide-x divide-black text-center text-[10px] bg-white">
                    {/* 1. Total Workers */}
                    <div className="p-1.5">
                      <p className="text-[8px] font-bold text-gray-700">মোট শ্রমিক</p>
                      <p className="font-black text-black text-xs mt-0.5">{toBn(line.workers)} জন</p>
                      <p className="text-[7.5px] text-gray-600 mt-0.5">জনপ্রতি {formatBnCurrency(line.perHeadCost)}</p>
                    </div>

                    {/* 2. CM per Dozen */}
                    <div className="p-1.5">
                      <p className="text-[8px] font-bold text-gray-700">সিএম / ডজন</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(line.cmPerDzn)}</p>
                      <p className="text-[7.5px] text-gray-600 mt-0.5">প্রতি ডজন রেট</p>
                    </div>

                    {/* 3. Production Pcs + Dzn */}
                    <div className="p-1.5">
                      <p className="text-[8px] font-bold text-gray-700">দিনের উৎপাদন</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnNum(dayProd)} পিস</p>
                      <p className="text-[7.5px] text-gray-600 mt-0.5">({toBn(line.prodDzn.toFixed(1))} ডজন)</p>
                    </div>

                    {/* 4. Total Cost */}
                    <div className="p-1.5">
                      <p className="text-[8px] font-bold text-gray-700">দিনের মোট খরচ</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(dayCost)}</p>
                      <p className="text-[7.5px] text-gray-600 mt-0.5">মজুরি ও ফ্লোর ব্যয়</p>
                    </div>

                    {/* 5. Total Income */}
                    <div className="p-1.5">
                      <p className="text-[8px] font-bold text-gray-700">দিনের অর্জিত আয়</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(dayIncome)}</p>
                      <p className="text-[7.5px] text-gray-600 mt-0.5">সিএম উপার্জিত মূল্য</p>
                    </div>

                    {/* 6. Net Profit / Loss */}
                    <div className="p-1.5 bg-gray-50">
                      <p className="text-[8px] font-black text-black">দিনের নিট ফলাফল</p>
                      <p className="font-black text-black text-xs mt-0.5">
                        {formatBnCurrency(dayProfit, true)}
                      </p>
                      <p className="text-[7.5px] font-bold text-black mt-0.5">
                        {dayProfit >= 0 ? '(লাভ)' : '(ঘাটতি)'}
                      </p>
                    </div>

                    {/* 7. Cost Recovery */}
                    <div className="p-1.5">
                      <p className="text-[8px] font-bold text-gray-700">কস্ট রিকভারি</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnPercent(line.dayRecovery)}</p>
                      <p className="text-[7.5px] text-gray-600 mt-0.5">ব্যয় সমন্বয় হার</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Combined Total Summary Row for Active Lines (7 Matching Columns) */}
            <div className="border border-black bg-gray-100 rounded-xs p-1.5">
              <div className="grid grid-cols-7 divide-x divide-black text-center text-[10px]">
                <div className="p-1">
                  <p className="text-[8px] font-black text-black">সর্বমোট শ্রমিক</p>
                  <p className="font-black text-black text-xs mt-0.5">{toBn(totalActiveWorkers)} জন</p>
                  <p className="text-[7.5px] text-gray-700 mt-0.5">গড় {formatBnCurrency(avgPerHeadCost)}</p>
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-black text-black">গড় সিএম / ডজন</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(avgCmPerDzn)}</p>
                  <p className="text-[7.5px] text-gray-700 mt-0.5">ভারযুক্ত গড়</p>
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-black text-black">সর্বমোট উৎপাদন</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnNum(totalActiveProdQty)} পিস</p>
                  <p className="text-[7.5px] text-gray-700 mt-0.5">({toBn(totalActiveProdDzn.toFixed(1))} ডজন)</p>
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-black text-black">মোট দিনের খরচ</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(selectedDayCost)}</p>
                  <p className="text-[7.5px] text-gray-700 mt-0.5">ফ্যাক্টরি ব্যয়</p>
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-black text-black">মোট দিনের আয়</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(selectedDayIncome)}</p>
                  <p className="text-[7.5px] text-gray-700 mt-0.5">ফ্যাক্টরি আয়</p>
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-black text-black">দিনের নিট লোকসান</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(selectedDayProfit, true)}</p>
                  <p className="text-[7.5px] font-black text-black mt-0.5">সামগ্রিক দিন</p>
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-black text-black">দিনের গড় রিকভারি</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnPercent(selectedDayRecovery)}</p>
                  <p className="text-[7.5px] text-gray-700 mt-0.5">সার্বিক রিকভারি</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. OFFICIAL SIGNATURES BLOCK (BLACK & WHITE A4 BOTTOM) ── */}
        <div className="pt-2 border-t-2 border-black mt-2">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="flex flex-col items-center">
              <div className="w-full border-t border-black pt-1 mt-6">
                <p className="text-[10px] font-bold text-black">প্রস্তুতকারক</p>
                <p className="text-[8px] text-gray-700 font-semibold">ডাটা অ্যানালিস্ট / এমআইএস</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-black pt-1 mt-6">
                <p className="text-[10px] font-bold text-black">প্রোডাকশন ইনচার্জ</p>
                <p className="text-[8px] text-gray-700 font-semibold">ফ্লোর অপারেশনস</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-black pt-1 mt-6">
                <p className="text-[10px] font-bold text-black">হিসাব ও অর্থ বিভাগ</p>
                <p className="text-[8px] text-gray-700 font-semibold">অ্যাকাউন্টস বিভাগ</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-black pt-1 mt-6">
                <p className="text-[10px] font-bold text-black">কারখানা পরিচালক / জিএম</p>
                <p className="text-[8px] text-gray-700 font-semibold">বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ</p>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[8px] text-gray-700 font-bengali">
            <span>বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ • ফ্যাক্টরি অপারেশনস ম্যানেজমেন্ট সিস্টেম</span>
            <span>প্রতিবেদন তৈরির সময়: {toBn(format(new Date(), 'yyyy-MM-dd HH:mm:ss'))}</span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
