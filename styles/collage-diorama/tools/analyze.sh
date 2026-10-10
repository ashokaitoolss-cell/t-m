#!/usr/bin/env bash
# Measures a reference video the way STYLE.md was built: cadence, speed graph, grade/palette,
# tempo/onsets and picture-vs-sound. Frame sheets go to OUT/frames (keep them out of git).
#   tools/analyze.sh path/to/reference.mp4 refs/<name>
# Needs ffmpeg and: pip install opencv-python-headless numpy scipy librosa matplotlib
set -euo pipefail
REF=$1; OUT=$2; T=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$OUT/frames"
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,duration,sample_rate -of compact "$REF" | tee "$OUT/probe.txt"
CROP=$(ffmpeg -hide_banner -i "$REF" -vf cropdetect=24:2:0 -f null - 2>&1 | grep -oE "crop=[0-9:]+" | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')
IFS=: read -r CW CH CX CY <<< "${CROP#crop=}"; echo "active picture: ${CW}x${CH} at y=${CY}" | tee -a "$OUT/probe.txt"
ffmpeg -loglevel error -y -i "$REF" -vf "fps=6,crop=$CW:$CH:$CX:$CY,scale=245:-1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:flt}':x=4:y=4:fontsize=12:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x6" "$OUT/frames/sheet_%02d.png"
python3 "$T/motion.py" "$REF" "$OUT/motion.csv"
python3 "$T/cadence.py" "$OUT/motion.csv" > "$OUT/cadence.txt"
python3 "$T/speed_graph.py" "$OUT/motion.csv" "$OUT/speed-graph.png" "$OUT/steps.csv"
python3 "$T/look.py" "$REF" "$OUT/palette.png" "$CY" "$((CY + CH))" | tee "$OUT/look.txt"
ffmpeg -loglevel error -y -i "$REF" -vn -ac 1 -ar 22050 "$OUT/audio.wav"
ffmpeg -hide_banner -i "$REF" -af ebur128=peak=true -f null - 2>&1 | tail -12 > "$OUT/loudness.txt"
python3 "$T/audio.py" "$OUT/audio.wav" | tee "$OUT/audio.txt"
python3 "$T/sync.py" "$OUT/audio.wav" "$OUT/steps.csv" "$OUT/picture-vs-sound.png"
echo "done: $OUT"
