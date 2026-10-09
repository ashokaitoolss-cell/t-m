# Eleven V4 — logo sting

A 6.5 s, 1920×1080, 60 fps logo animation built in code with HyperFrames: the supplied gradient
flows under a WebGL shader while the lockup is typed in, its caret morphs into the V4 pill, and
one press lands it. Sound is synthesized in code.

| Path | What it is |
| --- | --- |
| `index.html` | Root: the two sub-compositions and the sound track |
| `compositions/gradient.html` | The living gradient (fragment shader over `assets/plate.png`, drawn from film time) |
| `compositions/lockup.html` | The wordmark, caret → pill morph, V4, press and ripple (one GSAP timeline) |
| `assets/source/eleven-v4.webp` | The supplied logo still |
| `assets/plate.png`, `data/logo.json` | Gradient with the logo painted out; traced glyph paths and pill geometry |
| `assets/audio/sting.wav` | Sound design |

## Rebuild

```bash
python3 scripts/prep_logo.py   # plate + traced glyphs   (numpy, pillow, scipy, opencv-python-headless, potracer)
node scripts/build.mjs         # write the glyphs into compositions/lockup.html
python3 scripts/sound.py       # sound design           (numpy, scipy)
npm run check
npm run render                 # or: npx hyperframes render . -q delivery -o renders/eleven-v4-sting.mp4
```

`NODE_PATH=$(npm root -g) node scripts/look.mjs OUT 0.5 2.3 3.2` saves quick stills without a
full render (needs Playwright).
