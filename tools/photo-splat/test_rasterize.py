"""Checks for the PyTorch rasterizer. Run with `python test_rasterize.py` or pytest.

The forward pass is compared with a straightforward per-pixel compositor, and
the backward pass with central finite differences, both in float64.
"""

import torch

import gaussians
import rasterize as rz

W, H = 24, 18


def _scene(n=60, seed=0):
    g = torch.Generator().manual_seed(seed)
    means = torch.randn(n, 3, generator=g) * torch.tensor([0.4, 0.3, 0.3]) + torch.tensor([0, 0, 2.0])
    quats = torch.randn(n, 4, generator=g)
    log_scales = torch.log(torch.rand(n, 3, generator=g) * 0.08 + 0.01)
    opacity = torch.rand(n, generator=g) * 0.9 + 0.05
    colors = torch.rand(n, 3, generator=g)
    cam = rz.Camera.identity(W, H, 20.0).orbit((0, 0, 2.0), 0.2, -0.1)
    return [x.double() for x in (means, quats, log_scales, opacity, colors)], cam


def _reference(means, quats, log_scales, opacity, colors, cam):
    """Composite every pixel front to back over all Gaussians, one at a time."""
    uv, conic, z, _, valid = rz.project(means, rz.covariance(quats, log_scales), cam)
    img = torch.zeros(H, W, 3, dtype=means.dtype)
    acc = torch.zeros(H, W, dtype=means.dtype)
    order = [g for g in torch.argsort(z).tolist() if valid[g]]
    for y in range(H):
        for x in range(W):
            T = 1.0
            for g in order:
                dx, dy = x + 0.5 - uv[g, 0], y + 0.5 - uv[g, 1]
                A, B, C = conic[g]
                power = -0.5 * (A * dx * dx + C * dy * dy) - B * dx * dy
                if power > 0 or power < -4.5:
                    continue
                a = min(rz.ALPHA_MAX, float(opacity[g] * torch.exp(power)))
                if a < rz.ALPHA_MIN:
                    continue
                img[y, x] += T * a * colors[g]
                acc[y, x] += T * a
                T *= 1 - a
    return img, acc


def test_forward_matches_reference():
    params, cam = _scene()
    img, acc, _ = rz.rasterize(*params, cam)
    ref_img, ref_acc = _reference(*params, cam)
    assert acc.mean() > 0.1
    assert torch.allclose(img, ref_img, atol=1e-10)
    assert torch.allclose(acc, ref_acc, atol=1e-10)


def test_gradients_match_finite_differences():
    params, cam = _scene()
    params = [p.clone().requires_grad_(True) for p in params]
    target = torch.rand(H, W, 3, generator=torch.Generator().manual_seed(1), dtype=torch.float64)

    def loss(ps):
        img, _, dep = rz.rasterize(*ps, cam)
        return ((img - target) ** 2).sum() + 0.1 * (dep ** 2).sum()

    loss(params).backward()
    eps = 1e-6
    for i, p in enumerate(params):
        grad = p.grad.flatten()
        for k in torch.argsort(grad.abs(), descending=True)[:5].tolist():
            ps = [q.detach().clone() for q in params]
            ps[i].view(-1)[k] += eps
            up = loss(ps).item()
            ps[i].view(-1)[k] -= 2 * eps
            down = loss(ps).item()
            fd = (up - down) / (2 * eps)
            assert abs(fd - grad[k].item()) <= 1e-4 * max(abs(fd), 1e-3), (i, k, fd, grad[k].item())


def test_quaternion_round_trip():
    q = torch.randn(500, 4, generator=torch.Generator().manual_seed(2))
    q = q / q.norm(dim=-1, keepdim=True)
    back = gaussians.rotmat_to_quat(rz.quat_to_rotmat(q))
    same_sign = torch.sign((q * back).sum(-1, keepdim=True))
    assert torch.allclose(q, back * same_sign, atol=1e-5)


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print(f"ok  {name}")
