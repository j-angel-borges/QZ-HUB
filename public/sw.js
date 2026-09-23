// ==============================================================================
// QZ-HUB SERVICE WORKER — v3.3.15 (4K STOCK-CONDITIONED PORTADAS: ZERO HALLUCINATIONS / OFFICIAL ADN)
// ==============================================================================
const CACHE_NAME = 'qz-hub-v3.3.15-stock-conditioned-portadas-4k';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/assets/quarz/QUARZ_3D_Cuarzo_Vertical_QZ-removebg-preview.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Purging outdated service worker cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Only cache same-origin static assets; NEVER cache Firestore/Google APIs)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CRITICAL: Bypass Service Worker for all external APIs (Firestore, Google, Vertex, etc.)
  // and all dynamic /api/ endpoints to prevent stale data sync locks
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
