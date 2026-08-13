"use client";

import { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const themes = [
  { id: 'oceanic', label: 'Oceanic', color: '#4F8CFF' },
  { id: 'emerald', label: 'Emerald', color: '#34D399' },
  { id: 'rose', label: 'Rose', color: '#FB7185' },
];

export function ThemePicker() {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
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
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-4 w-52 animate-[fade-up_0.2s_ease-out_both]">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Color Theme</p>
          <div className="flex gap-3 justify-center mb-4">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setColorTheme(t.id)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                    colorTheme === t.id 
                      ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-card)] scale-110' 
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: t.color,
                    '--tw-ring-color': t.color
                  }}
                >
                  {colorTheme === t.id && <Check size={16} className="text-white drop-shadow-md" />}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${
                  colorTheme === t.id ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'
                }`}>{t.label}</span>
              </button>
            ))}
          </div>
          
          <div className="border-t border-[var(--color-border)] pt-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div className="flex items-center gap-2">
                {theme === 'dark' 
                  ? <Moon size={14} className="text-blue-400" /> 
                  : <Sun size={14} className="text-amber-400" />
                }
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${
                  theme === 'dark' ? 'bg-blue-500/30' : 'bg-amber-400/30'
                }`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
                    theme === 'dark' ? 'left-0.5 bg-blue-400' : 'left-[18px] bg-amber-400'
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
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border border-[var(--color-border)] ${
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
