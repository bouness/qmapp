// =====================================================================
//  QMA — strings for the Offline panel and Keep-screen-on setting (en / ar)
//  Loaded before offline.js and wake.js. To add a language, add a block to D.
//  Placeholders like {n} are filled by qmaT('key', { n: 5 }).
// =====================================================================
(() => {
  const D = {
    en: {
      off_btn: 'Offline downloads',
      off_title: '⬇️ Offline use',
      online: 'You are online.', offline: 'You are offline.',
      storage: 'Storage used: {used} MB of {quota} MB.',
      h_text: '1 · App, Arabic text & translations',
      note_text: 'The app and Arabic text are saved automatically. Save every translation and the fonts too:',
      btn_text: 'Download all translations + fonts (~16 MB)',
      h_audio: '2 · Audio',
      reciter_info: 'Reciter: {name}\nVerses saved for this reciter: {n}',
      scope_range: 'Current verse range', scope_surah: 'Whole current chapter', scope_all: 'All 114 chapters (large)',
      btn_audio: 'Download audio for selected reciter',
      del_rec: 'Delete audio of this reciter', del_all: 'Delete ALL downloaded audio',
      note_auto: 'Audio you play while online is also saved automatically for next time.',
      close: 'Close',
      st_trans: 'Translations {d}/{t}', st_failed: ' ({f} failed)', st_fonts: 'Fonts…',
      st_text_partial: 'Done, but {f} item(s) failed. Press again to retry.',
      st_text_ok: 'Translations and fonts saved ✓',
      st_fail: 'Download failed: {e}',
      confirm_big: '{n} verse files will be downloaded. This can be several hundred MB. Continue?',
      st_check: 'Checking server…',
      st_cors: '✗ everyayah.com does not allow web pages to download its audio (no CORS headers), so it cannot be saved for offline use from this site.',
      st_http: '✗ Server answered {s} for this reciter/verse.',
      st_audio: 'Audio {d}/{t}',
      st_audio_partial: 'Finished — {f} file(s) failed. Press again to retry.',
      st_audio_ok: 'Saved {n} verses ✓ — works offline now',
      st_quota: '✗ Storage is full. Free some space and try again.',
      st_deleted: 'Deleted {n} verses',
      confirm_del: 'Delete all downloaded audio?', st_all_deleted: 'All audio deleted',
      wake_label: '🔆 Keep screen on',
      wake_playing: 'While listening (playback active)', wake_always: 'Whenever the app is open', wake_off: 'Off',
      wake_unsupported: 'Not supported by this browser — please update it.',
      wake_on: 'Screen will stay on ✓',
      wake_blocked: 'Could not keep screen on (battery saver?)',
    },
    ar: {
      off_btn: 'التنزيلات دون اتصال',
      off_title: '⬇️ الاستخدام دون اتصال',
      online: 'أنت متصل بالإنترنت.', offline: 'أنت غير متصل بالإنترنت.',
      storage: 'المساحة المستخدمة: {used} م.ب من {quota} م.ب.',
      h_text: '1 · التطبيق والنص العربي والترجمات',
      note_text: 'يُحفظ التطبيق والنص العربي تلقائيًا. احفظ أيضًا جميع الترجمات والخطوط:',
      btn_text: 'تنزيل جميع الترجمات والخطوط (حوالي 16 م.ب)',
      h_audio: '2 · الصوت',
      reciter_info: 'القارئ: {name}\nعدد الآيات المحفوظة لهذا القارئ: {n}',
      scope_range: 'نطاق الآيات الحالي', scope_surah: 'السورة الحالية كاملة', scope_all: 'جميع السور الـ114 (حجم كبير)',
      btn_audio: 'تنزيل الصوت للقارئ المحدد',
      del_rec: 'حذف صوت هذا القارئ', del_all: 'حذف كل الصوت المنزَّل',
      note_auto: 'الصوت الذي تشغّله أثناء الاتصال يُحفظ أيضًا تلقائيًا للمرة القادمة.',
      close: 'إغلاق',
      st_trans: 'الترجمات {d}/{t}', st_failed: ' (فشل {f})', st_fonts: 'الخطوط…',
      st_text_partial: 'اكتمل، لكن فشل {f} عنصر. اضغط مرة أخرى لإعادة المحاولة.',
      st_text_ok: 'تم حفظ الترجمات والخطوط ✓',
      st_fail: 'فشل التنزيل: {e}',
      confirm_big: 'سيتم تنزيل {n} ملفًا صوتيًا، وقد يصل الحجم إلى مئات الميغابايت. هل تريد المتابعة؟',
      st_check: 'جارٍ فحص الخادم…',
      st_cors: '✗ موقع everyayah.com لا يسمح لصفحات الويب بتنزيل الصوت، لذلك لا يمكن حفظه للاستخدام دون اتصال من هذا الموقع.',
      st_http: '✗ أجاب الخادم برمز {s} لهذا القارئ/الآية.',
      st_audio: 'الصوت {d}/{t}',
      st_audio_partial: 'انتهى — فشل {f} ملف. اضغط مرة أخرى لإعادة المحاولة.',
      st_audio_ok: 'تم حفظ {n} آية ✓ — يعمل الآن دون اتصال',
      st_quota: '✗ مساحة التخزين ممتلئة. أفرغ بعض المساحة وحاول مجددًا.',
      st_deleted: 'تم حذف {n} آية',
      confirm_del: 'حذف كل الصوت المنزَّل؟', st_all_deleted: 'تم حذف كل الصوت',
      wake_label: '🔆 إبقاء الشاشة مضاءة',
      wake_playing: 'أثناء الاستماع (عند التشغيل)', wake_always: 'طوال فتح التطبيق', wake_off: 'إيقاف',
      wake_unsupported: 'غير مدعوم في هذا المتصفح — يُرجى تحديثه.',
      wake_on: 'ستبقى الشاشة مضاءة ✓',
      wake_blocked: 'تعذّر إبقاء الشاشة مضاءة (ربما وضع توفير الطاقة؟)',
    },
  };
  const lang = () => (typeof state !== 'undefined' && state.uiLang) || document.documentElement.lang || 'en';
  window.qmaT = (k, v = {}) =>
    ((D[lang()] && D[lang()][k]) || D.en[k] || k).replace(/\{(\w+)\}/g, (_, n) => (v[n] ?? ''));
  // run fn whenever the app switches UI language (app.js sets <html lang>)
  window.qmaOnLang = fn => new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
