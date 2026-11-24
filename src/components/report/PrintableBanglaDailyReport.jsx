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
  activeMonthName = 'November',
  activeMonthYear = '2026'
}) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) return null;

  // ── 1. DATE COMPUTATIONS (ALL IN BENGALI) ──────────────────────────────────
  const lastTrend = dailyTrends && dailyTrends.length > 0 ? dailyTrends[dailyTrends.length - 1] : null;
  const lastDateStr = lastTrend?.date || `${activeMonthYear}-11-23`;
  const lastDateObj = parseISO(lastDateStr);
  const lastDayNum = lastDateObj.getDate();
  const lastDayOfWeek = getDay(lastDateObj);
  const lastDayBangla = BENGALI_DAYS[lastDayOfWeek] || '';
  const monthKey = activeMonthName.toLowerCase();
  const banglaMonth = BENGALI_MONTHS[monthKey] || activeMonthName;

  // Total calendar days in the active month
  const totalMonthDays = getDaysInMonth(lastDateObj);
  const calendarDaysLeft = Math.max(0, totalMonthDays - lastDayNum);

  // Remaining working days calculation (excluding Fridays)
  let remainingWorkingDays = 0;
  for (let d = lastDayNum + 1; d <= totalMonthDays; d++) {
    const checkDate = new Date(lastDateObj.getFullYear(), lastDateObj.getMonth(), d);
    if (checkDate.getDay() !== 5) { // 5 = Friday
      remainingWorkingDays++;
    }
  }

  // ── 2. METRIC VALUES (CONVERTED TO BENGALI) ─────────────────────────────────
  const totalCost = Math.round(stats?.totalCost || 0);
  const totalIncome = Math.round(stats?.totalIncome || 0);
  const netProfit = Math.round(stats?.netProfit || 0);
  const passedWorkingDays = stats?.workingDays || 20;
  const avgDailyProfit = Math.round(stats?.averageDailyProfit || (passedWorkingDays > 0 ? netProfit / passedWorkingDays : 0));
  const overallRecovery = totalCost > 0 ? ((totalIncome / totalCost) * 100).toFixed(1) : '0.0';

  // Last Day Totals
  const lastDayCost = lastTrend ? Math.round(lastTrend.cost || 0) : 0;
  const lastDayIncome = lastTrend ? Math.round(lastTrend.income || 0) : 0;
  const lastDayProfit = lastTrend ? Math.round(lastTrend.netProfit || (lastDayIncome - lastDayCost)) : 0;
  const lastDayRecovery = lastDayCost > 0 ? ((lastDayIncome / lastDayCost) * 100).toFixed(1) : '0.0';

  // ── 3. RECOVERY TARGETS ───────────────────────────────────────────────────
  const totalAmountToRecover = netProfit < 0 ? Math.abs(netProfit) : 0;
  const dailyTargetToRecover = remainingWorkingDays > 0 && totalAmountToRecover > 0
    ? Math.round(totalAmountToRecover / remainingWorkingDays)
    : 0;

  // ── 4. FILTER LINES: ONLY ADD LINES WITH DETAILS / PRODUCTION ───────────────
  // "if a line has no details, dont add it in report"
  const activeLines = (lines || [])
    .filter(l => (l.lastDayOutput || 0) > 0 || (l.lastDayCost || 0) > 0 || (l.totalProduction || 0) > 0)
    .sort((a, b) => a.id.localeCompare(b.id));

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
                  {toBn(lastDayNum)} {banglaMonth}, {toBn(activeMonthYear)} ({lastDayBangla})
                </p>
                <p className="text-[10px] text-gray-800 font-semibold mt-0.5">
                  সময়কাল: ০১ - {toBn(lastDayNum)} {banglaMonth} ({toBn(passedWorkingDays)} কার্যদিবস)
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

            {/* 6 High-Contrast Black & White Metric Boxes */}
            <div className="grid grid-cols-6 border border-black divide-x divide-black text-center">
              
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

              {/* Card 4: Average Daily Loss */}
              <div className="p-2">
                <p className="text-[8.5px] font-bold text-gray-700">প্রতিদিনের গড় লোকসান</p>
                <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(avgDailyProfit)}</p>
                <p className="text-[8px] text-gray-600 mt-0.5">দৈনিক ঘাটতির হার</p>
              </div>

              {/* Card 5: Last Day Loss */}
              <div className="p-2">
                <p className="text-[8.5px] font-bold text-gray-700">সর্বশেষ দিনের লোকসান ({toBn(lastDayNum)} নভে)</p>
                <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(lastDayProfit)}</p>
                <p className="text-[8px] text-gray-600 mt-0.5">দিনের রিকভারি: {formatBnPercent(lastDayRecovery)}</p>
              </div>

              {/* Card 6: Daily Recovery Target */}
              <div className="p-2 bg-gray-100">
                <p className="text-[8.5px] font-black text-black">দৈনিক রিকভারি লক্ষ্য</p>
                <p className="text-sm font-black text-black mt-0.5">{formatBnCurrency(dailyTargetToRecover)} / দিন</p>
                <p className="text-[8px] font-bold text-black mt-0.5">ব্রেক-ইভেনের জন্য</p>
              </div>

            </div>
          </div>

          {/* ── 3. SEPARATE LINE DETAILS (SEPARATE LINES A, B, C...) ── */}
          {/* Only lines with details are included; inactive lines (e.g. Line D) excluded */}
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-black">
              <h2 className="text-[11px] font-black text-black uppercase tracking-wider">
                ২. লাইনভিত্তিক পারফরম্যান্স ও লোকসান (পৃথক বিবরণী)
              </h2>
              <span className="text-[9.5px] font-bold text-gray-800">
                কার্যদিবস: {toBn(lastDayNum)} {banglaMonth}, {toBn(activeMonthYear)} • সক্রিয় লাইন: {toBn(activeLines.length)}টি
              </span>
            </div>

            {/* Individual Separate Section for Each Active Line */}
            {activeLines.map((line) => {
              const dayProd = line.lastDayOutput || 0;
              const dayCost = line.lastDayCost || 0;
              const dayIncome = line.lastDayIncome || 0;
              const dayProfit = line.lastDayProfit || (dayIncome - dayCost);
              const monthLoss = line.netProfit || 0;

              return (
                <div key={line.id} className="border border-black rounded-xs overflow-hidden">
                  {/* Distinct Line Header Bar */}
                  <div className="bg-gray-100 px-3 py-1 border-b border-black flex items-center justify-between text-black">
                    <span className="text-[11px] font-black uppercase tracking-wide">
                      {BENGALI_LINE_NAMES[line.id] || `লাইন ${toBn(line.id)}`}
                    </span>
                    <span className="text-[10px] font-bold text-black">
                      চলতি আইটেম / স্টাইল: {line.item || 'সাধারণ পোশাক'}
                    </span>
                  </div>

                  {/* Line Detail Financial Breakdown Grid (No Colors, Pure Black & White) */}
                  <div className="grid grid-cols-6 divide-x divide-black text-center text-[10px] bg-white">
                    <div className="p-1.5">
                      <p className="text-[8.5px] font-bold text-gray-700">দিনের উৎপাদন</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnNum(dayProd)} পিস</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[8.5px] font-bold text-gray-700">দিনের খরচ</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(dayCost)}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[8.5px] font-bold text-gray-700">দিনের আয়</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(dayIncome)}</p>
                    </div>
                    <div className="p-1.5 bg-gray-50">
                      <p className="text-[8.5px] font-black text-black">দিনের নিট ফলাফল</p>
                      <p className="font-black text-black text-xs mt-0.5">
                        {formatBnCurrency(dayProfit, true)} {dayProfit >= 0 ? '(লাভ)' : '(ঘাটতি)'}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[8.5px] font-bold text-gray-700">কস্ট রিকভারি</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnPercent(line.lastDayCostRecovery)}</p>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[8.5px] font-bold text-gray-700">মাসিক পুঞ্জীভূত লোকসান</p>
                      <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(monthLoss)}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Combined Total Summary Row for Active Lines */}
            <div className="border border-black bg-gray-100 rounded-xs p-1.5">
              <div className="grid grid-cols-6 divide-x divide-black text-center text-[10px]">
                <div className="p-1">
                  <p className="text-[8.5px] font-black text-black">সর্বমোট উৎপাদন</p>
                  <p className="font-black text-black text-xs mt-0.5">
                    {formatBnNum(activeLines.reduce((acc, l) => acc + (l.lastDayOutput || 0), 0))} পিস
                  </p>
                </div>
                <div className="p-1">
                  <p className="text-[8.5px] font-black text-black">মোট দিনের খরচ</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(lastDayCost)}</p>
                </div>
                <div className="p-1">
                  <p className="text-[8.5px] font-black text-black">মোট দিনের আয়</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(lastDayIncome)}</p>
                </div>
                <div className="p-1">
                  <p className="text-[8.5px] font-black text-black">দিনের নিট লোকসান</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(lastDayProfit, true)}</p>
                </div>
                <div className="p-1">
                  <p className="text-[8.5px] font-black text-black">দিনের গড় রিকভারি</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnPercent(lastDayRecovery)}</p>
                </div>
                <div className="p-1">
                  <p className="text-[8.5px] font-black text-black">মোট পুঞ্জীভূত লোকসান</p>
                  <p className="font-black text-black text-xs mt-0.5">{formatBnCurrency(netProfit)}</p>
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
