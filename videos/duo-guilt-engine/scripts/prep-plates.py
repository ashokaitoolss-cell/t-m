#!/usr/bin/env python3
"""Turn raw Higgsfield plates (assets/plates/*.png) into scene planes (assets/scene/).

Each plate gets a depth map (Depth Anything V2 small, ONNX, CPU), which drives:
  - depth of field focused on the subject: a light baseline softness, up to ~13 px of blur
    behind it and ~9 px in front, so the world falls off like a lens rather than a flat blur;
  - for scenes with distinct layers (SPLIT), a midground plane cut from the background
    by depth, with the far plane inpainted behind it, for 3-4-plane parallax.

For a scene with a cut-out (<key>-cut.png):
  <key>-bg.jpg   far plane: subject (and midground) inpainted out, depth-blurred, desaturated
  <key>-mid.png  midground plane (SPLIT scenes only), RGBA
  <key>-sub.png  the subject, sharp and full colour, aligned to the plate
For a scene without one, the focus is the scene's focal point (FOCAL) and the same
treatment applies; flat artwork (FLAT) stays sharp.

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

# Saturation kept in the world around the subject (the subject keeps full colour).
SAT = {"f04": 0.55, "f06": 0.5, "f10": 0.45, "f16": 0.7, "f20": 0.6, "f22": 0.45, "f25": 0.25,
       "f28": 0.8, "f29": 0.8, "f13": 0.5, "f15": 0.55, "f17": 0.55}
DEFAULT_SAT = 0.4
# Focal point (stage px) for scenes without a cut-out subject.
FOCAL = {"f04": (850, 665), "f10": (560, 640), "f16": (420, 1000), "f21": (560, 880), "f25": (540, 900)}
FLAT = {"f28", "f29"}  # chalkboard, blueprint: no depth of field
NO_CUT = {"f21"}  # cut-out unusable (buildings stand in front of giant Duo): keep the plate whole
SPLIT = {"f03", "f09", "f10", "f16", "f19", "f21", "f26", "f27"}  # distinct layers -> midground plane
# Scenes whose split-off layer is clearly NEARER than the subject (the street crowd in front of
# giant Duo): that layer is cut from the original plate and goes above the subject (<key>-front.png).
FRONT = {"f21"}
MODEL = ROOT / "assets/models/depth-anything-v2-small.onnx"
MODEL_URL = "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx"
_session = None


def depth_map(bgr):
    """Relative depth in [0, 1], 1 = nearest."""
    global _session
    if _session is None:
        import onnxruntime as ort
        if not MODEL.exists():
            import urllib.request
            MODEL.parent.mkdir(parents=True, exist_ok=True)
            urllib.request.urlretrieve(MODEL_URL, MODEL)
        _session = ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])
    h, w = bgr.shape[:2]
    x = cv2.resize(bgr, (518, 924), interpolation=cv2.INTER_AREA)[..., ::-1].astype(np.float32) / 255
    x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    d = _session.run(None, {"pixel_values": x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
    d = cv2.resize(d, (w, h), interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, 2), np.percentile(d, 98)
    return np.clip((d - lo) / (hi - lo + 1e-6), 0, 1).astype(np.float32)


def depth_blur(img, sigma):
    """Per-pixel Gaussian blur, interpolated between a stack of fixed-sigma blurs."""
    levels = [0.0, 1.5, 3.0, 5.0, 8.0, 11.0, 14.0]
    f = img.astype(np.float32)
    stack = [f] + [cv2.GaussianBlur(f, (0, 0), lv) for lv in levels[1:]]
    pos = np.interp(np.clip(sigma, 0, levels[-1]), levels, np.arange(len(levels))).astype(np.float32)
    lo = np.floor(pos).astype(np.int32)
    hi = np.minimum(lo + 1, len(levels) - 1)
    frac = (pos - lo)[..., None]
    out = np.zeros_like(f)
    for i in range(len(levels)):
        out += stack[i] * (((lo == i)[..., None]) * (1 - frac) + ((hi == i) & (hi != lo))[..., None] * frac)
    return np.clip(out, 0, 255).astype(np.uint8)


def inpaint(img, mask):
    small = cv2.resize(img, (PW // 2, PH // 2), interpolation=cv2.INTER_AREA)
    small_mask = cv2.resize(mask, (PW // 2, PH // 2), interpolation=cv2.INTER_NEAREST)
    fill = cv2.inpaint(small, small_mask, 9, cv2.INPAINT_TELEA)
    fill = cv2.resize(fill, (PW, PH), interpolation=cv2.INTER_CUBIC)
    return np.where(mask[..., None] > 0, fill, img) if img.ndim == 3 else np.where(mask > 0, fill, img)


def desaturate(img, sat):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] *= sat
    return cv2.cvtColor(hsv.clip(0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)
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
        if not raw.exists():
            cv2.imwrite(str(OUT / f"{key}-bg.jpg"), placeholder(key, PW, PH))
            if f"{key}-cut" in plates:
                cv2.imwrite(str(OUT / f"{key}-sub.png"), placeholder(key + " sub", PW, PH, alpha=True))
            report.append(f"{key}: placeholder")
            continue

        plate = cover(read(raw, cv2.IMREAD_COLOR), PW, PH)
        sat = SAT.get(key, DEFAULT_SAT)
        depth = depth_map(plate)
        sub = None
        mask = np.zeros((PH, PW), np.uint8)
        if cut.exists() and key not in NO_CUT:
            sub = read(cut)
            if sub.shape[2] == 3:
                sub = np.dstack([sub, np.full(sub.shape[:2], 255, np.uint8)])
            sub = cover(sub, PW, PH)
            mask = cv2.dilate((sub[..., 3] > 24).astype(np.uint8) * 255, np.ones((25, 25), np.uint8))
            focus_d = float(np.median(depth[sub[..., 3] > 128])) if (sub[..., 3] > 128).any() else 0.5
            world = inpaint(plate, mask)
            depth = inpaint((depth * 255).astype(np.uint8), mask).astype(np.float32) / 255
        else:
            fx, fy = FOCAL.get(key, (540, 900))
            focus_d = float(np.median(depth[fy + 96 - 40 : fy + 96 + 40, fx + 54 - 40 : fx + 54 + 40]))
            world = plate

        # Depth of field around the subject's depth.
        # A small in-focus zone around the focus depth keeps the subject crisp to its edges.
        zone = 0.06
        if key in FLAT:
            sigma = np.zeros_like(depth)
        else:
            behind = np.clip((focus_d - zone - depth) / max(focus_d, 0.15), 0, 1) * 13
            front = np.clip((depth - focus_d - zone) / max(1 - focus_d, 0.15), 0, 1) * 9
            sigma = (1.2 if sub is not None else 0.0) + behind + front
        world = depth_blur(world, sigma)
        if sub is None and key not in FLAT:
            # No cut-out: colour isolation follows depth, so whatever sits at the focus depth
            # keeps full colour while the world around it desaturates.
            keep = 1 - smoothstep(zone, zone + 0.14, np.abs(depth - focus_d))
            world = (desaturate(world, sat).astype(np.float32) * (1 - keep[..., None]) + world.astype(np.float32) * keep[..., None]).astype(np.uint8)
        else:
            world = desaturate(world, sat)

        parts = ["bg"]
        (OUT / f"{key}-mid.png").unlink(missing_ok=True)
        (OUT / f"{key}-front.png").unlink(missing_ok=True)
        if key in FRONT:
            raw_depth = depth_map(plate)
            alpha = smoothstep(focus_d + 0.1, focus_d + 0.18, raw_depth)
            alpha = cv2.GaussianBlur(alpha, (0, 0), 2)
            sharp = desaturate(depth_blur(plate, np.clip((raw_depth - focus_d) / max(1 - focus_d, 0.15), 0, 1) * 9), sat)
            cv2.imwrite(str(OUT / f"{key}-front.png"), np.dstack([sharp, (alpha * 255).astype(np.uint8)]))
            parts.append(f"front {float(alpha.mean()):.0%}")
        elif key in SPLIT:
            bg_d = depth[mask == 0] if (mask == 0).any() else depth.ravel()
            t = focus_d - 0.5 * (focus_d - float(np.percentile(bg_d, 15)))
            alpha = smoothstep(t - 0.04, t + 0.04, depth)
            alpha[mask > 0] = 0 if sub is not None else alpha[mask > 0]
            alpha = cv2.GaussianBlur(alpha, (0, 0), 2)
            cover_ = float(alpha.mean())
            if 0.06 < cover_ < 0.85:
                mid = np.dstack([world, (alpha * 255).astype(np.uint8)])
                cv2.imwrite(str(OUT / f"{key}-mid.png"), mid)
                hole = cv2.dilate((alpha > 0.5).astype(np.uint8) * 255, np.ones((15, 15), np.uint8))
                world = cv2.GaussianBlur(inpaint(world, hole), (0, 0), 2)
                parts.append(f"mid {cover_:.0%}")

        cv2.imwrite(str(OUT / f"{key}-bg.jpg"), world, [cv2.IMWRITE_JPEG_QUALITY, 92])
        if sub is not None:
            cv2.imwrite(str(OUT / f"{key}-sub.png"), sub)
            parts.append("sub")
        report.append(f"{key}: {'+'.join(parts)} (focus depth {focus_d:.2f})")

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
            if key.startswith("fg-"):
                # Foreground passers-by sit near the lens: heavy blur, premultiplied so edges
                # don't pick up dark fringes (~26 px at the ~1.9x they are shown at).
                pad = 60
                img = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(0, 0, 0, 0))
                a = img[..., 3:4].astype(np.float32) / 255
                rgb = img[..., :3].astype(np.float32) * a
                rgb = cv2.GaussianBlur(rgb, (0, 0), 14)
                a = cv2.GaussianBlur(a, (0, 0), 14)[..., None]
                img = np.dstack([np.where(a > 1e-3, rgb / np.maximum(a, 1e-3), 0), a * 255]).clip(0, 255).astype(np.uint8)
        else:
            img = cover(img, w, h)
        cv2.imwrite(str(OUT / name), img, [cv2.IMWRITE_JPEG_QUALITY, 92] if name.endswith(".jpg") else [])
        report.append(f"{key}: ok")

    print("\n".join(report))


if __name__ == "__main__":
    sys.exit(main())
