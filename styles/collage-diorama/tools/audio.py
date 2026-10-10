import sys, numpy as np, librosa
y, sr = librosa.load(sys.argv[1], sr=22050)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
print('tempo est', np.round(tempo,1), 'beats', len(beats))
print('beat times', np.round(beats,2).tolist())
on_env = librosa.onset.onset_strength(y=y, sr=sr)
ons = librosa.onset.onset_detect(onset_envelope=on_env, sr=sr, units='time', backtrack=False)
st = on_env[librosa.time_to_frames(ons, sr=sr)]
strong = ons[st > np.percentile(st, 75)]
print('onsets', len(ons), 'strong onsets', np.round(strong,2).tolist())
# harmonic/percussive balance over time
H, P = librosa.effects.hpss(y)
hop=512
rmsH = librosa.feature.rms(y=H, hop_length=hop)[0]; rmsP = librosa.feature.rms(y=P, hop_length=hop)[0]
cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
tt = librosa.frames_to_time(np.arange(len(rmsH)), sr=sr, hop_length=hop)
for s in range(0, 52, 2):
    m = (tt>=s)&(tt<s+2)
    print(f"{s:2d}-{s+2:2d}s  harm {20*np.log10(rmsH[m].mean()+1e-9):6.1f} dB  perc {20*np.log10(rmsP[m].mean()+1e-9):6.1f} dB  centroid {cent[m].mean():6.0f} Hz")
# chroma -> key estimate
ch = librosa.feature.chroma_cqt(y=H, sr=sr).mean(1)
names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
print('chroma ranking', [names[i] for i in np.argsort(-ch)[:5]])
