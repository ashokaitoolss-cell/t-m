#!/usr/bin/env python3
"""Turn a single photo into a 3D Gaussian splat.

    python photo2splat.py photo.jpg -o out/

1. Depth Anything V2 estimates relative depth for every pixel.
2. Each pixel becomes a flat 3D Gaussian on that depth surface, plus a hidden
   layer that extends the background behind foreground edges.
3. The Gaussians are optimized against the photo through a differentiable
   splatting rasterizer (L1 + D-SSIM, as in 3DGS, plus a depth term).
4. Results are exported as a standard 3DGS .ply, a .splat file, a
   self-contained WebGL viewer and a short orbit preview video.
"""

import argparse
import json
import math
import os
import shutil
import subprocess
import time

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageOps

import depth as depth_model
import export
import gaussians
from rasterize import Camera, rasterize

FOCAL35_TAG = 0xA405  # EXIF FocalLengthIn35mmFilm
EXIF_IFD = 0x8769
FULL_FRAME_DIAGONAL_MM = 43.27
MIN_VISIBILITY = 0.25  # total blending weight, in pixels, below which a Gaussian is not trained


def load_photo(path, size):
    im = Image.open(path)
    focal35 = im.getexif().get_ifd(EXIF_IFD).get(FOCAL35_TAG)
    im = ImageOps.exif_transpose(im).convert("RGB")
    s = size / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return np.asarray(im, np.float32) / 255.0, (float(focal35) if focal35 else None)


def focal_px(width, height, focal35, fov):
    """Focal length in pixels, from the 35 mm equivalent if known, else a horizontal FOV."""
    if focal35:
        return math.hypot(width, height) * focal35 / FULL_FRAME_DIAGONAL_MM
    return (width / 2) / math.tan(math.radians(fov) / 2)


def _gauss_window(size=11, sigma=1.5):
    x = torch.arange(size, dtype=torch.float32) - size // 2
    g = torch.exp(-x * x / (2 * sigma * sigma))
    g = g / g.sum()
    return (g[:, None] * g[None, :]).expand(3, 1, size, size).contiguous()


def ssim(a, b, window):
    """Mean SSIM of two (H, W, 3) images."""
    a = a.permute(2, 0, 1)[None]
    b = b.permute(2, 0, 1)[None]
    blur = lambda x: F.conv2d(x, window, padding=window.shape[-1] // 2, groups=3)
    mu_a, mu_b = blur(a), blur(b)
    var_a = blur(a * a) - mu_a ** 2
    var_b = blur(b * b) - mu_b ** 2
    cov = blur(a * b) - mu_a * mu_b
    c1, c2 = 0.01 ** 2, 0.03 ** 2
    s = ((2 * mu_a * mu_b + c1) * (2 * cov + c2)) / ((mu_a ** 2 + mu_b ** 2 + c1) * (var_a + var_b + c2))
    return s.mean()


def psnr(a, b):
    return 10 * math.log10(1.0 / max(((a - b) ** 2).mean().item(), 1e-12))


def train(g, rgb, inv_depth, cam, iters, depth_weight, log_every=25):
    """Fit Gaussian parameters to the photo from the photo's own viewpoint."""
    pixel = float(torch.median(g["means"][:, 2])) / cam.fx  # one pixel's width at median depth
    p = {
        "means": g["means"].clone(),
        "quats": g["quats"].clone(),
        "log_scales": g["log_scales"].clone(),
        "opacity": torch.full((len(g["means"]),), math.log(0.95 / 0.05)),
        "colors": g["colors"].clone(),
    }
    for v in p.values():
        v.requires_grad_(True)
    lrs = {"means": 0.05 * pixel, "quats": 0.005, "log_scales": 0.01, "opacity": 0.05, "colors": 0.01}
    opt = torch.optim.Adam([{"params": [p[k]], "lr": lr, "name": k} for k, lr in lrs.items()], eps=1e-15)
    window = _gauss_window()
    inv_mean = inv_depth.mean()
    # Gaussians the photo barely sees get tiny but consistent gradients, which
    # Adam rescales into full-size steps; their colors would drift into noise
    # that only shows up from other viewpoints. Keep them as initialized.
    with torch.no_grad():
        *_, vis = rasterize(p["means"], p["quats"], p["log_scales"], torch.sigmoid(p["opacity"]),
                            p["colors"], cam, visibility=True)
    frozen = vis < MIN_VISIBILITY
    initial = {k: v.detach().clone() for k, v in p.items()}
    print(f"  {int(frozen.sum()):,} Gaussians are hidden from the photo and stay fixed")

    def render():
        return rasterize(p["means"], p["quats"], p["log_scales"], torch.sigmoid(p["opacity"]),
                         p["colors"], cam)

    t0 = time.time()
    for it in range(iters + 1):
        img, acc, dep = render()
        l1 = (img - rgb).abs().mean()
        d_ssim = 1 - ssim(img, rgb, window)
        inv = acc / dep.clamp(min=1e-6)
        l_depth = (inv - inv_depth).abs().mean() / inv_mean
        loss = 0.8 * l1 + 0.2 * d_ssim + depth_weight * l_depth
        if it % log_every == 0 or it == iters:
            print(f"  step {it:4d}  PSNR {psnr(img.detach(), rgb):5.2f} dB  "
                  f"SSIM {1 - d_ssim.item():.4f}  depth err {l_depth.item():.4f}  "
                  f"({time.time() - t0:.0f}s)", flush=True)
        if it == iters:
            break
        opt.zero_grad(set_to_none=True)
        loss.backward()
        # Cosine decay of every learning rate to 10% over the run.
        f = 0.1 + 0.9 * 0.5 * (1 + math.cos(math.pi * it / iters))
        for group in opt.param_groups:
            group["lr"] = lrs[group["name"]] * f
        opt.step()
        with torch.no_grad():
            for k, v in p.items():
                v[frozen] = initial[k][frozen]

    with torch.no_grad():
        p["quats"] = p["quats"] / p["quats"].norm(dim=-1, keepdim=True)
    return {k: v.detach() for k, v in p.items()} | {"layer": g["layer"]}


def orbit_path(n, amplitude):
    """A gentle loop around the original viewpoint: (yaw, pitch) in radians."""
    a = math.radians(amplitude)
    for i in range(n):
        t = 2 * math.pi * i / n
        yield a * math.sin(t), 0.45 * a * math.sin(2 * t)


@torch.no_grad()
def render_preview(p, cam, target, path, frames, amplitude, background):
    tmp = path + ".frames"
    os.makedirs(tmp, exist_ok=True)
    opacity = torch.sigmoid(p["opacity"])
    for i, (yaw, pitch) in enumerate(orbit_path(frames, amplitude)):
        img, _, _ = rasterize(p["means"], p["quats"], p["log_scales"], opacity, p["colors"],
                              cam.orbit(target, yaw, pitch), background=background)
        Image.fromarray((img.clamp(0, 1) * 255).round().byte().numpy()).save(f"{tmp}/{i:04d}.png")
    if shutil.which("ffmpeg"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "24", "-i", f"{tmp}/%04d.png",
                        "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                        "-crf", "18", "-movflags", "+faststart", path], check=True)
    else:
        path = os.path.splitext(path)[0] + ".gif"
        ims = [Image.open(f"{tmp}/{i:04d}.png") for i in range(frames)]
        ims[0].save(path, save_all=True, append_images=ims[1:], duration=42, loop=0)
    shutil.rmtree(tmp)
    return path


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("photo")
    ap.add_argument("-o", "--out", default="out", help="output directory (default: out)")
    ap.add_argument("--size", type=int, default=512, help="long side of the working image in px (default: 512)")
    ap.add_argument("--iters", type=int, default=150, help="optimization steps (default: 150, 0 to skip)")
    ap.add_argument("--depth-ratio", type=float, default=3.0,
                    help="farthest / nearest depth; larger exaggerates the 3D (default: 3)")
    ap.add_argument("--depth-weight", type=float, default=0.1, help="weight of the depth term (default: 0.1)")
    ap.add_argument("--fov", type=float, default=55.0,
                    help="horizontal field of view in degrees when EXIF has no focal length (default: 55)")
    ap.add_argument("--fill", type=float, default=0.08,
                    help="how far to extend background behind edges, as a fraction of the long side (default: 0.08)")
    ap.add_argument("--preview-frames", type=int, default=96, help="frames in preview.mp4, 0 to skip (default: 96)")
    ap.add_argument("--preview-angle", type=float, default=7.0, help="preview orbit amplitude in degrees (default: 7)")
    ap.add_argument("--title", help="name shown in the viewer (default: the photo's file name)")
    args = ap.parse_args()

    torch.set_num_threads(os.cpu_count() or 4)
    os.makedirs(args.out, exist_ok=True)
    rgb_np, focal35 = load_photo(args.photo, args.size)
    h, w = rgb_np.shape[:2]
    fx = focal_px(w, h, focal35, args.fov)
    hfov = math.degrees(2 * math.atan(w / 2 / fx))
    print(f"photo {w}x{h}, focal {fx:.0f} px ({hfov:.0f} deg horizontal"
          f"{', from EXIF' if focal35 else ''})")

    t = time.time()
    disp = depth_model.predict_disparity(rgb_np)
    d = depth_model.sharpen_edges(depth_model.to_depth(disp, args.depth_ratio))
    print(f"depth: {time.time() - t:.1f}s")
    Image.fromarray((255 * (1 / d - 1 / args.depth_ratio) / (1 - 1 / args.depth_ratio))
                    .clip(0, 255).astype(np.uint8)).save(os.path.join(args.out, "depth.png"))

    rgb = torch.from_numpy(rgb_np)
    depth = torch.from_numpy(d)
    k = gaussians.Intrinsics(w, h, fx, fx, w / 2, h / 2)
    g = gaussians.from_photo(rgb, depth, k, fill_px=round(args.fill * max(w, h)))
    print(f"seeded {len(g['means']):,} Gaussians ({int(g['layer'].sum()):,} in the hidden background layer)")

    cam = Camera.identity(w, h, fx)
    print(f"optimizing {args.iters} steps")
    p = train(g, rgb, 1.0 / depth, cam, args.iters, args.depth_weight)

    keep = torch.sigmoid(p["opacity"]) > 1 / 255
    p = {k_: v[keep] for k_, v in p.items()}
    target = [0.0, 0.0, float(torch.median(p["means"][p["layer"] == 0, 2]))]
    meta = {
        "title": args.title or os.path.splitext(os.path.basename(args.photo))[0],
        "width": w, "height": h, "fx": fx, "fy": fx, "cx": w / 2, "cy": h / 2,
        "target": target, "count": int(keep.sum()), "depthRatio": args.depth_ratio,
    }

    ply = os.path.join(args.out, "scene.ply")
    export.write_ply(ply, p)
    splat = export.splat_bytes(p)
    with open(os.path.join(args.out, "scene.splat"), "wb") as f:
        f.write(splat)
    with open(os.path.join(args.out, "scene.json"), "w") as f:
        json.dump(meta, f, indent=2)
    with open(os.path.join(args.out, "viewer.html"), "w") as f:
        f.write(export.viewer_html(splat, meta))
    print(f"wrote {ply}, scene.splat, scene.json and viewer.html ({meta['count']:,} splats)")

    if args.preview_frames > 0:
        t = time.time()
        path = render_preview(p, cam, target, os.path.join(args.out, "preview.mp4"),
                              args.preview_frames, args.preview_angle, background=(0.07, 0.07, 0.08))
        print(f"wrote {path} ({time.time() - t:.0f}s)")


if __name__ == "__main__":
    main()
