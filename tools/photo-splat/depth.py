"""Monocular depth from a single photo with Depth Anything V2 Small (Apache-2.0).

The network predicts relative inverse depth (affine-invariant disparity), so the
metric scale is unknown. `to_depth` maps it onto [1, depth_ratio] scene units:
the nearest surface sits one unit from the camera, the farthest `depth_ratio`.
"""

import os
import urllib.request

import numpy as np
import torch
import torch.nn.functional as F

MODEL_URL = ("https://huggingface.co/onnx-community/depth-anything-v2-small/"
             "resolve/main/onnx/model.onnx")
MODEL_PATH = os.path.expanduser("~/.cache/photo-splat/depth_anything_v2_small.onnx")
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)


def _model_path():
    if not os.path.exists(MODEL_PATH):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        print(f"downloading depth model to {MODEL_PATH} (~99 MB)")
        tmp = MODEL_PATH + ".part"
        urllib.request.urlretrieve(MODEL_URL, tmp)
        os.replace(tmp, MODEL_PATH)
    return MODEL_PATH


def predict_disparity(rgb, long_side=518):
    """rgb: float32 (H, W, 3) in [0, 1]. Returns relative disparity (H, W), larger = nearer."""
    import onnxruntime as ort

    h, w = rgb.shape[:2]
    s = long_side / max(h, w)
    nh, nw = max(14, round(h * s / 14) * 14), max(14, round(w * s / 14) * 14)
    x = torch.from_numpy(rgb).permute(2, 0, 1)[None]
    x = F.interpolate(x, size=(nh, nw), mode="bicubic", align_corners=False).clamp(0, 1)
    x = ((x[0].permute(1, 2, 0).numpy() - MEAN) / STD).transpose(2, 0, 1)[None]
    sess = ort.InferenceSession(_model_path(), providers=["CPUExecutionProvider"])
    disp = sess.run(None, {"pixel_values": x.astype(np.float32)})[0]
    disp = torch.from_numpy(disp).reshape(1, 1, *disp.shape[-2:])
    return F.interpolate(disp, size=(h, w), mode="bilinear", align_corners=False)[0, 0].numpy()


def to_depth(disp, depth_ratio=3.0):
    lo, hi = np.percentile(disp, [1.0, 99.5])
    n = np.clip((disp - lo) / max(hi - lo, 1e-6), 0.0, 1.0)
    inv = 1.0 / depth_ratio + n * (1.0 - 1.0 / depth_ratio)
    return (1.0 / inv).astype(np.float32)


def sharpen_edges(depth, window=5, threshold=0.06):
    """Snap pixels on a depth discontinuity to the nearer of the local min / max.

    Monocular depth smears object boundaries into ramps; back-projected, those
    ramp pixels become streaks floating between foreground and background.
    """
    d = torch.from_numpy(depth)[None, None]
    pad = window // 2
    dmax = F.max_pool2d(F.pad(d, (pad,) * 4, mode="replicate"), window, stride=1)
    dmin = -F.max_pool2d(F.pad(-d, (pad,) * 4, mode="replicate"), window, stride=1)
    edge = torch.log(dmax / dmin) > threshold
    snapped = torch.where(d - dmin < dmax - d, dmin, dmax)
    return torch.where(edge, snapped, d)[0, 0].numpy()
