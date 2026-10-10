import sys, cv2, numpy as np
y0, y1 = int(sys.argv[3]), int(sys.argv[4])   # active picture rows (letterbox removed)
cap = cv2.VideoCapture(sys.argv[1]); fps = cap.get(cv2.CAP_PROP_FPS)
frames=[]; ts=[]; i=0
while True:
    ok,f = cap.read()
    if not ok: break
    if i % 12 == 0: frames.append(f[y0:y1].copy()); ts.append(i / fps)
    i+=1
F = np.stack(frames).astype(np.float32)
hsv = np.stack([cv2.cvtColor(f, cv2.COLOR_BGR2HSV) for f in frames]).astype(np.float32)
lab = np.stack([cv2.cvtColor(f, cv2.COLOR_BGR2LAB) for f in frames]).astype(np.float32)
L = lab[...,0]*100/255
print('luma: mean %.1f  p5 %.1f  p95 %.1f (L*)' % (L.mean(), np.percentile(L,5), np.percentile(L,95)))
print('black point min L* per frame median %.1f ; white point max per frame median %.1f' % (np.median(L.reshape(len(F),-1).min(1)), np.median(L.reshape(len(F),-1).max(1))))
print('saturation mean %.2f  p90 %.2f' % (hsv[...,1].mean()/255, np.percentile(hsv[...,1],90)/255))
a, b = lab[...,1]-128, lab[...,2]-128
print('mean a* %.1f  b* %.1f (positive b* = warm/yellow)' % (a.mean(), b.mean()))
# shadows/highlights tint
sh = L < 25; hi = L > 75
print('shadow tint a*/b*: %.1f %.1f   highlight tint a*/b*: %.1f %.1f' % (a[sh].mean(), b[sh].mean(), a[hi].mean(), b[hi].mean()))
# vignette: corner vs center luminance
h, w = L.shape[1:]
c = L[:, h//3:2*h//3, w//3:2*w//3].mean(); k = np.concatenate([L[:, :h//5, :w//6].ravel(), L[:, :h//5, -w//6:].ravel(), L[:, -h//5:, :w//6].ravel(), L[:, -h//5:, -w//6:].ravel()]).mean()
print('vignette: center L %.1f corners L %.1f (ratio %.2f)' % (c, k, k/c))
# depth of field: sharpness center vs border
def lap(x): return cv2.Laplacian(x, cv2.CV_64F).var()
g = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
cs = np.median([lap(x[h//4:3*h//4, w//4:3*w//4]) for x in g]); es = np.median([lap(np.concatenate([x[:h//6].ravel(), x[-h//6:].ravel()]).reshape(-1, w)) for x in g])
print('sharpness center %.0f vs top/bottom bands %.0f' % (cs, es))
# grain: residual std after small blur in low-texture areas
res=[]
for x in g:
    xf = x.astype(np.float32); bl = cv2.GaussianBlur(xf,(0,0),1.5); r = xf-bl
    tex = cv2.GaussianBlur(np.abs(cv2.Laplacian(bl, cv2.CV_32F)),(0,0),3)
    m = tex < np.percentile(tex, 20)
    res.append(r[m].std())
print('grain (residual std in flat areas, 0-255): %.2f' % np.median(res))
# palette by k-means over all sampled pixels (Lab)
px = cv2.resize(np.concatenate(frames, axis=1), None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
X = cv2.cvtColor(px, cv2.COLOR_BGR2LAB).reshape(-1,3).astype(np.float32)
crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 50, 0.5)
_, lbl, cen = cv2.kmeans(X, 12, None, crit, 4, cv2.KMEANS_PP_CENTERS)
cnt = np.bincount(lbl.ravel(), minlength=12)/len(lbl)
rgb = cv2.cvtColor(cen.reshape(1,-1,3).astype(np.uint8), cv2.COLOR_LAB2RGB).reshape(-1,3)
order = np.argsort(-cnt)
print('palette (share, hex):')
for o in order: print('  %4.1f%%  #%02X%02X%02X' % (cnt[o]*100, *rgb[o]))
# swatch image
sw = np.zeros((80, 960, 3), np.uint8); x0=0
for o in order:
    ww = int(round(cnt[o]*960)); sw[:, x0:x0+ww] = rgb[o][::-1]; x0+=ww
cv2.imwrite(sys.argv[2], sw)
