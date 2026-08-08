"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Factory, BarChart3, FileText, Settings, Ship, Download, Calendar, History, Sun, Moon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
  { name: 'Hourly', href: '/hourly', icon: Clock },
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
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  let updateDate = "";
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    updateDate = format(parseISO(endDate), 'do MMMM, yyyy');
  }

  return (
    <aside className={cn(
      "flex flex-col transition-all duration-300 relative z-40",
      isCollapsed ? "w-[72px]" : "w-[220px]"
    )}>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3.5 top-8 z-50 h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-md hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-text-secondary)] transition-all duration-300 hover:shadow-[0_0_12px_rgba(37,99,235,0.3)]"
        title={isCollapsed ? "Expand Sidebar" : "Hide Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>

      {/* The main sidebar box */}
      <div className="flex flex-col w-full h-fit max-h-[calc(100vh-32px)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Brand Header */}
        <div className={cn("py-5 flex flex-col shrink-0 border-b border-[var(--color-border)]/50 mx-4 mb-1", isCollapsed ? "px-0 items-center mx-2" : "px-2")}>
          <Link href="/" className={cn("flex flex-col group cursor-pointer w-fit", isCollapsed ? "items-center gap-1" : "gap-0.5")}>
            {isCollapsed ? (
              <Ship size={24} className="text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors" />
            ) : (
              <>
                <span className="font-black text-[14px] tracking-[0.15em] uppercase text-[var(--color-text-main)] leading-tight whitespace-nowrap transition-colors group-hover:text-[var(--color-primary)]">
                  BYZID APPARELS
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-[0.4em] uppercase">
                  PVT LTD
                </span>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-0.5 overflow-y-auto hide-scrollbar", isCollapsed ? "px-2" : "px-2")}>
          <div className={cn("mb-2 mt-2 transition-all duration-300", isCollapsed ? "px-0 text-center" : "px-3")}>
            <div className="flex items-center gap-2">
              {!isCollapsed && <div className="h-px w-2 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-60"></div>}
              <p className={cn("text-[9px] font-bold text-[var(--color-text-muted)] uppercase", isCollapsed ? "tracking-widest" : "tracking-[0.2em]")}>
                {isCollapsed ? "Nav" : "Main Menu"}
              </p>
            </div>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-300 relative group overflow-hidden",
                  isCollapsed ? "justify-center p-2.5 my-1" : "px-3 py-2.5 gap-3 mx-1 my-0.5",
                  isActive 
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)] font-medium"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"
                )}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {!isCollapsed && (
                  <span className="text-[13px] tracking-wide whitespace-nowrap group-hover:translate-x-1 transition-transform duration-300">
                    {item.name}
                  </span>
                )}
                {!isCollapsed && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_8px_var(--color-primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className={cn("p-3 flex flex-col gap-3 border-t border-[var(--color-border)] shrink-0", isCollapsed && "items-center px-2")}>
          {/* Minimal Theme Toggle */}
          <button 
            onClick={toggleTheme}
            title={isCollapsed ? "Toggle Theme" : undefined}
            className={cn(
              "flex items-center rounded-xl hover:bg-[var(--color-surface-hover)] transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] group",
              isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2 mx-1"
            )}
          >
            {!isCollapsed && <span className="text-[13px] font-medium tracking-wide whitespace-nowrap">Appearance</span>}
            <div className="group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
              {theme === 'dark' ? <Sun size={16} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" /> : <Moon size={16} className="text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />}
            </div>
          </button>

          {/* Compact System Status */}
          {!isCollapsed && (
            <div className="mx-1 px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-1.5 group hover:border-[var(--color-primary)]/40 transition-colors cursor-default relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-[var(--color-primary)]/5 rounded-full blur-xl group-hover:bg-[var(--color-primary)]/10 transition-all duration-500" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                  </span>
                  <span className="text-[11px] font-bold text-[var(--color-text-main)] tracking-wider">System Online</span>
                </div>
                <span className="text-[9px] text-[var(--color-text-muted)] font-bold bg-[var(--color-bg-card)] px-1.5 py-0.5 rounded-md border border-[var(--color-border)] shadow-sm">
                  v2.0.4
                </span>
              </div>
              <p className="text-[8px] text-[var(--color-text-muted)] font-medium tracking-wider uppercase truncate relative z-10">
                {updateDate ? `Updated: ${updateDate}` : "Loading data..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
