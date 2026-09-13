"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export const VISUAL_THEMES = [
  { id: 'ember-tide', name: 'Ember Tide', color: '#F97316' },
  { id: 'nordic-slate', name: 'Nordic Slate', color: '#60A5FA' },
  { id: 'abstract', name: 'Abstract', color: '#ECEEF2' },
  { id: 'arcade-overdrive', name: 'Arcade Overdrive (Gaming)', color: '#00F0FF' },
  { id: 'verdant', name: 'Verdant', color: '#80B918' },
  { id: 'lime-ivory', name: 'Lime Ivory', color: '#9BE52C' },
  { id: 'jungle-nebula', name: 'Jungle Nebula', color: '#57C27A' },
  { id: 'ocean-dark', name: 'Ocean Dark', color: '#4F8CFF' },
  { id: 'terminal', name: 'Terminal (Night Shift)', color: '#22C55E' },
  { id: 'gen-z', name: 'Gen-Z Pink', color: '#FF007F' },
  { id: 'amber-forge', name: 'Amber Forge', color: '#F59E0B' },
  { id: 'cyber-violet', name: 'Cyber Violet', color: '#A855F7' },
  { id: 'obsidian-vercel', name: 'Obsidian Vercel', color: '#ECEEF2' },
  { id: 'electric-indigo', name: 'Electric Indigo', color: '#7C6CFF' },
];

export const APPEARANCE_MODES = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' }
];

export const BG_EFFECTS = [
  { id: 'aurora', name: 'Ambient Aurora', tag: 'Orbs', desc: 'Organic glowing orbs matching active theme' },
  { id: 'spotlight', name: 'Interactive Spotlight', tag: 'Spotlight', desc: 'Mouse-following radiant halo & ambient pulse' },
  { id: 'grain', name: 'Velvet Frosted Grain', tag: 'Velvet', desc: 'Deep multi-stop gradient with fine grain texture' },
  { id: 'solid', name: 'Minimal Solid', tag: 'Clean', desc: 'Classic clean solid background' },
];

// Ember Tide is the full-time default theme
export function getScheduledDefaultTheme() {
  return 'ember-tide';
}

export function getDefaultBgEffect() {
  return 'aurora';
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [visualTheme, setVisualThemeState] = useState('ember-tide');
  const [mode, setModeState] = useState('dark');
  const [bgEffect, setBgEffectState] = useState('aurora');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Force Ember Tide and Dark (Night) mode for all existing and new visitors
    const isEmberDefaultApplied = localStorage.getItem('app-ember-default-v2');

    if (!isEmberDefaultApplied) {
      localStorage.setItem('app-ember-default-v2', 'true');
      localStorage.setItem('app-visual-theme', 'ember-tide');
      localStorage.setItem('app-mode', 'dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('app-bg-effect', 'aurora');
      setVisualThemeState('ember-tide');
      setModeState('dark');
      setBgEffectState('aurora');
      return;
    }

    // Persisted preferences (if changed after default migration)
    const storedVisualTheme = localStorage.getItem('app-visual-theme');
    const storedMode = localStorage.getItem('app-mode');
    const storedBgEffect = localStorage.getItem('app-bg-effect');

    if (storedVisualTheme && VISUAL_THEMES.some(t => t.id === storedVisualTheme)) {
      setVisualThemeState(storedVisualTheme);
    } else {
      setVisualThemeState('ember-tide');
    }

    if (storedMode) {
      setModeState(storedMode);
    } else {
      setModeState('dark');
    }

    if (storedBgEffect && (BG_EFFECTS.some(b => b.id === storedBgEffect) || storedBgEffect === 'ember-tide-aurora')) {
      setBgEffectState(storedBgEffect === 'ember-tide-aurora' ? 'aurora' : storedBgEffect);
    } else {
      setBgEffectState('aurora');
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
      // Abstract theme activates Velvet Frosted Grain bg by default
      if (id === 'abstract') {
        setBgEffectState('grain');
        localStorage.setItem('app-bg-effect', 'grain');
      }
      // Ember Tide attaches its signature ember aurora by default
      if (id === 'ember-tide') {
        setBgEffectState('aurora');
        localStorage.setItem('app-bg-effect', 'aurora');
      }
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
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
