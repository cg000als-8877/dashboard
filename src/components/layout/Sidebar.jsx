"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Factory, BarChart3, FileText, Settings, Ship } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RealTimeClock } from '@/components/ui/RealTimeClock';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lines', href: '/lines', icon: Factory },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Simulator', href: '/simulator', icon: Ship },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "relative bg-[rgba(10,13,20,0.4)] backdrop-blur-3xl transition-all duration-300",
      "w-72 border-r border-[rgba(255,255,255,0.05)] h-full flex flex-col pt-8 pb-6 shadow-[10px_0_30px_rgba(0,0,0,0.5)]"
    )}>
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-48 bg-[var(--color-primary)] opacity-[0.03] blur-3xl pointer-events-none"></div>

      <div className="px-6 mb-10 flex flex-col gap-8 relative z-10">
        <Link href="/" className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-1 bg-[var(--color-primary)] opacity-30 rounded-lg blur group-hover:opacity-60 transition duration-500"></div>
            <img src="/logo.png" alt="BAPL Logo" className="relative w-10 h-10 rounded-xl object-cover border border-[rgba(255,255,255,0.1)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-widest text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Byzid Apparels</span>
            <span className="text-[10px] text-[var(--color-primary)] font-semibold tracking-[0.2em] uppercase mt-0.5">PVT LTD</span>
          </div>
        </Link>
        
        <div className="flex flex-col gap-2 w-full p-3 rounded-2xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.03)] shadow-inner">
          <RealTimeClock />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 relative z-10">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Overview</p>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium relative overflow-hidden",
                isActive 
                  ? "text-white bg-gradient-to-r from-[rgba(79,140,255,0.15)] to-transparent" 
                  : "text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_10px_var(--color-primary)]"></div>
              )}
              
              <div className={cn(
                "flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(79,140,255,0.8)]" : "text-gray-500 group-hover:text-gray-300"
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

      <div className="p-6 mt-auto relative z-10">
        <div className="relative p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] overflow-hidden group hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-[0.05] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity duration-300"></div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[rgba(79,140,255,0.1)] flex items-center justify-center">
              <Ship size={14} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Bapl OS</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">v2.0.4</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">System Status</span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Online</span>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-[9px] text-gray-500 font-medium tracking-wide">Last updated data 25 july, 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
