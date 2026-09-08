"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from './Sidebar';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useKpiData } from '@/utils/useKpiData';
import { format, parseISO } from 'date-fns';
import { Clock, LayoutDashboard, Factory, BarChart3, Ship, History, Palette, Sun, Moon, GitCompare, Coffee, Globe, ExternalLink, Check, Sparkles } from 'lucide-react';
import { useMonth } from '@/components/providers/MonthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { CanteenSecurityModal } from '@/components/ui/CanteenSecurityModal';
import { MobileHourlyTicker } from '@/components/dashboard/MobileHourlyTicker';
import { BackgroundCanvas } from '@/components/ui/BackgroundCanvas';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const navItems = [
  { name: 'Dashboard', key: 'navDashboard', href: '/', icon: LayoutDashboard },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [showCanteenModal, setShowCanteenModal] = useState(false);
  const [mobileThemeTab, setMobileThemeTab] = useState('palette'); // 'palette' | 'background'

  let datePart = 'Loading...';
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    datePart = format(parseISO(endDate), 'do MMMM, yyyy');
  }

  const isDashboard = pathname === '/';

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[var(--color-bg-main)] relative">
      {/* Ambient Visual Background FX Layer */}
      <BackgroundCanvas />

      {/* Desktop Attached Left Sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0 z-40 relative h-full">
        <Sidebar onClose={() => {}} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative w-full z-10">
        {/* Mobile Top Header (Hidden on Desktop) */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-bg-card)]/95 backdrop-blur-md z-50 flex flex-col border-b border-[var(--color-border)] shadow-sm">
          {/* Marquee Ticker placed directly ABOVE Byzid Apparels TITLE on dashboard */}
          {isDashboard && <MobileHourlyTicker />}

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
                <div className="absolute top-12 right-2.5 w-60 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col p-3 animate-[fade-down_0.15s_ease-out_both] z-[100] origin-top-right">
                  
                  {/* Header with Title and Close Button */}
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]/60 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-main)]">
                      Appearance &amp; Style
                    </span>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 -mr-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Compact Appearance Mode Switcher */}
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/60 mb-2">
                    {APPEARANCE_MODES.map((m) => {
                      const isSelected = mode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setMode(m.id); }}
                          className={cn(
                            "py-1 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
                            isSelected
                              ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-xs"
                              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                          )}
                        >
                          {m.id === 'light' ? <Sun size={10} /> : <Moon size={10} />}
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Selector: Palettes vs Background FX */}
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/40 mb-2">
                    <button
                      onClick={() => setMobileThemeTab('palette')}
                      className={cn(
                        "py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer",
                        mobileThemeTab === 'palette'
                          ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-xs"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                      )}
                    >
                      <Palette size={10} />
                      <span>Palette</span>
                    </button>
                    <button
                      onClick={() => setMobileThemeTab('background')}
                      className={cn(
                        "py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer",
                        mobileThemeTab === 'background'
                          ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] shadow-xs"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                      )}
                    >
                      <Sparkles size={10} />
                      <span>Background</span>
                    </button>
                  </div>

                  {/* Tab 1: Palette List */}
                  {mobileThemeTab === 'palette' && (
                    <div className="space-y-0.5 divide-y divide-[var(--color-border)]/20 max-h-[200px] overflow-y-auto pr-0.5">
                      {VISUAL_THEMES.map((t) => {
                        const isSelected = visualTheme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => { setVisualTheme(t.id); }}
                            className={cn(
                              "w-full flex items-center justify-between px-2 py-1 rounded-md text-[10.5px] font-medium transition-colors cursor-pointer text-left",
                              isSelected
                                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold"
                                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                                style={{ backgroundColor: t.color }} 
                              />
                              <span className="truncate">{t.name}</span>
                            </div>
                            {isSelected && (
                              <Check size={11} className="text-[var(--color-primary)] shrink-0 ml-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab 2: Background Effects List */}
                  {mobileThemeTab === 'background' && (
                    <div className="space-y-1 max-h-[200px] overflow-y-auto pr-0.5">
                      {BG_EFFECTS.map((b) => {
                        const isSelected = bgEffect === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => { setBgEffect(b.id); }}
                            className={cn(
                              "w-full flex flex-col gap-0.5 px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer border",
                              isSelected
                                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/40 shadow-xs"
                                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-main)] hover:border-[var(--color-primary)]/30"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[var(--color-text-main)]">{b.name}</span>
                              {isSelected ? (
                                <span className="text-[8px] font-extrabold uppercase tracking-wider text-[var(--color-primary)] px-1 py-0.2 bg-[var(--color-primary)]/20 rounded">Active</span>
                              ) : (
                                <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider">{b.tag}</span>
                              )}
                            </div>
                            <span className="text-[8px] text-[var(--color-text-muted)] line-clamp-1 leading-tight">{b.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </header>


        {/* Quick Navigation Hamburger Popover Modal (Slides up from bottom right) */}
        {isBurgerOpen && (
          <>
            <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]" onClick={() => setIsBurgerOpen(false)}></div>
            <div className="fixed bottom-[74px] right-3 sm:right-4 w-48 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col p-2 animate-[fade-up_0.2s_ease-out_both] z-[100] origin-bottom-right">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-2.5 pt-1.5">
                Quick Navigation
              </p>
              <div className="space-y-0.5">
                {[
                  { name: 'Canteen', type: 'button', icon: Coffee },
                  { name: 'Simulator', href: '/simulator', icon: Ship },
                  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
                  { name: 'Compare', href: '/compare', icon: GitCompare },
                  { name: 'Line A', href: '/lines/A', icon: Factory, color: '#10B981' },
                  { name: 'Line B', href: '/lines/B', icon: Factory, color: '#3B82F6' },
                  { name: 'Line C', href: '/lines/C', icon: Factory, color: '#A855F7' },
                  { name: 'Line D', href: '/lines/D', icon: Factory, color: '#F59E0B' },
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
            "flex-1 overflow-y-auto w-full px-3.5 sm:px-5 md:px-8 pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pb-8 relative hide-scrollbar md:[scrollbar-width:auto]",
            isDashboard ? "pt-[102px] md:pt-8" : "pt-[72px] md:pt-8"
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
