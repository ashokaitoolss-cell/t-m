# Duo explainer — 2.5D paper-halftone short

Vertical (1080×1920, 30 fps) explainer cut to the 60.5 s voiceover in `assets/vo.mp3`,
following the *2.5D Paper-Halftone Explainer* style guide.

## Status

Work in progress. Scene plates come from Higgsfield; the render pipeline
(HTML/GSAP planes → Playwright frame capture → texture pass → ffmpeg mix) is being built here.

## Layout

- `assets/vo.mp3`: voiceover
- `assets/fonts/`: Instrument Serif (italic + roman), Inter (OFL)
- `data/words.json`: word-level timings of the voiceover (Parakeet TDT via sherpa-onnx)
- `data/vo_tokens.json`: raw ASR tokens and timestamps
