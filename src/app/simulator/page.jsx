"use client";

import { useState } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Settings, Play, Anchor, AlertTriangle } from 'lucide-react';
import { NetworkLoader } from '@/components/ui/NetworkLoader';

export default function SimulatorPage() {
  const { stats, loading, error } = useKpiData();
  const [simMode, setSimMode] = useState('profit'); // 'profit', 'neutral', 'loss'
  const [simDay, setSimDay] = useState(1); // 1 to 31

  if (loading) {
    return <NetworkLoader title="Initializing Vessel Physics" subtitle="Calibrating Oceanic Hull Simulation & Water Dynamics..." />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both]">
      {/* SIMULATOR EXPLANATION */}
      <div className="bg-[rgba(255,255,255,0.02)] border border-[var(--color-border)] rounded-xl p-3 md:p-6 shadow-sm mb-4">
        <h3 className="text-sm md:text-xl font-medium text-[var(--color-text-main)] mb-2 md:mb-4">How the Ship Simulator Works:</h3>
        <ul className="space-y-1.5 md:space-y-3 text-[10px] md:text-sm text-[var(--color-text-secondary)]">
          <li><strong className="text-[var(--color-success)]">Profitable:</strong> When the company is making money, the ship moves forward "full steam ahead."</li>
          <li><strong className="text-[var(--color-warning)]">Breaking Even:</strong> When the company is neither making a profit nor taking a loss, the ship sits in neutral.</li>
          <li><strong className="text-[var(--color-danger)]">Losing Money:</strong> If the company starts losing money day by day, the ship begins to take on water. The situation grows more dramatic each day, culminating in the ship completely sinking by the end of the month.</li>
        </ul>
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

            <div className="flex flex-row flex-nowrap gap-1 md:gap-4 mb-2 md:mb-8 w-full justify-between">
              <button 
                onClick={() => setSimMode('profit')}
                className={`flex-1 flex justify-center items-center gap-1 px-1 py-2 md:px-5 md:py-3 rounded md:rounded-xl font-medium text-[10px] md:text-base whitespace-nowrap transition-all duration-300 ${simMode === 'profit' ? 'bg-[var(--color-success)] text-white [box-shadow:0_0_20px_var(--color-success-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <Play className="w-3 h-3 md:w-4 md:h-4" /> Profit Mode
              </button>
              
              <button 
                onClick={() => setSimMode('neutral')}
                className={`flex-1 flex justify-center items-center gap-1 px-1 py-2 md:px-5 md:py-3 rounded md:rounded-xl font-medium text-[10px] md:text-base whitespace-nowrap transition-all duration-300 ${simMode === 'neutral' ? 'bg-[var(--color-warning)] text-white [box-shadow:0_0_20px_var(--color-warning-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <Anchor className="w-3 h-3 md:w-4 md:h-4" /> Neutral Mode
              </button>
              
              <button 
                onClick={() => { setSimMode('loss'); setSimDay(1); }}
                className={`flex-1 flex justify-center items-center gap-1 px-1 py-2 md:px-5 md:py-3 rounded md:rounded-xl font-medium text-[10px] md:text-base whitespace-nowrap transition-all duration-300 ${simMode === 'loss' ? 'bg-[var(--color-danger)] text-white [box-shadow:0_0_20px_var(--color-danger-glow)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" /> Loss Mode
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

      {/* Hero Statistics (Mirrored from dashboard for layout consistency) */}
      <div className="mt-12">
        <h2 className="text-2xl font-medium tracking-tight mb-6">Live Dashboard Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard title="Total Cost" value={`BDT ${Math.round(stats.totalCost).toLocaleString()}`} color="warning" />
          <MetricCard title="Total Income" value={`BDT ${Math.round(stats.totalIncome).toLocaleString()}`} color="primary" />
          <MetricCard title="Net Profit/Loss" value={`${stats.netProfit > 0 ? '+' : ''}${Math.round(stats.netProfit).toLocaleString()}`} color={stats.netProfit >= 0 ? 'success' : 'danger'} />
          <MetricCard title="Working Days" value={`${stats.workingDays} Days`} />
          <MetricCard title="Production Lines" value={`${stats.activeLinesCount} Active`} />
          <MetricCard title="Avg Daily Profit/Loss" value={`${Math.round(stats.averageDailyProfit).toLocaleString()} / day`} color={stats.averageDailyProfit >= 0 ? 'success' : 'danger'} />
        </div>
      </div>
    </div>
  );
}
