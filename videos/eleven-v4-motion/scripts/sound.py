"""Sound for the Eleven V4 sting, synthesized in code and locked to the picture's timings.

    python3 scripts/sound.py        (needs numpy, scipy)  ->  assets/audio/sting.wav

Air swells as the light streams in, soft key ticks under the letters, a breath as the caret
opens into the pill, two blips for V and 4, then a tap on the press and a warm chime that rings
out under the hold.
"""
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR, DUR = 48000, 6.5
N = int(SR * DUR)
rng = np.random.default_rng(11)

# Picture timings (compositions/lockup.html, compositions/gradient.html).
CARET_IN, TYPE, STEP = 0.55, 1.30, 0.085
SEED, OPEN, OD = 1.95, 2.12, 0.72
V_AT, FOUR_AT, PRESS = 2.50, 2.58, 3.02
RING = PRESS + 0.10

L = np.zeros(N)
R = np.zeros(N)


def place(sig, t, gain=1.0, pan=0.0):
    """Add a mono signal at time t (s), equal-power pan in [-1, 1]."""
    i = int(round(t * SR))
    n = min(len(sig), N - i)
    a = (pan + 1) * np.pi / 4
    L[i : i + n] += sig[:n] * gain * np.cos(a)
    R[i : i + n] += sig[:n] * gain * np.sin(a)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-np.maximum(0, t - attack) / decay)


def sweep_noise(dur, f0, f1, shape, bands=24):
    """Noise whose band-pass centre glides f0 -> f1, built from crossfaded fixed bands."""
    n = int(dur * SR)
    x = rng.standard_normal(n)
    p = np.linspace(0, 1, n)
    centre = f0 * (f1 / f0) ** p
    edges = np.geomspace(min(f0, f1) * 0.7, max(f0, f1) * 1.4, bands + 1)
    out = np.zeros(n)
    for lo, hi in zip(edges[:-1], edges[1:]):
        mid = np.sqrt(lo * hi)
        w = np.exp(-0.5 * (np.log(centre / mid) / 0.35) ** 2)
        out += bp(x, lo, hi) * w
    return out * shape


# 1. Air: the light streaming in (0.1 s -> 2.6 s), a slow swell that thins out.
dur = 3.2
p = np.linspace(0, 1, int(dur * SR))
shape = np.sin(np.pi * np.clip(p / 0.42, 0, 1) / 2) ** 2 * np.exp(-np.maximum(0, p - 0.42) * 3.2)
air = sweep_noise(dur, 260, 2400, shape)
place(air / np.abs(air).max(), 0.10, 0.16, -0.25)
place(air / np.abs(air).max(), 0.10 + 900 / SR, 0.16, 0.25)
# a low warm bed under it
t = np.arange(int(3.0 * SR)) / SR
bed = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 110 * t + 0.3)) * np.sin(np.pi * np.clip(t / 3.0, 0, 1)) ** 2
place(bed, 0.10, 0.05)


# 2. Ticks: the caret wakes, then one soft key tick per letter.
def tick(f, decay=0.018, bright=1.0):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    click = hp(rng.standard_normal(n), 2500) * env(n, 0.0008, 0.006) * bright
    tone = np.sin(2 * np.pi * f * t) * env(n, 0.001, decay)
    return 0.55 * click + tone


place(tick(2400, 0.012, 0.4), CARET_IN, 0.10, 0.0)
for i in range(6):
    f = 2100 + 140 * ((i * 5) % 7)
    place(tick(f), TYPE + i * STEP, 0.10 + 0.012 * (i % 2), -0.18 + 0.07 * i)

# 3. Breath: the caret fills out, then opens into the pill (velocity-shaped whoosh).
dur = OD + 0.35
p = np.linspace(0, 1, int(dur * SR))
q = np.clip(p * dur / OD, 0, 1)
vel = np.where(q < 0.5, 32 * q**3, 32 * (1 - q) ** 3)  # d/dq of power4.inOut, peak 2 at mid
shape = vel / vel.max() * np.exp(-np.maximum(0, p * dur - OD) * 9)
whoosh = sweep_noise(dur, 420, 3200, shape)
place(whoosh / np.abs(whoosh).max(), OPEN, 0.26, 0.15)
place(tick(1500, 0.03, 0.2), SEED, 0.07, 0.15)


# 4. Blips: V and 4 rise.
def blip(f, dur=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    glide = f * (1 + 0.06 * np.exp(-t / 0.02))
    return np.sin(2 * np.pi * np.cumsum(glide) / SR) * env(n, 0.003, 0.035)


place(blip(1318.5), V_AT + 0.06, 0.07, 0.2)
place(blip(1760.0), FOUR_AT + 0.06, 0.06, 0.3)

# 5. The press: a soft tap.
n = int(0.25 * SR)
t = np.arange(n) / SR
thump = np.sin(2 * np.pi * np.cumsum(90 + 70 * np.exp(-t / 0.03)) / SR) * env(n, 0.002, 0.06)
tap = 0.8 * thump + 0.35 * lp(hp(rng.standard_normal(n), 900), 5000) * env(n, 0.0005, 0.008)
place(tap, PRESS, 0.42, 0.15)

# 6. The chime: A add9 voiced open, glassy partials, ringing out under the hold.
def bell(f, decay):
    n = int((DUR - RING) * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * env(n, 0.006, decay)
    s += 0.18 * np.sin(2 * np.pi * f * 2.76 * t) * env(n, 0.003, decay * 0.18)
    s += 0.08 * np.sin(2 * np.pi * f * 5.4 * t) * env(n, 0.002, decay * 0.08)
    return s


for f, g, pan, dly, dec in [(220.0, 0.20, 0.0, 0.0, 1.9), (440.0, 0.16, -0.3, 0.0, 2.2), (659.26, 0.12, 0.3, 0.012, 2.0),
                            (987.77, 0.09, -0.45, 0.024, 1.7), (1108.73, 0.07, 0.5, 0.036, 1.5)]:
    place(bell(f, dec), RING + dly, g, pan)
# airy shimmer riding the ring of light
dur = 2.6
p = np.linspace(0, 1, int(dur * SR))
shimmer = sweep_noise(dur, 5200, 2400, np.minimum(1, p * dur / 0.05) * np.exp(-p * dur / 0.7))
place(shimmer / np.abs(shimmer).max(), RING, 0.05, -0.5)
place(shimmer / np.abs(shimmer).max(), RING + 1300 / SR, 0.05, 0.5)

# Space: a short, dark synthetic room on everything, then master.
ir_n = int(1.6 * SR)
ir_t = np.arange(ir_n) / SR
ir = lp(rng.standard_normal(ir_n), 6000) * np.exp(-ir_t / 0.38)
ir /= np.sqrt((ir**2).sum())
wetL = fftconvolve(L, ir)[:N]
wetR = fftconvolve(R, np.roll(ir, 211))[:N]
L = L + 0.32 * wetL
R = R + 0.32 * wetR
mix = np.stack([L, R], 1)
mix = hp(mix.T, 28).T
fade = np.ones(N)
fn = int(0.35 * SR)
fade[-fn:] = np.cos(np.linspace(0, np.pi / 2, fn)) ** 2
mix *= fade[:, None]
mix *= 10 ** (-3 / 20) / np.abs(mix).max()  # peak at -3 dBFS

pcm = (mix * 32767).round().astype("<i2")
import wave

out = ROOT / "assets/audio/sting.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(out, f"{DUR}s", "peak -3 dBFS")
