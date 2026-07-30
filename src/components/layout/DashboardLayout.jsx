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
import { ChevronDown, ChevronUp } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Lines', href: '/lines' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Simulator', href: '/simulator' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [showDates, setShowDates] = useState(false);
  const { dailyTrends } = useKpiData();

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
          <div className="h-12 px-2 sm:px-4 flex items-center justify-center border-b border-[rgba(255,255,255,0.02)] w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent pointer-events-none"></div>
            <Link href="/" className="flex items-center gap-2 relative z-10 cursor-pointer">
              <img src="/logo.png" alt="BAPL Logo" className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-cover shadow-[0_0_15px_var(--color-primary)] flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-black text-[10px] sm:text-[13px] tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight whitespace-nowrap drop-shadow-md">BYZID APPARELS</span>
              </div>
            </Link>
          </div>

          {/* Sticky Horizontal Nav Bar */}
          <nav className="flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-2 py-1.5 sm:py-2 overflow-x-auto hide-scrollbar w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                    isActive 
                      ? "bg-[rgba(79,140,255,0.15)] text-[var(--color-primary)] border border-[rgba(79,140,255,0.3)] shadow-[0_0_15px_rgba(79,140,255,0.2)]" 
                      : "bg-[rgba(255,255,255,0.02)] text-gray-500 border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
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

          {/* Floating Arrow & Slide-down RealTimeClock (Mobile Only) */}
          <div className="relative flex flex-col items-center w-full z-10 md:hidden">
            <div 
              className={`w-full overflow-hidden transition-all duration-500 ease-out bg-[rgba(10,13,20,0.9)] backdrop-blur-3xl border-b border-[rgba(255,255,255,0.05)] shadow-2xl flex items-center justify-center rounded-b-3xl ${showDates ? 'max-h-20 py-2 opacity-100 translate-y-0' : 'max-h-0 py-0 opacity-0 -translate-y-4'}`}
            >
              <RealTimeClock />
            </div>
            
            {/* The Arrow */}
            <button 
              onClick={() => setShowDates(!showDates)}
              className="absolute -bottom-4 transition-transform active:scale-90"
            >
              <ChevronDown size={20} className={`text-gray-400 drop-shadow-md transition-transform duration-500 ${showDates ? 'rotate-180' : ''}`} />
            </button>
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
