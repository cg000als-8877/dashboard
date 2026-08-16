"use client";

import { useState } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Settings, Play, Anchor, AlertTriangle, HelpCircle } from 'lucide-react';
import { SimulatorSkeleton } from '@/components/ui/Skeletons';
import { cn } from '@/components/layout/Sidebar';

export default function SimulatorPage() {
  const { stats, loading, error } = useKpiData();
  const [simMode, setSimMode] = useState('profit'); // 'profit', 'neutral', 'loss'
  const [simDay, setSimDay] = useState(1); // 1 to 31
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true); // default open

  if (loading) {
    return <SimulatorSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      {/* SIMULATOR EXPLANATION (Accordion styled with plus sign) */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
          className="w-full text-left p-4 bg-[var(--color-surface)]/20 hover:bg-[var(--color-surface)]/40 transition-colors flex items-center justify-between cursor-pointer select-none border-none outline-none"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle size={16} className="text-[var(--color-primary)]" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">
              How the Ship Simulator Works
            </span>
          </div>
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-base transition-all">
            {isExplanationExpanded ? '−' : '+'}
          </div>
        </button>
        
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden border-t border-[var(--color-border)]/40",
            isExplanationExpanded ? "max-h-[500px] p-4 opacity-100" : "max-h-0 p-0 opacity-0 pointer-events-none"
          )}
        >
          <ul className="space-y-3.5 text-xs md:text-sm text-[var(--color-text-secondary)] pl-4 list-disc">
            <li><strong className="text-[var(--color-success)]">Profitable:</strong> When the company is making money, the ship moves forward "full steam ahead."</li>
            <li><strong className="text-[var(--color-warning)]">Breaking Even:</strong> When the company is neither making a profit nor taking a loss, the ship sits in neutral.</li>
            <li><strong className="text-[var(--color-danger)]">Losing Money:</strong> If the company starts losing money day by day, the ship begins to take on water. The situation grows more dramatic each day, culminating in the ship completely sinking by the end of the month.</li>
          </ul>
        </div>
      </div>

      {/* Titanic Fun Animation Section */}
      <div className="w-full">
        <TitanicAnimation 
          isSimulation={true} 
          simState={simMode} 
          simDay={simDay} 
          netProfit={stats.netProfit} 
        />
      </div>

      {/* SIMULATOR CONTROLS */}
      <Card className="bg-[rgba(79,140,255,0.05)] border-[var(--color-primary)]/40 shadow-[0_0_30px_rgba(79,140,255,0.08)]">
        <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start">
          
          <div className="flex-1">
            <div className="hidden md:flex items-center gap-3 mb-4">
              <div className="bg-[var(--color-primary)] p-2 rounded-lg text-[var(--color-on-primary)]">
                <Settings size={20} />
              </div>
              <h3 className="text-xl font-medium text-[var(--color-text-main)]">Ship Physics Control</h3>
            </div>
            <p className="hidden md:block text-sm text-[var(--color-text-secondary)] mb-6">
              Manually override the ship's state. Watch how the physics engine reacts to different scenarios, from full steam ahead to catastrophic failure.
            </p>

            <div className="flex flex-row gap-2 md:gap-4 mb-2 md:mb-8 w-full justify-between items-center">
              <button 
                onClick={() => setSimMode('profit')}
                className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-4 rounded-xl font-bold text-[9px] sm:text-xs md:text-base whitespace-nowrap transition-all duration-300 active:scale-95 cursor-pointer ${simMode === 'profit' ? 'bg-[var(--color-success)] text-[var(--color-on-success)] [box-shadow:0_0_20px_var(--color-success-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">Profit Mode</span>
              </button>
              
              <button 
                onClick={() => setSimMode('neutral')}
                className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-4 rounded-xl font-bold text-[9px] sm:text-xs md:text-base whitespace-nowrap transition-all duration-300 active:scale-95 cursor-pointer ${simMode === 'neutral' ? 'bg-[var(--color-warning)] text-[var(--color-on-warning)] [box-shadow:0_0_20px_var(--color-warning-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <Anchor className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">Neutral Mode</span>
              </button>
              
              <button 
                onClick={() => { setSimMode('loss'); setSimDay(1); }}
                className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-4 rounded-xl font-bold text-[9px] sm:text-xs md:text-base whitespace-nowrap transition-all duration-300 active:scale-95 cursor-pointer ${simMode === 'loss' ? 'bg-[var(--color-danger)] text-[var(--color-on-danger)] [box-shadow:0_0_20px_var(--color-danger-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">Loss Mode</span>
              </button>
            </div>
          </div>

          {/* Time Progression Slider (Only visible in Loss Mode) */}
          <div className={`flex-1 w-full transition-opacity duration-500 ${simMode === 'loss' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <h3 className="text-lg font-medium text-[var(--color-text-main)] mb-2">Time Progression (Days of Loss)</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Drag the slider to simulate sustained losses over time. Watch the ship dynamically sink, tilt, and break apart based on the day of the month.
            </p>
            
            <div className="bg-[var(--color-bg-main)] p-6 rounded-xl border border-[var(--color-border)]">
              <div className="flex justify-between items-end mb-4">
                <span className="text-3xl font-bold text-[var(--color-danger)]">Day {simDay}</span>
                <span className="text-sm font-light text-[var(--color-text-secondary)]">Max: 31 Days</span>
              </div>
              
              <input 
                type="range" 
                min="1" 
                max="31" 
                value={simDay} 
                onChange={(e) => setSimDay(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-danger)]"
              />
              
              <div className="flex justify-between text-xs text-gray-500 mt-2 font-light">
                <span>Safe</span>
                <span>Water Breach</span>
                <span>30° Tilt</span>
                <span>90° Vertical</span>
                <span>Shatter</span>
              </div>
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
}
