// English & Bengali (Bangla) translation dictionary with universal digit & currency conversion

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[0-9]/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

export function formatCurrencyValue(amount, lang = 'en', prefix = '') {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  const isBn = lang === 'bn';
  const formattedNum = Math.abs(Math.round(amount)).toLocaleString('en-US');
  const displayNum = isBn ? toBengaliDigits(formattedNum) : formattedNum;
  const sign = amount < 0 ? '-' : '';
  const currencySymbol = isBn ? '৳' : 'BDT';
  return `${prefix}${currencySymbol} ${sign}${displayNum}`;
}

export const translations = {
  en: {
    // Header & Company
    companyName: 'BYZID APPARELS PVT LTD',
    analystLabel: 'Analyst',
    analystName: 'ROFIQUL ISLAM ZIA (Merchandiser)',
    lastUpdated: 'Last Updated',
    systemOnline: 'System Online',
    oneIssue: '1 Issue',
    noIssues: 'No Issues',
    securityVerified: 'Security Verified',

    // Navigation
    home: 'Home',
    lines: 'Lines',
    hourly: 'Hourly',
    compare: 'Compare',
    analytics: 'Analytics',
    simulator: 'Simulator',
    archive: 'Archive',
    others: 'Others',
    systemIntelligence: 'System Intelligence',
    byzidProfile: 'Byzid Profile',
    allLinesOverview: 'All Lines Overview',

    // Theme & Mode
    themeAndStyle: 'Theme & Style',
    palettes: 'Palettes',
    backdrop: 'Backdrop',
    lightDay: 'Light (Day)',
    darkNight: 'Dark (Night)',
    active: 'Active',
    inactive: 'Inactive',
    optimal: 'Optimal',
    critical: 'Critical',

    // Months
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December'
    },
    monthsShort: {
      jan: 'JAN',
      feb: 'FEB',
      mar: 'MAR',
      apr: 'APR',
      may: 'MAY',
      jun: 'JUN',
      jul: 'JUL',
      aug: 'AUG',
      sep: 'SEP',
      oct: 'OCT',
      nov: 'NOV',
      dec: 'DEC'
    },
    live: 'LIVE',
    days: 'DAYS',
    daysLower: 'days',
    workingDays: 'working days',
    comparingSubline: 'Comparing {prev} (same days) with current month ({curr})',

    // KPIs & Financials
    factoryFinancials: 'FACTORY FINANCIALS',
    netLoss: 'NET LOSS',
    netProfit: 'NET PROFIT',
    avgDailyLoss: 'AVERAGE DAILY LOSS',
    avgDailyProfit: 'AVERAGE DAILY PROFIT',
    lastDayLoss: 'Last day loss',
    lastDayProfit: 'Last day profit',
    totalIncome: 'TOTAL INCOME',
    totalCost: 'TOTAL COST',
    income: 'INCOME',
    cost: 'COST',
    profit: 'PROFIT',
    deficit: 'DEFICIT',
    shortfall: 'SHORTFALL',
    moreLoss: 'more Loss',
    lessLoss: 'less Loss',
    moreProfit: 'more Profit',
    lessProfit: 'less Profit',
    moreRevenue: 'more Revenue',
    lessRevenue: 'less Revenue',
    moreCost: 'more Cost',
    lessCost: 'less Cost',
    comparedTo: 'compared to',
    perDay: '/ day',

    // Cost Recovery Donut
    costRecoveryAndMargin: 'COST RECOVERY & MARGIN',
    recovered: 'RECOVERED',
    toRecover: 'TO RECOVER',
    profitWord: 'PROFIT',
    neededToRecover: 'more needed to reach break-even',

    // Production Lines
    productionLines: 'PRODUCTION LINES',
    ofActive: 'of {total} ACTIVE',
    detailsLinesAndItems: 'Details lines and items',
    totalPcs: 'TOTAL PCS',
    pcs: 'PCS',
    lineSummary: 'LINE SUMMARY',
    viewFullDetails: 'VIEW FULL DETAILS',
    itemLabel: 'ITEM :',
    costRecoveryLabel: 'COST RECOVERY',
    lastDayInput: 'LAST DAY INPUT',
    dayOutput: 'DAY OUTPUT',
    dayIncome: 'DAY INCOME',
    dayNetLoss: 'DAY NET LOSS',
    dayNetProfit: 'DAY NET PROFIT',
    floorStatus: 'FLOOR STATUS',

    // Factory visual condition
    seeVisualCondition: 'see visual condition of factory',
    hideVisualCondition: 'hide visual condition of factory',

    // Analytics & System Intelligence
    analyticsTitle: 'Analytics',
    analyticsSubtitle: 'Comprehensive trends, cost efficiency breakdowns, and performance analytics.',
    systemIntelligenceTitle: 'System Intelligence',
    systemIntelligenceSubtitle: 'Autonomous diagnostic telemetry, operational anomalies, and tactical directives.',
    allTelemetry: 'All Telemetry',
    financials: 'Financials',
    production: 'Production',
    liveInsights: 'Live Insights',
    criticalLossAlert: 'Critical Loss Alert',
    dailyCashBurn: 'Daily Cash Burn',
    costRecoveryGap: 'Cost Recovery Gap',
    overall: 'Overall',

    // Common Buttons & Actions
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    downloadPdf: 'Download PDF',
    close: 'Close'
  },

  bn: {
    // Header & Company (Easy, natural Bengali)
    companyName: 'বাইজিদ অ্যাপারেলস প্রাঃ লিঃ',
    analystLabel: 'বিশ্লেষক',
    analystName: 'রফিকুল ইসলাম জিয়া (মার্চেন্ডাইজার)',
    lastUpdated: 'সর্বশেষ আপডেট',
    systemOnline: 'সিস্টেম অনলাইন',
    oneIssue: '১টি সমস্যা',
    noIssues: 'সব ঠিক আছে',
    securityVerified: 'নিরাপত্তা যাচাইকৃত',

    // Navigation
    home: 'হোম',
    lines: 'লাইন',
    hourly: 'ঘণ্টাভিত্তিক',
    compare: 'তুলনা',
    analytics: 'অ্যানালিটিক্স',
    simulator: 'সিমুলেটর',
    archive: 'আর্কাইভ',
    others: 'অন্যান্য',
    systemIntelligence: 'সিস্টেম ইন্টেলিজেন্স',
    byzidProfile: 'বাইজিদ প্রোফাইল',
    allLinesOverview: 'সব লাইনের হিসাব',

    // Theme & Mode
    themeAndStyle: 'থিম ও স্টাইল',
    palettes: 'রং ও প্যালেট',
    backdrop: 'ব্যাকড্রপ',
    lightDay: 'লাইট (দিন)',
    darkNight: 'ডার্ক (রাত)',
    active: 'চালু',
    inactive: 'বন্ধ',
    optimal: 'স্বাভাবিক',
    critical: 'সংকটজনক',

    // Months (Standard Bengali names)
    months: {
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
    },
    monthsShort: {
      jan: 'জানু',
      feb: 'ফেব্রু',
      mar: 'মার্চ',
      apr: 'এপ্রিল',
      may: 'মে',
      jun: 'জুন',
      jul: 'জুলাই',
      aug: 'আগস্ট',
      sep: 'সেপ্টে',
      oct: 'অক্টো',
      nov: 'নভে',
      dec: 'ডিসে'
    },
    live: 'লাইভ',
    days: 'দিন',
    daysLower: 'দিন',
    workingDays: 'কাজের দিন',
    comparingSubline: 'চলতি মাস ({curr})-এর সাথে {prev}-এর (একই দিন) তুলনা',

    // KPIs & Financials (Direct, simple factory terms)
    factoryFinancials: 'কারখানার আর্থিক হিসাব',
    netLoss: 'নিট ক্ষতি',
    netProfit: 'নিট লাভ',
    avgDailyLoss: 'দৈনিক গড় ক্ষতি',
    avgDailyProfit: 'দৈনিক গড় লাভ',
    lastDayLoss: 'শেষ দিনের ক্ষতি',
    lastDayProfit: 'শেষ দিনের লাভ',
    totalIncome: 'মোট আয়',
    totalCost: 'মোট খরচ',
    income: 'আয়',
    cost: 'খরচ',
    profit: 'লাভ',
    deficit: 'ঘাটতি',
    shortfall: 'ঘাটতি',
    moreLoss: 'বেশি ক্ষতি',
    lessLoss: 'কম ক্ষতি',
    moreProfit: 'বেশি লাভ',
    lessProfit: 'কম লাভ',
    moreRevenue: 'বেশি আয়',
    lessRevenue: 'কম আয়',
    moreCost: 'বেশি খরচ',
    lessCost: 'কম খরচ',
    comparedTo: 'তুলনায়',
    perDay: '/ দিন',

    // Cost Recovery Donut
    costRecoveryAndMargin: 'খরচ তোলা ও মার্জিন',
    recovered: 'উঠেছে',
    toRecover: 'বাকি আছে',
    profitWord: 'লাভ',
    neededToRecover: 'খরচ তুলতে বাকি',

    // Production Lines
    productionLines: 'প্রোডাকশন লাইন',
    ofActive: 'টির মধ্যে {active}টি চালু',
    detailsLinesAndItems: 'লাইন ও আইটেম বিবরণ',
    totalPcs: 'মোট পিস',
    pcs: 'পিস',
    lineSummary: 'লাইন সারসংক্ষেপ',
    viewFullDetails: 'বিস্তারিত দেখুন',
    itemLabel: 'আইটেম :',
    costRecoveryLabel: 'খরচ তোলা',
    lastDayInput: 'শেষ দিনের হিসাব',
    dayOutput: 'দিনের উৎপাদন',
    dayIncome: 'দিনের আয়',
    dayNetLoss: 'দিনের নিট ক্ষতি',
    dayNetProfit: 'দিনের নিট লাভ',
    floorStatus: 'ফ্লোর স্ট্যাটাস',

    // Factory visual condition
    seeVisualCondition: 'কারখানার অবস্থা দেখুন',
    hideVisualCondition: 'কারখানার অবস্থা লুকান',

    // Analytics & System Intelligence
    analyticsTitle: 'অ্যানালিটিক্স',
    analyticsSubtitle: 'আর্থিক ট্রেন্ড, খরচ তোলার হিসাব এবং পারফরম্যান্স বিবরণী।',
    systemIntelligenceTitle: 'সিস্টেম ইন্টেলিজেন্স',
    systemIntelligenceSubtitle: 'স্বয়ংক্রিয় ডায়াগনস্টিক তথ্য, অপারেশনাল সমস্যা ও দিকনির্দেশনা।',
    allTelemetry: 'সব টেলিমেট্রি',
    financials: 'আর্থিক',
    production: 'উৎপাদন',
    liveInsights: 'লাইভ তথ্য',
    criticalLossAlert: 'জরুরি ক্ষতি সতর্কতা',
    dailyCashBurn: 'দৈনিক নগদ ঘাটতি',
    costRecoveryGap: 'খরচ তোলার ঘাটতি',
    overall: 'মোট',

    // Common Buttons & Actions
    search: 'অনুসন্ধান',
    filter: 'ফিল্টার',
    export: 'রপ্তানি',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    close: 'বন্ধ করুন'
  }
};
