"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/components/layout/Sidebar';

export function CostRecoveryPie({ 
  percentage = 0, 
  isProfitable = false, 
  totalIncome = 0, 
  totalCost = 0, 
  netProfit = 0, 
  compact = false, 
  hideFooter = false,
  className = "" 
}) {
  const [animated, setAnimated] = useState(false);
  const liquidRefs = useRef({});
  const targetTiltRef = useRef(0);
  const currentTiltRef = useRef(0);
  const velocityRef = useRef(0);
  const hasOrientationSensor = useRef(false);

  // Trigger fluid rising animation when component mounts
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Real-time Gyroscope / DeviceOrientation & Fluid Physics Loop
  useEffect(() => {
    // 1. DeviceOrientation event handler (detects device tilt & screen rotation)
    const handleOrientation = (e) => {
      const gamma = e.gamma;
      const beta = e.beta;
      if (gamma === null && beta === null) return;
      hasOrientationSensor.current = true;

      // Handle screen orientation (portrait vs landscape modes)
      const orientationAngle = 
        (typeof screen !== 'undefined' && screen.orientation && screen.orientation.angle) || 
        (typeof window !== 'undefined' && window.orientation) || 
        0;

      let lateralTilt = 0;
      if (orientationAngle === 90) {
        lateralTilt = beta || 0; // Landscape rotated right
      } else if (orientationAngle === -90 || orientationAngle === 270) {
        lateralTilt = -(beta || 0); // Landscape rotated left
      } else {
        lateralTilt = gamma || 0; // Standard portrait mode
      }

      // Clamp lateral tilt to [-45, 45] degrees for realistic jar bounds
      const clamped = Math.max(-45, Math.min(45, lateralTilt));
      // Tilted right (+gamma): liquid sloshes right, so surface tilts counter-clockwise relative to jar (-tilt)
      targetTiltRef.current = -(clamped / 45) * 26;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    // 2. GPU 60fps spring-damping fluid inertia physics loop
    let animId;
    const updatePhysics = () => {
      const spring = 0.085;
      const damping = 0.82;
      const force = (targetTiltRef.current - currentTiltRef.current) * spring;
      velocityRef.current = (velocityRef.current + force) * damping;
      currentTiltRef.current += velocityRef.current;

      const tilt = currentTiltRef.current;

      // Apply tilt & lateral slosh directly to each jar's liquid surface for maximum performance
      Object.values(liquidRefs.current).forEach((el) => {
        if (el) {
          el.style.transform = `rotate(${tilt.toFixed(2)}deg) translateX(${(tilt * 0.18).toFixed(1)}px)`;
        }
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Request iOS permission if needed on tap
  const handleContainerClick = () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            hasOrientationSensor.current = true;
          }
        })
        .catch(() => {});
    }
  };

  // Interactive touch & pointer gesture fallback (allows sloshing by dragging finger or cursor)
  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const normalizedX = (x / rect.width) * 2 - 1; // [-1, 1]
    targetTiltRef.current = -normalizedX * 22;
  };

  const handlePointerLeave = () => {
    if (!hasOrientationSensor.current) {
      targetTiltRef.current = 0;
    }
  };

  const rawPct = Number(percentage) || 0;
  const isCovered = isProfitable || rawPct >= 100;

  // 1. Recovered percentage (capped at 100% for the recovery track)
  const recoveredPct = Math.min(Math.max(rawPct, 0), 100);

  // 2. Shortfall percentage (remaining to reach 100% break-even)
  const shortfallPct = isCovered ? 0 : Math.max(100 - rawPct, 0);
  const shortfallBdt = Math.max((totalCost || 0) - (totalIncome || 0), 0);

  // 3. Profit percentage (beyond 100% break-even)
  const profitPct = isCovered ? Math.max(rawPct - 100, 0) : 0;
  const profitBdt = (netProfit || 0) > 0 ? netProfit : 0;

  // Helper formatter for compact BDT display (e.g. BDT 1.47M, BDT 650k)
  const formatCompactBdt = (val) => {
    if (!val || val === 0) return 'BDT 0';
    const absVal = Math.abs(val);
    if (absVal >= 1000000) {
      return `BDT ${(absVal / 1000000).toFixed(2)}M`;
    }
    if (absVal >= 1000) {
      return `BDT ${(absVal / 1000).toFixed(0)}k`;
    }
    return `BDT ${Math.round(absVal).toLocaleString()}`;
  };

  const jars = [
    {
      id: 'shortfall',
      title: 'To Recover',
      pct: Math.round(shortfallPct),
      liquidColor: 'var(--color-danger, #EF4444)',
      liquidGradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-danger, #EF4444) 90%, white 10%) 0%, var(--color-danger, #EF4444) 55%, color-mix(in srgb, var(--color-danger, #EF4444) 80%, black 20%) 100%)',
      glowColor: 'color-mix(in srgb, var(--color-danger, #EF4444) 45%, transparent)',
      waveColor: 'var(--color-danger, #EF4444)',
      waveColorDark: 'color-mix(in srgb, var(--color-danger, #EF4444) 80%, black 20%)',
      textColor: 'text-[var(--color-danger)]',
      valueStr: formatCompactBdt(shortfallBdt),
      sublabel: isCovered ? 'Target Met' : 'Shortfall',
    },
    {
      id: 'recovered',
      title: 'Recovered',
      pct: Math.round(recoveredPct),
      liquidColor: 'var(--color-primary)',
      liquidGradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 88%, white 12%) 0%, var(--color-primary) 55%, color-mix(in srgb, var(--color-primary) 78%, black 22%) 100%)',
      glowColor: 'color-mix(in srgb, var(--color-primary) 45%, transparent)',
      waveColor: 'var(--color-primary)',
      waveColorDark: 'color-mix(in srgb, var(--color-primary) 80%, black 20%)',
      textColor: 'text-[var(--color-primary)]',
      valueStr: formatCompactBdt(totalIncome),
      sublabel: 'Income',
    },
    {
      id: 'profit',
      title: 'Profit',
      pct: Math.round(profitPct),
      liquidColor: 'var(--color-success, #10B981)',
      liquidGradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-success, #10B981) 88%, white 12%) 0%, var(--color-success, #10B981) 55%, color-mix(in srgb, var(--color-success, #10B981) 78%, black 22%) 100%)',
      glowColor: 'color-mix(in srgb, var(--color-success, #10B981) 45%, transparent)',
      waveColor: 'var(--color-success, #10B981)',
      waveColorDark: 'color-mix(in srgb, var(--color-success, #10B981) 80%, black 20%)',
      textColor: isCovered && profitPct > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]',
      valueColor: isCovered && profitPct > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]',
      valueStr: isCovered && profitBdt > 0 ? formatCompactBdt(profitBdt) : 'BDT 0',
      sublabel: isCovered && profitPct > 0 ? 'Net Margin' : 'Deficit',
    },
  ];

  return (
    <div 
      className={cn("flex flex-col justify-center w-full h-full relative select-none py-1 sm:py-1.5 touch-none cursor-grab active:cursor-grabbing", className)}
      onClick={handleContainerClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Inline styles for butter-smooth 60fps GPU fluid wave and bubble animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes liquidWaveFront {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes liquidWaveBack {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes jarBubbleA {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          40% { opacity: 0.7; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-40px) scale(1); opacity: 0; }
        }
        @keyframes jarBubbleB {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          45% { opacity: 0.8; }
          85% { opacity: 0.3; }
          100% { transform: translateY(-55px) scale(1.1); opacity: 0; }
        }
      `}} />

      {/* 3 Animated Glass Liquid Jars Grid */}
      <div className="grid grid-cols-3 gap-2 min-[360px]:gap-3 sm:gap-4 w-full items-end justify-center">
        {jars.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col items-center justify-end text-center min-w-0 px-0.5 w-full group"
          >
            {/* The Glass Canister / Flask Container */}
            <div className="relative w-full max-w-[70px] min-[360px]:max-w-[78px] min-[390px]:max-w-[84px] sm:max-w-[92px] md:max-w-[102px] flex flex-col items-center">
              
              {/* Bottle Neck / Mouth Lip */}
              <div className="w-6 min-[360px]:w-7 sm:w-8 h-2 rounded-full border border-slate-300/80 dark:border-white/20 bg-slate-200/70 dark:bg-white/10 mx-auto -mb-1 z-10 shadow-xs shrink-0" />

              {/* Round Glass Jar Main Sphere */}
              <div className="relative w-full aspect-square rounded-full border border-slate-300/90 dark:border-white/20 bg-slate-100/60 dark:bg-black/35 backdrop-blur-xs overflow-hidden shadow-[inset_0_3px_8px_rgba(255,255,255,0.4),inset_0_-4px_10px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_3px_10px_rgba(255,255,255,0.18),inset_0_-6px_14px_rgba(0,0,0,0.5),0_6px_20px_rgba(0,0,0,0.35)]">
                
                {/* Spherical Specular Glass Curved Sheen (Top-Left Arc) */}
                <div className="absolute top-2 left-2.5 w-[36%] h-[24%] rounded-full -rotate-45 bg-gradient-to-b from-white/70 via-white/20 to-transparent dark:from-white/35 dark:via-white/10 dark:to-transparent pointer-events-none z-20" />
                
                {/* Secondary Subtle Rim Glow (Bottom-Right Reflection) */}
                <div className="absolute bottom-2 right-2.5 w-[25%] h-[18%] rounded-full -rotate-45 bg-gradient-to-t from-white/30 to-transparent dark:from-white/15 dark:to-transparent pointer-events-none z-20" />

                {/* Living Physics Liquid (Tilt & slosh driven by gyroscope and inertia) */}
                <div 
                  ref={(el) => {
                    if (el) {
                      liquidRefs.current[item.id] = el;
                    }
                  }}
                  className="absolute pointer-events-none transition-[height] duration-1000 ease-out"
                  style={{
                    left: '-32px',
                    right: '-32px',
                    bottom: '-35px',
                    width: 'calc(100% + 64px)',
                    height: animated ? `calc(${Math.min(item.pct, 100)}% + 35px)` : '0%',
                    transformOrigin: '50% 0px',
                  }}
                >
                  {/* Surface Animated Waves & Liquid Body (Only rendered when there is liquid) */}
                  {item.pct > 0 && (
                    <>
                      {/* Secondary Back Wave (Gentle, slow, subtle 3D depth) */}
                      <div 
                        className="absolute -top-[6px] left-0 w-[200%] h-[9px] pointer-events-none"
                        style={{
                          animation: 'liquidWaveBack 7.5s linear infinite',
                          willChange: 'transform'
                        }}
                      >
                        <svg viewBox="0 0 200 10" preserveAspectRatio="none" className="w-full h-full fill-current" style={{ color: item.waveColorDark || item.liquidColor, opacity: 0.35 }}>
                          <path d="M 0 5 C 12 8, 38 8, 50 5 C 62 2, 88 2, 100 5 C 112 8, 138 8, 150 5 C 162 2, 188 2, 200 5 V 10 H 0 Z" />
                        </svg>
                      </div>

                      {/* Primary Front Wave (Gentle standard surface swell with delicate highlight) */}
                      <div 
                        className="absolute -top-[6px] left-0 w-[200%] h-[9px] pointer-events-none z-10"
                        style={{
                          animation: 'liquidWaveFront 5.5s linear infinite',
                          willChange: 'transform'
                        }}
                      >
                        <svg viewBox="0 0 200 10" preserveAspectRatio="none" className="w-full h-full fill-current" style={{ color: item.liquidColor }}>
                          {/* Delicate specular highlight tracing the calm wave swell */}
                          <path 
                            d="M 0 5 C 12 2, 38 2, 50 5 C 62 8, 88 8, 100 5 C 112 2, 138 2, 150 5 C 162 8, 188 8, 200 5" 
                            fill="none" 
                            stroke="rgba(255, 255, 255, 0.45)" 
                            strokeWidth="1" 
                            strokeLinecap="round"
                          />
                          <path d="M 0 5 C 12 2, 38 2, 50 5 C 62 8, 88 8, 100 5 C 112 2, 138 2, 150 5 C 162 8, 188 8, 200 5 V 10 H 0 Z" />
                        </svg>
                      </div>

                      {/* Liquid Body (Starts right where wave trough meets, fills down into the jar bottom) */}
                      <div 
                        className="absolute top-[1px] inset-x-0 bottom-0 pointer-events-none"
                        style={{
                          backgroundColor: item.liquidColor,
                          backgroundImage: item.liquidGradient,
                          boxShadow: `0 0 22px ${item.glowColor}, inset 0 2px 4px rgba(255,255,255,0.3)`
                        }}
                      >
                        {/* Rising Micro Bubbles */}
                        <span 
                          className="absolute bottom-10 left-[28%] w-1.5 h-1.5 rounded-full bg-white/50 pointer-events-none" 
                          style={{ animation: 'jarBubbleA 3.2s ease-in infinite' }} 
                        />
                        <span 
                          className="absolute bottom-12 right-[32%] w-1 h-1 rounded-full bg-white/60 pointer-events-none" 
                          style={{ animation: 'jarBubbleB 2.6s ease-in infinite 0.9s' }} 
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Percentage Floating Prominently Over the Jar */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="flex items-center justify-center select-none bg-transparent p-0 border-0 shadow-none">
                    <span className={cn(
                      "text-[15px] min-[360px]:text-[16px] sm:text-[19px] md:text-[22px] font-black tracking-tight leading-none",
                      item.pct > 0 
                        ? "text-white [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.5))]" 
                        : "text-slate-600 dark:text-slate-300"
                    )}>
                      <AnimatedNumber value={item.pct} suffix="%" />
                    </span>
                  </div>
                </div>

                {/* Empty State Text Indicator (When 0% Liquid) */}
                {item.pct === 0 && (
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center pointer-events-none z-20">
                    <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400/80 select-none">
                      Dry
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Label, Value, and Sublabel Underneath */}
            <div className="flex flex-col items-center w-full mt-1.5 sm:mt-2">
              <span className="text-[9.5px] min-[360px]:text-[10px] sm:text-xs md:text-[10.5px] lg:text-[11.5px] xl:text-xs font-bold uppercase tracking-wider text-[var(--color-text-main)] whitespace-nowrap leading-tight text-center">
                {item.title}
              </span>
              <span className={cn(
                "text-[11.5px] min-[360px]:text-[12px] sm:text-[13px] md:text-[11px] lg:text-xs xl:text-[13px] font-bold whitespace-nowrap leading-tight mt-0.5 md:mt-1 text-center", 
                item.valueColor || item.textColor
              )}>
                {item.valueStr}
              </span>
              <span className="text-[8.5px] min-[360px]:text-[9px] sm:text-[9.5px] md:text-[8.5px] lg:text-[9.5px] xl:text-[10.5px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] whitespace-nowrap leading-tight mt-0.5 text-center">
                {item.sublabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Card Footer: Hidden on mobile, or when hideFooter is set on PC */}
      {!hideFooter && (
        <div className="hidden md:flex flex-col items-center text-center w-full mt-3 pt-2 border-t border-[var(--color-border)]/40 shrink-0">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none text-center">
            Cost Recovery & Margin
          </h4>
          <span className="text-[8px] min-[360px]:text-[8.5px] sm:text-[9.5px] font-semibold text-[var(--color-text-muted)] truncate w-full mt-1">
            {isCovered 
              ? "Factory fully recovered production costs and achieved net profit." 
              : `Recovered ${Math.round(recoveredPct)}% • ${Math.round(shortfallPct)}% more needed to reach break-even.`}
          </span>
        </div>
      )}
    </div>
  );
}
