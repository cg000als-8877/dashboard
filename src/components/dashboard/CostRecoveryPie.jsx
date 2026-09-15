"use client";

import React, { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/components/layout/Sidebar';

export function CostRecoveryPie({ percentage = 0, isProfitable = false, className = "" }) {
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

  const strokeColor = isProfitable ? 'var(--color-success)' : 'var(--color-primary)';

  return (
    <div className={cn("flex flex-col items-center justify-between w-full h-full relative select-none", className)}>
      {/* SVG Pie / Circular Progress Ring - Thick Stroke, No Glow */}
      <div className="relative w-full max-w-[150px] sm:max-w-[175px] md:max-w-[200px] xl:max-w-[230px] aspect-square flex items-center justify-center my-auto">
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
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Central Floating Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-black text-2xl sm:text-3xl md:text-4xl xl:text-[42px] tracking-tight text-[var(--color-text-main)] leading-none">
            <AnimatedNumber value={Math.round(clamped)} suffix="%" />
          </span>
          <span className="text-[8px] sm:text-[9.5px] md:text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-text-secondary)] mt-1.5">
            {isProfitable ? 'Recovered' : 'Progress'}
          </span>
        </div>
      </div>

      {/* Card Footer Title */}
      <div className="flex flex-col items-center text-center mt-2 pb-1">
        <h4 className="text-[13px] sm:text-[14px] md:text-[16px] font-extrabold uppercase tracking-wider text-[var(--color-text-main)] leading-tight">
          Cost Recovery
        </h4>
        <p className="text-[10px] sm:text-[11px] md:text-xs text-[var(--color-text-muted)] font-semibold leading-tight mt-1">
          {percentage >= 100 ? 'Costs 100% recouped' : 'of overall factory cost'}
        </p>
      </div>
    </div>
  );
}
