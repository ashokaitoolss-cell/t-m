# photo-splat

Turn **one photo** into a 3D Gaussian splat on an ordinary CPU in a few minutes, then
orbit around it in the browser.

```sh
pip install -r requirements.txt
python photo2splat.py photo.jpg -o out/
open out/viewer.html
```

The first run downloads the depth model (Depth Anything V2 Small, ~99 MB, Apache-2.0)
to `~/.cache/photo-splat/`.

## What you get

| file | what it is |
| --- | --- |
| `viewer.html` | Self-contained WebGL 2 viewer with the splat embedded. Drag to orbit, scroll or pinch to zoom, shift-drag to pan. |
| `scene.ply` | Standard 3DGS PLY (SH degree 0). Opens in SuperSplat, PlayCanvas, nerfstudio and most splat tools. OpenCV axes: x right, y down, z forward. |
| `scene.splat` | The compact 32-byte-per-splat `.splat` format. |
| `scene.json` | Camera intrinsics and orbit target used by the viewer. |
| `preview.mp4` | A short orbit around the original viewpoint, rendered by the trainer's own rasterizer. |
| `depth.png` | The estimated depth (bright = near). |

## How it works

Classic Gaussian splatting reconstructs a scene from dozens of photos with known camera
poses. With a single photo there is no parallax to triangulate from, so the geometry has
to come from a learned prior:

1. **Depth.** Depth Anything V2 predicts relative inverse depth. It is mapped onto
   `[1, depth_ratio]` scene units, and pixels on object boundaries are snapped to the
   nearer side so edges don't smear into floating streaks (`depth.py`).
2. **Seeding.** Every pixel becomes a flat Gaussian lying on the depth surface. Its
   covariance spans the pixel's exact footprint, built from the surface tangents
   dP/du and dP/dv, so the very first render already reproduces the photo. Behind
   foreground edges, a hidden layer grows the background inward so that a moving camera
   reveals plausible background instead of holes (`gaussians.py`).
3. **Optimization.** Position, rotation, scale, opacity and color are fitted to the photo
   with the 3DGS loss (0.8 L1 + 0.2 D-SSIM) plus a depth term that keeps the geometry on
   the predicted surface. Gaussians the photo can't see are frozen. Adam would otherwise
   turn their tiny gradients into full-size steps and fill the edges with colored noise
   (`photo2splat.py`).
4. **Rasterizer.** `rasterize.py` is a differentiable 3DGS rasterizer in plain PyTorch:
   EWA projection with the 0.3 px low-pass, alpha clamped to 0.99 and culled below
   1/255, front-to-back compositing. It enumerates (pixel, Gaussian) pairs, sorts them by
   pixel then depth, and computes the transmittance products as a segmented cumulative sum
   of `log(1 - alpha)` in float64, so autograd provides the backward pass. Its forward
   output matches a brute-force per-pixel compositor to 1e-14, and its gradients match
   finite differences, in float64.

The viewer (`viewer.html`) draws the same model: same projection, low-pass, 3-sigma cutoff
and alpha clamp, with a far-to-near depth sort in a Web Worker. Its first frame lines up
with the photo.

## What to expect

- The result is **2.5D**. It holds up within roughly ±15° of the original viewpoint.
  Beyond that you see the edges of the hidden layer and the backs of objects, which no
  single photo contains. Generating unseen sides needs a generative image-to-3D model,
  which is outside what this tool does.
- Scale is relative. `--depth-ratio` sets how far the farthest surface is compared with
  the nearest. Raise it for landscapes, lower it for flat subjects.
- If the photo has EXIF focal length (35 mm equivalent), it sets the field of view.
  Otherwise `--fov` (default 55°) does.
- At the default `--size 512` a run takes about 3 to 4 minutes on 4 CPU cores. The
  rasterizer runs in plain PyTorch, so a GPU isn't needed.

## Options

```
--size 512          long side of the working image, in px
--iters 150         optimization steps (0 = keep the seeded splat as is)
--depth-ratio 3     farthest / nearest depth
--depth-weight 0.1  weight of the depth term
--fov 55            horizontal FOV when EXIF has no focal length
--fill 0.08         how far the hidden background layer reaches behind edges
--preview-frames 96 frames in preview.mp4 (0 = skip)
--preview-angle 7   preview orbit amplitude, in degrees
--title NAME        name shown in the viewer
```
