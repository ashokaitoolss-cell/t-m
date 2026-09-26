#!/usr/bin/env bash
# Full pipeline: plates -> scene planes -> compositions -> clean render -> print texture + mix.
#   scripts/build.sh            # everything
#   scripts/build.sh --no-render  # stop after lint (for Studio preview)
set -euo pipefail
cd "$(dirname "$0")/.."

NODE_USE_ENV_PROXY=1 node scripts/fetch-plates.mjs || echo "some plates could not be downloaded; placeholders will stand in"
python3 scripts/prep-plates.py
[[ -d assets/plates && -n "$(ls assets/plates 2>/dev/null)" ]] && python3 scripts/analyze-plates.py > /dev/null
python3 scripts/synth-sfx.py
python3 scripts/prep-sfx.py  # library picks replace the synthesized placeholders
node scripts/prep-typing.mjs
node scripts/build-scenes.mjs
node scripts/build-timeline.mjs
node scripts/carve.mjs --comp index.html
npx hyperframes lint

[[ "${1:-}" == "--no-render" ]] && exit 0

mkdir -p renders
npx hyperframes render --quality delivery --output renders/clean.mp4
python3 scripts/finish.py renders/clean.mp4 renders/duo-guilt-engine.mp4
