"use client";

import React, { useState } from 'react';
import { RefreshCw, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export function AppUpdateModal({ isOpen, onUpdate, onDismiss }) {
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

  const handleApplyUpdate = async () => {
    setUpdating(true);
    try {
      await onUpdate();
    } catch (e) {
      console.error('Update apply error:', e);
      // Fallback reload
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fade-in_0.25s_ease-out]">
      <div 
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl relative overflow-hidden animate-[scale-up_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px var(--color-primary-glow, rgba(79,140,255,0.15))'
        }}
      >
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[var(--color-primary)]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Badge */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)] shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
            Live Update Ready
          </span>
        </div>

        {/* Text Details */}
        <div className="relative z-10 mb-6 space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-[var(--color-text-main)] tracking-tight">
            App Update Available
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            A new version of BAPL Dashboard has been released. Update now to install the newest telemetry data, charts, and operational optimizations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleApplyUpdate}
            disabled={updating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75"
          >
            {updating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Installing & Replacing Cache...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Update & Replace Now</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>

          {!updating && (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer text-center"
            >
              Remind Me Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
