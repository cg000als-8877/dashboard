"use client";

import React from 'react';
import { useDensity } from '@/components/providers/DensityProvider';
import { cn } from '@/components/layout/Sidebar';
import { LayoutGrid, LayoutList } from 'lucide-react';

export function DensitySwitcher({ value, onChange, options: customOptions, className = "" }) {
  const globalDensity = useDensity();
  const density = value || globalDensity.density;
  const setDensity = onChange || globalDensity.setDensity;

  const defaultOptions = [
    { id: 'compact', label: 'List', icon: LayoutList },
    { id: 'normal', label: 'Cards', icon: LayoutGrid }
  ];

  const options = customOptions || defaultOptions;

  return (
    <div className={cn("inline-flex items-center p-0.5 sm:p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl gap-0.5 sm:gap-1 shadow-sm backdrop-blur-md shrink-0", className)}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = density === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setDensity(opt.id)}
            title={`${opt.label} View Mode`}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[9.5px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none",
              isActive
                ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
            )}
          >
            <Icon size={13} className={cn("sm:w-[14px] sm:h-[14px]", isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]")} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

