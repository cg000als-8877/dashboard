"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Factory, 
  History, 
  BarChart3, 
  MoreHorizontal, 
  X 
} from 'lucide-react';
import { cn } from './Sidebar';

export function MobileBottomNav({ isOthersOpen, onToggleOthers, onOthersClose }) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isLines = pathname === '/lines' || pathname.startsWith('/lines/');
  const isAnalytics = pathname === '/analytics' || pathname.startsWith('/analytics/');
  const isArchive = pathname === '/archive' || pathname.startsWith('/archive/');
  const isOthers = isOthersOpen;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: isHome,
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
    <>
      {/* Progressive blur shield: makes website content totally blurred under the floating nav bar */}
      <div 
        aria-hidden="true"
        className="md:hidden fixed bottom-0 inset-x-0 h-24 pointer-events-none select-none z-40 backdrop-blur-xl"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          background: 'linear-gradient(to top, color-mix(in srgb, var(--color-bg-main) 70%, transparent) 0%, transparent 100%)'
        }}
      />

      {/* Floating Frosted Glass Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] inset-x-3.5 sm:inset-x-6 max-w-[430px] mx-auto z-50 pointer-events-auto select-none font-sans">
        <nav 
          className="flex items-center justify-between w-full h-[52px] px-2 rounded-full border shadow-xl transition-all"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-bg-card) 75%, transparent)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            borderColor: 'color-mix(in srgb, var(--color-border) 80%, rgba(255,255,255,0.18))',
            boxShadow: '0 12px 36px -4px rgba(0,0,0,0.35), 0 4px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.22)'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            const content = isActive ? (
              /* Active Page: shows Icon + Label in a theme-styled pill with crisp spring entrance and luxury sheen */
              <div 
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 overflow-hidden",
                  "bg-[var(--color-primary)]/15 dark:bg-[var(--color-primary)]/20",
                  "border border-[var(--color-primary)]/35 dark:border-[var(--color-primary)]/45",
                  "text-[var(--color-primary)]",
                  "shadow-[0_0_12px_var(--color-primary-glow)] animate-nav-active"
                )}
              >
                {/* Subtle luxury light sheen sweep (passes across without moving or breathing the pill) */}
                <span 
                  aria-hidden="true" 
                  className="absolute inset-0 pointer-events-none -translate-x-full animate-nav-sheen bg-gradient-to-r from-transparent via-white/18 to-transparent" 
                />

                <Icon 
                  size={16} 
                  strokeWidth={2.4} 
                  className={cn(
                    "shrink-0 transition-transform duration-200 relative z-10",
                    item.id === 'others' && isOthers && "rotate-90"
                  )} 
                />
                <span className="text-[10px] font-black uppercase tracking-wider leading-none select-none relative z-10 dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                  {item.label}
                </span>
              </div>
            ) : (
              /* Inactive Pages: shows ONLY Icon, no label */
              <div className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 text-slate-400 dark:text-[var(--color-text-muted)] hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-90">
                <Icon 
                  size={16} 
                  strokeWidth={1.8} 
                  className="shrink-0 transition-colors duration-200" 
                />
              </div>
            );

            if (item.isButton) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center justify-center p-0.5 outline-none cursor-pointer border-none bg-transparent"
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
                className="flex items-center justify-center p-0.5 outline-none cursor-pointer"
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default MobileBottomNav;
