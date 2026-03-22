# Quran Memorization Assistant — PWA

A Progressive Web App companion to the [QMA desktop app](https://github.com/bouness/Quran-Memorization-Assistant), sharing the **same JSON data assets**.

## Live Demo

Once deployed: `https://bouness.github.io/qmapp/`

## How it works

| Data | Source |
|------|--------|
| Chapter list | `assets/data/chapters.json` (your existing file) |
| Arabic text | `assets/data/quran.json` |
| Translations | `assets/data/editions/*.json` |
| UI strings | `assets/lang/en.json`, `assets/lang/ar.json` |
| Audio | `https://everyayah.com/data/<reciter>/<surah><ayah>.mp3` |

Audio is **cached by the Service Worker** on first play — verses play offline after that.


## Features

- 🎧 8 reciters via EveryAyah.com
- 📖 All translations from your existing edition JSON files
- 🔁 Configurable verse range + repetitions
- 🌗 Dark / Light theme
- 🌐 English / Arabic UI (driven by `assets/lang/*.json`)
- 📱 Installable PWA — add to home screen
- ✈️ Offline audio playback after first listen
