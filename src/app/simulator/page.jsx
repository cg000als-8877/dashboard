"use client";

import { useState, useEffect } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Settings, Play, Anchor, AlertTriangle, HelpCircle } from 'lucide-react';
import { SimulatorSkeleton } from '@/components/ui/Skeletons';
import { cn } from '@/components/layout/Sidebar';

export default function SimulatorPage() {
  const { stats, dailyTrends, loading, error } = useKpiData();
  const [simMode, setSimMode] = useState('loss'); // default to 'loss' mode
  const [simRecovery, setSimRecovery] = useState(72); // default to 72% (matches current month pace)
  const [simDay, setSimDay] = useState(14); 
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);

  // Sync initial recovery from real data if available
  useEffect(() => {
    if (stats?.totalCost && stats.totalCost > 0) {
      const rec = Math.round((stats.totalIncome / stats.totalCost) * 100);
      setSimRecovery(rec);
      if (rec >= 100) setSimMode('profit');
      else setSimMode('loss');
    }
  }, [stats]);

  if (loading) {
    return <SimulatorSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  const handleModeChange = (mode) => {
    setSimMode(mode);
    if (mode === 'profit') setSimRecovery(115);
    else if (mode === 'neutral') setSimRecovery(100);
    else setSimRecovery(prev => prev < 100 ? prev : 65);
  };

  const handleSliderChange = (val) => {
    setSimRecovery(val);
    if (val >= 100) {
      setSimMode('profit');
    } else if (val === 100) {
      setSimMode('neutral');
    } else {
      setSimMode('loss');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      {/* Page Header */}
      <header className="flex flex-col items-center text-center md:items-start md:text-left mb-6 md:mb-8 relative z-10">
        <h1 className="text-[24px] sm:text-[30px] md:text-[38px] font-black tracking-normal leading-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
          Voyage Simulator
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-muted)] font-normal tracking-normal mt-1 md:mt-2 max-w-2xl">
          Option A Financial Gravity Simulation: Watch how the ship physically responds to Cost Recovery % and sinks entirely under 10%.
        </p>
      </header>

      {/* SIMULATOR EXPLANATION (Accordion styled with plus sign) */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
          className="w-full text-left p-4 bg-[var(--color-surface)]/20 hover:bg-[var(--color-surface)]/40 transition-colors flex items-center justify-between cursor-pointer select-none border-none outline-none"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle size={16} className="text-[var(--color-primary)]" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">
              How Financial Gravity (Option A) Controls the Ship
            </span>
          </div>
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-base transition-all">
            {isExplanationExpanded ? '−' : '+'}
          </div>
        </button>
        
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden border-t border-[var(--color-border)]/40",
            isExplanationExpanded ? "max-h-[600px] p-4 opacity-100" : "max-h-0 p-0 opacity-0 pointer-events-none"
          )}
        >
          <ul className="space-y-2 text-xs md:text-sm text-[var(--color-text-secondary)] pl-4 list-disc">
            <li><strong className="text-[var(--color-success)]">≥ 100% Recovery (Profit):</strong> Ship sails at full steam with spinning propellers, smoke plumes, and splashes. At &gt; 120% (Surplus), turbo wake and golden foam engage.</li>
            <li><strong className="text-[var(--color-warning)]">85% – 99% Recovery:</strong> Approaching break-even. Gentle bow list (1°–7°), small water breach leak, calm wake.</li>
            <li><strong className="text-[var(--color-primary)]">70% – 84% Recovery:</strong> Moderate deficit. Bow dips (8°–16°), water lapping against the hull. (Matches current month pace).</li>
            <li><strong className="text-[var(--color-danger)]">50% – 69% Recovery:</strong> Heavy flooding (16°–30°). Foremast snaps (&lt;65%), Funnel #1 collapses (&lt;58%).</li>
            <li><strong className="text-[var(--color-danger)]">25% – 49% Recovery:</strong> Severe incline (30°–45°). Funnel #2 &amp; #3 collapse, midsection stress crack splits across the hull.</li>
            <li><strong className="text-[var(--color-danger)]">10% – 24% Recovery:</strong> Catastrophic split! Hull snaps in two, funnel #4 topples, stern pivots vertically (90°).</li>
            <li><strong className="text-red-500 font-bold">Under 10% Recovery (Catastrophe):</strong> The ship sinks <strong>ENTIRELY</strong> to the ocean floor, resting in the seabed abyss surrounded by impact bubbles and glowing jellyfish.</li>
          </ul>
        </div>
      </div>

      {/* Titanic Animation Section */}
      <div className="w-full">
        <TitanicAnimation 
          isSimulation={true} 
          simState={simMode} 
          recoveryPercentage={simRecovery}
          simDay={simDay} 
          netProfit={simRecovery >= 100 ? 50000 : -50000} 
        />
      </div>

      {/* SIMULATOR CONTROLS */}
      <Card className="bg-[rgba(79,140,255,0.05)] border-[var(--color-primary)]/40 shadow-[0_0_30px_rgba(79,140,255,0.08)]">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[var(--color-primary)] p-2 rounded-lg text-[var(--color-on-primary)]">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-main)] uppercase tracking-wide">Ship Physics Override</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Mode presets &amp; direct financial recovery simulation.
                </p>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 mb-4 items-stretch">
              <button 
                type="button"
                onClick={() => handleModeChange('profit')}
                className={`w-full flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs md:text-sm whitespace-nowrap transition-all duration-300 active:scale-95 cursor-pointer select-none ${simMode === 'profit' ? 'bg-[var(--color-success)] text-[var(--color-on-success)] [box-shadow:0_0_20px_var(--color-success-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">Profit (115%)</span>
              </button>
              
              <button 
                type="button"
                onClick={() => handleModeChange('neutral')}
                className={`w-full flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs md:text-sm whitespace-nowrap transition-all duration-300 active:scale-95 cursor-pointer select-none ${simMode === 'neutral' ? 'bg-[var(--color-warning)] text-[var(--color-on-warning)] [box-shadow:0_0_20px_var(--color-warning-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <Anchor className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">Neutral (100%)</span>
              </button>
              
              <button 
                type="button"
                onClick={() => handleModeChange('loss')}
                className={`w-full flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs md:text-sm whitespace-nowrap transition-all duration-300 active:scale-95 cursor-pointer select-none ${simMode === 'loss' ? 'bg-[var(--color-danger)] text-[var(--color-on-danger)] [box-shadow:0_0_20px_var(--color-danger-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">Loss (&lt;100%)</span>
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]/50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                Quick Recovery Milestones:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "8% (Sunk Entirely)", val: 8 },
                  { label: "18% (Split 90°)", val: 18 },
                  { label: "35% (Crack)", val: 35 },
                  { label: "58% (Flood)", val: 58 },
                  { label: "75% (October Pace)", val: 75 },
                  { label: "92% (Break-Even)", val: 92 },
                  { label: "125% (Surplus)", val: 125 }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleSliderChange(item.val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all active:scale-95 cursor-pointer ${
                      simRecovery === item.val
                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-sm'
                        : 'bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Recovery % Interactive Slider */}
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-1 uppercase tracking-wide">
              Live Cost Recovery Scrubber
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              Drag to observe real-time hull sinking and structural physics. When under 10%, the ship plunges fully to the ocean floor.
            </p>
            
            <div className="bg-[var(--color-bg-main)] p-5 rounded-xl border border-[var(--color-border)] shadow-inner">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-main)]">
                  {simRecovery}% <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Cost Recovery</span>
                </span>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  simRecovery >= 100 
                    ? 'bg-[var(--color-success)]/20 text-[var(--color-success-text)]' 
                    : (simRecovery < 10 
                        ? 'bg-red-600/30 text-red-400 animate-pulse font-black' 
                        : 'bg-[var(--color-danger)]/20 text-[var(--color-danger-text)]')
                }`}>
                  {simRecovery >= 120 ? 'Surplus Cruise' :
                   simRecovery >= 100 ? 'Profitable' :
                   simRecovery >= 85 ? 'Approaching 100%' :
                   simRecovery >= 70 ? 'Water Lapping' :
                   simRecovery >= 50 ? 'Heavy Flood' :
                   simRecovery >= 25 ? 'Crack Incline' :
                   simRecovery >= 10 ? 'Catastrophic Split' :
                   '🚨 SUNK ENTIRELY (SEABED)'}
                </span>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="130" 
                value={simRecovery} 
                onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-gray-700/60 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)] transition-all"
              />
              
              <div className="flex justify-between text-[9px] sm:text-[10px] text-[var(--color-text-muted)] mt-2 font-mono">
                <span className="text-red-400 font-bold">0% (Sunk)</span>
                <span>10% (Split)</span>
                <span>50% (Flood)</span>
                <span>85% (Near)</span>
                <span className="text-emerald-400 font-bold">100%+ (Full Steam)</span>
              </div>
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
}
