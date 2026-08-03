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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                <span className="font-bold text-[14px] sm:text-[16px] tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] leading-tight whitespace-nowrap [filter:var(--shadow-text)]">BYZID APPARELS PVT LTD.</span>
                <span className="text-[10px] italic text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                  <span>Last updated data</span>
                  <span className="text-[var(--color-primary)] font-medium">{datePart}</span>
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 ml-auto relative z-50">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors p-2 relative z-50">
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Compressed Dropdown Menu */}
              {isMobileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMobileMenuOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-1 w-44 bg-[var(--color-bg-card)]/95 backdrop-blur-3xl border border-[var(--color-border)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex flex-col p-1.5 animate-[fade-down_0.2s_ease-out_both] z-50 origin-top-right">
                    <div className="flex flex-col gap-0.5">
                      {navItems.filter(item => ['Analytics', 'Simulator'].includes(item.name)).map(item => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all",
                            pathname.startsWith(item.href)
                              ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                          )}
                        >
                          <item.icon size={14} />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-1 pt-1 border-t border-[var(--color-border)] flex justify-between items-center px-2 py-1.5">
                      <span className="text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">Theme</span>
                      <button 
                        onClick={toggleTheme}
                        className="p-1.5 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] border border-transparent hover:border-[var(--color-border)]"
                      >
                        {theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-blue-500" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Minimal Fit-to-Frame Top Nav Bar */}
          <nav className="flex items-center justify-between w-full px-2 sm:px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-card)]/90 backdrop-blur-2xl overflow-hidden">
            {navItems.filter(item => ['Dashboard', 'Lines', 'Archive'].includes(item.name)).map((item, index, arr) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Fragment key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 text-center flex-1 py-1.5 sm:py-2 rounded-lg flex items-center justify-center overflow-hidden",
                      isActive 
                        ? "text-[var(--color-primary)] drop-shadow-[0_0_3px_rgba(37,99,235,0.3)]" 
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
                    )}
                  >
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-lg overflow-hidden border border-transparent">
                          <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] opacity-40"
                               style={{ background: 'conic-gradient(from 0deg, transparent 70%, var(--color-primary) 100%)' }}>
                          </div>
                        </div>
                        <div className="absolute inset-[1px] rounded-[7px] bg-[var(--color-bg-card)] backdrop-blur-xl"></div>
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
