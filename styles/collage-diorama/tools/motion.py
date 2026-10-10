# Per-frame motion analysis: dense optical flow (Farneback) on a 368px-wide proxy.
# Outputs CSV: t, mean flow magnitude (px/frame at 736 width), median dx, median dy,
# zoom (divergence), rotation (curl), frame diff (mean abs luma change), sharpness (laplacian var)
import sys, cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS)
prev = None; rows = []; i = 0
W = 368
while True:
    ok, f = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(f, (W, int(f.shape[0]*W/f.shape[1]))), cv2.COLOR_BGR2GRAY)
    sharp = cv2.Laplacian(g, cv2.CV_64F).var()
    if prev is not None:
        fl = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 4, 21, 3, 5, 1.1, 0)
        mag = np.linalg.norm(fl, axis=2) * (736/W)
        h, w = g.shape
        ys, xs = np.mgrid[0:h, 0:w]
        cx, cy = xs - w/2, ys - h/2
        r2 = cx**2 + cy**2 + 1e-6
        div = np.median((fl[...,0]*cx + fl[...,1]*cy) / r2)   # >0 zoom in / push
        curl = np.median((fl[...,1]*cx - fl[...,0]*cy) / r2)  # rotation rad/frame
        diff = np.abs(g.astype(np.float32) - prev.astype(np.float32)).mean()
        rows.append((i/fps, mag.mean(), np.median(fl[...,0])*(736/W), np.median(fl[...,1])*(736/W), div, curl, diff, sharp))
    prev = g; i += 1
np.savetxt(out, np.array(rows), delimiter=',', header='t,mag,dx,dy,zoom,rot,diff,sharp', fmt='%.5f', comments='')
print(i, 'frames', fps)
