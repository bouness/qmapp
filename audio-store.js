// =====================================================================
//  QMA — audio storage. Loaded BEFORE app.js. Exposes window.QMAAudio.
//
//  Where verse audio can live (checked in this order when playing):
//   1. A folder on this device chosen by the user (desktop Chrome/Edge/Brave/Opera):
//        <chosen folder>/QMAPP/<reciter>/<SSSAAA>.mp3   (real files you can see and copy)
//   2. Browser storage for this site (Cache API 'qma-audio') — every browser/phone.
//   3. Otherwise the app streams from everyayah.com and saves a copy in the background.
// =====================================================================
(() => {
  const CACHE = 'qma-audio';
  const MIN_BYTES = 1024;                       // anything smaller is a broken download
  const DB = 'qma-store', STORE = 'handles', KEY = 'audioDir';
  const FOLDER_NAME = 'QMAPP';
  const supported = typeof window.showDirectoryPicker === 'function';

  let dirHandle = null, loaded = false, corsBlocked = false;
  const inflight = new Set();

  // ---------- tiny IndexedDB helper (keeps the folder handle between visits) ----------
  const idb = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const idbOp = async (mode, fn) => {
    const db = await idb();
    return new Promise((res, rej) => {
      const q = fn(db.transaction(STORE, mode).objectStore(STORE));
      q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
    });
  };
  async function loadHandle() {
    if (loaded) return;
    loaded = true;
    try { dirHandle = (await idbOp('readonly', s => s.get(KEY))) || null; } catch (_) { dirHandle = null; }
  }
  async function folderReady() {
    await loadHandle();
    if (!dirHandle) return false;
    try { return (await dirHandle.queryPermission({ mode: 'readwrite' })) === 'granted'; } catch (_) { return false; }
  }

  // ---------- helpers ----------
  const relPath = url => { const m = /\/data\/(.+)$/.exec(url); return m ? m[1].split('/') : null; };
  const typed = b => (b.type === 'audio/mpeg' ? b : new Blob([b], { type: 'audio/mpeg' }));
  async function folderFile(url, create) {
    const seg = relPath(url);
    if (!seg) throw new Error('bad url');
    let d = dirHandle;
    for (const s of seg.slice(0, -1)) d = await d.getDirectoryHandle(s, { create });
    return d.getFileHandle(seg[seg.length - 1], { create });
  }

  // ---------- read / write one verse ----------
  async function get(url) {
    if (await folderReady()) {
      try {
        const f = await (await folderFile(url, false)).getFile();
        if (f.size >= MIN_BYTES) return typed(f);
      } catch (_) {}
    }
    try {
      const c = await caches.open(CACHE);
      const r = await c.match(url);
      if (r) {
        const b = await r.blob();
        if (b.size >= MIN_BYTES) return typed(b);
        await c.delete(url);                      // broken entry: drop it
      }
    } catch (_) {}
    return null;
  }

  async function has(url) {
    if (await folderReady()) {
      try { await folderFile(url, false); return true; } catch (_) {}
    }
    try { return !!(await (await caches.open(CACHE)).match(url)); } catch (_) { return false; }
  }

  async function put(url, blob, forceBrowser) {
    if (!forceBrowser && await folderReady()) {
      try {
        const w = await (await folderFile(url, true)).createWritable();
        await w.write(blob); await w.close();
        return 'folder';
      } catch (e) { if (e && e.name === 'QuotaExceededError') throw e; /* else fall back to browser storage */ }
    }
    const c = await caches.open(CACHE);
    await c.put(url, new Response(blob, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } }));
    return 'browser';
  }

  async function remove(url) {
    try { await (await caches.open(CACHE)).delete(url); } catch (_) {}
  }

  // download one verse from the network and store it (throws on any problem)
  async function download(url) {
    const res = await fetch(url, { mode: 'cors' });
    if (res.status !== 200) throw new Error(String(res.status));
    const blob = await res.blob();
    const cl = Number(res.headers.get('content-length')) || 0;
    if (blob.size < MIN_BYTES || (cl && blob.size < cl)) throw new Error('incomplete');
    return put(url, typed(blob));
  }

  // while playing from the network, keep a copy for next time
  async function saveInBackground(url) {
    if (corsBlocked || inflight.has(url)) return;
    inflight.add(url);
    try { await download(url); }
    catch (e) { if (e instanceof TypeError && navigator.onLine) corsBlocked = true; }  // no CORS headers: stop trying
    finally { inflight.delete(url); }
  }

  // ---------- listing / deleting ----------
  async function list(reciter) {
    const out = new Set();
    if (await folderReady()) {
      try {
        let d = dirHandle;
        for (const s of reciter.split('/')) d = await d.getDirectoryHandle(s);
        for await (const [name, h] of d.entries()) if (h.kind === 'file' && /^\d{6}\.mp3$/.test(name)) out.add(name);
      } catch (_) {}
    }
    try {
      const c = await caches.open(CACHE), base = `${AUDIO_BASE}${reciter}/`;
      (await c.keys()).forEach(r => { if (r.url.startsWith(base)) out.add(r.url.split('/').pop()); });
    } catch (_) {}
    return out;
  }

  async function deleteReciter(reciter) {
    let n = 0;
    try {
      const c = await caches.open(CACHE), base = `${AUDIO_BASE}${reciter}/`;
      for (const r of await c.keys()) if (r.url.startsWith(base) && await c.delete(r)) n++;
    } catch (_) {}
    if (await folderReady()) {                     // only our own NNNNNN.mp3 files, nothing else in the folder
      try {
        let d = dirHandle;
        for (const s of reciter.split('/')) d = await d.getDirectoryHandle(s);
        const names = [];
        for await (const [name, h] of d.entries()) if (h.kind === 'file' && /^\d{6}\.mp3$/.test(name)) names.push(name);
        for (const name of names) { await d.removeEntry(name); n++; }
      } catch (_) {}
    }
    return n;
  }
  const deleteBrowserAudio = () => caches.delete(CACHE);

  // ---------- folder management ----------
  async function folderState() {
    await loadHandle();
    if (!supported) return { supported: false, connected: false, ready: false, name: '' };
    return { supported: true, connected: !!dirHandle, ready: await folderReady(), name: dirHandle ? dirHandle.name : '' };
  }
  async function chooseFolder() {
    const picked = await window.showDirectoryPicker({ id: 'qma-audio', mode: 'readwrite', startIn: 'music' });
    // keep everything tidy inside a QMAPP subfolder
    const h = picked.name === FOLDER_NAME ? picked : await picked.getDirectoryHandle(FOLDER_NAME, { create: true });
    dirHandle = h; loaded = true;
    await idbOp('readwrite', s => s.put(h, KEY));
    return h.name;
  }
  async function allowFolder() {
    await loadHandle();
    return !!dirHandle && (await dirHandle.requestPermission({ mode: 'readwrite' })) === 'granted';
  }
  async function forgetFolder() {
    dirHandle = null; loaded = true;
    try { await idbOp('readwrite', s => s.delete(KEY)); } catch (_) {}
  }
  // move audio that is in browser storage into the folder
  async function migrateToFolder(onTick) {
    if (!(await folderReady())) return 0;
    const c = await caches.open(CACHE), keys = await c.keys();
    let n = 0;
    for (const r of keys) {
      try {
        const b = await (await c.match(r)).blob();
        if (b.size >= MIN_BYTES) { await put(r.url, typed(b)); await c.delete(r); n++; }
      } catch (_) {}
      if (onTick) onTick(n, keys.length);
    }
    return n;
  }
  async function persisted() {
    try { return navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false; } catch (_) { return false; }
  }

  window.QMAAudio = {
    get, has, put, remove, download, saveInBackground, list, deleteReciter, deleteBrowserAudio,
    folderState, chooseFolder, allowFolder, forgetFolder, migrateToFolder, persisted, FOLDER_NAME,
  };
})();
