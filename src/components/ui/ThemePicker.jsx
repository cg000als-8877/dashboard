"use client";

import { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const quickThemes = [
  { id: 'nordic-slate', label: 'Nordic', color: '#60A5FA' },
  { id: 'ocean-dark', label: 'Ocean', color: '#4F8CFF' },
  { id: 'jungle-nebula', label: 'Jungle', color: '#57C27A' },
  { id: 'cyber-deck', label: 'Cyber', color: '#00FFA3' },
];

export function ThemePicker() {
  const { visualTheme, setVisualTheme, mode, toggleTheme } = useTheme();
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
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-4 w-60 animate-[fade-up_0.2s_ease-out_both]">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Color Theme</p>
          <div className="flex gap-2.5 justify-center mb-4">
            {quickThemes.map(t => (
              <button
                key={t.id}
                onClick={() => setVisualTheme(t.id)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center ${
                    visualTheme === t.id 
                      ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-card)] scale-110' 
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: t.color,
                    '--tw-ring-color': t.color
                  }}
                >
                  {visualTheme === t.id && <Check size={15} className="text-[#04101A] drop-shadow-md stroke-[3]" />}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${
                  visualTheme === t.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>{t.label}</span>
              </button>
            ))}
          </div>
          
          <div className="border-t border-[var(--color-border)] pt-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div className="flex items-center gap-2">
                {mode === 'dark' 
                  ? <Moon size={14} className="text-blue-400" /> 
                  : <Sun size={14} className="text-amber-400" />
                }
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${
                  mode === 'dark' ? 'bg-blue-500/30' : 'bg-amber-400/30'
                }`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
                    mode === 'dark' ? 'left-0.5 bg-blue-400' : 'left-[18px] bg-amber-400'
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
