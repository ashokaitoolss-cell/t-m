"""Mix the score and every sound cue into one master WAV, without re-rendering the video.

Reads data/cues.json (written by scripts/build.mjs from data/cues.mjs, leads already
applied), so the mix lands the same sounds at the same times as index.html does.

Tactile sounds (ticks, clicks, clinks, the latch) stay dry and centred. Ethereal ones
(glass bells, shimmer, air) get a short stereo room send so they bloom around the centre.

    python3 scripts/mix.py  -> renders/mix.wav (48 kHz stereo 24-bit, -14 LUFS, true peak <= -1.8 dBTP, so AAC stays under -1)

scripts/finish.sh muxes it onto the clean render and makes the share copy.
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import fftconvolve, lfilter, resample_poly

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
ETHEREAL = {"bellA", "bellB", "shimmer", "warm", "sparkle", "air", "air2", "suck", "whoosh"}


def read_wav(path):
    with wave.open(str(path)) as w:
        assert w.getframerate() == SR, path
        n, ch, width = w.getnframes(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(n)
    x = np.frombuffer(raw, {2: "<i2", 4: "<i4"}[width]).astype(np.float64)
    x /= 32768.0 if width == 2 else 2147483648.0
    return x.reshape(-1, ch)


def room_ir(seconds=1.4, seed=7):
    """Decorrelated stereo noise tail: soft attack, exponential decay, darker as it fades."""
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    env = np.exp(-t / 0.32) * (1 - np.exp(-t / 0.004))
    ir = rng.standard_normal((n, 2)) * env[:, None]
    # One-pole lowpass whose cutoff falls over time.
    out = np.zeros_like(ir)
    state = np.zeros(2)
    for i in range(n):
        a = 0.35 + 0.6 * min(1.0, t[i] / seconds)
        state = a * state + (1 - a) * ir[i]
        out[i] = state
    return out / np.sqrt((out ** 2).sum(axis=0))


def main():
    cues = json.loads((ROOT / "data/cues.json").read_text())
    total = int(round(cues["total"] * SR))
    music = read_wav(ROOT / cues["music"]["src"])
    if music.shape[1] == 1:
        music = np.repeat(music, 2, axis=1)
    mix = np.zeros((total, 2))
    m = min(total, len(music))
    mix[:m] += music[:m] * cues["music"]["gain"]

    send = np.zeros((total, 1))
    cache = {}
    for c in cues["clips"]:
        x = cache.setdefault(c["name"], read_wav(ROOT / "assets/sfx" / f"{c['name']}.wav")[:, 0])
        s = int(round(c["start"] * SR))
        n = min(len(x), int(round(c["dur"] * SR)), total - s)
        if n <= 0:
            continue
        y = x[:n] * c["gain"]
        mix[s : s + n] += y[:, None]
        if c["name"] in ETHEREAL:
            send[s : s + n, 0] += y
    wet = fftconvolve(send, room_ir(), axes=0)[:total] * 0.28
    mix += wet

    raw_peak = np.abs(mix).max()
    master, gain_db, ceiling = master_to(mix, lufs_target=-14.0, tp_ceiling=-1.8)
    out = ROOT / "renders/mix.wav"
    out.parent.mkdir(exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        pcm = (np.clip(master, -1, 1 - 2 ** -23) * 2 ** 23).astype("<i4")
        w.writeframes(pcm.view(np.uint8).reshape(-1, 4)[:, :3].tobytes())
    print(
        f"{out.relative_to(ROOT)}: {len(cues['clips'])} cues, {total / SR:.2f} s, "
        f"raw peak {20 * np.log10(raw_peak):.1f} dBFS, gain {gain_db:+.1f} dB, "
        f"{integrated_lufs(master):.1f} LUFS, true peak {20 * np.log10(true_peak(master)):.1f} dBTP"
    )


def k_weighted(x):
    """ITU-R BS.1770 K-weighting at 48 kHz."""
    x = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x, axis=0)
    return lfilter([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621], x, axis=0)


def integrated_lufs(x):
    """BS.1770 integrated loudness: 400 ms blocks every 100 ms, absolute and relative gates."""
    p = (k_weighted(x) ** 2).sum(axis=1)
    c = np.concatenate([[0.0], np.cumsum(p)])
    n, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([(c[i + n] - c[i]) / n for i in range(0, len(p) - n + 1, hop)])
    l = -0.691 + 10 * np.log10(z + 1e-20)
    z = z[l > -70]
    rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z = z[-0.691 + 10 * np.log10(z) > rel]
    return -0.691 + 10 * np.log10(z.mean())


def oversampled_peak(x):
    """Per-sample peak of the 4x oversampled signal (inter-sample peaks), max over channels."""
    up = resample_poly(x, 4, 1, axis=0)
    return np.abs(up).max(axis=1).reshape(-1, 4).max(axis=1)[: len(x)]


def true_peak(x):
    return oversampled_peak(x).max()


def tp_limiter(x, ceiling, look=0.0015, release=0.08):
    """Lookahead limiter on inter-sample peaks. A symmetric min filter followed by a boxcar
    of the same span guarantees the gain at every peak is at or under what it needs; the
    release only slows the recovery, so it never lets a peak through."""
    need = np.minimum(1.0, ceiling / np.maximum(oversampled_peak(x), 1e-12))
    L = int(look * SR)
    g = minimum_filter1d(need, 2 * L + 1, mode="nearest")
    g = np.minimum(uniform_filter1d(g, 2 * L + 1, mode="nearest"), 1.0)
    # Release: reduction d = 1 - gain decays by k per sample unless a new peak needs more,
    # d[i] = max(1 - g[i], d[i-1] * e^k), which is a running max in log space.
    k = -1 / (release * SR)
    i = np.arange(len(g))
    with np.errstate(divide="ignore"):
        d = np.exp(i * k + np.maximum.accumulate(np.log(1 - g) - i * k))
    return x * (1 - d)[:, None]


def master_to(x, lufs_target, tp_ceiling):
    ceiling = 10 ** (tp_ceiling / 20)
    gain_db = lufs_target - integrated_lufs(x)
    for _ in range(3):
        y = tp_limiter(x * 10 ** (gain_db / 20), ceiling)
        miss = lufs_target - integrated_lufs(y)
        if abs(miss) < 0.05:
            break
        gain_db += miss
    return y, gain_db, ceiling


if __name__ == "__main__":
    main()
