"""Write trained Gaussians as a 3DGS .ply, a .splat file and a self-contained viewer."""

import base64
import html
import json
import os

import numpy as np
import torch

SH_C0 = 0.28209479177387814
VIEWER_TEMPLATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "viewer.html")
PLY_FIELDS = (["x", "y", "z", "nx", "ny", "nz", "f_dc_0", "f_dc_1", "f_dc_2", "opacity"]
              + [f"scale_{i}" for i in range(3)] + [f"rot_{i}" for i in range(4)])


def write_ply(path, p):
    """The PLY layout written by the reference 3DGS trainer (SH degree 0), which
    SuperSplat, PlayCanvas, nerfstudio and most splat viewers read."""
    n = len(p["means"])
    cols = torch.cat([
        p["means"],
        torch.zeros(n, 3),
        (p["colors"].clamp(0, 1) - 0.5) / SH_C0,
        p["opacity"][:, None],
        p["log_scales"],
        p["quats"],
    ], 1).numpy().astype("<f4")
    header = ("ply\nformat binary_little_endian 1.0\n"
              f"element vertex {n}\n"
              + "".join(f"property float {name}\n" for name in PLY_FIELDS)
              + "end_header\n")
    with open(path, "wb") as f:
        f.write(header.encode("ascii"))
        f.write(cols.tobytes())


def splat_bytes(p):
    """The 32-byte-per-splat .splat layout: position and scale as float32 x3,
    RGBA as uint8 x4, rotation quaternion (w, x, y, z) as uint8 x4."""
    n = len(p["means"])
    out = np.zeros(n, dtype=[("pos", "<f4", 3), ("scale", "<f4", 3), ("rgba", "u1", 4), ("rot", "u1", 4)])
    out["pos"] = p["means"].numpy()
    out["scale"] = torch.exp(p["log_scales"]).numpy()
    rgba = torch.cat([p["colors"].clamp(0, 1), torch.sigmoid(p["opacity"])[:, None]], 1)
    out["rgba"] = (rgba * 255).round().byte().numpy()
    q = p["quats"] / p["quats"].norm(dim=-1, keepdim=True)
    out["rot"] = (q * 128 + 128).round().clamp(0, 255).byte().numpy()
    return out.tobytes()


def viewer_html(splat, meta, standalone=True):
    """Fill the viewer template with this scene.

    standalone=False returns the page body alone, for hosts that supply the
    document skeleton themselves.
    """
    with open(VIEWER_TEMPLATE) as f:
        page = f.read()
    page = (page.replace("__TITLE__", html.escape(f"{meta['title']} Splat"))
            .replace("__SPLAT_META__", json.dumps(meta).replace("</", "<\\/"))
            .replace("__SPLAT_DATA__", base64.b64encode(splat).decode("ascii")))
    if not standalone:
        return page
    head, body = page.split("<!-- body -->", 1)
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f"{head}</head>\n<body>{body}</body>\n</html>\n")
