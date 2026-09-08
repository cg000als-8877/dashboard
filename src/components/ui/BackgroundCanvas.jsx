"use client";

import { useEffect, useRef, memo } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export const BackgroundCanvas = memo(function BackgroundCanvas() {
  const { bgEffect, mode } = useTheme();
  const containerRef = useRef(null);

  useEffect(() => {
    if (bgEffect !== 'spotlight' && bgEffect !== 'hybrid' && bgEffect !== 'arcade-grid' && bgEffect !== 'abstract-void') return;

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
  }, [bgEffect]);

  if (bgEffect === 'solid') {
    return null;
  }

  const isDark = mode !== 'light';
  const showArcade = bgEffect === 'arcade-grid';
  const showAbstractVoid = bgEffect === 'abstract-void';
  const showOrbs = bgEffect === 'aurora' || bgEffect === 'hybrid';
  const showGrid = bgEffect === 'grid' || bgEffect === 'hybrid';
  const showSpotlight = bgEffect === 'spotlight';
  const showGrain = bgEffect === 'grain';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700 ease-in-out"
      style={{
        '--spotlight-x': '50vw',
        '--spotlight-y': '30vh',
      }}
    >
      {/* 0a. Abstract Void — Monochromatic Wisp Layer */}
      {showAbstractVoid && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle mouse-following tonal spotlight */}
          <div
            className="hidden md:block absolute inset-0 transition-opacity duration-300 transform-gpu"
            style={{
              background: `radial-gradient(700px circle at var(--spotlight-x) var(--spotlight-y), ${isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.035)'} 0%, transparent 65%)`,
            }}
          />

          {/* Wisp 1 — large top-right void orb */}
          <div
            className="animate-abstract-wisp-1 absolute -top-[10%] -right-[10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full blur-[120px] sm:blur-[180px] transform-gpu"
            style={{ background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.035)' }}
          />

          {/* Wisp 2 — medium bottom-left */}
          <div
            className="animate-abstract-wisp-2 absolute bottom-[5%] -left-[8%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full blur-[100px] sm:blur-[150px] transform-gpu"
            style={{ background: isDark ? 'rgba(255,255,255,0.030)' : 'rgba(0,0,0,0.025)' }}
          />

          {/* Wisp 3 — small mid-center accent */}
          <div
            className="animate-abstract-wisp-3 absolute top-[40%] left-[35%] w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] rounded-full blur-[80px] sm:blur-[110px] transform-gpu"
            style={{ background: isDark ? 'rgba(255,255,255,0.022)' : 'rgba(0,0,0,0.018)' }}
          />

          {/* Fine grain SVG noise texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px',
              opacity: isDark ? 0.048 : 0.030,
              mixBlendMode: isDark ? 'screen' : 'multiply',
            }}
          />

          {/* Radial vignette breathing edge darkener */}
          <div
            className="animate-abstract-vignette absolute inset-0 pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)'
                : 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.10) 100%)',
            }}
          />
        </div>
      )}

      {/* 0b. Arcade Holo-Matrix Gaming Arena Layer */}
      {showArcade && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Interactive Mouse-following Neon Cyan Spotlight */}
          <div
            className="hidden md:block absolute inset-0 transition-opacity duration-300 transform-gpu"
            style={{
              background: `radial-gradient(750px circle at var(--spotlight-x) var(--spotlight-y), rgba(0, 240, 255, ${isDark ? '0.22' : '0.12'}) 0%, transparent 65%)`,
            }}
          />

          {/* Floating Laser Magenta Plasma Orb */}
          <div
            className="animate-orb-2 absolute top-[15%] -right-[8%] w-[540px] sm:w-[700px] h-[540px] sm:h-[700px] rounded-full blur-[90px] sm:blur-[130px] transform-gpu"
            style={{
              background: isDark
                ? `radial-gradient(circle, rgba(255, 0, 127, 0.75) 0%, rgba(138, 43, 226, 0.35) 45%, transparent 70%)`
                : `radial-gradient(circle, rgba(255, 0, 127, 0.25) 0%, rgba(138, 43, 226, 0.10) 50%, transparent 70%)`,
              opacity: isDark ? 0.20 : 0.08,
            }}
          />

          {/* Floating Laser Cyan Pulse Orb */}
          <div
            className="animate-orb-1 absolute -bottom-[12%] -left-[8%] w-[520px] sm:w-[680px] h-[520px] sm:h-[680px] rounded-full blur-[85px] sm:blur-[120px] transform-gpu"
            style={{
              background: isDark
                ? `radial-gradient(circle, rgba(0, 240, 255, 0.8) 0%, rgba(0, 255, 157, 0.3) 50%, transparent 70%)`
                : `radial-gradient(circle, rgba(0, 122, 138, 0.35) 0%, rgba(4, 120, 87, 0.12) 50%, transparent 70%)`,
              opacity: isDark ? 0.22 : 0.09,
            }}
          />

          {/* Isometric Perspective Cyber Gaming Grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${isDark ? 'rgba(0, 240, 255, 0.14)' : 'rgba(0, 122, 138, 0.12)'} 1px, transparent 1px),
                linear-gradient(to bottom, ${isDark ? 'rgba(0, 240, 255, 0.14)' : 'rgba(0, 122, 138, 0.12)'} 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
              opacity: isDark ? 0.75 : 0.45,
              maskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, #000 40%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, #000 40%, transparent 90%)',
            }}
          >
            {/* Crosshair Targets at Key Grid Coordinates */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="arcade-cross" width="144" height="144" patternUnits="userSpaceOnUse">
                  <path d="M 72 64 L 72 80 M 64 72 L 80 72" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
                  <circle cx="72" cy="72" r="1.5" fill="var(--color-secondary)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#arcade-cross)" />
            </svg>
          </div>

          {/* Sweeping Neon Scanline Laser Beam */}
          <div className="absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-[var(--color-primary)]/15 to-transparent animate-arcade-scanline pointer-events-none" />

          {/* Cyberpunk HUD Corner Reticles */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--color-primary)]/40 rounded-tl-sm animate-arcade-reticle" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--color-secondary)]/40 rounded-tr-sm animate-arcade-reticle" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--color-secondary)]/40 rounded-bl-sm animate-arcade-reticle" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--color-primary)]/40 rounded-br-sm animate-arcade-reticle" />
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

      {/* 2. Technical Blueprint Cyber Grid with Radial Vignette */}
      {showGrid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
            opacity: isDark ? 0.55 : 0.35,
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 35%, #000 35%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 35%, #000 35%, transparent 85%)',
          }}
        >
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-cross" width="176" height="176" patternUnits="userSpaceOnUse">
                <path d="M 88 80 L 88 96 M 80 88 L 96 88" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.4" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-cross)" />
          </svg>
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
