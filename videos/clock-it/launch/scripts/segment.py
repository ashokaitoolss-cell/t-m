"""Re-render only the frames a fix touches, and splice them into the clean render.

A full 60 fps render takes about an hour (software GL, sub-frame motion blur), so a small
fix is rendered as short segment projects instead. Each is a copy of this project whose
root timeline is a scrubbing tween over [start, start + length) of the real one and whose
3D seek hook adds the same offset, so the segment's frames are the film's own frames.

    python3 scripts/segment.py make DIR F0:N [F0:N ...]   # one project per range, DIR/<i>/
    (cd DIR/<i> && npx hyperframes render --fps 60 --quality delivery --output DIR/<i>.mp4)
    python3 scripts/segment.py splice DIR F0:N [F0:N ...] # -> renders/clean-patched.mp4

F0 is the first frame (at 60 fps) and N the number of frames. splice checks each seam:
the segment's first and last frames must match the clean render where nothing changed.
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 60


def ranges(args):
    return [tuple(int(v) for v in a.split(":")) for a in args]


def make(out, spans):
    html = (ROOT / "index.html").read_text()
    scene = (ROOT / "assets/scene.js").read_text()
    total = re.search(r'id="root"[^>]*data-duration="([\d.]+)"', html).group(1)
    for i, (f0, n) in enumerate(spans):
        d = out / str(i)
        if d.exists():
            shutil.rmtree(d)
        (d / "assets").mkdir(parents=True)
        for sub in ["fonts", "vendor"]:
            shutil.copytree(ROOT / "assets" / sub, d / "assets" / sub)
        shutil.copy(ROOT / "assets/watch.js", d / "assets/watch.js")
        for f in ["hyperframes.json", "meta.json", "package.json"]:
            shutil.copy(ROOT / f, d / f)
        off, dur = f0 / FPS, n / FPS
        h = re.sub(r"\s*<audio [^>]*></audio>", "", html)  # sound is mixed separately
        h = h.replace(f'data-duration="{total}"', f'data-duration="{dur:.6f}"')
        reg = 'window.__timelines["main"] = tl;'
        assert h.count(reg) == 1, "timeline registration not found"
        h = h.replace(reg, f'window.__timelines["main"] = gsap.timeline({{ paused: true }}).add(tl.tweenFromTo({off!r}, {off + dur!r}, {{ ease: "none" }}), 0);')
        (d / "index.html").write_text(h)
        hook = "renderAt(e.detail.time)"
        assert scene.count(hook) == 2, "3D seek hook not found"
        (d / "assets/scene.js").write_text(scene.replace(hook, f"renderAt(e.detail.time + {off!r})"))
        print(f"{d}: frames {f0}-{f0 + n - 1} ({off:.3f}-{off + dur:.3f} s)")


def frame(path, n):
    return subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"select=eq(n\\,{n})", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True,
    ).stdout


def psnr(a, b):
    import numpy as np

    x, y = np.frombuffer(a, np.uint8).astype(float), np.frombuffer(b, np.uint8).astype(float)
    mse = ((x - y) ** 2).mean()
    return 99.0 if mse == 0 else 10 * np.log10(255 ** 2 / mse)


def splice(out, spans):
    clean = ROOT / "renders/clean.mp4"
    for i, (f0, n) in enumerate(spans):
        seg = out / f"{i}.mp4"
        first, last = psnr(frame(seg, 0), frame(clean, f0)), psnr(frame(seg, n - 1), frame(clean, f0 + n - 1))
        print(f"segment {i}: seam PSNR first {first:.1f} dB, last {last:.1f} dB")
        if min(first, last) < 38:
            sys.exit(f"segment {i} does not line up with the clean render at its seams")
    inputs, parts, cursor = ["-i", str(clean)], [], 0
    k = len(spans) + 1
    filt = [f"[0:v]split={k}" + "".join(f"[c{j}]" for j in range(k))]
    for i, (f0, n) in enumerate(spans):
        inputs += ["-i", str(out / f"{i}.mp4")]
        filt.append(f"[c{i}]trim=start_frame={cursor}:end_frame={f0},setpts=PTS-STARTPTS[k{i}]")
        filt.append(f"[{i + 1}:v]setpts=PTS-STARTPTS[s{i}]")
        parts += [f"[k{i}]", f"[s{i}]"]
        cursor = f0 + n
    filt.append(f"[c{len(spans)}]trim=start_frame={cursor},setpts=PTS-STARTPTS[k{len(spans)}]")
    parts.append(f"[k{len(spans)}]")
    filt.append("".join(parts) + f"concat=n={len(parts)}:v=1:a=0[v]")
    dst = ROOT / "renders/clean-patched.mp4"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[v]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
         "-r", str(FPS), str(dst)],
        check=True,
    )
    print(f"{dst.relative_to(ROOT)} written")


if __name__ == "__main__":
    cmd, out, *spans = sys.argv[1:]
    {"make": make, "splice": splice}[cmd](Path(out), ranges(spans))
