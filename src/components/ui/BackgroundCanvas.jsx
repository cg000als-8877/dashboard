"use client";

import { useEffect, useRef, memo } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export const BackgroundCanvas = memo(function BackgroundCanvas() {
  const { bgEffect, mode, visualTheme } = useTheme();
  const containerRef = useRef(null);
  const isAbstract = visualTheme === 'abstract';

  useEffect(() => {
    const isEmberAurora = visualTheme === 'ember-tide' && (bgEffect === 'aurora' || bgEffect === 'ember-tide-aurora');
    if (bgEffect !== 'spotlight' && !isEmberAurora) return;

    let rafId = null;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.3;
    let currentX = targetX;
    let currentY = targetY;

    const handlePointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updatePosition = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--spotlight-x', `${currentX.toFixed(1)}px`);
        containerRef.current.style.setProperty('--spotlight-y', `${currentY.toFixed(1)}px`);
      }
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [bgEffect, visualTheme]);

  if (bgEffect === 'solid') {
    return null;
  }

  const isDark = mode !== 'light';
  const isEmberTheme = visualTheme === 'ember-tide';
  const showEmberTide = isEmberTheme && (bgEffect === 'aurora' || bgEffect === 'ember-tide-aurora');
  const showOrbs = !isAbstract && !isEmberTheme && bgEffect === 'aurora';
  const showSpotlight = !isAbstract && bgEffect === 'spotlight';
  const showGrain = bgEffect === 'grain';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700 ease-in-out"
      style={{
        '--spotlight-x': '50vw',
        '--spotlight-y': '30vh',
        filter: isAbstract ? 'saturate(0)' : undefined,
      }}
    >
      {/* 0. Ember Tide Aurora — Coral Fire × Arctic Cyan Layer */}
      {showEmberTide && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle interactive tide spotlight — follows mouse */}
          <div
            className="hidden md:block absolute inset-0 transition-opacity duration-300 transform-gpu"
            style={{
              background: `radial-gradient(650px circle at var(--spotlight-x) var(--spotlight-y), ${
                isDark ? 'rgba(249,115,22,0.10)' : 'rgba(249,115,22,0.06)'
              } 0%, transparent 65%)`,
            }}
          />

          {/* Ember Orb 1 — Large Burning Coral, top-right */}
          <div
            className="animate-ember-drift-1 absolute -top-[12%] -right-[8%] w-[600px] sm:w-[780px] h-[600px] sm:h-[780px] rounded-full blur-[100px] sm:blur-[150px] transform-gpu"
            style={{
              background: isDark
                ? `radial-gradient(circle, rgba(249,115,22,0.90) 0%, rgba(251,146,60,0.40) 40%, transparent 70%)`
                : `radial-gradient(circle, rgba(249,115,22,0.35) 0%, rgba(251,146,60,0.14) 50%, transparent 70%)`,
              opacity: isDark ? 0.22 : 0.10,
            }}
          />

          {/* Ember Orb 2 — Mid-size warm pulse, center-left */}
          <div
            className="animate-ember-drift-2 absolute top-[30%] -left-[6%] w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] rounded-full blur-[80px] sm:blur-[120px] transform-gpu"
            style={{
              background: isDark
                ? `radial-gradient(circle, rgba(251,191,36,0.80) 0%, rgba(249,115,22,0.35) 50%, transparent 70%)`
                : `radial-gradient(circle, rgba(251,191,36,0.30) 0%, rgba(249,115,22,0.12) 50%, transparent 70%)`,
              opacity: isDark ? 0.16 : 0.08,
            }}
          />

          {/* Arctic Orb — Cool Cyan, bottom-left */}
          <div
            className="animate-arctic-drift-1 absolute -bottom-[10%] left-[15%] w-[500px] sm:w-[660px] h-[500px] sm:h-[660px] rounded-full blur-[90px] sm:blur-[140px] transform-gpu"
            style={{
              background: isDark
                ? `radial-gradient(circle, rgba(56,189,248,0.85) 0%, rgba(125,211,252,0.35) 45%, transparent 70%)`
                : `radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(125,211,252,0.14) 50%, transparent 70%)`,
              opacity: isDark ? 0.20 : 0.09,
            }}
          />

          {/* Breathing vignette — deepens edges for drama */}
          <div
            className="animate-tide-pulse absolute inset-0 pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 35%, rgba(7,12,22,0.70) 100%)'
                : 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 35%, rgba(6,16,30,0.12) 100%)',
            }}
          />
        </div>
      )}

      {/* 1. Ambient Aurora Glowing Floating Orbs */}
      {showOrbs && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Orb 1: Primary Brand Tint (Top Left / Center) */}
          <div
            className="animate-orb-1 absolute -top-[15%] left-[10%] w-[520px] sm:w-[680px] h-[520px] sm:h-[680px] rounded-full blur-[85px] sm:blur-[110px] transform-gpu"
            style={{
              background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)`,
              opacity: isDark ? 0.16 : 0.08,
            }}
          />

          {/* Orb 2: Secondary / Violet Accent (Top Right / Middle) */}
          <div
            className="animate-orb-2 absolute top-[25%] -right-[10%] w-[460px] sm:w-[600px] h-[460px] sm:h-[600px] rounded-full blur-[90px] sm:blur-[120px] transform-gpu"
            style={{
              background: isDark
                ? `radial-gradient(circle, rgba(168, 85, 247, 0.9) 0%, rgba(99, 102, 241, 0.4) 45%, transparent 70%)`
                : `radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)`,
              opacity: isDark ? 0.14 : 0.07,
            }}
          />

          {/* Orb 3: Emerald / Cyan Pulse (Bottom Left) */}
          <div
            className="animate-orb-3 absolute -bottom-[10%] left-[20%] w-[420px] sm:w-[560px] h-[420px] sm:h-[560px] rounded-full blur-[80px] sm:blur-[105px] transform-gpu"
            style={{
              background: isDark
                ? `radial-gradient(circle, rgba(52, 211, 153, 0.8) 0%, rgba(56, 189, 248, 0.3) 50%, transparent 70%)`
                : `radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, rgba(56, 189, 248, 0.12) 50%, transparent 70%)`,
              opacity: isDark ? 0.12 : 0.06,
            }}
          />
        </div>
      )}

      {/* 3. Interactive Radiant Spotlight */}
      {showSpotlight && (
        <div className="absolute inset-0">
          <div
            className="hidden md:block absolute inset-0 transition-opacity duration-300 transform-gpu"
            style={{
              background: `radial-gradient(650px circle at var(--spotlight-x) var(--spotlight-y), var(--color-primary-glow) 0%, transparent 65%)`,
              opacity: isDark ? 0.75 : 0.5,
            }}
          />
          <div
            className="hidden md:block absolute inset-0 transform-gpu"
            style={{
              background: `radial-gradient(900px circle at var(--spotlight-x) var(--spotlight-y), rgba(168, 85, 247, 0.08) 0%, transparent 75%)`,
              opacity: isDark ? 0.6 : 0.3,
            }}
          />
          <div
            className="md:hidden animate-spotlight-pulse absolute -top-24 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full blur-[70px] transform-gpu"
            style={{
              background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)`,
              opacity: isDark ? 0.22 : 0.12,
            }}
          />
        </div>
      )}

      {/* 4. Velvet Frosted Grain Layer */}
      {showGrain && (
        <>
          <div
            className="animate-in fade-in duration-700 absolute inset-0"
            style={{
              backgroundImage: isDark
                ? `radial-gradient(circle at 15% 15%, var(--color-primary-glow) 0%, transparent 45%),
                   radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                   radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.06) 0%, transparent 55%)`
                : `radial-gradient(circle at 15% 15%, var(--color-primary-glow) 0%, transparent 45%),
                   radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)`,
              opacity: 0.9,
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035] contrast-150 brightness-100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="grain-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#grain-noise)" />
          </svg>
        </>
      )}

      {/* Subtle top horizontal linear ambient sheen for refined depth */}
      <div
        className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent pointer-events-none"
        style={{ opacity: isDark ? 0.6 : 0.3 }}
      />
    </div>
  );
});
