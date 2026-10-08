"""Seed 3D Gaussians from a photo and its depth map.

Every pixel becomes a flat Gaussian (a surfel) lying on the depth surface and
sized to cover exactly that pixel's footprint, so the very first render from
the photo's viewpoint already reproduces the photo. A second, hidden layer
extends the background a little way behind foreground edges, so that moving
the camera reveals plausible background instead of holes.
"""

from dataclasses import dataclass

import torch
import torch.nn.functional as F

FOOTPRINT_SIGMA = 0.6  # surfel std-dev, in units of the spacing between samples
THICKNESS = 0.1  # surfel thickness along its normal, relative to its pixel footprint


@dataclass
class Intrinsics:
    width: int
    height: int
    fx: float
    fy: float
    cx: float
    cy: float


def _pixel_grid(h, w, k):
    v, u = torch.meshgrid(torch.arange(h) + 0.5, torch.arange(w) + 0.5, indexing="ij")
    return (u - k.cx) / k.fx, (v - k.cy) / k.fy


def _minmod(a, b):
    """The smaller one-sided difference, or zero at a local extremum.

    At a depth discontinuity one side is huge and the other is not, so this
    measures the surface's slope without bridging the gap to the other object.
    """
    return torch.where(a * b > 0, torch.where(a.abs() < b.abs(), a, b), torch.zeros_like(a))


def surface_tangents(depth, k, max_slope=8.0):
    """dP/du and dP/dv of the back-projected depth surface, per pixel. (H, W, 3) each."""
    d = depth
    p = F.pad(d[None, None], (1, 1, 1, 1), mode="replicate")[0, 0]
    du = _minmod(p[1:-1, 2:] - d, d - p[1:-1, :-2])
    dv = _minmod(p[2:, 1:-1] - d, d - p[:-2, 1:-1])
    # Cap grazing angles: a surfel may stretch to at most `max_slope` pixel widths in depth.
    du = torch.maximum(torch.minimum(du, max_slope * d / k.fx), -max_slope * d / k.fx)
    dv = torch.maximum(torch.minimum(dv, max_slope * d / k.fy), -max_slope * d / k.fy)
    x, y = _pixel_grid(*d.shape, k)
    t_u = torch.stack([d / k.fx + x * du, y * du, du], -1)
    t_v = torch.stack([x * dv, d / k.fy + y * dv, dv], -1)
    return t_u, t_v


def rotmat_to_quat(R):
    """(N, 3, 3) proper rotations -> (N, 4) unit quaternions (w, x, y, z)."""
    m = R
    q2 = torch.stack([
        1 + m[:, 0, 0] + m[:, 1, 1] + m[:, 2, 2],
        1 + m[:, 0, 0] - m[:, 1, 1] - m[:, 2, 2],
        1 - m[:, 0, 0] + m[:, 1, 1] - m[:, 2, 2],
        1 - m[:, 0, 0] - m[:, 1, 1] + m[:, 2, 2],
    ], -1)
    best = q2.argmax(-1)
    s = 0.5 * torch.sqrt(q2.gather(1, best[:, None]).clamp(min=1e-12))[:, 0]
    f = 0.25 / s
    a = m[:, 2, 1] - m[:, 1, 2]
    b = m[:, 0, 2] - m[:, 2, 0]
    c = m[:, 1, 0] - m[:, 0, 1]
    xy = m[:, 0, 1] + m[:, 1, 0]
    xz = m[:, 0, 2] + m[:, 2, 0]
    yz = m[:, 1, 2] + m[:, 2, 1]
    cases = torch.stack([
        torch.stack([s, a * f, b * f, c * f], -1),
        torch.stack([a * f, s, xy * f, xz * f], -1),
        torch.stack([b * f, xy * f, s, yz * f], -1),
        torch.stack([c * f, xz * f, yz * f, s], -1),
    ], 1)
    q = cases[torch.arange(len(m)), best]
    return q / q.norm(dim=-1, keepdim=True)


def surfels(points, t_u, t_v, spacing):
    """Gaussians spanning the parallelogram (t_u, t_v) around each point.

    Returns means (N, 3), quats (N, 4) and log-scales (N, 3).
    """
    n = torch.cross(t_u, t_v, dim=-1)
    n = n / n.norm(dim=-1, keepdim=True).clamp(min=1e-12)
    footprint = torch.sqrt(t_u.norm(dim=-1) * t_v.norm(dim=-1))
    s = FOOTPRINT_SIGMA * spacing
    cov = (s * s * (t_u[:, :, None] * t_u[:, None, :] + t_v[:, :, None] * t_v[:, None, :])
           + (THICKNESS * footprint)[:, None, None] ** 2 * n[:, :, None] * n[:, None, :])
    evals, evecs = torch.linalg.eigh(cov.double())
    evecs = evecs * torch.where(torch.linalg.det(evecs) < 0, -1.0, 1.0)[:, None, None]
    quats = rotmat_to_quat(evecs).float()
    log_scales = 0.5 * torch.log(evals.clamp(min=1e-20)).float()
    return points, quats, log_scales


def _local_max(x, radius):
    return F.max_pool2d(F.pad(x[None, None], (radius,) * 4, mode="replicate"), 2 * radius + 1, stride=1)[0, 0]


def disocclusion_layer(rgb, depth, width_px, gap=0.04, edge_px=3):
    """Guess the background hidden behind foreground edges.

    Wherever depth jumps by more than `gap` (relative) between neighboring
    pixels, the near side may slide off the far side when the camera moves.
    Near-side pixels within `width_px` of such a step get a hidden background
    value, grown one pixel per iteration from the farthest neighbors that are
    clearly farther than themselves, and replaced whenever something farther
    arrives. Every pixel offers its current value, so the background spreads
    inward from the far side of each step. Pixels within
    `edge_px` of a step offer nothing of their own: right at a boundary, color
    and depth edges don't line up exactly, so those pixels can carry the
    foreground's color.

    Returns (mask, depth, rgb) of the hidden background layer.
    """
    # The far side's depth at every step, spread over `width_px`; a pixel needs
    # hidden background only if it is clearly nearer than a step's far side.
    far = _local_max(depth, 1)
    step_far = torch.where(far > depth * (1 + gap), far, torch.zeros_like(far))
    region = _local_max(step_far, width_px) > depth * (1 + gap)
    near_edge = _local_max(depth, edge_px) > -_local_max(-depth, edge_px) * (1 + gap)
    offers = ~near_edge  # pixels whose current (bg_d, bg_c) neighbors may take
    filled = torch.zeros_like(region)
    bg_d, bg_c = depth.clone(), rgb.clone()
    h, w = depth.shape

    def farthest(ok, nb_d, nb_c):
        """Mean depth and color of the acceptable neighbors near the farthest
        one: the background should win over any foreground slope that also
        qualifies, without copying single pixels into streaks."""
        best = torch.where(ok, nb_d, torch.full_like(nb_d, -1.0)).amax(0)
        ok = ok & (nb_d >= best * (1 - gap / 2))
        n = ok.sum(0).clamp(min=1).float()
        return (nb_d * ok).sum(0) / n, ((nb_c * ok).sum(1) / n).permute(1, 2, 0)

    for _ in range(width_px + edge_px + 2):
        nb_offers = F.unfold(F.pad(offers[None, None].float(), (1,) * 4), 3).reshape(9, h, w) > 0
        nb_d = F.unfold(F.pad(bg_d[None, None], (1,) * 4, mode="replicate"), 3).reshape(9, h, w)
        nb_c = F.unfold(F.pad(bg_c.permute(2, 0, 1)[None], (1,) * 4, mode="replicate"), 3)
        nb_c = nb_c.reshape(3, 9, h, w)
        # Pixels that need hidden background take only clearly farther values,
        # and trade up whenever a farther one arrives: a foreground slope next
        # door qualifies sooner than the background across the step.
        farther = nb_offers & (nb_d > depth * (1 + gap / 2))
        fd, fc = farthest(farther, nb_d, nb_c)
        fill = region & farther.any(0) & (~filled | (fd > bg_d))
        # Pixels by a step relay anything not clearly nearer than themselves, so
        # values reach across the band whose own colors are untrustworthy.
        similar = nb_offers & (nb_d > depth * (1 - gap / 2))
        relay = near_edge & ~offers & ~fill & similar.any(0)
        if not (fill.any() or relay.any()):
            break
        rd, rc = farthest(similar, nb_d, nb_c)
        bg_d = torch.where(fill, fd, torch.where(relay, rd, bg_d))
        bg_c = torch.where(fill[..., None], fc, torch.where(relay[..., None], rc, bg_c))
        filled = filled | fill
        offers = offers | fill | relay
    return filled, bg_d, bg_c


def from_photo(rgb, depth, k, fill_px):
    """rgb (H, W, 3) and depth (H, W) torch tensors -> dict of Gaussian parameters."""
    h, w = depth.shape
    x, y = _pixel_grid(h, w, k)
    points = torch.stack([x * depth, y * depth, depth], -1)

    t_u, t_v = surface_tangents(depth, k)
    front = surfels(points.reshape(-1, 3), t_u.reshape(-1, 3), t_v.reshape(-1, 3), 1.0)
    colors = [rgb.reshape(-1, 3)]
    layer = [torch.zeros(h * w, dtype=torch.uint8)]

    means, quats, log_scales = [front[0]], [front[1]], [front[2]]
    if fill_px > 0:
        mask, bg_d, bg_c = disocclusion_layer(rgb, depth, fill_px)
        # The hidden layer is filler, so it gets one larger surfel per 2x2 block
        # that holds any hidden pixel; thin structures such as hair keep theirs.
        block_sum = lambda t: F.avg_pool2d(t[None], 2, ceil_mode=True, divisor_override=1)[0]
        m = mask.float()
        cnt = block_sum(m[None])[0]
        sel = cnt > 0
        d = (block_sum((bg_d * m)[None])[0] / cnt.clamp(min=1))[sel]
        c = (block_sum((bg_c * m[..., None]).permute(2, 0, 1)) / cnt.clamp(min=1)).permute(1, 2, 0)[sel]
        v, u = torch.meshgrid(torch.arange(sel.shape[0]) * 2.0 + 1, torch.arange(sel.shape[1]) * 2.0 + 1,
                              indexing="ij")
        bx, by = ((u - k.cx) / k.fx)[sel], ((v - k.cy) / k.fy)[sel]
        pts = torch.stack([bx * d, by * d, d], -1)
        zero = torch.zeros_like(d)
        tu = torch.stack([d / k.fx, zero, zero], -1)
        tv = torch.stack([zero, d / k.fy, zero], -1)
        back = surfels(pts, tu, tv, 2.0)
        means.append(back[0])
        quats.append(back[1])
        log_scales.append(back[2])
        colors.append(c)
        layer.append(torch.ones(len(d), dtype=torch.uint8))

    return {
        "means": torch.cat(means),
        "quats": torch.cat(quats),
        "log_scales": torch.cat(log_scales),
        "colors": torch.cat(colors),
        "layer": torch.cat(layer),
    }
