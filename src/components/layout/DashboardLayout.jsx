"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from './Sidebar';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useKpiData } from '@/utils/useKpiData';
import { format, parseISO } from 'date-fns';
import { Clock, Home, LayoutDashboard, Factory, BarChart3, Ship, History, Palette, Sun, Moon, GitCompare, Coffee, Globe, ExternalLink, Check, Sparkles, Minus, Plus } from 'lucide-react';
import { useMonth } from '@/components/providers/MonthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useZoom } from '@/components/providers/ZoomProvider';
import { CanteenSecurityModal } from '@/components/ui/CanteenSecurityModal';
import { MobileHourlyTicker } from '@/components/dashboard/MobileHourlyTicker';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const navItems = [
  { name: 'Home', key: 'navDashboard', href: '/', icon: Home },
  { name: 'Hourly', key: 'navHourly', href: '/hourly', icon: Clock },
  { name: 'Lines', key: 'navLines', href: '/lines', icon: Factory },
  { name: 'Compare', key: 'navCompare', href: '/compare', icon: GitCompare },
  { name: 'Analytics', key: 'navAnalytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', key: 'navSimulator', href: '/simulator', icon: Ship },
  { name: 'Archive', key: 'navArchive', href: '/archive', icon: History },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { dailyTrends } = useKpiData();
  const { selectedMonth, setSelectedMonth } = useMonth();
  const { 
    visualTheme, 
    setVisualTheme, 
    mode, 
    setMode, 
    toggleTheme, 
    bgEffect, 
    setBgEffect, 
    BG_EFFECTS, 
    VISUAL_THEMES, 
    APPEARANCE_MODES 
  } = useTheme();
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [showCanteenModal, setShowCanteenModal] = useState(false);
  const [mobileThemeTab, setMobileThemeTab] = useState('palette'); // 'palette' | 'background'

  let datePart = 'November 1st, 2026';
  if (dailyTrends && dailyTrends.length > 0) {
    try {
      const endDate = dailyTrends[dailyTrends.length - 1]?.date;
      if (endDate) {
        datePart = format(parseISO(endDate), 'MMMM do, yyyy');
      }
    } catch (e) {
      datePart = 'November 1st, 2026';
    }
  }

  const isDashboard = pathname === '/';

  // Standalone auth pages (do not render dashboard shell, sidebar, or mobile nav)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-transparent relative">
      {/* Desktop Attached Left Sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0 z-40 relative h-full">
        <Sidebar onClose={() => {}} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative w-full z-10">
        {/* Mobile Top Header (Hidden on Desktop) */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-bg-card)]/90 backdrop-blur-md z-50 flex flex-col border-none shadow-none">
          {/* Marquee Ticker hidden for now per user request */}
          {/* {isDashboard && <MobileHourlyTicker />} */}

          <div className="flex items-center justify-between px-3.5 py-2.5 sm:py-3 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none"></div>
            <Link href="/" className="flex items-center gap-2 relative z-10 cursor-pointer">
              <div className="flex flex-col">
                <span className="font-extrabold text-[12px] sm:text-[13px] tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] leading-tight whitespace-nowrap [filter:var(--shadow-text)]">
                  BYZID APPARELS PVT LTD
                </span>
                <span className="text-[9px] italic text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1 leading-tight">
                  <span>Last Updated :</span>
                  <span className="text-[var(--color-primary)] font-medium">{datePart}</span>
                </span>
              </div>
            </Link>
            
            {/* Top Right Controls */}
            <div className="flex items-center gap-1.5 relative z-50">
              {/* Visual Theme Palette Toggle */}
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setIsBurgerOpen(false);
                }} 
                className={cn(
                  "p-1.5 bg-transparent border-0 shadow-none outline-none transition-transform active:scale-90 flex items-center justify-center cursor-pointer",
                  isMobileMenuOpen 
                    ? "text-[var(--color-primary)]" 
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                )}
                aria-label="Open Theme Palette"
                title="Change Visual Theme"
              >
                <Palette size={19} strokeWidth={2.2} />
              </button>

              {/* Light / Dark Mode Toggle Button */}
              <button 
                onClick={() => {
                  toggleTheme();
                  setIsBurgerOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className="p-1.5 bg-transparent border-0 shadow-none outline-none text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-transform active:scale-90 flex items-center justify-center cursor-pointer"
                aria-label="Toggle Light/Dark Mode"
                title="Toggle Light/Dark Mode"
              >
                {mode === 'dark' ? (
                  <Sun size={19} strokeWidth={2.2} className="text-amber-400" />
                ) : (
                  <Moon size={19} strokeWidth={2.2} className="text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            </div>

            {/* Theme & Appearance Selector Popover Modal */}
            {isMobileMenuOpen && (
              <>
                <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="absolute top-11 right-2 w-[264px] sm:w-[276px] bg-[var(--color-bg-card)] border-0 rounded-2xl shadow-2xl flex flex-col p-2 animate-[fade-down_0.15s_ease-out_both] z-[100] origin-top-right">
                  
                  {/* Header with Title and Close Button (Stroke-free) */}
                  <div className="flex items-center justify-between pb-1.5 border-0 mb-1 px-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-main)]">
                      Appearance &amp; Style
                    </span>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-0.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer border-0 outline-none"
                      aria-label="Close menu"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Controls: Palette (Theme) & Background Only (Stroke-free) */}
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[var(--color-surface)]/70 rounded-xl border-0 mb-1.5">
                    {/* Palette Tab */}
                    <button
                      type="button"
                      onClick={() => setMobileThemeTab('palette')}
                      title="Color Palette"
                      aria-label="Color Palette"
                      className={cn(
                        "py-1.5 px-2 rounded-lg flex items-center justify-center transition-all cursor-pointer text-center border-0 outline-none",
                        mobileThemeTab === 'palette'
                          ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-xs"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card)]/40"
                      )}
                    >
                      <Palette size={16} strokeWidth={2.2} className={mobileThemeTab === 'palette' ? "text-[var(--color-primary)]" : ""} />
                    </button>

                    {/* Background Tab */}
                    <button
                      type="button"
                      onClick={() => setMobileThemeTab('background')}
                      title="Background Effects"
                      aria-label="Background Effects"
                      className={cn(
                        "py-1.5 px-2 rounded-lg flex items-center justify-center transition-all cursor-pointer text-center border-0 outline-none",
                        mobileThemeTab === 'background'
                          ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-xs"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card)]/40"
                      )}
                    >
                      <Sparkles size={16} strokeWidth={2.2} className={mobileThemeTab === 'background' ? "text-[var(--color-primary)]" : ""} />
                    </button>
                  </div>

                  {/* Tab 1: Palette List - All Visible Together (Stroke-free) */}
                  {mobileThemeTab === 'palette' && (
                    <div className="grid grid-cols-2 gap-1">
                      {VISUAL_THEMES.map((t) => {
                        const isSelected = visualTheme === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setVisualTheme(t.id); }}
                            className={cn(
                              "flex items-center justify-between px-2 py-1 rounded-md border-0 text-[9px] font-semibold transition-all cursor-pointer text-left leading-tight outline-none",
                              isSelected
                                ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-xs font-bold"
                                : "bg-[var(--color-surface)]/60 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-main)]"
                            )}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0 shadow-xs" 
                                style={{ backgroundColor: t.color }} 
                              />
                              <span className="truncate">{t.name}</span>
                            </div>
                            {isSelected && (
                              <Check size={9} className="text-[var(--color-primary)] shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab 2: Background Effects List - Clean Compact List (Stroke-free) */}
                  {mobileThemeTab === 'background' && (
                    <div className="grid grid-cols-2 gap-1 max-h-[250px] overflow-y-auto no-scrollbar pr-0.5">
                      {BG_EFFECTS.map((b) => {
                        const isSelected = bgEffect === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => { setBgEffect(b.id); }}
                            className={cn(
                              "flex items-center justify-between px-2 py-1.5 rounded-md border-0 text-[9.5px] font-semibold transition-all cursor-pointer text-left leading-tight outline-none",
                              isSelected
                                ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-xs font-bold"
                                : "bg-[var(--color-surface)]/60 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-main)]"
                            )}
                          >
                            <span className="truncate">{b.name}</span>
                            {isSelected && (
                              <Check size={10} className="text-[var(--color-primary)] shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              </>
            )}
          </div>

          {/* Soft Progressive Blur Edge Under Header (No hard border) */}
          <div 
            aria-hidden="true"
            className="absolute -bottom-3.5 inset-x-0 h-3.5 pointer-events-none select-none overflow-hidden"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              background: 'linear-gradient(to bottom, var(--color-bg-card) 0%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)',
            }}
          />
        </header>


        {/* Quick Navigation Hamburger Popover Modal (Slides up from bottom right) */}
        {isBurgerOpen && (
          <>
            <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]" onClick={() => setIsBurgerOpen(false)}></div>
            <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px))] right-3 sm:right-4 w-52 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col p-2 animate-[fade-up_0.2s_ease-out_both] z-[100] origin-bottom-right">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-2.5 pt-1.5">
                Quick Navigation
              </p>
              <div className="space-y-0.5">
                {[
                  { name: 'Hourly', href: '/hourly', icon: Clock },
                  { name: 'Canteen', type: 'button', icon: Coffee },
                  { name: 'Simulator', href: '/simulator', icon: Ship },
                  { name: 'Compare', href: '/compare', icon: GitCompare },
                  { name: 'Line A', href: '/lines/A', icon: Factory },
                  { name: 'Line B', href: '/lines/B', icon: Factory },
                  { name: 'Line C', href: '/lines/C', icon: Factory },
                  { name: 'Line D', href: '/lines/D', icon: Factory },
                  { name: 'Byzid Profile', href: 'https://baplprofile.vercel.app/', icon: Globe, isExternal: true, color: '#38BDF8' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isButton = item.type === 'button';
                  const isActive = !isButton && !item.isExternal && pathname === item.href;
                  
                  const content = (
                    <>
                      <Icon size={14} style={item.color ? { color: item.color } : undefined} className={cn("shrink-0", !item.color && (isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"))} />
                      <span className="text-left leading-tight whitespace-nowrap">{item.name}</span>
                      {item.isExternal && (
                        <ExternalLink size={11} className="opacity-40 ml-auto shrink-0" />
                      )}
                    </>
                  );
                  
                  const commonClass = cn(
                    "w-full flex items-center justify-start gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left",
                    isActive
                      ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                  );
                  
                  if (isButton) {
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setIsBurgerOpen(false);
                          setShowCanteenModal(true);
                        }}
                        className={commonClass}
                      >
                        {content}
                      </button>
                    );
                  }

                  if (item.isExternal) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsBurgerOpen(false)}
                        className={commonClass}
                      >
                        {content}
                      </a>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsBurgerOpen(false)}
                      className={commonClass}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>

              {/* Screen Zoom Controller: Mobile Only */}
              <div className="pt-1.5 mt-1 border-t border-[var(--color-border)]/50 px-0.5">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[var(--color-surface)]/70 text-xs">
                  {/* Zoom Out Button (-) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      zoomOut();
                    }}
                    disabled={zoom <= 70}
                    title="Zoom Out (-5%)"
                    className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--color-bg-card)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-text-main)] font-black text-xs transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs select-none"
                  >
                    <Minus size={12} strokeWidth={2.5} />
                  </button>

                  {/* Center Text: ZOOM (Click to reset to 100%) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetZoom();
                    }}
                    title={`Screen Zoom: ${zoom}% (tap to reset to 100%)`}
                    className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer select-none px-2 py-0.5"
                  >
                    ZOOM
                  </button>

                  {/* Zoom In Button (+) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      zoomIn();
                    }}
                    disabled={zoom >= 130}
                    title="Zoom In (+5%)"
                    className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--color-bg-card)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-text-main)] font-black text-xs transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs select-none"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              
            </div>
          </>
        )}

        {/* Scooped Floating Mobile Bottom Navigation Bar */}
        <MobileBottomNav 
          isOthersOpen={isBurgerOpen}
          onToggleOthers={() => {
            setIsBurgerOpen(!isBurgerOpen);
            setIsMobileMenuOpen(false);
          }}
          onOthersClose={() => setIsBurgerOpen(false)}
        />

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto w-full px-3.5 sm:px-5 md:px-8 pb-[calc(76px+env(safe-area-inset-bottom,0px))] md:pb-8 pt-[72px] md:pt-8 relative hide-scrollbar md:[scrollbar-width:auto]",
            isDashboard ? "dashboard-stroke-free" : "non-dashboard-stroke-free"
          )}
        >
          <div className="w-full max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>

        {/* Canteen Security & Verification Modal */}
        <CanteenSecurityModal 
          isOpen={showCanteenModal} 
          onClose={() => setShowCanteenModal(false)} 
          onRedirectHome={() => {
            if (pathname !== '/') {
              window.location.href = "/";
            }
          }}
        />
      </div>
    </div>
  );
}
