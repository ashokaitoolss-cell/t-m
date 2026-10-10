# Speed graph from motion.csv using only new images (held frames dropped), plus zoom and roll.
# usage: speed_graph.py motion.csv out.png out_steps.csv
import sys, numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
d = np.genfromtxt(sys.argv[1], delimiter=',', names=True)
keep = d['diff'] >= 0.35
step = np.median(np.diff(d['t'][keep]))          # seconds per new image
k = step / np.median(np.diff(d['t']))            # frames per new image (2 on twos)
t = d['t'][keep]; v = d['mag'][keep] * k; zoom = d['zoom'][keep] * 1000 * k; rot = np.degrees(d['rot'][keep]) * k
sm = lambda x: np.convolve(x, np.ones(3) / 3, mode='same')
fig, ax = plt.subplots(2, 1, figsize=(18, 7), sharex=True)
ax[0].fill_between(t, sm(v), alpha=.35); ax[0].plot(t, sm(v), lw=1.4); ax[0].set_ylabel('screen speed\npx per new image')
ax[1].plot(t, sm(zoom), lw=1.2, color='C2', label='zoom ‰ per image (+ in / − out)')
ax[1].plot(t, sm(rot) * 10, lw=1.2, color='C3', label='roll deg×10 per image'); ax[1].axhline(0, color='k', lw=.5); ax[1].legend(loc='lower left')
for a in ax: a.grid(alpha=.25); a.set_xticks(np.arange(0, t[-1] + 1, 1))
ax[1].set_xlabel('seconds'); plt.tight_layout(); plt.savefig(sys.argv[2], dpi=80)
np.savetxt(sys.argv[3], np.c_[t, v, zoom, rot], delimiter=',', fmt='%.4f',
           header='t,speed_px_per_step,zoom_permil_per_step,roll_deg_per_step', comments='')
