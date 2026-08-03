"use client";

import { useState, Fragment } from 'react';
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
                <span className="font-bold text-[13px] sm:text-[15px] tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] leading-tight whitespace-nowrap [filter:var(--shadow-text)]">BYZID APPARELS PVT LTD.</span>
                <span className="text-[9px] italic text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                  <span>Last updated data</span>
                  <span className="text-[var(--color-primary)] font-medium">{datePart}</span>
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 ml-auto relative z-10">
              <button onClick={toggleTheme} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Minimal Fit-to-Frame Top Nav Bar */}
          <nav className="flex items-center justify-between w-full px-2 sm:px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-card)]/90 backdrop-blur-2xl overflow-hidden">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Fragment key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 text-center flex-1 py-1.5 sm:py-2 rounded-lg flex items-center justify-center overflow-hidden",
                      isActive 
                        ? "text-[var(--color-primary)] drop-shadow-[0_0_6px_var(--color-primary)]" 
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
                    )}
                  >
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-lg overflow-hidden border border-transparent">
                          <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] opacity-70"
                               style={{ background: 'conic-gradient(from 0deg, transparent 70%, var(--color-primary) 100%)' }}>
                          </div>
                        </div>
                        <div className="absolute inset-[1px] rounded-[7px] bg-[var(--color-bg-card)] backdrop-blur-xl"></div>
                      </>
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                  {index < navItems.length - 1 && (
                    <div className="w-[1px] h-4 sm:h-5 bg-gradient-to-b from-transparent via-[var(--color-text-muted)] to-transparent opacity-40 mx-1 sm:mx-2 flex-shrink-0"></div>
                  )}
                </Fragment>
              );
            })}
          </nav>
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
