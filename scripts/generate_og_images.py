# -*- coding: utf-8 -*-
"""
Generate the default Open Graph images (1200x630 PNG):
    assets/og/default-ko.png  (Korean pages)
    assets/og/default-en.png  (English pages)

Pages whose og:image / twitter:image pointed at files that never existed now
use these defaults (see scripts/fix_og_image_refs.py).

Font: Noto Sans KR variable font (SIL Open Font License). Pass a path with
the OG_FONT environment variable if it is not in a standard location.
Rendering is done at 2x and downsampled for smooth edges.
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT_DIR = os.path.join(ROOT, "assets", "og")
W, H = 1200, 630
S = 2  # supersampling factor

# Site palette (assets/css/styles.css, "Obsidian Precision")
BG_TOP = (12, 12, 14)        # --obsidian-950
BG_BOTTOM = (26, 26, 30)     # --obsidian-800
RING = (46, 46, 52)          # --obsidian-600
TEXT = (236, 236, 239)       # --obsidian-50
TEXT_2 = (160, 160, 174)     # --obsidian-200
TEXT_3 = (113, 113, 126)     # --obsidian-300
AMBER = (255, 107, 44)       # --amber-500
TEAL = (0, 212, 170)         # --teal-500

COPY = {
    "ko": {
        "title": "TimerTools Pro",
        "tagline": "무료 온라인 타이머",
        "sub": "뽀모도로 · 요리 · 운동 · 분·초 타이머",
    },
    "en": {
        "title": "TimerTools Pro",
        "tagline": "Free online timers",
        "sub": "Pomodoro · Cooking · Workout · Countdown",
    },
}

FONT_CANDIDATES = [
    os.environ.get("OG_FONT", ""),
    r"C:\Windows\Fonts\NotoSansKR-VF.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansKR-VF.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    os.path.expanduser("~/Library/Fonts/NotoSansKR-VF.ttf"),
]


def font(size, weight="Regular"):
    for path in FONT_CANDIDATES:
        if path and os.path.exists(path):
            f = ImageFont.truetype(path, size * S)
            try:
                f.set_variation_by_name(weight)
            except Exception:
                pass  # static font: weight is fixed
            return f
    raise SystemExit("Noto Sans KR font not found; set OG_FONT=/path/to/font")


def background():
    img = Image.new("RGB", (W * S, H * S), BG_TOP)
    px = ImageDraw.Draw(img)
    for y in range(H * S):
        t = y / (H * S - 1)
        c = tuple(round(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3))
        px.line([(0, y), (W * S, y)], fill=c)
    # soft amber glow behind the dial
    glow = Image.new("L", (W * S, H * S), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy, r = 930 * S, 315 * S, 290 * S
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(110 * S))
    amber = Image.new("RGB", (W * S, H * S), AMBER)
    return Image.composite(amber, img, glow)


def draw_dial(d):
    cx, cy = 930 * S, 315 * S
    r_out = 190 * S
    width = 22 * S
    box = [cx - r_out, cy - r_out, cx + r_out, cy + r_out]
    d.ellipse(box, outline=RING, width=width)
    # progress arc: 75 % remaining, starting at 12 o'clock
    d.arc(box, start=-90, end=-90 + 270, fill=AMBER, width=width)
    # rounded end caps
    for ang in (-90, 180):
        a = math.radians(ang)
        rr = r_out - width / 2
        x, y = cx + rr * math.cos(a), cy + rr * math.sin(a)
        d.ellipse([x - width / 2, y - width / 2, x + width / 2, y + width / 2], fill=AMBER)
    # minute ticks
    r_tick_o, r_tick_i = 148 * S, 135 * S
    for i in range(12):
        a = math.radians(i * 30 - 90)
        w = 5 * S if i % 3 == 0 else 3 * S
        d.line([(cx + r_tick_i * math.cos(a), cy + r_tick_i * math.sin(a)),
                (cx + r_tick_o * math.cos(a), cy + r_tick_o * math.sin(a))], fill=RING, width=w)
    f = font(72, "Bold")
    text = "25:00"
    bb = d.textbbox((0, 0), text, font=f)
    d.text((cx - (bb[2] - bb[0]) / 2 - bb[0], cy - (bb[3] - bb[1]) / 2 - bb[1]), text, font=f, fill=TEAL)


def render(lang):
    c = COPY[lang]
    img = background()
    d = ImageDraw.Draw(img)
    x = 80 * S
    d.text((x, 150 * S), "GON.AI", font=font(30, "Bold"), fill=AMBER)
    d.text((x, 192 * S), c["title"], font=font(76, "Bold"), fill=TEXT)
    d.text((x, 312 * S), c["tagline"], font=font(46, "Bold"), fill=TEXT)
    d.text((x, 384 * S), c["sub"], font=font(28, "Regular"), fill=TEXT_2)
    d.rounded_rectangle([x, 470 * S, x + 64 * S, 476 * S], radius=3 * S, fill=AMBER)
    d.text((x, 496 * S), "gon.ai.kr", font=font(28, "Medium"), fill=TEXT_3)
    draw_dial(d)
    out = img.resize((W, H), Image.LANCZOS)
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, "default-%s.png" % lang)
    out.save(path, "PNG", optimize=True)
    print("wrote %s (%dx%d, %d bytes)" % (os.path.relpath(path, ROOT), out.width, out.height, os.path.getsize(path)))


if __name__ == "__main__":
    for lang in ("ko", "en"):
        render(lang)
