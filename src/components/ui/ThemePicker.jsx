"use client";

import { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Check, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/components/layout/Sidebar';

const quickThemes = [
  { id: 'nordic-slate', label: 'Nordic', color: '#60A5FA' },
  { id: 'ocean-dark', label: 'Ocean', color: '#4F8CFF' },
  { id: 'jungle-nebula', label: 'Jungle', color: '#57C27A' },
  { id: 'terminal', label: 'Terminal', color: '#22C55E' },
];

export function ThemePicker() {
  const { visualTheme, setVisualTheme, mode, toggleTheme, bgEffect, setBgEffect, BG_EFFECTS } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {/* Popup */}
      {open && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-3.5 w-64 animate-[fade-up_0.2s_ease-out_both]">
          {/* Quick Palettes */}
          <div className="mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2">Color Palette</p>
            <div className="flex gap-2 justify-center">
              {quickThemes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setVisualTheme(t.id)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                  title={t.label}
                >
                  <div
                    className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${
                      visualTheme === t.id 
                        ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-card)] scale-110' 
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ 
                      backgroundColor: t.color,
                      '--tw-ring-color': t.color
                    }}
                  >
                    {visualTheme === t.id && <Check size={14} className="text-[#04101A] drop-shadow-md stroke-[3]" />}
                  </div>
                  <span className={`text-[7.5px] font-bold uppercase tracking-wider ${
                    visualTheme === t.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                  }`}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background FX Switcher */}
          <div className="border-t border-[var(--color-border)]/60 pt-2.5 mb-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Background Style</span>
              <span className="text-[8px] font-extrabold text-[var(--color-primary)] uppercase">{bgEffect}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {BG_EFFECTS.map(b => {
                const isSelected = bgEffect === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setBgEffect(b.id)}
                    className={cn(
                      "py-1 px-1 rounded-md text-[8px] font-bold uppercase tracking-wider text-center transition-all cursor-pointer border",
                      isSelected
                        ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/50 shadow-xs"
                        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]/60 hover:text-[var(--color-text-main)] hover:border-[var(--color-primary)]/30"
                    )}
                  >
                    {b.tag}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Light / Dark Mode Toggle */}
          <div className="border-t border-[var(--color-border)]/60 pt-2.5">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div className="flex items-center gap-2">
                {mode === 'dark' 
                  ? <Moon size={13} className="text-blue-400" /> 
                  : <Sun size={13} className="text-amber-400" />
                }
                <div className={`w-7 h-3.5 rounded-full relative transition-colors duration-200 ${
                  mode === 'dark' ? 'bg-blue-500/30' : 'bg-amber-400/30'
                }`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    mode === 'dark' ? 'left-0.5 bg-blue-400' : 'left-[14px] bg-amber-400'
                  }`} />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border border-[var(--color-border)] cursor-pointer ${
          open 
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] rotate-45 scale-110' 
            : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:scale-110'
        }`}
        style={open ? { boxShadow: `0 0 20px var(--color-primary-glow)` } : {}}
      >
        <Palette size={18} />
      </button>
    </div>
  );
}
