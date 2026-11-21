"use client";

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/components/layout/Sidebar';

export function LanguageToggleSwitch({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <div 
      className={cn(
        "inline-flex items-center p-0.5 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] select-none shadow-xs transition-colors",
        className
      )}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 cursor-pointer border-0 outline-none select-none leading-none",
          lang === 'en'
            ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-xs"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-transparent"
        )}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang('bn')}
        className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 cursor-pointer border-0 outline-none select-none leading-none",
          lang === 'bn'
            ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)] shadow-xs"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-transparent"
        )}
        aria-pressed={lang === 'bn'}
      >
        বাং
      </button>
    </div>
  );
}
