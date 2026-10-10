"use client";

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  AlertOctagon, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Trophy, 
  AlertTriangle, 
  PieChart, 
  DollarSign, 
  Activity, 
  Calendar, 
  Zap, 
  Cpu, 
  Compass,
  Layers
} from 'lucide-react';
import { cn } from '@/components/layout/Sidebar';

// Icon map helper
const ICON_COMPONENTS = {
  AlertOctagon,
  Flame,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  AlertTriangle,
  PieChart,
  DollarSign,
  Activity,
  Calendar,
  Zap,
  Cpu,
  Compass,
  Layers,
  Sparkles
};

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
 * Enforces off-white (text-slate-200) and light greys (text-slate-400) with zero pure white fonts.
 */
function parseInsightItem(rawHtml, index) {
  const match = rawHtml.match(/^<strong>([^:]+):<\/strong>\s*(.*)$/i);
  const rawTitle = match ? match[1].trim() : 'INTELLIGENCE INSIGHT';
  const rawBody = match ? match[2].trim() : rawHtml;

  // Replace any pure white or text-main font occurrences with warm off-white (text-slate-200)
  const cleanBodyHtml = rawBody
    .replace(/text-\[var\(--color-text-main\)\]/g, 'text-slate-200 font-semibold')
    .replace(/text-white/g, 'text-slate-200');

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
    metricColor = 'text-rose-400';
    const m = rawBody.match(/BDT\s*([0-9,]+)/i);
    if (m) highlightMetric = `-BDT ${m[1]}`;
  } else if (upper.includes('SURPLUS')) {
    category = 'finance';
    tag = 'REVENUE';
    iconName = 'TrendingUp';
    badgeType = 'success';
    badgeLabel = 'SURPLUS';
    metricColor = 'text-emerald-400';
    const m = rawBody.match(/\+BDT\s*([0-9,]+)/i);
    if (m) highlightMetric = `+BDT ${m[1]}`;
  } else if (upper.includes('CASH BURN')) {
    category = 'finance';
    tag = 'CASH FLOW';
    iconName = 'Flame';
    badgeType = 'danger';
    badgeLabel = 'RUN RATE';
    metricColor = 'text-rose-400';
    const m = rawBody.match(/-BDT\s*([0-9,]+)\s*\/\s*day/i);
    if (m) highlightMetric = `-BDT ${m[1]} / day`;
  } else if (upper.includes('PROFIT RUN-RATE')) {
    category = 'finance';
    tag = 'CASH FLOW';
    iconName = 'TrendingUp';
    badgeType = 'success';
    badgeLabel = 'YIELD RATE';
    metricColor = 'text-emerald-400';
    const m = rawBody.match(/\+BDT\s*([0-9,]+)\s*\/\s*day/i);
    if (m) highlightMetric = `+BDT ${m[1]} / day`;
  } else if (upper.includes('COST RECOVERY GAP') || upper.includes('RECOVERY')) {
    category = 'finance';
    tag = 'RECOVERY';
    iconName = 'Target';
    badgeType = 'warning';
    badgeLabel = 'BENCHMARK';
    metricColor = 'text-amber-400';
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
    metricColor = 'text-rose-400';
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
    metricColor = 'text-amber-400';
    const m = rawBody.match(/BDT\s*([0-9,]+)/i);
    if (m) highlightMetric = `BDT ${m[1]}`;
  } else if (upper.includes('CM REVENUE SPREAD') || upper.includes('PRICING')) {
    category = 'lines';
    tag = 'UNIT MARGIN';
    iconName = 'DollarSign';
    badgeType = 'success';
    badgeLabel = 'HIGH YIELD';
    metricColor = 'text-emerald-400';
    const m = rawBody.match(/BDT\s*([0-9,]+)\/Dzn/i);
    if (m) highlightMetric = `BDT ${m[1]} / Dzn`;
  } else if (upper.includes('LINE EFFICIENCY SPREAD')) {
    category = 'lines';
    tag = 'DISPARITY';
    iconName = 'Activity';
    badgeType = 'info';
    badgeLabel = 'FLOOR SPREAD';
    metricColor = 'text-sky-400';
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
    metricColor = 'text-emerald-400';
    const m = rawBody.match(/\+([0-9,]+)\s*PCS\/day/i);
    if (m) highlightMetric = `+${m[1]} PCS / day`;
  } else if (upper.includes('ACTIVE LINE CAPACITY') || upper.includes('CAPACITY')) {
    category = 'production';
    tag = 'FLOOR STATUS';
    iconName = 'Cpu';
    badgeType = 'info';
    badgeLabel = 'CAPACITY';
    metricColor = 'text-sky-400';
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-glow)] flex items-center justify-center shrink-0 border-none">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-[0.16em] text-slate-200">
                System Intelligence
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Autonomous diagnostic telemetry & tactical executive actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-full bg-[var(--color-surface)]/70 text-[10.5px] font-bold text-slate-300 border-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{parsedItems.length} Live Insights</span>
          </div>
        </div>

        {/* Category Tabs (No stroke, minimal modern pill buttons with horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 mb-5 sm:mb-6 hide-scrollbar select-none">
          {CATEGORIES.map(cat => {
            const isSelected = activeTab === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-[12.5px] font-bold transition-all duration-200 cursor-pointer shrink-0 border-none outline-none flex items-center gap-1.5",
                  isSelected
                    ? "bg-[var(--color-primary)] text-slate-900 shadow-md font-extrabold active:scale-95"
                    : "bg-[var(--color-surface)]/60 text-slate-400 hover:text-slate-200 hover:bg-[var(--color-surface)]"
                )}
                aria-selected={isSelected}
              >
                <span>{cat.label}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-md font-mono shrink-0",
                  isSelected ? "bg-black/20 text-slate-900 font-bold" : "bg-black/20 text-slate-400"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stat Cards Grid (Every insight rendered inside an individual stroke-free Stat Card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5">
          {filteredItems.map(item => {
            const Icon = ICON_COMPONENTS[item.iconName] || Sparkles;

            // Theme-adaptive badge styling
            const badgeClasses = {
              danger: "bg-rose-500/15 text-rose-400",
              success: "bg-emerald-500/15 text-emerald-400",
              warning: "bg-amber-500/15 text-amber-400",
              info: "bg-sky-500/15 text-sky-400",
              primary: "bg-[var(--color-primary-glow)] text-[var(--color-primary)]"
            }[item.badgeType] || "bg-[var(--color-surface)] text-slate-400";

            const iconContainerClasses = {
              danger: "bg-rose-500/15 text-rose-400",
              success: "bg-emerald-500/15 text-emerald-400",
              warning: "bg-amber-500/15 text-amber-400",
              info: "bg-sky-500/15 text-sky-400",
              primary: "bg-[var(--color-primary-glow)] text-[var(--color-primary)]"
            }[item.badgeType] || "bg-[var(--color-surface)] text-slate-400";

            return (
              <div
                key={item.id}
                className="bg-[var(--color-surface)]/65 dark:bg-[var(--color-surface)]/40 hover:bg-[var(--color-surface)] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 border-none outline-none shadow-none group"
              >
                {/* Top Metatag Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border-none", iconContainerClasses)}>
                        <Icon size={14} className="shrink-0" />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 truncate">
                        {item.tag}
                      </span>
                    </div>

                    <span className={cn("px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider shrink-0 border-none", badgeClasses)}>
                      {item.badgeLabel}
                    </span>
                  </div>

                  {/* Title & Highlight Number */}
                  <div className="mb-2">
                    <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-200 tracking-tight leading-snug">
                      {item.displayTitle}
                    </h4>
                    {item.highlightMetric && (
                      <div className={cn("text-base sm:text-[17px] font-black tracking-tight mt-1", item.metricColor)}>
                        {item.highlightMetric}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Explanation with off-white and light greys (No pure white) */}
                <div 
                  className="text-xs sm:text-[12px] text-slate-300 dark:text-slate-400 font-medium leading-relaxed mt-1 flex-1 [&>span]:font-semibold [&>strong]:text-slate-200 [&>strong]:font-bold border-none"
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
