// =====================================================================
//  QMA Service Worker — offline-first
//  - App files (html/js/json/icons/Arabic text): precached at install
//  - Translations + other same-origin files: cached on first use
//    (or all at once from the in-app "Offline" panel)
//  - Google Fonts: cached at runtime
//  - Verse audio (everyayah.com): kept in its own cache, survives updates,
//    served with Range support so <audio> works offline
//  __VERSION__ is replaced by the commit SHA in the GitHub Action.
// =====================================================================
const VERSION = '__VERSION__';
const CORE    = `qma-core-${VERSION}`;
const RUNTIME = 'qma-runtime';   // fonts / other origins (shared with offline.js)
const AUDIO   = 'qma-audio';     // verse mp3s (shared with offline.js) — never auto-deleted

const SHELL = [
  './', 'index.html', 'app.js', 'offline-i18n.js', 'offline.js', 'wake.js', 'manifest.json', 'favicon.ico',
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

  if (url.hostname === 'everyayah.com') return event.respondWith(audioHandler(event, req));
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

// ---- audio ----
let corsWorks = true;
async function audioHandler(event, req) {
  const cache = await caches.open(AUDIO);
  const hit = await cache.match(req.url);                 // key = plain URL (ignores Range header)
  if (hit) return rangeFrom(req, hit);
  if (corsWorks) event.waitUntil(saveWhole(cache, req.url)); // keep a copy so it works offline next time
  try { return await fetch(req); }
  catch (_) { return new Response('Audio not saved for offline use', { status: 504 }); }
}
async function saveWhole(cache, url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) await cache.put(url, res);
  } catch (_) { corsWorks = false; }   // server sends no CORS headers: stop trying
}
async function rangeFrom(req, res) {
  const h = req.headers.get('range');
  if (!h) return res;
  const m = /bytes=(\d*)-(\d*)/.exec(h);
  if (!m) return res;
  const buf = await res.arrayBuffer(), len = buf.byteLength;
  let s, e;
  if (m[1] === '') { s = Math.max(0, len - Number(m[2])); e = len - 1; }
  else { s = Number(m[1]); e = m[2] ? Math.min(Number(m[2]), len - 1) : len - 1; }
  if (s >= len) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${len}` } });
  return new Response(buf.slice(s, e + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${s}-${e}/${len}`,
      'Content-Length': String(e - s + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
