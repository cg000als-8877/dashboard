"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from './Sidebar';
import { RealTimeClock } from '@/components/ui/RealTimeClock';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useKpiData } from '@/utils/useKpiData';
import { format, parseISO } from 'date-fns';
import { Clock, LayoutDashboard, Factory, BarChart3, Ship, Download, Calendar, FileText, History, Sun, Moon } from 'lucide-react';
import { useMonth } from '@/components/providers/MonthProvider';
import { useTheme } from '@/components/ThemeProvider';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lines', href: '/lines', icon: Factory },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', href: '/simulator', icon: Ship },
  { name: 'Archive', href: '/archive', icon: History },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [showDates, setShowDates] = useState(false);
  const { dailyTrends } = useKpiData();
  const { selectedMonth, setSelectedMonth } = useMonth();
  const { theme, toggleTheme } = useTheme();

  let datePart = "Loading...";
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    // Lowercase 'do' for day with suffix (e.g. 26th), 'MMMM' for full month name, 'yyyy' for year
    datePart = format(parseISO(endDate), 'do MMMM, yyyy');
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[var(--color-bg-main)]">
      {/* Desktop Permanent Sidebar */}
      <div className="hidden md:block flex-shrink-0 z-40 relative h-full">
        <Sidebar onClose={() => {}} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        {/* Mobile Header & Sticky Nav (Hidden on Desktop) */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-bg-card)]/90 backdrop-blur-2xl z-40 flex flex-col border-b border-[var(--color-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
          {/* Top Logo Section */}
          <div className="py-3 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--color-border)] w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none"></div>
            <Link href="/" className="flex items-center gap-2 relative z-10 cursor-pointer">
              <div className="flex flex-col">
                <span className="font-black text-[13px] sm:text-[15px] tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] leading-tight whitespace-nowrap [filter:var(--shadow-text)]">BYZID APPARELS PVT LTD.</span>
                <span className="text-[9px] italic text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                  <span>Last updated data</span>
                  <span className="text-[var(--color-primary)] font-bold">{datePart}</span>
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 ml-auto relative z-10">
              <button onClick={toggleTheme} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setShowDates(!showDates)}
                className="flex flex-col justify-center items-center w-8 h-8 transition-all duration-300 z-50 active:scale-95 group"
              >
                <span className={cn(
                  "block transition-all duration-300 ease-out h-[2px] w-4 rounded-full",
                  showDates ? "rotate-45 translate-y-[3.5px] bg-[var(--color-primary)] shadow-[0_0_8px_rgba(79,140,255,0.6)]" : "bg-[var(--color-text-secondary)] group-hover:bg-[var(--color-text-main)] -translate-y-1"
                )}></span>
                <span className={cn(
                  "block transition-all duration-300 ease-out h-[2px] w-4 rounded-full",
                  showDates ? "opacity-0 translate-x-2" : "opacity-100 bg-[var(--color-text-secondary)] group-hover:bg-[var(--color-text-main)]"
                )}></span>
                <span className={cn(
                  "block transition-all duration-300 ease-out h-[2px] w-4 rounded-full",
                  showDates ? "-rotate-45 -translate-y-[3.5px] bg-[var(--color-primary)] shadow-[0_0_8px_rgba(79,140,255,0.6)]" : "bg-[var(--color-text-secondary)] group-hover:bg-[var(--color-text-main)] translate-y-1"
                )}></span>
              </button>
            </div>
          </div>

          {/* Sticky Horizontal Nav Bar */}
          <nav className="flex items-center justify-between gap-1 sm:gap-2 px-3 sm:px-4 py-2 overflow-x-auto hide-scrollbar w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex-1 text-center whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all",
                    isActive 
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[0_4px_14px_var(--color-primary-glow)]" 
                      : "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Slide-down RealTimeClock & Controls (Mobile Only) */}
          <div className="relative flex flex-col items-center w-full z-10 md:hidden">
            <div 
              className={`w-full overflow-hidden transition-all duration-500 ease-out bg-[var(--color-bg-card)]/95 backdrop-blur-3xl shadow-2xl flex flex-col items-center rounded-b-3xl border-b border-[var(--color-border)] ${showDates ? 'max-h-64 py-4 opacity-100 translate-y-0' : 'max-h-0 py-0 opacity-0 -translate-y-4'}`}
            >
              <div className="flex justify-center w-full mb-4">
                <RealTimeClock />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full pt-[115px] md:pt-8 p-4 md:p-8">
          <div className="w-full h-full max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
