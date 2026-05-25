# Geocities Time Capsule: Personal Site Design

Date: 2026-05-25
Owner: Neil Patel (NeilP211)

## Concept

A deliberately atrocious 1999 Geocities-style personal website. The design is the
joke; the content is genuinely strong. The dissonance is the point: cutting-edge
projects (Raft engine, mechanistic interpretability, netcode shooter, GNN stylist)
presented through flaming GIFs, Comic Sans, blink tags, and a guestbook.

## Decisions (locked)

- Hosting: public repo named `neilp211.github.io`, deployed via GitHub Pages to
  `https://neilp211.github.io`.
- Guestbook + hit counter: cosmetic, backed by `localStorage` (no server).
- Tone: straight, impressive content. All comedy comes from the design.
- Layout: table-based fake "frameset" with a beveled left sidebar nav. Four real
  HTML pages so links and sharing work.

## Pages

- `index.html` - Home. Rainbow marquee title, "under construction", hit counter,
  "best viewed in Netscape Navigator 4.0 @ 800x600", last-updated, awards.
- `projects.html` - The good content. Seven real projects as garish beveled cards
  with blinking NEW badges, linking to the real GitHub repos:
  distkv, neuropeek, exfil, runway, crypt, LookBetter, fortnut-2.
- `guestbook.html` - Sign-the-guestbook form plus entries (localStorage,
  pre-seeded with vintage joke entries).
- `about.html` - Real bio, UNC / Computer Science, skill "stack", LinkedIn and
  email with a spinning email GIF.

## Making 1999 work in 2026 (no external deps, no hotlinks)

- MIDI music: vanilla Web Audio sequencer playing a square-wave chiptune loop
  behind a "PLAY MIDI / STOP" button (autoplay is blocked, so click to play).
  No audio file, no licensing concerns.
- Flaming borders, under-construction sign, spinning icons, animated dividers:
  real animated `.gif` files generated locally by `tools/make_gifs.py` (Pillow)
  and committed to `assets/`. Authentic, bundled, no rot.
- Hit counter: odometer digits, baseline `00013372`, increments via localStorage.
- Guestbook: form writes to localStorage, renders entries, pre-seeded.
- Comic Sans, blink, marquee, rainbow text, tiled background, custom cursor,
  status-bar message, webring footer, visitor counter: CSS plus classic tags.

## File layout

```
neilp211.github.io/
  index.html
  projects.html
  guestbook.html
  about.html
  retro.css
  retro.js
  assets/            generated gifs + background tile
  tools/make_gifs.py generator script
  docs/superpowers/specs/...
  README.md
```

## Tech and testing

Pure static HTML / CSS / vanilla JS, no build step. Verify by opening each page in
a real browser, screenshot the home page, confirm no console errors, then push and
enable GitHub Pages and confirm the live URL serves.

## Constraint

No em dashes or en dashes anywhere (per user hard rule). Plain hyphens only.
