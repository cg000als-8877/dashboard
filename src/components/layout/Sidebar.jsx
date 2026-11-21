"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  LayoutDashboard, 
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
  Sparkles
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
  { id: 'dots', label: 'Dots', full: 'Matrix Dots' },
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
    BG_EFFECTS, 
    VISUAL_THEMES, 
    APPEARANCE_MODES 
  } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLinesExpanded, setIsLinesExpanded] = useState(true);
  const [isThemesExpanded, setIsThemesExpanded] = useState(true);
  const [sidebarThemeTab, setSidebarThemeTab] = useState('palette'); // 'palette' | 'background'

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

  const currentThemeObj = VISUAL_THEMES.find(t => t.id === visualTheme) || VISUAL_THEMES[0];

  return (
    <aside className={cn(
      "flex flex-col transition-all duration-300 relative z-40 h-full",
      isCollapsed ? "w-[72px]" : "w-[240px]"
    )}>
      {/* Centered Minimal Sidebar Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-50 h-8 w-5 items-center justify-center rounded-r-lg bg-[var(--color-bg-card)] border-y border-r border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)] transition-all duration-200 cursor-pointer"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={11} strokeWidth={2.5} /> : <ChevronLeft size={11} strokeWidth={2.5} />}
      </button>

      {/* The main sidebar box - full height attached to left edge */}
      <div className="flex flex-col w-full h-full bg-[var(--color-bg-card)] border-r border-[var(--color-border)] shadow-none overflow-hidden">
        {/* Brand Header */}
        <div className={cn("py-3.5 flex items-center justify-between shrink-0 border-b border-[var(--color-border)]/50 mx-3 mb-1", isCollapsed ? "px-0 justify-center mx-2 flex-col gap-2" : "px-2")}>
          <Link href="/" className={cn("flex flex-col group cursor-pointer w-fit", isCollapsed ? "items-center gap-1" : "gap-0.5")}>
            {isCollapsed ? (
              <Ship size={24} className="text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors" />
            ) : (
              <>
                <span className="font-black text-[13px] tracking-[0.15em] uppercase text-[var(--color-text-main)] leading-tight whitespace-nowrap transition-colors group-hover:text-[var(--color-primary)]">
                  BYZID APPARELS
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)] font-medium tracking-[0.4em] uppercase">
                  PVT LTD
                </span>
              </>
            )}
          </Link>

          {/* Mode Switcher: 2 stroke-free icons (PC View) */}
          {!isCollapsed && (
            <div className="flex items-center gap-1 border-0">
              <button
                type="button"
                onClick={() => setMode('light')}
                title="Light Mode"
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer border-0 outline-none flex items-center justify-center",
                  mode === 'light' 
                    ? "bg-[var(--color-surface)] text-amber-400 shadow-xs" 
                    : "text-[var(--color-text-muted)] hover:text-amber-400 hover:bg-[var(--color-surface-hover)]"
                )}
              >
                <Sun size={15} />
              </button>
              <button
                type="button"
                onClick={() => setMode('dark')}
                title="Dark Mode"
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer border-0 outline-none flex items-center justify-center",
                  mode === 'dark' 
                    ? "bg-[var(--color-surface)] text-indigo-400 shadow-xs" 
                    : "text-[var(--color-text-muted)] hover:text-indigo-400 hover:bg-[var(--color-surface-hover)]"
                )}
              >
                <Moon size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-0.5 overflow-y-auto hide-scrollbar", isCollapsed ? "px-2" : "px-2")}>
          <div className={cn("mb-1 mt-1 transition-all duration-300", isCollapsed ? "px-0 text-center" : "px-3")}>
            <div className="flex items-center gap-2">
              {!isCollapsed && <div className="h-px w-2 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-60"></div>}
              <p className={cn("text-[9px] font-bold text-[var(--color-text-muted)] uppercase", isCollapsed ? "tracking-widest" : "tracking-[0.2em]")}>
                {isCollapsed ? "Nav" : "Main Menu"}
              </p>
            </div>
          </div>

          {navItems.map((item) => {
            const isLinesItem = item.name === 'Lines';
            const isActive = isLinesItem 
              ? pathname === '/lines' || pathname.startsWith('/lines/')
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            // Standard collapsed mode rendering
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
                    "flex items-center rounded-xl transition-all duration-300 relative group overflow-hidden justify-center p-2.5 my-1",
                    isActive 
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold shadow-[inset_0_0_0_1px_var(--color-primary-glow)]" 
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)] font-medium"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"
                  )}>
                    <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                </Link>
              );
            }

            // ── EXPANDABLE LINES DROPDOWN ───────────────────────────
            if (isLinesItem) {
              return (
                <div key={item.name} className="flex flex-col my-0.5">
                  <div className={cn(
                    "flex items-center justify-between rounded-xl transition-all duration-300 relative group overflow-hidden mx-1",
                    isActive 
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold shadow-[inset_0_0_0_1px_var(--color-primary-glow)]" 
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)] font-medium"
                  )}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 px-3 py-2"
                    >
                      <div className={cn(
                        "flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"
                      )}>
                        <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className="text-[12px] tracking-wide whitespace-nowrap group-hover:translate-x-0.5 transition-transform duration-300">
                        {item.name}
                      </span>
                    </Link>

                    {/* Expand/Collapse Arrow Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLinesExpanded(!isLinesExpanded);
                      }}
                      className="p-2 mr-1 rounded-lg hover:bg-[var(--color-surface)]/80 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-all cursor-pointer"
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

                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_8px_var(--color-primary)]" />
                    )}
                  </div>

                  {/* Lines Sub-items List */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isLinesExpanded ? "max-h-60 opacity-100 mt-1 mb-1" : "max-h-0 opacity-0"
                  )}>
                    <div className="pl-3 pr-1 py-1 space-y-0.5 ml-3 border-l border-[var(--color-border)]">
                      {/* View All Lines Link */}
                      <Link
                        href="/lines"
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all group/sub",
                          pathname === '/lines'
                            ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold shadow-sm"
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
                              "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all group/line",
                              isLineActive
                                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold shadow-sm"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                            )}
                          >
                            <div className="flex items-center min-w-0">
                              <span className="shrink-0">Line {lineId}</span>
                            </div>
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

            // Standard navigation link
            const linkProps = item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                {...linkProps}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-300 relative group overflow-hidden px-3 py-2 gap-3 mx-1 my-0.5",
                  isActive 
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold shadow-[inset_0_0_0_1px_var(--color-primary-glow)]" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)] font-medium"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"
                )}>
                  <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[12px] tracking-wide whitespace-nowrap group-hover:translate-x-1 transition-transform duration-300 flex-1">
                  {item.name}
                </span>
                {item.isExternal && (
                  <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 group-hover:text-[var(--color-primary)] transition-all shrink-0" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_8px_var(--color-primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area with Theme Section directly above System Status */}
        <div className={cn("p-2 flex flex-col gap-2 border-t border-[var(--color-border)] shrink-0 bg-[var(--color-bg-card)]", isCollapsed && "items-center px-1.5")}>
          {/* Collapsed Theme Trigger */}
          {isCollapsed && (
            <button 
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              title="Toggle Appearance"
              className="flex items-center justify-center p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] cursor-pointer"
            >
              {mode === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-400" />}
            </button>
          )}

          {/* Simplified Themes & Background Section (PC View Only - No Scroll, No Dots, No Strokes) */}
          {!isCollapsed && (
            <div className="space-y-2 py-0.5 border-t border-[var(--color-border)]/40 pt-2">
              {/* Mode Switcher: 2 stroke-free icons */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Mode
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMode('light')}
                    title="Light Mode"
                    className={cn(
                      "p-1.5 rounded-md transition-all cursor-pointer border-0 outline-none flex items-center justify-center",
                      mode === 'light' 
                        ? "bg-[var(--color-surface)] text-amber-400 shadow-xs" 
                        : "text-[var(--color-text-muted)] hover:text-amber-400 hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    <Sun size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('dark')}
                    title="Dark Mode"
                    className={cn(
                      "p-1.5 rounded-md transition-all cursor-pointer border-0 outline-none flex items-center justify-center",
                      mode === 'dark' 
                        ? "bg-[var(--color-surface)] text-indigo-400 shadow-xs" 
                        : "text-[var(--color-text-muted)] hover:text-indigo-400 hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    <Moon size={14} />
                  </button>
                </div>
              </div>

              {/* 1. THEMES (11 chips in 3 columns, no scroll, no dots, no strokes) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Themes
                  </span>
                  <span className="text-[8.5px] font-extrabold text-[var(--color-primary)] truncate max-w-[100px]">
                    {THEME_OPTIONS.find(t => t.id === visualTheme)?.label || 'Royal'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {THEME_OPTIONS.map((t) => {
                    const isSelected = visualTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setVisualTheme(t.id)}
                        title={t.full}
                        className={cn(
                          "py-1 px-1 rounded text-[8.5px] font-bold text-center truncate transition-all cursor-pointer border-0 outline-none select-none",
                          isSelected
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] font-extrabold shadow-xs"
                            : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. BACKGROUND (14 chips in 3 columns, no scroll, no dots, no strokes) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Background
                  </span>
                  <span className="text-[8.5px] font-extrabold text-[var(--color-primary)] truncate max-w-[100px]">
                    {BG_OPTIONS.find(b => b.id === bgEffect)?.label || 'Grain'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {BG_OPTIONS.map((b) => {
                    const isSelected = bgEffect === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBgEffect(b.id)}
                        title={b.full}
                        className={cn(
                          "py-1 px-1 rounded text-[8.5px] font-bold text-center truncate transition-all cursor-pointer border-0 outline-none select-none",
                          isSelected
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] font-extrabold shadow-xs"
                            : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                        )}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Compact System Status */}
          {!isCollapsed && (
            <>
              <div className="mx-1 px-0.5 flex items-center gap-1 text-[8.5px] italic text-[var(--color-text-muted)] tracking-wider">
                <span>Last Updated :</span>
                <span className="text-[var(--color-primary)] font-semibold not-italic">{updateDate || 'November 1st, 2026'}</span>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between group hover:border-[var(--color-primary)]/40 transition-colors cursor-default relative overflow-hidden">
                <div className="flex items-center gap-1.5 relative z-10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9.5px] font-bold text-[var(--color-text-main)] tracking-wider">System Online</span>
                </div>
                <span className="text-[8px] text-[var(--color-text-muted)] font-bold bg-[var(--color-bg-card)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                  v8.0.9
                </span>
              </div>

            </>
          )}
        </div>
      </div>
    </aside>
  );
}

