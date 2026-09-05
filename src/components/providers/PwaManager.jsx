"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppUpdateModal } from '@/components/ui/AppUpdateModal';
import { InstallAppModal } from '@/components/ui/InstallAppModal';

const PwaContext = createContext({
  isInstallable: false,
  isIOS: false,
  isStandalone: false,
  promptInstall: () => {},
  checkForUpdates: () => {}
});

export function PwaManager({ children }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const waitingWorkerRef = useRef(null);

  useEffect(() => {
    // 1. Check if running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const isApp = checkStandalone();

    // 2. Detect iOS (Safari on iPhone / iPad / iPod)
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(isApple);
      return isApple;
    };

    const isAppleDevice = checkIOS();

    // 3. Register Service Worker & Listen for Updates
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for existing waiting worker
          if (registration.waiting) {
            waitingWorkerRef.current = registration.waiting;
            setShowUpdateModal(true);
          }

          // Listen for new worker updates found
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  waitingWorkerRef.current = newWorker;
                  setShowUpdateModal(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });

      // Reload window when new active service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Check if user is visiting from a mobile device (Android / iOS / Phone / Tablet)
    const isMobileDevice = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
      const isTouchAndSmall = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;
      return isMobileUA || isTouchAndSmall;
    };

    const isMobile = isMobileDevice();

    // 4. Handle Android/Chrome beforeinstallprompt event (Mobile only)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Offer install prompt ONLY on mobile devices if not dismissed recently
      const lastDismissed = localStorage.getItem('bapl_install_dismissed');
      const now = Date.now();
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

      if (isMobile && !isApp && (!lastDismissed || now - parseInt(lastDismissed, 10) > THREE_DAYS_MS)) {
        // Delay showing prompt slightly after launch/welcome screen
        setTimeout(() => {
          setShowInstallModal(true);
        }, 2200);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. For iOS users visiting on mobile browser, offer guided install prompt
    if (isMobile && isAppleDevice && !isApp) {
      const lastDismissed = localStorage.getItem('bapl_install_dismissed');
      const now = Date.now();
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

      if (!lastDismissed || now - parseInt(lastDismissed, 10) > THREE_DAYS_MS) {
        setTimeout(() => {
          setShowInstallModal(true);
        }, 2500);
      }
    }

    // 6. Check version via API periodically or on open
    const checkVersion = async () => {
      try {
        const res = await fetch('/api/version?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          const storedVersion = localStorage.getItem('bapl_app_version');
          if (storedVersion && storedVersion !== data.version) {
            setShowUpdateModal(true);
          }
          if (data.version) {
            localStorage.setItem('bapl_app_version', data.version);
          }
        }
      } catch (err) {
        // Ignore background version check errors
      }
    };

    checkVersion();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Execute App Update & Cache Purge
  const handleApplyUpdate = async () => {
    try {
      // 1. Send SKIP_WAITING to waiting service worker if present
      if (waitingWorkerRef.current) {
        waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
      }

      // 2. Clear all cached storage to replace old build
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 3. Clear session caches and update stored version
      sessionStorage.clear();
      
      // 4. Force reload from server
      setTimeout(() => {
        window.location.reload(true);
      }, 300);
    } catch (e) {
      console.error('Update purge error:', e);
      window.location.reload();
    }
  };

  // Trigger native install prompt
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallModal(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallModal(false);
    localStorage.setItem('bapl_install_dismissed', Date.now().toString());
  };

  const handleDismissUpdate = () => {
    setShowUpdateModal(false);
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable: !!deferredPrompt || isIOS,
        isIOS,
        isStandalone,
        promptInstall: () => setShowInstallModal(true),
        checkForUpdates: () => {}
      }}
    >
      {children}

      {/* App Update Ready Modal */}
      <AppUpdateModal
        isOpen={showUpdateModal}
        onUpdate={handleApplyUpdate}
        onDismiss={handleDismissUpdate}
      />

      {/* Android & iOS Install App Modal */}
      <InstallAppModal
        isOpen={showInstallModal && !showUpdateModal}
        isIOS={isIOS}
        onInstall={handleInstallClick}
        onDismiss={handleDismissInstall}
      />
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
