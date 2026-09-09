"use client";

import React from 'react';
import { useDensity } from '@/components/providers/DensityProvider';
import { cn } from '@/components/layout/Sidebar';
import { LayoutGrid, Table2, Layers } from 'lucide-react';

export function DensitySwitcher({ value, onChange, className = "" }) {
  const globalDensity = useDensity();
  const density = value || globalDensity.density;
  const setDensity = onChange || globalDensity.setDensity;

  const options = [
    { id: 'compact', label: 'Compact', icon: Table2 },
    { id: 'normal', label: 'Normal', icon: LayoutGrid },
    { id: 'detailed', label: 'Detailed', icon: Layers }
  ];

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
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9.5px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none",
              isActive
                ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] font-medium"
            )}
          >
            <Icon size={12} className={cn("sm:w-[13px] sm:h-[13px]", isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]")} />
            <span className="hidden md:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

