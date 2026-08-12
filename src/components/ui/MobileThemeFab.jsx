"use client";

import React, { useState } from 'react';
import { Palette, Sun, Moon, X, Check } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/components/layout/Sidebar';

export function MobileThemeFab() {
  const [isOpen, setIsOpen] = useState(false);
  const { visualTheme, setVisualTheme, mode, setMode, VISUAL_THEMES, APPEARANCE_MODES } = useTheme();

  return (
    <>
      {/* Floating Action Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 right-5 z-40 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Theme Settings"
          className="w-12 h-12 rounded-full bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary-glow)] flex items-center justify-center text-[var(--color-primary)] transition-all duration-300 active:scale-95 hover:brightness-110"
        >
          <Palette className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
        </button>
      </div>

      {/* Compact Mobile Bottom Sheet / Popover */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          {/* Backdrop overlay */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-sm bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-5 shadow-2xl overflow-hidden z-10 animate-[scale-up_0.25s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--color-primary)]" />
                <h3 className="text-sm font-bold tracking-wider uppercase text-[var(--color-text-main)]">
                  Appearance & Theme
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* VISUAL THEME SELECTOR */}
            <div className="mb-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-2.5">
                Visual Theme
              </p>
              <div className="grid grid-cols-2 gap-2">
                {VISUAL_THEMES.map((t) => {
                  const isSelected = visualTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setVisualTheme(t.id)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95",
                        isSelected
                          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm"
                          : "bg-[var(--color-surface)]/50 text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-surface)]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {/* Custom Radio Circle */}
                        <div className={cn(
                          "w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0",
                          isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                        )}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="truncate">{t.name}</span>
                      </div>
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: t.color }} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* APPEARANCE MODE SELECTOR */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-2.5">
                Appearance Mode
              </p>
              <div className="flex items-center gap-2 p-1 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                {APPEARANCE_MODES.map((m) => {
                  const isSelected = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95",
                        isSelected
                          ? "bg-[var(--color-bg-card)] text-[var(--color-primary)] border border-[var(--color-primary)]/40 shadow-md"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                      )}
                    >
                      {m.id === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
