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
      "w-[280px] h-full flex flex-col bg-[var(--color-bg-card)] border-r border-[var(--color-border)] transition-colors duration-300 relative z-40"
    )}>
      {/* Brand Header */}
      <div className="px-6 py-8 flex flex-col gap-8">
        <Link href="/" className="flex flex-col gap-0.5 group cursor-pointer w-fit">
          <span className="font-black text-[18px] tracking-[0.2em] uppercase text-[var(--color-text-main)] leading-tight whitespace-nowrap transition-colors group-hover:text-[var(--color-primary)]">
            BYZID APPARELS
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-[0.4em] uppercase">
            PVT LTD
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto hide-scrollbar">
        <div className="px-3 mb-4 mt-2">
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] tracking-[0.2em] uppercase">Overview</p>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                isActive 
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]")} />
              <span className={cn("text-sm tracking-wide md:font-bold", isActive ? "font-bold" : "font-medium")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 flex flex-col gap-4 border-t border-[var(--color-border)]">
        {/* Minimal Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] group w-full"
        >
          <span className="text-sm font-medium tracking-wide">Appearance</span>
          {theme === 'dark' ? <Sun size={16} className="group-hover:text-yellow-400 transition-colors" /> : <Moon size={16} className="group-hover:text-blue-500 transition-colors" />}
        </button>

        {/* Minimal System Status */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
              <Ship size={16} className="text-[var(--color-text-main)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--color-text-main)]">Bapl OS</span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-widest uppercase">v2.0.4</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-bold text-[var(--color-text-main)] tracking-wider uppercase">System Online</span>
            </div>
          </div>
          
          <div>
            <p className="text-[9px] text-[var(--color-text-muted)] font-medium tracking-wide uppercase">{updateText}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
