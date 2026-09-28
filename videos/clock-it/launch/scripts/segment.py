"""Re-render only the frames a fix touches, and splice them into the clean render.

A full 60 fps render takes about an hour (software GL, sub-frame motion blur), so a small
fix is rendered as short segment projects instead. Each is a copy of this project whose
root timeline is a scrubbing tween over [start, start + length) of the real one and whose
3D seek hook adds the same offset, so the segment's frames are the film's own frames.

    python3 scripts/segment.py make DIR F0:N [F0:N ...]   # one project per range, DIR/<i>/
    (cd DIR/<i> && npx hyperframes render --fps 60 --quality delivery --output DIR/<i>.mp4)
    python3 scripts/segment.py splice DIR F0:N [F0:N ...] [--base IN.mp4] [--out OUT.mp4]

F0 is the first frame (at 60 fps) and N the number of frames; ranges are in film order and
may abut. splice (base renders/clean.mp4, output renders/clean-patched.mp4 by default)
checks every seam against untouched base frames: the frame on each side of a seam must
match the base, so a segment that is off by a frame never gets spliced in.
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


def splice(out, spans, base, dst):
    ends = {f0 + n for f0, n in spans}
    starts = {f0 for f0, _ in spans}
    for i, (f0, n) in enumerate(spans):
        seg = out / f"{i}.mp4"
        checks = []
        if f0 not in ends:  # an untouched base frame precedes this segment
            checks.append(("first", 0, f0))
        if f0 + n not in starts:  # and one follows it
            checks.append(("last", n - 1, f0 + n - 1))
        for name, k, fb in checks:
            p = psnr(frame(seg, k), frame(base, fb))
            print(f"segment {i}: {name} frame vs base {fb}: PSNR {p:.1f} dB")
            if p < 38:
                sys.exit(f"segment {i} does not line up with the base render at frame {fb}")
    # Base pieces between segments (skipping empty ones where segments abut), then concat.
    pieces, cursor, inputs = [], 0, ["-i", str(base)]
    for i, (f0, n) in enumerate(spans):
        if f0 > cursor:
            pieces.append(("base", cursor, f0))
        inputs += ["-i", str(out / f"{i}.mp4")]
        pieces.append(("seg", i + 1, None))
        cursor = f0 + n
    pieces.append(("base", cursor, None))
    nb = sum(1 for p in pieces if p[0] == "base")
    filt = [f"[0:v]split={nb}" + "".join(f"[c{j}]" for j in range(nb))] if nb > 1 else ["[0:v]null[c0]"]
    labels, j = [], 0
    for kind, a, b in pieces:
        lab = f"p{len(labels)}"
        if kind == "base":
            end = f":end_frame={b}" if b is not None else ""
            filt.append(f"[c{j}]trim=start_frame={a}{end},setpts=PTS-STARTPTS[{lab}]")
            j += 1
        else:
            filt.append(f"[{a}:v]setpts=PTS-STARTPTS[{lab}]")
        labels.append(f"[{lab}]")
    filt.append("".join(labels) + f"concat=n={len(labels)}:v=1:a=0[v]")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[v]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
         "-r", str(FPS), str(dst)],
        check=True,
    )
    print(f"{dst} written")


if __name__ == "__main__":
    args = sys.argv[1:]
    opt = {}
    for flag in ("--base", "--out"):
        if flag in args:
            i = args.index(flag)
            opt[flag] = Path(args[i + 1])
            del args[i : i + 2]
    cmd, out, *spans = args
    if cmd == "make":
        make(Path(out), ranges(spans))
    else:
        splice(Path(out), ranges(spans), opt.get("--base", ROOT / "renders/clean.mp4"), opt.get("--out", ROOT / "renders/clean-patched.mp4"))
