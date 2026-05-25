#!/usr/bin/env python3
"""Generate the animated GIF assets for the Geocities time-capsule site.

Everything here is drawn from scratch with Pillow so the repo carries real,
self-hosted assets (no hotlinks to dead GeoCities mirrors). Run:

    python3 tools/make_gifs.py

Output lands in ../assets relative to this file.
"""

import math
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, "..", "assets"))
os.makedirs(ASSETS, exist_ok=True)

MAGENTA = (255, 0, 255)  # color key for transparency


def load_font(size):
    """Best-effort: Comic Sans if the box has it, then Arial Bold, then default."""
    candidates = [
        "/System/Library/Fonts/Supplemental/Comic Sans MS Bold.ttf",
        "/System/Library/Fonts/Supplemental/Comic Sans MS.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def save_opaque(frames, name, duration):
    """Save an animated GIF with no transparency (solid background)."""
    path = os.path.join(ASSETS, name)
    frames[0].save(
        path, save_all=True, append_images=frames[1:],
        duration=duration, loop=0, optimize=False,
    )
    print("wrote", name)


def save_transparent(frames_rgb, name, duration):
    """Save an animated GIF treating MAGENTA pixels as transparent.

    Reserves palette index 255 for the transparent color and uses full-frame
    disposal so frames do not smear into each other.
    """
    out = []
    for fr in frames_rgb:
        p = fr.convert("RGB").convert("P", palette=Image.ADAPTIVE, colors=255)
        # Build a mask of the color-key pixels and paint them to index 255.
        r, g, b = fr.convert("RGB").split()
        key = Image.eval(r, lambda v: 0)  # start all-black mask
        px = fr.convert("RGB").load()
        mask = Image.new("L", fr.size, 0)
        mpx = mask.load()
        for y in range(fr.height):
            for x in range(fr.width):
                if px[x, y] == MAGENTA:
                    mpx[x, y] = 255
        p.paste(255, mask)
        out.append(p)
    path = os.path.join(ASSETS, name)
    out[0].save(
        path, save_all=True, append_images=out[1:], duration=duration,
        loop=0, transparency=255, disposal=2, optimize=False,
    )
    print("wrote", name)


# --------------------------------------------------------------------------
# Favicon: a tiny navy tile with a yellow star (saved as multi-size .ico).
# --------------------------------------------------------------------------
def make_favicon():
    big = 64
    c = big // 2
    img = Image.new("RGB", (big, big), (8, 8, 60))
    d = ImageDraw.Draw(img)
    s = 26
    d.polygon([(c, c - s), (c + 5, c - 5), (c + s, c), (c + 5, c + 5),
               (c, c + s), (c - 5, c + 5), (c - s, c), (c - 5, c - 5)],
              fill=(255, 230, 60), outline=(255, 255, 255))
    img.save(os.path.join(ASSETS, "..", "favicon.ico"),
             sizes=[(16, 16), (32, 32), (48, 48)])
    print("wrote favicon.ico")


# --------------------------------------------------------------------------
# Background tile: navy starfield, 64x64, tiles seamlessly enough.
# --------------------------------------------------------------------------
def make_background():
    w = h = 64
    img = Image.new("RGB", (w, h), (8, 8, 40))
    d = ImageDraw.Draw(img)
    stars = [(6, 9), (20, 30), (41, 7), (55, 22), (13, 50), (33, 44),
             (50, 52), (27, 16), (60, 38), (4, 38)]
    for (x, y) in stars:
        d.point((x, y), fill=(255, 255, 255))
        if (x + y) % 3 == 0:  # a few twinkle as little plus shapes
            d.point((x + 1, y), fill=(150, 200, 255))
            d.point((x - 1, y), fill=(150, 200, 255))
            d.point((x, y + 1), fill=(150, 200, 255))
            d.point((x, y - 1), fill=(150, 200, 255))
    img.save(os.path.join(ASSETS, "bg_stars.png"))
    print("wrote bg_stars.png")


# --------------------------------------------------------------------------
# Flaming horizontal bar, tileable, black background (blends on dark page).
# --------------------------------------------------------------------------
def make_flames():
    w, h = 48, 44
    frames = []
    centers = [6, 18, 30, 42]
    for f in range(6):
        img = Image.new("RGB", (w, h), (0, 0, 0))
        d = ImageDraw.Draw(img)
        for i, cx in enumerate(centers):
            flick = math.sin((f + i) * 1.4) * 5
            base = h - 1
            # outer red tongue
            tip = 6 + flick
            d.polygon([(cx - 9, base), (cx, tip), (cx + 9, base)], fill=(200, 20, 0))
            # mid orange
            tip2 = 14 + flick
            d.polygon([(cx - 6, base), (cx, tip2), (cx + 6, base)], fill=(255, 130, 0))
            # inner yellow
            tip3 = 24 + flick
            d.polygon([(cx - 3, base), (cx, tip3), (cx + 3, base)], fill=(255, 235, 120))
        frames.append(img)
    save_opaque(frames, "flames.gif", 90)


# --------------------------------------------------------------------------
# UNDER CONSTRUCTION sign with scrolling hazard stripes.
# --------------------------------------------------------------------------
def make_construction():
    w, h = 280, 44
    band = 9
    font = load_font(18)
    frames = []
    yellow = (255, 216, 0)
    black = (0, 0, 0)
    for f in range(8):
        off = f * 4
        img = Image.new("RGB", (w, h), yellow)
        d = ImageDraw.Draw(img)
        for (y0, y1) in [(0, band), (h - band, h)]:
            for x in range(-band, w + band, 18):
                d.line([(x - off, y1), (x - off + band, y0)], fill=black, width=9)
        d.rectangle([0, band, w, h - band], fill=yellow)
        text = "UNDER CONSTRUCTION"
        bbox = d.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        d.text(((w - tw) / 2, (h - th) / 2 - bbox[1]), text, fill=black, font=font)
        frames.append(img)
    save_opaque(frames, "construction.gif", 120)


# --------------------------------------------------------------------------
# Spinning WWW globe, transparent background.
# --------------------------------------------------------------------------
def make_globe():
    size = 40
    frames = []
    r = 17
    cx = cy = size // 2
    for f in range(10):
        img = Image.new("RGB", (size, size), MAGENTA)
        d = ImageDraw.Draw(img)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(20, 90, 200),
                  outline=(255, 255, 255))
        # latitude lines
        for yy in (-9, 0, 9):
            d.line([(cx - r + 2, cy + yy), (cx + r - 2, cy + yy)], fill=(120, 180, 255))
        # rotating meridians
        for k in range(3):
            phase = (f / 10.0 + k / 3.0) * 2 * math.pi
            mx = math.cos(phase)
            ell_w = abs(mx) * (r - 2)
            if ell_w > 1:
                d.arc([cx - ell_w, cy - r + 2, cx + ell_w, cy + r - 2], 0, 360,
                      fill=(120, 180, 255))
        # a little green landmass that drifts
        gx = cx + int(8 * math.cos(f / 10.0 * 2 * math.pi))
        d.ellipse([gx - 4, cy - 6, gx + 3, cy + 2], fill=(40, 170, 60))
        frames.append(img)
    save_transparent(frames, "globe.gif", 110)


# --------------------------------------------------------------------------
# Twinkling 4-point star, transparent.
# --------------------------------------------------------------------------
def make_star():
    size = 18
    c = size // 2
    frames = []
    for f in range(4):
        img = Image.new("RGB", (size, size), MAGENTA)
        d = ImageDraw.Draw(img)
        s = [2, 6, 8, 5][f]
        col = [(255, 255, 120), (255, 255, 255), (180, 230, 255), (255, 255, 200)][f]
        if s > 0:
            d.polygon([(c, c - s), (c + 1, c - 1), (c + s, c), (c + 1, c + 1),
                       (c, c + s), (c - 1, c + 1), (c - s, c), (c - 1, c - 1)],
                      fill=col)
        frames.append(img)
    save_transparent(frames, "star.gif", 160)


# --------------------------------------------------------------------------
# Small flickering flame bullet, transparent.
# --------------------------------------------------------------------------
def make_fire_bullet():
    w, h = 14, 18
    frames = []
    for f in range(5):
        img = Image.new("RGB", (w, h), MAGENTA)
        d = ImageDraw.Draw(img)
        flick = math.sin(f * 1.6) * 2
        cx = w // 2
        d.polygon([(cx - 5, h - 1), (cx, 3 + flick), (cx + 5, h - 1)], fill=(220, 30, 0))
        d.polygon([(cx - 3, h - 1), (cx, 8 + flick), (cx + 3, h - 1)], fill=(255, 150, 0))
        d.polygon([(cx - 1, h - 1), (cx, 12 + flick), (cx + 1, h - 1)], fill=(255, 240, 130))
        frames.append(img)
    save_transparent(frames, "fire_bullet.gif", 100)


# --------------------------------------------------------------------------
# NEW! starburst badge that pulses, transparent.
# --------------------------------------------------------------------------
def make_new_badge():
    size = 30
    c = size // 2
    font = load_font(9)
    frames = []
    for f in range(4):
        img = Image.new("RGB", (size, size), MAGENTA)
        d = ImageDraw.Draw(img)
        spikes = 10
        outer = [10, 12, 13, 12][f]
        inner = outer - 5
        pts = []
        for i in range(spikes * 2):
            ang = math.pi * i / spikes - math.pi / 2
            rad = outer if i % 2 == 0 else inner
            pts.append((c + rad * math.cos(ang), c + rad * math.sin(ang)))
        d.polygon(pts, fill=(230, 0, 0), outline=(255, 255, 0))
        bbox = d.textbbox((0, 0), "NEW", font=font)
        tw = bbox[2] - bbox[0]
        d.text((c - tw / 2, c - 5), "NEW", fill=(255, 255, 255), font=font)
        frames.append(img)
    save_transparent(frames, "new.gif", 220)


# --------------------------------------------------------------------------
# Animated rainbow divider bar, tileable horizontally.
# --------------------------------------------------------------------------
def make_divider():
    w, h = 64, 8
    frames = []
    for f in range(7):
        img = Image.new("RGB", (w, h), (0, 0, 0))
        d = ImageDraw.Draw(img)
        for x in range(w):
            hue = ((x + f * 9) % w) / w
            r = int(127 * (1 + math.sin(2 * math.pi * hue)))
            g = int(127 * (1 + math.sin(2 * math.pi * hue + 2.09)))
            b = int(127 * (1 + math.sin(2 * math.pi * hue + 4.18)))
            d.line([(x, 1), (x, h - 2)], fill=(r, g, b))
        frames.append(img)
    save_opaque(frames, "divider.gif", 90)


# --------------------------------------------------------------------------
# Bobbing email envelope with a blinking NEW MAIL dot, transparent.
# --------------------------------------------------------------------------
def make_email():
    w, h = 44, 30
    frames = []
    for f in range(4):
        img = Image.new("RGB", (w, h), MAGENTA)
        d = ImageDraw.Draw(img)
        bob = [0, -2, 0, 2][f]
        x0, y0, x1, y1 = 4, 6 + bob, 36, 26 + bob
        d.rectangle([x0, y0, x1, y1], fill=(255, 255, 240), outline=(0, 0, 0))
        d.line([(x0, y0), ((x0 + x1) / 2, (y0 + y1) / 2)], fill=(0, 0, 0))
        d.line([(x1, y0), ((x0 + x1) / 2, (y0 + y1) / 2)], fill=(0, 0, 0))
        if f % 2 == 0:  # blinking red "you have mail" dot
            d.ellipse([x1 - 6, y0 - 4, x1 + 4, y0 + 6], fill=(230, 0, 0))
        frames.append(img)
    save_transparent(frames, "email.gif", 200)


if __name__ == "__main__":
    make_favicon()
    make_background()
    make_flames()
    make_construction()
    make_globe()
    make_star()
    make_fire_bullet()
    make_new_badge()
    make_divider()
    make_email()
    print("done. assets in", ASSETS)
