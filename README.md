# Quran Memorization Assistant — PWA

A Progressive Web App companion to the [QMA desktop app](https://github.com/bouness/Quran-Memorization-Assistant), sharing the **same JSON data assets**. Works fully **offline** on phones, tablets and PCs once the content is downloaded.

## Live Demo

[Quran-Memorization-Assistant](https://bouness.github.io/qmapp/)

## Features

- 🎧 Many reciters via [EveryAyah.com](https://everyayah.com)
- 📖 Arabic text plus 11 translations/transliteration (all stored locally)
- 🔁 Configurable verse range + repetitions
- 🌗 Dark / Light theme
- 🌐 English / Arabic UI (driven by `assets/lang/*.json`)
- 📱 Installable PWA — add to home screen
- ✈️ **Full offline use** — app, text, translations, fonts and audio
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

### Notes by platform

- **Android / PC (Chrome, Edge):** works as described. Installing the app is optional.
- **iPhone / iPad:** Safari may delete saved site data after ~7 days without use. Use *Share → Add to Home Screen* to keep it.
- **Storage:** the app asks the browser to keep the data persistent; free space on the device is the limit.

## Keep screen on

*Settings → Keep screen on* uses the Screen Wake Lock API:

| Option | Behavior |
|--------|----------|
| While listening (default) | Screen stays on only while playback is running |
| Whenever the app is open | Screen stays on as long as the app is visible |
| Off | Normal device screen timeout |

The browser releases the lock when the app is hidden and the app takes it again when you return. Requires iOS 16.4+ (Home Screen app: iOS 18.4+), and Android battery saver can block it.

## Troubleshooting

- **Audio won't download:** the panel tests one file first. If it reports that EveryAyah blocks downloads (no CORS headers), audio can't be stored from a web page; see the developer notes below.
- **Old version showing:** close all tabs/the app and reopen; the new service worker activates on the next load.
- **Reset everything:** browser site settings → clear data for the site.

## For developers

| File | Purpose |
|------|---------|
| `sw.js` | Service worker: precaches app files, caches fonts, stores audio in its own cache with Range-request support |
| `offline.js` | ⬇️ Offline panel (translations, fonts, audio download/delete) |
| `wake.js` | Keep-screen-on setting |
| `scripts/make-manifest.js` | Generates `precache-manifest.json` (list of files to precache) |
| `.github/workflows/main.yml` | Builds the manifest, stamps `__VERSION__` in `sw.js` with the commit SHA, deploys to GitHub Pages |

- Every deploy gets a new service-worker version automatically, so users receive updates on their next visit. Downloaded audio is kept across updates.
- Adding a new data file under `assets/` needs no code change; the manifest is regenerated on deploy. New translations must also be added to `TRANSLATIONS` in `app.js`.
- Audio is only stored when the server allows cross-origin reads (CORS). Opaque responses are deliberately not cached because browsers count each as ~7 MB of quota.
- To test locally, serve over `http://localhost` (service workers require HTTPS or localhost). Without the Action, `__VERSION__` stays literal, which is fine for development.

## License

MIT
