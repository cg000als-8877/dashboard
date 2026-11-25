import { parseISO } from 'date-fns';

// Converts English digits to Bengali digits
export function toBn(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
}

// Formats a number with commas and Bengali digits (e.g. 197220 -> ১,৯৭,২২০)
export function formatBnNum(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '০';
  const rounded = Math.round(Number(num));
  const formattedWithCommas = Math.abs(rounded).toLocaleString('en-IN');
  const bnStr = toBn(formattedWithCommas);
  return rounded < 0 ? `-${bnStr}` : bnStr;
}

// Bengali Months map
const BENGALI_MONTHS = {
  january: 'জানুয়ারি',
  february: 'ফেব্রুয়ারি',
  march: 'মার্চ',
  april: 'এপ্রিল',
  may: 'মে',
  june: 'জুন',
  july: 'জুলাই',
  august: 'আগস্ট',
  september: 'সেপ্টেম্বর',
  october: 'অক্টোবর',
  november: 'নভেম্বর',
  december: 'ডিসেম্বর'
};

// Factory line names formatted as "এ (A)", "বি (B)", "সি (C)", "ডি (D)"
const BENGALI_LINE_LABELS = {
  A: 'এ (A)',
  B: 'বি (B)',
  C: 'সি (C)',
  D: 'ডি (D)'
};

/**
 * Generates a clean, smart, structured plain-text daily report formatted for WhatsApp & social media.
 * Matches the user's exact specification:
 * - Line-wise breakdown with ✅ *লাইন এ (A)*, machine count, daily production, CM, total cost, total income, difference
 * - Selected date summary: 📌 *[Day] [Month] | মোট সারসংক্ষেপ:*
 * - Month-to-date cumulative status: *[Month] ১ থেকে [Day], [Year] ([Days] দিন) সার্বিক অবস্থা:*
 * - Direct portal URL footer
 */
export function generateWhatsAppDailyReport({
  targetDate = null,
  dailyTrends = [],
  rawDailyProduction = [],
  lines = [],
  stats = null,
  activeMonthName = 'November',
  activeMonthYear = '2026'
}) {
  // ── 1. Target Date & Bengali Month Calculation ──
  const latestTrend = dailyTrends && dailyTrends.length > 0 ? dailyTrends[dailyTrends.length - 1] : null;
  const effectiveDateStr = targetDate || latestTrend?.date || `${activeMonthYear}-11-24`;

  let dateObj;
  try {
    dateObj = parseISO(effectiveDateStr);
  } catch (e) {
    dateObj = new Date(2026, 10, 24);
  }

  const selectedDayNum = dateObj.getDate();
  const monthKey = (activeMonthName || 'november').toLowerCase();
  const banglaMonth = BENGALI_MONTHS[monthKey] || activeMonthName;

  // ── 2. Cumulative Trends Up To Selected Date ──
  const trendsUpToDate = (dailyTrends || []).filter(t => t.date && t.date <= effectiveDateStr);
  const rawEntriesUpToDate = (rawDailyProduction || []).filter(d => d.date && d.date <= effectiveDateStr && d.status === 'ACTIVE');
  const uniqueActiveDates = Array.from(new Set(rawEntriesUpToDate.map(d => d.date)));

  let passedWorkingDays = 1;
  let totalCost = 0;
  let totalIncome = 0;
  let netProfit = 0;

  if (trendsUpToDate.length > 0) {
    passedWorkingDays = trendsUpToDate.length;
    totalCost = Math.round(trendsUpToDate.reduce((acc, t) => acc + (t.cost || 0), 0));
    totalIncome = Math.round(trendsUpToDate.reduce((acc, t) => acc + (t.income || 0), 0));
    netProfit = totalIncome - totalCost;
  } else if (rawEntriesUpToDate.length > 0) {
    passedWorkingDays = uniqueActiveDates.length || 1;
    totalCost = Math.round(rawEntriesUpToDate.reduce((acc, d) => acc + (d.total_cost || 0), 0));
    totalIncome = Math.round(rawEntriesUpToDate.reduce((acc, d) => acc + (d.total_income || 0), 0));
    netProfit = totalIncome - totalCost;
  } else {
    passedWorkingDays = stats?.workingDays || 1;
    totalCost = Math.round(stats?.totalCost || 0);
    totalIncome = Math.round(stats?.totalIncome || 0);
    netProfit = Math.round(stats?.netProfit || (totalIncome - totalCost));
  }

  // ── 3. Selected Day Trend & Line Breakdown ──
  const selectedDayTrend = (dailyTrends || []).find(t => t.date === effectiveDateStr);
  let selectedDayCost = selectedDayTrend ? Math.round(selectedDayTrend.cost || 0) : 0;
  let selectedDayIncome = selectedDayTrend ? Math.round(selectedDayTrend.income || 0) : 0;
  let selectedDayProfit = selectedDayTrend ? Math.round(selectedDayTrend.netProfit || (selectedDayIncome - selectedDayCost)) : 0;

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
        const style = entry.style?.trim?.() || entry.item?.trim?.() || '—';
        const workers = entry.worker_count || entry.machines || entry.machine_count || entry.workers || 0;
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
      const style = l.style?.trim?.() || l.item?.trim?.() || '—';

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

  // Filter only lines with activity on this day
  activeLines = activeLines.filter(l => (l.dayProd || 0) > 0 || (l.dayCost || 0) > 0 || (l.dayIncome || 0) > 0);
  activeLines.sort((a, b) => a.id.localeCompare(b.id));

  // If selectedDayCost is 0, sum from activeLines
  if (selectedDayCost === 0 && activeLines.length > 0) {
    selectedDayCost = activeLines.reduce((acc, l) => acc + (l.dayCost || 0), 0);
    selectedDayIncome = activeLines.reduce((acc, l) => acc + (l.dayIncome || 0), 0);
    selectedDayProfit = selectedDayIncome - selectedDayCost;
  }

  const totalActiveProdQty = activeLines.reduce((acc, l) => acc + (l.dayProd || 0), 0);

  // ── 4. Build Structured WhatsApp Text ──
  const linesFormatted = activeLines.map(l => {
    const diffSign = l.dayProfit < 0 ? '-' : (l.dayProfit > 0 ? '+' : '');
    const diffVal = `${diffSign}${formatBnNum(Math.abs(l.dayProfit))} টাকা`;
    const label = BENGALI_LINE_LABELS[l.id] || l.id;
    const styleDisplay = l.style && l.style !== '—' ? toBn(l.style) : '—';

    return [
      `✅ *লাইন ${label}*`,
      `• স্টাইল: ${styleDisplay}`,
      `• মেশিনের সংখ্যা: ${formatBnNum(l.workers)}`,
      `• দৈনিক উৎপাদন: ${formatBnNum(l.dayProd)} পিস`,
      `• সিএম (CM): ${formatBnNum(l.cmPerDzn)} টাকা`,
      `• মোট খরচ: ${formatBnNum(l.dayCost)} টাকা`,
      `• মোট আয়: ${formatBnNum(l.dayIncome)} টাকা`,
      `• পার্থক্য: *${diffVal}*`
    ].join('\n');
  }).join('\n\n');

  // Profit/Loss labels and values
  const todayDiffSign = selectedDayProfit < 0 ? '-' : (selectedDayProfit > 0 ? '+' : '');
  const todayProfitStr = `*${todayDiffSign}${formatBnNum(Math.abs(selectedDayProfit))} টাকা*`;
  const todayProfitLabel = selectedDayProfit < 0 ? 'মোট ক্ষতি:' : (selectedDayProfit > 0 ? 'মোট লাভ:' : 'মোট লাভ/ক্ষতি:');

  const cumDiffSign = netProfit < 0 ? '-' : (netProfit > 0 ? '+' : '');
  const cumProfitStr = `*${cumDiffSign}${formatBnNum(Math.abs(netProfit))} টাকা*`;
  const cumProfitLabel = netProfit < 0 ? 'মোট ক্ষতি:' : (netProfit > 0 ? 'মোট লাভ:' : 'মোট লাভ/ক্ষতি:');

  const reportText = [
    `*বায়েজিদ অ্যাপারেলস (প্রা.) লিমিটেড*`,
    `_দৈনিক কারখানার খরচের বিবরণ_`,
    `📅 *তারিখ:* ${toBn(selectedDayNum)} ${banglaMonth} ${toBn(activeMonthYear)}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    ` *লাইনভিত্তিক উৎপাদন ও খরচের বিবরণ:*`,
    ``,
    linesFormatted || `_(এই তারিখে কোনো লাইন উৎপাদন সক্রিয় ছিল না)_`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📌 *${toBn(selectedDayNum)} ${banglaMonth} | মোট সারসংক্ষেপ:*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `• মোট উৎপাদন: *${formatBnNum(totalActiveProdQty)} পিস*`,
    `• মোট খরচ: *${formatBnNum(selectedDayCost)} টাকা*`,
    `• মোট আয়: *${formatBnNum(selectedDayIncome)} টাকা*`,
    `• ${todayProfitLabel} ${todayProfitStr}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `*${banglaMonth} ১ থেকে ${toBn(selectedDayNum)}, ${toBn(activeMonthYear)} (${toBn(passedWorkingDays)} দিন) সার্বিক অবস্থা:*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `• মোট খরচ: *${formatBnNum(totalCost)} টাকা*`,
    `• মোট আয়: *${formatBnNum(totalIncome)} টাকা*`,
    `• ${cumProfitLabel} ${cumProfitStr}`,
    ``,
    `_আরো বিস্তারিত জানতে ভিজিট: https://bapldata.vercel.app_`
  ].join('\n');

  return reportText;
}

/**
 * Copies text to the clipboard with fallback for mobile browsers.
 */
export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // fallback
    }
  }

  // Fallback using textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return !!successful;
  } catch (err) {
    return false;
  }
}
