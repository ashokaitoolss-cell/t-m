# PozPad — logo sting

A 5.5 s, 1920×1080, 60 fps logo animation for the PozPad app icon, built in
[HyperFrames](https://github.com/heygen-com/hyperframes). `BRIEF.md` holds the intent and the
beat-by-beat plan.

| File | What it is |
| --- | --- |
| `scripts/build.py` | Logo geometry (measured from the source) and timing; writes the files below |
| `src/index.html` → `index.html` | Root: backdrop, the logo slot, sound cues |
| `src/logo.html` → `compositions/logo.html` | The logo sub-composition and its GSAP timeline |
| `assets/logo/pozpad.svg` | Static, clean vector of the logo (usable on its own) |

Edit `src/` or `scripts/build.py`, not the generated HTML.

```bash
python3 scripts/build.py                            # regenerate HTML + SVG
npx hyperframes check .                             # lint, runtime, layout, motion
npx hyperframes render . -q high -o renders/pozpad-logo.mp4
```
