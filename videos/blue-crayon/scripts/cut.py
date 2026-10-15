"""Cut a scene from generated takes: trim each shot, join them with hard cuts, level the sound.

    python3 scripts/cut.py video/scene1/edl.json

The EDL is a JSON file:

    {"out": "video/scene1/scene1_cut.mp4",
     "shots": [{"src": "video/scene1/takes/s1_outside_sd25.mp4", "in": 0.0, "out": 2.375, "note": "..."}]}

Every cut is a hard cut. Each shot's sound gets a 15 ms fade at both ends so the cuts don't
click, and the whole scene is levelled to -18 LUFS (dialogue-free short film, for review).
"""
import json
import subprocess
import sys


def main():
    edl = json.load(open(sys.argv[1]))
    shots = edl["shots"]
    args, parts = ["ffmpeg", "-v", "error", "-y"], []
    for i, s in enumerate(shots):
        args += ["-i", s["src"]]
        d = s["out"] - s["in"]
        parts.append(
            f"[{i}:v]trim={s['in']}:{s['out']},setpts=PTS-STARTPTS,fps=24,"
            f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v{i}];"
            f"[{i}:a]atrim={s['in']}:{s['out']},asetpts=PTS-STARTPTS,aresample=48000,"
            f"afade=t=in:d=0.015,afade=t=out:st={d - 0.015:.3f}:d=0.015[a{i}]"
        )
    joined = "".join(f"[v{i}][a{i}]" for i in range(len(shots)))
    graph = ";".join(parts) + f";{joined}concat=n={len(shots)}:v=1:a=1[v][a];[a]loudnorm=I=-18:TP=-1.5:LRA=11[an]"
    args += ["-filter_complex", graph, "-map", "[v]", "-map", "[an]",
             "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", edl["out"]]
    subprocess.run(args, check=True)
    total = sum(s["out"] - s["in"] for s in shots)
    print(f"wrote {edl['out']} ({len(shots)} shots, {total:.2f} s)")


if __name__ == "__main__":
    main()
