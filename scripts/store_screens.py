"""Turns Previewer screenshots into AppGallery screenshots (840x840 square).

Usage:
  1. Save the Previewer screenshots (PNG/JPG) in docs/store/raw/
  2. python scripts/store_screens.py
  3. The results land in docs/store/screens/ (screen_1.png, screen_2.png, ...)

Each image is scaled to fit inside 840x840 without distortion, centered on a
black background (same as the watch screen). Files are processed in name order.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "docs/store/raw"
OUT = ROOT / "docs/store/screens"
SIZE = 840
MARGIN = 40  # border so the round watch doesn't touch the edges


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in RAW.iterdir() if p.suffix.lower() in (".png", ".jpg", ".jpeg"))
    if not files:
        print(f"Put the screenshots in {RAW}")
        return
    for i, f in enumerate(files, 1):
        im = Image.open(f).convert("RGB")
        box = SIZE - 2 * MARGIN
        scale = min(box / im.width, box / im.height)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        canvas = Image.new("RGB", (SIZE, SIZE), (0, 0, 0))
        canvas.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
        dst = OUT / f"screen_{i}.png"
        canvas.save(dst, optimize=True)
        print(f"{f.name} -> {dst.relative_to(ROOT)} ({dst.stat().st_size // 1024} KB)")
    if len(files) < 4:
        print(f"Warning: AppGallery asks for at least 4 (you have {len(files)}).")


if __name__ == "__main__":
    main()
