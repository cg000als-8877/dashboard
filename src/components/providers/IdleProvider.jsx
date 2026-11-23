"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const IdleContext = createContext({
  isIdle: false,
  isBarsHidden: false,
  toggleBars: () => {},
  showBars: () => {},
  hideBars: () => {},
  resetIdle: () => {}
});

export function IdleProvider({ children }) {
  const [isBarsHidden, setIsBarsHidden] = useState(false);
  const pathname = usePathname();

  // Reset bars to visible whenever user navigates to a new page
  useEffect(() => {
    setIsBarsHidden(false);
  }, [pathname]);

  const toggleBars = useCallback(() => {
    setIsBarsHidden((prev) => !prev);
  }, []);

  const showBars = useCallback(() => {
    setIsBarsHidden(false);
  }, []);

  const hideBars = useCallback(() => {
    setIsBarsHidden(true);
  }, []);

  // Click anywhere on the screen to toggle bars (click once -> hides, click again -> appears)
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // 1. Ignore clicks inside the top bar header or bottom navigation bar
      if (e.target && e.target.closest && e.target.closest('header, nav, [data-no-bars-toggle]')) {
        return;
      }

      // 2. Toggle bars on click anywhere on the screen
      setIsBarsHidden((prev) => {
        // If bars are currently visible and click is on an interactive button/link/input, let the action run without hiding bars
        if (!prev && e.target && e.target.closest && e.target.closest('button, a, input, select, textarea, [role="button"]')) {
          return prev;
        }
        // Otherwise, toggle (if hidden -> show, if visible -> hide)
        return !prev;
      });
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  return (
    <IdleContext.Provider value={{
      isIdle: isBarsHidden,
      isBarsHidden,
      toggleBars,
      showBars,
      hideBars,
      resetIdle: showBars
    }}>
      {children}
    </IdleContext.Provider>
  );
}

export function useIdle() {
  return useContext(IdleContext);
}
