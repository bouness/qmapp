// =====================================================================
//  QMA Service Worker — offline-first
//  - App files (html/js/json/icons/Arabic text): precached at install
//  - Translations + other same-origin files: cached on first use
//    (or all at once from the in-app "Offline" panel)
//  - Google Fonts: cached at runtime
//  - Verse audio (everyayah.com): stored in its own cache 'qma-audio' (survives updates),
//    played by app.js from memory when saved; the SW does not touch audio requests
//  __VERSION__ is replaced by the commit SHA in the GitHub Action.
// =====================================================================
const VERSION = '__VERSION__';
const CORE    = `qma-core-${VERSION}`;
const RUNTIME = 'qma-runtime';   // fonts / other origins (shared with offline.js)
const AUDIO   = 'qma-audio';     // verse mp3s (shared with offline.js) — never auto-deleted

const SHELL = [
  './', 'index.html', 'audio-store.js', 'app.js', 'offline-i18n.js', 'search.js', 'offline.js', 'wake.js', 'manifest.json', 'favicon.ico',
  'assets/data/chapters.json', 'assets/data/quran.json', 'assets/data/editions/en.json',
  'assets/lang/en.json', 'assets/lang/ar.json',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE);
    let list = [];
    try {
      const r = await fetch('precache-manifest.json', { cache: 'reload' });
      if (r.ok) list = (await r.json()).files || [];
    } catch (_) {}
    const all = [...new Set([...SHELL, ...list])];
    // allSettled: one failing file must not abort the install
    await Promise.allSettled(all.map(async u => {
      const res = await fetch(u, { cache: 'reload' });
      if (res.ok) await cache.put(new URL(u, self.registration.scope).href, res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if (k.startsWith('qma-core-') && k !== CORE) await caches.delete(k);
      if (k === 'qma-app-v1' || k === 'qma-audio-v1') await caches.delete(k); // old v1 caches
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'everyayah.com') return;   // audio is handled by app.js (blob playback), not the SW
  if (url.origin === self.location.origin) return event.respondWith(appHandler(event, req));
  if (url.protocol.startsWith('http')) return event.respondWith(runtimeHandler(req));
});

// ---- same-origin: cache first, refresh in background ----
async function appHandler(event, req) {
  const cache = await caches.open(CORE);
  let hit = await cache.match(req, { ignoreSearch: true });
  if (!hit && req.mode === 'navigate') hit = await cache.match(new URL('index.html', self.registration.scope).href);
  const refresh = fetch(req).then(async res => {
    if (res && res.ok) await cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  if (hit) { event.waitUntil(refresh); return hit; }
  return (await refresh) || new Response('Offline', { status: 503 });
}

// ---- fonts and other origins: cache first ----
async function runtimeHandler(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    // opaque responses are padded to ~7 MB each in the storage quota, so only keep readable ones
    if (res && res.ok) await cache.put(req, res.clone());
    return res;
  } catch (_) {
    return new Response('', { status: 504 });
  }
}
