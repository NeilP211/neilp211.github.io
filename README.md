# neilp211.github.io

My personal website, built as a deliberate 1999 GeoCities time capsule. Flaming
GIF borders, a spinning globe, an "under construction" sign, a hit counter, a
guestbook, Comic Sans, and a chiptune "MIDI" button. The design is the joke. The
projects are real.

Live at <https://neilp211.github.io>.

## What is in here

| File | What it is |
|---|---|
| `index.html` | Home page |
| `projects.html` | The seven real projects (distkv, neuropeek, exfil, runway, crypt, LookBetter, fortnut-2) |
| `guestbook.html` | A localStorage-backed guestbook |
| `about.html` | Bio, stack, and contact links |
| `retro.css` | The deliberate-atrocity stylesheet |
| `retro.js` | Web Audio chiptune, hit counter, guestbook, scrolling status bar |
| `assets/` | Animated GIFs, all generated from scratch |
| `tools/make_gifs.py` | Pillow script that draws every GIF in `assets/` |

## How the 1999-isms work in a 2026 browser

- **MIDI music**: real `<bgsound>` MIDI is long dead, so the "PLAY MIDI" button
  synthesizes a square-wave chiptune live with the Web Audio API. Autoplay is
  blocked by browsers, so it waits for a click, which is also period-accurate.
- **GIFs**: every animated GIF is drawn from scratch by `tools/make_gifs.py` and
  committed to `assets/`, so nothing hotlinks to a dead mirror.
- **Hit counter and guestbook**: backed by `localStorage`, no server required.

## Regenerating the assets

```bash
python3 tools/make_gifs.py   # needs Pillow
```

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
