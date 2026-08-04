"use client";

import { useEffect, useRef } from 'react';

// Auto-refresh after 10 minutes of inactivity
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; 

export function ClientAutoRefresh() {
  const lastActiveTime = useRef(Date.now());
  const idleInterval = useRef(null);

  useEffect(() => {
    // Function to handle hard refresh
    const handleRefresh = () => {
      window.location.reload();
    };

    // Update the last active timestamp whenever the user does something
    const resetIdleTimer = () => {
      lastActiveTime.current = Date.now();
    };

    // Check if the user has been idle for too long
    const checkIdleTime = () => {
      const now = Date.now();
      if (now - lastActiveTime.current >= IDLE_TIMEOUT_MS) {
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

    // Also check visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkIdleTime(); // If they come back after 10 mins, instantly refresh
      } else {
        resetIdleTimer(); // Reset the timer when they leave so it doesn't count active time
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
