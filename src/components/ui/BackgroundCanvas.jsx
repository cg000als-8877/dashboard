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
  const showGrid = bgEffect === 'grid';
  const showHoneycomb = bgEffect === 'honeycomb';
  const showBokeh = bgEffect === 'bokeh';
  const showTextile = bgEffect === 'textile';
  const showTopography = bgEffect === 'topography';
  const showDots = bgEffect === 'dots';
  const showSilk = bgEffect === 'silk';
  const showRays = bgEffect === 'rays';
  const showStarlight = bgEffect === 'starlight';

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

      {/* 4. Velvet Frosted Grain Layer — High-Texture Analog Grain */}
      {showGrain && (
        <>
          <div
            className="animate-in fade-in duration-700 absolute inset-0"
            style={{
              backgroundImage: isDark
                ? `radial-gradient(circle at 15% 15%, var(--color-primary-glow) 0%, transparent 50%),
                   radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.16) 0%, transparent 55%),
                   radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.10) 0%, transparent 60%)`
                : `radial-gradient(circle at 15% 15%, var(--color-primary-glow) 0%, transparent 50%),
                   radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.08) 0%, transparent 55%)`,
              opacity: 0.95,
            }}
          />
          {/* Enhanced High-Density Tactile Grain */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none contrast-[220%] brightness-105"
            style={{
              opacity: isDark ? 0.22 : 0.16,
              mixBlendMode: isDark ? 'screen' : 'multiply',
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="grain-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#grain-noise)" />
          </svg>
          {/* Subtle micro-grain overlay for analog depth */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay contrast-200"
            style={{
              opacity: isDark ? 0.14 : 0.09,
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="fine-grain-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="3" stitchTiles="stitch" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#fine-grain-noise)" />
          </svg>
        </>
      )}

      {/* 5. Architectural Blueprint Grid Layer */}
      {showGrid && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700">
          {/* Ambient theme aura glow behind grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 40%, var(--color-primary-glow) 0%, transparent 70%)`,
              opacity: isDark ? 0.40 : 0.22,
            }}
          />

          {/* Precision Blueprint Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: `color-mix(in srgb, var(--color-primary) ${isDark ? '3.5%' : '2%'}, transparent)`,
              opacity: 0.8,
              backgroundImage: `
                linear-gradient(color-mix(in srgb, var(--color-primary) ${isDark ? '30%' : '25%'}, transparent) 2px, transparent 2px),
                linear-gradient(90deg, color-mix(in srgb, var(--color-primary) ${isDark ? '30%' : '25%'}, transparent) 2px, transparent 2px),
                linear-gradient(color-mix(in srgb, var(--color-primary) ${isDark ? '14%' : '11%'}, transparent) 1px, transparent 1px),
                linear-gradient(90deg, color-mix(in srgb, var(--color-primary) ${isDark ? '14%' : '11%'}, transparent) 1px, color-mix(in srgb, var(--color-primary) ${isDark ? '3.5%' : '2%'}, transparent) 1px)
              `,
              backgroundSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
              backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px',
              maskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          />
        </div>
      )}

      {/* 6. Geometric Honeycomb Mesh Layer */}
      {showHoneycomb && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700">
          {/* Ambient theme aura glow behind honeycomb */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 40%, var(--color-primary-glow) 0%, transparent 70%)`,
              opacity: isDark ? 0.45 : 0.25,
            }}
          />

          {/* Honeycomb Pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: `color-mix(in srgb, var(--color-primary) ${isDark ? '4%' : '2%'}, transparent)`,
              opacity: 0.8,
              backgroundImage: `
                conic-gradient(from 60deg at 56.25% calc(425% / 6), transparent 0deg, transparent 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 119.5deg, transparent 119.5deg, transparent 120deg),
                conic-gradient(from 60deg at 56.25% calc(425% / 6), transparent 0deg, transparent 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 119.5deg, transparent 119.5deg, transparent 120deg),
                conic-gradient(from 180deg at 43.75% calc(425% / 6), transparent 0deg, transparent 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 119.5deg, transparent 119.5deg, transparent 120deg),
                conic-gradient(from 180deg at 43.75% calc(425% / 6), transparent 0deg, transparent 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 119.5deg, transparent 119.5deg, transparent 120deg),
                conic-gradient(from -60deg at 50% calc(175% / 12), transparent 0deg, transparent 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 119.5deg, transparent 119.5deg, transparent 120deg),
                conic-gradient(from -60deg at 50% calc(175% / 12), transparent 0deg, transparent 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 0.5deg, color-mix(in srgb, var(--color-primary) ${isDark ? '35%' : '28%'}, transparent) 119.5deg, transparent 119.5deg, transparent 120deg)
              `,
              backgroundPosition: '0 0, 10px 17px, 0 0, 10px 17px, 10px 0, 0 17px',
              backgroundSize: '20px 34px',
              maskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          />
        </div>
      )}

      {/* 7. Moving Bokeh Large Fast-Floating Glowing Blobs Layer */}
      {showBokeh && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700 pointer-events-none">
          {/* Ambient backdrop aura (Reduced 20% opacity) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 90% 80% at 50% 50%, var(--color-primary-glow) 0%, transparent 80%)`,
              opacity: isDark ? 0.32 : 0.14,
            }}
          />

          {/* Big Bokeh Blobs Container — Fast moving all over the screen */}
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              mixBlendMode: isDark ? 'screen' : 'multiply',
            }}
          >
            {/* Blob 1: Top-Left Primary Brand Giant (Fast Drift) */}
            <div
              className="absolute rounded-full pointer-events-none animate-bokeh-fast-1"
              style={{
                width: '58vmin',
                height: '58vmin',
                minWidth: '320px',
                minHeight: '320px',
                top: '-10%',
                left: '-5%',
                background: 'radial-gradient(circle, var(--color-primary) 0%, var(--color-primary-glow) 52%, transparent 72%)',
                opacity: isDark ? 0.56 : 0.28,
                filter: 'blur(55px)',
                willChange: 'transform',
              }}
            />

            {/* Blob 2: Top-Right Cyan/Sky Cyber Orb (Fast Drift) */}
            <div
              className="absolute rounded-full pointer-events-none animate-bokeh-fast-2"
              style={{
                width: '62vmin',
                height: '62vmin',
                minWidth: '340px',
                minHeight: '340px',
                top: '-8%',
                right: '-8%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 65%, #38BDF8) 0%, var(--color-primary-glow) 50%, transparent 72%)',
                opacity: isDark ? 0.52 : 0.25,
                filter: 'blur(60px)',
                willChange: 'transform',
              }}
            />

            {/* Blob 3: Center-Screen Radiant Violet Cruiser (Fast Drift) */}
            <div
              className="absolute rounded-full pointer-events-none animate-bokeh-fast-3"
              style={{
                width: '52vmin',
                height: '52vmin',
                minWidth: '300px',
                minHeight: '300px',
                top: '28%',
                left: '26%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 60%, #818CF8) 0%, var(--color-primary-glow) 50%, transparent 70%)',
                opacity: isDark ? 0.48 : 0.24,
                filter: 'blur(50px)',
                willChange: 'transform',
              }}
            />

            {/* Blob 4: Bottom-Left Rose/Coral Power Orb (Fast Drift) */}
            <div
              className="absolute rounded-full pointer-events-none animate-bokeh-fast-4"
              style={{
                width: '64vmin',
                height: '64vmin',
                minWidth: '350px',
                minHeight: '350px',
                bottom: '-12%',
                left: '-10%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 58%, #F43F5E) 0%, var(--color-primary-glow) 46%, transparent 72%)',
                opacity: isDark ? 0.54 : 0.27,
                filter: 'blur(65px)',
                willChange: 'transform',
              }}
            />

            {/* Blob 5: Bottom-Right Emerald Green Fusion (Fast Drift) */}
            <div
              className="absolute rounded-full pointer-events-none animate-bokeh-fast-5"
              style={{
                width: '56vmin',
                height: '56vmin',
                minWidth: '320px',
                minHeight: '320px',
                bottom: '-8%',
                right: '-6%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 70%, #34D399) 0%, var(--color-primary-glow) 48%, transparent 70%)',
                opacity: isDark ? 0.49 : 0.24,
                filter: 'blur(55px)',
                willChange: 'transform',
              }}
            />

            {/* Blob 6: Mid-Right Amber/Gold Warm Satellite (Fast Drift) */}
            <div
              className="absolute rounded-full pointer-events-none animate-bokeh-fast-6"
              style={{
                width: '50vmin',
                height: '50vmin',
                minWidth: '280px',
                minHeight: '280px',
                top: '42%',
                right: '-10%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 75%, #FBBF24) 0%, var(--color-primary-glow) 46%, transparent 72%)',
                opacity: isDark ? 0.46 : 0.22,
                filter: 'blur(50px)',
                willChange: 'transform',
              }}
            />

            {/* Blob 7: High-Speed Central Spark (Fast Orbit Reverse) */}
            <div
              className="absolute rounded-full pointer-events-none animate-bokeh-fast-1"
              style={{
                width: '42vmin',
                height: '42vmin',
                minWidth: '240px',
                minHeight: '240px',
                top: '35%',
                left: '38%',
                background: 'radial-gradient(circle, #FFFFFF 0%, var(--color-primary) 35%, var(--color-primary-glow) 60%, transparent 72%)',
                opacity: isDark ? 0.32 : 0.16,
                filter: 'blur(45px)',
                animationDirection: 'reverse',
                animationDuration: '5.2s',
                willChange: 'transform',
              }}
            />
          </div>
        </div>
      )}

      {/* 8. Textile Weave — Technical Apparel Fiber Layer */}
      {showTextile && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700 pointer-events-none">
          {/* Subtle ambient aura glow behind weave */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 75% 65% at 50% 45%, var(--color-primary-glow) 0%, transparent 70%)`,
              opacity: isDark ? 0.35 : 0.18,
            }}
          />

          {/* Micro Woven Thread Matrix */}
          <div
            className="absolute inset-0 pointer-events-none animate-textile-shimmer"
            style={{
              opacity: isDark ? 0.85 : 0.65,
              backgroundImage: `
                repeating-linear-gradient(0deg, color-mix(in srgb, var(--color-primary) ${isDark ? '24%' : '16%'}, transparent) 0px, transparent 1px, transparent 8px),
                repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-primary) ${isDark ? '24%' : '16%'}, transparent) 0px, transparent 1px, transparent 8px),
                repeating-linear-gradient(45deg, color-mix(in srgb, var(--color-primary) ${isDark ? '10%' : '6%'}, transparent) 0px, transparent 1px, transparent 16px)
              `,
              backgroundSize: '8px 8px, 8px 8px, 16px 16px',
              maskImage: 'radial-gradient(ellipse 90% 80% at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%)',
            }}
          />

          {/* Diagonal warp sheen line */}
          <div
            className="absolute -inset-full pointer-events-none"
            style={{
              background: `linear-gradient(115deg, transparent 40%, color-mix(in srgb, var(--color-primary) 12%, transparent) 48%, color-mix(in srgb, var(--color-primary) 20%, transparent) 50%, color-mix(in srgb, var(--color-primary) 12%, transparent) 52%, transparent 60%)`,
              opacity: isDark ? 0.5 : 0.25,
            }}
          />
        </div>
      )}

      {/* 9. Topographic Contour Elevation Isolines */}
      {showTopography && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700 pointer-events-none">
          {/* Ambient theme glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 85% 70% at 50% 50%, var(--color-primary-glow) 0%, transparent 70%)`,
              opacity: isDark ? 0.32 : 0.16,
            }}
          />

          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: isDark ? 0.55 : 0.38 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="topography-grid" width="240" height="240" patternUnits="userSpaceOnUse">
                {/* Primary undulating contours */}
                <path d="M 0 40 Q 60 15 120 45 T 240 30" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.45" />
                <path d="M 0 80 Q 70 50 140 85 T 240 70" fill="none" stroke="var(--color-primary)" strokeWidth="1.2" strokeOpacity="0.65" />
                <path d="M 0 120 Q 55 95 110 125 T 240 110" fill="none" stroke="var(--color-primary)" strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="4 4" />
                <path d="M 0 160 Q 75 135 150 165 T 240 150" fill="none" stroke="var(--color-primary)" strokeWidth="1.2" strokeOpacity="0.65" />
                <path d="M 0 200 Q 60 175 120 205 T 240 190" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.45" />
                
                {/* Secondary diagonal counter-contours */}
                <path d="M 20 0 Q 50 70 30 140 T 40 240" fill="none" stroke="var(--color-primary)" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="2 3" />
                <path d="M 140 0 Q 180 80 150 160 T 160 240" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topography-grid)" />
          </svg>

          {/* Radial vignette mask for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(7,12,22,0.75) 100%)'
                : 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(255,255,255,0.65) 100%)',
            }}
          />
        </div>
      )}

      {/* 10. Dot Matrix & Telemetry Radar Pulse */}
      {showDots && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700 pointer-events-none">
          {/* Ambient theme glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, var(--color-primary-glow) 0%, transparent 65%)`,
              opacity: isDark ? 0.38 : 0.20,
            }}
          />

          {/* Precision 22px Dot Matrix */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: isDark ? 0.75 : 0.55,
              backgroundImage: `radial-gradient(circle, color-mix(in srgb, var(--color-primary) ${isDark ? '42%' : '32%'}, transparent) 1.2px, transparent 1.2px)`,
              backgroundSize: '22px 22px',
              backgroundPosition: '0 0',
              maskImage: 'radial-gradient(ellipse 85% 75% at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 80%)',
            }}
          />

          {/* Central Telemetry Radar Ring 1 */}
          <div
            className="animate-telemetry-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-primary)] pointer-events-none"
            style={{
              width: '45vmin',
              height: '45vmin',
              opacity: isDark ? 0.5 : 0.3,
            }}
          />

          {/* Central Telemetry Radar Ring 2 (Offset delayed) */}
          <div
            className="animate-telemetry-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-primary)] pointer-events-none"
            style={{
              width: '45vmin',
              height: '45vmin',
              animationDelay: '2s',
              opacity: isDark ? 0.4 : 0.2,
            }}
          />
        </div>
      )}

      {/* 11. Liquid Silk Flowing Fabric Drape */}
      {showSilk && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700 pointer-events-none">
          {/* Wave Drape 1 — Top Diagonal */}
          <div
            className="animate-silk-drift-1 absolute -top-[20%] -left-[10%] w-[120vw] h-[75vh] pointer-events-none transform-gpu rounded-[42%_58%_70%_30%/45%_45%_55%_55%]"
            style={{
              background: `radial-gradient(ellipse at 40% 50%, color-mix(in srgb, var(--color-primary) 70%, #A855F7) 0%, var(--color-primary-glow) 50%, transparent 75%)`,
              opacity: isDark ? 0.22 : 0.12,
              filter: 'blur(75px)',
              willChange: 'transform',
            }}
          />

          {/* Wave Drape 2 — Center S-Curve */}
          <div
            className="animate-silk-drift-2 absolute top-[30%] -right-[15%] w-[110vw] h-[80vh] pointer-events-none transform-gpu rounded-[60%_40%_30%_70%/60%_30%_70%_40%]"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, color-mix(in srgb, var(--color-primary) 75%, #38BDF8) 0%, var(--color-primary-glow) 45%, transparent 70%)`,
              opacity: isDark ? 0.20 : 0.10,
              filter: 'blur(80px)',
              willChange: 'transform',
            }}
          />

          {/* Wave Drape 3 — Bottom Pulse */}
          <div
            className="animate-silk-drift-1 absolute -bottom-[25%] left-[10%] w-[90vw] h-[65vh] pointer-events-none transform-gpu rounded-[50%_50%_40%_60%/40%_60%_40%_60%]"
            style={{
              background: `radial-gradient(ellipse at center, var(--color-primary) 0%, var(--color-primary-glow) 55%, transparent 75%)`,
              opacity: isDark ? 0.18 : 0.08,
              filter: 'blur(70px)',
              animationDirection: 'reverse',
              animationDuration: '14s',
              willChange: 'transform',
            }}
          />
        </div>
      )}

      {/* 12. Volumetric God-Rays / Prism Sunbeams */}
      {showRays && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700 pointer-events-none">
          {/* Top-corner light source aura */}
          <div
            className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[90px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, var(--color-primary) 0%, var(--color-primary-glow) 50%, transparent 70%)`,
              opacity: isDark ? 0.35 : 0.20,
            }}
          />

          {/* Sweeping Volumetric Conic Beams */}
          <div
            className="animate-rays-sway absolute -top-[50%] -left-[20%] w-[180vw] h-[180vh] pointer-events-none origin-top-left transform-gpu"
            style={{
              opacity: isDark ? 0.32 : 0.18,
              background: `conic-gradient(
                from 105deg at 10% 10%,
                transparent 0deg,
                color-mix(in srgb, var(--color-primary) 40%, transparent) 8deg,
                transparent 16deg,
                color-mix(in srgb, var(--color-primary) 25%, transparent) 24deg,
                transparent 34deg,
                color-mix(in srgb, var(--color-primary) 45%, transparent) 44deg,
                transparent 54deg,
                color-mix(in srgb, var(--color-primary) 30%, transparent) 64deg,
                transparent 74deg,
                color-mix(in srgb, var(--color-primary) 20%, transparent) 84deg,
                transparent 95deg
              )`,
              maskImage: 'radial-gradient(ellipse at 15% 15%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 15% 15%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
            }}
          />
        </div>
      )}

      {/* 13. Starlight Micro-Constellation Drift */}
      {showStarlight && (
        <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-700 pointer-events-none">
          {/* Deep Cosmic Aura Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isDark
                ? `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--color-primary) 18%, #1E1B4B) 0%, transparent 75%)`
                : `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--color-primary) 12%, #E0E7FF) 0%, transparent 75%)`,
              opacity: 0.8,
            }}
          />

          {/* Twinkling Star Points */}
          {[
            { top: '12%', left: '18%', size: '3px', delay: '0s', dur: '2.8s' },
            { top: '22%', left: '72%', size: '2px', delay: '1.2s', dur: '3.4s' },
            { top: '38%', left: '35%', size: '2.5px', delay: '0.6s', dur: '2.5s' },
            { top: '48%', left: '84%', size: '3px', delay: '1.8s', dur: '3.8s' },
            { top: '65%', left: '14%', size: '2px', delay: '0.4s', dur: '3.1s' },
            { top: '78%', left: '60%', size: '3px', delay: '1.5s', dur: '2.7s' },
            { top: '15%', left: '88%', size: '2px', delay: '2.1s', dur: '3.6s' },
            { top: '85%', left: '28%', size: '2.5px', delay: '0.9s', dur: '3.2s' },
            { top: '32%', left: '52%', size: '3px', delay: '1.7s', dur: '2.9s' },
            { top: '58%', left: '42%', size: '2px', delay: '2.4s', dur: '3.5s' },
            { top: '72%', left: '80%', size: '2.5px', delay: '0.8s', dur: '3.0s' },
            { top: '28%', left: '10%', size: '2px', delay: '1.9s', dur: '3.3s' },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none animate-twinkle-star"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: isDark ? '#FFFFFF' : 'var(--color-primary)',
                boxShadow: isDark 
                  ? `0 0 6px 1px ${i % 2 === 0 ? 'var(--color-primary)' : '#60A5FA'}` 
                  : `0 0 4px 1px var(--color-primary)`,
                animationDelay: star.delay,
                animationDuration: star.dur,
              }}
            />
          ))}

          {/* Micro Constellation Connecting Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25 dark:opacity-35" xmlns="http://www.w3.org/2000/svg">
            <line x1="18%" y1="12%" x2="35%" y2="38%" stroke="var(--color-primary)" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="35%" y1="38%" x2="52%" y2="32%" stroke="var(--color-primary)" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="52%" y1="32%" x2="72%" y2="22%" stroke="var(--color-primary)" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="72%" y1="22%" x2="84%" y2="48%" stroke="var(--color-primary)" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="14%" y1="65%" x2="28%" y2="85%" stroke="var(--color-primary)" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="42%" y1="58%" x2="60%" y2="78%" stroke="var(--color-primary)" strokeWidth="0.75" strokeDasharray="3 3" />
          </svg>
        </div>
      )}

      {/* Subtle top horizontal linear ambient sheen for refined depth */}
      <div
        className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent pointer-events-none"
        style={{ opacity: isDark ? 0.6 : 0.3 }}
      />
    </div>
  );
});
