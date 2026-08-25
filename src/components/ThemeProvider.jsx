"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export const VISUAL_THEMES = [
  { id: 'lime-ivory', name: 'Lime Ivory', color: '#9BE52C' },
  { id: 'jungle-nebula', name: 'Jungle Nebula', color: '#57C27A' },
  { id: 'gen-z', name: 'Gen-Z Pink', color: '#FF007F' },
  { id: 'ocean-dark', name: 'Ocean Dark', color: '#4F8CFF' },
  { id: 'amber-forge', name: 'Amber Forge', color: '#F59E0B' },
  { id: 'cyber-violet', name: 'Cyber Violet', color: '#A855F7' },
  { id: 'copper-steel', name: 'Copper Steel', color: '#EA580C' },
  { id: 'cyber-deck', name: 'Cyber Deck', color: '#00FFA3' },
  { id: 'obsidian-vercel', name: 'Obsidian Vercel', color: '#FFFFFF' },
  { id: 'electric-indigo', name: 'Electric Indigo', color: '#7C6CFF' },
  { id: 'verdant', name: 'Verdant', color: '#80B918' },
];

export const APPEARANCE_MODES = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [visualTheme, setVisualThemeState] = useState('jungle-nebula');
  const [mode, setModeState] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Read persisted choices or fallbacks
    const storedVisualTheme = localStorage.getItem('app-visual-theme');
    const storedMode = localStorage.getItem('app-mode');
    const legacyTheme = localStorage.getItem('theme'); // backward compatibility

    // Check if current Bangladesh time (Asia/Dhaka) is between 11 PM and 2 AM (23:00 - 02:59)
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

    // 1. Visual Theme (auto Cyber Deck between 11 PM - 2 AM Bangladesh Time)
    if (isNight && !sessionStorage.getItem('app-night-theme-overridden')) {
      setVisualThemeState('cyber-deck');
    } else if (storedVisualTheme && VISUAL_THEMES.some(t => t.id === storedVisualTheme)) {
      setVisualThemeState(storedVisualTheme);
    } else {
      setVisualThemeState('jungle-nebula');
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
