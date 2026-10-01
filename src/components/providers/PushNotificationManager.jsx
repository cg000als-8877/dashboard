"use client";

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function PushNotificationManager() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Only run on native Android/iOS devices
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    async function initPush() {
      try {
        // 1. Create Android Notification Channel
        if (Capacitor.getPlatform() === 'android') {
          await PushNotifications.createChannel({
            id: 'factory_updates_channel',
            name: 'Factory Production Updates',
            description: 'Instant alerts when new production day data is updated',
            importance: 5, // High importance (heads-up notification)
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#4F8CFF',
          }).catch((err) => console.warn('Channel creation skipped or failed:', err));
        }

        // 2. Check & Request Permissions
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.log('Push notification permission was not granted:', permStatus.receive);
          return;
        }

        // 3. Register with Apple / Google (FCM)
        await PushNotifications.register();

        // 4. Listeners
        // On successful registration, send FCM token to backend
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ', token.value);
          try {
            await fetch('/api/notify/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: token.value,
                platform: Capacitor.getPlatform(),
                deviceInfo: {
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString(),
                },
              }),
            });
          } catch (e) {
            console.error('Failed to save FCM token to backend:', e);
          }
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push notification registration error: ', error);
        });

        // When notification arrives while app is in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received in foreground: ', notification);
        });

        // When user taps on notification
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push notification clicked: ', action);
          const url = action.notification.data?.url;
          if (url && typeof window !== 'undefined') {
            window.location.href = url;
          }
        });

      } catch (err) {
        console.error('Push notification initialization error:', err);
      }
    }

    initPush();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners().catch(() => {});
      }
    };
  }, []);

  return null;
}
