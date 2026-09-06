"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const DensityContext = createContext({
  density: 'detailed',
  setDensity: () => {}
});

export function DensityProvider({ children }) {
  const [density, setDensityState] = useState('detailed');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('metric_density');
    if (stored && ['compact', 'normal', 'detailed'].includes(stored)) {
      setDensityState(stored);
    }
  }, []);

  const setDensity = (newDensity) => {
    if (['compact', 'normal', 'detailed'].includes(newDensity)) {
      setDensityState(newDensity);
      try {
        localStorage.setItem('metric_density', newDensity);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  };

  return (
    <DensityContext.Provider value={{ density, setDensity, mounted }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  return useContext(DensityContext);
}
