"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const IdleContext = createContext({
  isIdle: false,
  resetIdle: () => {},
  setIsIdle: () => {}
});

export function IdleProvider({ children }) {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef(null);
  const pathname = usePathname();

  const resetIdle = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 5000);
  }, []);

  // Reset idle state on route change
  useEffect(() => {
    resetIdle();
  }, [pathname, resetIdle]);

  // Global user activity tracking across mouse, touch, scroll, keyboard
  useEffect(() => {
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 5000);

    const handleUserActivity = () => {
      setIsIdle(false);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    };

    const events = [
      'mousedown', 'mousemove', 'pointerdown', 'pointermove', 
      'touchstart', 'touchmove', 'scroll', 'keydown', 'wheel', 'click'
    ];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true, capture: true });
      document.addEventListener(evt, handleUserActivity, { passive: true, capture: true });
    });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity, { capture: true });
        document.removeEventListener(evt, handleUserActivity, { capture: true });
      });
    };
  }, []);

  return (
    <IdleContext.Provider value={{ isIdle, resetIdle, setIsIdle }}>
      {children}
    </IdleContext.Provider>
  );
}

export function useIdle() {
  return useContext(IdleContext);
}
