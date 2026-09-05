"use client";

import React from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export function InstallAppModal({ isOpen, isIOS, onInstall, onDismiss }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9985] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-[fade-in_0.25s_ease-out] md:hidden">
      <div 
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl relative overflow-hidden animate-[fade-up_0.35s_cubic-bezier(0.16,1,0.3,1)]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 35px var(--color-primary-glow, rgba(79,140,255,0.18))'
        }}
      >
        {/* Close X Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Ambient background glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-52 h-24 bg-[var(--color-primary)]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header with App Title & Icon */}
        <div className="flex items-center gap-3.5 mb-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-950/40 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">
                Web App
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[var(--color-text-main)] tracking-tight leading-tight">
              Install BAPL Dashboard
            </h3>
          </div>
        </div>

        {/* Modal Description & Platform Specific Instructions */}
        <div className="relative z-10 mb-5">
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
            Install on your home screen for instant fullscreen access, faster load times, and real-time factory alerts.
          </p>

          {isIOS ? (
            /* iOS Safari Step-by-Step Instructions */
            <div className="bg-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl p-3.5 space-y-2.5 text-xs text-[var(--color-text-main)]">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Install on iPhone / iPad:
              </p>
              
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>
                  Tap the <strong className="text-blue-400 inline-flex items-center gap-1">Share <Share size={12} className="inline" /></strong> icon in your Safari bottom menu.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>
                  Scroll down and tap <strong className="text-emerald-400 inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={12} className="inline" /></strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>
                  Tap <strong className="text-[var(--color-primary)]">Add</strong> in the top right corner.
                </span>
              </div>
            </div>
          ) : (
            /* Android / Chrome Benefits */
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-secondary)]">
              <div className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span className="font-semibold">Fast 1-Tap Launch</span>
              </div>
              <div className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-xl p-2.5 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span className="font-semibold">Full Screen View</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 relative z-10">
          {!isIOS && onInstall && (
            <button
              type="button"
              onClick={onInstall}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install App Now</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer text-center ${
              isIOS ? 'bg-[var(--color-surface)] text-[var(--color-text-main)] font-bold py-3 mt-1' : ''
            }`}
          >
            {isIOS ? 'Got It, Thanks' : 'Maybe Later'}
          </button>
        </div>
      </div>
    </div>
  );
}
