"use client";

import React, { useState, useEffect } from 'react';

export function AppWelcomeSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if splash was already shown in this specific active session
    const hasSeenSplash = sessionStorage.getItem('bapl_splash_shown');
    if (hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Start fade-out sequence after 1.3s
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1300);

    // Completely unmount after fade transition completes (1.3s + 0.7s = 2.0s)
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('bapl_splash_shown', 'true');
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--color-bg-main)] select-none transition-all duration-700 ease-out ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, var(--color-surface, rgba(255,255,255,0.03)), var(--color-bg-main))'
      }}
    >
      {/* Background ambient lighting pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Centered Welcome Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        
        {/* Subtitle tag */}
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[var(--color-text-muted)] mb-3 animate-[fade-down_0.6s_ease-out_both]">
          BYZID APPARELS PVT LTD
        </p>

        {/* Big WELCOME Typography (Matching website font & theme) */}
        <h1 
          className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] pl-[0.25em] bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-text-main)] via-[var(--color-text-main)] to-[var(--color-primary)] drop-shadow-[0_4px_24px_var(--color-primary-glow,rgba(79,140,255,0.3))] animate-[fade-up_0.7s_ease-out_both]"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          WELCOME
        </h1>

        {/* Sleek charging progress line */}
        <div className="w-36 sm:w-48 h-[2.5px] bg-[var(--color-border)] rounded-full overflow-hidden mt-6 relative shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-[var(--color-primary)] to-[var(--color-primary)] rounded-full animate-[progress_1.3s_cubic-bezier(0.4,0,0.2,1)_forwards]"
            style={{
              boxShadow: '0 0 12px var(--color-primary)'
            }}
          />
        </div>

        {/* System initializing caption */}
        <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-[var(--color-text-secondary)] mt-3 opacity-70 animate-pulse">
          Loading Operations
        </span>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            transform: translateX(-20%);
          }
          50% {
            width: 60%;
          }
          100% {
            width: 100%;
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
