"use client";

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[999] bg-[var(--color-bg-main)] flex flex-col items-center justify-center px-4 sm:px-6 select-none overflow-hidden text-center">
      {/* Ambient Deep-Sea Glow (No borders, pure soft light) */}
      <div className="absolute w-[32rem] sm:w-[48rem] h-[32rem] sm:h-[48rem] rounded-full bg-[var(--color-primary-glow)] blur-[120px] pointer-events-none -translate-y-8 opacity-70" />
      <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none translate-y-24" />

      {/* Main Atmospheric Visual Column (Stroke-Free, Card-Free) */}
      <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
        
        {/* Telemetry Status Signal (No card, pure typography) */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-rose-400">
            SIGNAL SEVERED • SECTOR NOT FOUND
          </span>
        </div>

        {/* Giant Animating 404 with Sonar Radar Core & Oceanic Float */}
        <div className="relative flex items-center justify-center my-2 sm:my-4">
          
          {/* Concentric Sonar Radar Waves radiating from the center '0' */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 animate-sonar-radar-ping-1 pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 animate-sonar-radar-ping-2 pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 animate-sonar-radar-ping-3 pointer-events-none" />
          </div>

          {/* The 404 Floating Numbers */}
          <div className="animate-oceanic-float-404 flex items-center justify-center select-none font-mono font-black tracking-tight drop-shadow-[0_15px_35px_var(--color-primary-glow)]">
            {/* First 4 */}
            <span className="text-8xl sm:text-9xl md:text-[11rem] bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-primary)] via-sky-200 to-[var(--color-primary)]/30">
              4
            </span>

            {/* Central '0' with Nautical Radar Core */}
            <div className="relative mx-1 sm:mx-3 w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 flex items-center justify-center">
              {/* Spinning Radar Conic Sweep inside the 0 */}
              <div 
                className="absolute inset-2 sm:inset-3 rounded-full opacity-60 animate-sonar-sweep-404 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, var(--color-primary) 360deg)'
                }}
              />
              
              {/* Outer 0 Ring */}
              <span className="text-8xl sm:text-9xl md:text-[11rem] bg-clip-text text-transparent bg-gradient-to-b from-sky-100 via-[var(--color-primary)] to-[var(--color-primary)]/20">
                0
              </span>

              {/* Floating Center Beacon / Compass Needle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-80 pointer-events-none">
                <Compass className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
              </div>
            </div>

            {/* Second 4 */}
            <span className="text-8xl sm:text-9xl md:text-[11rem] bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-primary)] via-sky-200 to-[var(--color-primary)]/30">
              4
            </span>
          </div>
        </div>

        {/* Narrative Heading & Description matching "Sinking Voyage" */}
        <h1 className="mt-4 sm:mt-6 text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-[0.16em] text-slate-100">
          Vessel Drifted Off-Course
        </h1>
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-md px-2">
          The requested navigational sector cannot be found in factory radar telemetry. This route has sunk beneath the waves or drifted outside operational waters.
        </p>

        {/* Subtle Radar Telemetry Coordinates (No card, pure monospace text) */}
        <div className="mt-4 sm:mt-5 font-mono text-[10px] sm:text-[11px] text-slate-500 tracking-wider">
          COORDINATES: UNRESOLVED • DEPTH: -404m • RADAR: SILENT
        </div>

        {/* Solitary CTA Button: Stroke-free, Card-free, Leading Directly to Dashboard */}
        <div className="mt-7 sm:mt-9">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2.5 px-8 sm:px-9 py-3 sm:py-3.5 rounded-full bg-[var(--color-primary)] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:brightness-110 active:scale-95 shadow-[0_8px_30px_var(--color-primary-glow)] hover:shadow-[0_12px_40px_var(--color-primary-glow-hover)] cursor-pointer select-none border-0 outline-none"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>

      {/* Atmospheric Ambient Drift Waves at the Deep Bottom (Zero strokes, pure fluid gradient) */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none opacity-25 overflow-hidden">
        <div 
          className="w-[200%] h-full bg-gradient-to-t from-[var(--color-primary)]/20 via-[var(--color-primary)]/5 to-transparent animate-oceanic-wave-drift"
        />
      </div>
    </div>
  );
}
