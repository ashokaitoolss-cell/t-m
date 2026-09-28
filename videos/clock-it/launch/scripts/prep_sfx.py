#!/usr/bin/env python3
"""Cut the picked sounds out of the GenXi SFX library -> assets/sfx/<role>.wav (+ data/sfx-leads.json).

data/sfx-picks.json names, per role in the cue sheet, the library file and the event
inside it (t0 + dur, found by onset analysis and checked on spectrograms). Each cut is
faded, loudness-matched to the role's target (max momentary K-weighted loudness, so a
sub boom and a UI tick sit where the cue gains expect them), peak-capped at -1 dBFS and
written as 16-bit mono 48 kHz, the format build-timeline.mjs sizes clips from.

Runs after synth-sfx.py: the library cut replaces the synthesized placeholder of the same
name; roles without a pick (megaphone) keep the synthesized sound. Downloads are cached
in assets/sfx/lib/.
"""
import json
import subprocess
import urllib.parse
import wave
from pathlib import Path

import numpy as np
from scipy.signal import lfilter

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
CACHE = ROOT / "assets/sfx/lib"


def k_weight(x):
    # ITU-R BS.1770 pre-filter (high shelf) + RLB high-pass, 48 kHz coefficients.
    x = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285],
                [1.0, -1.69065929318241, 0.73248077421585], x)
    return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621], x)


def max_momentary(x):
    """Loudest 400 ms window (LUFS-style), hop 50 ms; short sounds are zero-padded."""
    y = k_weight(np.concatenate([x, np.zeros(int(SR * 0.4))]))
    win, hop = int(SR * 0.4), int(SR * 0.05)
    p = [np.mean(y[i:i + win] ** 2) for i in range(0, len(y) - win + 1, hop)]
    return -0.691 + 10 * np.log10(max(p) + 1e-12)


def fetch(base, cat, name):
    local = CACHE / f"{cat.split('. ', 1)[-1].replace(' ', '_')}__{name.replace(' ', '_')}"
    if not local.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        url = f"{base}/{urllib.parse.quote(cat)}/{urllib.parse.quote(name)}"
        subprocess.run(["curl", "-sSfL", "--retry", "3", "-o", str(local), url], check=True)
    return local


def decode(path, t0, dur):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-i", str(path),
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def write_wav(path, x):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def main():
    spec = json.loads((ROOT / "data/sfx-picks.json").read_text())
    leads = {}
    for role, p in spec["picks"].items():
        x = decode(fetch(spec["base"], p["cat"], p["file"]), p["t0"], p["dur"])
        n = len(x)
        fin = max(1, int(SR * p.get("fadeIn", 0.004)))
        fout = max(1, int(SR * p.get("fadeOut", min(0.15, p["dur"] * 0.4))))
        x[:fin] *= np.linspace(0, 1, fin)
        x[n - fout:] *= np.linspace(1, 0, fout) ** 2
        x *= 10 ** ((p["lufs"] - max_momentary(x)) / 20)
        peak = np.abs(x).max()
        if peak > 10 ** (-1 / 20):
            x *= 10 ** (-1 / 20) / peak
        write_wav(ROOT / f"assets/sfx/{role}.wav", x)
        lead = p.get("lead", 0)
        if lead == "peak":  # where the 20 ms envelope peaks
            h = int(SR * 0.02)
            e = np.sqrt(np.convolve(x ** 2, np.ones(h) / h, "same"))
            lead = round(float(np.argmax(e)) / SR, 3)
        leads[role] = {"lead": lead, "dur": round(n / SR, 3)}
        print(f"{role:<11} {p['cat'].split('. ', 1)[-1]:<24} {p['file']:<34} @{p['t0']:<6} {n / SR:.2f}s lead {leads[role]['lead']}")
    (ROOT / "data/sfx-leads.json").write_text(json.dumps(leads, indent=1) + "\n")


if __name__ == "__main__":
    main()
