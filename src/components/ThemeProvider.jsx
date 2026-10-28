"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export const VISUAL_THEMES = [
  { id: 'nordic-slate', name: 'Nordic Slate', color: '#60A5FA' },
  { id: 'ember-tide', name: 'Ember Tide', color: '#F97316' },
  { id: 'abstract', name: 'Abstract', color: '#ECEEF2' },
  { id: 'arcade-overdrive', name: 'Arcade Overdrive (Gaming)', color: '#00F0FF' },
  { id: 'verdant', name: 'Verdant', color: '#80B918' },
  { id: 'lime-ivory', name: 'Lime Ivory', color: '#9BE52C' },
  { id: 'jungle-nebula', name: 'Jungle Nebula', color: '#57C27A' },
  { id: 'ocean-dark', name: 'Ocean Dark', color: '#4F8CFF' },
  { id: 'terminal', name: 'Terminal (Night Shift)', color: '#22C55E' },
  { id: 'gen-z', name: 'Gen-Z Pink', color: '#FF007F' },
];

export const APPEARANCE_MODES = [
  { id: 'light', name: 'Light (Day)' },
  { id: 'dark', name: 'Dark (Night)' }
];

export const BG_EFFECTS = [
  { id: 'grain', name: 'Grain', tag: 'Grain', desc: 'Velvet frosted texture' },
  { id: 'bokeh', name: 'Bokeh', tag: 'Bokeh', desc: 'Floating orbital light spheres' },
  { id: 'aurora', name: 'Aurora', tag: 'Aurora', desc: 'Organic ambient glowing orbs' },
  { id: 'spotlight', name: 'Spotlight', tag: 'Light', desc: 'Cursor radiant halo glow' },
  { id: 'grid', name: 'Grid', tag: 'Grid', desc: 'Precision blueprint grid' },
  { id: 'honeycomb', name: 'Honeycomb', tag: 'Hex', desc: 'Hexagonal matrix mesh' },
  { id: 'textile', name: 'Textile', tag: 'Weave', desc: 'Woven fabric warp & weft' },
  { id: 'topography', name: 'Topography', tag: 'Contour', desc: 'Elevation contour lines' },
  { id: 'dots', name: 'Dot Matrix', tag: 'Dots', desc: 'Telemetry dots & radar pulse' },
  { id: 'silk', name: 'Silk Waves', tag: 'Silk', desc: 'Flowing satin fabric drape' },
  { id: 'rays', name: 'Light Rays', tag: 'Rays', desc: 'Volumetric sunbeam caustics' },
  { id: 'starlight', name: 'Starlight', tag: 'Stars', desc: 'Subtle micro constellation' },
  { id: 'solid', name: 'Solid', tag: 'Solid', desc: 'Clean minimal background' },
];

// Ember Tide is the full-time default theme
export function getScheduledDefaultTheme() {
  return 'nordic-slate';
}

export function getDefaultBgEffect() {
  return 'grain';
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [visualTheme, setVisualThemeState] = useState('nordic-slate');
  const [mode, setModeState] = useState('dark');
  const [bgEffect, setBgEffectState] = useState('grain');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Apply Nordic Slate + Dark Mode + Grain Background as default for any device
    const isDefaultApplied = localStorage.getItem('app-nordic-grain-dark-v1');

    if (!isDefaultApplied) {
      localStorage.setItem('app-nordic-grain-dark-v1', 'true');
      localStorage.setItem('app-visual-theme', 'nordic-slate');
      localStorage.setItem('app-mode', 'dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('app-bg-effect', 'grain');
      setVisualThemeState('nordic-slate');
      setModeState('dark');
      setBgEffectState('grain');
      return;
    }

    // Persisted preferences (if user explicitly chooses something else later)
    const storedVisualTheme = localStorage.getItem('app-visual-theme');
    const storedMode = localStorage.getItem('app-mode');
    const storedBgEffect = localStorage.getItem('app-bg-effect');

    if (storedVisualTheme && VISUAL_THEMES.some(t => t.id === storedVisualTheme)) {
      setVisualThemeState(storedVisualTheme);
    } else {
      setVisualThemeState('nordic-slate');
    }

    if (storedMode) {
      setModeState(storedMode);
    } else {
      setModeState('dark');
    }

    if (storedBgEffect && BG_EFFECTS.some(b => b.id === storedBgEffect)) {
      setBgEffectState(storedBgEffect);
    } else {
      setBgEffectState('grain');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', visualTheme);
      document.documentElement.setAttribute('data-mode', mode);
      document.documentElement.setAttribute('data-bg-effect', bgEffect);

      if (mode === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
    }
  }, [visualTheme, mode, bgEffect, mounted]);

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

  const setBgEffect = (bgId) => {
    if (BG_EFFECTS.some(b => b.id === bgId)) {
      setBgEffectState(bgId);
      localStorage.setItem('app-bg-effect', bgId);
    }
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
        bgEffect,
        setBgEffect,
        BG_EFFECTS,
        VISUAL_THEMES,
        APPEARANCE_MODES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
