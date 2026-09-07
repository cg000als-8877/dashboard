"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Factory, 
  History, 
  MoreHorizontal,
  X
} from 'lucide-react';
import { cn } from './Sidebar';

function AnimatedWatchIcon({ isHourly, isClicked }) {
  return (
    <svg 
      width="19" 
      height="19" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={cn(
        "transition-transform duration-300",
        isClicked ? "scale-115 rotate-12" : "group-hover:scale-110"
      )}
    >
      {/* Top Watch Strap */}
      <path 
        d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05" 
        strokeWidth="1.8"
        className="opacity-75"
      />
      
      {/* Bottom Watch Strap */}
      <path 
        d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05" 
        strokeWidth="1.8"
        className="opacity-75"
      />
      
      {/* Watch Dial Face */}
      <circle 
        cx="12" 
        cy="12" 
        r="6.5" 
        fill={isHourly ? "currentColor" : "none"} 
        fillOpacity={isHourly ? 0.25 : 0}
        strokeWidth="2.2"
      />

      {/* Hour Hand */}
      <line 
        x1="12" 
        y1="12" 
        x2="14.2" 
        y2="10" 
        strokeWidth="2.1"
        style={{ transformOrigin: '12px 12px' }}
        className={cn(
          isHourly ? "animate-[spin_10s_linear_infinite]" : ""
        )}
      />

      {/* Minute Hand (Smooth continuous spin on Hourly / fast wind-up on click) */}
      <line 
        x1="12" 
        y1="12" 
        x2="12" 
        y2="7.2" 
        strokeWidth="1.9"
        style={{ transformOrigin: '12px 12px' }}
        className={cn(
          isClicked 
            ? "animate-[spin_0.4s_linear_infinite]" 
            : isHourly 
              ? "animate-[spin_2s_linear_infinite]" 
              : "group-hover:animate-[spin_1.5s_linear_infinite]"
        )}
      />

      {/* Center Watch Pin */}
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function MobileBottomNav({ isOthersOpen, onToggleOthers, onOthersClose }) {
  const pathname = usePathname();
  const [clickedHourly, setClickedHourly] = useState(false);

  const isDashboard = pathname === '/';
  const isLines = pathname === '/lines' || pathname.startsWith('/lines/');
  const isHourly = pathname === '/hourly';
  const isArchive = pathname === '/archive' || pathname.startsWith('/archive/');
  const isOthers = isOthersOpen;

  const handleHourlyClick = () => {
    setClickedHourly(true);
    setTimeout(() => setClickedHourly(false), 900);
    onOthersClose?.();
  };

  return (
    <div className="md:hidden fixed bottom-3 inset-x-0 mx-auto w-[86%] max-w-[335px] z-50 pointer-events-auto select-none font-sans animate-[fade-up_0.3s_ease-out]">
      <div className="relative w-full h-[54px] flex items-center justify-center">
        
        {/* Deep Background Pill with Smooth Curved Center Scoop SVG */}
        <svg
          viewBox="0 0 500 70"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        >
          <path
            d="M 35 0 L 204 0 C 218 0, 224 32, 250 32 C 276 32, 282 0, 296 0 L 465 0 A 35 35 0 0 1 500 35 A 35 35 0 0 1 465 70 L 35 70 A 35 35 0 0 1 0 35 A 35 35 0 0 1 35 0 Z"
            fill="var(--color-bg-card)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Floating Center Elevated Circle ("HOURLY") */}
        <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <Link
            href="/hourly"
            onClick={handleHourlyClick}
            className={cn(
              "relative w-9 h-9 rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer group border-2 border-[var(--color-bg-card)] bg-[var(--color-primary)] text-[var(--color-on-primary)]",
              isHourly
                ? "shadow-[0_0_20px_var(--color-primary-glow-hover)] ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-bg-card)] scale-105"
                : "hover:scale-105 shadow-[0_6px_18px_var(--color-primary-glow)]"
            )}
            aria-label="Hourly Output"
          >
            <AnimatedWatchIcon isHourly={isHourly} isClicked={clickedHourly} />
          </Link>
        </div>

        {/* 5 Navigation Columns */}
        <nav className="relative z-20 grid grid-cols-5 w-full h-full items-center px-1">
          
          {/* 1. DASHBOARD */}
          <Link
            href="/"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            <LayoutDashboard 
              size={16}
              strokeWidth={isDashboard ? 2.5 : 2}
              fill={isDashboard ? "currentColor" : "none"}
              className={cn(
                "mb-0.5 transition-colors",
                isDashboard ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )} 
            />
            <span 
              className={cn(
                "text-[7.5px] sm:text-[8px] uppercase font-bold tracking-tight leading-none transition-colors",
                isDashboard ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )}
            >
              DASHBOARD
            </span>
          </Link>

          {/* 2. LINES */}
          <Link
            href="/lines"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            <Factory 
              size={16}
              strokeWidth={isLines ? 2.5 : 2}
              fill={isLines ? "currentColor" : "none"}
              className={cn(
                "mb-0.5 transition-colors",
                isLines ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )} 
            />
            <span 
              className={cn(
                "text-[7.5px] sm:text-[8px] uppercase font-bold tracking-tight leading-none transition-colors",
                isLines ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )}
            >
              LINES
            </span>
          </Link>

          {/* 3. HOURLY (Center Column Label below cutout) */}
          <Link
            href="/hourly"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-end h-full pb-1.5 group active:scale-95 transition-transform cursor-pointer"
          >
            <span 
              className={cn(
                "text-[7.5px] sm:text-[8px] uppercase font-black tracking-tight leading-none transition-colors",
                isHourly ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-main)]"
              )}
            >
              HOURLY
            </span>
          </Link>

          {/* 4. ARCHIVE */}
          <Link
            href="/archive"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            <History 
              size={16}
              strokeWidth={isArchive ? 2.5 : 2}
              fill={isArchive ? "currentColor" : "none"}
              className={cn(
                "mb-0.5 transition-colors",
                isArchive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )} 
            />
            <span 
              className={cn(
                "text-[7.5px] sm:text-[8px] uppercase font-bold tracking-tight leading-none transition-colors",
                isArchive ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )}
            >
              ARCHIVE
            </span>
          </Link>

          {/* 5. OTHERS */}
          <button
            type="button"
            onClick={onToggleOthers}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            {isOthers ? (
              <X 
                size={16}
                strokeWidth={2.6}
                className="mb-0.5 text-[var(--color-primary)] transition-transform duration-200 rotate-90"
              />
            ) : (
              <MoreHorizontal 
                size={16}
                strokeWidth={2}
                className="mb-0.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors"
              />
            )}
            <span 
              className={cn(
                "text-[7.5px] sm:text-[8px] uppercase font-bold tracking-tight leading-none transition-colors",
                isOthers ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )}
            >
              OTHERS
            </span>
          </button>

        </nav>

      </div>
    </div>
  );
}

export default MobileBottomNav;
