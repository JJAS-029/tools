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


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    play(); pause()
    skip(forward=True); skip(forward=False)
    vol(plus=True); vol(plus=False)
    m_music(); m_camera(); m_qr(); m_nav(); m_notes(); m_mic(); m_list()
    print(f"Icons written to {OUT}")
