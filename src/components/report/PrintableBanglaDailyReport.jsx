"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { TrendingDown, TrendingUp } from 'lucide-react';
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
  'A': 'লাইন-এ (A)',
  'B': 'লাইন-বি (B)',
  'C': 'লাইন-সি (C)',
  'D': 'লাইন-ডি (D)'
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
  const isOverallLoss = netProfit < 0;
  const currentTotalLoss = Math.abs(netProfit);
  const passedWorkingDays = stats?.workingDays || 20;
  const avgDailyProfit = Math.round(stats?.averageDailyProfit || (passedWorkingDays > 0 ? netProfit / passedWorkingDays : 0));
  const isAvgLoss = avgDailyProfit < 0;
  const overallRecovery = totalCost > 0 ? ((totalIncome / totalCost) * 100).toFixed(1) : '0.0';
  const recoveryDeficitPct = Math.max(0, (100 - parseFloat(overallRecovery))).toFixed(1);

  // Last Day Totals
  const lastDayCost = lastTrend ? Math.round(lastTrend.cost || 0) : 0;
  const lastDayIncome = lastTrend ? Math.round(lastTrend.income || 0) : 0;
  const lastDayProfit = lastTrend ? Math.round(lastTrend.netProfit || (lastDayIncome - lastDayCost)) : 0;
  const isLastDayLoss = lastDayProfit < 0;
  const lastDayRecovery = lastDayCost > 0 ? ((lastDayIncome / lastDayCost) * 100).toFixed(1) : '0.0';

  // ── 3. RECOVERY TARGETS ───────────────────────────────────────────────────
  const totalAmountToRecover = isOverallLoss ? currentTotalLoss : 0;
  const dailyTargetToRecover = remainingWorkingDays > 0 && totalAmountToRecover > 0
    ? Math.round(totalAmountToRecover / remainingWorkingDays)
    : 0;

  // ── 4. LINE PERFORMANCE SORTING ───────────────────────────────────────────
  const activeLines = (lines || []).slice().sort((a, b) => a.id.localeCompare(b.id));

  return createPortal(
    <div id="bangla-daily-printable-portal">
      {/* ── PRINT-AWARE STYLES INJECTION ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          #bangla-daily-printable-portal {
            display: none !important;
          }
        }
        @media print {
          body, html {
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
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
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #bangla-daily-printable-report {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            width: 210mm !important;
            min-height: 297mm !important;
            background: #ffffff !important;
            color: #111827 !important;
            padding: 8mm 10mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            border: none !important;
          }
          #bangla-daily-printable-report * {
            visibility: visible !important;
            font-family: var(--font-noto-serif-bengali), 'Noto Serif Bengali', serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
        }
      `}} />

      {/* ── ACTUAL PHYSICAL A4 LETTER PAPER SHEET (210mm x 297mm) ── */}
      <div 
        id="bangla-daily-printable-report"
        className="w-[210mm] min-h-[297mm] bg-white text-gray-900 p-8 select-text font-bengali flex flex-col justify-between"
        style={{ fontFamily: "var(--font-noto-serif-bengali), 'Noto Serif Bengali', serif" }}
      >
        <div>
          {/* ── 1. CORPORATE HEADER (A4 FORMAT) ── */}
          <div className="border-b-2 border-gray-900 pb-3 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-sm bg-gray-900 text-white text-[9.5px] font-bold tracking-widest uppercase mb-1">
                  অফিসিয়াল দৈনিক প্রতিবেদন
                </div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-tight">
                  বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ
                </h1>
                <p className="text-xs font-semibold text-gray-600 mt-0.5">
                  দৈনিক কারখানা পর্যবেক্ষণ ও লাইনভিত্তিক লোকসান বিশ্লেষণ প্রতিবেদন
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-right shrink-0">
                <p className="text-[9.5px] uppercase font-bold text-gray-500 tracking-wider">প্রতিবেদনের তারিখ</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {toBn(lastDayNum)} {banglaMonth}, {toBn(activeMonthYear)} ({lastDayBangla})
                </p>
                <p className="text-[10.5px] text-gray-600 font-medium mt-0.5">
                  সময়কাল: ০১ - {toBn(lastDayNum)} {banglaMonth} ({toBn(passedWorkingDays)} কার্যদিবস)
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. TOP 5 FINANCIAL KPI CARDS (STRICT 5 COLUMNS ACROSS A4) ── */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
              <h2 className="text-xs font-bold text-gray-900 tracking-tight">
                ১. সার্বিক আর্থিক চিত্র (তারিখ পর্যন্ত পুঞ্জীভূত ও সর্বশেষ দিন)
              </h2>
            </div>

            <div className="grid grid-cols-5 gap-2">
              
              {/* Card 1: Total Cost */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex flex-col justify-between">
                <span className="text-[9.5px] font-bold tracking-wider text-gray-500">
                  তারিখ পর্যন্ত মোট খরচ
                </span>
                <span className="text-base font-extrabold text-gray-900 mt-1">
                  {formatBnCurrency(totalCost)}
                </span>
                <span className="text-[9px] text-gray-500 mt-0.5">
                  {toBn(passedWorkingDays)} দিনের সার্বিক কারখানা ব্যয়
                </span>
              </div>

              {/* Card 2: Total Income */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex flex-col justify-between">
                <span className="text-[9.5px] font-bold tracking-wider text-emerald-700">
                  তারিখ পর্যন্ত মোট আয়
                </span>
                <span className="text-base font-extrabold text-emerald-700 mt-1">
                  {formatBnCurrency(totalIncome)}
                </span>
                <span className="text-[9px] text-gray-500 mt-0.5">
                  মোট উপার্জিত উৎপাদন মূল্য
                </span>
              </div>

              {/* Card 3: Total Loss to date */}
              <div className={`rounded-lg p-2.5 flex flex-col justify-between border-2 ${
                isOverallLoss ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-bold tracking-wider">
                    {isOverallLoss ? 'মোট লোকসান (ঘাটতি)' : 'মোট নিট লাভ'}
                  </span>
                  {isOverallLoss ? <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </div>
                <span className="text-base font-black mt-1">
                  {formatBnCurrency(netProfit)}
                </span>
                <span className="text-[9px] font-semibold text-rose-700 mt-0.5">
                  কস্ট রিকভারি: {formatBnPercent(overallRecovery)}
                </span>
              </div>

              {/* Card 4: Average Per Day Loss */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex flex-col justify-between">
                <span className="text-[9.5px] font-bold tracking-wider text-gray-600">
                  প্রতিদিনের গড় লোকসান
                </span>
                <span className={`text-base font-extrabold mt-1 ${isAvgLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {formatBnCurrency(avgDailyProfit)}
                </span>
                <span className="text-[9px] text-gray-500 mt-0.5">
                  দৈনিক ঘাটতির গড় হার
                </span>
              </div>

              {/* Card 5: Last Day Loss */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-bold tracking-wider text-amber-900">
                    সর্বশেষ দিনের লোকসান
                  </span>
                  <span className="text-[8.5px] font-bold px-1 py-0.2 rounded bg-amber-200 text-amber-950">
                    {toBn(lastDayNum)} {banglaMonth.slice(0, 3)}
                  </span>
                </div>
                <span className={`text-base font-extrabold mt-1 ${isLastDayLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {formatBnCurrency(lastDayProfit)}
                </span>
                <span className="text-[9px] text-gray-600 mt-0.5">
                  দিনের রিকভারি: {formatBnPercent(lastDayRecovery)}
                </span>
              </div>

            </div>
          </div>

          {/* ── 3. LINE-WISE PERFORMANCE & LOSS TABLE (A4 FIT) ── */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                <h2 className="text-xs font-bold text-gray-900 tracking-tight">
                  ২. লাইনভিত্তিক সর্বশেষ দিনের পারফরম্যান্স ও লোকসানের পৃথক তালিকা
                </h2>
              </div>
              <span className="text-[10px] font-medium text-gray-500">
                সর্বশেষ কার্যদিবস: {toBn(lastDayNum)} {banglaMonth}, {toBn(activeMonthYear)}
              </span>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold">
                    <th className="py-2 px-2.5">লাইন</th>
                    <th className="py-2 px-2.5">চলতি আইটেম / স্টাইল</th>
                    <th className="py-2 px-2 text-right">দিনের উৎপাদন (পিস)</th>
                    <th className="py-2 px-2 text-right">দিনের খরচ (টাকা)</th>
                    <th className="py-2 px-2 text-right">দিনের আয় (টাকা)</th>
                    <th className="py-2 px-2.5 text-right">দিনের নিট লাভ/ক্ষতি (টাকা)</th>
                    <th className="py-2 px-2 text-center">রিকভারি (%)</th>
                    <th className="py-2 px-2.5 text-right">পুঞ্জীভূত লোকসান (টাকা)</th>
                    <th className="py-2 px-2 text-center">সার্বিক অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeLines.map((line) => {
                    const dayProd = line.lastDayOutput || 0;
                    const dayCost = line.lastDayCost || 0;
                    const dayIncome = line.lastDayIncome || 0;
                    const dayProfit = line.lastDayProfit || (dayIncome - dayCost);
                    const isDayLoss = dayProfit < 0;
                    const recovery = parseFloat(line.lastDayCostRecovery || 0);
                    const monthLoss = line.netProfit || 0;

                    // Status assessment
                    let statusBadge = { label: 'সতর্কতা', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
                    if (dayProd === 0 && dayCost === 0) {
                      statusBadge = { label: 'বন্ধ / নিষ্ক্রিয়', bg: 'bg-gray-100 text-gray-600 border-gray-300' };
                    } else if (recovery >= 100) {
                      statusBadge = { label: 'লাভজনক', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
                    } else if (recovery >= 50) {
                      statusBadge = { label: 'উন্নতিশীল', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
                    }

                    return (
                      <tr key={line.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-1.5 px-2.5 font-bold text-gray-900 whitespace-nowrap">
                          {BENGALI_LINE_NAMES[line.id] || `লাইন ${toBn(line.id)}`}
                        </td>
                        <td className="py-1.5 px-2.5 text-gray-800 font-medium max-w-[150px] truncate" title={line.item}>
                          {line.item || 'সাধারণ পোশাক'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-semibold text-gray-900">
                          {formatBnNum(dayProd)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium text-gray-700">
                          {formatBnNum(dayCost)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium text-emerald-700">
                          {formatBnNum(dayIncome)}
                        </td>
                        <td className={`py-1.5 px-2.5 text-right font-bold ${isDayLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {dayProfit > 0 ? `+${formatBnNum(dayProfit)}` : formatBnNum(dayProfit)}
                        </td>
                        <td className="py-1.5 px-2 text-center font-bold text-gray-800">
                          {formatBnPercent(line.lastDayCostRecovery)}
                        </td>
                        <td className={`py-1.5 px-2.5 text-right font-bold ${monthLoss < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {formatBnNum(monthLoss)}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold text-gray-900">
                  <tr>
                    <td colSpan={2} className="py-2 px-2.5">সর্বমোট (দিনের যোগফল)</td>
                    <td className="py-2 px-2 text-right font-black">
                      {formatBnNum(activeLines.reduce((acc, l) => acc + (l.lastDayOutput || 0), 0))}
                    </td>
                    <td className="py-2 px-2 text-right font-black">
                      {formatBnNum(lastDayCost)}
                    </td>
                    <td className="py-2 px-2 text-right font-black text-emerald-700">
                      {formatBnNum(lastDayIncome)}
                    </td>
                    <td className={`py-2 px-2.5 text-right font-black ${isLastDayLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {lastDayProfit > 0 ? `+${formatBnNum(lastDayProfit)}` : formatBnNum(lastDayProfit)}
                    </td>
                    <td className="py-2 px-2 text-center font-black">
                      {formatBnPercent(lastDayRecovery)}
                    </td>
                    <td className={`py-2 px-2.5 text-right font-black ${isOverallLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {formatBnNum(netProfit)}
                    </td>
                    <td className="py-2 px-2 text-center">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── 4. CONCLUSION & RECOVERY FORECAST BOX (PURE BENGALI) ── */}
          <div className="bg-gradient-to-br from-gray-50 to-rose-50/40 border border-gray-900 rounded-lg p-3.5 mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-md bg-gray-900 text-white flex items-center justify-center font-bold text-[11px]">
                ৩
              </div>
              <h2 className="text-xs font-black text-gray-950">
                ৩. সারসংক্ষেপ, সিদ্ধান্ত ও রিকভারি পূর্বাভাস
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {/* Box 1 */}
              <div className="bg-white border border-gray-300 rounded-lg p-2 text-center shadow-xs">
                <p className="text-[9px] font-bold text-gray-500">মাসে অবশিষ্ট কার্যদিবস</p>
                <p className="text-lg font-black text-gray-900 mt-0.5">
                  {toBn(remainingWorkingDays)} দিন
                </p>
                <p className="text-[9.5px] text-gray-600">
                  (ক্যালেন্ডার বাকি {toBn(calendarDaysLeft)} দিন)
                </p>
              </div>

              {/* Box 2 */}
              <div className="bg-white border border-rose-300 rounded-lg p-2 text-center shadow-xs">
                <p className="text-[9px] font-bold text-rose-700">মোট রিকভারি করতে হবে (ঘাটতি)</p>
                <p className="text-lg font-black text-rose-700 mt-0.5">
                  {formatBnCurrency(totalAmountToRecover)}
                </p>
                <p className="text-[9.5px] text-rose-800 font-medium">
                  {isOverallLoss ? 'ব্রেক-ইভেনে পৌঁছানোর লক্ষ্য' : 'বর্তমানে কারখানা লাভে রয়েছে'}
                </p>
              </div>

              {/* Box 3 */}
              <div className="bg-white border border-indigo-300 rounded-lg p-2 text-center shadow-xs">
                <p className="text-[9px] font-bold text-indigo-700">বাকি দিনগুলোতে দৈনিক লক্ষ্যমাত্রা</p>
                <p className="text-lg font-black text-indigo-800 mt-0.5">
                  {formatBnCurrency(dailyTargetToRecover)} / দিন
                </p>
                <p className="text-[9.5px] text-indigo-900 font-medium">
                  প্রতিদিন প্রয়োজনীয় অতিরিক্ত নিট আয়
                </p>
              </div>
            </div>

            {/* Bengali Detailed Conclusion Paragraph */}
            <div className="bg-white/90 border border-gray-300 rounded-md p-3 text-[11px] text-gray-800 leading-relaxed font-medium space-y-1.5">
              <p>
                📌 <strong>বিশ্লেষণ ও পর্যালোচনা:</strong> চলতি {banglaMonth} মাসে এ পর্যন্ত {toBn(passedWorkingDays)}টি কর্মদিবস অতিবাহিত হয়েছে। কারখানার সার্বিক ব্যয় {formatBnCurrency(totalCost)}-এর বিপরীতে অর্জিত আয় {formatBnCurrency(totalIncome)}, যার ফলে পুঞ্জীভূত নিট লোকসান দাঁড়িয়েছে <strong className="text-rose-700">{formatBnCurrency(netProfit)}</strong> (কস্ট রিকভারি {formatBnPercent(overallRecovery)}, ঘাটতি {formatBnPercent(recoveryDeficitPct)})।
              </p>
              <p>
                📌 <strong>রিকভারি পূর্বাভাস:</strong> চলতি মাসে আর মাত্র <strong>{toBn(remainingWorkingDays)}টি কার্যদিবস</strong> বাকি রয়েছে। শূন্য লোকসানে (Break-Even) পৌঁছাতে হলে অবশিষ্ট দিনগুলোতে প্রতিদিন গড়ে অন্তত <strong className="text-indigo-800">{formatBnCurrency(dailyTargetToRecover)}</strong> অতিরিক্ত নিট উদ্বৃত্ত নিশ্চিত করতে হবে।
              </p>
              <p>
                📌 <strong>জরুরি করণীয়:</strong> লাইনভিত্তিক পর্যবেক্ষণে দেখা যাচ্ছে যে বিশেষ করে যেসব লাইনে কস্ট রিকভারি {toBn(50)}%-এর নিচে রয়েছে, সেগুলোতে প্রতি ঘণ্টার উৎপাদন দক্ষতা অবিলম্বে বাড়াতে হবে। ওভারটাইম বা অপ্রয়োজনীয় খরচ নিয়ন্ত্রণ করে লাইনের দৈনিক আয়ের সাথে খরচের ব্যবধান কমিয়ে আনার জন্য ফ্লোর ম্যানেজমেন্টকে সর্বোচ্চ তৎপর হওয়ার নির্দেশনা দেওয়া হলো।
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. OFFICIAL SIGNATURES BLOCK (STRICT A4 BOTTOM) ── */}
        <div className="pt-3 border-t-2 border-gray-300 mt-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1 mt-6">
                <p className="text-[10px] font-bold text-gray-800">প্রস্তুতকারক</p>
                <p className="text-[8.5px] text-gray-500">ডাটা অ্যানালিস্ট / এমআইএস</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1 mt-6">
                <p className="text-[10px] font-bold text-gray-800">প্রোডাকশন ইনচার্জ</p>
                <p className="text-[8.5px] text-gray-500">ফ্লোর অপারেশনস</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1 mt-6">
                <p className="text-[10px] font-bold text-gray-800">হিসাব ও অর্থ বিভাগ</p>
                <p className="text-[8.5px] text-gray-500">অ্যাকাউন্টস বিভাগ</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1 mt-6">
                <p className="text-[10px] font-bold text-gray-800">কারখানা পরিচালক / জিএম</p>
                <p className="text-[8.5px] text-gray-500">বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[8.5px] text-gray-400 font-bengali">
            <span>বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ • ফ্যাক্টরি অপারেশনস ম্যানেজমেন্ট সিস্টেম</span>
            <span>প্রতিবেদন তৈরির সময়: {toBn(format(new Date(), 'yyyy-MM-dd HH:mm:ss'))}</span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
