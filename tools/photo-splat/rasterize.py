"""A differentiable 3D Gaussian splatting rasterizer in plain PyTorch (CPU).

It follows the reference 3DGS forward model (Kerbl et al. 2023): EWA projection
of each 3D covariance to screen space with a 0.3 px low-pass dilation, alpha =
opacity * exp(-0.5 d^T Sigma^-1 d) clamped to 0.99 and culled below 1/255, and
front-to-back compositing per pixel in depth order.

Instead of CUDA tiles it builds the full list of (pixel, Gaussian) pairs, sorts
it by (pixel, depth), and turns the per-pixel transmittance product into a
segmented cumulative sum of log(1 - alpha). Every step is a plain tensor op, so
autograd provides the backward pass.
"""

import math
from dataclasses import dataclass

import torch

ALPHA_MIN = 1.0 / 255.0
ALPHA_MAX = 0.99
NEAR = 0.02
MAX_PAIRS_PER_CHUNK = 6_000_000


@dataclass
class Camera:
    """Pinhole camera, OpenCV convention (x right, y down, z forward)."""

    width: int
    height: int
    fx: float
    fy: float
    cx: float
    cy: float
    R: torch.Tensor  # (3, 3) world -> camera rotation
    t: torch.Tensor  # (3,) world -> camera translation

    @staticmethod
    def identity(width, height, fx, fy=None):
        return Camera(width, height, fx, fy or fx, width / 2, height / 2,
                      torch.eye(3), torch.zeros(3))

    def orbit(self, target, yaw, pitch, zoom=1.0):
        """Same intrinsics, camera orbiting `target` (radians), source camera at yaw = pitch = 0."""
        cy_, sy_ = math.cos(yaw), math.sin(yaw)
        cp, sp = math.cos(pitch), math.sin(pitch)
        Ry = torch.tensor([[cy_, 0, sy_], [0, 1, 0], [-sy_, 0, cy_]])
        Rx = torch.tensor([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
        cam_to_world = Ry @ Rx
        target = torch.as_tensor(target).to(cam_to_world.dtype)
        center = target - cam_to_world @ torch.tensor([0.0, 0.0, float(target[2]) * zoom])
        R = cam_to_world.T
        return Camera(self.width, self.height, self.fx, self.fy, self.cx, self.cy, R, -R @ center)


def quat_to_rotmat(q):
    q = q / q.norm(dim=-1, keepdim=True)
    w, x, y, z = q.unbind(-1)
    return torch.stack([
        1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y),
        2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x),
        2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y),
    ], -1).reshape(-1, 3, 3)


def covariance(quats, log_scales):
    M = quat_to_rotmat(quats) * torch.exp(log_scales)[:, None, :]
    return M @ M.transpose(1, 2)


def project(means, cov3, cam):
    """Returns screen means (N, 2), conics (N, 3), camera depths (N,), pixel radii (N,), valid mask."""
    R, t = cam.R.to(means.dtype), cam.t.to(means.dtype)
    p = means @ R.T + t
    z = p[:, 2]
    valid = z > NEAR
    zs = torch.where(valid, z, torch.ones_like(z))
    # Clamp the Jacobian's evaluation point as the reference implementation does,
    # so Gaussians far outside the frustum don't blow up in screen space.
    lim_x = 1.3 * (cam.width / 2) / cam.fx
    lim_y = 1.3 * (cam.height / 2) / cam.fy
    tx = (p[:, 0] / zs).clamp(-lim_x, lim_x) * zs
    ty = (p[:, 1] / zs).clamp(-lim_y, lim_y) * zs
    zero = torch.zeros_like(zs)
    J = torch.stack([
        cam.fx / zs, zero, -cam.fx * tx / zs ** 2,
        zero, cam.fy / zs, -cam.fy * ty / zs ** 2,
    ], -1).reshape(-1, 2, 3)
    M = J @ R
    cov2 = M @ cov3 @ M.transpose(1, 2)
    a = cov2[:, 0, 0] + 0.3
    b = cov2[:, 0, 1]
    c = cov2[:, 1, 1] + 0.3
    det = a * c - b * b
    valid = valid & (det > 0)
    det = torch.where(valid, det, torch.ones_like(det))
    conic = torch.stack([c / det, -b / det, a / det], -1)
    mid = 0.5 * (a + c)
    lam = mid + torch.sqrt((mid * mid - det).clamp(min=0.1))
    radius = torch.ceil(3.0 * torch.sqrt(lam))
    uv = torch.stack([cam.fx * p[:, 0] / zs + cam.cx, cam.fy * p[:, 1] / zs + cam.cy], -1)
    on_screen = ((uv[:, 0] + radius > 0) & (uv[:, 0] - radius < cam.width)
                 & (uv[:, 1] + radius > 0) & (uv[:, 1] - radius < cam.height))
    return uv, conic, z, radius, valid & on_screen


def _power(dx, dy, A, B, C):
    return -0.5 * (A * dx * dx + C * dy * dy) - B * dx * dy


def _windows(max_radius):
    """Half-sizes of the square pixel windows: every radius up to 8, then doubling."""
    h, lo = 1, 0
    while lo < max_radius:
        yield lo, h
        lo, h = h, (h + 1 if h < 8 else h * 2)


@torch.no_grad()
def _pairs(uv, conic, opacity, radius, valid, width, height, max_radius):
    """All (pixel, Gaussian) pairs inside the 3-sigma ellipse with alpha >= 1/255."""
    pix, gid = [], []
    radius = radius.clamp(max=max_radius)
    for lo, h in _windows(max_radius):
        idx = (valid & (radius > lo) & (radius <= h)).nonzero().squeeze(1)
        off = torch.arange(-h, h + 1)
        for chunk in idx.split(max(1, MAX_PAIRS_PER_CHUNK // (2 * h + 1) ** 2)):
            u = uv[chunk, 0][:, None, None]
            v = uv[chunk, 1][:, None, None]
            cu, cv = torch.floor(u).long(), torch.floor(v).long()
            px = cu + off[None, None, :]
            py = cv + off[None, :, None]
            A, B, C = (c[:, None, None] for c in conic[chunk].unbind(-1))
            power = _power(px + 0.5 - u, py + 0.5 - v, A, B, C)
            keep = ((power >= -4.5)
                    & (opacity[chunk][:, None, None] * torch.exp(power) >= ALPHA_MIN)
                    & (px >= 0) & (px < width) & (py >= 0) & (py < height))
            i, row, col = keep.nonzero().unbind(-1)
            pix.append((cv[i, 0, 0] + off[row]) * width + cu[i, 0, 0] + off[col])
            gid.append(chunk[i])
    if not pix:
        return torch.zeros(0, dtype=torch.long), torch.zeros(0, dtype=torch.long)
    return torch.cat(pix), torch.cat(gid)


def rasterize(means, quats, log_scales, opacity, colors, cam, background=None, max_radius=64,
              visibility=False):
    """Render (H, W, C) color, (H, W) accumulated alpha and (H, W) alpha-weighted depth.

    opacity: (N,) in [0, 1]; colors: (N, C). Differentiable w.r.t. all Gaussian inputs.
    With `visibility=True` also returns each Gaussian's total blending weight over
    the image (about 1 for a Gaussian that fully covers one pixel), not differentiable.
    """
    cov3 = covariance(quats, log_scales)
    uv, conic, z, radius, valid = project(means, cov3, cam)
    pix, gid = _pairs(uv.detach(), conic.detach(), opacity.detach(), radius, valid,
                      cam.width, cam.height, max_radius)
    n_pix = cam.width * cam.height
    with torch.no_grad():
        rank = torch.empty_like(z, dtype=torch.long)
        rank[torch.argsort(z)] = torch.arange(z.numel())
        order = torch.argsort(pix * z.numel() + rank[gid])
        pix, gid = pix[order], gid[order]
        start = torch.ones_like(pix, dtype=torch.bool)
        start[1:] = pix[1:] != pix[:-1]
        segment = torch.cumsum(start.long(), 0) - 1
        px = (pix % cam.width).to(uv.dtype) + 0.5
        py = (pix // cam.width).to(uv.dtype) + 0.5

    # One gather per pair for everything the backward pass needs.
    g = torch.cat([uv, conic, opacity[:, None], z[:, None], colors], 1)[gid]
    power = _power(px - g[:, 0], py - g[:, 1], g[:, 2], g[:, 3], g[:, 4])
    alpha = (g[:, 5] * torch.exp(power)).clamp(max=ALPHA_MAX)
    # Transmittance T_i = prod_{j<i, same pixel} (1 - alpha_j), as an exclusive
    # segmented cumsum in log space. float64 keeps the long running sum exact.
    log_t = torch.log1p(-alpha).double()
    excl = torch.cumsum(log_t, 0) - log_t
    T = torch.exp(excl - excl[start][segment]).to(alpha.dtype)
    w = T * alpha

    C = colors.shape[1]
    out = torch.zeros(n_pix, C + 2, dtype=w.dtype).index_add(
        0, pix, w[:, None] * torch.cat([g[:, 7:], torch.ones_like(w)[:, None], g[:, 6:7]], 1))
    img, acc, dep = out[:, :C], out[:, C], out[:, C + 1]
    if background is not None:
        img = img + (1 - acc)[:, None] * torch.as_tensor(background, dtype=img.dtype)
    H, W = cam.height, cam.width
    out = img.reshape(H, W, C), acc.reshape(H, W), dep.reshape(H, W)
    if visibility:
        out += (torch.zeros(len(means), dtype=w.dtype).index_add(0, gid, w.detach()),)
    return out
