"use client";

import React, { useState, useMemo } from 'react';
import { cn } from '@/components/layout/Sidebar';

// Available Intelligence Categories
const CATEGORIES = [
  { id: 'all', label: 'All Telemetry' },
  { id: 'finance', label: 'Financials' },
  { id: 'production', label: 'Production' },
  { id: 'lines', label: 'Line Performance' },
  { id: 'strategy', label: 'Executive Strategy' },
];

/**
 * Parses raw insight HTML string into a structured intelligence card object.
 * Preserves high-contrast theme typography across both Light (Day) and Dark (Night) modes.
 */
function parseInsightItem(rawHtml, index) {
  const match = rawHtml.match(/^<strong>([^:]+):<\/strong>\s*(.*)$/i);
  const rawTitle = match ? match[1].trim() : 'INTELLIGENCE INSIGHT';
  const rawBody = match ? match[2].trim() : rawHtml;

  // Clean body HTML ensuring any raw pure-white classes adapt to theme text colors
  const cleanBodyHtml = rawBody
    .replace(/text-white/g, 'text-[var(--color-text-main)]');

  let category = 'finance';
  let tag = 'FINANCE';
  let iconName = 'Flame';
  let badgeType = 'warning';
  let badgeLabel = 'ADVISORY';
  let highlightMetric = '';
  let metricColor = 'text-[var(--color-primary)]';

  const upper = rawTitle.toUpperCase();

  if (upper.includes('LOSS ALERT') || upper.includes('CRITICAL')) {
    category = 'finance';
    tag = 'DEFICIT';
    iconName = 'AlertOctagon';
    badgeType = 'danger';
    badgeLabel = 'CRITICAL';
    metricColor = 'text-rose-600 dark:text-rose-400';
    const m = rawBody.match(/BDT\s*([0-9,]+)/i);
    if (m) highlightMetric = `-BDT ${m[1]}`;
  } else if (upper.includes('SURPLUS')) {
    category = 'finance';
    tag = 'REVENUE';
    iconName = 'TrendingUp';
    badgeType = 'success';
    badgeLabel = 'SURPLUS';
    metricColor = 'text-emerald-600 dark:text-emerald-400';
    const m = rawBody.match(/\+BDT\s*([0-9,]+)/i);
    if (m) highlightMetric = `+BDT ${m[1]}`;
  } else if (upper.includes('CASH BURN')) {
    category = 'finance';
    tag = 'CASH FLOW';
    iconName = 'Flame';
    badgeType = 'danger';
    badgeLabel = 'RUN RATE';
    metricColor = 'text-rose-600 dark:text-rose-400';
    const m = rawBody.match(/-BDT\s*([0-9,]+)\s*\/\s*day/i);
    if (m) highlightMetric = `-BDT ${m[1]} / day`;
  } else if (upper.includes('PROFIT RUN-RATE')) {
    category = 'finance';
    tag = 'CASH FLOW';
    iconName = 'TrendingUp';
    badgeType = 'success';
    badgeLabel = 'YIELD RATE';
    metricColor = 'text-emerald-600 dark:text-emerald-400';
    const m = rawBody.match(/\+BDT\s*([0-9,]+)\s*\/\s*day/i);
    if (m) highlightMetric = `+BDT ${m[1]} / day`;
  } else if (upper.includes('COST RECOVERY GAP') || upper.includes('RECOVERY')) {
    category = 'finance';
    tag = 'RECOVERY';
    iconName = 'Target';
    badgeType = 'warning';
    badgeLabel = 'BENCHMARK';
    metricColor = 'text-amber-600 dark:text-amber-400';
    const m = rawBody.match(/([0-9.]+)%/);
    if (m) highlightMetric = `${m[1]}% Overall`;
  } else if (upper.includes('VOLUME LEADERSHIP')) {
    category = 'production';
    tag = 'VOLUME';
    iconName = 'Trophy';
    badgeType = 'primary';
    badgeLabel = 'TOP PRODUCER';
    metricColor = 'text-[var(--color-primary)]';
    const m = rawBody.match(/([0-9,]+)\s*PCS/i);
    if (m) highlightMetric = `${m[1]} PCS`;
  } else if (upper.includes('HIGHEST DEFICIT') || upper.includes('DEFICIT CONTRIBUTOR')) {
    category = 'lines';
    tag = 'LINE DEFICIT';
    iconName = 'AlertTriangle';
    badgeType = 'danger';
    badgeLabel = 'HIGH DEFICIT';
    metricColor = 'text-rose-600 dark:text-rose-400';
    const lineMatch = rawBody.match(/LINE\s*([A-D])/i);
    const amtMatch = rawBody.match(/-BDT\s*([0-9,]+)/i);
    if (lineMatch && amtMatch) highlightMetric = `Line ${lineMatch[1]} (-BDT ${amtMatch[1]})`;
    else if (lineMatch) highlightMetric = `Line ${lineMatch[1]}`;
  } else if (upper.includes('OVERHEAD CONCENTRATION')) {
    category = 'finance';
    tag = 'EXPENSES';
    iconName = 'PieChart';
    badgeType = 'warning';
    badgeLabel = 'OVERHEAD';
    metricColor = 'text-amber-600 dark:text-amber-400';
    const m = rawBody.match(/BDT\s*([0-9,]+)/i);
    if (m) highlightMetric = `BDT ${m[1]}`;
  } else if (upper.includes('CM REVENUE SPREAD') || upper.includes('PRICING')) {
    category = 'lines';
    tag = 'UNIT MARGIN';
    iconName = 'DollarSign';
    badgeType = 'success';
    badgeLabel = 'HIGH YIELD';
    metricColor = 'text-emerald-600 dark:text-emerald-400';
    const m = rawBody.match(/BDT\s*([0-9,]+)\/Dzn/i);
    if (m) highlightMetric = `BDT ${m[1]} / Dzn`;
  } else if (upper.includes('LINE EFFICIENCY SPREAD')) {
    category = 'lines';
    tag = 'DISPARITY';
    iconName = 'Activity';
    badgeType = 'info';
    badgeLabel = 'FLOOR SPREAD';
    metricColor = 'text-sky-600 dark:text-sky-400';
    highlightMetric = 'Spread Variance';
  } else if (upper.includes('LATEST DAY PRODUCTION')) {
    category = 'production';
    tag = 'DAILY OUTPUT';
    iconName = 'Calendar';
    badgeType = 'primary';
    badgeLabel = 'LATEST SHIFT';
    metricColor = 'text-[var(--color-primary)]';
    const m = rawBody.match(/([0-9,]+)\s*PCS/i);
    if (m) highlightMetric = `${m[1]} PCS`;
  } else if (upper.includes('BREAKEVEN')) {
    category = 'production';
    tag = 'TARGET';
    iconName = 'Zap';
    badgeType = 'success';
    badgeLabel = 'BREAKEVEN';
    metricColor = 'text-emerald-600 dark:text-emerald-400';
    const m = rawBody.match(/\+([0-9,]+)\s*PCS\/day/i);
    if (m) highlightMetric = `+${m[1]} PCS / day`;
  } else if (upper.includes('ACTIVE LINE CAPACITY') || upper.includes('CAPACITY')) {
    category = 'production';
    tag = 'FLOOR STATUS';
    iconName = 'Cpu';
    badgeType = 'info';
    badgeLabel = 'CAPACITY';
    metricColor = 'text-sky-600 dark:text-sky-400';
    const m = rawBody.match(/([0-9]+)\s*of\s*([0-9]+)\s*lines/i);
    if (m) highlightMetric = `${m[1]} / ${m[2]} Lines Active`;
  } else if (upper.includes('STRATEGIC DIRECTIVE') || upper.includes('DIRECTIVE')) {
    category = 'strategy';
    tag = 'EXECUTIVE';
    iconName = 'Compass';
    badgeType = 'primary';
    badgeLabel = 'ACTION PLAN';
    metricColor = 'text-[var(--color-primary)]';
    highlightMetric = 'Executive Priority';
  }

  // Format title to title-case for clean reading
  const displayTitle = rawTitle
    .toLowerCase()
    .replace(/(?:^|\s)\w/g, c => c.toUpperCase());

  // Also include in secondary categories if strategic
  const secondaryCategories = [];
  if (upper.includes('DIRECTIVE') || upper.includes('BREAKEVEN') || upper.includes('CRITICAL') || upper.includes('GAP')) {
    secondaryCategories.push('strategy');
  }
  if (upper.includes('CAPACITY')) {
    secondaryCategories.push('lines');
  }

  return {
    id: `insight-${index}`,
    rawTitle,
    displayTitle,
    bodyHtml: cleanBodyHtml,
    primaryCategory: category,
    categories: [category, ...secondaryCategories],
    tag,
    iconName,
    badgeType,
    badgeLabel,
    highlightMetric,
    metricColor
  };
}

export function SystemIntelligenceCards({ insights = [] }) {
  const [activeTab, setActiveTab] = useState('all');

  const parsedItems = useMemo(() => {
    return insights.map((item, idx) => parseInsightItem(item, idx));
  }, [insights]);

  // Filter items by active category tab
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return parsedItems;
    return parsedItems.filter(item => item.categories.includes(activeTab));
  }, [parsedItems, activeTab]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: parsedItems.length };
    CATEGORIES.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = parsedItems.filter(item => item.categories.includes(cat.id)).length;
      }
    });
    return counts;
  }, [parsedItems]);

  if (!insights || insights.length === 0) return null;

  return (
    <div className="w-full">
      {/* Outer Container with NO stroke, purely elevated with theme backdrop */}
      <div className="bg-[var(--color-bg-card)] rounded-3xl p-4 sm:p-6 md:p-7 shadow-sm transition-all duration-300 border-none outline-none">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-[0.16em] text-[var(--color-text-main)]">
              System Intelligence
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] font-medium">
              Autonomous diagnostic telemetry & tactical executive actions
            </p>
          </div>

          <div className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-[var(--color-surface)] text-[10.5px] font-bold text-[var(--color-text-secondary)] border-none">
            <span>{parsedItems.length} Live Insights</span>
          </div>
        </div>

        {/* Category Tabs (No stroke, minimal small pill buttons stacking side by side with # sign on mobile) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6 select-none">
          {CATEGORIES.map(cat => {
            const isSelected = activeTab === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "flex items-center justify-between sm:justify-start gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10.5px] sm:text-[12.5px] font-bold transition-all duration-200 cursor-pointer border-none outline-none select-none flex-1 sm:flex-initial min-w-[calc(50%-6px)] sm:min-w-0",
                  isSelected
                    ? "bg-[var(--color-primary)] text-slate-900 shadow-md font-extrabold active:scale-95"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                )}
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className={cn(
                    "font-black text-[11px] sm:text-xs shrink-0",
                    isSelected ? "text-slate-900/80" : "text-[var(--color-primary)]"
                  )}>
                    #
                  </span>
                  <span className="truncate">{cat.label}</span>
                </div>
                <span className={cn(
                  "text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1.5",
                  isSelected ? "bg-black/20 text-slate-900 font-bold" : "bg-black/10 dark:bg-black/25 text-[var(--color-text-secondary)] font-semibold"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stat Cards Grid (Every insight rendered inside an individual stroke-free Stat Card with NO icons) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5">
          {filteredItems.map(item => {
            // Theme-adaptive badge styling
            const badgeClasses = {
              danger: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
              success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
              info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
              primary: "bg-[var(--color-primary-glow)] text-[var(--color-primary)]"
            }[item.badgeType] || "bg-[var(--color-surface)] text-[var(--color-text-secondary)]";

            return (
              <div
                key={item.id}
                className="bg-[var(--color-surface)]/80 dark:bg-[var(--color-surface)]/40 hover:bg-[var(--color-surface)] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 border-none outline-none shadow-none group"
              >
                {/* Top Metatag Row (No icon) */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-muted)] truncate">
                      {item.tag}
                    </span>

                    <span className={cn("px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider shrink-0 border-none", badgeClasses)}>
                      {item.badgeLabel}
                    </span>
                  </div>

                  {/* Title & Highlight Number */}
                  <div className="mb-2">
                    <h4 className="text-[13px] sm:text-[14px] font-extrabold text-[var(--color-text-main)] tracking-tight leading-snug">
                      {item.displayTitle}
                    </h4>
                    {item.highlightMetric && (
                      <div className={cn("text-base sm:text-[17px] font-black tracking-tight mt-1", item.metricColor)}>
                        {item.highlightMetric}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Explanation with high-contrast text */}
                <div 
                  className="text-xs sm:text-[12px] text-[var(--color-text-secondary)] font-medium leading-relaxed mt-1 flex-1 [&>span]:font-bold [&>strong]:text-[var(--color-text-main)] [&>strong]:font-bold border-none"
                  dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
