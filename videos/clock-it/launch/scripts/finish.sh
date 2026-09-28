#!/usr/bin/env bash
# Master and share copy from the clean 60 fps render plus a fresh audio mix.
#   renders/clean.mp4  (npx hyperframes render --fps 60 --quality delivery --output renders/clean.mp4)
#   or the video given as $1, e.g. renders/clean-patched.mp4 from scripts/segment.py
#   -> renders/clock-it-launch.mp4        master: video stream copied + renders/mix.wav
#   -> renders/clock-it-launch-share.mp4  two-pass H.264 under 30 MiB for sharing in chat
set -euo pipefail
cd "$(dirname "$0")/.."
src=${1:-renders/clean.mp4}
node scripts/build.mjs
python3 scripts/mix.py   # masters to -14 LUFS, true peak <= -1.8 dBTP before AAC

ffmpeg -hide_banner -loglevel error -y -i "$src" -i renders/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -movflags +faststart -shortest renders/clock-it-launch.mp4

# Share copy: 28 MiB budget over the film's length, minus 192 kbps audio.
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 renders/clock-it-launch.mp4)
vk=$(python3 -c "print(int(28*1024*1024*8/$dur/1000 - 192))")
ffmpeg -hide_banner -loglevel error -y -i renders/clock-it-launch.mp4 -c:v libx264 -preset slow -b:v ${vk}k -pass 1 -passlogfile renders/x264 -an -f mp4 /dev/null
# Audio straight from the master WAV: re-encoding the master's AAC overshoots on the ticks.
ffmpeg -hide_banner -loglevel error -y -i renders/clock-it-launch.mp4 -i renders/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset slow -b:v ${vk}k -pass 2 -passlogfile renders/x264 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest renders/clock-it-launch-share.mp4
rm -f renders/x264*
ls -la renders/clock-it-launch*.mp4
for f in renders/clock-it-launch.mp4 renders/clock-it-launch-share.mp4; do
  echo "$f: $(ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{s=1} s' | grep -E " I:|Peak:" | tr -s ' ' | tr '\n' ' ')"
done
