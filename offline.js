// =====================================================================
//  QMA — Offline panel (loaded after app.js; uses its globals:
//  RECITERS, TRANSLATIONS, ARABIC_FONTS, UI_FONTS, DATA_BASE, AUDIO_BASE, state)
// =====================================================================
(() => {
  const RUNTIME = 'qma-runtime', AUDIO = 'qma-audio';
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(3, '0');

  // ---------- UI ----------
  const style = document.createElement('style');
  style.textContent = `
  #off-modal .modal{max-height:90vh;overflow:auto}
  #off-modal h4{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--accent);margin:16px 0 6px}
  #off-modal .off-btn{width:100%;margin:4px 0;padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);
    background:var(--surface2);color:var(--text);font:600 13px 'Lato',sans-serif;cursor:pointer;text-align:left}
  #off-modal .off-btn:hover{border-color:var(--accent);color:var(--accent)}
  #off-modal .off-btn.danger:hover{border-color:#ef4444;color:#ef4444}
  #off-modal select{width:100%;margin:4px 0}
  #off-modal .off-note{font-size:12px;color:var(--text-muted);line-height:1.5;margin:4px 0}
  #off-bar{height:8px;border-radius:99px;background:var(--surface2);border:1px solid var(--border);overflow:hidden;margin-top:8px}
  #off-bar>div{height:100%;width:0;background:linear-gradient(90deg,var(--accent),var(--accent-dim));transition:width .2s}
  #off-status{font-size:12px;color:var(--text-dim);margin-top:6px;min-height:1.4em;white-space:pre-line}`;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'icon-btn'; btn.id = 'offline-btn'; btn.title = 'Offline downloads'; btn.setAttribute('aria-label', 'Offline downloads');
  btn.textContent = '⬇️';
  const controls = document.querySelector('.header-controls');
  controls.insertBefore(btn, $('help-btn'));

  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'off-modal'; modal.setAttribute('role', 'dialog');
  modal.innerHTML = `<div class="modal">
    <div class="modal-title">⬇️ Offline use</div>
    <div class="off-note" id="off-net"></div>
    <h4>1 · App, Arabic text &amp; translations</h4>
    <div class="off-note">The app and Arabic text are saved automatically. Save every translation and the fonts too:</div>
    <button class="off-btn" id="off-text">Download all translations + fonts (~16 MB)</button>
    <h4>2 · Audio</h4>
    <div class="off-note" id="off-aud-info"></div>
    <select id="off-scope">
      <option value="range">Current verse range</option>
      <option value="surah">Whole current chapter</option>
      <option value="all">All 114 chapters (large)</option>
    </select>
    <button class="off-btn" id="off-audio">Download audio for selected reciter</button>
    <button class="off-btn danger" id="off-del-rec">Delete audio of this reciter</button>
    <button class="off-btn danger" id="off-del-all">Delete ALL downloaded audio</button>
    <div id="off-bar"><div></div></div>
    <div id="off-status"></div>
    <div class="off-note">Audio you play while online is also saved automatically for next time.</div>
    <button class="modal-close" id="off-close">Close</button>
  </div>`;
  document.body.appendChild(modal);

  const status = t => ($('off-status').textContent = t);
  const bar = f => ($('off-bar').firstElementChild.style.width = Math.round(f * 100) + '%');
  const close = () => modal.classList.remove('open');
  $('off-close').onclick = close;
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  let busy = false;

  btn.onclick = async () => {
    modal.classList.add('open');
    if (navigator.storage?.persist) navigator.storage.persist();   // ask browser not to evict our data
    refreshInfo();
  };

  async function refreshInfo() {
    let net = '';
    if (navigator.storage?.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      net = `Storage used: ${(usage / 1048576).toFixed(0)} MB of ${(quota / 1048576).toFixed(0)} MB. `;
    }
    net += navigator.onLine ? 'You are online.' : 'You are offline.';
    $('off-net').textContent = net;
    const rec = $('reciter-select').value;
    const cache = await caches.open(AUDIO);
    const n = (await cache.keys()).filter(r => r.url.startsWith(AUDIO_BASE + rec + '/')).length;
    $('off-aud-info').textContent = `Reciter: ${$('reciter-select').selectedOptions[0]?.text}\nVerses saved for this reciter: ${n}`;
  }

  // ---------- helpers ----------
  async function pool(items, worker, size, tick) {
    let i = 0, done = 0, failed = 0;
    await Promise.all(Array.from({ length: size }, async () => {
      while (i < items.length) {
        const it = items[i++];
        try { await worker(it); } catch (_) { try { await worker(it); } catch (__) { failed++; } }
        tick(++done, items.length, failed);
      }
    }));
    return failed;
  }

  // ---------- 1. translations + fonts ----------
  $('off-text').onclick = async () => {
    if (busy) return; busy = true;
    try {
      const files = TRANSLATIONS.map(t => DATA_BASE + t.file);          // goes through the SW → cached
      let failed = await pool(files, async u => { const r = await fetch(u); if (!r.ok) throw 0; await r.arrayBuffer(); }, 3,
        (d, t, f) => { bar(d / (t + 1) ); status(`Translations ${d}/${t}${f ? ` (${f} failed)` : ''}`); });

      status('Fonts…');
      const rt = await caches.open(RUNTIME);
      const cssUrls = new Set([...document.querySelectorAll('link[rel=stylesheet][href*="fonts.googleapis"]')].map(l => l.href));
      [...ARABIC_FONTS, ...UI_FONTS].filter(f => !/Noto\+Sans\+SC/.test(f.google))
        .forEach(f => cssUrls.add(`https://fonts.googleapis.com/css2?family=${f.google}&display=swap`));
      for (const u of cssUrls) {
        try {
          const r = await fetch(u, { mode: 'cors' }); if (!r.ok) continue;
          const css = await r.clone().text();
          await rt.put(u, r);
          for (const m of css.matchAll(/url\((https:[^)]+)\)/g)) {
            if (await rt.match(m[1])) continue;
            const fr = await fetch(m[1], { mode: 'cors' }); if (fr.ok) await rt.put(m[1], fr);
          }
        } catch (_) { failed++; }
      }
      bar(1);
      status(failed ? `Done, but ${failed} item(s) failed. Press again to retry.` : 'Translations and fonts saved ✓');
    } catch (e) { status('Download failed: ' + e); }
    busy = false; refreshInfo();
  };

  // ---------- 2. audio ----------
  function buildList() {
    const rec = $('reciter-select').value;
    const scope = $('off-scope').value;
    const cur = Number($('chapter-select').value);
    const total = c => state.chapters.find(x => x.id === c)?.total_verses || 0;
    const items = [];
    const add = (s, a) => items.push(`${AUDIO_BASE}${rec}/${pad(s)}${pad(a)}.mp3`);
    if (scope === 'range') {
      const a0 = Number($('start-verse').value) || 1, a1 = Number($('end-verse').value) || total(cur);
      for (let a = a0; a <= a1; a++) add(cur, a);
    } else if (scope === 'surah') {
      for (let a = 1; a <= total(cur); a++) add(cur, a);
    } else {
      state.chapters.forEach(c => { for (let a = 1; a <= c.total_verses; a++) add(c.id, a); });
    }
    return items;
  }

  $('off-audio').onclick = async () => {
    if (busy) return;
    const urls = buildList();
    if (urls.length > 700 && !confirm(`${urls.length} verse files will be downloaded. This can be several hundred MB. Continue?`)) return;
    busy = true;
    try {
      const cache = await caches.open(AUDIO);
      // Test first: the browser may only store audio if the server allows it (CORS)
      status('Checking server…');
      let probe;
      try { probe = await fetch(urls[0], { mode: 'cors' }); }
      catch (_) { status('✗ everyayah.com does not allow web pages to download its audio (no CORS headers), so it cannot be saved for offline use from this site.'); busy = false; return; }
      if (!probe.ok) { status(`✗ Server answered ${probe.status} for this reciter/verse.`); busy = false; return; }
      if (!(await cache.match(urls[0]))) await cache.put(urls[0], probe);

      const failed = await pool(urls, async u => {
        if (await cache.match(u)) return;
        const r = await fetch(u, { mode: 'cors' });
        if (!r.ok) throw new Error(r.status);
        await cache.put(u, r);
      }, 4, (d, t, f) => { bar(d / t); status(`Audio ${d}/${t}${f ? ` (${f} failed)` : ''}`); });
      status(failed ? `Finished — ${failed} file(s) failed. Press again to retry.` : `Saved ${urls.length} verses ✓ — works offline now`);
    } catch (e) {
      status(e && e.name === 'QuotaExceededError' ? '✗ Storage is full. Free some space and try again.' : 'Download failed: ' + e);
    }
    busy = false; refreshInfo();
  };

  $('off-del-rec').onclick = async () => {
    const rec = $('reciter-select').value, cache = await caches.open(AUDIO);
    const keys = (await cache.keys()).filter(r => r.url.startsWith(AUDIO_BASE + rec + '/'));
    await Promise.all(keys.map(k => cache.delete(k)));
    status(`Deleted ${keys.length} verses`); refreshInfo();
  };
  $('off-del-all').onclick = async () => {
    if (!confirm('Delete all downloaded audio?')) return;
    await caches.delete(AUDIO); status('All audio deleted'); refreshInfo();
  };
})();
