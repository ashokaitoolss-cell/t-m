#!/usr/bin/env python3
"""Synthesize the placeholder SFX kit and music bed (deterministic, 48 kHz).

These stand in until the user's SFX library can be reached; each file is referenced by
name from data/scenes.mjs, so swapping in a library sound is a file replacement.
Writes assets/sfx/<name>.wav and assets/audio/bed.wav.
"""
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def bp(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=4):
    return sosfilt(butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=4):
    return sosfilt(butter(order, f, "highpass", fs=SR, output="sos"), x)


def env(n, attack, decay_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay_tau)


def swept_noise(dur, f0, f1, width=0.5, shape=None):
    """Noise through a band that sweeps f0 -> f1 (STFT-domain filter)."""
    n = int(dur * SR)
    x = rng.standard_normal(n + 2048)
    hop, win = 256, 1024
    w = np.hanning(win)
    out = np.zeros(n + 2048)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    frames = (n + 2048 - win) // hop
    for i in range(frames):
        u = min(1.0, i * hop / max(1, n))
        fc = f0 * (f1 / f0) ** u
        g = np.exp(-0.5 * (np.log(np.maximum(freqs, 1) / fc) / width) ** 2)
        seg = np.fft.irfft(np.fft.rfft(x[i * hop : i * hop + win] * w) * g)
        out[i * hop : i * hop + win] += seg * w
    out = out[:n]
    if shape is not None:
        out *= shape(np.linspace(0, 1, n))
    return out


def norm(x, peak_db=-3.0):
    p = np.max(np.abs(x)) or 1.0
    return x / p * 10 ** (peak_db / 20)


def fade(x, ms_in=1.0, ms_out=8.0):
    n_in = max(1, int(ms_in * SR / 1000))
    n_out = max(1, int(ms_out * SR / 1000))
    x = x.copy()
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def write(path, x, stereo=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    x = np.clip(x, -1, 1)
    data = (x * 32767).astype(np.int16)
    if stereo:
        data = np.column_stack([data, data]).ravel() if data.ndim == 1 else data.ravel()
    with wave.open(str(path), "wb") as f:
        f.setnchannels(2 if stereo else 1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(data.tobytes())


# ------------------------------------------------------------------ the kit
def tick():
    n = int(0.03 * SR)
    x = hp(rng.standard_normal(n), 2500) * env(n, 0.0003, 0.004)
    x += 0.35 * np.sin(2 * np.pi * 3400 * t_axis(0.03)) * env(n, 0.0002, 0.006)
    return norm(fade(x, 0.1, 3), -6)


def pop():
    t = t_axis(0.12)
    f = 320 + 700 * np.exp(-t / 0.018)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.035)
    x += 0.2 * hp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.004)
    return norm(fade(x), -4)


def heart_pop():
    t = t_axis(0.09)
    f = 700 + 900 * np.exp(-t / 0.012)
    return norm(fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.025)), -8)


def whoosh():
    x = swept_noise(0.3, 500, 3800, 0.55, lambda u: np.sin(np.pi * u) ** 1.6)
    return norm(fade(x, 2, 30), -5)


def whoosh_low():
    x = swept_noise(0.55, 180, 1400, 0.6, lambda u: (u ** 1.5) * np.exp(-((u - 0.8) ** 2) / 0.02) + u * 0.2)
    return norm(fade(x, 5, 40), -5)


def whip():
    x = swept_noise(0.24, 2600, 700, 0.5, lambda u: np.sin(np.pi * u ** 0.6) ** 2)
    return norm(fade(x, 1, 20), -4)


def riser():
    x = swept_noise(0.7, 250, 5000, 0.5, lambda u: u ** 2.2)
    return norm(fade(x, 5, 25), -6)


def paper():
    n = int(0.42 * SR)
    imp = (rng.random(n) < 0.012) * rng.standard_normal(n)
    x = bp(imp, 1800, 7000) * 2.5 + 0.25 * bp(rng.standard_normal(n), 800, 4000)
    x *= np.sin(np.pi * np.linspace(0, 1, n)) ** 0.8
    return norm(fade(x, 3, 40), -8)


def paper_flip():
    x = swept_noise(0.26, 5000, 1200, 0.5, lambda u: np.sin(np.pi * u) ** 1.2)
    t = t_axis(0.26)
    x += 0.6 * np.sin(2 * np.pi * 110 * t) * env(len(t), 0.002, 0.04) * (t > 0.17)
    return norm(fade(x, 1, 20), -5)


def scribble(lo=1400, hi=5200, rate=19, dur=0.36, grain=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = bp(rng.standard_normal(n), lo, hi)
    strokes = 0.55 + 0.45 * np.sin(2 * np.pi * rate * t + 2 * np.sin(2 * np.pi * 3.1 * t))
    x = base * strokes ** 2
    if grain:
        x += grain * bp((rng.random(n) < 0.02) * rng.standard_normal(n), 3000, 9000)
    x *= np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.05)
    return norm(x, -9)


def chime():
    t = t_axis(0.9)
    x = np.zeros_like(t)
    for i, f in enumerate([5000, 7700, 9800, 12500, 15200]):
        on = i * 0.028
        tt = np.maximum(t - on, 0)
        x += (t >= on) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / (0.32 - i * 0.03)) * (1 - i * 0.12)
    return norm(fade(x, 0.5, 30), -12)


def low_hit():
    t = t_axis(1.1)
    f = 38 + 30 * np.exp(-t / 0.07)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.42)
    x += 0.35 * lp(rng.standard_normal(len(t)), 900) * env(len(t), 0.001, 0.03)
    return norm(np.tanh(1.6 * x), -2)


def boom():
    t = t_axis(1.8)
    f = 34 + 26 * np.exp(-t / 0.12)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 0.7)
    x += 0.5 * lp(rng.standard_normal(len(t)), 260) * env(len(t), 0.01, 0.5)
    return norm(np.tanh(1.8 * x), -1.5)


def buzz():
    t = t_axis(0.34)
    carrier = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.6 + np.sin(2 * np.pi * 344 * t) * 0.4
    x = lp(carrier, 1400) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 28 * t)))
    return norm(fade(x, 5, 30), -9)


def ding():
    t = t_axis(1.0)
    x = np.zeros_like(t)
    for on, f0 in [(0.0, 1318.5), (0.09, 1975.5)]:
        tt = np.maximum(t - on, 0)
        for k, a in [(1, 1.0), (2.01, 0.28), (3.0, 0.1)]:
            x += (t >= on) * a * np.sin(2 * np.pi * f0 * k * tt) * np.exp(-tt / (0.38 / k))
    return norm(fade(x, 0.5, 40), -7)


def drawer():
    t = t_axis(0.5)
    x = np.sin(2 * np.pi * 78 * t) * env(len(t), 0.001, 0.09)
    x += 0.8 * bp(rng.standard_normal(len(t)), 300, 1600) * env(len(t), 0.001, 0.035)
    x += 0.25 * bp(rng.standard_normal(len(t)), 2000, 5000) * env(len(t), 0.03, 0.05) * (t > 0.03)
    return norm(np.tanh(1.4 * x), -3)


def bell():
    t = t_axis(1.8)
    x = np.zeros_like(t)
    for on in (0.0, 0.26):
        tt = np.maximum(t - on, 0)
        for r, a in [(1, 1), (2.76, 0.55), (5.4, 0.3), (8.93, 0.15)]:
            x += (t >= on) * a * np.sin(2 * np.pi * 820 * r * tt) * np.exp(-tt / (0.9 / r ** 0.5))
    return norm(fade(x, 0.5, 60), -6)


def punch():
    t = t_axis(0.32)
    f = 60 + 90 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.08)
    x += 0.6 * lp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0005, 0.012)
    return norm(np.tanh(2 * x), -2)


def crowd():
    n = int(1.8 * SR)
    t = np.arange(n) / SR
    pink = np.cumsum(rng.standard_normal(n))
    pink = hp(pink - pink.mean(), 200)
    x = bp(pink, 350, 2600) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.3 * t) * np.sin(2 * np.pi * 0.7 * t + 1))
    x *= np.minimum(1, t / 0.25) * np.minimum(1, (1.8 - t) / 0.6)
    return norm(x, -10)


def megaphone():
    t = t_axis(0.45)
    f = 1150 + 60 * np.sin(2 * np.pi * 9 * t)
    x = np.tanh(4 * np.sin(2 * np.pi * np.cumsum(f) / SR))
    x = bp(x, 700, 3500) * np.minimum(1, t / 0.03) * np.minimum(1, (0.45 - t) / 0.12)
    return norm(x, -12)


def shutter():
    t = t_axis(0.3)
    x = np.zeros_like(t)
    for on, g in [(0.0, 1.0), (0.085, 0.7)]:
        tt = np.maximum(t - on, 0)
        x += (t >= on) * g * bp(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-tt / 0.006)
        x += (t >= on) * g * 0.4 * np.sin(2 * np.pi * 260 * tt) * np.exp(-tt / 0.02)
    return norm(fade(x, 0.1, 10), -4)


def glitch():
    n = int(0.26 * SR)
    t = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * (220 + 900 * (np.floor(t * 40) % 3)) * t))
    x = np.round(x * 3) / 3 * 0.5 + 0.5 * np.round(rng.standard_normal(n) * 2) / 2
    x = lp(x, 6000) * env(n, 0.001, 0.09)
    return norm(fade(x, 0.5, 20), -8)


KIT = {
    "tick": tick, "pop": pop, "heart-pop": heart_pop, "whoosh": whoosh, "whoosh-low": whoosh_low,
    "whip": whip, "riser": riser, "paper": paper, "paper-flip": paper_flip,
    "marker": lambda: scribble(), "marker-long": lambda: scribble(dur=0.5, rate=15),
    "chalk": lambda: scribble(2600, 8500, 23, 0.4, grain=1.2), "chime": chime, "low-hit": low_hit,
    "boom": boom, "buzz": buzz, "ding": ding, "drawer": drawer, "bell": bell,
    "punch": punch, "crowd": crowd, "megaphone": megaphone, "shutter": shutter, "glitch": glitch,
}


# ------------------------------------------------------------------ music bed
def bed(total=60.5, bpm=86.0):
    """A low, bassy bed: soft kick, sub bass on a four-chord loop, dark pad, vinyl dust.
    Drops to sub only on the paper-card turns and resolves at the payoff."""
    n = int(total * SR)
    t = np.arange(n) / SR
    beat = 60 / bpm
    out = np.zeros(n)
    roots = [55.0, 43.65, 65.41, 49.0]  # A1, F1, C2, G1
    chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
    drops = [(16.0, 17.92), (31.92, 33.28), (43.92, 45.7)]

    def dropped(x):
        return any(a <= x < b for a, b in drops)

    nb = int(total / beat) + 1
    for b in range(nb):
        s = b * beat
        i = int(s * SR)
        bar = (b // 4) % 4
        if s >= 58.4:
            break
        # kick on 1 and 3 (and a pickup on the "and" of 4 every other bar)
        if b % 4 in (0, 2) and not dropped(s):
            kt = t_axis(0.35)
            k = np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-kt / 0.035)) / SR) * env(len(kt), 0.002, 0.12)
            seg = out[i : i + len(k)]
            seg += 0.55 * k[: len(seg)]
        # sub bass: one note per beat, gliding softly
        st = t_axis(beat * 0.95)
        f = roots[bar]
        sub = np.sin(2 * np.pi * f * st) * env(len(st), 0.01, beat * 0.9)
        sub += 0.25 * np.sin(2 * np.pi * 2 * f * st) * env(len(st), 0.01, beat * 0.4)
        seg = out[i : i + len(sub)]
        seg += 0.42 * sub[: len(seg)] * (0.7 if dropped(s) else 1.0)
        # dark pad: one swell per bar
        if b % 4 == 0 and not dropped(s):
            pt = t_axis(beat * 4)
            pad = sum(np.sin(2 * np.pi * fc * pt) + 0.3 * np.sin(2 * np.pi * 2 * fc * pt + 0.4) for fc in chords[bar])
            pad *= np.sin(np.pi * np.linspace(0, 1, len(pt))) ** 1.5
            seg = out[i : i + len(pad)]
            seg += 0.05 * pad[: len(seg)]

    # final chord resolving under the payoff
    i = int(58.4 * SR)
    ft = t_axis(total - 58.4)
    fin = sum(np.sin(2 * np.pi * fc * ft) for fc in [110, 220, 261.6, 329.6]) * np.exp(-ft / 1.1)
    fin += 1.6 * np.sin(2 * np.pi * 55 * ft) * np.exp(-ft / 1.3)
    out[i : i + len(fin)] += 0.12 * fin[: n - i]

    # ~60 ms dips just before key cuts (data/sfx.mjs `dips`), so the next hit lands harder
    import re
    src = (ROOT / "data/sfx.mjs").read_text()
    dips = [float(v) for v in re.search(r"dips = \[([^\]]*)\]", src).group(1).split(",")]
    for d in dips:
        a, b = int((d - 0.075) * SR), int((d - 0.005) * SR)
        ramp = int(0.008 * SR)
        g = np.ones(n)
        g[a:b] = 0.05
        g[a - ramp : a] = np.linspace(1, 0.05, ramp)
        g[b : b + ramp] = np.linspace(0.05, 1, ramp)
        out *= g

    dust = (rng.random(n) < 0.0009) * rng.standard_normal(n)
    out += 0.08 * bp(dust, 1500, 9000)
    out = lp(out, 2200, 2)
    return norm(out, -6)


def main():
    for name, fn in KIT.items():
        write(ROOT / "assets/sfx" / f"{name}.wav", fn())
    write(ROOT / "assets/audio/bed.wav", bed())
    print(f"{len(KIT)} sfx + bed written")


if __name__ == "__main__":
    main()
