# Quran Memorization Assistant — PWA

A Progressive Web App companion to the [QMA desktop app](https://github.com/bouness/Quran-Memorization-Assistant), sharing the **same JSON data assets**. Works fully **offline** on phones, tablets and PCs once the content is downloaded.

## Live Demo

[https://bouness.github.io/qmapp/](https://bouness.github.io/qmapp/)

## Features

- 🎧 Many reciters via EveryAyah.com
- 📖 Arabic text plus 11 translations/transliteration (all stored locally)
- 🔁 Configurable verse range + repetitions
- 🌗 Dark / Light theme
- 🌐 English / Arabic UI (driven by `assets/lang/*.json`)
- 📱 Installable PWA — add to home screen
- ✈️ **Full offline use** — app, text, translations, fonts and audio
- 🔍 **Search** — find verses by Arabic text, translation, surah name or reference, and get the surah and verse numbers
- ⬇️ **Offline panel** — choose exactly what to download to your device
- 🔆 **Keep screen on** while listening (or whenever the app is open)

## How it works

| Data | Source |
|------|--------|
| Chapter list | `assets/data/chapters.json` |
| Arabic text | `assets/data/quran.json` |
| Translations | `assets/data/editions/*.json` |
| UI strings | `assets/lang/en.json`, `assets/lang/ar.json` |
| Audio | `https://everyayah.com/data/<reciter>/<surah><ayah>.mp3` |

## Offline use

1. Open the app once while online and reload it once (this installs the service worker).
2. The app, Arabic text, English translation, UI strings and icons are saved automatically (~3 MB).
3. Tap **⬇️** in the header:
   - **Download all translations + fonts** (~16 MB) saves the remaining translations and the Arabic/UI fonts.
   - **Download audio** saves verses for the selected reciter: the current verse range, the whole chapter, or all 114 chapters (large, several hundred MB).
   - Downloaded audio can be deleted per reciter or all at once. The panel shows storage used and verses saved.
4. Audio you play while online is also saved automatically for next time.

Audio is stored per reciter — download again after switching reciters.

### Where is the audio saved?

| Browser | Location |
|---------|----------|
| **Desktop Chrome, Edge, Brave, Opera** | Your choice. In ⬇️ → *Where audio is saved* press **Choose a folder…** (for example *Music*). The app creates `QMAPP/<reciter>/001001.mp3 …` inside it. These are normal `.mp3` files you can see, copy and back up, and the app looks there **before** downloading or streaming. After a browser restart you may need to press **Allow access** once. Use **Move browser-saved audio into the folder** to relocate audio you downloaded earlier. |
| **Firefox, Safari, Android, iPhone/iPad** | Browsers do not allow web apps to write to a chosen folder, so audio is kept in the browser's storage for this site (not visible in a file manager). |

⚠️ Browser storage is **erased when you clear the site's data or the browser cache** (including "clear cache" used to force an update). The panel shows whether the browser has marked the storage as protected; installing the app (*Add to Home Screen* / *Install*) makes that more likely. If you need audio to survive clearing, use the folder option on desktop.

### Notes by platform

- **Android / PC (Chrome, Edge):** works as described. Installing the app is optional.
- **iPhone / iPad:** Safari may delete saved site data after ~7 days without use. Use *Share → Add to Home Screen* to keep it.
- **Storage:** the app asks the browser to keep the data persistent; free space on the device is the limit.

## Search

Tap **🔍** in the header and type any of:

| You type | You get |
|----------|---------|
| Arabic words, with or without diacritics (`الرحمن`, `الحمد لله`) | Every verse containing them, with the match highlighted |
| A translation word or phrase (`mercy`, `patience`) | Matching verses in the selected translation, with the Arabic below |
| A surah name in Arabic or Latin letters (`Baqarah`, `البقرة`) | The surah, ready to select or play |
| A reference (`2:255`, `18:1-10`) or a surah number (`112`) | Those verses or that surah |

Each result shows **Surah N · Verse N** (for example `2:255`) and has three buttons:
**Copy** copies the reference, **Select** fills in the chapter and verse range in the player, and **Play** selects it and starts listening.

- Language is detected automatically from what you type, or you can pick one from the dropdown.
- Matching ignores diacritics, hamza and alef forms, and letter case.
- Several words match verses containing all of them; verses with the exact phrase are listed first.
- Search works offline. Arabic text is always available; other languages need to be downloaded from the ⬇️ panel.

## Keep screen on

*Settings → Keep screen on* uses the Screen Wake Lock API:

| Option | Behavior |
|--------|----------|
| While listening (default) | Screen stays on only while playback is running |
| Whenever the app is open | Screen stays on as long as the app is visible |
| Off | Normal device screen timeout |

The browser releases the lock when the app is hidden and the app takes it again when you return. Requires iOS 16.4+ (Home Screen app: iOS 18.4+), and Android battery saver can block it.

## Troubleshooting

- **Downloaded audio disappeared:** it was stored in browser storage, which is erased by *Clear site data / Clear cache*, by uninstalling the browser, and (rarely) by the browser when the device is very low on space. Download again, and on desktop Chrome/Edge use the folder option.
- **Audio cuts off or skips (Chrome/Edge):** reload the page twice so the latest version is active. The app now deletes any unreadable saved verse and streams it instead. If it still happens, open DevTools (F12) → Console and send the message that starts with *Audio error*.
- **Audio won't download:** the panel tests one file first. If it reports that EveryAyah blocks downloads (no CORS headers), audio can't be stored from a web page; see the developer notes below.
- **Old version showing:** close all tabs/the app and reopen; the new service worker activates on the next load.
- **Reset everything:** browser site settings → clear data for the site.

## For developers

| File | Purpose |
|------|---------|
| `audio-store.js` | Audio storage: device folder (File System Access API) + browser storage, validation of saved files |
| `sw.js` | Service worker: precaches app files and caches fonts (audio requests are left alone) |
| `search.js` | 🔍 Search (text, surah name, `surah:verse` references) |
| `offline-i18n.js` | English / Arabic strings for search, offline panel and keep-screen-on |
| `offline.js` | ⬇️ Offline panel (translations, fonts, audio download/delete) |
| `wake.js` | Keep-screen-on setting |
| `scripts/make-manifest.js` | Generates `precache-manifest.json` (list of files to precache) |
| `.github/workflows/main.yml` | Builds the manifest, stamps `__VERSION__` in `sw.js` with the commit SHA, deploys to GitHub Pages |

- Every deploy gets a new service-worker version automatically, so users receive updates on their next visit. Downloaded audio is kept across updates.
- Adding a new data file under `assets/` needs no code change; the manifest is regenerated on deploy. New translations must also be added to `TRANSLATIONS` in `app.js`.
- Audio playback is handled in `app.js` + `audio-store.js`: saved verses (device folder first, then the `qma-audio` cache) play as in-memory blobs, so there are no Range-request quirks between browsers; unsaved verses stream directly from EveryAyah and a copy is saved in the background. Unreadable saved files are deleted and replaced by streaming.
- New app versions reload the page once when the new service worker takes over (after playback stops).
- Audio is only stored when the server allows cross-origin reads (CORS). Opaque responses are deliberately not cached because browsers count each as ~7 MB of quota.
- To test locally, serve over `http://localhost` (service workers require HTTPS or localhost). Without the Action, `__VERSION__` stays literal, which is fine for development.

## License

MIT
