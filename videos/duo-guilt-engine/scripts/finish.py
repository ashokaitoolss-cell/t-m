#!/usr/bin/env python3
"""Print-texture finishing pass over the clean HyperFrames render.

    python3 scripts/finish.py renders/clean.mp4 renders/duo-guilt-engine.mp4

Applies the style guide's texture stack to every frame, in this order:
  1. lift blacks slightly, warm the shadows
  2. radial edge blur (sharp inside ~55% of the frame, softer toward the corners)
  3. radial RGB split, ~1 px at the corners
  4. halftone screen: 6 px square dot grid at 14 deg, midtone-weighted (+/- ~10 levels)
  5. paper plate, 7% multiply
  6. film grain, re-seeded per drawing (15/s) so it steps like the motion
  7. oval vignette, about -25% at the corners
Audio is taken from the clean render and normalised to -14 LUFS / -1 dBTP.
Deterministic: all noise is seeded by frame index.
"""
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import cv2
import numpy as np

W, H, FPS = 1080, 1920, 30
ROOT = Path(__file__).resolve().parent.parent


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def build_static():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (xx - W / 2) / (W / 2)
    ny = (yy - H / 2) / (H / 2)
    r = np.sqrt(nx * nx + ny * ny) / np.sqrt(2)  # 0 centre .. 1 corner

    edge = smoothstep(0.42, 0.95, r)[..., None]
    vignette = (1 - 0.27 * smoothstep(0.3, 1.0, r) ** 1.4)[..., None]

    # Radial chromatic aberration: sample R slightly outward, B slightly inward.
    k = 1.0 / 1100.0
    cx, cy = W / 2, H / 2
    map_r = ((xx - cx) * (1 - k) + cx, (yy - cy) * (1 - k) + cy)
    map_b = ((xx - cx) * (1 + k) + cx, (yy - cy) * (1 + k) + cy)

    # Halftone screen, 6 px pitch rotated 14 deg, values in [-1, 1].
    a = np.deg2rad(14)
    u = xx * np.cos(a) + yy * np.sin(a)
    v = -xx * np.sin(a) + yy * np.cos(a)
    pitch = 6.0
    screen = (np.cos(2 * np.pi * u / pitch) * np.cos(2 * np.pi * v / pitch)).astype(np.float32)

    paper_path = ROOT / "assets/scene/paper.jpg"
    paper = cv2.imread(str(paper_path), cv2.IMREAD_GRAYSCALE)
    if paper is None:
        paper = np.full((H, W), 235, np.uint8)
    paper = cv2.resize(paper, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)
    paper = paper / max(1.0, paper.mean())
    paper = (1 + 0.07 * (paper - 1))[..., None]

    return {
        "edge": edge.astype(np.float32),
        "vignette": vignette.astype(np.float32),
        "map_r": tuple(m.astype(np.float32) for m in map_r),
        "map_b": tuple(m.astype(np.float32) for m in map_b),
        "screen": screen,
        "paper": paper.astype(np.float32),
    }


S = None


def init():
    global S
    S = build_static()


def process(args):
    idx, raw = args
    img = np.frombuffer(raw, np.uint8).reshape(H, W, 3).astype(np.float32) / 255.0

    # 1. lift blacks, warm shadows
    img = 0.03 + img * 0.965
    img[..., 2] += 0.012 * (1 - img[..., 2])  # BGR: warm the reds a touch in the shadows

    # 2. edge blur
    blurred = cv2.GaussianBlur(img, (0, 0), 4.5)
    img = img + (blurred - img) * S["edge"]

    # 3. radial RGB split
    b, g, r = cv2.split(img)
    r = cv2.remap(r, *S["map_r"], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    b = cv2.remap(b, *S["map_b"], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    img = cv2.merge([b, g, r])

    # 4. halftone, weighted to midtones (fades out in highlights and deep shadows)
    lum = cv2.GaussianBlur(img.mean(axis=2), (0, 0), 2.0)
    mid = 4 * lum * (1 - lum)
    img = img * (1 + 0.085 * S["screen"] * mid)[..., None]

    # 5. paper plate
    img = img * S["paper"]

    # 6. grain, stepped at 15 drawings per second
    step = idx // 2
    rng = np.random.default_rng(1000 + step)
    grain = rng.standard_normal((H // 2, W // 2)).astype(np.float32)
    grain = cv2.resize(grain, (W, H), interpolation=cv2.INTER_LINEAR)
    img = img + (0.022 * grain * (0.35 + mid))[..., None]

    # 7. vignette
    img = img * S["vignette"]

    return idx, (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes()


def main():
    src, dst = sys.argv[1], sys.argv[2]
    frame_bytes = W * H * 3
    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE,
    )
    tmp_video = str(Path(dst).with_suffix(".video.mp4"))
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "14M", "-bufsize", "28M", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", tmp_video],
        stdin=subprocess.PIPE,
    )

    def frames():
        i = 0
        while True:
            buf = dec.stdout.read(frame_bytes)
            if len(buf) < frame_bytes:
                return
            yield i, buf
            i += 1

    n = 0
    with ProcessPoolExecutor(max_workers=4, initializer=init) as pool:
        for _, out in pool.map(process, frames(), chunksize=4):
            enc.stdin.write(out)
            n += 1
            if n % 150 == 0:
                print(f"  {n} frames", flush=True)
    enc.stdin.close()
    enc.wait()
    dec.wait()

    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", tmp_video, "-i", src, "-map", "0:v", "-map", "1:a?",
         "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "256k",
         "-movflags", "+faststart", dst],
        check=True,
    )
    Path(tmp_video).unlink(missing_ok=True)
    print(f"finished {n} frames -> {dst}")


if __name__ == "__main__":
    main()
