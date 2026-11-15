// =====================================================================
//  QMA — Keep screen on (Screen Wake Lock API). Loaded after app.js.
//  Modes (saved in localStorage 'qma_keepAwake'):
//    playing = while playback is running (default) | always = whole time app is open | off
// =====================================================================
(() => {
  const KEY = 'qma_keepAwake';
  const supported = 'wakeLock' in navigator;
  let lock = null;

  const mode = () => localStorage.getItem(KEY) || 'playing';
  const wanted = () => { const m = mode(); return m === 'always' || (m === 'playing' && state.isPlaying); };

  // ---- setting row, added to the Settings card ----
  const row = document.createElement('div');
  row.style.cssText = 'margin-top:14px;display:flex;flex-direction:column;gap:6px';
  row.innerHTML = `
    <label class="form-label" for="keep-awake-select" style="text-align:left">🔆 Keep screen on / إبقاء الشاشة مضاءة</label>
    <select id="keep-awake-select">
      <option value="playing">While listening (playback active)</option>
      <option value="always">Whenever the app is open</option>
      <option value="off">Off</option>
    </select>
    <span class="verse-hint-inline" id="keep-awake-note"></span>`;
  document.getElementById('font-preview').parentNode.appendChild(row);
  const sel = row.querySelector('select'), note = row.querySelector('#keep-awake-note');
  sel.value = mode();

  function showNote() {
    if (!supported) { note.textContent = 'Not supported by this browser — please update it.'; return; }
    if (mode() === 'off') note.textContent = '';
    else note.textContent = lock ? 'Screen will stay on ✓' : (wanted() ? 'Could not keep screen on (battery saver?)' : '');
  }

  async function sync() {
    if (!supported) return showNote();
    if (wanted() && document.visibilityState === 'visible') {
      if (!lock) {
        try {
          lock = await navigator.wakeLock.request('screen');
          lock.addEventListener('release', () => { lock = null; showNote(); });
        } catch (_) { lock = null; }
      }
    } else if (lock) {
      try { await lock.release(); } catch (_) {}
      lock = null;
    }
    showNote();
  }

  sel.addEventListener('change', () => { localStorage.setItem(KEY, sel.value); sync(); });
  document.addEventListener('playback-started', sync);
  document.addEventListener('playback-stopped', sync);
  // the browser drops the lock whenever the page is hidden; take it again when it's visible
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  // first tap anywhere also (re)tries, in case "always" mode was blocked before a user gesture
  document.addEventListener('click', () => { if (wanted() && !lock) sync(); }, { passive: true });
  sync();
})();
