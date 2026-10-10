# Speed graph and value graph (cumulative travel) for chosen moves.
# usage: ease_profiles.py steps.csv out.png "Label:start:end" ...
import sys, numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
d = np.genfromtxt(sys.argv[1], delimiter=',', names=True)
t, v = d['t'], d['speed_px_per_step']
moves = [(m.rsplit(':', 2)[0], float(m.rsplit(':', 2)[1]), float(m.rsplit(':', 2)[2])) for m in sys.argv[3:]]
fig, ax = plt.subplots(2, len(moves), figsize=(4 * len(moves), 6.5), squeeze=False)
for i, (name, a, b) in enumerate(moves):
    m = (t >= a) & (t <= b); tt, vv = t[m] - a, v[m]
    ax[0, i].step(tt, vv, where='post', lw=1.6); ax[0, i].set_title(name, fontsize=9); ax[0, i].set_ylim(0, max(45, vv.max() * 1.1))
    ax[1, i].step(tt, np.cumsum(vv) / vv.sum() * 100, where='post', lw=1.6, color='C2'); ax[1, i].set_ylim(0, 105)
    ax[1, i].set_xlabel('seconds into move')
    for r in (0, 1): ax[r, i].grid(alpha=.3)
ax[0, 0].set_ylabel('SPEED GRAPH\npx per new image'); ax[1, 0].set_ylabel('VALUE GRAPH\n% of total travel')
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=75)
