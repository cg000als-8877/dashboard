"use client";

import { useState, Fragment } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from './Sidebar';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useKpiData } from '@/utils/useKpiData';
import { format, parseISO } from 'date-fns';
import { Clock, LayoutDashboard, Factory, BarChart3, Ship, History, Palette, Sun, Moon } from 'lucide-react';
import { useMonth } from '@/components/providers/MonthProvider';
import { useTheme } from '@/components/ThemeProvider';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Hourly', href: '/hourly', icon: Clock },
  { name: 'Lines', href: '/lines', icon: Factory },
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

  let datePart = "Loading...";
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    datePart = format(parseISO(endDate), 'do MMMM, yyyy');
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[var(--color-bg-main)]">
      {/* Desktop Floating Sidebar */}
      <div className="hidden md:flex flex-col justify-center flex-shrink-0 z-40 relative h-full p-4">
        <Sidebar onClose={() => {}} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        {/* Mobile Header & Sticky Nav (Hidden on Desktop) */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-bg-card)] z-50 flex flex-col border-b border-[var(--color-border)] shadow-sm">
          {/* Top Logo & Burger Menu Button */}
          <div className="py-3 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--color-border)] w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none"></div>
            <Link href="/" className="flex items-center gap-2 relative z-10 cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-[14px] sm:text-[16px] tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] leading-tight whitespace-nowrap [filter:var(--shadow-text)]">BYZID APPARELS PVT LTD.</span>
                <span className="text-[10px] italic text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                  <span>Last updated data</span>
                  <span className="text-[var(--color-primary)] font-medium">{datePart}</span>
                </span>
              </div>
            </Link>
            
            {/* Top Right Header Controls */}
            <div className="flex items-center gap-2 ml-auto relative z-50">
              {/* Light / Dark Mode Icon Button */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/70 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:border-[var(--color-primary)]/30 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                aria-label="Toggle Light/Dark Mode"
                title="Toggle Light/Dark Mode"
              >
                {mode === 'dark' ? (
                  <Sun size={17} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                ) : (
                  <Moon size={17} className="text-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.6)]" />
                )}
              </button>

              {/* Premium Interactive Burger Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className={cn(
                  "relative p-2 rounded-xl transition-all duration-300 active:scale-95 border flex items-center justify-center overflow-hidden group shadow-sm",
                  isMobileMenuOpen 
                    ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/50 shadow-[0_0_12px_var(--color-primary-glow)]" 
                    : "bg-[var(--color-surface)]/70 text-[var(--color-text-main)] border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]"
                )}
                aria-label="Open mobile menu and theme selector"
              >
                <div className="relative z-10 flex items-center justify-center">
                  {isMobileMenuOpen ? (
                    <X size={18} className="transition-transform duration-300 rotate-90 scale-110" />
                  ) : (
                    <Menu size={18} className="transition-transform duration-300 group-hover:scale-105" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Minimal Fit-to-Frame Top Nav Bar */}
          <nav className="flex items-center justify-between w-full px-2 sm:px-4 py-2.5 bg-[var(--color-bg-card)] overflow-hidden shrink-0">
            {navItems.filter(item => ['Dashboard', 'Hourly', 'Lines', 'Archive'].includes(item.name)).map((item, index, arr) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Fragment key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 text-center flex-1 py-1.5 sm:py-2 rounded-lg flex items-center justify-center overflow-hidden",
                      isActive 
                        ? "text-[var(--color-primary)] drop-shadow-[0_0_8px_var(--color-primary-glow)]" 
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
                    )}
                  >
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                          <div className="absolute inset-[-150%] animate-[spin_3s_linear_infinite] opacity-90"
                               style={{ background: 'conic-gradient(from 0deg, transparent 60%, var(--color-primary) 100%)' }}>
                          </div>
                        </div>
                        <div className="absolute inset-[2px] rounded-[6px] bg-[var(--color-bg-card)] shadow-[0_0_15px_var(--color-primary-glow)_inset]"></div>
                      </>
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                  {index < arr.length - 1 && (
                    <div className="w-[1px] h-4 sm:h-5 bg-gradient-to-b from-transparent via-[var(--color-text-muted)] to-transparent opacity-40 mx-1 sm:mx-2 flex-shrink-0"></div>
                  )}
                </Fragment>
              );
            })}
          </nav>

          {/* Burger Dropdown Menu with Theme & Appearance Selector */}
          {isMobileMenuOpen && (
            <>
              <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="absolute top-14 right-3 w-60 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col p-3 animate-[fade-down_0.2s_ease-out_both] z-[100] origin-top-right space-y-3">
                {/* Additional Navigation Links */}
                <div className="flex flex-col gap-1 pb-2 border-b border-[var(--color-border)]">
                  {navItems.filter(item => ['Analytics', 'Simulator'].includes(item.name)).map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-xs tracking-widest uppercase transition-all",
                        pathname.startsWith(item.href)
                          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] shadow-sm"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                      )}
                    >
                      <item.icon size={16} />
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* THEME SELECTOR IN BURGER MENU */}
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 px-1">
                    Visual Theme
                  </p>
                  <div className="space-y-1">
                    {VISUAL_THEMES.map((t) => {
                      const isSelected = visualTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setVisualTheme(t.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            isSelected
                              ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold shadow-sm"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-3 h-3 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                              isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                            )}>
                              {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                            </div>
                            <span>{t.name}</span>
                          </div>
                          <span 
                            className="w-2 h-2 rounded-full shrink-0 shadow-sm" 
                            style={{ backgroundColor: t.color }} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* APPEARANCE MODE IN BURGER MENU */}
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 px-1">
                    Appearance Mode
                  </p>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                    {APPEARANCE_MODES.map((m) => {
                      const isSelected = mode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMode(m.id)}
                          className={cn(
                            "py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all",
                            isSelected
                              ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 shadow-sm"
                              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                          )}
                        >
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full border flex items-center justify-center shrink-0",
                            isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                          )}>
                            {isSelected && <div className="w-0.5 h-0.5 rounded-full bg-white" />}
                          </div>
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-y-auto w-full pt-[115px] md:pt-8 p-4 md:p-8 relative"
        >
          <div className="w-full h-full max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
