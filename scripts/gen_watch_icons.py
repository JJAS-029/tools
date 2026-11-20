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


def shape_points(kind, s, n_pts=720, rot=0.0):
    cx = cy = s / 2
    R = s * 0.48
    pts = []
    for i in range(n_pts):
        t = 2 * math.pi * i / n_pts - rot
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
        pts.append((cx + r * math.cos(t + rot), cy + r * math.sin(t + rot)))
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
    ("t_music", "m_music", "cookie9", "#d0bcff", "#381e72"),
    ("t_list", "m_list", "clover", "#ffb0cd", "#5e1133"),
    ("t_camera", "m_camera", "squircle", "#b4ccff", "#0a2a66"),
    ("t_work", "m_work", "sunny", "#a6f2d1", "#003826"),
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


def rec_button(size=150, name="rec", bg="#ffb4ab", fg="#93000a", stop=False):
    """Video button: M3 cookie in light red with a dark red dot (record) or square (stop)."""
    img, d, s = canvas(size)
    d.polygon(shape_points("cookie12", s), fill=hexc(bg))
    if stop:
        r = s * .17
        d.rounded_rectangle([s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r], radius=s * .05, fill=hexc(fg))
    else:
        r = s * .21
        d.ellipse([s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r], fill=hexc(fg))
    save(img, size, name)


# ---------- Music: per-song palettes (Material You style) ----------
# accent (button/art), on (dark glyph), container (side pills), surface (track)
MUSIC_PALETTES = [
    ("#d0bcff", "#381e72", "#3b2f57", "#2b2633"),  # 0 lilac
    ("#ffb4a8", "#561e15", "#5a2e27", "#33201d"),  # 1 coral
    ("#a8c8ff", "#0a2f60", "#263a5c", "#1f2531"),  # 2 sky
    ("#ffd27a", "#402d00", "#4f4020", "#2f2a20"),  # 3 amber
    ("#ffb0cd", "#5e1133", "#5a2a3e", "#33202a"),  # 4 pink
    ("#80d5d0", "#003735", "#204a48", "#1c2b2a"),  # 5 teal
]
ART_SHAPES = ["cookie9", "sunny", "clover", "cookie12", "squircle", "cookie6"]


def heart(size=56):
    img, d, s = canvas(size)
    r = s * .21
    d.ellipse([s * .12, s * .18, s * .12 + 2 * r, s * .18 + 2 * r], fill=W)
    d.ellipse([s * .88 - 2 * r, s * .18, s * .88, s * .18 + 2 * r], fill=W)
    d.polygon([(s * .14, s * .44), (s * .86, s * .44), (s * .50, s * .86)], fill=W)
    save(img, size, "m_heart")


def tinted(src, dst, col):
    g = Image.open(OUT / f"{src}.png").convert("RGBA")
    t = Image.new("RGBA", g.size, hexc(col))
    t.putalpha(g.getchannel("A"))
    t.save(OUT / f"{dst}.png")


def music_assets():
    heart()
    for i, (acc, on, cont, surf) in enumerate(MUSIC_PALETTES):
        # big "art": per-song shape and color
        tile(f"art_{i}", "m_music", ART_SHAPES[i], hexc(acc), hexc(on), size=130, glyph_size=60)
        # small tiles for the playlist list
        tile(f"lt_{i}", "m_list", ART_SHAPES[i], hexc(acc), hexc(on), size=56, glyph_size=30)
        tinted("play", f"play_p{i}", on)
        tinted("pause", f"pause_p{i}", on)
    acc, on = MUSIC_PALETTES[4][0], MUSIC_PALETTES[4][1]
    tile("lt_heart", "m_heart", "cookie9", hexc(on), hexc(acc), size=56, glyph_size=28)
    tile("lt_play", "play", "circle", hexc(MUSIC_PALETTES[0][1]), hexc(MUSIC_PALETTES[0][0]), size=56, glyph_size=30)


# ---------- Batteries ----------
def m_batt(size=56):
    img, d, s = canvas(size)
    lw = int(s * .08)
    d.rounded_rectangle([s * .10, s * .26, s * .82, s * .74], radius=s * .10, outline=W, width=lw)
    d.rounded_rectangle([s * .84, s * .40, s * .92, s * .60], radius=s * .03, fill=W)
    d.rounded_rectangle([s * .20, s * .36, s * .56, s * .64], radius=s * .04, fill=W)
    save(img, size, "m_batt")


def m_bike(size=56):
    img, d, s = canvas(size)
    lw = int(s * .07)
    d.ellipse([s * .04, s * .48, s * .40, s * .84], outline=W, width=lw)
    d.ellipse([s * .60, s * .48, s * .96, s * .84], outline=W, width=lw)
    pts = [(s * .22, s * .66), (s * .42, s * .36), (s * .66, s * .36), (s * .78, s * .66)]
    d.line(pts, fill=W, width=lw, joint="curve")
    d.line([(s * .22, s * .66), (s * .50, s * .66), (s * .42, s * .36)], fill=W, width=lw, joint="curve")
    d.line([(s * .62, s * .22), (s * .72, s * .22), (s * .66, s * .36)], fill=W, width=lw)
    d.line([(s * .36, s * .30), (s * .48, s * .30)], fill=W, width=lw)
    save(img, size, "m_bike")


def m_watch(size=56):
    img, d, s = canvas(size)
    d.rounded_rectangle([s * .34, s * .04, s * .66, s * .30], radius=s * .05, fill=W)
    d.rounded_rectangle([s * .34, s * .70, s * .66, s * .96], radius=s * .05, fill=W)
    d.rounded_rectangle([s * .22, s * .20, s * .78, s * .80], radius=s * .16, fill=W)
    d.rounded_rectangle([s * .32, s * .30, s * .68, s * .70], radius=s * .09, fill=(0, 0, 0, 0))
    save(img, size, "m_watch")


def m_work(size=56):
    img, d, s = canvas(size)
    lw = int(s * .07)
    d.rounded_rectangle([s * .34, s * .14, s * .66, s * .34], radius=s * .06, outline=W, width=lw)
    d.rounded_rectangle([s * .10, s * .30, s * .90, s * .84], radius=s * .10, fill=W)
    d.rectangle([s * .10, s * .52, s * .90, s * .57], fill=(0, 0, 0, 0))
    save(img, size, "m_work")


def m_koala(size=56):
    img, d, s = canvas(size)
    d.ellipse([s * .02, s * .14, s * .38, s * .50], fill=W)
    d.ellipse([s * .62, s * .14, s * .98, s * .50], fill=W)
    d.ellipse([s * .18, s * .22, s * .82, s * .86], fill=W)
    clear = (0, 0, 0, 0)
    d.ellipse([s * .34, s * .44, s * .42, s * .52], fill=clear)
    d.ellipse([s * .58, s * .44, s * .66, s * .52], fill=clear)
    d.ellipse([s * .43, s * .52, s * .57, s * .72], fill=clear)
    save(img, size, "m_koala")


def m_bag(size=56):
    img, d, s = canvas(size)
    lw = int(s * .07)
    d.arc([s * .32, s * .08, s * .68, s * .44], start=180, end=360, fill=W, width=lw)
    d.rounded_rectangle([s * .14, s * .28, s * .86, s * .90], radius=s * .10, fill=W)
    save(img, size, "m_bag")


def battery_assets():
    m_batt(); m_bike(); m_watch(); m_work(); m_koala(); m_bag()
    amber, teal, coral, sky = MUSIC_PALETTES[3], MUSIC_PALETTES[5], MUSIC_PALETTES[1], MUSIC_PALETTES[2]
    tile("t_batt", "m_batt", "cookie9", hexc(amber[0]), hexc(amber[1]))
    tile("bt_bike", "m_bike", "cookie9", hexc(teal[0]), hexc(teal[1]), size=56, glyph_size=36)
    tile("bt_watch", "m_watch", "squircle", hexc(sky[0]), hexc(sky[1]), size=56, glyph_size=32)
    tile("u_0", "m_work", "squircle", hexc(sky[0]), hexc(sky[1]), size=56, glyph_size=30)
    tile("u_1", "m_koala", "cookie9", hexc(MUSIC_PALETTES[4][0]), hexc(MUSIC_PALETTES[4][1]), size=56, glyph_size=34)
    tile("u_2", "m_bag", "clover", hexc(amber[0]), hexc(amber[1]), size=56, glyph_size=28)
    tile("bt_charge", "m_batt", "circle", hexc(teal[1]), hexc(teal[0]), size=56, glyph_size=34)


# ---------- Work (Mi jornada) ----------
def m_coin(size=56):
    img, d, s = canvas(size)
    lw = int(s * .09)
    d.line([(s * .50, s * .10), (s * .50, s * .90)], fill=W, width=lw)
    d.arc([s * .24, s * .20, s * .76, s * .52], start=110, end=350, fill=W, width=lw)
    d.arc([s * .24, s * .48, s * .76, s * .80], start=290, end=170, fill=W, width=lw)
    save(img, size, "m_coin")


def m_check(size=56):
    img, d, s = canvas(size)
    lw = int(s * .11)
    d.line([(s * .20, s * .54), (s * .42, s * .76), (s * .80, s * .28)], fill=W, width=lw, joint="curve")
    save(img, size, "m_check")


def m_clock(size=56):
    img, d, s = canvas(size)
    lw = int(s * .08)
    d.ellipse([s * .12, s * .12, s * .88, s * .88], outline=W, width=lw)
    d.line([(s * .50, s * .28), (s * .50, s * .52), (s * .68, s * .62)], fill=W, width=lw, joint="curve")
    save(img, size, "m_clock")


def m_cup(size=56):
    img, d, s = canvas(size)
    lw = int(s * .08)
    d.rounded_rectangle([s * .16, s * .28, s * .70, s * .78], radius=s * .10, fill=W)
    d.arc([s * .58, s * .36, s * .86, s * .66], start=270, end=90, fill=W, width=lw)
    d.rounded_rectangle([s * .14, s * .82, s * .72, s * .90], radius=s * .04, fill=W)
    save(img, size, "m_cup")


def work_assets():
    m_coin(); m_check(); m_clock(); m_cup()
    lilac, coral, sky, amber, pink, teal = MUSIC_PALETTES
    mint_bg, mint_fg = "#a6f2d1", "#003826"
    tile("w_cash", "m_coin", "sunny", hexc(mint_bg), hexc(mint_fg), size=56, glyph_size=32)
    tile("w_in", "m_check", "circle", hexc(teal[1]), hexc(teal[0]), size=56, glyph_size=32)
    tile("w_meet", "m_clock", "cookie9", hexc(coral[0]), hexc(coral[1]), size=56, glyph_size=32)
    tile("w_rate", "m_coin", "clover", hexc(amber[0]), hexc(amber[1]), size=56, glyph_size=30)
    tile("w_pay", "m_work", "squircle", hexc(lilac[0]), hexc(lilac[1]), size=56, glyph_size=30)
    tile("w_clock", "m_clock", "circle", hexc(sky[0]), hexc(sky[1]), size=56, glyph_size=32)
    tile("w_lunch", "m_cup", "cookie6", hexc(pink[0]), hexc(pink[1]), size=56, glyph_size=32)


# ---------- Metro CDMX + Tarjeta MI ----------
def m_metro(size=56):
    """Minimal front train glyph."""
    img, d, s = canvas(size)
    lw = int(s * .07)
    d.rounded_rectangle([s * .18, s * .12, s * .82, s * .76], radius=s * .14, fill=W)
    d.rounded_rectangle([s * .28, s * .24, s * .72, s * .48], radius=s * .06, fill=(0, 0, 0, 0))
    d.ellipse([s * .28, s * .56, s * .40, s * .68], fill=(0, 0, 0, 0))
    d.ellipse([s * .60, s * .56, s * .72, s * .68], fill=(0, 0, 0, 0))
    d.line([(s * .28, s * .80), (s * .18, s * .92)], fill=W, width=lw)
    d.line([(s * .72, s * .80), (s * .82, s * .92)], fill=W, width=lw)
    save(img, size, "m_metro")


def m_card(size=56):
    img, d, s = canvas(size)
    d.rounded_rectangle([s * .08, s * .20, s * .92, s * .80], radius=s * .10, fill=W)
    d.rectangle([s * .08, s * .34, s * .92, s * .46], fill=(0, 0, 0, 0))
    d.rounded_rectangle([s * .18, s * .58, s * .46, s * .68], radius=s * .03, fill=(0, 0, 0, 0))
    save(img, size, "m_card")


def metro_badge(lid, bg, fg, size=56):
    """Official-color M3 squircle badge with the line number/letter."""
    from PIL import ImageFont
    img, d, s = canvas(size)
    d.polygon(shape_points("squircle", s), fill=hexc(bg))
    fsize = int(s * (.48 if len(lid) == 1 else .38))
    font = None
    for path in ("C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"):
        try:
            font = ImageFont.truetype(path, fsize)
            break
        except Exception:
            pass
    if font is None:
        font = ImageFont.load_default()
    bb = d.textbbox((0, 0), lid, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text(((s - tw) / 2 - bb[0], (s - th) / 2 - bb[1]), lid, fill=hexc(fg), font=font)
    save(img, size, f"ml_{lid}")


def metro_assets():
    m_metro(); m_card()
    coral = MUSIC_PALETTES[1]
    tile("t_metro", "m_metro", "cookie6", hexc(coral[0]), hexc(coral[1]))
    tile("mi_card", "m_card", "squircle", hexc("#a6f2d1"), hexc("#003826"), size=56, glyph_size=34)
    badges = [
        ("1", "#f28ab2", "#3d0a1e"),
        ("2", "#64b5f6", "#072642"),
        ("3", "#b5c95a", "#263007"),
        ("4", "#7ce0d3", "#07302b"),
        ("5", "#ffd54f", "#382a00"),
        ("6", "#ff7961", "#400d06"),
        ("7", "#ffab40", "#3d2200"),
        ("8", "#66bb6a", "#08300b"),
        ("9", "#c49a6c", "#301f0c"),
        ("A", "#ba68c8", "#300d38"),
        ("B", "#80cbc4", "#08302c"),
        ("12", "#e6c26e", "#332506"),
    ]
    for lid, bg, fg in badges:
        metro_badge(lid, bg, fg)


# ---------- Unit converter ----------
def m_units(size=56):
    """Minimal swap arrows glyph."""
    img, d, s = canvas(size)
    lw = int(s * .09)
    # Top arrow ->
    d.line([(s * .16, s * .34), (s * .78, s * .34)], fill=W, width=lw)
    d.line([(s * .60, s * .18), (s * .80, s * .34), (s * .60, s * .50)], fill=W, width=lw, joint="curve")
    # Bottom arrow <-
    d.line([(s * .84, s * .66), (s * .22, s * .66)], fill=W, width=lw)
    d.line([(s * .40, s * .50), (s * .20, s * .66), (s * .40, s * .82)], fill=W, width=lw, joint="curve")
    save(img, size, "m_units")


def text_badge(out_name, label, shape, bg, fg, size=56):
    from PIL import ImageFont
    img, d, s = canvas(size)
    d.polygon(shape_points(shape, s), fill=hexc(bg))
    fsize = int(s * (.44 if len(label) <= 2 else .34))
    font = None
    for path in ("C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"):
        try:
            font = ImageFont.truetype(path, fsize)
            break
        except Exception:
            pass
    if font is None:
        font = ImageFont.load_default()
    bb = d.textbbox((0, 0), label, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text(((s - tw) / 2 - bb[0], (s - th) / 2 - bb[1]), label, fill=hexc(fg), font=font)
    save(img, size, out_name)


def units_assets():
    m_units()
    lilac, coral, sky, amber, pink, teal = MUSIC_PALETTES
    tile("t_units", "m_units", "clover", hexc(sky[0]), hexc(sky[1]))
    text_badge("uc_usd", "$", "sunny", "#a6f2d1", "#003826")
    text_badge("uc_lb", "lb", "cookie9", amber[0], amber[1])
    text_badge("uc_f", "°F", "circle", coral[0], coral[1])
    text_badge("uc_mi", "mi", "squircle", sky[0], sky[1])
    text_badge("uc_oz", "oz", "clover", lilac[0], lilac[1])
    text_badge("uc_ft", "ft", "cookie6", teal[0], teal[1])


# ---------- Now Brief ----------
def m_sun(size=56):
    img, d, s = canvas(size)
    lw = int(s * .08)
    d.ellipse([s * .28, s * .28, s * .72, s * .72], fill=W)
    for k in range(8):
        ang = k * math.pi / 4
        x1 = s * .5 + math.cos(ang) * s * .30
        y1 = s * .5 + math.sin(ang) * s * .30
        x2 = s * .5 + math.cos(ang) * s * .44
        y2 = s * .5 + math.sin(ang) * s * .44
        d.line([(x1, y1), (x2, y2)], fill=W, width=lw)
    save(img, size, "m_sun")


def m_star(size=56):
    """4-point sparkle (Samsung/Pixel Now Brief vibe)."""
    img, d, s = canvas(size)
    cx = cy = s / 2
    pts = [
        (cx, s * .08), (s * .60, s * .40),
        (s * .92, cy), (s * .60, s * .60),
        (cx, s * .92), (s * .40, s * .60),
        (s * .08, cy), (s * .40, s * .40),
    ]
    d.polygon(pts, fill=W)
    save(img, size, "m_star")


def brief_assets():
    m_sun(); m_star()
    lilac, coral, sky, amber, pink, teal = MUSIC_PALETTES
    tile("t_brief", "m_star", "sunny", hexc(amber[0]), hexc(amber[1]))
    tile("br_sun", "m_sun", "cookie9", hexc(amber[0]), hexc(amber[1]), size=56, glyph_size=34)
    tile("br_star", "m_star", "clover", hexc(lilac[0]), hexc(lilac[1]), size=56, glyph_size=34)


def quick_tools_assets():
    lilac, coral, sky, amber, pink, teal = MUSIC_PALETTES
    text_badge("t_count", "+1", "cookie12", lilac[0], lilac[1], size=84)
    text_badge("t_tip", "%", "squircle", amber[0], amber[1], size=84)
    text_badge("t_decide", "?", "cookie9", pink[0], pink[1], size=84)
    text_badge("t_hnc", "CDMX", "clover", teal[0], teal[1], size=84)


def m_pin(size=56):
    img, d, s = canvas(size)
    d.ellipse([s * .22, s * .10, s * .78, s * .66], fill=W)
    d.polygon([(s * .26, s * .52), (s * .74, s * .52), (s * .50, s * .92)], fill=W)
    d.ellipse([s * .38, s * .26, s * .62, s * .50], fill=(0, 0, 0, 0))
    save(img, size, "m_pin")


def places_assets():
    m_pin()
    lilac, coral, sky, amber, pink, teal = MUSIC_PALETTES
    tile("t_places", "m_pin", "cookie9", hexc(teal[0]), hexc(teal[1]))
    text_badge("pl_car", "A", "squircle", sky[0], sky[1])
    text_badge("pl_park", "P", "circle", amber[0], amber[1])
    text_badge("pl_hw", "HW", "clover", lilac[0], lilac[1])


# ---------- Koala Científico (pixel art ported from JJAS-029/koala_monitor) ----------
def draw_koala_sprite(out_name, eyes="open", arms="normal", hat=False, heart_y=None, z_y=None, sweat=False, size=120):
    """Exact pixel-art Koala Científico from koala_monitor/media/koala.js."""
    C = 7  # pixel cell size
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ox, oy = size / 2, size - 14  # (0,0) = center of feet, y negative up

    def cel(x, y, w, h, col):
        x0 = int(round(ox + x * C))
        y0 = int(round(oy + y * C))
        x1 = int(round(ox + (x + w) * C))
        y1 = int(round(oy + (y + h) * C))
        if x1 > x0 and y1 > y0:
            d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=hexc(col))

    P = "#9AA3AD"
    # Legs
    for px in (-3, 1):
        cel(px, -2, 2, 2, "#737B85")
        cel(px - 0.2, -0.5, 2.4, 0.5, "#5C636C")
    # Ears
    cel(-5.5, -10, 2, 3, P); cel(-6, -9.5, 3, 2, P); cel(-5, -9.3, 1, 1.4, "#E3E6EA")
    cel(3.5, -10, 2, 3, P); cel(3, -9.5, 3, 2, P); cel(4, -9.3, 1, 1.4, "#E3E6EA")
    # Body 8x6
    cel(-4, -8, 8, 6, P)
    cel(3.5, -8, 0.5, 4, "#7D8590")
    # Lab coat + blue shirt + red pen
    cel(-4, -4, 8, 2, "#F2F2F2")
    cel(3.2, -4, 0.8, 2, "#CFD3D8")
    cel(-4, -2.4, 8, 0.4, "#CFD3D8")
    cel(-1, -4, 2, 0.7, "#7FB8E0"); cel(-0.5, -3.3, 1, 0.6, "#7FB8E0")
    cel(-3.2, -3.2, 1.4, 0.25, "#CFD3D8")
    cel(-2.8, -3.8, 0.3, 0.7, "#E0524D")
    # Safety goggles on forehead
    cel(-4, -7.9, 8, 0.5, "#3A4A5A")
    cel(-3.2, -8.4, 2.2, 1.2, "#3A4A5A"); cel(-3, -8.2, 1.8, 0.8, "#7FD3F0")
    cel(1, -8.4, 2.2, 1.2, "#3A4A5A"); cel(1.2, -8.2, 1.8, 0.8, "#7FD3F0")
    cel(-2.9, -8.15, 0.45, 0.35, "#FFFFFF"); cel(1.3, -8.15, 0.45, 0.35, "#FFFFFF")
    # Eyes
    if eyes == "open":
        cel(-2.6, -6.7, 1.0, 1.0, "#141414")
        cel(1.6, -6.7, 1.0, 1.0, "#141414")
    elif eyes == "blink" or eyes == "sleep":
        cel(-2.6, -6.2, 1.1, 0.35, "#141414")
        cel(1.5, -6.2, 1.1, 0.35, "#141414")
    elif eyes == "happy":
        for ex in (-2.6, 1.6):
            cel(ex, -6.3, 0.4, 0.4, "#141414")
            cel(ex + 0.3, -6.6, 0.4, 0.4, "#141414")
            cel(ex + 0.6, -6.3, 0.4, 0.4, "#141414")
    elif eyes == "sad":
        cel(-2.6, -6.5, 1.0, 0.9, "#141414")
        cel(1.6, -6.5, 1.0, 0.9, "#141414")
        cel(-2.6, -6.8, 0.9, 0.25, "#7D8590")
        cel(1.7, -6.8, 0.9, 0.25, "#7D8590")
    # Nose
    cel(-1.1, -6.0, 2.2, 1.8, "#2B2B2B")
    cel(-0.7, -5.8, 0.5, 0.4, "#4A4A4A")
    # Arms
    if arms == "up":
        cel(-5.6, -5.6, 1.6, 2.0, "#F2F2F2")
        cel(4.0, -5.6, 1.6, 2.0, "#F2F2F2")
    else:
        cel(-5.6, -4.0, 1.6, 1.6, "#F2F2F2"); cel(-5.6, -2.8, 1.6, 0.4, P)
        cel(4.0, -4.0, 1.6, 1.6, "#F2F2F2"); cel(4.0, -2.8, 1.6, 0.4, P)
    # Nightcap when sleeping
    if hat:
        cel(-3.4, -9.8, 6.8, 1.2, "#5B6EE1")
        cel(-2.6, -11.0, 5.0, 1.3, "#5B6EE1")
        cel(-1.0, -12.0, 3.4, 1.1, "#5B6EE1")
        cel(2.0, -12.4, 1.6, 0.9, "#5B6EE1")
        cel(3.3, -12.8, 1.2, 1.2, "#FFE7A0")
        cel(-1.8, -9.6, 0.5, 0.5, "#FFE7A0")
        cel(1.2, -9.5, 0.5, 0.5, "#FFE7A0")
    # Sweat drop
    if sweat:
        cel(4.4, -7.6, 0.6, 1.1, "#7FD3F0")
    # Floating pixel heart
    if heart_y is not None:
        pat = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."]
        hx, hy = 3.6, heart_y
        for r_i, row_s in enumerate(pat):
            for c_i, ch in enumerate(row_s):
                if ch == "X":
                    cel(hx + c_i * 0.35, hy + r_i * 0.35, 0.38, 0.38, "#E85A7A")
    # Floating Z
    if z_y is not None:
        pat = ["XXXXX", "...X.", "..X..", ".X...", "XXXXX"]
        zx, zy = 4.2, z_y
        for r_i, row_s in enumerate(pat):
            for c_i, ch in enumerate(row_s):
                if ch == "X":
                    cel(zx + c_i * 0.38, zy + r_i * 0.38, 0.40, 0.40, "#7FB8E0")
    img.save(OUT / f"{out_name}.png")


def koala_assets():
    pink = MUSIC_PALETTES[4]
    tile("t_koala", "m_koala", "cookie9", hexc(pink[0]), hexc(pink[1]))
    draw_koala_sprite("ko_idle_0", eyes="open", arms="normal")
    draw_koala_sprite("ko_idle_1", eyes="blink", arms="normal")
    draw_koala_sprite("ko_happy_0", eyes="happy", arms="up", heart_y=-12.2)
    draw_koala_sprite("ko_happy_1", eyes="happy", arms="normal", heart_y=-13.0)
    draw_koala_sprite("ko_sad", eyes="sad", arms="normal", sweat=True)
    draw_koala_sprite("ko_sleep_0", eyes="sleep", arms="normal", hat=True, z_y=-11.8)
    draw_koala_sprite("ko_sleep_1", eyes="sleep", arms="normal", hat=True, z_y=-12.8)


def phase3_bike_timer_assets():
    lilac, coral, sky, amber, pink, teal = MUSIC_PALETTES
    tile("t_bkit", "m_bike", "clover", hexc(amber[0]), hexc(amber[1]))
    tile("t_timer", "m_clock", "cookie12", hexc(coral[0]), hexc(coral[1]))
    # Crisp reset arrow icon (lite font lacks the Unicode ↺ glyph)
    img, d, s = canvas(40)
    lw = int(s * .10)
    d.arc([s * .16, s * .16, s * .84, s * .84], start=35, end=315, fill=W, width=lw)
    d.polygon([(s * .74, s * .10), (s * .88, s * .34), (s * .60, s * .34)], fill=W)
    save(img, 40, "reset")
    tile("t_habits", "m_check", "sunny", hexc("#a6f2d1"), hexc("#003826"))
    text_badge("t_anki", "EN", "squircle", sky[0], sky[1], size=84)
    text_badge("t_vibe", "⚡", "cookie6", lilac[0], lilac[1], size=84)
    text_badge("t_spend", "-$", "cookie9", "#a6f2d1", "#003826", size=84)
    tile("t_days", "m_heart", "clover", hexc(pink[0]), hexc(pink[1]))
    text_badge("t_simon", "4", "sunny", amber[0], amber[1], size=84)


# Shape symmetry period (degrees): rotating that much looks identical -> perfect loop.
PERIOD = {"cookie9": 40, "sunny": 45, "clover": 90, "cookie12": 30, "squircle": 90, "cookie6": 60}
ART_FRAMES = 6


def art_frames():
    """Frames for the music image-animator: the shape turns, the note stays upright.
    (On lite, transform: rotate turns around the corner, not the center.)"""
    for i, (acc, on, cont, surf) in enumerate(MUSIC_PALETTES):
        kind = ART_SHAPES[i]
        for k in range(ART_FRAMES):
            size, glyph_size = 120, 56
            img, d, s = canvas(size)
            rot = math.radians(PERIOD[kind] * k / ART_FRAMES)
            d.polygon(shape_points(kind, s, rot=rot), fill=hexc(acc))
            g = Image.open(OUT / "m_music.png").convert("RGBA").resize((glyph_size * SS, glyph_size * SS), Image.LANCZOS)
            tint = Image.new("RGBA", g.size, hexc(on))
            tint.putalpha(g.getchannel("A"))
            off = (s - g.size[0]) // 2
            img.alpha_composite(tint, (off, off))
            save(img, size, f"art_{i}_{k}")


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
    m_music(); m_camera(); m_qr(); m_nav(); m_notes(); m_mic(); m_list(); m_work()
    for name, glyph, kind, bg, fg in TILES:
        tile(name, glyph, kind, hexc(bg), hexc(fg))
    dark_controls()
    flip_icon(); timer_icon()
    music_assets()
    art_frames()
    battery_assets()
    work_assets()
    metro_assets()
    units_assets()
    brief_assets()
    quick_tools_assets()
    places_assets()
    koala_assets()
    phase3_bike_timer_assets()
    shutter(); shutter(name="shutter_busy", bg="#4a5670", fg="#1b2d52")
    rec_button(); rec_button(name="rec_busy", bg="#6e4a47", fg="#5c1d1a")
    rec_button(name="rec_stop", stop=True)
    print(f"Icons written to {OUT}")
