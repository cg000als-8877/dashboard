"use client";

import React, { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/components/layout/Sidebar';

export function CostRecoveryPie({ 
  percentage = 0, 
  isProfitable = false, 
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

  // Circle dimensions: radius 58, strokeWidth 12
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fillLevel / 100) * circumference;

  const pct = Number(percentage) || 0;
  const isCovered = isProfitable || pct >= 100;

  // Dynamic tone & status computation based on recovery percentage and profit
  let toneStatus = {
    line2: "Costs exceed income",
    line3: "Profit is currently out of range!",
    line3Color: "text-[var(--color-danger-text)]",
    centerLabel: "Progress",
    strokeColor: "var(--color-primary)"
  };

  if (isCovered) {
    if (pct >= 120) {
      toneStatus = {
        line2: "Income far exceeds expenses",
        line3: "Strong positive profit margin achieved!",
        line3Color: "text-[var(--color-success-text)]",
        centerLabel: "Recovered",
        strokeColor: "var(--color-success)"
      };
    } else {
      toneStatus = {
        line2: "Income surpasses expenses",
        line3: "Factory is operating in profit!",
        line3Color: "text-[var(--color-success-text)]",
        centerLabel: "Profitable",
        strokeColor: "var(--color-success)"
      };
    }
  } else if (pct >= 80) {
    toneStatus = {
      line2: "Approaching break-even",
      line3: "Almost covering total expenses!",
      line3Color: "text-amber-500 dark:text-amber-400",
      centerLabel: "Closing In",
      strokeColor: "var(--color-primary)"
    };
  }

  const defaultTitle = (
    <span className="inline-flex items-center justify-center gap-1 uppercase">
      <span>INCOME</span>
      <span className="italic font-normal lowercase opacity-90 mx-0.5">vs.</span>
      <span>EXPENSES</span>
    </span>
  );

  const defaultSubtitle = (
    <div className="flex flex-col items-center justify-center text-center mt-1 sm:mt-1.5 leading-tight">
      <span className={cn(
        "font-semibold whitespace-nowrap",
        isCovered ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]",
        compact ? "text-[8px] min-[350px]:text-[8.5px] min-[390px]:text-[9.5px] sm:text-[10.5px]" : "text-[11px] sm:text-xs xl:text-[13px]"
      )}>
        {toneStatus.line2}
      </span>
      <span className={cn(
        "font-bold whitespace-nowrap mt-0.5",
        toneStatus.line3Color,
        compact ? "text-[7.5px] min-[350px]:text-[8px] min-[390px]:text-[9px] sm:text-[10px]" : "text-[10px] sm:text-[11px] xl:text-xs"
      )}>
        {toneStatus.line3}
      </span>
    </div>
  );

  const displayTitle = title ?? defaultTitle;
  const displaySubtitle = subtitle ?? defaultSubtitle;

  return (
    <div className={cn("flex flex-col items-center justify-between w-full h-full relative select-none py-0.5", className)}>
      {/* SVG Pie / Circular Progress Ring - Thick Stroke, No Glow */}
      <div className={cn(
        "relative w-full aspect-square flex items-center justify-center my-auto",
        compact 
          ? "max-w-[116px] min-[380px]:max-w-[124px] sm:max-w-[136px]" 
          : "max-w-[150px] sm:max-w-[175px] md:max-w-[200px] xl:max-w-[230px]"
      )}>
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full transform -rotate-90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Track Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--color-border)"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-40"
          />

          {/* Active Progress Pie Stroke */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={toneStatus.strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Central Floating Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={cn(
            "font-black tracking-tight text-[var(--color-text-main)] leading-none",
            compact 
              ? "text-[22px] min-[350px]:text-[24px] sm:text-3xl" 
              : "text-2xl sm:text-3xl md:text-4xl xl:text-[42px]"
          )}>
            <AnimatedNumber value={Math.round(clamped)} suffix="%" />
          </span>
          <span className={cn(
            "font-extrabold uppercase tracking-widest text-[var(--color-text-secondary)]",
            compact 
              ? "text-[8px] min-[350px]:text-[8.5px] sm:text-[9.5px] mt-1" 
              : "text-[8px] sm:text-[9.5px] md:text-[11px] mt-1.5"
          )}>
            {toneStatus.centerLabel}
          </span>
        </div>
      </div>

      {/* Card Footer Title */}
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
