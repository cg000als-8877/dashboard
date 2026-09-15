"use client";

import React, { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/components/layout/Sidebar';

export function CostRecoveryJar({ percentage = 0, isProfitable = false, className = "" }) {
  const [fillLevel, setFillLevel] = useState(0);
  const clamped = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  useEffect(() => {
    // Trigger smooth fill-up animation on load / change
    const timeout = setTimeout(() => {
      setFillLevel(clamped);
    }, 150);
    return () => clearTimeout(timeout);
  }, [clamped]);

  // Jar internal coordinate bounds: bottom is y=138, max liquid top is y=42 (total fluid height = 96px)
  const maxFluidHeight = 96;
  const currentHeight = (fillLevel / 100) * maxFluidHeight;
  const liquidTopY = 138 - currentHeight;

  return (
    <div className={cn("flex flex-col items-center justify-between w-full h-full relative select-none", className)}>
      {/* SVG Glass Jar Graphic - No square container clipping / no box drop-shadow */}
      <div className="relative w-full max-w-[130px] sm:max-w-[160px] md:max-w-[190px] xl:max-w-[220px] aspect-[120/135] flex items-center justify-center my-auto">
        <svg
          viewBox="0 0 120 150"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Jar Interior Clip Path (Constrains fluid strictly inside the glass cavity) */}
            <clipPath id="jar-fluid-clip">
              <path d="M38 36 H82 C82 36 84 50 94 58 C104 66 104 122 104 130 C104 138 96 142 86 142 H34 C24 142 16 138 16 130 C16 122 16 66 26 58 C36 50 38 36 38 36 Z" />
            </clipPath>

            {/* Fluid Front Gradient linked to dynamic Theme variables */}
            <linearGradient id="jar-liquid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isProfitable ? "var(--color-success)" : "var(--color-primary)"} stopOpacity="0.95" />
              <stop offset="100%" stopColor={isProfitable ? "var(--color-success-text)" : "var(--color-primary)"} stopOpacity="0.75" />
            </linearGradient>

            {/* Back Wave Gradient for 3D depth linked to dynamic Theme variables */}
            <linearGradient id="jar-liquid-back" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isProfitable ? "var(--color-success)" : "var(--color-primary)"} stopOpacity="0.45" />
              <stop offset="100%" stopColor={isProfitable ? "var(--color-success)" : "var(--color-primary)"} stopOpacity="0.65" />
            </linearGradient>

            {/* Glass Highlight Gradient */}
            <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="40%" stopColor="white" stopOpacity="0.15" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Jar Background Body (Translucent glass cavity using theme surface) */}
          <path
            d="M38 36 H82 C82 36 84 50 94 58 C104 66 104 122 104 130 C104 138 96 142 86 142 H34 C24 142 16 138 16 130 C16 122 16 66 26 58 C36 50 38 36 38 36 Z"
            fill="var(--color-surface)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
            className="transition-colors"
          />

          {/* 2. Liquid Container (Clipped to Jar outline) */}
          <g clipPath="url(#jar-fluid-clip)">
            {/* Ambient liquid body */}
            <rect
              x="0"
              y={liquidTopY}
              width="120"
              height={currentHeight + 30}
              fill="url(#jar-liquid-grad)"
              className="transition-all duration-1000 ease-out"
              opacity="0.92"
            />

            {/* Secondary Oscillating Back Wave */}
            <g
              className="transition-all duration-1000 ease-out"
              style={{ transform: `translateY(${liquidTopY}px)` }}
            >
              <path
                d="M -60 0 Q -30 -6 0 0 T 60 0 T 120 0 T 180 0 V 130 H -60 Z"
                fill="url(#jar-liquid-back)"
                className="animate-wave-slow"
              />
            </g>

            {/* Primary Front Fluid Wave */}
            <g
              className="transition-all duration-1000 ease-out"
              style={{ transform: `translateY(${liquidTopY}px)` }}
            >
              <path
                d="M -60 0 Q -30 6 0 0 T 60 0 T 120 0 T 180 0 V 130 H -60 Z"
                fill="url(#jar-liquid-grad)"
                className="animate-wave-fast"
              />
              {/* Foam/crest highlight line */}
              <path
                d="M -60 0 Q -30 6 0 0 T 60 0 T 120 0 T 180 0"
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.6"
                fill="none"
                className="animate-wave-fast"
              />
            </g>

            {/* Rising micro bubbles inside fluid */}
            {fillLevel > 15 && (
              <>
                <circle cx="45" cy={liquidTopY + currentHeight * 0.6} r="2.5" fill="white" opacity="0.6" className="animate-bubble-1" />
                <circle cx="75" cy={liquidTopY + currentHeight * 0.4} r="2" fill="white" opacity="0.65" className="animate-bubble-2" />
                <circle cx="58" cy={liquidTopY + currentHeight * 0.75} r="3" fill="white" opacity="0.55" className="animate-bubble-3" />
              </>
            )}
          </g>

          {/* 3. Glass Highlights and Jar Outlines (Front Layer) */}
          <path
            d="M38 36 H82 C82 36 84 50 94 58 C104 66 104 122 104 130 C104 138 96 142 86 142 H34 C24 142 16 138 16 130 C16 122 16 66 26 58 C36 50 38 36 38 36 Z"
            fill="none"
            stroke="var(--color-border-strong, var(--color-border))"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Left Vertical Glass Reflection Curved Streak */}
          <path
            d="M24 64 C20 74 20 120 25 130"
            stroke="url(#glass-reflection)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Subtle Rim Reflection */}
          <path
            d="M96 66 C98 74 98 120 95 128"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bottom Glass Base Thickness */}
          <path
            d="M28 136 C38 140 82 140 92 136"
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            fill="none"
          />

          {/* Jar Neck Ring / Collar */}
          <rect
            x="34"
            y="28"
            width="52"
            height="8"
            rx="3"
            fill="var(--color-bg-card-hover, var(--color-bg-card))"
            stroke="var(--color-border)"
            strokeWidth="2"
          />

          {/* Jar Lid / Cap */}
          <rect
            x="30"
            y="18"
            width="60"
            height="12"
            rx="4"
            fill="var(--color-bg-card-hover, var(--color-bg-card))"
            stroke="var(--color-border-strong, var(--color-border))"
            strokeWidth="2"
          />
          {/* Lid highlight line */}
          <line
            x1="35"
            y1="22"
            x2="85"
            y2="22"
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Measurement Tick Marks on the Glass */}
          <line x1="28" y1="65" x2="34" y2="65" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="28" y1="88" x2="38" y2="88" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="28" y1="112" x2="34" y2="112" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>

        {/* Central Floating Percentage Display - High Legibility across all Themes */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 pointer-events-none">
          <span className="font-black text-2xl sm:text-3xl md:text-4xl xl:text-[42px] tracking-tight text-[var(--color-text-main)] [filter:var(--shadow-text)] leading-none drop-shadow-sm">
            <AnimatedNumber value={Math.round(clamped)} suffix="%" />
          </span>
          <span className="text-[8px] sm:text-[9.5px] md:text-[11px] font-black uppercase tracking-widest text-[var(--color-text-main)] [filter:var(--shadow-text)] mt-1 drop-shadow-sm">
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

      {/* SVG Keyframe Animation Styles */}
      <style jsx>{`
        @keyframes wave-fast {
          0% { transform: translateX(0); }
          50% { transform: translateX(-30px); }
          100% { transform: translateX(0); }
        }
        @keyframes wave-slow {
          0% { transform: translateX(0); }
          50% { transform: translateX(25px); }
          100% { transform: translateX(0); }
        }
        @keyframes bubble-rise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          40% { opacity: 0.65; }
          100% { transform: translateY(-35px) scale(1.1); opacity: 0; }
        }
        .animate-wave-fast {
          animation: wave-fast 3.5s ease-in-out infinite;
        }
        .animate-wave-slow {
          animation: wave-slow 5.5s ease-in-out infinite;
        }
        .animate-bubble-1 {
          animation: bubble-rise 3s ease-in infinite;
        }
        .animate-bubble-2 {
          animation: bubble-rise 3.8s ease-in infinite 1s;
        }
        .animate-bubble-3 {
          animation: bubble-rise 2.8s ease-in infinite 0.5s;
        }
      `}</style>
    </div>
  );
}
