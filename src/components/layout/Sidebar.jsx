"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
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
  ExternalLink
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
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Hourly', href: '/hourly', icon: Clock },
  { name: 'Lines', href: '/lines', icon: Factory, isExpandable: true },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', href: '/simulator', icon: Ship },
  { name: 'Archive', href: '/archive', icon: History },
  { name: 'Byzid Profile', href: 'https://baplprofile.vercel.app/', icon: Globe, isExternal: true },
];

const LINE_SUB_ITEMS = [
  { id: 'A', name: 'Line A', href: '/lines/A', color: '#10B981', desc: 'Flannel Shirt' },
  { id: 'B', name: 'Line B', href: '/lines/B', color: '#3B82F6', desc: 'Ladies Top' },
  { id: 'C', name: 'Line C', href: '/lines/C', color: '#A855F7', desc: 'Ladies Bottom' },
  { id: 'D', name: 'Line D', href: '/lines/D', color: '#F59E0B', desc: "Men's Tshirt" },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { dailyTrends } = useKpiData();
  const { visualTheme, setVisualTheme, mode, setMode, VISUAL_THEMES, APPEARANCE_MODES } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLinesExpanded, setIsLinesExpanded] = useState(() => pathname.startsWith('/lines'));
  const [isThemesExpanded, setIsThemesExpanded] = useState(true);

  // Auto-expand lines dropdown if user navigates to a line page
  useEffect(() => {
    if (pathname.startsWith('/lines')) {
      setIsLinesExpanded(true);
    }
  }, [pathname]);

  let updateDate = "";
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    updateDate = format(parseISO(endDate), 'do MMMM, yyyy');
  }

  const currentThemeObj = VISUAL_THEMES.find(t => t.id === visualTheme) || VISUAL_THEMES[0];

  return (
    <aside className={cn(
      "flex flex-col transition-all duration-300 relative z-40",
      isCollapsed ? "w-[72px]" : "w-[230px]"
    )}>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3.5 top-8 z-50 h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-md hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-text-secondary)] transition-all duration-300 hover:shadow-[0_0_12px_var(--color-primary-glow)] cursor-pointer"
        title={isCollapsed ? "Expand Sidebar" : "Hide Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>

      {/* The main sidebar box */}
      <div className="flex flex-col w-full h-fit max-h-[calc(100vh-32px)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Brand Header */}
        <div className={cn("py-4 flex flex-col shrink-0 border-b border-[var(--color-border)]/50 mx-3 mb-1", isCollapsed ? "px-0 items-center mx-2" : "px-2")}>
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

                      {LINE_SUB_ITEMS.map((line) => {
                        const isLineActive = pathname === line.href;
                        return (
                          <Link
                            key={line.id}
                            href={line.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all group/line",
                              isLineActive
                                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold shadow-sm"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0 shadow-sm transition-transform group-hover/line:scale-125" 
                                style={{ backgroundColor: line.color, boxShadow: `0 0 6px ${line.color}66` }} 
                              />
                              <span>{line.name}</span>
                            </div>
                            <span className="text-[9px] text-[var(--color-text-muted)] font-normal truncate max-w-[65px]">
                              {line.desc}
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

          {/* ── EXPANDABLE THEME SELECTOR SECTION ──────────────────────── */}
          {!isCollapsed && (
            <div className="mt-3 pt-2.5 border-t border-[var(--color-border)]/60 px-1">
              {/* Expandable Theme Trigger */}
              <button
                onClick={() => setIsThemesExpanded(!isThemesExpanded)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all duration-300 group cursor-pointer",
                  isThemesExpanded 
                    ? "bg-[var(--color-surface)] border border-[var(--color-border)]" 
                    : "hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Palette size={15} className="text-[var(--color-primary)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]">
                    Theme &amp; Style
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Current Active Dot Preview */}
                  <span 
                    className="w-2 h-2 rounded-full shrink-0 shadow-sm" 
                    style={{ backgroundColor: currentThemeObj.color, boxShadow: `0 0 6px ${currentThemeObj.color}88` }} 
                  />
                  <ChevronDown 
                    size={13} 
                    className={cn(
                      "text-[var(--color-text-muted)] transition-transform duration-300",
                      isThemesExpanded ? "rotate-180 text-[var(--color-primary)]" : ""
                    )} 
                  />
                </div>
              </button>

              {/* Theme & Appearance Unfoldable Content */}
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out px-1 space-y-2.5",
                isThemesExpanded ? "max-h-[220px] opacity-100 mt-2 pb-1" : "max-h-0 opacity-0"
              )}>
                {/* Visual Theme Palette Swatches (All in view - No Scrollbar) */}
                <div className="bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl p-2 space-y-1.5">
                  <div className="flex items-center justify-between px-0.5 text-[9px] font-bold uppercase tracking-wider">
                    <span className="text-[var(--color-text-muted)]">Palettes ({VISUAL_THEMES.length})</span>
                    <span className="text-[var(--color-primary)] font-extrabold">{currentThemeObj.name}</span>
                  </div>

                  {/* Swatches Grid - All 11 themes visible at once */}
                  <div className="grid grid-cols-6 gap-1.5 pt-0.5">
                    {VISUAL_THEMES.map((t) => {
                      const isSelected = visualTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setVisualTheme(t.id)}
                          title={t.name}
                          className={cn(
                            "h-6 w-full rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer relative group",
                            isSelected 
                              ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg-card)] scale-105 z-10" 
                              : "hover:scale-110 opacity-75 hover:opacity-100"
                          )}
                          style={{
                            backgroundColor: t.color,
                            boxShadow: isSelected ? `0 0 10px ${t.color}66` : undefined
                          }}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-bg-card)] shadow-sm" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Appearance Mode Radio Group */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                  {APPEARANCE_MODES.map((m) => {
                    const isSelected = mode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={cn(
                          "py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                          isSelected
                            ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 shadow-sm"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full border flex items-center justify-center shrink-0",
                          isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                        )}>
                          {isSelected && <div className="w-0.5 h-0.5 rounded-full bg-[var(--color-primary)]" />}
                        </div>
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer Area */}
        <div className={cn("p-2.5 flex flex-col gap-2 border-t border-[var(--color-border)] shrink-0", isCollapsed && "items-center px-2")}>
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

          {/* Compact System Status */}
          {!isCollapsed && (
            <>
              <div className="mx-1.5 px-0.5 flex items-center gap-1 text-[9px] italic text-[var(--color-text-muted)] tracking-wider">
                <span>Last Update:</span>
                <span className="text-[var(--color-primary)] font-semibold not-italic">{updateDate || 'Loading...'}</span>
              </div>
              <div className="mx-1 px-2.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-1 group hover:border-[var(--color-primary)]/40 transition-colors cursor-default relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-text-main)] tracking-wider">System Online</span>
                  </div>
                  <span className="text-[8px] text-[var(--color-text-muted)] font-bold bg-[var(--color-bg-card)] px-1.5 py-0.5 rounded-md border border-[var(--color-border)]">
                    v2.0.4
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

