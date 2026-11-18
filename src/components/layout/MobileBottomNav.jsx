"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Factory, 
  History, 
  BarChart3,
  MoreHorizontal,
  X
} from 'lucide-react';
import { cn } from './Sidebar';

export function MobileBottomNav({ isOthersOpen, onToggleOthers, onOthersClose }) {
  const pathname = usePathname();

  const isDashboard = pathname === '/';
  const isLines = pathname === '/lines' || pathname.startsWith('/lines/');
  const isAnalytics = pathname === '/analytics' || pathname.startsWith('/analytics/');
  const isArchive = pathname === '/archive' || pathname.startsWith('/archive/');
  const isOthers = isOthersOpen;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      isActive: isDashboard,
      onClick: () => onOthersClose?.()
    },
    {
      id: 'lines',
      label: 'Lines',
      href: '/lines',
      icon: Factory,
      isActive: isLines,
      onClick: () => onOthersClose?.()
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      isActive: isAnalytics,
      onClick: () => onOthersClose?.()
    },
    {
      id: 'archive',
      label: 'Archive',
      href: '/archive',
      icon: History,
      isActive: isArchive,
      onClick: () => onOthersClose?.()
    },
    {
      id: 'others',
      label: 'Others',
      icon: isOthers ? X : MoreHorizontal,
      isButton: true,
      isActive: isOthers,
      onClick: onToggleOthers
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 w-full z-50 pointer-events-auto select-none font-sans bg-[var(--color-bg-card)]/95 backdrop-blur-xl border-t border-[var(--color-border)] shadow-[0_-4px_24px_rgba(0,0,0,0.18)] pb-[env(safe-area-inset-bottom)] transition-all">
      <nav className="grid grid-cols-5 w-full h-[52px] items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          const content = (
            <div className="flex flex-col items-center justify-center w-full h-full relative py-1">
              {/* Active Top Bar Indicator */}
              {isActive && (
                <span 
                  className="absolute top-0 inset-x-0 mx-auto w-7 h-[2px] rounded-b-full bg-[var(--color-primary)] shadow-[0_1px_6px_var(--color-primary-glow)] animate-in fade-in duration-200" 
                />
              )}

              {/* Icon Capsule Pill */}
              <div 
                className={cn(
                  "px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center",
                  isActive 
                    ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary-glow)] ring-1 ring-[var(--color-primary)]/30 scale-105" 
                    : "bg-transparent text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]"
                )}
              >
                <Icon 
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.9}
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]",
                    item.id === 'others' && isOthers && "rotate-90 transition-transform duration-200"
                  )}
                />
              </div>

              {/* Small Label */}
              <span 
                className={cn(
                  "text-[8.5px] uppercase tracking-wider leading-none transition-colors duration-200 mt-0.5",
                  isActive 
                    ? "text-[var(--color-primary)] font-black" 
                    : "text-[var(--color-text-muted)] font-bold group-hover:text-[var(--color-text-main)]"
                )}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.isButton) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex items-center justify-center w-full h-full group active:scale-95 transition-transform cursor-pointer border-none bg-transparent outline-none p-0"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={item.onClick}
              className="flex items-center justify-center w-full h-full group active:scale-95 transition-transform cursor-pointer"
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default MobileBottomNav;
