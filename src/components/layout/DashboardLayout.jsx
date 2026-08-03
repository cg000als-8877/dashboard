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
import { Clock, LayoutDashboard, Factory, BarChart3, Ship, Download, Calendar, FileText } from 'lucide-react';
import { useMonth } from '@/components/providers/MonthProvider';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lines', href: '/lines', icon: Factory },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', href: '/simulator', icon: Ship },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [showDates, setShowDates] = useState(false);
  const { dailyTrends } = useKpiData();
  const { selectedMonth, setSelectedMonth } = useMonth();

  let updateText = "Loading...";
  if (dailyTrends && dailyTrends.length > 0) {
    const endDate = dailyTrends[dailyTrends.length - 1].date;
    // Lowercase 'do' for day with suffix (e.g. 26th), 'MMMM' for full month name, 'yyyy' for year
    const formattedDate = format(parseISO(endDate), 'do MMMM, yyyy');
    updateText = `Last updated data ${formattedDate}`;
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[var(--color-bg-main)]">
      {/* Desktop Permanent Sidebar */}
      <div className="hidden md:block flex-shrink-0 z-40 relative h-full">
        <Sidebar onClose={() => {}} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        {/* Mobile Header & Sticky Nav (Hidden on Desktop) */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-[rgba(10,13,20,0.8)] backdrop-blur-2xl z-40 flex flex-col border-b border-[rgba(255,255,255,0.05)] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {/* Top Logo Section */}
          <div className="py-3 px-4 sm:px-6 flex items-center justify-between border-b border-[rgba(255,255,255,0.02)] w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.03)] to-transparent pointer-events-none"></div>
            <Link href="/" className="flex items-center gap-2 relative z-10 cursor-pointer">
              <div className="flex flex-col">
                <span className="font-black text-[13px] sm:text-[15px] tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight whitespace-nowrap drop-shadow-md">BYZID APPARELS PVT LTD.</span>
              </div>
            </Link>
            <button 
              onClick={() => setShowDates(!showDates)}
              className="flex flex-col justify-center items-center w-8 h-8 transition-all duration-300 z-50 active:scale-95 group ml-auto"
            >
              <span className={cn(
                "block transition-all duration-300 ease-out h-[2px] w-4 rounded-full",
                showDates ? "rotate-45 translate-y-[3.5px] bg-[var(--color-primary)] shadow-[0_0_8px_rgba(79,140,255,0.6)]" : "bg-gray-300 group-hover:bg-white -translate-y-1"
              )}></span>
              <span className={cn(
                "block transition-all duration-300 ease-out h-[2px] w-4 rounded-full",
                showDates ? "opacity-0 translate-x-2" : "opacity-100 bg-gray-300 group-hover:bg-white"
              )}></span>
              <span className={cn(
                "block transition-all duration-300 ease-out h-[2px] w-4 rounded-full",
                showDates ? "-rotate-45 -translate-y-[3.5px] bg-[var(--color-primary)] shadow-[0_0_8px_rgba(79,140,255,0.6)]" : "bg-gray-300 group-hover:bg-white translate-y-1"
              )}></span>
            </button>
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
                    "flex-1 text-center whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all",
                    isActive 
                      ? "bg-[rgba(79,140,255,0.15)] text-[var(--color-primary)] border border-[rgba(79,140,255,0.3)] shadow-[0_0_15px_rgba(79,140,255,0.2)]" 
                      : "bg-transparent text-gray-400 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile only update status top */}
          <div className="w-full text-center pb-1 pt-0.5">
            <span className="text-[10px] italic text-gray-400 lowercase first-letter:uppercase">
              {updateText}
            </span>
          </div>

          {/* Slide-down RealTimeClock & Controls (Mobile Only) */}
          <div className="relative flex flex-col items-center w-full z-10 md:hidden">
            <div 
              className={`w-full overflow-hidden transition-all duration-500 ease-out bg-[rgba(10,13,20,0.95)] backdrop-blur-3xl shadow-2xl flex flex-col items-center rounded-b-3xl border-b border-[rgba(255,255,255,0.05)] ${showDates ? 'max-h-64 py-4 opacity-100 translate-y-0' : 'max-h-0 py-0 opacity-0 -translate-y-4'}`}
            >
              <div className="flex justify-center w-full mb-4">
                <RealTimeClock />
              </div>
              
              {/* Controls */}
              <div className="w-full px-4 flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      onClick={() => setSelectedMonth('live')}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-300 text-left",
                        selectedMonth === 'live' 
                          ? "bg-[rgba(79,140,255,0.15)] text-[var(--color-primary)] border border-[rgba(79,140,255,0.3)] shadow-[0_0_15px_rgba(79,140,255,0.15)]" 
                          : "bg-[rgba(0,0,0,0.2)] text-gray-500 border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] hover:text-gray-300"
                      )}
                    >
                      <Calendar size={14} className={selectedMonth === 'live' ? "text-[var(--color-primary)]" : "text-gray-600"} />
                      August 2026 (Live)
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      onClick={() => setSelectedMonth('2026-07')}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-300 text-left",
                        selectedMonth === '2026-07' 
                          ? "bg-[rgba(79,140,255,0.15)] text-[var(--color-primary)] border border-[rgba(79,140,255,0.3)] shadow-[0_0_15px_rgba(79,140,255,0.15)]" 
                          : "bg-[rgba(0,0,0,0.2)] text-gray-500 border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] hover:text-gray-300"
                      )}
                    >
                      <Calendar size={14} className={selectedMonth === '2026-07' ? "text-[var(--color-primary)]" : "text-gray-600"} />
                      July 2026 (Archive)
                    </button>
                    <button 
                      onClick={() => window.open('https://drive.google.com/file/d/1GWGOeDtG3mvxW7T8y0w64UHg75jBR-Bv/view?usp=sharing', '_blank')}
                      title="Download Archive PDF"
                      className="flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 bg-[rgba(239,68,68,0.1)] text-red-400 border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)] hover:text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] group"
                    >
                      <FileText size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full pt-[130px] md:pt-8 p-4 md:p-8">
          <div className="w-full h-full max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
