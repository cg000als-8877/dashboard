"use client";

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, X, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { format, parseISO, getDaysInMonth, getDay } from 'date-fns';

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

export function BanglaDailyReportModal({
  isOpen,
  onClose,
  stats,
  dailyTrends = [],
  lines = [],
  activeMonthName = 'November',
  activeMonthYear = '2026'
}) {
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isOpen || !isMounted) return null;

  // ── 1. DATE COMPUTATIONS ────────────────────────────────────────────────
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

  // ── 2. METRIC VALUES ───────────────────────────────────────────────────
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

  // ── 3. RECOVERY TARGETS ────────────────────────────────────────────────
  const totalAmountToRecover = isOverallLoss ? currentTotalLoss : 0;
  const dailyTargetToRecover = remainingWorkingDays > 0 && totalAmountToRecover > 0
    ? Math.round(totalAmountToRecover / remainingWorkingDays)
    : 0;

  // ── 4. LINE PERFORMANCE SORTING ────────────────────────────────────────
  const activeLines = (lines || []).slice().sort((a, b) => a.id.localeCompare(b.id));

  // ── 5. NATIVE PRINT HANDLER ───────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ── 6. DIRECT PDF DOWNLOAD HANDLER (html2pdf) ─────────────────────────
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `Byzid_Apparels_Daily_Report_${lastDateStr}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.error('PDF Export failed, falling back to window.print():', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 md:p-6 no-print">
      
      {/* ── TOP ACTION BAR (HIDDEN IN PRINT) ── */}
      <div className="w-full max-w-4xl bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-xl shrink-0 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/15 flex items-center justify-center text-[var(--color-primary)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[var(--color-text-main)]">
              বাংলা দৈনিক পর্যবেক্ষণ ও লোকসান রিপোর্ট (PDF)
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[var(--color-text-muted)]">
              {lastDateStr} • ফ্লোর টেলিমেট্রি ও রিকভারি পূর্বাভাস
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Download PDF directly to device"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isExporting ? 'তৈরি হচ্ছে...' : 'ডাউনলোড PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / Save as PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── PRINT-AWARE STYLES INJECTION ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #bangla-daily-printable-report, #bangla-daily-printable-report * {
            visibility: visible !important;
          }
          #bangla-daily-printable-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 10mm 12mm !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
        }
      `}} />

      {/* ── ACTUAL PRINTABLE REPORT CONTAINER (A4 FORMAT) ── */}
      <div 
        id="bangla-daily-printable-report"
        ref={reportRef}
        className="w-full max-w-4xl bg-white text-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-200 select-text font-bengali"
        style={{ fontFamily: "'Noto Serif Bengali', serif" }}
      >
        
        {/* ── 1. CORPORATE HEADER ── */}
        <div className="border-b-2 border-gray-900 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-sm bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase mb-1">
                অফিসিয়াল দৈনিক প্রতিবেদন
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">
                বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-0.5">
                দৈনিক কারখানা পর্যবেক্ষণ ও লাইনভিত্তিক লোকসান বিশ্লেষণ রিপোর্ট
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-lg p-2.5 sm:text-right shrink-0">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">রিপোর্টের তারিখ</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {lastDayNum} {banglaMonth}, {activeMonthYear} ({lastDayBangla})
              </p>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                সময়কাল: ০১ - {lastDayNum} {banglaMonth} ({passedWorkingDays} কার্যদিবস)
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. TOP 5 FINANCIAL KPI CARDS ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              ১. সার্বিক আর্থিক চিত্র (তারিখ পর্যন্ত পুঞ্জীভূত ও সর্বশেষ দিন)
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
            
            {/* Card 1: Total Cost */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                তারিখ পর্যন্ত মোট খরচ
              </span>
              <span className="text-base sm:text-lg font-extrabold text-gray-900 mt-1">
                BDT {totalCost.toLocaleString()}
              </span>
              <span className="text-[9.5px] text-gray-500 mt-0.5">
                {passedWorkingDays} দিনের সার্বিক ফ্যাক্টরি ব্যয়
              </span>
            </div>

            {/* Card 2: Total Income */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                তারিখ পর্যন্ত মোট আয়
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-700 mt-1">
                BDT {totalIncome.toLocaleString()}
              </span>
              <span className="text-[9.5px] text-gray-500 mt-0.5">
                মোট উপার্জিত উৎপাদন মূল্য
              </span>
            </div>

            {/* Card 3: Total Loss to date */}
            <div className={`rounded-xl p-3 flex flex-col justify-between border-2 ${
              isOverallLoss ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {isOverallLoss ? 'মোট লোকসান (ঘাটতি)' : 'মোট নিট লাভ'}
                </span>
                {isOverallLoss ? <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <span className="text-lg sm:text-xl font-black mt-1">
                BDT {netProfit.toLocaleString()}
              </span>
              <span className="text-[9.5px] font-semibold text-rose-700 mt-0.5">
                কস্ট রিকভারি: {overallRecovery}%
              </span>
            </div>

            {/* Card 4: Average Per Day Loss */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                প্রতিদিনের গড় লোকসান
              </span>
              <span className={`text-base sm:text-lg font-extrabold mt-1 ${isAvgLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                BDT {avgDailyProfit.toLocaleString()}
              </span>
              <span className="text-[9.5px] text-gray-500 mt-0.5">
                দৈনিক ঘাটতির গড় হার
              </span>
            </div>

            {/* Card 5: Last Day Loss */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  সর্বশেষ দিনের লোকসান
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">
                  {lastDayNum} {banglaMonth.slice(0, 3)}
                </span>
              </div>
              <span className={`text-base sm:text-lg font-extrabold mt-1 ${isLastDayLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                BDT {lastDayProfit.toLocaleString()}
              </span>
              <span className="text-[9.5px] text-gray-600 mt-0.5">
                দিনের রিকভারি: {lastDayRecovery}%
              </span>
            </div>

          </div>
        </div>

        {/* ── 3. LINE-WISE PERFORMANCE & LOSS TABLE ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                ২. লাইনভিত্তিক সর্বশেষ দিনের পারফরম্যান্স ও লোকসানের পৃথক তালিকা
              </h2>
            </div>
            <span className="text-[11px] font-medium text-gray-500">
              সর্বশেষ কার্যদিবস: {lastDayNum} {banglaMonth}, {activeMonthYear}
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-300 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold">
                  <th className="py-2.5 px-3">লাইন (Line)</th>
                  <th className="py-2.5 px-3">চলতি আইটেম / স্টাইল</th>
                  <th className="py-2.5 px-2.5 text-right">দিনের উৎপাদন (Pcs)</th>
                  <th className="py-2.5 px-2.5 text-right">দিনের খরচ (BDT)</th>
                  <th className="py-2.5 px-2.5 text-right">দিনের আয় (BDT)</th>
                  <th className="py-2.5 px-3 text-right">দিনের নিট লোকসান / লাভ</th>
                  <th className="py-2.5 px-2.5 text-center">রিকভারি (%)</th>
                  <th className="py-2.5 px-3 text-right">মাসিক পুঞ্জীভূত লোকসান</th>
                  <th className="py-2.5 px-2.5 text-center">অবস্থা</th>
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
                      <td className="py-2.5 px-3 font-bold text-gray-900 whitespace-nowrap">
                        লাইন {line.id}
                      </td>
                      <td className="py-2.5 px-3 text-gray-800 font-medium max-w-[150px] truncate" title={line.item}>
                        {line.item || 'সাধারণ পোশাক'}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-semibold text-gray-900">
                        {dayProd.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-medium text-gray-700">
                        {dayCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-medium text-emerald-700">
                        {dayIncome.toLocaleString()}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isDayLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {dayProfit > 0 ? `+${dayProfit.toLocaleString()}` : dayProfit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-bold text-gray-800">
                        {line.lastDayCostRecovery}%
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${monthLoss < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {monthLoss.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold text-gray-900">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 uppercase">সর্বমোট (দিনের যোগফল)</td>
                  <td className="py-2.5 px-2.5 text-right font-black">
                    {activeLines.reduce((acc, l) => acc + (l.lastDayOutput || 0), 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-black">
                    {lastDayCost.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-black text-emerald-700">
                    {lastDayIncome.toLocaleString()}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-black ${isLastDayLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {lastDayProfit.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-black">
                    {lastDayRecovery}%
                  </td>
                  <td className={`py-2.5 px-3 text-right font-black ${isOverallLoss ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {netProfit.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── 4. CONCLUSION & RECOVERY FORECAST BOX ── */}
        <div className="bg-gradient-to-br from-gray-50 to-rose-50/40 border-2 border-gray-900 rounded-xl p-4 sm:p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
              ৩
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-950">
              উপসংহার ও রিকভারি পূর্বাভাস (Executive Conclusion & Recovery Plan)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {/* Box 1 */}
            <div className="bg-white border border-gray-300 rounded-lg p-3 text-center shadow-xs">
              <p className="text-[10px] font-bold uppercase text-gray-500">মাসে অবশিষ্ট কার্যদিবস</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                {remainingWorkingDays} দিন
              </p>
              <p className="text-[10.5px] text-gray-600 mt-0.5">
                (ক্যালেন্ডার বাকি {calendarDaysLeft} দিন)
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-rose-300 rounded-lg p-3 text-center shadow-xs">
              <p className="text-[10px] font-bold uppercase text-rose-700">মোট রিকভারি করতে হবে (ঘাটতি)</p>
              <p className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
                BDT {totalAmountToRecover.toLocaleString()}
              </p>
              <p className="text-[10.5px] text-rose-800 font-medium mt-0.5">
                {isOverallLoss ? 'ব্রেক-ইভেনে পৌঁছানোর লক্ষ্য' : 'বর্তমানে কারখানা লাভে রয়েছে'}
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-indigo-300 rounded-lg p-3 text-center shadow-xs">
              <p className="text-[10px] font-bold uppercase text-indigo-700">বাকি দিনগুলোতে দৈনিক লক্ষ্যমাত্রা</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-800 mt-1">
                BDT {dailyTargetToRecover.toLocaleString()} / দিন
              </p>
              <p className="text-[10.5px] text-indigo-900 font-medium mt-0.5">
                প্রতিদিন প্রয়োজনীয় অতিরিক্ত নিট আয়
              </p>
            </div>
          </div>

          {/* Bengali Detailed Conclusion Paragraph */}
          <div className="bg-white/80 border border-gray-300 rounded-lg p-3.5 text-xs text-gray-800 leading-relaxed font-medium space-y-2">
            <p>
              📌 <strong>বিশ্লেষণ ও পর্যালোচনা:</strong> চলতি {banglaMonth} মাসে এ পর্যন্ত {passedWorkingDays}টি কর্মদিবস অতিবাহিত হয়েছে। কারখানার সার্বিক ব্যয় BDT {totalCost.toLocaleString()}-এর বিপরীতে অর্জিত আয় BDT {totalIncome.toLocaleString()}, যার ফলে পুঞ্জীভূত নিট লোকসান দাঁড়িয়েছে <strong className="text-rose-700">BDT {netProfit.toLocaleString()}</strong> (কস্ট রিকভারি {overallRecovery}%, ঘাটতি {recoveryDeficitPct}%)।
            </p>
            <p>
              📌 <strong>রিকভারি পূর্বাভাস:</strong> চলতি মাসে আর মাত্র <strong>{remainingWorkingDays}টি কার্যদিবস</strong> বাকি রয়েছে। শূন্য লোকসানে (Break-Even) পৌঁছাতে হলে অবশিষ্ট দিনগুলোতে প্রতিদিন গড়ে অন্তত <strong className="text-indigo-800">BDT {dailyTargetToRecover.toLocaleString()}</strong> অতিরিক্ত নিট উদ্বৃত্ত নিশ্চিত করতে হবে।
            </p>
            <p>
              📌 <strong>জরুরি করণীয়:</strong> লাইনভিত্তিক পর্যবেক্ষণে দেখা যাচ্ছে যে বিশেষ করে যেসব লাইনে কস্ট রিকভারি ৫০%-এর নিচে রয়েছে, সেগুলোতে প্রতি ঘণ্টার উৎপাদন দক্ষতা অবিলম্বে বাড়াতে হবে। ওভারটাইম বা অপ্রয়োজনীয় খরচ নিয়ন্ত্রণ করে লাইনের দৈনিক আয়ের সাথে খরচের ব্যবধান কমিয়ে আনার জন্য ফ্লোর ম্যানেজমেন্টকে সর্বোচ্চ তৎপর হওয়ার নির্দেশনা দেওয়া হলো।
            </p>
          </div>
        </div>

        {/* ── 5. OFFICIAL SIGNATURES BLOCK ── */}
        <div className="pt-6 border-t-2 border-gray-300 mt-8">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1.5 mt-8">
                <p className="text-[11px] font-bold text-gray-800">প্রস্তুতকারক</p>
                <p className="text-[9.5px] text-gray-500">ডাটা অ্যানালিস্ট / এমআইএস</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1.5 mt-8">
                <p className="text-[11px] font-bold text-gray-800">প্রোডাকশন ইনচার্জ</p>
                <p className="text-[9.5px] text-gray-500">ফ্লোর অপারেশনস</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1.5 mt-8">
                <p className="text-[11px] font-bold text-gray-800">হিসাব ও অর্থ বিভাগ</p>
                <p className="text-[9.5px] text-gray-500">অ্যাকাউন্টস বিভাগ</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full border-t border-gray-400 pt-1.5 mt-8">
                <p className="text-[11px] font-bold text-gray-800">কারখানা পরিচালক / জিএম</p>
                <p className="text-[9.5px] text-gray-500">বাইজিদ অ্যাপারেলস (প্রাঃ) লিঃ</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-[9px] text-gray-400 font-mono">
            <span>Byzid Apparels (Pvt) Ltd • Factory Operations Intelligence System</span>
            <span>Generated: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
