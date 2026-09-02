"use client";

import { useState, Fragment } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from './Sidebar';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useKpiData } from '@/utils/useKpiData';
import { format, parseISO } from 'date-fns';
import { Clock, LayoutDashboard, Factory, BarChart3, Ship, History, Palette, Sun, Moon, GitCompare, Coffee, Globe, ExternalLink, Check } from 'lucide-react';
import { useMonth } from '@/components/providers/MonthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { CanteenSecurityModal } from '@/components/ui/CanteenSecurityModal';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Hourly', href: '/hourly', icon: Clock },
  { name: 'Lines', href: '/lines', icon: Factory },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', href: '/simulator', icon: Ship },
  { name: 'Archive', href: '/archive', icon: History },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { dailyTrends } = useKpiData();
  const { selectedMonth, setSelectedMonth } = useMonth();
  const { visualTheme, setVisualTheme, mode, setMode, toggleTheme, VISUAL_THEMES, APPEARANCE_MODES } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [showCanteenModal, setShowCanteenModal] = useState(false);

  let datePart = "Loading...";
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    datePart = format(parseISO(endDate), 'do MMMM, yyyy');
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[var(--color-bg-main)]">
      {/* Desktop Attached Left Sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0 z-40 relative h-full">
        <Sidebar onClose={() => {}} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        {/* Mobile Top Header (Hidden on Desktop) */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-bg-card)]/90 backdrop-blur-md z-50 flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-[var(--color-border)] shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none"></div>
          <Link href="/" className="flex items-center gap-2 relative z-10 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-extrabold text-[12px] sm:text-[13px] tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] leading-tight whitespace-nowrap [filter:var(--shadow-text)]">BYZID APPARELS PVT LTD</span>
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
                <Moon size={19} strokeWidth={2.2} className="text-indigo-400" />
              )}
            </button>

          </div>

          {/* Theme & Appearance Selector Popover Modal */}
          {isMobileMenuOpen && (
            <>
              <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="absolute top-12 right-2.5 w-52 bg-[var(--color-bg-card)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-xl shadow-2xl flex flex-col p-2.5 animate-[fade-down_0.15s_ease-out_both] z-[100] origin-top-right">
                
                {/* Header with Title and Close Button */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]/60 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-main)]">
                    Theme & Mode
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

                {/* Compressed Full Theme List (No scroll needed) */}
                <div className="space-y-0.5 divide-y divide-[var(--color-border)]/20">
                  {VISUAL_THEMES.map((t) => {
                    const isSelected = visualTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setVisualTheme(t.id); setIsMobileMenuOpen(false); }}
                        className={cn(
                          "w-full flex items-center justify-between px-2 py-1 rounded-md text-[10.5px] font-medium transition-colors cursor-pointer text-left",
                          isSelected
                            ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0 shadow-xs" 
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

              </div>
            </>
          )}
        </header>

        {/* Quick Navigation Hamburger Popover Modal (Slides up from bottom right) */}
        {isBurgerOpen && (
          <>
            <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]" onClick={() => setIsBurgerOpen(false)}></div>
            <div className="fixed bottom-14 right-3 w-48 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col p-2 animate-[fade-up_0.2s_ease-out_both] z-[100] origin-bottom-right">
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

        {/* Mobile Bottom Fixed Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-card)]/95 backdrop-blur-xl border-t border-[var(--color-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.25)] px-1 py-1.5 flex items-center justify-around animate-[fade-in_0.3s_ease-out]">
          {navItems.filter(item => !['Simulator', 'Compare', 'Analytics'].includes(item.name)).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isDashboard = item.name === 'Dashboard';
            
            return (
              <Link
                key={`mobile-bottom-${item.name}`}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-0.5 px-0.5 transition-all duration-300 relative group active:scale-95",
                  isActive
                    ? "text-[var(--color-primary)] font-black"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] font-extrabold"
                )}
              >
                <div className="relative flex items-center justify-center">
                  {isActive ? (
                    <div className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-[var(--color-border)]/20">
                      <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_15%,var(--color-primary)_50%,transparent_85%)] animate-[nav-border-spin_2s_linear_infinite]" />
                      <div className="absolute inset-[1.5px] rounded-full bg-[var(--color-bg-card)] flex items-center justify-center z-10">
                        <Icon size={15} strokeWidth={isDashboard ? 3.25 : 2.75} className="text-[var(--color-primary)] drop-shadow-[0_0_4px_var(--color-primary-glow)]" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-main)]">
                      <Icon size={18} strokeWidth={isDashboard ? 3 : 2.5} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  )}
                </div>
                <span className={cn(
                  "uppercase leading-none relative z-10 mt-1",
                  isDashboard ? "text-[9.5px] font-black tracking-normal" : "text-[9px] font-bold tracking-tighter"
                )}>{item.name}</span>
              </Link>
            );
          })}

          {/* OTHERS tab button */}
          <button
            onClick={() => {
              setIsBurgerOpen(!isBurgerOpen);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-0.5 px-0.5 transition-all duration-300 relative group active:scale-95 cursor-pointer",
              isBurgerOpen
                ? "text-[var(--color-primary)] font-extrabold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] font-bold"
            )}
          >
            <div className="relative flex items-center justify-center">
              {isBurgerOpen ? (
                <div className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-[var(--color-border)]/20">
                  <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_15%,var(--color-primary)_50%,transparent_85%)] animate-[nav-border-spin_2s_linear_infinite]" />
                  <div className="absolute inset-[1.5px] rounded-full bg-[var(--color-bg-card)] flex items-center justify-center z-10">
                    <X size={15} className="text-[var(--color-primary)] drop-shadow-[0_0_4px_var(--color-primary-glow)]" />
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-main)]">
                  <Menu size={18} className="transition-transform duration-300 group-hover:scale-110" />
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter leading-none relative z-10 mt-1">OTHERS</span>
          </button>
        </nav>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-y-auto w-full pt-[65px] pb-16 md:pt-8 md:pb-8 p-4 md:p-8 relative hide-scrollbar md:[scrollbar-width:auto]"
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
