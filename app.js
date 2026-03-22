// =====================================================================
//  QMA PWA — app.js
//  Loads data from the existing repo JSON assets:
//    assets/data/chapters.json
//    assets/data/quran.json          (Arabic)
//    assets/data/editions/*.json     (translations)
//    assets/lang/en.json / ar.json   (UI strings)
//  Audio: https://everyayah.com/data/<reciter_dir>/<surah><ayah>.mp3
// =====================================================================

// ---- Arabic (verse) fonts ----
const ARABIC_FONTS = [
  { name: 'Scheherazade New',     family: 'Scheherazade New',      google: 'Scheherazade+New:wght@400;700',      desc: 'Traditional Naskh' },
  { name: 'Amiri',                family: 'Amiri',                 google: 'Amiri:wght@400;700',                 desc: 'Classic Naskh' },
  { name: 'Noto Naskh Arabic',    family: 'Noto Naskh Arabic',     google: 'Noto+Naskh+Arabic:wght@400;700',    desc: 'Clean Naskh' },
  { name: 'Noto Kufi Arabic',     family: 'Noto Kufi Arabic',      google: 'Noto+Kufi+Arabic:wght@400;700',     desc: 'Kufi style' },
  { name: 'Lateef',               family: 'Lateef',                google: 'Lateef:wght@400;700',                desc: 'Nastaleeq-inspired' },
  { name: 'Harmattan',            family: 'Harmattan',             google: 'Harmattan:wght@400;700',             desc: 'West African Naskh' },
  { name: 'Reem Kufi',            family: 'Reem Kufi',             google: 'Reem+Kufi:wght@400;700',             desc: 'Modern Kufi' },
  { name: 'Aref Ruqaa',           family: 'Aref Ruqaa',            google: 'Aref+Ruqaa',                         desc: 'Ruqaa script' },
];

// ---- UI / translation fonts ----
const UI_FONTS = [
  { name: 'Lato',              family: 'Lato',               google: 'Lato:wght@300;400;700',              desc: 'Default — Latin' },
  { name: 'Noto Sans',         family: 'Noto Sans',          google: 'Noto+Sans:wght@400;700',             desc: 'Universal coverage' },
  { name: 'Open Sans',         family: 'Open Sans',          google: 'Open+Sans:wght@400;700',             desc: 'Humanist Sans' },
  { name: 'Source Serif 4',    family: 'Source Serif 4',     google: 'Source+Serif+4:wght@400;700',        desc: 'Serif — formal' },
  { name: 'Merriweather',      family: 'Merriweather',       google: 'Merriweather:wght@400;700',          desc: 'Serif — readable' },
  { name: 'Amiri',             family: 'Amiri',              google: 'Amiri:wght@400;700',                 desc: 'Arabic/Latin bilingual' },
  { name: 'Noto Nastaliq Urdu',family: 'Noto Nastaliq Urdu', google: 'Noto+Nastaliq+Urdu:wght@400;700',   desc: 'Urdu Nastaleeq' },
  { name: 'Noto Sans Bengali', family: 'Noto Sans Bengali',  google: 'Noto+Sans+Bengali:wght@400;700',    desc: 'Bengali script' },
  { name: 'Noto Sans SC',      family: 'Noto Sans SC',       google: 'Noto+Sans+SC:wght@400;700',          desc: 'Simplified Chinese' },
];

// ---- Reciters — dirs match everyayah.com naming ----
const RECITERS = [
  { name: "Yassin Al-Jazaery – Warsh", dir: "warsh/warsh_yassin_al_jazaery_64kbps" },
  { name: "Fares Abbad", dir: "Fares_Abbad_64kbps" },

  { name: "Maher Al Muaiqly (128kbps)", dir: "MaherAlMuaiqly128kbps" },
  { name: "Maher Al Muaiqly (64kbps)", dir: "Maher_AlMuaiqly_64kbps" },

  { name: "Ghamadi", dir: "Ghamadi_40kbps" },

  { name: "Ibrahim Al-Dosary – Warsh", dir: "warsh/warsh_ibrahim_aldosary_128kbps" },

  { name: "Abdul Basit – Mujawwad (128kbps)", dir: "Abdul_Basit_Mujawwad_128kbps" },
  { name: "Abdul Basit – Murattal (192kbps)", dir: "Abdul_Basit_Murattal_192kbps" },
  { name: "Abdul Basit – Murattal (64kbps)", dir: "Abdul_Basit_Murattal_64kbps" },

  { name: "Abdul Samad", dir: "AbdulSamad_64kbps_QuranExplorer.Com" },
  { name: "Abdullaah Al-Juhaynee", dir: "Abdullaah_3awwaad_Al-Juhaynee_128kbps" },

  { name: "Abdullah Basfar (192kbps)", dir: "Abdullah_Basfar_192kbps" },
  { name: "Abdullah Basfar (64kbps)", dir: "Abdullah_Basfar_64kbps" },
  { name: "Abdullah Basfar (32kbps)", dir: "Abdullah_Basfar_32kbps" },

  { name: "Abdullah Matroud", dir: "Abdullah_Matroud_128kbps" },

  { name: "Abdurrahmaan As-Sudais (192kbps)", dir: "Abdurrahmaan_As-Sudais_192kbps" },
  { name: "Abdurrahmaan As-Sudais (64kbps)", dir: "Abdurrahmaan_As-Sudais_64kbps" },

  { name: "Abu Bakr Ash-Shaatree (128kbps)", dir: "Abu_Bakr_Ash-Shaatree_128kbps" },
  { name: "Abu Bakr Ash-Shaatree (64kbps)", dir: "Abu_Bakr_Ash-Shaatree_64kbps" },

  { name: "Ahmed Al-Ajamy (128kbps)", dir: "ahmed_ibn_ali_al_ajamy_128kbps" },
  { name: "Ahmed Al-Ajamy (64kbps)", dir: "Ahmed_ibn_Ali_al-Ajamy_64kbps_QuranExplorer.Com" },
  { name: "Ahmed Al-Ajamy – KetabAllah", dir: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net" },

  { name: "Ahmed Neana", dir: "Ahmed_Neana_128kbps" },
  { name: "Akram Al-Alaqimy", dir: "Akram_AlAlaqimy_128kbps" },

  { name: "Mishary Alafasy (128kbps)", dir: "Alafasy_128kbps" },
  { name: "Mishary Alafasy (64kbps)", dir: "Alafasy_64kbps" },

  { name: "Ali Jaber", dir: "Ali_Jaber_64kbps" },
  { name: "Ali Al-Suesy", dir: "Ali_Hajjaj_AlSuesy_128kbps" },

  { name: "Ayman Sowaid", dir: "Ayman_Sowaid_64kbps" },
  { name: "Aziz Alili", dir: "aziz_alili_128kbps" },

  { name: "Hani Rifai (192kbps)", dir: "Hani_Rifai_192kbps" },
  { name: "Hani Rifai (64kbps)", dir: "Hani_Rifai_64kbps" },

  { name: "Hudhaify (128kbps)", dir: "Hudhaify_128kbps" },
  { name: "Hudhaify (64kbps)", dir: "Hudhaify_64kbps" },
  { name: "Hudhaify (32kbps)", dir: "Hudhaify_32kbps" },

  { name: "Husary (128kbps)", dir: "Husary_128kbps" },
  { name: "Husary (64kbps)", dir: "Husary_64kbps" },
  { name: "Husary – Muallim", dir: "Husary_Muallim_128kbps" },
  { name: "Husary – Mujawwad (128kbps)", dir: "Husary_128kbps_Mujawwad" },
  { name: "Husary – Mujawwad (64kbps)", dir: "Husary_Mujawwad_64kbps" },

  { name: "Ibrahim Akhdar (64kbps)", dir: "Ibrahim_Akhdar_64kbps" },
  { name: "Ibrahim Akhdar (32kbps)", dir: "Ibrahim_Akhdar_32kbps" },

  { name: "Karim Mansoori", dir: "Karim_Mansoori_40kbps" },
  { name: "Khalefa Al-Tunaiji", dir: "khalefa_al_tunaiji_64kbps" },
  { name: "Khalid Al-Qahtani", dir: "Khaalid_Abdullaah_al-Qahtaanee_192kbps" },

  { name: "Mahmoud Al-Banna", dir: "mahmoud_ali_al_banna_32kbps" },

  { name: "Menshawi (16kbps)", dir: "Menshawi_16kbps" },
  { name: "Menshawi (32kbps)", dir: "Menshawi_32kbps" },

  { name: "Minshawy – Mujawwad (192kbps)", dir: "Minshawy_Mujawwad_192kbps" },
  { name: "Minshawy – Mujawwad (64kbps)", dir: "Minshawy_Mujawwad_64kbps" },
  { name: "Minshawy – Murattal", dir: "Minshawy_Murattal_128kbps" },

  { name: "Mohammad Al-Tablaway (128kbps)", dir: "Mohammad_al_Tablaway_128kbps" },
  { name: "Mohammad Al-Tablaway (64kbps)", dir: "Mohammad_al_Tablaway_64kbps" },

  { name: "Muhammad AbdulKareem", dir: "Muhammad_AbdulKareem_128kbps" },

  { name: "Muhammad Ayyoub (128kbps)", dir: "Muhammad_Ayyoub_128kbps" },
  { name: "Muhammad Ayyoub (64kbps)", dir: "Muhammad_Ayyoub_64kbps" },
  { name: "Muhammad Ayyoub (32kbps)", dir: "Muhammad_Ayyoub_32kbps" },

  { name: "Muhammad Jibreel (128kbps)", dir: "Muhammad_Jibreel_128kbps" },
  { name: "Muhammad Jibreel (64kbps)", dir: "Muhammad_Jibreel_64kbps" },

  { name: "Muhsin Al-Qasim", dir: "Muhsin_Al_Qasim_192kbps" },

  { name: "Basfar & Walk – Multi-language", dir: "MultiLanguage/Basfar_Walk_192kbps" },

  { name: "Mustafa Ismail", dir: "Mustafa_Ismail_48kbps" },
  { name: "Nabil Rifai", dir: "Nabil_Rifa3i_48kbps" },

  { name: "Nasser Al-Qatami", dir: "Nasser_Alqatami_128kbps" },
  { name: "Parhizgar", dir: "Parhizgar_48kbps" },

  { name: "Sahl Yassin", dir: "Sahl_Yassin_128kbps" },
  { name: "Salaah Bukhatir", dir: "Salaah_AbdulRahman_Bukhatir_128kbps" },
  { name: "Salah Al-Budair", dir: "Salah_Al_Budair_128kbps" },

  { name: "Saood Ash-Shuraym (128kbps)", dir: "Saood_ash-Shuraym_128kbps" },
  { name: "Saood Ash-Shuraym (64kbps)", dir: "Saood_ash-Shuraym_64kbps" },

  { name: "Yaser Salamah", dir: "Yaser_Salamah_128kbps" },
  { name: "Yasser Ad-Dussary", dir: "Yasser_Ad-Dussary_128kbps" },

  { name: "--- Translation ---", dir: "English/Sahih_Intnl_Ibrahim_Walk_192kbps" },

  { name: "Ibrahim Walk – Sahih Intl Translation (English)", dir: "English/Sahih_Intnl_Ibrahim_Walk_192kbps" },

  { name: "Hedayatfar – Fooladvand Translation (Persian)", dir: "translations/Fooladvand_Hedayatfar_40Kbps" },
  { name: "Kabiri – Makarem Translation (Persian)", dir: "translations/Makarem_Kabiri_16Kbps" },
  { name: "Shamshad Ali Khan – Urdu Translation", dir: "translations/urdu_shamshad_ali_khan_46kbps" },
  { name: "Farhat Hashmi – Urdu Word-for-Word Translation", dir: "translations/urdu_farhat_hashmi" },
  { name: "Balayev – Azerbaijani Translation", dir: "translations/azerbaijani/balayev" },
  { name: "Besim Korkut – Bosnian Translation", dir: "translations/besim_korkut_ajet_po_ajet" },
];

// ---- Translation files — relative to assets/data/ ----
const TRANSLATIONS = [
  { code: 'ar',    name: 'العربية',        file: 'quran.json',                  rtl: true  },
{ code: 'en',    name: 'English',         file: 'editions/en.json',            rtl: false },
{ code: 'fr',    name: 'Français',        file: 'editions/fr.json',            rtl: false },
{ code: 'es',    name: 'Español',         file: 'editions/es.json',            rtl: false },
{ code: 'ru',    name: 'Русский',         file: 'editions/ru.json',            rtl: false },
{ code: 'bn',    name: 'বাংলা',           file: 'editions/bn.json',            rtl: false },
{ code: 'sv',    name: 'Svenska',         file: 'editions/sv.json',            rtl: false },
{ code: 'tr',    name: 'Türkçe',          file: 'editions/tr.json',            rtl: false },
{ code: 'ur',    name: 'اردو',            file: 'editions/ur.json',            rtl: true  },
{ code: 'zh',    name: '中文',            file: 'editions/zh.json',            rtl: false },
{ code: 'trans', name: 'Transliteration', file: 'editions/transliteration.json', rtl: false },
];

const DATA_BASE  = 'assets/data/';
const AUDIO_BASE = 'https://everyayah.com/data/';

// =====================================================================
//  State
// =====================================================================
const state = {
  isPlaying:    false,
  isDark:       true,
  uiLang:       'en',
  fontSize:     26,
  chapters:     [],           // loaded from chapters.json
  uiStrings:    {},           // loaded from lang/*.json
  audio:        null,
  playlist:     [],
  playIndex:    0,
  repeatIndex:  0,
  totalRepeat:  1,
  transCache:   {},           // { 'code_surah': { 'surah_ayah': text } }
  arabicFont:   'Scheherazade New',
  uiFont:       'Lato',
};

let deferredInstallPrompt = null;
let toastTimer = null;

// =====================================================================
//  DOM helpers
// =====================================================================
const $ = id => document.getElementById(id);

const dom = {
  reciterSelect:  $('reciter-select'),
  langSelect:     $('lang-select'),
  chapterSelect:  $('chapter-select'),
  startVerse:     $('start-verse'),
  endVerse:       $('end-verse'),
  repeatInput:    $('repeat-input'),
  verseText:      $('verse-text'),
  verseRef:       $('verse-ref'),
  progressBar:    $('progress-bar'),
  progressLabel:  $('progress-label'),
  progressCount:  $('progress-count'),
  playBtn:        $('play-btn'),
  statusBadge:    $('status-badge'),
  statusText:     $('status-text'),
  verseRangeInfo: $('verse-range-info'),
  themeToggle:    $('theme-toggle'),
  langToggle:     $('lang-toggle'),
  helpBtn:        $('help-btn'),
  helpModal:      $('help-modal'),
  modalClose:     $('modal-close'),
  fontInc:        $('font-inc'),
  fontDec:        $('font-dec'),
  toast:          $('toast'),
  installBanner:  $('install-banner'),
  installBtn:     $('install-btn'),
  dismissBanner:  $('dismiss-banner'),
  loadingOverlay: $('loading-overlay'),
  arabicFontSel:  $('arabic-font-select'),
  uiFontSel:      $('ui-font-select'),
  fontPreviewAr:  $('font-preview-arabic'),
  fontPreviewUi:  $('font-preview-ui'),
};

// =====================================================================
//  Boot — load data then init UI
// =====================================================================
async function boot() {
  showLoading(true);
  try {
    await Promise.all([
      loadChapters(),
                      loadUIStrings(),
    ]);
  } catch (e) {
    console.error('Boot failed:', e);
    toast('Failed to load app data. Check your connection.', 'error');
  }
  loadSettings();
  populateReciters();
  populateTranslations();
  populateChapters();
  populateFontSelects();
  bindEvents();
  applyTheme();
  applyUILang();
  registerSW();
  showLoading(false);
}

function showLoading(on) {
  if (dom.loadingOverlay) dom.loadingOverlay.classList.toggle('hidden', !on);
}

// ---- Load chapters.json ----
async function loadChapters() {
  const url = DATA_BASE + 'chapters.json';
  const res  = await fetchWithCache(url, 'qma_chapters');
  state.chapters = res; // array of {id, name, transliteration, translation, type, total_verses}
}

// ---- Load UI strings from assets/lang/{lang}.json ----
async function loadUIStrings() {
  const lang = localStorage.getItem('qma_uiLang') || 'en';
  await loadUILang(lang);
}

async function loadUILang(lang) {
  const url = `assets/lang/${lang}.json`;
  try {
    const data = await fetchWithCache(url, `qma_ui_${lang}`);
    state.uiStrings = flattenStrings(data); // flatten nested keys like "menu.file"
    state.uiLang = lang;
  } catch (e) {
    console.warn(`UI lang ${lang} not found, falling back to en`);
    if (lang !== 'en') await loadUILang('en');
  }
}

// Flatten { "menu": { "file": "File" } } → { "menu.file": "File" }
function flattenStrings(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(acc, flattenStrings(v, key));
    } else {
      acc[key] = v;
    }
    return acc;
  }, {});
}

function t(key, fallback = '') {
  return state.uiStrings[key] || fallback;
}

// =====================================================================
//  Generic fetch with sessionStorage cache
// =====================================================================
async function fetchWithCache(url, cacheKey) {
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${url} → ${res.status}`);
  const data = await res.json();
  try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch(_) {}
  return data;
}

// =====================================================================
//  Settings persistence
// =====================================================================
function loadSettings() {
  const s = localStorage;
  state.isDark   = s.getItem('qma_isDark')   !== 'false';
  state.uiLang   = s.getItem('qma_uiLang')   || 'en';
  state.fontSize = parseInt(s.getItem('qma_fontSize') || '26');

  state.arabicFont = s.getItem('qma_arabicFont') || 'Scheherazade New';
  state.uiFont     = s.getItem('qma_uiFont')     || 'Lato';

  state._saved = {
    chapter: parseInt(s.getItem('qma_chapter')          || '1'),
    start:   parseInt(s.getItem('qma_startVerse')       || '1'),
    end:     parseInt(s.getItem('qma_endVerse')         || '7'),
    repeat:  parseInt(s.getItem('qma_repeat')           || '1'),
    reciter: s.getItem('qma_reciter')                   || RECITERS[0].dir,
    lang:    s.getItem('qma_translationLang')           || 'ar',
  };
}

function saveSettings() {
  const s = localStorage;
  s.setItem('qma_isDark',           state.isDark);
  s.setItem('qma_uiLang',           state.uiLang);
  s.setItem('qma_fontSize',         state.fontSize);
  s.setItem('qma_chapter',          dom.chapterSelect.value);
  s.setItem('qma_startVerse',       dom.startVerse.value);
  s.setItem('qma_endVerse',         dom.endVerse.value);
  s.setItem('qma_repeat',           dom.repeatInput.value);
  s.setItem('qma_reciter',          dom.reciterSelect.value);
  s.setItem('qma_translationLang',  dom.langSelect.value);
  s.setItem('qma_arabicFont',        state.arabicFont);
  s.setItem('qma_uiFont',            state.uiFont);
}


// =====================================================================
//  Font picker
// =====================================================================
function populateFontSelects() {
  ARABIC_FONTS.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.family;
    opt.textContent = f.name + ' — ' + f.desc;
    if (f.family === state.arabicFont) opt.selected = true;
    dom.arabicFontSel.appendChild(opt);
  });
  UI_FONTS.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.family;
    opt.textContent = f.name + ' — ' + f.desc;
    if (f.family === state.uiFont) opt.selected = true;
    dom.uiFontSel.appendChild(opt);
  });
  applyFonts();
}

// Lazy-load a Google Font if not already in <head>
function ensureGoogleFont(googleParam) {
  const id = 'gf-' + googleParam.replace(/[^a-zA-Z0-9]/g, '-');
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${googleParam}&display=swap`;
  document.head.appendChild(link);
}

function applyFonts() {
  const af = ARABIC_FONTS.find(f => f.family === state.arabicFont) || ARABIC_FONTS[0];
  const uf = UI_FONTS.find(f => f.family === state.uiFont)         || UI_FONTS[0];

  ensureGoogleFont(af.google);
  ensureGoogleFont(uf.google);

  // Arabic / verse text
  dom.verseText.style.fontFamily = `'${af.family}', 'Traditional Arabic', serif`;
  if (dom.fontPreviewAr) {
    dom.fontPreviewAr.style.fontFamily = `'${af.family}', 'Traditional Arabic', serif`;
  }

  // UI font — set CSS variable so everything picks it up
  document.documentElement.style.setProperty('--ui-font', `'${uf.family}', sans-serif`);
  document.body.style.fontFamily = `'${uf.family}', sans-serif`;
  if (dom.fontPreviewUi) {
    dom.fontPreviewUi.style.fontFamily = `'${uf.family}', sans-serif`;
  }

  // Keep ltr-lang verse text using ui font
  const styleId = 'qma-font-override';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
  #verse-text.ltr-lang { font-family: '${uf.family}', sans-serif !important; }
  select, input, button, label { font-family: '${uf.family}', sans-serif; }
  `;
}

// =====================================================================
//  Populate selects
// =====================================================================
function populateReciters() {
  RECITERS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.dir;
    opt.textContent = r.name;
    if (r.dir === state._saved.reciter) opt.selected = true;
    dom.reciterSelect.appendChild(opt);
  });
}

function populateTranslations() {
  TRANSLATIONS.forEach(tr => {
    const opt = document.createElement('option');
    opt.value = tr.code;
    opt.textContent = tr.name;
    if (tr.code === state._saved.lang) opt.selected = true;
    dom.langSelect.appendChild(opt);
  });
}

function populateChapters() {
  const isAr = state.uiLang === 'ar';
  state.chapters.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch.id;
    opt.dataset.total = ch.total_verses;
    if (isAr) {
      opt.textContent = `${String(ch.id).padStart(3,'0')} — ${ch.name}  (${ch.total_verses} آيات)`;
    } else {
      opt.textContent = `${String(ch.id).padStart(3,'0')} — ${ch.transliteration} – ${ch.translation}  (${ch.total_verses})`;
    }
    if (ch.id === state._saved.chapter) opt.selected = true;
    dom.chapterSelect.appendChild(opt);
  });
  dom.startVerse.value  = state._saved.start;
  dom.endVerse.value    = state._saved.end;
  dom.repeatInput.value = state._saved.repeat || 1;
  dom.verseText.style.fontSize = state.fontSize + 'px';
  applyFonts();
  updateVerseRangeInfo();
  if (typeof window.updateSettingsSummary === 'function') window.updateSettingsSummary();
}

function repopulateChapters() {
  dom.chapterSelect.innerHTML = '';
  const saved = parseInt(dom.chapterSelect.dataset.savedId || dom.chapterSelect.value || state._saved.chapter);
  const isAr  = state.uiLang === 'ar';
  state.chapters.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch.id;
    opt.dataset.total = ch.total_verses;
    if (isAr) {
      opt.textContent = `${String(ch.id).padStart(3,'0')} — ${ch.name}  (${ch.total_verses} آيات)`;
    } else {
      opt.textContent = `${String(ch.id).padStart(3,'0')} — ${ch.transliteration} – ${ch.translation}  (${ch.total_verses})`;
    }
    if (ch.id === saved) opt.selected = true;
    dom.chapterSelect.appendChild(opt);
  });
  updateVerseRangeInfo();
  if (typeof window.updateSettingsSummary === 'function') window.updateSettingsSummary();
}

function getChapterData() {
  const id  = parseInt(dom.chapterSelect.value);
  return state.chapters.find(c => c.id === id) || null;
}

function updateVerseRangeInfo() {
  const cd = getChapterData();
  if (!cd) return;
  dom.verseRangeInfo.textContent = `/ ${cd.total_verses}`;
  dom.startVerse.max = cd.total_verses;
  dom.endVerse.max   = cd.total_verses;
}

// =====================================================================
//  Events
// =====================================================================
function bindEvents() {
  dom.playBtn.addEventListener('click', togglePlayback);

  dom.themeToggle.addEventListener('click', () => {
    state.isDark = !state.isDark;
    applyTheme();
    saveSettings();
  });

  dom.langToggle.addEventListener('click', async () => {
    const next = state.uiLang === 'en' ? 'ar' : 'en';
    showLoading(true);
    await loadUILang(next);
    repopulateChapters();
    applyUILang();
    showLoading(false);
    saveSettings();
  });

  dom.helpBtn.addEventListener('click', () => dom.helpModal.classList.add('open'));
  dom.modalClose.addEventListener('click', () => dom.helpModal.classList.remove('open'));
  dom.helpModal.addEventListener('click', e => {
    if (e.target === dom.helpModal) dom.helpModal.classList.remove('open');
  });

    dom.fontInc.addEventListener('click', () => {
      state.fontSize = Math.min(48, state.fontSize + 2);
      dom.verseText.style.fontSize = state.fontSize + 'px';
      saveSettings();
    });
    dom.fontDec.addEventListener('click', () => {
      state.fontSize = Math.max(14, state.fontSize - 2);
      dom.verseText.style.fontSize = state.fontSize + 'px';
      saveSettings();
    });

    dom.chapterSelect.addEventListener('change', () => { updateVerseRangeInfo(); saveSettings(); });
    [dom.reciterSelect, dom.langSelect, dom.startVerse, dom.endVerse, dom.repeatInput]
    .forEach(el => el.addEventListener('change', saveSettings));

    dom.arabicFontSel.addEventListener('change', () => {
      state.arabicFont = dom.arabicFontSel.value;
      applyFonts();
      saveSettings();
    });
    dom.uiFontSel.addEventListener('change', () => {
      state.uiFont = dom.uiFontSel.value;
      applyFonts();
      saveSettings();
    });

    // PWA install
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredInstallPrompt = e;
      dom.installBanner.classList.add('show');
    });
    dom.installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') toast('App installed! 🎉', 'success');
      deferredInstallPrompt = null;
      dom.installBanner.classList.remove('show');
    });
    dom.dismissBanner.addEventListener('click', () => dom.installBanner.classList.remove('show'));
}

// =====================================================================
//  Theme
// =====================================================================
function applyTheme() {
  document.body.classList.toggle('light', !state.isDark);
  dom.themeToggle.textContent = state.isDark ? '☀️' : '🌙';
  document.getElementById('theme-color-meta')
  .setAttribute('content', state.isDark ? '#0f2027' : '#f0fafa');
}

// =====================================================================
//  UI Language — driven by loaded lang JSON
// =====================================================================
function applyUILang() {
  const isRTL = state.uiLang === 'ar';
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', state.uiLang);

  setText('lbl-reciter',  t('label.reciter',    'Reciter'));
  setText('lbl-lang',     t('label.language',   'Translation'));
  setText('lbl-chapter',  t('label.chapter',    'Chapter (Surah)'));
  setText('lbl-verses',   isRTL ? 'الآيات'      : 'Verses');
  setText('lbl-to',       isRTL ? 'إلى'         : 'to');
  setText('lbl-repeat',   t('label.repetitions','Repetitions'));
  setText('group-settings-title', t('group.settings', 'Settings'));
  setText('lbl-arabic-font', t('label.arabic_font', 'Arabic Font'));
  setText('lbl-ui-font',     t('label.ui_font',     'UI Font'));
  setText('group-verse-title',    t('group.subtitle',  'Current Verse'));

  if (!state.isPlaying) {
    dom.playBtn.textContent    = t('button.play', '▶  Start Playback');
    dom.statusText.textContent = isRTL ? 'في الانتظار' : 'Idle';
    dom.progressLabel.textContent = isRTL ? 'جاهز' : 'Ready';
  } else {
    dom.playBtn.textContent    = t('button.stop', '■  Stop Playback');
    dom.statusText.textContent = isRTL ? 'تشغيل' : 'Playing';
  }
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

// =====================================================================
//  Playback
// =====================================================================
async function togglePlayback() {
  if (state.isPlaying) {
    stopPlayback();
  } else {
    await startPlayback();
  }
}

async function startPlayback() {
  const cd     = getChapterData();
  if (!cd) { toast('Please select a chapter', 'error'); return; }

  const start  = parseInt(dom.startVerse.value)  || 1;
  const end    = parseInt(dom.endVerse.value)    || cd.total_verses;
  const repeat = parseInt(dom.repeatInput.value) || 1;

  if (start < 1 || end > cd.total_verses || start > end) {
    toast(`Valid range: 1 – ${cd.total_verses}`, 'error');
    return;
  }

  // Build playlist
  state.playlist   = [];
  for (let a = start; a <= end; a++) {
    state.playlist.push({ surah: cd.id, ayah: a });
  }
  state.playIndex   = 0;
  state.repeatIndex = 0;
  state.totalRepeat = repeat;

  // Pre-load translation for this chapter
  const langCode = dom.langSelect.value;
  showLoading(true);
  try {
    await ensureTranslation(langCode, cd.id);
  } catch (e) {
    console.warn('Translation load failed:', e.message);
    // non-fatal — verse text will show [No text available]
  }
  showLoading(false);

  state.isPlaying = true;
  setPlayingUI(true);
  document.dispatchEvent(new Event('playback-started'));
  playCurrentVerse();
}

// ---- Load translation JSON and index by surah_ayah ----
async function ensureTranslation(langCode, surahId) {
  const cacheKey = `${langCode}_${surahId}`;
  if (state.transCache[cacheKey]) return; // already loaded

  const tr   = TRANSLATIONS.find(t => t.code === langCode);
  if (!tr) return;

  const url  = DATA_BASE + tr.file;
  // Fetch full file (or from sessionStorage)
  const data = await fetchWithCache(url, `qma_trans_${langCode}`);

  // Schema: { "verses": [ { "chapter": N, "verse": N, "text": "..." } ] }
  const verses = data.verses || [];

  // Index only the verses we need for this surah (fast lookup later)
  const index = {};
  for (const v of verses) {
    if (v.chapter === surahId) {
      index[`${v.chapter}_${v.verse}`] = v.text;
    }
  }
  state.transCache[cacheKey] = index;
}

function getVerseText(langCode, surah, ayah) {
  const cacheKey = `${langCode}_${surah}`;
  const index    = state.transCache[cacheKey];
  if (!index) return '';
  return index[`${surah}_${ayah}`] || '';
}

// ---- Build audio URL from everyayah.com ----
function getAudioUrl(surah, ayah) {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `${AUDIO_BASE}${dom.reciterSelect.value}/${s}${a}.mp3`;
}

function playCurrentVerse() {
  if (!state.isPlaying) return;

  const { surah, ayah } = state.playlist[state.playIndex];
  const langCode = dom.langSelect.value;
  const text     = getVerseText(langCode, surah, ayah);

  // Verse text + direction
  const tr    = TRANSLATIONS.find(t => t.code === langCode);
  const isRTL = tr ? tr.rtl : true;
  dom.verseText.textContent = text || `${surah}:${ayah}`;
  dom.verseText.classList.toggle('ltr-lang', !isRTL);
  dom.verseText.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  dom.verseText.style.fontSize = state.fontSize + 'px';

  // Reference line
  const cd = state.chapters.find(c => c.id === surah);
  const chName = cd
  ? (state.uiLang === 'ar' ? cd.name : cd.transliteration)
  : String(surah);
  const repLabel = state.uiLang === 'ar' ? 'تكرار' : 'Repeat';
  dom.verseRef.textContent =
  `${chName} ${surah}:${ayah}  •  ${repLabel} ${state.repeatIndex + 1}/${state.totalRepeat}`;

  // Progress bar
  const done  = state.repeatIndex * state.playlist.length + state.playIndex + 1;
  const total = state.playlist.length * state.totalRepeat;
  dom.progressBar.style.width   = ((done / total) * 100) + '%';
  dom.progressCount.textContent = `${done} / ${total}`;
  const verseWord = state.uiLang === 'ar' ? 'آية' : 'Verse';
  dom.progressLabel.textContent = `${verseWord} ${surah}:${ayah}`;

  // Audio — everyayah.com URL; SW will cache it on first fetch
  if (state.audio) {
    state.audio.pause();
    state.audio.onended = null;
    state.audio.onerror = null;
    state.audio.src = '';
  }
  const audio = new Audio(getAudioUrl(surah, ayah));
  audio.onended = onVerseEnded;
  audio.onerror = onAudioError;
  state.audio   = audio;

  audio.play().catch(err => {
    console.error('play() failed:', err);
    // Autoplay policy — skip after brief delay
    setTimeout(onVerseEnded, 150);
  });
}

function onVerseEnded() {
  state.playIndex++;
  if (state.playIndex >= state.playlist.length) {
    state.repeatIndex++;
    if (state.repeatIndex >= state.totalRepeat) {
      stopPlayback();
      toast('Playback complete 🎉', 'success');
      return;
    }
    state.playIndex = 0;
  }
  playCurrentVerse();
}

function onAudioError() {
  console.warn('Audio error — skipping verse');
  onVerseEnded();
}

function stopPlayback() {
  state.isPlaying = false;
  if (state.audio) {
    state.audio.pause();
    state.audio.onended = null;
    state.audio.onerror = null;
    state.audio.src = '';
    state.audio = null;
  }
  setPlayingUI(false);
  dom.progressBar.style.width   = '0%';
  dom.progressCount.textContent = '0 / 0';
  const isRTL = state.uiLang === 'ar';
  dom.progressLabel.textContent = isRTL ? 'جاهز' : 'Ready';
}

function setPlayingUI(playing) {
  const isRTL = state.uiLang === 'ar';
  dom.playBtn.textContent = playing
  ? t('button.stop', '■  Stop Playback')
  : t('button.play', '▶  Start Playback');
  dom.playBtn.classList.toggle('stop',    playing);
  dom.playBtn.classList.toggle('playing', playing);
  dom.statusBadge.classList.toggle('active', playing);
  dom.statusText.textContent = playing
  ? (isRTL ? 'تشغيل' : 'Playing')
  : (isRTL ? 'في الانتظار' : 'Idle');
}

// =====================================================================
//  Toast
// =====================================================================
function toast(msg, type = '') {
  const el = dom.toast;
  el.textContent = msg;
  el.className   = 'show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

// =====================================================================
//  Service Worker
// =====================================================================
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('SW reg failed:', err);
    });
  }
}

// =====================================================================
//  Start
// =====================================================================
boot();
