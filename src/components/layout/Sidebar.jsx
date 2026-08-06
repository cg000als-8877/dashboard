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
        <div className={cn("py-6 flex flex-col gap-6 shrink-0 border-b border-[var(--color-border)]/50 mx-4 mb-2", isCollapsed ? "px-0 items-center mx-2" : "px-2")}>
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
        <nav className={cn("flex-1 space-y-0.5 overflow-y-auto hide-scrollbar", isCollapsed ? "px-2" : "px-3")}>

          <div className={cn("mb-2 mt-3 transition-all duration-300", isCollapsed ? "px-0 text-center" : "px-2")}>
            <div className="flex items-center gap-2">
              {!isCollapsed && <div className="h-px w-3 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-60"></div>}
              <p className={cn("text-[9px] font-bold text-[var(--color-text-muted)] uppercase", isCollapsed ? "tracking-widest" : "tracking-[0.25em]")}>
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
                  isCollapsed ? "justify-center p-3 my-1" : "px-3 py-3 gap-3 my-1",
                  isActive 
                    ? "bg-gradient-to-r from-[var(--color-primary)]/15 to-transparent text-[var(--color-primary)] shadow-[inset_3px_0_0_0_var(--color-primary)]" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)] hover:shadow-[inset_3px_0_0_0_var(--color-border)]"
                )}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] shrink-0")} />
                {!isCollapsed && (
                  <span className={cn("text-sm tracking-wide md:font-bold whitespace-nowrap overflow-hidden", isActive ? "font-bold" : "font-medium")}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className={cn("p-4 flex flex-col gap-4 border-t border-[var(--color-border)] shrink-0", isCollapsed && "items-center px-2")}>
          {/* Minimal Theme Toggle */}
          <button 
            onClick={toggleTheme}
            title={isCollapsed ? "Toggle Theme" : undefined}
            className={cn(
              "flex items-center rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] group",
              isCollapsed ? "justify-center p-3" : "justify-between px-3 py-2.5 w-full"
            )}
          >
            {!isCollapsed && <span className="text-sm font-medium tracking-wide whitespace-nowrap overflow-hidden">Appearance</span>}
            {theme === 'dark' ? <Sun size={16} className="group-hover:text-yellow-400 transition-colors shrink-0" /> : <Moon size={16} className="group-hover:text-blue-500 transition-colors shrink-0" />}
          </button>

          {/* Minimal System Status */}
          {!isCollapsed && (
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-3">
              {/* Desktop Update Text (Top) */}
              <div className="hidden md:block whitespace-nowrap overflow-hidden pb-2 border-b border-[var(--color-border)]">
                <p className="text-[7.5px] text-[var(--color-text-muted)] font-medium tracking-wide uppercase truncate">
                  {updateDate ? (
                    <>Last updated <span className="text-[var(--color-primary)] font-bold">{updateDate}</span></>
                  ) : (
                    "Loading..."
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                  <Ship size={16} className="text-[var(--color-text-main)]" />
                </div>
                <div className="flex flex-col whitespace-nowrap overflow-hidden">
                  <span className="text-sm font-bold text-[var(--color-text-main)]">Bapl OS</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-widest uppercase">v2.0.4</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-[10px] font-bold text-[var(--color-text-main)] tracking-wider uppercase">System Online</span>
                </div>
              </div>
              
              {/* Mobile Update Text (Bottom) */}
              <div className="whitespace-nowrap overflow-hidden md:hidden">
                <p className="text-[9px] text-[var(--color-text-muted)] font-medium tracking-wide uppercase truncate">
                  {updateDate ? `Last updated ${updateDate}` : "Loading..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
