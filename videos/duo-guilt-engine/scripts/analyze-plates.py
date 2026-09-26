#!/usr/bin/env python3
"""Measure where things sit in each generated plate -> data/layout.json.

Everything is reported in stage px (1080x1920) at rest, matching the scene planes
(plates are prepared at 1188x2112 with a 54/96 px overscan). build-scenes.mjs reads
these to pin overlays, camera focus and captions to the actual images:

  subject      bbox of the cut-out (alpha) when the scene has one
  duo          centroid + bbox of the largest saturated-green region (Duo)
  glow         brightest compact blob (a lit phone screen in a dark room)
  screen       bbox of the largest near-black rectangle near the centre (blank phone screen)
  heads        head-top points from the cut-out silhouette (up to 3, left to right)
  brass        centroid of the largest brass/yellow region (the megaphone)
  face         centroid of the largest skin-tone region inside the cut-out
  blue         bbox of the blueprint's blue area
  caption_y    a caption line in the y 480..1400 band clear of the subject and
               dark enough for white type
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SCENE = ROOT / "assets/scene"
OX, OY = 54, 96
BAND = [1390, 1330, 1270, 1210, 1150, 1090, 800, 740, 680, 620, 560, 500]


def to_stage(x, y):
    return [int(round(x - OX)), int(round(y - OY))]


def bbox_stage(x0, y0, x1, y1):
    return to_stage(x0, y0) + to_stage(x1, y1)


def largest(mask, min_area=400):
    n, lab, stats, cent = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    if n <= 1:
        return None
    i = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    if stats[i, cv2.CC_STAT_AREA] < min_area:
        return None
    x, y, w, h, a = stats[i]
    return {"c": to_stage(*cent[i]), "bbox": bbox_stage(x, y, x + w, y + h), "area": int(a)}


def analyse(key, bgr, alpha):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    out = {}

    if alpha is not None:
        m = alpha > 40
        ys, xs = np.nonzero(m)
        if len(xs):
            out["subject"] = bbox_stage(xs.min(), ys.min(), xs.max(), ys.max())
            # head tops: the silhouette's top edge per column, smoothed; local minima
            top = np.where(m.any(axis=0), m.argmax(axis=0), m.shape[0])
            top = cv2.GaussianBlur(top.astype(np.float32).reshape(1, -1), (0, 0), 18).ravel()
            cands = [x for x in range(20, len(top) - 20) if top[x] < m.shape[0] - 5
                     and top[x] == top[max(0, x - 90):x + 90].min()]
            heads, last = [], -999
            for x in sorted(cands, key=lambda c: top[c]):
                if all(abs(x - hx) > 170 for hx, _ in heads):
                    heads.append((x, top[x]))
                if len(heads) == 3:
                    break
            out["heads"] = [to_stage(x, y) for x, y in sorted(heads)]
            skin = m & (h <= 22) & (s >= 45) & (s <= 175) & (v >= 70)
            f = largest(skin, 1500)
            if f:
                out["face"] = f["c"]

    duo = largest((h >= 30) & (h <= 75) & (s >= 95) & (v >= 60), 1500)
    if duo:
        out["duo"] = duo
    bright = v >= np.percentile(v, 99.6)
    g = largest(cv2.dilate(bright.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0, 300)
    if g:
        out["glow"] = g
    dark = ((v < 45) & (s < 80)).astype(np.uint8)
    dark[:, :200] = 0
    dark[:, -200:] = 0
    dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))
    sc = largest(dark, 60000)
    if sc:
        out["screen"] = sc
    brass = largest((h >= 12) & (h <= 32) & (s >= 90) & (v >= 110), 2500)
    if brass:
        out["brass"] = brass
    blue = largest((h >= 95) & (h <= 125) & (s >= 70) & (v >= 60), 40000)
    if blue:
        out["blue"] = blue

    # Caption line: least subject coverage, then darkest, preferring the lower band.
    lum = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    best = None
    for rank, y in enumerate(BAND):
        yy = y + OY
        strip = slice(yy - 50, yy + 50)
        cover = float((alpha[strip, 234:954] > 40).mean()) if alpha is not None else 0.0
        bright_ = float(lum[strip, 234:954].mean())
        score = cover * 3 + max(0.0, bright_ - 0.45) * 2 + rank * 0.03
        if best is None or score < best[0]:
            best = (score, y, cover, bright_)
    out["caption_y"] = best[1]
    out["caption_cover"] = round(best[2], 3)
    out["caption_lum"] = round(best[3], 3)
    return out


def main():
    layout = {}
    for bg in sorted(SCENE.glob("f*-bg.jpg")):
        key = bg.name.split("-")[0]
        plate = ROOT / "assets/plates" / f"{key}.png"
        if not plate.exists():
            continue
        img = cv2.imread(str(plate), cv2.IMREAD_COLOR)
        ih, iw = img.shape[:2]
        s = max(1188 / iw, 2112 / ih)
        img = cv2.resize(img, (round(iw * s), round(ih * s)), interpolation=cv2.INTER_AREA)
        y0 = (img.shape[0] - 2112) // 2
        x0 = (img.shape[1] - 1188) // 2
        img = img[y0:y0 + 2112, x0:x0 + 1188]
        sub = SCENE / f"{key}-sub.png"
        alpha = cv2.imread(str(sub), cv2.IMREAD_UNCHANGED)[..., 3] if sub.exists() else None
        layout[key] = analyse(key, img, alpha)
    (ROOT / "data/layout.json").write_text(json.dumps(layout, indent=1) + "\n")
    print(json.dumps(layout, separators=(",", ":")))


if __name__ == "__main__":
    main()
