"use client";

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('App runtime error caught by boundary:', error);
  }, [error]);

  let isBn = false;
  try {
    if (typeof window !== 'undefined') {
      isBn = localStorage.getItem('bapl_lang') === 'bn' || document.documentElement.getAttribute('lang') === 'bn';
    }
  } catch (e) {}

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Warning Icon: Pure icon with no shapeholder box around it, continuously animated */}
      <div className="mb-5 flex items-center justify-center">
        <AlertTriangle 
          className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 animate-warning-pulse" 
          strokeWidth={2.2} 
        />
      </div>

      <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-[var(--color-text-main)] mb-2 font-display">
        {isBn ? 'টেলিমেট্রি পুনরায় সংযোগ হচ্ছে' : 'Telemetry Resynchronizing'}
      </h2>

      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-sm mb-6 leading-relaxed">
        {isBn 
          ? 'কারখানা সার্ভার লিংকে সাময়িক নেটওয়ার্ক বিলম্ব হয়েছে। ফিড পুনরায় চালু করতে নিচে চাপুন।' 
          : 'The factory telemetry link encountered a temporary network delay. Tap below to refresh your dashboard feed.'}
      </p>

      {/* Action Buttons: Smaller in size, side-by-side with no text break on mobile */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => {
            if (reset) reset();
            else window.location.reload();
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 leading-tight"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{isBn ? 'ফিড রিলোড' : 'Reload Feed'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-main)] font-bold text-[11px] sm:text-xs uppercase tracking-wider border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 leading-tight"
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
        </button>
      </div>
    </div>
  );
}
