"use client";

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('App runtime error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-[var(--color-primary-glow)] border border-[var(--color-border)] flex items-center justify-center mb-5 text-[var(--color-primary)] shadow-lg animate-pulse">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--color-text-main)] mb-2 font-display">
        Telemetry Resynchronizing
      </h2>

      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-sm mb-6 leading-relaxed">
        The factory telemetry link encountered a temporary network delay. Tap below to refresh your dashboard feed.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (reset) reset();
            else window.location.reload();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Feed</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-main)] font-bold text-xs uppercase tracking-wider border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
}
