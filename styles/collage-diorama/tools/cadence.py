# Prints, per second, how many frames are new images vs. held duplicates ('#' new, '.' held).
# A '#.#.#.' pattern is animation on twos (12 images/s in a 24 fps file).
import sys, numpy as np
d = np.genfromtxt(sys.argv[1], delimiter=',', names=True)
t, held = d['t'], d['diff'] < 0.35
for s in range(int(t[-1]) + 1):
    m = (t >= s) & (t < s + 1)
    print(f"{s:3d}s  new/s={(~held[m]).sum():2d}  " + ''.join('.' if h else '#' for h in held[m]))
