"use client";

import React, { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/components/layout/Sidebar';

function formatK(num) {
  const n = Math.abs(Number(num) || 0);
  if (n >= 1000000) {
    return (n / 1000000).toFixed(2) + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K';
  }
  return n.toLocaleString();
}

export function CostRecoveryPie({ 
  percentage = 0, 
  isProfitable = false, 
  totalIncome = 0,
  totalCost = 0,
  netProfit = 0,
  compact = false,
  title,
  subtitle,
  className = "" 
}) {
  const [fillLevel, setFillLevel] = useState(0);
  const clamped = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFillLevel(clamped);
    }, 100);
    return () => clearTimeout(timeout);
  }, [clamped]);

  const pct = Number(percentage) || 0;
  const isCovered = isProfitable || pct >= 100;

  // Dynamic tone & status computation based on recovery percentage and profit
  let toneStatus;
  if (isCovered || pct >= 100) {
    if (pct >= 120) {
      toneStatus = {
        statusTag: "Surplus Covered",
        statusTagColor: "text-[var(--color-success-text)]",
        line3: "Strong positive profit margin achieved!",
        line3Color: "text-[var(--color-success-text)]",
      };
    } else {
      toneStatus = {
        statusTag: "Target Covered",
        statusTagColor: "text-[var(--color-success-text)]",
        line3: "Factory is operating in profit!",
        line3Color: "text-[var(--color-success-text)]",
      };
    }
  } else if (pct >= 85) {
    toneStatus = {
      statusTag: "Closing Gap",
      statusTagColor: "text-[var(--color-warning-text,var(--color-warning))]",
      line3: "Closing in on break-even recovery!",
      line3Color: "text-[var(--color-warning-text,var(--color-warning))]",
    };
  } else if (pct >= 65) {
    toneStatus = {
      statusTag: "Recovering",
      statusTagColor: "text-[var(--color-text-secondary)]",
      line3: "Steadily recovering production costs",
      line3Color: "text-[var(--color-text-secondary)]",
    };
  } else if (pct >= 45) {
    toneStatus = {
      statusTag: "Deficit Gap",
      statusTagColor: "text-[var(--color-danger-text,var(--color-danger))]",
      line3: "Deficit gap remains significant",
      line3Color: "text-[var(--color-danger-text,var(--color-danger))]",
    };
  } else {
    toneStatus = {
      statusTag: "Recovery Deficit",
      statusTagColor: "text-[var(--color-danger-text,var(--color-danger))]",
      line3: "Profit is currently out of range!",
      line3Color: "text-[var(--color-danger-text,var(--color-danger))]",
    };
  }

  const defaultTitle = (
    <span className="inline-flex items-center justify-center gap-1 uppercase">
      <span>INCOME</span>
      <span className="italic font-normal lowercase opacity-90 mx-0.5">vs.</span>
      <span>EXPENSES</span>
    </span>
  );

  const recoveryLabel = isCovered && Math.round(pct) >= 100
    ? (Math.round(pct) > 100 ? `COST RECOVERED ${Math.round(pct)}% • SURPLUS` : `100% COST RECOVERED • BREAK-EVEN`)
    : `COST RECOVERED ${Math.round(clamped)}% ONLY`;

  const defaultSubtitle = (
    <div className="flex flex-col items-center justify-center text-center mt-1 sm:mt-1.5 leading-tight">
      <span className={cn(
        "uppercase whitespace-nowrap transition-colors duration-300",
        isCovered ? "text-[var(--color-success-text)] font-extrabold" : "text-[var(--color-text-secondary)] font-semibold",
        compact ? "text-[8px] min-[350px]:text-[8.5px] min-[390px]:text-[9.5px] sm:text-[10.5px]" : "text-[11px] sm:text-xs xl:text-[13px]"
      )}>
        {recoveryLabel}
      </span>
      <span className={cn(
        "font-normal italic whitespace-nowrap mt-0.5 transition-colors duration-300",
        toneStatus.line3Color,
        compact ? "text-[8.5px] sm:text-[9px]" : "text-[10px] sm:text-[11px] xl:text-xs"
      )}>
        {toneStatus.line3}
      </span>
    </div>
  );

  const displayTitle = title ?? defaultTitle;
  const displaySubtitle = subtitle ?? defaultSubtitle;

  const litCount = Math.round((fillLevel / 100) * 10);

  return (
    <div className={cn("flex flex-col items-center justify-between w-full h-full relative select-none py-1", className)}>
      {/* Battery System Body */}
      <div className="w-full flex-1 flex items-center justify-center my-auto min-h-[110px] sm:min-h-[135px] px-1">
        <div className="flex items-center justify-center gap-3.5 sm:gap-5 w-full">
          {/* Battery Vertical Tower */}
          <div className="flex flex-col items-center shrink-0">
            {/* Top Terminal Cap */}
            <div className="w-3.5 sm:w-4.5 h-1 sm:h-1.5 rounded-t-xs bg-[var(--color-border-strong,var(--color-border))] border-t border-x border-[var(--color-border)] mb-0.5 transition-colors" />
            
            {/* Battery Segment Stack Enclosure */}
            <div className="p-1 sm:p-1.5 rounded-xl bg-[var(--color-bg-main)]/70 border border-[var(--color-border)] flex flex-col-reverse gap-1 shadow-inner backdrop-blur-xs transition-colors">
              {Array.from({ length: 10 }).map((_, idx) => {
                const blockIndex = idx + 1;
                const isLit = blockIndex <= litCount;
                const isTopActive = blockIndex === litCount;

                // Color tiering according to energy recovery level using Theme tokens
                let blockStyle = {};
                let blockClass = "";

                if (isLit) {
                  if (blockIndex >= 9) {
                    // Surplus / Target zone: Success Theme Token
                    blockStyle = {
                      backgroundColor: 'var(--color-success)',
                      boxShadow: '0 0 10px var(--color-success-glow, rgba(16, 185, 129, 0.6))',
                    };
                    blockClass = "border border-white/30 dark:border-white/20";
                  } else if (blockIndex >= 6) {
                    // Mid / Approaching break-even zone: Warning Theme Token
                    blockStyle = {
                      backgroundColor: 'var(--color-warning)',
                      boxShadow: '0 0 10px var(--color-warning-glow, rgba(251, 191, 36, 0.6))',
                    };
                    blockClass = "border border-white/30 dark:border-white/20";
                  } else {
                    // Low / Deficit zone: Danger Theme Token
                    blockStyle = {
                      backgroundColor: 'var(--color-danger)',
                      boxShadow: '0 0 10px var(--color-danger-glow, rgba(239, 68, 68, 0.6))',
                    };
                    blockClass = "border border-white/30 dark:border-white/20";
                  }
                } else {
                  // Unlit slots: fully visible & themed in both Dark and Light modes across all palettes
                  blockClass = "bg-[var(--color-surface)] border border-[var(--color-border)]/50";
                }

                return (
                  <div
                    key={idx}
                    style={isLit ? blockStyle : undefined}
                    className={cn(
                      "w-8 min-[380px]:w-9.5 sm:w-11 h-2 sm:h-2.5 rounded-[2px] transition-all duration-300 relative overflow-hidden",
                      blockClass
                    )}
                  >
                    {/* Micro shimmer shine on the top active bar */}
                    {isTopActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right-Side Metrics & Status */}
          <div className="flex flex-col items-start justify-center select-none">
            {/* Big Recovery Percentage */}
            <span className={cn(
              "font-black tracking-tight leading-none text-2xl sm:text-3xl [filter:var(--shadow-text)] transition-colors duration-300",
              isCovered ? "text-[var(--color-success-text)]" : "text-[var(--color-text-main)]"
            )}>
              <AnimatedNumber value={Math.round(fillLevel)} suffix="%" />
            </span>

            {/* Dynamic Status Tag */}
            <span className={cn(
              "text-[8px] sm:text-[9.5px] uppercase tracking-wider font-black mt-1 transition-colors duration-300",
              toneStatus.statusTagColor
            )}>
              {toneStatus.statusTag}
            </span>

            {/* Income & Cost breakdown */}
            <div className="mt-2 pt-1.5 border-t border-[var(--color-border)] flex flex-col gap-0.5 text-[8.5px] sm:text-[9.5px] min-w-[100px]">
              <span className="text-[var(--color-text-muted)] flex items-center justify-between gap-2">
                <span>Income:</span>
                <strong className="text-[var(--color-text-main)] font-bold font-mono">
                  BDT {formatK(totalIncome)}
                </strong>
              </span>
              <span className="text-[var(--color-text-muted)] flex items-center justify-between gap-2">
                <span>Cost:</span>
                <strong className="text-[var(--color-text-secondary)] font-bold font-mono">
                  BDT {formatK(totalCost)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Title & Subtitle */}
      <div className={cn(
        "flex flex-col items-center text-center w-full mt-auto",
        compact ? "pt-1 pb-0.5 px-0.5" : "mt-2 pb-1"
      )}>
        <h4 className={cn(
          "font-black uppercase text-[var(--color-text-main)] text-center leading-none w-full",
          compact 
            ? "text-[8.5px] min-[350px]:text-[9px] min-[390px]:text-[10px] sm:text-[11.5px] tracking-tight whitespace-nowrap" 
            : "text-[13px] sm:text-[14px] md:text-[15px] xl:text-[16px] tracking-wider leading-tight"
        )}>
          {displayTitle}
        </h4>
        {typeof displaySubtitle === 'string' ? (
          <p className={cn(
            "text-[var(--color-text-muted)] font-medium leading-tight",
            compact ? "text-[8.5px] sm:text-[9.5px] mt-1 max-w-[160px]" : "text-[10px] sm:text-[11px] md:text-xs font-semibold mt-1"
          )}>
            {displaySubtitle}
          </p>
        ) : (
          displaySubtitle
        )}
      </div>
    </div>
  );
}
