"use client";

import React, { useState, useEffect } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { SimulatorSkeleton } from '@/components/ui/Skeletons';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/components/layout/Sidebar';

// ── CUSTOM 3D ISOMETRIC ICONS (ZERO OUTLINE CLUTTER, ZERO STROKES) ──
function Icon3DSurplus({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="topSurge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="leftSurge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="rightSurge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <radialGradient id="surgeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="34" rx="14" ry="4" fill="url(#surgeGlow)" />
      <polygon points="20,4 32,11 20,18 8,11" fill="url(#topSurge)" />
      <polygon points="8,11 20,18 20,31 8,24" fill="url(#leftSurge)" />
      <polygon points="20,18 32,11 32,24 20,31" fill="url(#rightSurge)" />
      <polygon points="20,8 26,14 22,14 22,20 18,20 18,14 14,14" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

function Icon3DCruise({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="topCruise" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="leftCruise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="rightCruise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="cruiseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="34" rx="14" ry="4" fill="url(#cruiseGlow)" />
      <polygon points="20,5 33,12 20,19 7,12" fill="url(#topCruise)" />
      <polygon points="7,12 20,19 20,30 7,23" fill="url(#leftCruise)" />
      <polygon points="20,19 33,12 33,23 20,30" fill="url(#rightCruise)" />
      <polygon points="20,9 27,13 20,17 13,13" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

function Icon3DFlood({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="topFlood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="leftFlood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="rightFlood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9A3412" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
        <radialGradient id="floodGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="34" rx="14" ry="4" fill="url(#floodGlow)" />
      <polygon points="20,8 33,14 20,20 7,14" fill="url(#topFlood)" />
      <polygon points="7,14 20,20 20,32 7,24" fill="url(#leftFlood)" />
      <polygon points="20,20 33,14 33,24 20,32" fill="url(#rightFlood)" />
      <path d="M 12 15 Q 20 18 28 15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Icon3DAbyss({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="topAbyss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="leftAbyss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="rightAbyss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="100%" stopColor="#450A0A" />
        </linearGradient>
        <radialGradient id="abyssGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="34" rx="14" ry="4" fill="url(#abyssGlow)" />
      <polygon points="20,10 32,16 20,22 8,16" fill="url(#topAbyss)" />
      <polygon points="8,16 20,22 20,33 8,26" fill="url(#leftAbyss)" />
      <polygon points="20,22 32,16 32,26 20,33" fill="url(#rightAbyss)" />
      <path d="M 20 10 L 19 16 L 21 22 L 20 33" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SimulatorPage() {
  const { stats, loading, error } = useKpiData();

  // ── REAL WEBSITE DATA RESOLUTION (CURRENCY: BDT) ──
  const liveCost = (stats?.totalCost && stats.totalCost > 0) ? stats.totalCost : 1702782;
  const liveIncome = (stats?.totalIncome && stats.totalIncome > 0) ? stats.totalIncome : 1069310;
  const realRecovery = liveCost > 0 ? Math.round((liveIncome / liveCost) * 100) : 63;
  const realWorkingDays = stats?.workingDays || 12;

  const [simRecovery, setSimRecovery] = useState(realRecovery);
  const [simMode, setSimMode] = useState(realRecovery >= 100 ? 'profit' : 'loss');
  const [activeScenarioId, setActiveScenarioId] = useState('oct-pace');

  // Sync with real data when loaded
  useEffect(() => {
    if (stats?.totalCost && stats.totalCost > 0) {
      const rec = Math.round((stats.totalIncome / stats.totalCost) * 100);
      setSimRecovery(rec);
      setSimMode(rec >= 100 ? 'profit' : 'loss');
    }
  }, [stats]);

  if (loading) {
    return <SimulatorSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20 text-xs sm:text-sm">Error loading data: {error}</div>;
  }

  // Dynamic calculated projections based on real cost base
  const simulatedIncome = Math.round((liveCost * simRecovery) / 100);
  const simulatedNet = simulatedIncome - liveCost;
  const isProfitable = simRecovery >= 100;
  const isSurplus = simRecovery >= 120;
  const isEntirelySunk = simRecovery < 10;

  const handleSliderChange = (val) => {
    setSimRecovery(val);
    setActiveScenarioId('custom');
    if (val >= 100) {
      setSimMode('profit');
    } else if (val === 100) {
      setSimMode('neutral');
    } else {
      setSimMode('loss');
    }
  };

  const selectScenario = (id, recoveryVal, mode) => {
    setActiveScenarioId(id);
    setSimRecovery(recoveryVal);
    setSimMode(mode);
  };

  // Structured Scenarios strictly bound to real factory financial scale
  const scenarios = [
    {
      id: 'surplus',
      label: 'Surplus Surge',
      recovery: 125,
      mode: 'profit',
      summary: 'Golden foam splashes, turbo chimney plumes, full steam ahead',
      tag: 'Surplus',
      tagColor: 'bg-emerald-500/15 text-emerald-400',
      icon: <Icon3DSurplus />
    },
    {
      id: 'target',
      label: 'Break-Even Target',
      recovery: 100,
      mode: 'profit',
      summary: 'Level waterline, balanced production costs, steady cruise engines',
      tag: 'Break-Even',
      tagColor: 'bg-amber-500/15 text-amber-400',
      icon: <Icon3DCruise />
    },
    {
      id: 'near-break',
      label: 'Minor Deficit Drift',
      recovery: 92,
      mode: 'loss',
      summary: 'Gentle 3° listing, small water breach with bubbles, calm wake',
      tag: 'Closing In',
      tagColor: 'bg-amber-500/15 text-amber-300',
      icon: <Icon3DCruise />
    },
    {
      id: 'oct-pace',
      label: 'October Live Pace',
      recovery: realRecovery,
      mode: 'loss',
      summary: `Exact live website data: 12° bow dip, water lapping hull (${realRecovery}% pace)`,
      tag: 'October Live',
      tagColor: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
      icon: <Icon3DFlood />
    },
    {
      id: 'heavy-flood',
      label: 'Material Cost Surge',
      recovery: 50,
      mode: 'loss',
      summary: '22° flood incline, foremast snaps, funnel #1 collapses backward',
      tag: 'Heavy Flood',
      tagColor: 'bg-orange-500/15 text-orange-400',
      icon: <Icon3DFlood />
    },
    {
      id: 'stress-crack',
      label: 'Severe Line Bottleneck',
      recovery: 30,
      mode: 'loss',
      summary: '38° steep tilt, funnels 1-3 toppled, midsection fracture crack',
      tag: 'Stress Crack',
      tagColor: 'bg-rose-500/15 text-rose-400',
      icon: <Icon3DAbyss />
    },
    {
      id: 'split',
      label: 'Catastrophic Split',
      recovery: 18,
      mode: 'loss',
      summary: 'Hull snaps in two, funnel #4 falls, stern pivots 90° vertical',
      tag: 'Split 90°',
      tagColor: 'bg-red-500/20 text-red-400',
      icon: <Icon3DAbyss />
    },
    {
      id: 'sunk-entirely',
      label: 'Insolvent Shutdown',
      recovery: 8,
      mode: 'loss',
      summary: 'Under 10% condition: ship plunges entirely to ocean floor seabed',
      tag: 'Entirely Sunk',
      tagColor: 'bg-red-700/30 text-red-300 font-bold',
      icon: <Icon3DAbyss />
    }
  ];

  return (
    <div className="space-y-3.5 sm:space-y-5 md:space-y-6 animate-[fade-up_0.35s_ease-out_both] select-none">
      
      {/* 1. EDITORIAL HEADER - MATCHING DASHBOARD HIERARCHY */}
      <header className="flex flex-col items-center text-center md:items-start md:text-left relative z-10 px-1 sm:px-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-surface)] text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 shadow-xs">
          Financial Gravity Engine
        </div>
        <h1 className="text-[20px] min-[390px]:text-[24px] sm:text-[28px] md:text-[34px] font-black tracking-tight leading-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
          Voyage Simulator
        </h1>
        <p className="text-[10px] min-[390px]:text-[11px] sm:text-xs text-[var(--color-text-secondary)] font-normal tracking-normal mt-0.5 max-w-xl">
          Real-time physical simulation powered by live factory operations. When cost recovery drops under 10%, the ship plunges entirely to the seabed.
        </p>
      </header>

      {/* 2. SHIP VIEWPORT (BORDERLESS, CLEAN AMBIENT SHADOW) */}
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-xl bg-[var(--color-bg-card)]">
        <TitanicAnimation 
          isSimulation={true} 
          simState={simMode} 
          recoveryPercentage={simRecovery}
          netProfit={simulatedNet} 
        />
      </div>

      {/* 3. REAL-TIME FINANCIAL IMPACT BAR (BDT CURRENCY, NO STROKES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        
        {/* Recovery Rate */}
        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-bg-card)] shadow-xs sm:shadow-sm flex flex-col justify-between">
          <span className="text-[9px] min-[390px]:text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Recovery Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={cn(
              "text-[18px] min-[390px]:text-[20px] sm:text-[24px] md:text-[28px] font-black tracking-tight leading-none",
              isSurplus ? "text-emerald-400" : isProfitable ? "text-[var(--color-success-text)]" : isEntirelySunk ? "text-red-400" : "text-[var(--color-text-main)]"
            )}>
              <AnimatedNumber value={simRecovery} suffix="%" />
            </span>
            <span className={cn(
              "text-[8px] min-[390px]:text-[8.5px] sm:text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-md",
              isSurplus ? "bg-emerald-500/15 text-emerald-400" :
              isProfitable ? "bg-emerald-500/15 text-emerald-400" :
              isEntirelySunk ? "bg-red-600/25 text-red-400" :
              "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
            )}>
              {isSurplus ? 'Surplus' : isProfitable ? 'Profit' : isEntirelySunk ? 'Sunk' : 'Deficit'}
            </span>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] text-[var(--color-text-muted)] mt-1 font-medium truncate">
            {simRecovery === realRecovery ? "Matching live October pace" : "Simulated scenario"}
          </span>
        </div>

        {/* Simulated Income */}
        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-bg-card)] shadow-xs sm:shadow-sm flex flex-col justify-between">
          <span className="text-[9px] min-[390px]:text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Simulated Income
          </span>
          <div className="mt-1">
            <span className="text-[17px] min-[390px]:text-[19px] sm:text-[22px] md:text-[26px] font-black tracking-tight leading-none text-[var(--color-text-main)]">
              <AnimatedNumber value={Math.round(simulatedIncome)} prefix="BDT " />
            </span>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] text-[var(--color-text-muted)] mt-1 font-medium truncate">
            Actual: BDT {Math.round(liveIncome).toLocaleString()}
          </span>
        </div>

        {/* Monthly Cost Base */}
        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-bg-card)] shadow-xs sm:shadow-sm flex flex-col justify-between">
          <span className="text-[9px] min-[390px]:text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Monthly Cost Base
          </span>
          <div className="mt-1">
            <span className="text-[17px] min-[390px]:text-[19px] sm:text-[22px] md:text-[26px] font-black tracking-tight leading-none text-[var(--color-text-secondary)]">
              <AnimatedNumber value={Math.round(liveCost)} prefix="BDT " />
            </span>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] text-[var(--color-text-muted)] mt-1 font-medium truncate">
            {realWorkingDays} Active Days Paced
          </span>
        </div>

        {/* Projected Net Margin */}
        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-bg-card)] shadow-xs sm:shadow-sm flex flex-col justify-between">
          <span className="text-[9px] min-[390px]:text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Projected Net Margin
          </span>
          <div className="mt-1">
            <span className={cn(
              "text-[17px] min-[390px]:text-[19px] sm:text-[22px] md:text-[26px] font-black tracking-tight leading-none",
              simulatedNet >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
            )}>
              <AnimatedNumber 
                value={Math.abs(Math.round(simulatedNet))} 
                prefix={simulatedNet >= 0 ? "+BDT " : "BDT -"} 
              />
            </span>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] text-[var(--color-text-muted)] mt-1 font-medium truncate">
            {isProfitable ? "Operating in surplus" : isEntirelySunk ? "Total capital wipeout" : "Net operating deficit"}
          </span>
        </div>

      </div>

      {/* 4. MAIN INTERACTIVE CONTROLS CARD (ZERO STROKES, ZERO DOTS) */}
      <div className="p-3.5 sm:p-5 md:p-6 rounded-2xl bg-[var(--color-bg-card)] shadow-xs sm:shadow-sm space-y-4 sm:space-y-5">
        
        {/* Scrubber Section */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
            <div>
              <h2 className="text-xs min-[390px]:text-sm sm:text-base font-bold uppercase tracking-wider text-[var(--color-text-main)]">
                Cost Recovery Physics Scrubber
              </h2>
              <p className="text-[9.5px] min-[390px]:text-[10.5px] sm:text-xs text-[var(--color-text-muted)] mt-0.5">
                Drag to simulate instant structural reaction. Under 10%, the vessel plunges fully to the ocean floor.
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 mt-1 sm:mt-0">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text-main)]">
                {simRecovery}%
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap",
                isSurplus ? "bg-emerald-500/15 text-emerald-400" :
                isProfitable ? "bg-emerald-500/15 text-emerald-400" :
                simRecovery >= 85 ? "bg-amber-500/15 text-amber-300" :
                simRecovery >= 70 ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]" :
                simRecovery >= 50 ? "bg-orange-500/15 text-orange-400" :
                simRecovery >= 25 ? "bg-rose-500/15 text-rose-400" :
                simRecovery >= 10 ? "bg-red-500/20 text-red-400" :
                "bg-red-600/30 text-red-300 font-black animate-pulse"
              )}>
                {isSurplus ? "Surplus Full Steam" :
                 isProfitable ? "Profitable Cruising" :
                 simRecovery >= 85 ? "Approaching Target" :
                 simRecovery >= 70 ? "Water Lapping Hull" :
                 simRecovery >= 50 ? "Heavy Flooding" :
                 simRecovery >= 25 ? "Midsection Fracture" :
                 simRecovery >= 10 ? "Catastrophic Split" :
                 "Entirely Sunk (Seabed)"}
              </span>
            </div>
          </div>

          {/* Clean borderless slider track */}
          <div className="pt-1">
            <input 
              type="range" 
              min="0" 
              max="130" 
              value={simRecovery} 
              onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
              className="w-full h-2.5 sm:h-3 bg-[var(--color-surface)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)] transition-all"
            />
            {/* Scrubber Milestones - Small Size Pills (Zero Strokes, Clickable) */}
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5">
              {[
                { label: "0% Sunk", val: 0, activeBg: "bg-red-600 text-white", idleBg: "bg-red-500/15 text-red-400" },
                { label: "10% Split", val: 10, activeBg: "bg-red-500 text-white", idleBg: "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" },
                { label: "50% Flood", val: 50, activeBg: "bg-orange-500 text-white", idleBg: "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" },
                { label: `${realRecovery}% Live`, val: realRecovery, activeBg: "bg-[var(--color-primary)] text-[var(--color-on-primary)]", idleBg: "bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-black" },
                { label: "100% Break-Even", val: 100, activeBg: "bg-amber-500 text-white", idleBg: "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" },
                { label: "130% Surplus", val: 130, activeBg: "bg-emerald-500 text-white", idleBg: "bg-emerald-500/15 text-emerald-400" },
              ].map((pill) => {
                const isSelected = simRecovery === pill.val;
                return (
                  <button
                    key={pill.val}
                    type="button"
                    onClick={() => handleSliderChange(pill.val)}
                    className={cn(
                      "px-1.5 min-[360px]:px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[7px] min-[360px]:text-[7.5px] min-[390px]:text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all select-none cursor-pointer border-none shadow-xs active:scale-95",
                      isSelected ? pill.activeBg : pill.idleBg
                    )}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. SCENARIO MATRIX (BORDERLESS 3D CARDS, CLEAN COMPACT SCALE) */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] min-[390px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Operational Scenarios (Click to Apply)
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] text-[var(--color-text-muted)] font-medium">
              8 Real-World Presets
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {scenarios.map((sc) => {
              const isSelected = activeScenarioId === sc.id || simRecovery === sc.recovery;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => selectScenario(sc.id, sc.recovery, sc.mode)}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left transition-all duration-200 flex flex-col justify-between gap-1.5 active:scale-95 cursor-pointer shadow-xs group",
                    isSelected 
                      ? "bg-[var(--color-surface-hover)] shadow-xs -translate-y-0.5" 
                      : "bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="shrink-0">
                      {sc.icon}
                    </div>
                    <span className={cn("px-1.5 py-0.5 rounded-md text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap", sc.tagColor)}>
                      {sc.tag}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[11px] sm:text-xs font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {sc.label}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-black font-mono text-[var(--color-text-secondary)] shrink-0">
                        {sc.recovery}%
                      </span>
                    </div>
                    <p className="text-[8.5px] min-[390px]:text-[9px] sm:text-[9.5px] text-[var(--color-text-muted)] leading-tight mt-0.5 line-clamp-2">
                      {sc.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. STRUCTURAL BREAKDOWN GUIDE (NO STROKES, NO DOTS, CLEAN EDITORIAL REFERENCE) */}
      <div className="p-3.5 sm:p-5 md:p-6 rounded-2xl bg-[var(--color-bg-card)] shadow-xs sm:shadow-sm space-y-3">
        <div className="text-center sm:text-left">
          <h3 className="text-xs min-[390px]:text-sm sm:text-base font-bold uppercase tracking-wider text-[var(--color-text-main)]">
            Hull Damage &amp; Sinking Mechanics Reference
          </h3>
          <p className="text-[9.5px] min-[390px]:text-[10.5px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 max-w-xl mx-auto sm:mx-0">
            Physics specification governing ship tilt angles, structural breaks, and underwater plunge stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)]/50 shadow-xs flex flex-col justify-between gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-bold uppercase text-[var(--color-text-main)] leading-snug">
                Surplus &amp; Operating Target
              </span>
              <span className="shrink-0 whitespace-nowrap text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                100% to 130%
              </span>
            </div>
            <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
              Ship remains completely afloat and sails level. In surplus (&gt;120%), golden wake foam erupts, chimney smoke billows at turbo volume, and waves rush past at accelerated velocity.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)]/50 shadow-xs flex flex-col justify-between gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-bold uppercase text-[var(--color-text-main)] leading-snug">
                Break-Even Approach
              </span>
              <span className="shrink-0 whitespace-nowrap text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300">
                85% to 99%
              </span>
            </div>
            <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
              Gentle forward pitch between 1° and 7°. Iceberg damage at coordinates (870, 270) generates fine leak bubbles. All four funnels and both masts remain upright.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)]/50 shadow-xs flex flex-col justify-between gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-bold uppercase text-[var(--color-text-main)] leading-snug">
                Moderate Deficit (October Live Pace)
              </span>
              <span className="shrink-0 whitespace-nowrap text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                70% to 84% ({realRecovery}%)
              </span>
            </div>
            <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
              Bow visibly submerges with an 8° to 16° tilt. Water begins lapping against the lower forward deck. Matches October real-world factory recovery rate ({realRecovery}%).
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)]/50 shadow-xs flex flex-col justify-between gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-bold uppercase text-[var(--color-text-main)] leading-snug">
                Heavy Flooding
              </span>
              <span className="shrink-0 whitespace-nowrap text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400">
                50% to 69%
              </span>
            </div>
            <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
              Severe flooding drives incline from 16° to 30°. Under 65% recovery, the foremast collapses. Under 58%, Funnel #1 topples backward into the water.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)]/50 shadow-xs flex flex-col justify-between gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-bold uppercase text-[var(--color-text-main)] leading-snug">
                Severe Incline &amp; Stress Crack
              </span>
              <span className="shrink-0 whitespace-nowrap text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400">
                25% to 49%
              </span>
            </div>
            <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
              Steep 30° to 45° incline. Funnel #2 collapses under 45%, and Funnel #3 collapses under 35%. Below 32%, a deep jagged fracture crack splits across the central midsection.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)]/50 shadow-xs flex flex-col justify-between gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-bold uppercase text-[var(--color-text-main)] leading-snug">
                Catastrophic Split &amp; Seabed Abyss
              </span>
              <span className="shrink-0 whitespace-nowrap text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-red-600/25 text-red-300 font-bold">
                &lt; 25% (Sunk &lt; 10%)
              </span>
            </div>
            <p className="text-[9.5px] sm:text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
              Between 10% and 24%, the hull snaps in two with stern standing vertically at 90°. Under 10%, the vessel sinks ENTIRELY to the seabed floor (Y=500), resting with giant underwater bubbles and glowing abyss jellyfish.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
