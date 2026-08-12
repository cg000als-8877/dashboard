"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export const VISUAL_THEMES = [
  { id: 'ocean-dark', name: 'Ocean Dark', color: '#4F8CFF' },
  { id: 'amber-forge', name: 'Amber Forge', color: '#F59E0B' },
  { id: 'cyber-violet', name: 'Cyber Violet', color: '#A855F7' },
  { id: 'neon-mint', name: 'Neon Mint', color: '#10B981' },
  { id: 'copper-steel', name: 'Copper Steel', color: '#EA580C' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: '#FF003C' },
];

export const APPEARANCE_MODES = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [visualTheme, setVisualThemeState] = useState('ocean-dark');
  const [mode, setModeState] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Read persisted choices or fallbacks
    const storedVisualTheme = localStorage.getItem('app-visual-theme');
    const storedMode = localStorage.getItem('app-mode');
    const legacyTheme = localStorage.getItem('theme'); // backward compatibility

    // 1. Visual Theme
    if (storedVisualTheme && VISUAL_THEMES.some(t => t.id === storedVisualTheme)) {
      setVisualThemeState(storedVisualTheme);
    } else {
      setVisualThemeState('ocean-dark');
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

  const setVisualTheme = (themeId) => {
    setVisualThemeState(themeId);
    localStorage.setItem('app-visual-theme', themeId);
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
