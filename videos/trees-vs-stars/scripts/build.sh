#!/usr/bin/env bash
# Downloads the Higgsfield clip and voice take, fits the voice into 5 s, mixes it over the
# clip's own paper SFX, burns captions.ass in Anton, and writes renders/trees-vs-stars.mp4.
set -euo pipefail
cd "$(dirname "$0")/.."

CDN=https://d8j0ntlcm91z4.cloudfront.net/user_35dpR1Nkl67NvnpwV6uy9nd9ih4
mkdir -p .media/fonts renders
[[ -f .media/clip.mp4 ]]  || curl -sSfL -o .media/clip.mp4  "$CDN/hf_20261010_091045_96bb41bb-ea89-4b99-97c3-c6b4ae5aef71.mp4"
[[ -f .media/voice.wav ]] || curl -sSfL -o .media/voice.wav "$CDN/hf_20261010_091115_c81b3968-7ed7-4a39-bf4f-cfd6fc080341.wav"
[[ -f .media/fonts/Anton-Regular.ttf ]] || curl -sSfL -o .media/fonts/Anton-Regular.ttf \
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/anton/Anton-Regular.ttf"

# Voice: drop 0.2 s of lead-in, cut the comma pause from 0.68 s to 0.3 s, play 5% faster,
# start at 0.12 s. Clip audio sits at 28% under it; the mix is normalized to -14 LUFS.
ffmpeg -hide_banner -loglevel error -y -i .media/clip.mp4 -i .media/voice.wav -filter_complex "\
[1:a]aresample=48000,asplit=2[va][vb];\
[va]atrim=start=0.20:end=2.93,asetpts=PTS-STARTPTS[a1];\
[vb]atrim=start=3.31,asetpts=PTS-STARTPTS[a2];\
[a1][a2]concat=n=2:v=0:a=1,atempo=1.05,adelay=120|120,apad[vo];\
[0:a]volume=0.28[amb];\
[amb][vo]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout];\
[0:v]subtitles=captions.ass:fontsdir=.media/fonts[vout]" \
  -map "[vout]" -map "[aout]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -t 5 -movflags +faststart renders/trees-vs-stars.mp4

echo "renders/trees-vs-stars.mp4"
