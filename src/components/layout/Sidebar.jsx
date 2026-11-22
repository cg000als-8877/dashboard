"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Factory, 
  BarChart3, 
  Ship, 
  History, 
  Sun, 
  Moon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Palette, 
  GitCompare,
  Layers,
  Globe,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useKpiData } from '@/utils/useKpiData';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@/components/ThemeProvider';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Home', key: 'navDashboard', href: '/', icon: Home },
  { name: 'Hourly', key: 'navHourly', href: '/hourly', icon: Clock },
  { name: 'Lines', key: 'navLines', href: '/lines', icon: Factory, isExpandable: true },
  { name: 'Compare', key: 'navCompare', href: '/compare', icon: GitCompare },
  { name: 'Analytics', key: 'navAnalytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', key: 'navSimulator', href: '/simulator', icon: Ship },
  { name: 'Archive', key: 'navArchive', href: '/archive', icon: History },
  { name: 'Byzid Profile', key: 'navProfile', href: 'https://baplprofile.vercel.app/', icon: Globe, isExternal: true },
];

const DEFAULT_LINE_ITEMS = {
  'A': 'Sherpa Jacket, Boys Shirt',
  'B': 'Boxer, Boys Shirt',
  'C': 'Boxer',
  'D': "Fleece Hoodie"
};

const THEME_OPTIONS = [
  { id: 'royal', label: 'Royal', full: 'Royal' },
  { id: 'nordic-slate', label: 'Nordic', full: 'Nordic Slate' },
  { id: 'ember-tide', label: 'Ember', full: 'Ember Tide' },
  { id: 'abstract', label: 'Abstract', full: 'Abstract' },
  { id: 'arcade-overdrive', label: 'Arcade', full: 'Arcade Overdrive' },
  { id: 'verdant', label: 'Verdant', full: 'Verdant' },
  { id: 'lime-ivory', label: 'Lime', full: 'Lime Ivory' },
  { id: 'jungle-nebula', label: 'Jungle', full: 'Jungle Nebula' },
  { id: 'ocean-dark', label: 'Ocean', full: 'Ocean Dark' },
  { id: 'terminal', label: 'Terminal', full: 'Terminal (Night Shift)' },
  { id: 'gen-z', label: 'Gen-Z', full: 'Gen-Z Pink' },
];

const BG_OPTIONS = [
  { id: 'grain', label: 'Grain', full: 'Film Grain' },
  { id: 'bokeh', label: 'Bokeh', full: 'Lens Bokeh' },
  { id: 'aurora', label: 'Aurora', full: 'Atmospheric Aurora' },
  { id: 'spotlight', label: 'Spotlight', full: 'Interactive Spotlight' },
  { id: 'grid', label: 'Grid', full: 'Data Grid' },
  { id: 'honeycomb', label: 'Honeycomb', full: 'Honeycomb Matrix' },
  { id: 'textile', label: 'Textile', full: 'Textile Weave' },
  { id: 'topography', label: 'Topo', full: 'Topography Contours' },
  { id: 'dots', label: 'Matrix', full: 'Matrix Pattern' },
  { id: 'silk', label: 'Silk', full: 'Silk Waves' },
  { id: 'rays', label: 'Rays', full: 'Light Rays' },
  { id: 'starlight', label: 'Starlight', full: 'Starlight Constellation' },
  { id: 'st-blur', label: 'ST Blur', full: 'ST Blur Mist' },
  { id: 'solid', label: 'Solid', full: 'Clean Solid' },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { dailyTrends, lines } = useKpiData();
  const { 
    visualTheme, 
    setVisualTheme, 
    mode, 
    setMode, 
    bgEffect, 
    setBgEffect, 
    VISUAL_THEMES
  } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLinesExpanded, setIsLinesExpanded] = useState(true);
  const [appearanceTab, setAppearanceTab] = useState('themes'); // 'themes' | 'backgrounds'

  // Auto-expand lines dropdown if user navigates to a line page
  useEffect(() => {
    if (pathname.startsWith('/lines')) {
      setIsLinesExpanded(true);
    }
  }, [pathname]);

  let updateDate = 'November 1st, 2026';
  if (dailyTrends && dailyTrends.length > 0) {
    try {
      const endDate = dailyTrends[dailyTrends.length - 1]?.date;
      if (endDate) {
        updateDate = format(parseISO(endDate), 'MMMM do, yyyy');
      }
    } catch (e) {
      updateDate = 'November 1st, 2026';
    }
  }

  const currentThemeLabel = THEME_OPTIONS.find(t => t.id === visualTheme)?.label || 'Royal';
  const currentBgLabel = BG_OPTIONS.find(b => b.id === bgEffect)?.label || 'Grain';

  return (
    <aside className={cn(
      "flex flex-col transition-all duration-300 relative z-40 h-full",
      isCollapsed ? "w-[72px]" : "w-[245px]"
    )}>
      {/* Centered Minimal Floating Sidebar Toggle (Stroke-free) */}
      <button 
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-50 h-7 w-6 items-center justify-center rounded-full bg-[var(--color-bg-card)] shadow-lg hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)] transition-all duration-200 cursor-pointer border-0 outline-none"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
      </button>

      {/* Main Sidebar Box (Stroke-free, Soft Ambient Shadow) */}
      <div className="flex flex-col w-full h-full bg-[var(--color-bg-card)] shadow-[4px_0_24px_-4px_rgba(0,0,0,0.12)] dark:shadow-[6px_0_30px_-4px_rgba(0,0,0,0.45)] overflow-hidden">
        
        {/* Brand Header (Stroke-free) */}
        <div className={cn(
          "py-4 px-3 flex items-center justify-between shrink-0 mb-1 select-none", 
          isCollapsed ? "justify-center px-1" : ""
        )}>
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs">
              <Ship size={18} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-[13px] tracking-[0.12em] uppercase text-[var(--color-text-main)] leading-tight whitespace-nowrap transition-colors group-hover:text-[var(--color-primary)] font-display">
                  BYZID APPARELS
                </span>
                <span className="text-[8.5px] text-[var(--color-text-muted)] font-bold tracking-[0.3em] uppercase">
                  PVT LTD
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 overflow-y-auto hide-scrollbar px-2.5 py-1">
          <div className={cn("mb-2 px-2 transition-all duration-300 select-none", isCollapsed ? "text-center px-0" : "")}>
            <p className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
              {isCollapsed ? "Nav" : "Main Navigation"}
            </p>
          </div>

          {navItems.map((item) => {
            const isLinesItem = item.name === 'Lines';
            const isActive = isLinesItem 
              ? pathname === '/lines' || pathname.startsWith('/lines/')
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            // Collapsed view icons
            if (isCollapsed) {
              const linkProps = item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  title={item.name}
                  {...linkProps}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-200 relative group justify-center p-2.5 my-1",
                    isActive 
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-md font-bold" 
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                  )}
                >
                  <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                </Link>
              );
            }

            // Expandable Lines dropdown
            if (isLinesItem) {
              return (
                <div key={item.name} className="flex flex-col my-0.5">
                  <div className={cn(
                    "flex items-center justify-between rounded-xl transition-all duration-200 relative group overflow-hidden",
                    isActive 
                      ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold shadow-xs" 
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                  )}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 px-3 py-2"
                    >
                      <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[12px] font-semibold tracking-wide whitespace-nowrap">
                        {item.name}
                      </span>
                    </Link>

                    {/* Expand/Collapse Chevron Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLinesExpanded(!isLinesExpanded);
                      }}
                      className="p-2 mr-1 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-all cursor-pointer border-0 outline-none"
                      title={isLinesExpanded ? "Collapse Lines" : "Expand Lines"}
                      aria-label="Toggle Lines Submenu"
                    >
                      <ChevronDown 
                        size={14} 
                        className={cn(
                          "transition-transform duration-300",
                          isLinesExpanded ? "rotate-180 text-[var(--color-primary)]" : ""
                        )} 
                      />
                    </button>
                  </div>

                  {/* Lines Sub-items List (Stroke-free nested card) */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isLinesExpanded ? "max-h-60 opacity-100 mt-1 mb-1" : "max-h-0 opacity-0"
                  )}>
                    <div className="p-1.5 space-y-0.5 ml-2 bg-[var(--color-surface)]/50 rounded-xl">
                      {/* View All Lines Overview Link */}
                      <Link
                        href="/lines"
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                          pathname === '/lines'
                            ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                        )}
                      >
                        <span>All Lines Overview</span>
                        <Layers size={11} className="opacity-70" />
                      </Link>

                      {['A', 'B', 'C', 'D'].map((lineId) => {
                        const href = `/lines/${lineId}`;
                        const isLineActive = pathname === href;
                        const lineData = lines?.find(l => l.id?.toUpperCase() === lineId);
                        const itemDesc = (lineData?.items && lineData.items.length > 0 ? lineData.items.join(', ') : null) || lineData?.item || lineData?.lastActiveDay?.item || lineData?.today?.item || DEFAULT_LINE_ITEMS[lineId] || 'N/A';

                        return (
                          <Link
                            key={lineId}
                            href={href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                              isLineActive
                                ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                            )}
                          >
                            <span className="shrink-0 font-medium">Line {lineId}</span>
                            <span className="text-[9px] text-[var(--color-text-muted)] font-normal truncate max-w-[85px] text-right ml-1" title={itemDesc}>
                              {itemDesc}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Standard Navigation link
            const linkProps = item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                {...linkProps}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 px-3 py-2 gap-3 my-0.5",
                  isActive 
                    ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold shadow-xs" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)] font-medium"
                )}
              >
                <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[12px] font-semibold tracking-wide whitespace-nowrap flex-1">
                  {item.name}
                </span>
                {item.isExternal && (
                  <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 group-hover:text-[var(--color-primary)] transition-all shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area: Appearance, Themes & Status (Stroke-free) */}
        <div className={cn(
          "p-2.5 flex flex-col gap-2.5 shrink-0 bg-[var(--color-bg-card)]/90 select-none", 
          isCollapsed && "items-center px-1.5"
        )}>
          {/* Collapsed Theme Trigger */}
          {isCollapsed && (
            <button 
              type="button"
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              title="Toggle Appearance"
              className="flex items-center justify-center p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] cursor-pointer border-0 outline-none"
            >
              {mode === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />}
            </button>
          )}

          {/* Expanded Appearance & Styles (Click to switch Themes vs Backgrounds) */}
          {!isCollapsed && (
            <div className="space-y-2 py-0.5">
              {/* Segmented Switcher: Themes vs Backgrounds + Mode Toggle */}
              <div className="flex items-center justify-between gap-1 bg-[var(--color-surface)]/70 p-1 rounded-xl">
                <div className="flex items-center gap-1 flex-1">
                  <button
                    type="button"
                    onClick={() => setAppearanceTab('themes')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-0 outline-none select-none",
                      appearanceTab === 'themes'
                        ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-sm font-extrabold"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    <Palette size={12} />
                    <span>Themes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppearanceTab('backgrounds')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-0 outline-none select-none",
                      appearanceTab === 'backgrounds'
                        ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-sm font-extrabold"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    <Sparkles size={12} />
                    <span>Backgrounds</span>
                  </button>
                </div>

                {/* Day / Night Mode Switcher (Stroke-free) */}
                <div className="flex items-center gap-0.5 shrink-0 pl-1">
                  <button
                    type="button"
                    onClick={() => setMode('light')}
                    title="Light Mode"
                    className={cn(
                      "p-1.5 rounded-lg transition-all cursor-pointer border-0 outline-none flex items-center justify-center",
                      mode === 'light' 
                        ? "bg-[var(--color-bg-card)] text-amber-500 shadow-sm" 
                        : "text-[var(--color-text-muted)] hover:text-amber-500 hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    <Sun size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('dark')}
                    title="Dark Mode"
                    className={cn(
                      "p-1.5 rounded-lg transition-all cursor-pointer border-0 outline-none flex items-center justify-center",
                      mode === 'dark' 
                        ? "bg-[var(--color-bg-card)] text-indigo-400 shadow-sm" 
                        : "text-[var(--color-text-muted)] hover:text-indigo-400 hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    <Moon size={13} />
                  </button>
                </div>
              </div>

              {/* Sub-label showing current active choice */}
              <div className="flex items-center justify-between px-1.5 text-[9px]">
                <span className="font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {appearanceTab === 'themes' ? 'Color Palette' : 'Surface Atmosphere'}
                </span>
                <span className="font-extrabold text-[var(--color-primary)] truncate max-w-[110px]">
                  {appearanceTab === 'themes' ? currentThemeLabel : currentBgLabel}
                </span>
              </div>

              {/* Click on appear types (Themes) or the bg's (Backgrounds) */}
              {appearanceTab === 'themes' ? (
                <div className="grid grid-cols-3 gap-1 animate-[fade-in_0.2s_ease-out]">
                  {THEME_OPTIONS.map((t) => {
                    const isSelected = visualTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setVisualTheme(t.id)}
                        title={t.full}
                        className={cn(
                          "py-1.5 px-1 rounded-lg text-[9px] font-bold text-center truncate transition-all cursor-pointer border-0 outline-none select-none",
                          isSelected
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] font-extrabold shadow-sm"
                            : "bg-[var(--color-surface)]/70 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 animate-[fade-in_0.2s_ease-out]">
                  {BG_OPTIONS.map((b) => {
                    const isSelected = bgEffect === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBgEffect(b.id)}
                        title={b.full}
                        className={cn(
                          "py-1.5 px-1 rounded-lg text-[9px] font-bold text-center truncate transition-all cursor-pointer border-0 outline-none select-none",
                          isSelected
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] font-extrabold shadow-sm"
                            : "bg-[var(--color-surface)]/70 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                        )}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* System Status Card (Stroke-free, Dot-free) */}
          {!isCollapsed && (
            <div className="space-y-1.5 pt-1">
              <div className="px-1 flex items-center justify-between text-[8.5px] text-[var(--color-text-muted)] tracking-wider">
                <span className="italic">Last Updated:</span>
                <span className="text-[var(--color-primary)] font-semibold not-italic">{updateDate || 'November 1st, 2026'}</span>
              </div>
              <div className="px-2.5 py-2 rounded-xl bg-[var(--color-surface)]/80 flex items-center justify-between transition-colors cursor-default">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-[var(--color-text-main)] tracking-wider uppercase">System Live</span>
                </div>
                <span className="text-[8.5px] text-[var(--color-text-muted)] font-extrabold bg-[var(--color-bg-card)] px-2 py-0.5 rounded-md shadow-xs">
                  v8.0.9
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
