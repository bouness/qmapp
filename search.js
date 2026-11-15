// =====================================================================
//  QMA — Search. Type Arabic, a translation, a surah name or a reference
//  (2:255, 18:1-10) and get surah + verse numbers. Works offline.
//  Uses globals from app.js: TRANSLATIONS, DATA_BASE, state, startPlayback, stopPlayback.
// =====================================================================
(() => {
  const $ = id => document.getElementById(id);
  const PAGE = 50;

  // ---------- normalisation (diacritics, alef/hamza variants, case) ----------
  const STRIP = /[\u0300-\u036F\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/;
  function norm(text, wantMap) {
    let s = '', map = wantMap ? [] : null, i = 0;
    for (const ch of text) {
      const idx = i; i += ch.length;
      for (const d of ch.toLowerCase().normalize('NFD')) {
        if (STRIP.test(d) || d === '\u0640' || d === '\u0627' || d === '\u0671') continue; // marks, tatweel, alef
        const x = d === '\u0649' ? '\u064A' : d === '\u0629' ? '\u0647' : d === '\u0131' ? 'i' : (d === '’' || d === '‘') ? "'" : d;
        s += x;
        if (map) for (let k = 0; k < x.length; k++) map.push(idx);
      }
    }
    return wantMap ? { s, map } : s;
  }
  const digits = t => t.replace(/[\u0660-\u0669]/g, c => c.charCodeAt(0) - 0x660).replace(/[\u06F0-\u06F9]/g, c => c.charCodeAt(0) - 0x6F0);
  const esc = t => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- data ----------
  const index = {};      // code -> [{c, v, t, n}]
  const loading = {};
  async function load(code) {
    if (index[code]) return index[code];
    if (loading[code]) return loading[code];
    const tr = TRANSLATIONS.find(x => x.code === code);
    loading[code] = (async () => {
      const r = await fetch(DATA_BASE + tr.file);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      return (index[code] = (j.verses || []).map(v => ({ c: v.chapter, v: v.verse, t: v.text, n: norm(v.text) })));
    })();
    try { return await loading[code]; } finally { delete loading[code]; }
  }
  const arLookup = {};
  async function arabicText(c, v) {
    const ar = await load('ar');
    if (!arLookup.built) { ar.forEach(r => (arLookup[r.c + '_' + r.v] = r.t)); arLookup.built = true; }
    return arLookup[c + '_' + v] || '';
  }

  function pickCode(q, chosen) {
    if (chosen !== 'auto') return chosen;
    if (/[\u0600-\u06FF]/.test(q)) return 'ar';
    if (/[\u0400-\u04FF]/.test(q)) return 'ru';
    if (/[\u0980-\u09FF]/.test(q)) return 'bn';
    if (/[\u4E00-\u9FFF]/.test(q)) return 'zh';
    const cur = $('lang-select').value;
    return ['ar', 'ru', 'bn', 'zh', 'ur'].includes(cur) ? 'en' : cur;
  }

  // ---------- highlight ----------
  function highlight(text, tokens) {
    const { s, map } = norm(text, true);
    const spans = [];
    for (const tk of tokens) {
      let p = 0;
      while ((p = s.indexOf(tk, p)) !== -1) { spans.push([map[p], map[p + tk.length - 1]]); p += tk.length; }
    }
    if (!spans.length) return esc(text);
    spans.sort((a, b) => a[0] - b[0]);
    let out = '', pos = 0;
    const merged = [];
    for (const sp of spans) {
      const last = merged[merged.length - 1];
      if (last && sp[0] <= last[1] + 1) last[1] = Math.max(last[1], sp[1]); else merged.push([...sp]);
    }
    for (const [a, b0] of merged) {
      let b = b0 + 1;
      while (b < text.length && STRIP.test(text[b].normalize('NFD')[0] || '')) b++; // keep trailing diacritics
      out += esc(text.slice(pos, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>';
      pos = b;
    }
    return out + esc(text.slice(pos));
  }

  // ---------- UI ----------
  const css = document.createElement('style');
  css.textContent = `
  #srch-modal .modal{max-width:640px;max-height:90vh;overflow:auto;padding:20px}
  #srch-head{position:sticky;top:-20px;background:var(--surface);padding:4px 0 10px;z-index:2}
  #srch-input{width:100%;font-size:16px;padding:12px 14px}
  #srch-opts{display:flex;gap:8px;margin-top:8px}#srch-opts select{flex:1}
  .srch-note{font-size:12px;color:var(--text-muted);margin:8px 0}
  .srch-h{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--accent);margin:12px 0 6px}
  .srch-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin:8px 0}
  .srch-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
  .srch-ref{font-weight:700;font-size:13px;color:var(--accent);background:var(--surface);border:1px solid var(--accent);border-radius:99px;padding:2px 10px;direction:ltr}
  .srch-line{font-size:12px;color:var(--text-dim);flex:1;min-width:120px}
  .srch-btn{background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px 10px;font:600 12px 'Lato',sans-serif;cursor:pointer}
  .srch-btn:hover{border-color:var(--accent);color:var(--accent)}
  .srch-ar{font-size:20px;line-height:1.9;direction:rtl;text-align:right}
  .srch-tr{font-size:14px;line-height:1.6;color:var(--text);margin-top:4px}
  .srch-card mark{background:rgba(45,212,191,.35);color:inherit;border-radius:3px;padding:0 1px}
  #srch-more{width:100%;margin:8px 0}`;
  document.head.appendChild(css);

  const btn = document.createElement('button');
  btn.className = 'icon-btn'; btn.id = 'search-btn'; btn.textContent = '🔍';
  document.querySelector('.header-controls').insertBefore(btn, document.querySelector('.header-controls').firstChild);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'srch-modal'; modal.setAttribute('role', 'dialog');
  modal.innerHTML = `<div class="modal">
    <div id="srch-head">
      <div class="modal-title" data-i="s_title" style="margin-bottom:10px"></div>
      <input id="srch-input" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" />
      <div id="srch-opts"><select id="srch-lang" aria-label="Search language"></select></div>
    </div>
    <div class="srch-note" id="srch-note"></div>
    <div id="srch-results"></div>
    <button class="modal-close" id="srch-close" data-i="close"></button>
  </div>`;
  document.body.appendChild(modal);
  const input = $('srch-input'), langSel = $('srch-lang'), box = $('srch-results'), note = $('srch-note');

  function buildLangSelect() {
    const keep = langSel.value || 'auto';
    langSel.innerHTML = `<option value="auto">${qmaT('s_auto')}</option>` +
      TRANSLATIONS.map(t => `<option value="${t.code}">${esc(t.name)}</option>`).join('');
    langSel.value = keep;
  }
  function applyLang() {
    modal.querySelectorAll('[data-i]').forEach(e => { e.textContent = qmaT(e.dataset.i); });
    input.placeholder = qmaT('s_ph');
    btn.title = qmaT('s_btn'); btn.setAttribute('aria-label', qmaT('s_btn'));
    buildLangSelect();
    if (!input.value.trim()) note.textContent = qmaT('s_hint'); else run();
  }
  qmaOnLang(applyLang);

  const open = () => { modal.classList.add('open'); setTimeout(() => input.focus(), 50); if (!input.value.trim()) note.textContent = qmaT('s_hint'); };
  const close = () => modal.classList.remove('open');
  btn.onclick = open;
  $('srch-close').onclick = close;
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // ---------- search ----------
  let timer = 0, seq = 0, current = null, shown = 0;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 250); });
  langSel.addEventListener('change', run);

  const REF = /^\s*(\d{1,3})\s*[:.\-\s]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\s*$/;

  async function run() {
    const mySeq = ++seq;
    const raw = digits(input.value).trim();
    box.innerHTML = ''; current = null;
    if (!raw) { note.textContent = qmaT('s_hint'); return; }

    // 1) reference like 2:255 or 18:1-10, or just a surah number
    const ref = REF.exec(raw);
    const num = /^\d{1,3}$/.test(raw) ? Number(raw) : 0;
    const chapters = state.chapters || [];
    if (ref || num) {
      const c = ref ? Number(ref[1]) : num;
      const cd = chapters.find(x => x.id === c);
      if (!cd) { note.textContent = qmaT('s_none'); return; }
      if (!ref) { note.textContent = ''; box.innerHTML = '<div class="srch-h">' + qmaT('s_chapters') + '</div>'; box.appendChild(chapterCard(cd)); return; }
      const a = Number(ref[2]), b = Math.min(ref[3] ? Number(ref[3]) : a, cd.total_verses);
      if (a < 1 || a > cd.total_verses || b < a) { note.textContent = qmaT('s_none'); return; }
      const code = $('lang-select').value === 'ar' ? 'ar' : $('lang-select').value;
      note.textContent = qmaT('s_loading');
      try {
        const rows = (await load(code)).filter(r => r.c === c && r.v >= a && r.v <= b);
        if (mySeq !== seq) return;
        current = { rows, tokens: [], code };
        note.textContent = qmaT('s_count', { n: rows.length });
        shown = 0; await more();
      } catch (_) { note.textContent = qmaT('s_unavail'); }
      return;
    }

    // 2) text search
    const code = pickCode(raw, langSel.value);
    const tokens = norm(raw).split(/\s+/).filter(Boolean);
    const total = tokens.join('').length;
    if (!total || (total < 2 && !/[\u4E00-\u9FFF]/.test(raw))) { note.textContent = qmaT('s_short'); return; }

    note.textContent = qmaT('s_loading');
    let rows;
    try { rows = await load(code); }
    catch (_) { if (mySeq === seq) note.textContent = qmaT('s_unavail'); return; }
    if (mySeq !== seq) return;

    const phrase = tokens.join(' ');
    const hits = [], rest = [];
    for (const r of rows) {
      if (!tokens.every(t => r.n.includes(t))) continue;
      (r.n.includes(phrase) ? hits : rest).push(r);
    }
    const all = hits.concat(rest);

    // chapter-name matches
    const chHits = chapters.filter(c => {
      const n = norm(`${c.transliteration} ${c.translation} ${c.name}`);
      return tokens.every(t => n.includes(t));
    }).slice(0, 5);

    box.innerHTML = '';
    if (chHits.length) {
      box.insertAdjacentHTML('beforeend', '<div class="srch-h">' + qmaT('s_chapters') + '</div>');
      chHits.forEach(c => box.appendChild(chapterCard(c)));
    }
    if (!all.length && !chHits.length) { note.textContent = qmaT('s_none'); return; }
    current = { rows: all, tokens, code };
    shown = 0;
    if (all.length) { box.insertAdjacentHTML('beforeend', '<div id="srch-verses"></div>'); await more(); }
    else note.textContent = '';
  }

  async function more() {
    const { rows, tokens, code } = current;
    let holder = $('srch-verses');
    if (!holder) { holder = document.createElement('div'); holder.id = 'srch-verses'; box.appendChild(holder); }
    const old = $('srch-more'); if (old) old.remove();
    const slice = rows.slice(shown, shown + PAGE);
    for (const r of slice) holder.appendChild(await verseCard(r, tokens, code));
    shown += slice.length;
    note.textContent = shown < rows.length ? qmaT('s_count_more', { a: shown, n: rows.length }) : qmaT('s_count', { n: rows.length });
    if (shown < rows.length) {
      const b = document.createElement('button');
      b.id = 'srch-more'; b.className = 'srch-btn'; b.textContent = qmaT('s_more');
      b.onclick = more; box.appendChild(b);
    }
  }

  function chName(c) { return state.uiLang === 'ar' ? c.name : `${c.transliteration} – ${c.translation}`; }

  function chapterCard(c) {
    const d = document.createElement('div'); d.className = 'srch-card';
    d.innerHTML = `<div class="srch-top"><span class="srch-ref">${c.id}</span>
      <span class="srch-line"><b>${esc(chName(c))}</b><br>${qmaT('s_chap_line', { c: c.id, n: c.total_verses })}</span>
      <button class="srch-btn" data-a="use">${qmaT('s_use')}</button>
      <button class="srch-btn" data-a="play">${qmaT('s_play')}</button></div>
      <div class="srch-ar" dir="rtl">${esc(c.name)}</div>`;
    d.querySelector('[data-a=use]').onclick = () => choose(c.id, 1, c.total_verses, false);
    d.querySelector('[data-a=play]').onclick = () => choose(c.id, 1, c.total_verses, true);
    return d;
  }

  async function verseCard(r, tokens, code) {
    const c = (state.chapters || []).find(x => x.id === r.c);
    const ref = `${r.c}:${r.v}`;
    const ar = code === 'ar' ? r.t : await arabicText(r.c, r.v);
    const d = document.createElement('div'); d.className = 'srch-card';
    d.innerHTML = `<div class="srch-top"><span class="srch-ref">${ref}</span>
      <span class="srch-line">${c ? '<b>' + esc(chName(c)) + '</b><br>' : ''}${qmaT('s_surah_line', { c: r.c, v: r.v })}</span>
      <button class="srch-btn" data-a="copy">${qmaT('s_copy')}</button>
      <button class="srch-btn" data-a="use">${qmaT('s_use')}</button>
      <button class="srch-btn" data-a="play">${qmaT('s_play')}</button></div>
      <div class="srch-ar" dir="rtl" style="font-family:'${state.arabicFont}','Traditional Arabic',serif">${code === 'ar' ? highlight(ar, tokens) : esc(ar)}</div>
      ${code === 'ar' ? '' : `<div class="srch-tr" dir="auto">${highlight(r.t, tokens)}</div>`}`;
    d.querySelector('[data-a=copy]').onclick = async () => {
      try { await navigator.clipboard.writeText(ref); } catch (_) {}
      if (typeof toast === 'function') toast(qmaT('s_copied', { r: ref }), 'success');
    };
    d.querySelector('[data-a=use]').onclick = () => choose(r.c, r.v, r.v, false);
    d.querySelector('[data-a=play]').onclick = () => choose(r.c, r.v, r.v, true);
    return d;
  }

  // ---------- put the result into the player settings ----------
  async function choose(c, a, b, play) {
    const ch = $('chapter-select');
    if (state.isPlaying) stopPlayback();
    ch.value = String(c); ch.dispatchEvent(new Event('change'));
    $('start-verse').value = a; $('end-verse').value = b;
    ['start-verse', 'end-verse'].forEach(id => $(id).dispatchEvent(new Event('change')));
    if (window.updateSettingsSummary) window.updateSettingsSummary();
    close();
    const ref = a === b ? `${c}:${a}` : `${c}:${a}-${b}`;
    if (typeof toast === 'function') toast(qmaT('s_selected', { r: ref }), 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (play) await startPlayback();
  }

  applyLang();
})();
