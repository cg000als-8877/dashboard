"use client";

import React, { useEffect, useState, useId } from 'react';
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
  const rawId = useId();
  const uniqueId = rawId.replace(/[^a-zA-Z0-9-_]/g, '');
  const shimmerGradId = `pie-shimmer-grad-${uniqueId}`;

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

  // Calculate tip coordinates for live pulsating beacon (inside -rotate-90 SVG)
  const angleRad = ((fillLevel / 100) * 360 * Math.PI) / 180;
  const tipX = 80 + radius * Math.cos(angleRad);
  const tipY = 80 + radius * Math.sin(angleRad);

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

  const recoveryLabel = isCovered && Math.round(clamped) >= 100
    ? `COST RECOVERED ${Math.round(clamped)}%`
    : `COST RECOVERED ${Math.round(clamped)}% ONLY`;

  const defaultSubtitle = (
    <div className="flex flex-col items-center justify-center text-center mt-1 sm:mt-1.5 leading-tight">
      <span className={cn(
        "font-semibold uppercase whitespace-nowrap text-[var(--color-text-secondary)]",
        compact ? "text-[8px] min-[350px]:text-[8.5px] min-[390px]:text-[9.5px] sm:text-[10.5px]" : "text-[11px] sm:text-xs xl:text-[13px]"
      )}>
        {recoveryLabel}
      </span>
      <span className={cn(
        "font-normal italic whitespace-nowrap mt-0.5",
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
          className="w-full h-full transform -rotate-90 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes pie-stroke-glow-pulse {
              0%, 100% {
                opacity: 0.90;
                stroke-width: 12px;
              }
              50% {
                opacity: 1;
                stroke-width: 12.8px;
              }
            }
            @keyframes pie-shimmer-sweep {
              0% {
                opacity: 0.1;
              }
              50% {
                opacity: 0.55;
              }
              100% {
                opacity: 0.1;
              }
            }
            @keyframes pie-beacon-pulse {
              0%, 100% {
                transform: scale(0.9);
                opacity: 0.65;
              }
              50% {
                transform: scale(1.35);
                opacity: 0.2;
              }
            }
          `}</style>

          <defs>
            {/* SVG Gaussian Blur Filters for Mobile View (Soft feathered edges) */}
            <filter id={`${uniqueId}-pie-blur-wide`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" />
            </filter>
            <filter id={`${uniqueId}-pie-blur-medium`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" />
            </filter>
            <filter id={`${uniqueId}-pie-blur-core`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" />
            </filter>

            {/* Shimmer gradient that sweeps smoothly along the progress stroke with unique instance ID */}
            <linearGradient id={shimmerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0">
                <animate attributeName="offset" values="-0.3; 1.3" dur="2.6s" repeatCount="indefinite" />
              </stop>
              <stop offset="20%" stopColor="#FFFFFF" stopOpacity="0.45">
                <animate attributeName="offset" values="-0.1; 1.5" dur="2.6s" repeatCount="indefinite" />
              </stop>
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0">
                <animate attributeName="offset" values="0.1; 1.7" dur="2.6s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

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

          {/* ── MOBILE VIEW: Soft Blurry "Edges Don't Show Up" Progress Arc ── */}
          <g className="md:hidden">
            {/* Outer Aura: Wide Soft Diffusion */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={toneStatus.strokeColor}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out pointer-events-none"
              filter={`url(#${uniqueId}-pie-blur-wide)`}
              style={{
                opacity: 0.35,
                transformOrigin: '80px 80px',
              }}
            />

            {/* Mid Aura: Feathered Glow */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={toneStatus.strokeColor}
              strokeWidth="13"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out pointer-events-none"
              filter={`url(#${uniqueId}-pie-blur-medium)`}
              style={{
                opacity: 0.6,
                transformOrigin: '80px 80px',
              }}
            />

            {/* Core Arc: Softened with No Sharp Boundary */}
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
              filter={`url(#${uniqueId}-pie-blur-core)`}
              style={{
                opacity: 0.98,
                transformOrigin: '80px 80px',
              }}
            />

            {/* Soft Shimmer along the blurred stroke on mobile */}
            {fillLevel > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={`url(#${shimmerGradId})`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="pointer-events-none transition-all duration-1000 ease-out"
                filter={`url(#${uniqueId}-pie-blur-core)`}
                style={{
                  animation: 'pie-shimmer-sweep 2.6s ease-in-out infinite',
                }}
              />
            )}
          </g>

          {/* ── DESKTOP VIEW: Standard Crisp Progress Arc ── */}
          <g className="hidden md:block">
            {/* Active Progress Pie Stroke (Reliable CSS drop-shadow + continuous dual animations) */}
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
              style={{
                filter: `drop-shadow(0 0 6px ${isCovered ? 'rgba(16, 185, 129, 0.55)' : 'var(--color-primary-glow, rgba(0, 240, 255, 0.5))'})`,
                animation: 'pie-stroke-glow-pulse 2.4s ease-in-out infinite',
                transformOrigin: '80px 80px',
              }}
            >
              <animate
                attributeName="stroke-width"
                values="12; 12.8; 12"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.92; 1; 0.92"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Overlay Traveling Shimmer Wave along the stroke (Desktop) */}
            {fillLevel > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={`url(#${shimmerGradId})`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="pointer-events-none transition-all duration-1000 ease-out"
                style={{
                  animation: 'pie-shimmer-sweep 2.6s ease-in-out infinite',
                }}
              />
            )}
          </g>

          {/* Live Pulsing Beacon at Leading Tip */}
          {fillLevel > 2 && (
            <g className="pointer-events-none">
              {/* Outer expanding pulse halo */}
              <circle
                cx={tipX}
                cy={tipY}
                r="7"
                fill={toneStatus.strokeColor}
                style={{
                  animation: 'pie-beacon-pulse 1.8s ease-in-out infinite',
                  transformOrigin: `${tipX}px ${tipY}px`,
                }}
              >
                <animate attributeName="r" values="5; 10; 5" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.65; 0; 0.65" dur="1.8s" repeatCount="indefinite" />
              </circle>
              {/* Core bright white indicator */}
              <circle
                cx={tipX}
                cy={tipY}
                r="3.2"
                fill="#FFFFFF"
              >
                <animate attributeName="opacity" values="0.85; 1; 0.85" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
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
            "font-extrabold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none",
            compact 
              ? "text-[7px] min-[350px]:text-[7.5px] sm:text-[9px] -mt-1 sm:-mt-0.5" 
              : "text-[8px] sm:text-[9.5px] md:text-[11px] -mt-0.5 md:mt-1.5"
          )}>
            Progress
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
