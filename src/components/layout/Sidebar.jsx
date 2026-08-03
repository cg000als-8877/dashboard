"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Factory, BarChart3, FileText, Settings, Ship, Download, Calendar, History, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMonth } from '@/components/providers/MonthProvider';
import { RealTimeClock } from '@/components/ui/RealTimeClock';
import { useKpiData } from '@/utils/useKpiData';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@/components/ThemeProvider';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lines', href: '/lines', icon: Factory },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', href: '/simulator', icon: Ship },
  { name: 'Archive', href: '/archive', icon: History },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { dailyTrends } = useKpiData();
  const { selectedMonth, setSelectedMonth } = useMonth();
  const { theme, toggleTheme } = useTheme();

  let updateText = "Loading...";
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    const formattedDate = format(parseISO(endDate), 'do MMMM, yyyy');
    updateText = `Last updated data ${formattedDate}`;
  }

  return (
    <aside className={cn(
      "relative bg-[var(--color-bg-card)]/80 backdrop-blur-3xl transition-all duration-300",
      "w-72 border-r border-[var(--color-border)] h-full flex flex-col pt-8 pb-6 shadow-[10px_0_30px_rgba(0,0,0,0.1)]"
    )}>
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-48 bg-[var(--color-primary)] opacity-[0.03] blur-3xl pointer-events-none"></div>

      <div className="px-6 mb-10 flex flex-col gap-8 relative z-10">
        <Link href="/" className="flex flex-col gap-1 group cursor-pointer mt-2 relative">
          <span className="font-bold text-[18px] tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] leading-tight whitespace-nowrap [filter:var(--shadow-text)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_var(--color-primary-glow)]">
            BYZID APPARELS
          </span>
          <span className="text-[11px] text-[var(--color-primary)] font-bold tracking-[0.35em] uppercase">
            PVT LTD
          </span>
        </Link>
        
        <div className="flex md:hidden flex-col gap-2 w-full p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-inner">
          <RealTimeClock />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 relative z-10">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] tracking-widest uppercase">Overview</p>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-light relative overflow-hidden",
                isActive 
                  ? "text-[var(--color-text-main)] bg-[var(--color-surface-hover)]" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_10px_var(--color-primary)]"></div>
              )}
              
              <div className={cn(
                "flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-[var(--color-primary)] drop-shadow-[0_0_8px_var(--color-primary-glow)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
              )}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={cn(
                "transition-transform duration-300",
                !isActive && "group-hover:translate-x-1"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto relative z-10 flex flex-col gap-4">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
        >
          <span className="text-sm font-light">{theme === 'dark' ? 'Day Mode' : 'Night Mode'}</span>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden group hover:bg-[var(--color-surface-hover)] transition-colors duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-[0.05] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity duration-300"></div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Ship size={14} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-main)] tracking-wide">Bapl OS</p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-light tracking-wider uppercase mt-0.5">v2.0.4</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-secondary)] font-light">System Status</span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[10px] font-medium text-[var(--color-success-text)] tracking-wider uppercase">Online</span>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-[11px] text-[var(--color-text-muted)] font-light tracking-wide lowercase first-letter:uppercase">{updateText}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
