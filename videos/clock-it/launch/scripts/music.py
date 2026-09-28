#!/usr/bin/env python3
"""Compose the Clock It! launch score in code -> assets/audio/music.wav (48 kHz stereo).

100 BPM, 64 beats (38.4 s), D major. Five sections follow the film:
  A  b0-b14.5   the problem: ticking sixteenths, a nagging notification arpeggio, tension
                building to the smartwatch wall; everything stops dead as the wall implodes.
  -  b14.5-b16  a breath: only the reverb tail and a reversed swell into the downbeat.
  B  b16-b28    the watch: warm downbeat, soft kick, rim ticks, round bass, electric-piano chords.
  C  b28-b44    why it's different: same groove plus glass bells; a riser into the burst (b43).
  -  b45-b46    one beat of total silence: the logo's interval.
  D  b46-b50    the brand: a wide Dmaj9 bloom and slow bells.
  E  b50-b64    the reveal: drums fall away, airy pads and reversed bells, final chord on b59.
Everything is deterministic (seeded noise).
"""
import wave
from pathlib import Path

import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 48000
BPM = 100
BEAT = 60 / BPM
TOTAL = 64 * BEAT
N = int(TOTAL * SR) + SR  # one second of tail room, trimmed at the end
ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(20260928)


def hz(note):
    """'D4' / 'F#3' -> Hz."""
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    n, o = (note[:2], note[2:]) if note[1] == "#" else (note[:1], note[1:])
    return 440.0 * 2 ** ((names[n] + 12 * (int(o) + 1) - 69) / 12)


def bt(b):
    return b * BEAT


# Stereo buses: [2, N]
bus = {k: np.zeros((2, N)) for k in ("drums", "keys", "pad", "bass", "fx", "breath")}


def put(name, t0, sig, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    if sig.ndim == 2:  # already stereo
        sig = sig[:, : N - i] * gain
        bus[name][0, i : i + sig.shape[1]] += sig[0] * l * 1.414
        bus[name][1, i : i + sig.shape[1]] += sig[1] * r * 1.414
        return
    sig = sig[: N - i] * gain
    bus[name][0, i : i + len(sig)] += sig * l * 1.414
    bus[name][1, i : i + len(sig)] += sig * r * 1.414


def env(n, a, d, s=0.0, r=0.0, hold=None):
    """ADSR-ish envelope in samples: attack a s, exponential decay d s to sustain s."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    if hold is not None and r > 0:
        k = t > hold
        e[k] *= np.exp(-(t[k] - hold) / r)
    return e


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


# ------------------------------------------------------------------ instruments
def ep(freq, dur, vel=1.0):
    """FM electric piano: soft bell attack, warm body."""
    n = int((dur + 1.6) * SR)
    t = np.arange(n) / SR
    idx = 1.6 * np.exp(-t / 0.35) + 0.25
    mod = np.sin(2 * np.pi * freq * t) * idx
    car = np.sin(2 * np.pi * freq * t + mod)
    car += 0.18 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t / 0.4)
    e = env(n, 0.006, 1.1, 0.0) * np.where(t < dur, 1, np.exp(-(t - dur) / 0.25))
    return car * e * vel * (1 + 0.04 * np.sin(2 * np.pi * 4.5 * t))


def bell(freq, dur=2.6, vel=1.0):
    """Glassy FM bell (ratio 3.5): the ethereal voice."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    idx = 2.4 * np.exp(-t / 0.18) + 0.3
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * idx
    x = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t / (dur * 0.33))
    x += 0.25 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / 0.5)
    return hp(x * vel * env(n, 0.002, 10, 1.0), 300)


def pad(freqs, dur, vel=1.0, cutoff=1400, attack=0.9, release=1.4):
    """Detuned saw stack through a low-pass, slow swell."""
    n = int((dur + release + 0.2) * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for f in freqs:
        for k, det in enumerate((-0.006, 0.0, 0.0065)):
            ph = rng.random()
            saw = 2 * ((f * (1 + det) * t + ph) % 1) - 1
            out[k % 2] += saw
            out[(k + 1) % 2] += 0.6 * saw
    out = np.stack([lp(out[0], cutoff), lp(out[1], cutoff * 1.05)])
    e = np.clip(t / attack, 0, 1) ** 1.6
    e *= np.where(t < dur, 1, np.exp(-(t - dur) / (release / 3)))
    return out * e * vel / (len(freqs) * 3)


def bass(freq, dur, vel=1.0):
    n = int((dur + 0.2) * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.22 * np.sin(2 * np.pi * 2 * freq * t) + 0.08 * np.sin(2 * np.pi * 3 * freq * t)
    e = env(n, 0.008, 0.9, 0.55) * np.where(t < dur, 1, np.exp(-(t - dur) / 0.06))
    return np.tanh(1.3 * x * e) * vel


def kick(vel=1.0):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t / 0.035)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.003) * 0.25
    return np.tanh(1.4 * (x + click)) * vel


def rim(vel=1.0):
    """A woody tick — rhymes with the watch ticks in the SFX."""
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 1850 * t) * np.exp(-t / 0.018) + 0.5 * np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.03)
    x += bp(rng.standard_normal(n), 2000, 7000) * np.exp(-t / 0.006) * 0.6
    return x * vel


def shaker(vel=1.0):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 6000) * (np.clip(t / 0.012, 0, 1) * np.exp(-t / 0.03))
    return x * vel


def tick16(vel=1.0):
    n = int(0.04 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / 0.006) * vel


def blip(freq, vel=1.0):
    """Notification-ish digital blip for the problem act."""
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sign(np.sin(2 * np.pi * freq * t))
    return lp(x * np.exp(-t / 0.045), 5200) * vel


def noise_swell(dur, lo=300, hi=6000, rise=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    # sweep a band upward by blending three bands
    a = bp(x, lo, lo * 3)
    b = bp(x, lo * 3, max(hi / 2, lo * 3.5))
    c = bp(x, hi / 2, min(hi, SR / 2 - 100))
    u = t / dur if rise else 1 - t / dur
    y = a * (1 - u) + b * np.sin(np.pi * u) + c * u
    return y * (u ** 2 if rise else (1 - u) ** 0.5 * u ** 0.3)


# ------------------------------------------------------------------ the score
CH = {
    "Bm9": ["B2", "D3", "F#3", "A3", "C#4"],
    "Dmaj9": ["D3", "F#3", "A3", "C#4", "E4"],
    "Gmaj9": ["G2", "B2", "D3", "F#3", "A3"],
    "Em9": ["E3", "G3", "B3", "D4", "F#4"],
    "A6sus": ["A2", "D3", "E3", "F#3", "B3"],
    "F#m7": ["F#2", "A2", "C#3", "E3"],
}
ROOTS = {"Bm9": "B1", "Dmaj9": "D2", "Gmaj9": "G1", "Em9": "E2", "A6sus": "A1", "F#m7": "F#1"}

# A — the problem (b0-b14.5)
for s in range(int(14.5 * 4)):
    b = s / 4
    if b < 1:
        continue
    grow = min(1.0, (b - 1) / 11)
    put("drums", bt(b), tick16(0.18 + 0.35 * grow + (0.15 if s % 4 == 0 else 0)), pan=0.3 * np.sin(s))
arp = ["D6", "A5", "F#5", "A5", "B5", "A5", "F#5", "E5"]
for s in range(int(4 * 4), int(14.5 * 4)):
    b = s / 4
    grow = min(1.0, (b - 4) / 8)
    put("keys", bt(b), blip(hz(arp[s % len(arp)]), 0.05 + 0.12 * grow), pan=0.45 * np.sin(s * 1.7))
for b in np.arange(2, 14.5, 0.5):  # muted sub pulse on eighths
    put("bass", bt(b), bass(hz("B1"), 0.22, 0.35 + 0.25 * min(1, b / 12)))
put("pad", bt(2), pad([hz(n) for n in CH["Bm9"]], bt(12.4), 0.55, cutoff=900, attack=3.0, release=0.25))
# the wall (b11-b13): pings answered by the music
for b in (12, 12.5, 13):
    put("keys", bt(b), bell(hz("A5"), 0.8, 0.35), pan=0.2)
    put("keys", bt(b) + 0.09, bell(hz("E6"), 0.6, 0.25), pan=-0.2)
# breath: reversed swell into the downbeat
put("breath", bt(14.7), noise_swell(bt(1.3), 400, 9000, rise=True) * 0.22)
rev = bell(hz("A5"), 1.6, 0.5)[::-1]
put("breath", bt(16) - len(rev) / SR, rev * 0.5)

# B + C — the watch and why it's different (b16-b44)
prog_bc = [("Dmaj9", 16), ("Bm9", 20), ("Gmaj9", 24), ("A6sus", 26), ("Dmaj9", 28), ("Em9", 32),
           ("Gmaj9", 36), ("A6sus", 38), ("Bm9", 40), ("Gmaj9", 42)]
for i, (name, b0) in enumerate(prog_bc):
    b1 = prog_bc[i + 1][1] if i + 1 < len(prog_bc) else 43
    dur = bt(b1 - b0)
    for j, n in enumerate(CH[name]):
        put("keys", bt(b0) + j * 0.012, ep(hz(n), dur * 0.9, 0.22), pan=(j - 2) * 0.18)
    put("pad", bt(b0), pad([hz(n) for n in CH[name][1:]], dur, 0.35, cutoff=1600 if b0 < 40 else 2400, attack=0.5, release=0.8))
    root = hz(ROOTS[name])
    for b in np.arange(b0, b1, 1.0):
        pat = [(0, 0.55, 1.0), (1.5, 0.4, 0.8)] if (b - b0) % 2 == 0 else [(0, 0.5, 0.9), (0.75, 0.2, 0.6)]
        for off, d, v in pat:
            if b + off < b1:
                put("bass", bt(b + off), bass(root * (2 if off == 0.75 else 1), bt(d), 0.55 * v))
for b in range(16, 43):
    if b in (16,) or b % 2 == 0:
        put("drums", bt(b), kick(0.85 if b % 4 == 0 else 0.6))
    if b % 2 == 1:
        put("drums", bt(b), rim(0.35), pan=-0.15)
    for h in (0, 0.5):
        put("drums", bt(b + h), shaker(0.16 + (0.06 if h else 0)), pan=0.35)
# downbeat bloom
put("fx", bt(16), bell(hz("D6"), 3.0, 0.45), pan=-0.1)
put("fx", bt(16) + 0.18, bell(hz("A6"), 2.6, 0.3), pan=0.25)
# glass bell motif in C (offbeats), answering each line of text
motif = [("F#6", 29.5), ("E6", 30.5), ("A6", 31), ("D6", 33.5), ("C#6", 34.5), ("E6", 35), ("B5", 37.5), ("D6", 38.5), ("F#6", 39)]
for n, b in motif:
    put("fx", bt(b), bell(hz(n), 2.2, 0.28), pan=0.3 * np.sin(b))
# climax: riser into the burst (b40-b43), then the hit
put("fx", bt(40), noise_swell(bt(3), 250, 11000, rise=True) * 0.35)
put("pad", bt(40), pad([hz(n) * 2 for n in ["F#3", "A3", "D4"]], bt(3), 0.25, cutoff=3200, attack=2.2, release=0.2))
put("drums", bt(43), kick(1.0))
put("keys", bt(43), sum(ep(hz(n), bt(1.6), 0.3) for n in CH["Dmaj9"]))
put("fx", bt(43), hp(rng.standard_normal(int(1.4 * SR)), 5000) * np.exp(-np.arange(int(1.4 * SR)) / SR / 0.45) * 0.12)
put("fx", bt(43), bell(hz("D7"), 1.8, 0.3))

# b45-b46 silence: nothing starts there; everything before must have decayed (handled below)

# D — the brand (b46-b50)
put("pad", bt(46), pad([hz(n) for n in ["D3", "A3", "C#4", "E4", "F#4"]], bt(4.2), 0.5, cutoff=2200, attack=0.35, release=1.6))
put("bass", bt(46), bass(hz("D2"), bt(3.6), 0.6))
put("drums", bt(46), kick(0.7))
for k, n in enumerate(["A5", "D6", "E6", "F#6", "A6"]):
    put("fx", bt(46.5 + k * 0.5), bell(hz(n), 2.4, 0.26), pan=(k - 2) * 0.2)

# E — the reveal (b50-b64)
prog_e = [("Bm9", 50), ("Gmaj9", 53), ("Em9", 56), ("Dmaj9", 59)]
for i, (name, b0) in enumerate(prog_e):
    b1 = prog_e[i + 1][1] if i + 1 < len(prog_e) else 64
    put("pad", bt(b0), pad([hz(n) for n in CH[name]], bt(b1 - b0), 0.5, cutoff=1300 if b0 < 59 else 2000, attack=1.0, release=1.6))
    put("bass", bt(b0), bass(hz(ROOTS[name]), bt(min(3, b1 - b0)), 0.4))
for b in range(53, 58):  # one soft reversed bell per rolled word
    r = bell(hz(["D6", "E6", "F#6", "A6", "B6"][b - 53]), 0.9, 0.35)[::-1]
    put("fx", bt(b) - len(r) / SR + 0.04, r * 0.6, pan=0.25 * np.sin(b))
put("fx", bt(59), bell(hz("D6"), 3.2, 0.45))
put("fx", bt(59) + 0.12, bell(hz("F#6"), 3.0, 0.32), pan=0.2)
put("fx", bt(59) + 0.24, bell(hz("A6"), 2.8, 0.28), pan=-0.2)
put("fx", bt(59.4), noise_swell(bt(1.5), 1200, 12000, rise=False) * 0.08)


# ------------------------------------------------------------------ mix
def reverb_ir(sec=2.4, damp=5000):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = np.stack([lp(rng.standard_normal(n), damp) * np.exp(-t / (sec / 5)) for _ in range(2)])
    ir[:, : int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


IR = reverb_ir()
sends = {"drums": 0.12, "keys": 0.3, "pad": 0.35, "bass": 0.0, "fx": 0.55, "breath": 0.6}
gains = {"drums": 0.9, "keys": 0.85, "pad": 0.7, "bass": 0.8, "fx": 0.8, "breath": 0.8}


def render(keys):
    dry = np.zeros((2, N)); wet = np.zeros((2, N))
    for k in keys:
        dry += bus[k] * gains[k]; wet += bus[k] * gains[k] * sends[k]
    rv = np.stack([fftconvolve(wet[0], IR[0])[:N], fftconvolve(wet[1], IR[1])[:N]])
    return dry + rv * 0.9


# Hard stops: the implosion (b14.5-b16) and the logo's interval (b45-b46). Everything,
# reverb included, fades to silence over ~60 ms; only what starts afterwards comes through.
def gate(a, b, fade=0.06):
    i0, i1 = int(bt(a) * SR), int(bt(b) * SR)
    f = int(fade * SR)
    g = np.ones(N)
    g[i0 - f : i0] = np.linspace(1, 0, f)
    g[i0:i1] = 0
    return g


mix = render(["drums", "keys", "pad", "bass", "fx"]) * gate(14.5, 16) * gate(45, 46)
mix += render(["breath"])  # the breath lives inside the first stop
mix = hp(mix, 28)
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.1) / np.tanh(1.1) * 0.89
# fade out the last 1.2 s
n_end = int(TOTAL * SR)
mix = mix[:, :n_end]
fo = int(1.2 * SR)
mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5

out = ROOT / "assets/audio/music.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype("<i2").tobytes())
print(f"music.wav {mix.shape[1] / SR:.2f}s")
