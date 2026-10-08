# PozStar — logo sting

A 4.8 s, 1920×1080, 60 fps logo animation for PozStar, built in
[HyperFrames](https://github.com/heygen-com/hyperframes). `BRIEF.md` holds the intent and the
beat-by-beat plan.

| File | What it is |
| --- | --- |
| `assets/logo/pozstar-source.svg` | The logo as supplied; the single source of the shapes |
| `scripts/build.py` | Copies the shapes out of the SVG, sets the timing, writes the HTML below |
| `src/index.html` → `index.html` | Root: backdrop, the logo slot, sound cues |
| `src/logo.html` → `compositions/logo.html` | The logo sub-composition and its GSAP timeline |

Edit `src/` or `scripts/build.py`, not the generated HTML.

```bash
python3 scripts/build.py                            # regenerate the HTML
npx hyperframes check .                             # lint, runtime, layout, motion
npx hyperframes render . -q high -o renders/pozstar-logo.mp4
```
