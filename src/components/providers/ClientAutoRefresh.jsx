"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Auto-refresh telemetry after 5 minutes of inactivity
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; 

export function ClientAutoRefresh() {
  const router = useRouter();
  const lastActiveTime = useRef(Date.now());
  const idleInterval = useRef(null);

  useEffect(() => {
    // Intercept client-side 401 responses and immediately redirect to /login
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const response = await originalFetch.apply(this, args);
      if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        const urlStr = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
        if (!urlStr.includes('/api/auth')) {
          window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    // Safe refresh: updates data without blowing away the client-side session or crashing offline
    const handleRefresh = () => {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return; // Do not reload while offline
      
      try {
        router.refresh();
      } catch (e) {
        // Fallback only if router fails
      }
    };

    // Update the last active timestamp whenever the user does something
    const resetIdleTimer = () => {
      lastActiveTime.current = Date.now();
    };

    // Check if the user has been idle for too long
    const checkIdleTime = () => {
      const now = Date.now();
      if (now - lastActiveTime.current >= IDLE_TIMEOUT_MS) {
        lastActiveTime.current = now;
        handleRefresh();
      }
    };

    // Listen to user activity
    const activityEvents = [
      'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'
    ];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Check idle time every 10 seconds
    idleInterval.current = setInterval(checkIdleTime, 10000);

    // Also check visibility change (tab switching / app resume)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastActiveTime.current >= IDLE_TIMEOUT_MS) {
          lastActiveTime.current = now;
          handleRefresh();
        }
      } else {
        resetIdleTimer();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (idleInterval.current) clearInterval(idleInterval.current);
    };
  }, []);

  // This component doesn't render anything visually
  return null;
}
