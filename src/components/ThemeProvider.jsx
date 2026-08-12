"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEMES = ['oceanic', 'emerald', 'rose'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [colorTheme, setColorThemeState] = useState('oceanic');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedMode = localStorage.getItem('theme');
    const storedColor = localStorage.getItem('colorTheme');

    const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

    if (storedMode) {
      setTheme(storedMode);
    } else {
      setTheme(getSystemTheme());
    }

    if (storedColor && THEMES.includes(storedColor)) {
      setColorThemeState(storedColor);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = document.documentElement;
    
    // Mode: light or dark
    if (theme === 'light') {
      el.classList.add('light-mode');
    } else {
      el.classList.remove('light-mode');
    }

    // Color theme: remove all, then add current
    THEMES.forEach(t => el.classList.remove(`theme-${t}`));
    if (colorTheme !== 'oceanic') {
      el.classList.add(`theme-${colorTheme}`);
    }
  }, [theme, colorTheme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const setColorTheme = (name) => {
    if (THEMES.includes(name)) {
      setColorThemeState(name);
      localStorage.setItem('colorTheme', name);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorTheme, setColorTheme }}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
