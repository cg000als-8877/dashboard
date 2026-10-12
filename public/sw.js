const CACHE_NAME = 'bapl-cache-v2.0.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin / extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API routes: Network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'Network temporarily offline', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Navigation requests (Page visits, refreshes, HTML documents)
  // Network-First with safe cache & offline fallback to prevent "This page couldn't load"
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network failed (e.g. offline, connection hiccup during refresh)
          const cached = await caches.match(request);
          if (cached) return cached;

          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          // Safe fallback HTML page rather than throwing an unhandled browser error
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Byzid Apparels — Connecting</title>
              <style>
                body { background: #0B0F19; color: #ECEEF2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
                .card { background: #131B2B; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px 24px; max-width: 360px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                h1 { font-size: 1.25rem; font-weight: 800; margin: 0 0 8px 0; color: #F0F7FF; }
                p { color: #94A3B8; font-size: 0.875rem; margin: 0 0 24px 0; line-height: 1.5; }
                button { background: #F97316; color: #FFFFFF; border: none; font-weight: 700; padding: 12px 28px; border-radius: 12px; font-size: 0.9rem; cursor: pointer; transition: transform 0.1s; }
                button:active { transform: scale(0.96); }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Connecting to Telemetry...</h1>
                <p>Connection was briefly interrupted during refresh. Tap below to reconnect.</p>
                <button onclick="window.location.reload()">Reconnect</button>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // 3. Static assets (_next/static, images, fonts): Cache-first with background revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
