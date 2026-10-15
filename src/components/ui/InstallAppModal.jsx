"use client";

import React from 'react';
import { Share, PlusSquare, X, Smartphone, Zap, Check, ArrowRight } from 'lucide-react';

export function InstallAppModal({ isOpen, isIOS, canInstallDirectly, onInstall, onDismiss }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9985] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-[fade-in_0.25s_ease-out] md:hidden select-none">
      <div 
        className="bg-[var(--color-bg-card)] rounded-3xl p-5 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl relative overflow-hidden animate-[fade-up_0.35s_cubic-bezier(0.16,1,0.3,1)]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 35px var(--color-primary-glow, rgba(79,140,255,0.18))'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Ambient glow behind header */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-28 bg-[var(--color-primary)]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header with App Title & 3D Web App Icon */}
        <div className="flex items-center gap-3.5 mb-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-950/40 shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
              Instant OTA Web App
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--color-text-main)] tracking-tight leading-tight">
              Add BAPL to Home Screen
            </h3>
          </div>
        </div>

        {/* Value Proposition Description */}
        <div className="relative z-10 mb-4">
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Install the official web app for real-time factory operations with instant over-the-air updates, full-screen view, and zero download delay.
          </p>
        </div>

        {/* Platform-Specific Section */}
        <div className="relative z-10 mb-5">
          {isIOS ? (
            /* iOS Safari Step-by-Step Instructions (Zero strokes, clean typography) */
            <div className="bg-[var(--color-surface)]/60 rounded-2xl p-3.5 space-y-2.5 text-xs text-[var(--color-text-main)]">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Install on iPhone / iPad:
              </p>
              
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>
                  Tap the <strong className="text-[var(--color-primary)] inline-flex items-center gap-1">Share <Share size={12} className="inline" /></strong> icon in your Safari bottom menu.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>
                  Scroll down and tap <strong className="text-emerald-400 inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={12} className="inline" /></strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>
                  Tap <strong className="text-[var(--color-primary)]">Add</strong> in the top right corner.
                </span>
              </div>
            </div>
          ) : !canInstallDirectly ? (
            /* Android Browser Guided Steps when Direct Prompt isn't fired yet */
            <div className="bg-[var(--color-surface)]/60 rounded-2xl p-3.5 space-y-2.5 text-xs text-[var(--color-text-main)]">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Add to Android Home Screen:
              </p>
              
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>
                  Tap the <strong className="text-[var(--color-text-main)]">⋮ Menu</strong> button in Chrome / browser top right.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>
                  Select <strong className="text-emerald-400">Install app</strong> or <strong className="text-emerald-400">Add to Home screen</strong>.
                </span>
              </div>
            </div>
          ) : (
            /* Android / Chrome Benefits (Zero strokes, clean cards) */
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-secondary)]">
              <div className="bg-[var(--color-surface)]/50 rounded-xl p-2.5 flex items-center gap-2">
                <Zap size={14} className="text-amber-400 shrink-0" />
                <span className="font-semibold text-[var(--color-text-main)]">Instant OTA Updates</span>
              </div>
              <div className="bg-[var(--color-surface)]/50 rounded-xl p-2.5 flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span className="font-semibold text-[var(--color-text-main)]">Full Screen View</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons (Zero strokes, clean gradients) */}
        <div className="flex flex-col gap-2 relative z-10">
          {!isIOS && canInstallDirectly && onInstall ? (
            <button
              type="button"
              onClick={onInstall}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              <PlusSquare className="w-4 h-4 shrink-0" />
              <span>Add Web App to Home Screen</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Got It</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {!isIOS && canInstallDirectly && (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-all cursor-pointer text-center"
            >
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
