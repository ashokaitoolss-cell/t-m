# Picture vs. sound: visual speed, percussive onsets, high/low band energy, noisiness, beat grid.
# usage: sync.py audio.wav steps.csv out.png
import sys, numpy as np, librosa, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
y, sr = librosa.load(sys.argv[1], sr=22050)
_, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
_, P = librosa.effects.hpss(y); hop = 256
oe = librosa.onset.onset_strength(y=P, sr=sr, hop_length=hop); to = librosa.frames_to_time(np.arange(len(oe)), sr=sr, hop_length=hop)
S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop)); f = librosa.fft_frequencies(sr=sr, n_fft=1024)
hi, lo = S[(f > 2000) & (f < 10000)].mean(0), S[f < 120].mean(0)
flat = librosa.feature.spectral_flatness(S=S)[0]
d = np.genfromtxt(sys.argv[2], delimiter=',', names=True)
fig, ax = plt.subplots(4, 1, figsize=(18, 10), sharex=True)
ax[0].plot(d['t'], np.convolve(d['speed_px_per_step'], np.ones(3) / 3, mode='same')); ax[0].set_ylabel('visual speed')
ax[1].plot(to, oe, lw=.8, color='C3'); ax[1].set_ylabel('percussive onsets')
ax[2].plot(to, librosa.amplitude_to_db(hi, ref=hi.max()), lw=.8, color='C4', label='2-10 kHz (air/whoosh)')
ax[2].plot(to, librosa.amplitude_to_db(lo, ref=lo.max()), lw=.8, color='C5', label='<120 Hz (boom/sub)'); ax[2].legend(loc='lower left'); ax[2].set_ylabel('dB')
ax[3].plot(to, flat, lw=.8, color='C6'); ax[3].set_ylabel('noisiness')
for a in ax:
    for b in beats: a.axvline(b, color='grey', lw=.4, alpha=.5)
    a.set_xticks(np.arange(0, to[-1] + 1, 1))
plt.tight_layout(); plt.savefig(sys.argv[3], dpi=75)
