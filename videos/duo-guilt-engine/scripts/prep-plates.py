#!/usr/bin/env python3
"""Turn raw Higgsfield plates (assets/plates/*.png) into scene planes (assets/scene/).

For a scene with a cut-out (<key>-cut.png):
  <key>-bg.jpg   clean plate: subject inpainted out, blurred and desaturated (the muted world)
  <key>-sub.png  the subject, full colour, aligned to the plate
For a scene without one:
  <key>-bg.jpg   the plate itself, lightly graded

Planes are written at 1188x2112 (10% overscan on 1080x1920) so camera drift, wiggle and
parallax never reveal an edge. When a raw plate is missing, a labelled placeholder is
written instead so the timeline still renders end to end.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets/plates"
OUT = ROOT / "assets/scene"
PW, PH = 1188, 2112

# Per-scene background treatment: blur sigma (px at plane size) and saturation kept (0..1).
# Defaults suit a mid-distance background; close-ups keep more detail.
BG = {
    "f04": (2.0, 0.55), "f06": (5.0, 0.5), "f10": (1.5, 0.45), "f16": (2.5, 0.7),
    "f20": (4.0, 0.6), "f22": (5.0, 0.45), "f25": (1.2, 0.25), "f28": (0.8, 0.8),
    "f29": (0.8, 0.8), "f13": (4.0, 0.5), "f15": (4.0, 0.55),
}
DEFAULT_BG = (3.2, 0.4)
EXTRAS = {  # key: (output name, size or None for plane size, mode)
    "paper": ("paper.jpg", (1080, 1920), "rgb"),
    "icon-cutout": ("icon.png", (900, 900), "rgba"),
    "fg-man": ("fg-man.png", (820, 1235), "rgba"),
    "fg-woman": ("fg-woman.png", (820, 1235), "rgba"),
    "duo-cutout": ("duo.png", (720, 964), "rgba"),
    "f30-photo": ("polaroid-photo.jpg", (860, 860), "rgb"),
}


def cover(img, w, h):
    ih, iw = img.shape[:2]
    s = max(w / iw, h / ih)
    img = cv2.resize(img, (round(iw * s), round(ih * s)), interpolation=cv2.INTER_AREA)
    y = (img.shape[0] - h) // 2
    x = (img.shape[1] - w) // 2
    return img[y : y + h, x : x + w]


def grade_bg(img, sigma, sat):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] *= sat
    img = cv2.cvtColor(hsv.clip(0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)
    if sigma > 0:
        img = cv2.GaussianBlur(img, (0, 0), sigma)
    return img


def placeholder(key, w, h, alpha=False):
    img = np.full((h, w, 4 if alpha else 3), (206, 214, 222, 255)[: 4 if alpha else 3], np.uint8)
    if alpha:
        img[..., 3] = 0
        cv2.ellipse(img, (w // 2, int(h * 0.55)), (w // 5, h // 7), 0, 0, 360, (60, 170, 90, 255), -1)
    else:
        for yy in range(0, h, 64):
            cv2.line(img, (0, yy), (w, yy), (190, 198, 206), 1)
    cv2.putText(img, key, (40, 120), cv2.FONT_HERSHEY_SIMPLEX, 3, (40, 40, 40, 255)[: img.shape[2]], 6)
    return img


def read(path, flags=cv2.IMREAD_UNCHANGED):
    img = cv2.imread(str(path), flags)
    if img is None:
        raise SystemExit(f"cannot read {path}")
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    plates = json.loads((ROOT / "data/plates.json").read_text())["plates"]
    scene_keys = sorted(k for k in plates if len(k) == 3 and k.startswith("f"))
    report = []

    for key in scene_keys:
        raw = RAW / f"{key}.png"
        cut = RAW / f"{key}-cut.png"
        sigma, sat = BG.get(key, DEFAULT_BG)
        if not raw.exists():
            cv2.imwrite(str(OUT / f"{key}-bg.jpg"), placeholder(key, PW, PH))
            if f"{key}-cut" in plates:
                cv2.imwrite(str(OUT / f"{key}-sub.png"), placeholder(key + " sub", PW, PH, alpha=True))
            report.append(f"{key}: placeholder")
            continue

        plate = cover(read(raw, cv2.IMREAD_COLOR), PW, PH)
        if cut.exists():
            sub = read(cut)
            if sub.shape[2] == 3:
                sub = np.dstack([sub, np.full(sub.shape[:2], 255, np.uint8)])
            sub = cover(sub, PW, PH)
            mask = (sub[..., 3] > 24).astype(np.uint8) * 255
            mask = cv2.dilate(mask, np.ones((25, 25), np.uint8))
            small = cv2.resize(plate, (PW // 2, PH // 2), interpolation=cv2.INTER_AREA)
            small_mask = cv2.resize(mask, (PW // 2, PH // 2), interpolation=cv2.INTER_NEAREST)
            clean = cv2.inpaint(small, small_mask, 9, cv2.INPAINT_TELEA)
            clean = cv2.resize(clean, (PW, PH), interpolation=cv2.INTER_CUBIC)
            clean = np.where(mask[..., None] > 0, clean, plate)
            cv2.imwrite(str(OUT / f"{key}-bg.jpg"), grade_bg(clean, sigma, sat), [cv2.IMWRITE_JPEG_QUALITY, 92])
            cv2.imwrite(str(OUT / f"{key}-sub.png"), sub)
            report.append(f"{key}: bg+sub")
        else:
            cv2.imwrite(str(OUT / f"{key}-bg.jpg"), grade_bg(plate, 0, max(sat, 0.8)), [cv2.IMWRITE_JPEG_QUALITY, 92])
            report.append(f"{key}: bg only")

    for key, (name, size, mode) in EXTRAS.items():
        raw = RAW / f"{key}.png"
        w, h = size
        if not raw.exists():
            cv2.imwrite(str(OUT / name), placeholder(key, w, h, alpha=mode == "rgba"))
            report.append(f"{key}: placeholder")
            continue
        img = read(raw, cv2.IMREAD_UNCHANGED if mode == "rgba" else cv2.IMREAD_COLOR)
        if mode == "rgba":
            if img.shape[2] == 3:
                img = np.dstack([img, np.full(img.shape[:2], 255, np.uint8)])
            ys, xs = np.nonzero(img[..., 3] > 8)
            img = img[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
            s = min(w / img.shape[1], h / img.shape[0])
            img = cv2.resize(img, (round(img.shape[1] * s), round(img.shape[0] * s)), interpolation=cv2.INTER_AREA)
        else:
            img = cover(img, w, h)
        cv2.imwrite(str(OUT / name), img, [cv2.IMWRITE_JPEG_QUALITY, 92] if name.endswith(".jpg") else [])
        report.append(f"{key}: ok")

    print("\n".join(report))


if __name__ == "__main__":
    sys.exit(main())
