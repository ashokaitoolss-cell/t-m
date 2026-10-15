"""Cinematic lens pass: soften and darken the edges of a frame, keeping the centre sharp.

Matches the location references: detail stays crisp around the subject, then the paint goes
soft toward the edges and corners, the corners fall off into shadow, and a faint red/blue
fringe appears at the very edge, like a real lens.

The look is painted into every still by the prompt (see "Lens" in BRIEF.md). This pass is the
light finishing layer on top: run it at the default strength on every final frame and video
clip so that all shots end up with the same falloff, even where a video model has sharpened
the edges again.

    python3 scripts/lens_pass.py OUT_DIR IMAGE [IMAGE ...] [--focus X Y] [--strength S]

--focus moves the sharp centre (0..1 of width and height; default 0.5 0.5).
--strength scales blur, vignette and fringe together (default 0.5; 1.0 is heavy).
--letterbox adds black bars down to a 2.39:1 picture.
"""
import argparse
import os

import numpy as np
from PIL import Image, ImageFilter


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def lens_pass(im, focus=(0.5, 0.5), strength=0.5, letterbox=False):
    im = im.convert("RGB")
    w, h = im.size
    src = np.asarray(im, dtype=np.float32) / 255.0

    # Elliptical distance from the focus point: 0 at focus, about 1 at the corners.
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fx, fy = focus[0] * w, focus[1] * h
    dx = (xx - fx) / (w * 0.5)
    dy = (yy - fy) / (h * 0.5)
    r = np.sqrt(dx * dx + dy * dy) / np.sqrt(2)

    # Two blur levels so the softness builds gradually toward the corners.
    s1 = max(1.0, w * 0.0035 * strength)
    s2 = max(1.0, w * 0.0110 * strength)
    b1 = np.asarray(im.filter(ImageFilter.GaussianBlur(s1)), dtype=np.float32) / 255.0
    b2 = np.asarray(im.filter(ImageFilter.GaussianBlur(s2)), dtype=np.float32) / 255.0
    m1 = smoothstep(0.38, 0.70, r)[..., None]
    m2 = smoothstep(0.62, 1.00, r)[..., None]
    out = src * (1 - m1) + b1 * m1
    out = out * (1 - m2) + b2 * m2

    # Faint colour fringe at the edges: red pushed outward, blue pulled inward.
    fringe = smoothstep(0.55, 1.0, r) * 0.004 * strength
    def resample(ch, k):
        sx = np.clip(fx + (xx - fx) * (1 - k * fringe), 0, w - 1).astype(np.int32)
        sy = np.clip(fy + (yy - fy) * (1 - k * fringe), 0, h - 1).astype(np.int32)
        return ch[sy, sx]
    out[..., 0] = resample(out[..., 0], 1.0)
    out[..., 2] = resample(out[..., 2], -1.0)

    # Vignette: the corners fall away into shadow.
    vig = 1 - 0.55 * strength * smoothstep(0.45, 1.05, r)
    out *= np.clip(vig, 0, 1)[..., None]

    out = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
    if letterbox:
        bar = max(0, int(round((h - w / 2.39) / 2)))
        arr = np.asarray(out).copy()
        arr[:bar] = 0
        arr[h - bar:] = 0
        out = Image.fromarray(arr)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out_dir")
    ap.add_argument("images", nargs="+")
    ap.add_argument("--focus", nargs=2, type=float, default=(0.5, 0.5))
    ap.add_argument("--strength", type=float, default=0.5)
    ap.add_argument("--letterbox", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    for p in a.images:
        out = lens_pass(Image.open(p), tuple(a.focus), a.strength, a.letterbox)
        dst = os.path.join(a.out_dir, os.path.basename(p))
        out.save(dst, quality=92)
        print("wrote", dst)


if __name__ == "__main__":
    main()
