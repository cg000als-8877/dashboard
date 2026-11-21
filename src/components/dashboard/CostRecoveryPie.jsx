"use client";

import React, { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/components/layout/Sidebar';

export function CostRecoveryPie({ 
  percentage = 0, 
  isProfitable = false, 
  totalIncome = 0, 
  totalCost = 0, 
  netProfit = 0, 
  compact = false, 
  hideFooter = false,
  className = "" 
}) {
  const [animated, setAnimated] = useState(false);

  // Trigger smooth arc drawing animation when website loads / component mounts
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setAnimated(true);
      }, 80);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const rawPct = Number(percentage) || 0;
  const isCovered = isProfitable || rawPct >= 100;

  // 1. Recovered percentage (capped at 100% for the recovery track)
  const recoveredPct = Math.min(Math.max(rawPct, 0), 100);

  // 2. Shortfall percentage (remaining to reach 100% break-even)
  const shortfallPct = isCovered ? 0 : Math.max(100 - rawPct, 0);
  const shortfallBdt = Math.max((totalCost || 0) - (totalIncome || 0), 0);

  // 3. Profit percentage (beyond 100% break-even)
  const profitPct = isCovered ? Math.max(rawPct - 100, 0) : 0;
  const profitBdt = (netProfit || 0) > 0 ? netProfit : 0;

  // Geometry: Clean circle, radius 31 in 80x80 viewBox
  const radius = 31;
  const circumference = 2 * Math.PI * radius; // ~194.78

  // Helper formatter for compact BDT display (e.g. BDT 1.13M, BDT 650k)
  const formatCompactBdt = (val) => {
    if (!val || val === 0) return 'BDT 0';
    const absVal = Math.abs(val);
    if (absVal >= 1000000) {
      return `BDT ${(absVal / 1000000).toFixed(2)}M`;
    }
    if (absVal >= 1000) {
      return `BDT ${(absVal / 1000).toFixed(0)}k`;
    }
    return `BDT ${Math.round(absVal).toLocaleString()}`;
  };

  const donuts = [
    {
      id: 'recovered',
      title: 'Recovered',
      pct: Math.round(recoveredPct),
      targetFill: recoveredPct,
      offset: circumference - (recoveredPct / 100) * circumference,
      strokeColor: 'var(--color-primary)',
      textColor: 'text-[var(--color-primary)]',
      valueStr: formatCompactBdt(totalIncome),
      sublabel: 'Income',
    },
    {
      id: 'shortfall',
      title: 'To Recover',
      pct: Math.round(shortfallPct),
      targetFill: shortfallPct,
      offset: circumference - (shortfallPct / 100) * circumference,
      strokeColor: 'var(--color-danger)',
      textColor: 'text-[var(--color-danger)]',
      valueStr: formatCompactBdt(shortfallBdt),
      sublabel: isCovered ? 'Target Met' : 'Shortfall',
    },
    {
      id: 'profit',
      title: 'Profit',
      pct: Math.round(profitPct),
      targetFill: profitPct,
      offset: isCovered && profitPct > 0 
        ? circumference - (Math.min(profitPct, 100) / 100) * circumference 
        : circumference,
      strokeColor: isCovered && profitPct > 0 ? 'var(--color-success)' : 'var(--color-border)',
      textColor: isCovered && profitPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-text-muted)]',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      valueStr: isCovered && profitBdt > 0 ? formatCompactBdt(profitBdt) : 'BDT 0',
      sublabel: isCovered && profitPct > 0 ? 'Net Margin' : 'Deficit',
    },
  ];

  return (
    <div className={cn("flex flex-col justify-center w-full h-full relative select-none py-0.5 sm:py-1", className)}>
      {/* 3 Donut Columns Grid (Spanning full length from left to right, generously filling the card) */}
      <div className="grid grid-cols-3 gap-1 min-[360px]:gap-2 sm:gap-3 w-full items-center">
        {donuts.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col items-center justify-center text-center min-w-0 px-0.5 w-full"
          >
            {/* SVG Donut Ring: Pure, Solid Circular Tracks (Scaled up on PC to generously fulfill the card) */}
            <div className="relative w-[80px] h-[80px] min-[360px]:w-[90px] min-[360px]:h-[90px] min-[390px]:w-[96px] min-[390px]:h-[96px] sm:w-[104px] sm:h-[104px] md:w-22 md:h-22 lg:w-26 lg:h-26 xl:w-30 xl:h-30 2xl:w-34 2xl:h-34 flex items-center justify-center my-0 sm:my-0.5 md:my-1.5">
              <svg 
                viewBox="0 0 80 80" 
                className="w-full h-full transform -rotate-90 overflow-visible" 
                fill="none"
              >
                {/* Clean Background Circular Track */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="var(--color-border)"
                  strokeWidth="6.5"
                  className="opacity-30"
                />

                {/* Solid Animated Progress Arc with Smooth Easing (No Tip Dots, No Border Outlines) */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={item.strokeColor}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={animated ? item.offset : circumference}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </svg>

              {/* Center Animated Metric Percentage (Scales with Donut Size) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={cn("text-[17px] min-[360px]:text-[19px] min-[390px]:text-[21px] sm:text-2xl md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-black tracking-tight leading-none", item.textColor)}>
                  <AnimatedNumber value={item.pct} suffix="%" />
                </span>
              </div>
            </div>

            {/* Label, BDT Value, and Context Subtitle */}
            <div className="flex flex-col items-center w-full mt-1 min-[360px]:mt-1.5 md:mt-2">
              <span className="text-[11px] min-[360px]:text-[12px] sm:text-xs md:text-[10.5px] lg:text-[11.5px] xl:text-xs font-black uppercase tracking-wider text-[var(--color-text-main)] whitespace-nowrap leading-tight text-center">
                {item.title}
              </span>
              <span className={cn(
                "text-[9.5px] min-[360px]:text-[10.5px] sm:text-[11.5px] md:text-[11px] lg:text-xs xl:text-[13px] font-extrabold whitespace-nowrap leading-tight mt-0.5 md:mt-1 text-center", 
                item.valueColor || item.textColor
              )}>
                {item.valueStr}
              </span>
              <span className="text-[8px] min-[360px]:text-[8.5px] sm:text-[9px] md:text-[8.5px] lg:text-[9.5px] xl:text-[10.5px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] whitespace-nowrap leading-tight mt-0.5 text-center">
                {item.sublabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Card Footer: Hidden on mobile, or when hideFooter is set on PC */}
      {!hideFooter && (
        <div className="hidden md:flex flex-col items-center text-center w-full mt-2 sm:mt-2.5 pt-1.5 border-t border-[var(--color-border)]/40 shrink-0">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none text-center">
            Cost Recovery & Margin
          </h4>
          <span className="text-[8px] min-[360px]:text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)] truncate w-full mt-1">
            {isCovered 
              ? "Factory fully recovered production costs and achieved net profit." 
              : `Recovered ${Math.round(recoveredPct)}% • ${Math.round(shortfallPct)}% more needed to reach break-even.`}
          </span>
        </div>
      )}
    </div>
  );
}
