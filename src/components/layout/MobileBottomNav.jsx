"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Factory, 
  History, 
  BarChart3,
  MoreHorizontal,
  X
} from 'lucide-react';
import { cn } from './Sidebar';
import { useTheme } from '@/components/ThemeProvider';

function getCenterDashboardConfig(visualTheme, isLight) {
  // 1. ABSTRACT THEME
  if (visualTheme === 'abstract') {
    if (isLight) {
      return {
        buttonClass: "border border-black/20 bg-[#18181B] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        activeRing: "ring-2 ring-black/40",
        iconColor: "#FFFFFF"
      };
    }
    return {
      buttonClass: "border border-white/60 bg-black text-gray-400 shadow-[0_4px_16px_rgba(0,0,0,0.6)]",
      activeRing: "ring-1 ring-white/70 shadow-[0_0_18px_rgba(255,255,255,0.25)]",
      iconColor: "#FFFFFF"
    };
  }

  // 2. ALL OTHER THEMES
  if (isLight) {
    return {
      buttonClass: "border-2 border-[var(--color-bg-card)] bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
      activeRing: "ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-bg-card)] shadow-[0_0_22px_var(--color-primary-glow-hover)]",
      iconColor: "#FFFFFF"
    };
  }

  // Dark/night mode
  const darkIconThemes = [
    'nordic-slate',
    'arcade-overdrive',
    'lime-ivory',
    'terminal',
    'verdant',
    'jungle-nebula'
  ];

  const useDarkIcon = darkIconThemes.includes(visualTheme);

  if (useDarkIcon) {
    return {
      buttonClass: "border-2 border-[var(--color-bg-card)] bg-[var(--color-primary)] shadow-[0_6px_18px_var(--color-primary-glow)]",
      activeRing: "ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-bg-card)] shadow-[0_0_22px_var(--color-primary-glow-hover)]",
      iconColor: "#0B0F19"
    };
  }

  return {
    buttonClass: "border-2 border-[var(--color-bg-card)] bg-[var(--color-primary)] shadow-[0_6px_18px_var(--color-primary-glow)]",
    activeRing: "ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-bg-card)] shadow-[0_0_22px_var(--color-primary-glow-hover)]",
    iconColor: "#FFFFFF"
  };
}

export function MobileBottomNav({ isOthersOpen, onToggleOthers, onOthersClose }) {
  const pathname = usePathname();
  const [clickedDashboard, setClickedDashboard] = useState(false);
  const { mode, visualTheme } = useTheme();
  const isLight = mode === 'light';
  const dashboardConfig = getCenterDashboardConfig(visualTheme, isLight);

  const isLines = pathname === '/lines' || pathname.startsWith('/lines/');
  const isArchive = pathname === '/archive' || pathname.startsWith('/archive/');
  const isDashboard = pathname === '/';
  const isAnalytics = pathname === '/analytics' || pathname.startsWith('/analytics/');
  const isOthers = isOthersOpen;

  const handleDashboardClick = () => {
    setClickedDashboard(true);
    setTimeout(() => setClickedDashboard(false), 600);
    onOthersClose?.();
  };

  return (
    <>
      {/* ── Progressive Blur Bed Under Mobile Floating Nav ───────────────────────── */}
      <div 
        aria-hidden="true"
        className="md:hidden fixed bottom-0 inset-x-0 h-36 pointer-events-none select-none z-30 overflow-hidden"
      >
        {/* Hardware-Accelerated Frosted Backdrop Blur with Gradual Fade Mask */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(28px) saturate(140%)',
            WebkitBackdropFilter: 'blur(28px) saturate(140%)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0.35) 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0.35) 85%, transparent 100%)',
          }}
        />

        {/* Dense Ambient Theme Tone Gradient Fade upwards */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, var(--color-bg-main) 0%, var(--color-bg-main) 30%, transparent 100%)',
            opacity: isLight ? 0.90 : 0.82,
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 70%, transparent 100%)',
          }}
        />
      </div>

      <div className="md:hidden fixed bottom-3 inset-x-0 mx-auto w-[94%] max-w-[390px] z-50 pointer-events-auto select-none font-sans animate-[fade-up_0.3s_ease-out]">
      <div className="relative w-full h-[56px] flex items-center justify-center">
        
        {/* Ambient Depth Shadows */}
        <div className={cn(
          "absolute inset-x-4 -bottom-1 h-8 rounded-full pointer-events-none -z-10 blur-md",
          isLight ? "bg-black/10" : "bg-black/25"
        )} />
        
        {/* Deep Background Pill with Smooth Curved Center Scoop SVG */}
        <svg
          viewBox="0 0 500 70"
          preserveAspectRatio="none"
          className={cn(
            "absolute inset-0 w-full h-full",
            isLight 
              ? "drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.06)]" 
              : "drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          )}
        >
          <path
            d="M 35 0 L 204 0 C 218 0, 224 32, 250 32 C 276 32, 282 0, 296 0 L 465 0 A 35 35 0 0 1 500 35 A 35 35 0 0 1 465 70 L 35 70 A 35 35 0 0 1 0 35 A 35 35 0 0 1 35 0 Z"
            fill="var(--color-bg-card)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Floating Center Elevated Circle ("DASHBOARD" - Default Opening Page) */}
        <div className="absolute -top-[23px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <Link
            href="/"
            onClick={handleDashboardClick}
            className={cn(
              "relative w-10 h-10 rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer group",
              dashboardConfig.buttonClass,
              isDashboard
                ? cn("scale-105", dashboardConfig.activeRing)
                : "hover:scale-105"
            )}
            aria-label="Dashboard"
          >
            <LayoutDashboard 
              size={20}
              strokeWidth={isDashboard ? 2.5 : 2}
              style={{ color: dashboardConfig.iconColor }}
              className={cn(
                "transition-transform duration-300",
                clickedDashboard ? "scale-125 rotate-6" : "group-hover:scale-110"
              )}
            />
          </Link>
        </div>

        {/* 5 Navigation Columns */}
        <nav className="relative z-20 grid grid-cols-5 w-full h-full items-center px-1.5">
          
          {/* 1. LINES (Takes Dashboard's former place) */}
          <Link
            href="/lines"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            <Factory 
              size={18}
              strokeWidth={isLines ? 2.5 : 1.8}
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

          {/* 2. ARCHIVE (Takes Lines' former place) */}
          <Link
            href="/archive"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            <History 
              size={18}
              strokeWidth={isArchive ? 2.5 : 1.8}
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

          {/* 3. DASHBOARD (Center Column Label below cutout) */}
          <Link
            href="/"
            onClick={handleDashboardClick}
            className="flex flex-col items-center justify-end h-full pb-1.5 group active:scale-95 transition-transform cursor-pointer"
          >
            <span 
              className={cn(
                "text-[8.5px] uppercase tracking-wide leading-none transition-colors",
                isDashboard ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-secondary)] font-black group-hover:text-[var(--color-text-main)]"
              )}
            >
              DASHBOARD
            </span>
          </Link>

          {/* 4. ANALYTICS (Takes Archive's former place) */}
          <Link
            href="/analytics"
            onClick={() => onOthersClose?.()}
            className="flex flex-col items-center justify-center h-full group active:scale-95 transition-transform cursor-pointer"
          >
            <BarChart3 
              size={18}
              strokeWidth={isAnalytics ? 2.5 : 1.8}
              className={cn(
                "mb-0.5 transition-colors",
                isAnalytics ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )} 
            />
            <span 
              className={cn(
                "text-[8.5px] uppercase tracking-wide leading-none transition-colors",
                isAnalytics ? "text-[var(--color-primary)] font-black" : "text-[var(--color-text-muted)] font-extrabold group-hover:text-[var(--color-text-main)]"
              )}
            >
              ANALYTICS
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
  </>
);
}

export default MobileBottomNav;
