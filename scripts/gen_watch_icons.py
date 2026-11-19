"""Generate the watch app's PNG icons (white on transparent, anti-aliased).

Usage: python scripts/gen_watch_icons.py
Output: watch/entry/src/main/js/MainAbility/common/images/*.png
"""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "watch/entry/src/main/js/MainAbility/common/images"
SS = 4  # supersampling factor
W = (255, 255, 255, 255)


def canvas(size):
    img = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img), size * SS


def save(img, size, name):
    img.resize((size, size), Image.LANCZOS).save(OUT / f"{name}.png")


def play(size=64):
    img, d, s = canvas(size)
    d.polygon([(s * .30, s * .20), (s * .30, s * .80), (s * .80, s * .50)], fill=W)
    save(img, size, "play")


def pause(size=64):
    img, d, s = canvas(size)
    d.rounded_rectangle([s * .26, s * .20, s * .42, s * .80], radius=s * .04, fill=W)
    d.rounded_rectangle([s * .58, s * .20, s * .74, s * .80], radius=s * .04, fill=W)
    save(img, size, "pause")


def skip(size=48, forward=True):
    img, d, s = canvas(size)
    tri = [(s * .18, s * .22), (s * .18, s * .78), (s * .62, s * .50)]
    d.polygon(tri, fill=W)
    d.rounded_rectangle([s * .66, s * .22, s * .78, s * .78], radius=s * .03, fill=W)
    if not forward:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    save(img, size, "next" if forward else "prev")


def vol(size=40, plus=True):
    img, d, s = canvas(size)
    t = s * .10
    d.rounded_rectangle([s * .15, s * .5 - t / 2, s * .85, s * .5 + t / 2], radius=t / 2, fill=W)
    if plus:
        d.rounded_rectangle([s * .5 - t / 2, s * .15, s * .5 + t / 2, s * .85], radius=t / 2, fill=W)
    save(img, size, "vol_up" if plus else "vol_down")


def m_music(size=56):
    img, d, s = canvas(size)
    lw = int(s * .08)
    d.ellipse([s * .14, s * .62, s * .40, s * .84], fill=W)
    d.ellipse([s * .56, s * .54, s * .82, s * .76], fill=W)
    d.line([(s * .37, s * .73), (s * .37, s * .22)], fill=W, width=lw)
    d.line([(s * .79, s * .65), (s * .79, s * .14)], fill=W, width=lw)
    d.polygon([(s * .33, s * .18), (s * .83, s * .08), (s * .83, s * .24), (s * .33, s * .34)], fill=W)
    save(img, size, "m_music")


def m_camera(size=56):
    img, d, s = canvas(size)
    d.rounded_rectangle([s * .10, s * .28, s * .90, s * .82], radius=s * .10, fill=W)
    d.rounded_rectangle([s * .34, s * .18, s * .66, s * .32], radius=s * .05, fill=W)
    d.ellipse([s * .32, s * .36, s * .68, s * .72], fill=(0, 0, 0, 0))
    d.ellipse([s * .40, s * .44, s * .60, s * .64], fill=W)
    save(img, size, "m_camera")


def m_qr(size=56):
    img, d, s = canvas(size)
    u = s / 9
    for cx, cy in ((1, 1), (5, 1), (1, 5)):
        d.rectangle([cx * u, cy * u, (cx + 3) * u, (cy + 3) * u], fill=W)
        d.rectangle([(cx + .6) * u, (cy + .6) * u, (cx + 2.4) * u, (cy + 2.4) * u], fill=(0, 0, 0, 0))
        d.rectangle([(cx + 1.1) * u, (cy + 1.1) * u, (cx + 1.9) * u, (cy + 1.9) * u], fill=W)
    for x, y in ((5, 5), (7, 5), (6, 6), (5, 7), (7, 7)):
        d.rectangle([x * u, y * u, (x + 1) * u, (y + 1) * u], fill=W)
    save(img, size, "m_qr")


def m_nav(size=56):
    img, d, s = canvas(size)
    d.polygon([(s * .50, s * .10), (s * .84, s * .88), (s * .50, s * .70), (s * .16, s * .88)], fill=W)
    save(img, size, "m_nav")


def m_notes(size=56):
    img, d, s = canvas(size)
    d.rounded_rectangle([s * .16, s * .10, s * .84, s * .90], radius=s * .10, fill=W)
    for y, x2 in ((.30, .70), (.46, .70), (.62, .56)):
        d.rounded_rectangle([s * .30, s * y, s * x2, s * (y + .07)], radius=s * .03, fill=(0, 0, 0, 0))
    save(img, size, "m_notes")


def m_mic(size=56):
    img, d, s = canvas(size)
    lw = int(s * .07)
    d.rounded_rectangle([s * .36, s * .08, s * .64, s * .58], radius=s * .14, fill=W)
    d.arc([s * .22, s * .26, s * .78, s * .72], start=0, end=180, fill=W, width=lw)
    d.line([(s * .50, s * .72), (s * .50, s * .88)], fill=W, width=lw)
    d.line([(s * .34, s * .88), (s * .66, s * .88)], fill=W, width=lw)
    save(img, size, "m_mic")


def m_list(size=56):
    img, d, s = canvas(size)
    for y in (.22, .44, .66):
        d.rounded_rectangle([s * .14, s * y, s * .60, s * (y + .09)], radius=s * .04, fill=W)
    d.polygon([(s * .66, s * .48), (s * .66, s * .86), (s * .90, s * .67)], fill=W)
    save(img, size, "m_list")


# ---------- Material 3 Expressive style tiles ----------
# Shape (circle, cookie, clover, sun, squircle...) in a pastel color with the
# icon glyph tinted dark on top, like Pixel Watch icons.
import math


def shape_points(kind, s, n_pts=720):
    cx = cy = s / 2
    R = s * 0.48
    pts = []
    for i in range(n_pts):
        t = 2 * math.pi * i / n_pts
        if kind == "circle":
            r = R
        elif kind.startswith("cookie"):  # scalloped edge, e.g. cookie9
            k = int(kind[6:])
            r = R * (0.92 + 0.08 * math.cos(k * t))
        elif kind == "clover":  # 4 rounded leaves
            r = R * (0.80 + 0.20 * abs(math.cos(2 * t)) ** 0.6)
        elif kind == "sunny":  # 8 soft points
            r = R * (0.88 + 0.12 * math.cos(8 * t))
        elif kind == "squircle":
            c, sn = math.cos(t), math.sin(t)
            r = R / ((abs(c) ** 4 + abs(sn) ** 4) ** 0.25)
        else:
            raise ValueError(kind)
        pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return pts


def tile(name, glyph, kind, bg, fg, size=84, glyph_size=46):
    img, d, s = canvas(size)
    d.polygon(shape_points(kind, s), fill=bg)
    g = Image.open(OUT / f"{glyph}.png").convert("RGBA").resize((glyph_size * SS, glyph_size * SS), Image.LANCZOS)
    tint = Image.new("RGBA", g.size, fg)
    tint.putalpha(g.getchannel("A"))
    off = (s - g.size[0]) // 2
    img.alpha_composite(tint, (off, off))
    save(img, size, name)


def hexc(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


# name, glyph, shape, container (pastel), glyph (dark)
TILES = [
    ("t_music", "m_music", "cookie9", "#9df5b0", "#00391c"),
    ("t_list", "m_list", "clover", "#c3f0b8", "#0f3a0c"),
    ("t_camera", "m_camera", "squircle", "#b4ccff", "#0a2a66"),
    ("t_qr", "m_qr", "sunny", "#d9c6ff", "#2e1066"),
    ("t_nav", "m_nav", "cookie6", "#ffcfa6", "#4a2200"),
    ("t_notes", "m_notes", "squircle", "#fbe38c", "#3d3000"),
    ("t_mic", "m_mic", "cookie12", "#ffb8b0", "#5c0d07"),
]


def flip_icon(size=48):
    """Two curved arrows (switch camera)."""
    img, d, s = canvas(size)
    lw = int(s * .09)
    d.arc([s * .16, s * .16, s * .84, s * .84], start=200, end=340, fill=W, width=lw)
    d.arc([s * .16, s * .16, s * .84, s * .84], start=20, end=160, fill=W, width=lw)
    d.polygon([(s * .76, s * .22), (s * .92, s * .40), (s * .70, s * .44)], fill=W)
    d.polygon([(s * .24, s * .78), (s * .08, s * .60), (s * .30, s * .56)], fill=W)
    save(img, size, "flip")


def timer_icon(size=40):
    """Stopwatch."""
    img, d, s = canvas(size)
    lw = int(s * .09)
    d.ellipse([s * .14, s * .20, s * .86, s * .92], outline=W, width=lw)
    d.rounded_rectangle([s * .38, s * .04, s * .62, s * .14], radius=s * .03, fill=W)
    d.line([(s * .50, s * .56), (s * .50, s * .34)], fill=W, width=lw)
    save(img, size, "timer")


def shutter(size=150, name="shutter", bg="#b4ccff", fg="#0a2a66"):
    """Big shutter: M3 cookie in light blue with a dark ring."""
    img, d, s = canvas(size)
    d.polygon(shape_points("cookie12", s), fill=hexc(bg))
    r = s * .26
    d.ellipse([s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r], outline=hexc(fg), width=int(s * .055))
    save(img, size, name)


def dark_controls():
    """Dark-glyph versions for buttons on light (pastel) backgrounds."""
    for src, dst, col in (("play", "play_d", "#00391c"), ("pause", "pause_d", "#00391c")):
        g = Image.open(OUT / f"{src}.png").convert("RGBA")
        tint = Image.new("RGBA", g.size, hexc(col))
        tint.putalpha(g.getchannel("A"))
        tint.save(OUT / f"{dst}.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    play(); pause()
    skip(forward=True); skip(forward=False)
    vol(plus=True); vol(plus=False)
    m_music(); m_camera(); m_qr(); m_nav(); m_notes(); m_mic(); m_list()
    for name, glyph, kind, bg, fg in TILES:
        tile(name, glyph, kind, hexc(bg), hexc(fg))
    dark_controls()
    flip_icon(); timer_icon()
    shutter(); shutter(name="shutter_busy", bg="#4a5670", fg="#1b2d52")
    print(f"Icons written to {OUT}")
