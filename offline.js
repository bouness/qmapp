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
    background:var(--surface2);color:var(--text);font:600 13px 'Lato',sans-serif;cursor:pointer;text-align:start}
  #off-modal .off-btn:hover{border-color:var(--accent);color:var(--accent)}
  #off-modal .off-btn.danger:hover{border-color:#ef4444;color:#ef4444}
  #off-modal select{width:100%;margin:4px 0}
  #off-modal .off-note{font-size:12px;color:var(--text-muted);line-height:1.5;margin:4px 0}
  #off-bar{height:8px;border-radius:99px;background:var(--surface2);border:1px solid var(--border);overflow:hidden;margin-top:8px}
  #off-bar>div{height:100%;width:0;background:linear-gradient(90deg,var(--accent),var(--accent-dim));transition:width .2s}
  #off-status{font-size:12px;color:var(--text-dim);margin-top:6px;min-height:1.4em;white-space:pre-line}`;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'icon-btn'; btn.id = 'offline-btn';
  btn.textContent = '⬇️';
  const controls = document.querySelector('.header-controls');
  controls.insertBefore(btn, $('help-btn'));

  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'off-modal'; modal.setAttribute('role', 'dialog');
  modal.innerHTML = `<div class="modal">
    <div class="modal-title" data-i="off_title"></div>
    <div class="off-note" id="off-net"></div>
    <h4 data-i="h_text"></h4>
    <div class="off-note" data-i="note_text"></div>
    <button class="off-btn" id="off-text" data-i="btn_text"></button>
    <h4 data-i="h_audio"></h4>
    <div class="off-note" id="off-aud-info"></div>
    <select id="off-scope">
      <option value="range" data-i="scope_range"></option>
      <option value="surah" data-i="scope_surah"></option>
      <option value="all" data-i="scope_all"></option>
    </select>
    <button class="off-btn" id="off-audio" data-i="btn_audio"></button>
    <button class="off-btn danger" id="off-del-rec" data-i="del_rec"></button>
    <button class="off-btn danger" id="off-del-all" data-i="del_all"></button>
    <h4 data-i="loc_h"></h4>
    <div class="off-note" id="off-loc"></div>
    <button class="off-btn" id="off-choose" data-i="btn_choose"></button>
    <button class="off-btn" id="off-allow" data-i="btn_allow"></button>
    <button class="off-btn" id="off-migrate" data-i="btn_migrate"></button>
    <button class="off-btn danger" id="off-stop" data-i="btn_stop"></button>
    <div id="off-bar"><div></div></div>
    <div id="off-status"></div>
    <div class="off-note" data-i="note_auto"></div>
    <button class="modal-close" id="off-close" data-i="close"></button>
  </div>`;
  document.body.appendChild(modal);
  function applyLang() {
    modal.querySelectorAll('[data-i]').forEach(e => { e.textContent = qmaT(e.dataset.i); });
    btn.title = qmaT('off_btn'); btn.setAttribute('aria-label', qmaT('off_btn'));
    if (modal.classList.contains('open')) refreshInfo();
  }
  qmaOnLang(applyLang);

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
      net = qmaT('storage', { used: (usage / 1048576).toFixed(0), quota: (quota / 1048576).toFixed(0) }) + ' ';
    }
    net += qmaT(navigator.onLine ? 'online' : 'offline');
    $('off-net').textContent = net;

    const rec = $('reciter-select').value;
    const n = (await QMAAudio.list(rec)).size;
    $('off-aud-info').textContent = qmaT('reciter_info', { name: $('reciter-select').selectedOptions[0]?.text, n });

    const f = await QMAAudio.folderState();
    let loc;
    if (!f.supported) loc = qmaT('loc_nofolder');
    else if (f.connected && f.ready) loc = qmaT('loc_folder', { name: f.name });
    else if (f.connected) loc = qmaT('loc_lock', { name: f.name });
    else loc = qmaT('loc_browser');
    loc += '\n' + qmaT((await QMAAudio.persisted()) ? 'loc_persist_yes' : 'loc_persist_no');
    $('off-loc').textContent = loc;
    $('off-choose').style.display  = f.supported ? '' : 'none';
    $('off-allow').style.display   = f.connected && !f.ready ? '' : 'none';
    $('off-stop').style.display    = f.connected ? '' : 'none';
    $('off-migrate').style.display = f.connected && f.ready ? '' : 'none';
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
        (d, t, f) => { bar(d / (t + 1) ); status(qmaT('st_trans', { d, t }) + (f ? qmaT('st_failed', { f }) : '')); });

      status(qmaT('st_fonts'));
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
      status(failed ? qmaT('st_text_partial', { f: failed }) : qmaT('st_text_ok'));
    } catch (e) { status(qmaT('st_fail', { e })); }
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
    if (urls.length > 700 && !confirm(qmaT('confirm_big', { n: urls.length }))) return;
    busy = true;
    try {
      // Test first: the browser may only store audio if the server allows it (CORS)
      status(qmaT('st_check'));
      try { if (!(await QMAAudio.has(urls[0]))) await QMAAudio.download(urls[0]); }
      catch (e) {
        if (e && e.name === 'QuotaExceededError') throw e;
        status(e instanceof TypeError ? qmaT('st_cors') : qmaT('st_http', { s: e && e.message }));
        busy = false; return;
      }
      const failed = await pool(urls, async u => {
        if (await QMAAudio.has(u)) return;
        await QMAAudio.download(u);
      }, 4, (d, t, f) => { bar(d / t); status(qmaT('st_audio', { d, t }) + (f ? qmaT('st_failed', { f }) : '')); });
      status(failed ? qmaT('st_audio_partial', { f: failed }) : qmaT('st_audio_ok', { n: urls.length }));
    } catch (e) {
      status(e && e.name === 'QuotaExceededError' ? qmaT('st_quota') : qmaT('st_fail', { e }));
    }
    busy = false; refreshInfo();
  };

  $('off-del-rec').onclick = async () => {
    if (!confirm(qmaT('del_rec_confirm'))) return;
    const n = await QMAAudio.deleteReciter($('reciter-select').value);
    status(qmaT('st_deleted', { n })); refreshInfo();
  };
  $('off-del-all').onclick = async () => {
    if (!confirm(qmaT('confirm_del'))) return;
    await QMAAudio.deleteBrowserAudio(); status(qmaT('st_all_deleted')); refreshInfo();
  };

  // ---------- 3. storage location ----------
  $('off-choose').onclick = async () => {
    try { const name = await QMAAudio.chooseFolder(); status(qmaT('st_folder_set', { name })); }
    catch (e) { if (e && e.name !== 'AbortError') status(qmaT('st_fail', { e })); }
    refreshInfo();
  };
  $('off-allow').onclick = async () => {
    status((await QMAAudio.allowFolder()) ? qmaT('st_folder_set', { name: (await QMAAudio.folderState()).name }) : qmaT('st_folder_denied'));
    refreshInfo();
  };
  $('off-stop').onclick = async () => { await QMAAudio.forgetFolder(); status(qmaT('st_stopped')); refreshInfo(); };
  $('off-migrate').onclick = async () => {
    if (busy) return; busy = true;
    try {
      const n = await QMAAudio.migrateToFolder((d, t) => { bar(t ? d / t : 1); status(qmaT('st_audio', { d, t })); });
      status(qmaT('st_migrated', { n }));
    } catch (e) { status(qmaT('st_fail', { e })); }
    busy = false; refreshInfo();
  };
  applyLang();
})();
