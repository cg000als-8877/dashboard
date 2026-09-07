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
import { useTheme } from '@/components/ThemeProvider';

function AnimatedWatchIcon({ isHourly, isClicked }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#CBD5E1" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={cn(
        "transition-transform duration-300 text-slate-300",
        isClicked ? "scale-115 rotate-12" : "group-hover:scale-110"
      )}
    >
      {/* Top Watch Strap */}
      <path 
        d="m16.2 6.6-.8-3.4a2 2 0 0 0-2-1.5h-2.8a2 2 0 0 0-2 1.5l-.8 3.4" 
        stroke="#94A3B8"
        strokeWidth="1.8"
        className="opacity-90"
      />
      
      {/* Bottom Watch Strap */}
      <path 
        d="m7.8 17.4.8 3.4a2 2 0 0 0 2 1.5h2.8a2 2 0 0 0 2-1.5l.8-3.4" 
        stroke="#94A3B8"
        strokeWidth="1.8"
        className="opacity-90"
      />
      
      {/* Watch Dial Face (Enlarged) */}
      <circle 
        cx="12" 
        cy="12" 
        r="7.2" 
        stroke="#CBD5E1"
        fill={isHourly ? "#CBD5E1" : "none"} 
        fillOpacity={isHourly ? 0.22 : 0}
        strokeWidth="2.2"
      />

      {/* Hour Hand */}
      <line 
        x1="12" 
        y1="12" 
        x2="15" 
        y2="9.5" 
        stroke="#E2E8F0"
        strokeWidth="2.2"
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
        y2="6.2" 
        stroke="#E2E8F0"
        strokeWidth="2"
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
      <circle cx="12" cy="12" r="1.3" fill="#E2E8F0" />
    </svg>
  );
}

export function MobileBottomNav({ isOthersOpen, onToggleOthers, onOthersClose }) {
  const pathname = usePathname();
  const [clickedHourly, setClickedHourly] = useState(false);
  const { mode } = useTheme();
  const isLight = mode === 'light';

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
    <div className="md:hidden fixed bottom-3 inset-x-0 mx-auto w-[94%] max-w-[390px] z-50 pointer-events-auto select-none font-sans animate-[fade-up_0.3s_ease-out]">
      <div className="relative w-full h-[56px] flex items-center justify-center">
        
        {/* Ambient Depth Shadows (Deep in Dark Mode, Soft & Airy in Day Mode) */}
        {!isLight ? (
          <>
            <div className="absolute inset-x-3 -bottom-2 h-14 bg-black/90 blur-xl rounded-full pointer-events-none -z-10" />
            <div className="absolute inset-x-6 -bottom-1 h-10 bg-black/95 blur-md rounded-full pointer-events-none -z-10" />
          </>
        ) : (
          <div className="absolute inset-x-4 -bottom-1 h-8 bg-black/10 blur-md rounded-full pointer-events-none -z-10" />
        )}
        
        {/* Deep Background Pill with Smooth Curved Center Scoop SVG */}
        <svg
          viewBox="0 0 500 70"
          preserveAspectRatio="none"
          className={cn(
            "absolute inset-0 w-full h-full",
            isLight 
              ? "drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.06)]" 
              : "drop-shadow-[0_18px_38px_rgba(0,0,0,0.95)] filter drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]"
          )}
        >
          <path
            d="M 35 0 L 204 0 C 218 0, 224 32, 250 32 C 276 32, 282 0, 296 0 L 465 0 A 35 35 0 0 1 500 35 A 35 35 0 0 1 465 70 L 35 70 A 35 35 0 0 1 0 35 A 35 35 0 0 1 35 0 Z"
            fill="var(--color-bg-card)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Floating Center Elevated Circle ("HOURLY") */}
        <div className="absolute -top-[23px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <Link
            href="/hourly"
            onClick={handleHourlyClick}
            className={cn(
              "relative w-10 h-10 rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer group border-2 border-[var(--color-bg-card)] bg-[var(--color-primary)] text-white",
              isLight 
                ? "shadow-[0_4px_12px_rgba(0,0,0,0.15)]" 
                : "shadow-[0_10px_24px_rgba(0,0,0,0.7)]",
              isHourly
                ? "shadow-[0_0_22px_var(--color-primary-glow-hover)] ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-bg-card)] scale-105"
                : "hover:scale-105 shadow-[0_6px_18px_var(--color-primary-glow)]"
            )}
            aria-label="Hourly Output"
          >
            <AnimatedWatchIcon isHourly={isHourly} isClicked={clickedHourly} />
          </Link>
        </div>

        {/* 5 Navigation Columns */}
        <nav className="relative z-20 grid grid-cols-5 w-full h-full items-center px-1.5">
          
          {/* 1. DASHBOARD */}
          <Link
            href="/"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            <LayoutDashboard 
              size={18}
              strokeWidth={isDashboard ? 2.6 : 2}
              fill={isDashboard ? "currentColor" : "none"}
              className={cn(
                "mb-0.5 transition-colors",
                isDashboard ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )} 
            />
            <span 
              className={cn(
                "text-[8.5px] uppercase tracking-wide leading-none transition-colors",
                isDashboard ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] font-extrabold group-hover:text-[var(--color-text-main)]"
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
              size={18}
              strokeWidth={isLines ? 2.6 : 2}
              fill={isLines ? "currentColor" : "none"}
              className={cn(
                "mb-0.5 transition-colors",
                isLines ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )} 
            />
            <span 
              className={cn(
                "text-[8.5px] uppercase tracking-wide leading-none transition-colors",
                isLines ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] font-extrabold group-hover:text-[var(--color-text-main)]"
              )}
            >
              LINES
            </span>
          </Link>

          {/* 3. HOURLY (Center Column Label below cutout) */}
          <Link
            href="/hourly"
            onClick={handleHourlyClick}
            className="flex flex-col items-center justify-end h-full pb-1.5 group active:scale-95 transition-transform cursor-pointer"
          >
            <span 
              className={cn(
                "text-[8.5px] uppercase tracking-wide leading-none transition-colors",
                isHourly ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-secondary)] font-black group-hover:text-[var(--color-text-main)]"
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
              size={18}
              strokeWidth={isArchive ? 2.6 : 2}
              fill={isArchive ? "currentColor" : "none"}
              className={cn(
                "mb-0.5 transition-colors",
                isArchive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )} 
            />
            <span 
              className={cn(
                "text-[8.5px] uppercase tracking-wide leading-none transition-colors",
                isArchive ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] font-extrabold group-hover:text-[var(--color-text-main)]"
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
                size={18}
                strokeWidth={2.6}
                className="mb-0.5 text-[var(--color-primary)] transition-transform duration-200 rotate-90"
              />
            ) : (
              <MoreHorizontal 
                size={18}
                strokeWidth={2.2}
                className="mb-0.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors"
              />
            )}
            <span 
              className={cn(
                "text-[8.5px] uppercase tracking-wide leading-none transition-colors",
                isOthers ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] font-extrabold group-hover:text-[var(--color-text-main)]"
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
