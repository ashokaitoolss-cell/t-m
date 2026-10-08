---
workflow: motion-graphics
message: "PozStar — Perfect Positioning for Success, clean and minimal."
aspect: 1920x1080
fps: 60
length: 4.8s
---

## Intent

A clean, minimalist logo sting for PozStar, a sibling of the PozPad sting (same backdrop,
pacing and sound palette). Everything slides out of an invisible slot, the way the logo's
speed bars suggest motion:

1. The three bars shoot out of the left edge, top to bottom, stretched by speed (0.2 s).
2. "PozStar" slides out of the gap after the bars; the last letter leads, so the letters arrive
   slightly spread and close up into the word (0.6 s).
3. The tagline "Perfect Positioning for Success!" fades up glyph by glyph (1.55 s).
4. A slow push-in holds on the finished logo to the end.

## Assets

- `assets/logo/pozstar-source.svg` — the logo as supplied (Illustrator SVG). `scripts/build.py`
  copies its bars, letters and tagline glyphs path for path, so the final frame is the logo.
- `assets/sfx/` — soft tactile cues from the GenXi library used in the other films.

## Notes

- The supplied SVG includes the tagline; the PNG preview did not show it.
- Light neutral backdrop (white centre, soft grey edges) so the blue, orange and green read true.
