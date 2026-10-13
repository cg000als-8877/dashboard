"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ZoomContext = createContext({
  zoom: 100,
  zoomIn: () => {},
  zoomOut: () => {},
  resetZoom: () => {},
  setZoom: () => {},
  mounted: false
});

const MIN_ZOOM = 70;
const MAX_ZOOM = 130;
const STEP = 5;

export function ZoomProvider({ children }) {
  const [zoom, setZoomState] = useState(100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('app_screen_zoom');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= MIN_ZOOM && parsed <= MAX_ZOOM) {
          setZoomState(parsed);
          document.documentElement.style.zoom = `${parsed}%`;
          document.documentElement.style.setProperty('--app-screen-zoom', `${parsed}%`);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const applyZoom = (newVal) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newVal));
    setZoomState(clamped);
    try {
      document.documentElement.style.zoom = `${clamped}%`;
      document.documentElement.style.setProperty('--app-screen-zoom', `${clamped}%`);
      localStorage.setItem('app_screen_zoom', clamped.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  const zoomIn = () => applyZoom(zoom + STEP);
  const zoomOut = () => applyZoom(zoom - STEP);
  const resetZoom = () => applyZoom(100);

  return (
    <ZoomContext.Provider value={{ zoom, zoomIn, zoomOut, resetZoom, setZoom: applyZoom, mounted }}>
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoom() {
  return useContext(ZoomContext);
}
