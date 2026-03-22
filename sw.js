// =====================================================================
//  QMA Service Worker — sw.js
//  Strategy:
//   - App shell (HTML/CSS/JS/JSON assets): Cache-first, update in bg
//   - Translation JSON (assets/data/**):   Cache-first (large, stable)
//   - Audio (everyayah.com MP3s):          Cache-first after first fetch
//     → once a verse is played once, it works offline forever
// =====================================================================

const BASE        = '/qmapp';
const CACHE_APP   = 'qma-app-v1';
const CACHE_AUDIO = 'qma-audio-v1';

const APP_SHELL = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/app.js',
  BASE + '/manifest.json',
  BASE + '/assets/data/chapters.json',
  // lang files
  BASE + '/assets/lang/en.json',
  BASE + '/assets/lang/ar.json',
];

// Install — pre-cache app shell + chapters
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_APP)
      .then(cache => cache.addAll(APP_SHELL.map(url =>
        new Request(url, { mode: 'no-cors' })
      )))
      .then(() => self.skipWaiting())
  );
});

// Activate — remove stale caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_APP && k !== CACHE_AUDIO)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ---- Audio from everyayah.com: cache-first (offline replay) ----
  if (url.hostname === 'everyayah.com') {
    event.respondWith(
      caches.open(CACHE_AUDIO).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const res = await fetch(event.request);
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        } catch (_) {
          return new Response('Audio unavailable offline', { status: 503 });
        }
      })
    );
    return;
  }

  // ---- Translation / data JSON: cache-first, background update ----
  if (url.pathname.includes('/assets/data/') || url.pathname.includes('/assets/lang/')) {
    event.respondWith(
      caches.open(CACHE_APP).then(async cache => {
        const cached = await cache.match(event.request);
        // Serve from cache immediately, revalidate in background
        if (cached) {
          fetch(event.request).then(res => {
            if (res.ok) cache.put(event.request, res.clone());
          }).catch(() => {});
          return cached;
        }
        // First time — fetch and cache
        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      })
    );
    return;
  }

  // ---- Fonts from Google (cache-first, no-cors) ----
  if (url.hostname.includes('fonts.g')) {
    event.respondWith(
      caches.open(CACHE_APP).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const res = await fetch(event.request, { mode: 'no-cors' });
        cache.put(event.request, res.clone());
        return res;
      })
    );
    return;
  }

  // ---- App shell (HTML/CSS/JS): network-first for freshness ----
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok) {
          caches.open(CACHE_APP).then(c => c.put(event.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
