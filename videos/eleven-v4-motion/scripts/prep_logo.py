"""Split the supplied still into a clean gradient plate and a traced logo.

    python3 scripts/prep_logo.py          (needs numpy, pillow, scipy, opencv-python-headless, potracer)

Writes:
  assets/plate.png         the gradient with the logo painted out (the shader's texture)
  assets/matte.png         the logo's alpha matte at 1:1 (reference / QA only)
  data/logo.json           per-glyph SVG paths (1920x1080 space), boxes, and the pill geometry
"""
import json
from pathlib import Path

import cv2
import numpy as np
import potrace
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/source/eleven-v4.webp"
UP = 4  # trace at 4x for smooth curves

img = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32) / 255
H, W, _ = img.shape
mn = img.min(axis=2)

# The logo is pure white; the brightest gradient pixel never clears 0.73 on its weakest channel.
box = np.zeros((H, W), bool)
box[440:650, 560:1370] = True
ink = (mn > 0.78) & box
region = ndi.binary_dilation(ink, iterations=6)

# Paint the logo out. The gradient is low-frequency, so a Navier-Stokes fill followed by a
# masked Gaussian is indistinguishable from the surrounding field.
u8 = (img * 255).round().astype(np.uint8)
fill = cv2.inpaint(u8, region.astype(np.uint8) * 255, 18, cv2.INPAINT_NS).astype(np.float32) / 255
soft = cv2.GaussianBlur(fill, (0, 0), 9)
w = cv2.GaussianBlur(region.astype(np.float32), (0, 0), 3)[..., None]
bg = np.where(region[..., None], soft, img) * w + img * (1 - w)
bg = np.where(region[..., None], soft, bg)

# Alpha from "white over a known background": least squares over the three channels.
d = 1.0 - bg
alpha = ((img - bg) * d).sum(2) / np.maximum((d * d).sum(2), 1e-4)
alpha = np.clip(alpha, 0, 1) * region
alpha[alpha < 0.02] = 0

(ROOT / "data").mkdir(exist_ok=True)
Image.fromarray((np.clip(bg, 0, 1) * 255).round().astype(np.uint8)).save(ROOT / "assets/plate.png", optimize=True)
Image.fromarray((alpha * 255).round().astype(np.uint8)).save(ROOT / "assets/matte.png", optimize=True)

# Components, left to right: E l e v e n | pill | V 4
lab, n = ndi.label(alpha > 0.5, structure=np.ones((3, 3)))
comps = []
for i, sl in enumerate(ndi.find_objects(lab), 1):
    if (lab[sl] == i).sum() < 200:
        continue
    comps.append((sl[1].start, i, sl))
comps.sort()
names = ["E", "l", "e1", "v", "e2", "n", "pill", "V", "4"]
assert len(comps) == len(names), f"expected {len(names)} components, got {len(comps)}"

# Upsampled alpha for tracing.
A = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).resize((W * UP, H * UP), Image.BICUBIC)).astype(np.float32) / 255
LAB = np.asarray(Image.fromarray(lab.astype(np.int32)).resize((W * UP, H * UP), Image.NEAREST))
LAB = ndi.grey_dilation(LAB, size=(2 * UP + 1, 2 * UP + 1))


def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def trace(mask, ox, oy):
    # potracer fills the pixels that are *below* its black level, so hand it the inverse.
    path = potrace.Bitmap(~mask).trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
    P = lambda pt: f"{fmt(pt.x / UP + ox)} {fmt(pt.y / UP + oy)}"
    out = []
    for curve in path:
        out.append(f"M{P(curve.start_point)}")
        for seg in curve.segments:
            if seg.is_corner:
                out.append(f"L{P(seg.c)}L{P(seg.end_point)}")
            else:
                out.append(f"C{P(seg.c1)} {P(seg.c2)} {P(seg.end_point)}")
        out.append("Z")
    return "".join(out)


glyphs = {}
for name, (_, i, sl) in zip(names, comps):
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    cx0, cy0 = x0 - 3, y0 - 3
    m = (A > 0.5) & (LAB == i)
    m = m[cy0 * UP : (y1 + 3) * UP, cx0 * UP : (x1 + 3) * UP]
    glyphs[name] = {"box": [int(x0), int(y0), int(x1 - x0), int(y1 - y0)], "d": trace(m, cx0, cy0)}

# Pill geometry from the matte: sub-pixel outer edges from the 0.5 crossings of the alpha
# profile through its middle, stroke width from the alpha mass of the left and right walls.
px0, py0, pw, ph = glyphs["pill"]["box"]
yc, xc = py0 + ph // 2, px0 + pw // 2


def edge(profile, start, step):
    # Pixel i covers [i, i + 1): a 50%-covered pixel straddles the edge at i + 0.5.
    k = int(np.argmax(profile > 0.5))
    a0, a1 = profile[k - 1], profile[k]
    return start + step * ((k - 1) + (0.5 - a0) / (a1 - a0)) + 0.5


hx, vy = alpha[yc, :], alpha[:, xc]
left = edge(hx[px0 - 4 : px0 + 20], px0 - 4, 1)
right = edge(hx[px0 + pw + 3 : px0 + pw - 21 : -1], px0 + pw + 3, -1)
top = edge(vy[py0 - 4 : py0 + 20], py0 - 4, 1)
bottom = edge(vy[py0 + ph + 3 : py0 + ph - 21 : -1], py0 + ph + 3, -1)
stroke = (hx[px0 - 4 : px0 + 30].sum() + hx[px0 + pw - 30 : px0 + pw + 4].sum()) / 2
pill = {"left": round(float(left), 2), "right": round(float(right), 2), "top": round(float(top), 2),
        "bottom": round(float(bottom), 2), "stroke": round(float(stroke), 2)}

out = {"size": [W, H], "glyphs": glyphs, "pill": pill}
(ROOT / "data/logo.json").write_text(json.dumps(out, indent=1))
print(json.dumps({k: v["box"] for k, v in glyphs.items()}))
print(pill)
