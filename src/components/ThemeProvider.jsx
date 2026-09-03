"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export const VISUAL_THEMES = [
  { id: 'lime-ivory', name: 'Lime Ivory', color: '#9BE52C' },
  { id: 'verdant', name: 'Verdant', color: '#80B918' },
  { id: 'nordic-slate', name: 'Nordic Slate', color: '#60A5FA' },
  { id: 'jungle-nebula', name: 'Jungle Nebula', color: '#57C27A' },
  { id: 'ocean-dark', name: 'Ocean Dark', color: '#4F8CFF' },
  { id: 'terminal', name: 'Terminal (Night Shift)', color: '#22C55E' },
  { id: 'gen-z', name: 'Gen-Z Pink', color: '#FF007F' },
  { id: 'amber-forge', name: 'Amber Forge', color: '#F59E0B' },
  { id: 'cyber-violet', name: 'Cyber Violet', color: '#A855F7' },
  { id: 'obsidian-vercel', name: 'Obsidian Vercel', color: '#FFFFFF' },
  { id: 'electric-indigo', name: 'Electric Indigo', color: '#7C6CFF' },
];

export const APPEARANCE_MODES = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' }
];

// Dynamic 28-day theme rotation schedule (7 days each, repeating indefinitely in a loop)
// Phase 1 (Days 1–7):   Lime Ivory    ('lime-ivory')
// Phase 2 (Days 8–14):  Verdant       ('verdant')
// Phase 3 (Days 15–21): Nordic Slate  ('nordic-slate')
// Phase 4 (Days 22–28): Jungle Nebula ('jungle-nebula')
export function getScheduledDefaultTheme() {
  try {
    const START_EPOCH = new Date(2026, 8, 3, 0, 0, 0).getTime(); // 3 September 2026 (Month 8 is Sept)
    const now = Date.now();
    const diffDays = Math.floor((now - START_EPOCH) / (1000 * 60 * 60 * 24));
    const cycleDay = ((diffDays % 28) + 28) % 28;
    const phase = Math.floor(cycleDay / 7);

    const THEME_ROTATION = ['lime-ivory', 'verdant', 'nordic-slate', 'jungle-nebula'];
    return THEME_ROTATION[phase] || 'lime-ivory';
  } catch {
    return 'lime-ivory';
  }
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [visualTheme, setVisualThemeState] = useState(getScheduledDefaultTheme);
  const [mode, setModeState] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Read persisted choices or fallbacks
    const storedVisualTheme = localStorage.getItem('app-visual-theme');
    const storedMode = localStorage.getItem('app-mode');
    const legacyTheme = localStorage.getItem('theme'); // backward compatibility
    const hasActiveSchedule = localStorage.getItem('app-theme-rotation-active');

    // Check if current Bangladesh time (Asia/Dhaka) is in Night Shift window (11 PM - 2 AM: 23:00 - 02:59)
    const isBangladeshNightWindow = () => {
      try {
        const now = new Date();
        const bdHourStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: 'numeric',
          hour12: false
        }).format(now);
        const bdHour = parseInt(bdHourStr, 10);
        return bdHour === 23 || bdHour === 0 || bdHour === 1 || bdHour === 2;
      } catch {
        return false;
      }
    };

    const isNight = isBangladeshNightWindow();
    const scheduledDefault = getScheduledDefaultTheme();

    // 1. Visual Theme (Auto Terminal for Night Shift unless manually overridden)
    if (isNight && !sessionStorage.getItem('app-night-theme-overridden')) {
      setVisualThemeState('terminal');
    } else if (!hasActiveSchedule) {
      // First activation of 28-day schedule: default immediately to scheduled theme (Lime Ivory)
      localStorage.setItem('app-theme-rotation-active', 'true');
      localStorage.removeItem('app-visual-theme');
      setVisualThemeState(scheduledDefault);
    } else if (storedVisualTheme && VISUAL_THEMES.some(t => t.id === storedVisualTheme && t.id !== 'cyber-deck')) {
      setVisualThemeState(storedVisualTheme);
    } else {
      setVisualThemeState(scheduledDefault);
    }

    // 2. Appearance Mode - always default to dark on first visit
    if (storedMode) {
      setModeState(storedMode);
    } else if (legacyTheme) {
      setModeState(legacyTheme);
    } else {
      // First visit: always default to dark mode
      setModeState('dark');
    }

    // Listen for system theme changes if user hasn't explicitly set mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemChange = (e) => {
      if (!localStorage.getItem('app-mode')) {
        setModeState(e.matches ? 'light' : 'dark');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', visualTheme);
      document.documentElement.setAttribute('data-mode', mode);

      if (mode === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
    }
  }, [visualTheme, mode, mounted]);

  const setVisualTheme = (id) => {
    if (VISUAL_THEMES.some(t => t.id === id)) {
      setVisualThemeState(id);
      localStorage.setItem('app-visual-theme', id);
      sessionStorage.setItem('app-night-theme-overridden', 'true');
    }
  };

  const setMode = (modeId) => {
    setModeState(modeId);
    localStorage.setItem('app-mode', modeId);
    localStorage.setItem('theme', modeId); // legacy sync
  };

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        visualTheme, 
        setVisualTheme, 
        mode, 
        setMode, 
        theme: mode, 
        toggleTheme,
        VISUAL_THEMES,
        APPEARANCE_MODES
      }}
    >
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
