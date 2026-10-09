---
workflow: motion-graphics
flow: automation
storyboard: no
message: "Eleven V4 — the logo, alive: a moving gradient and a UI-born lockup."
aspect: 1920x1080
language: en
length: 6.5s
angle: logo sting
---

## Intent

A logo animation for the "Eleven V4" logo, built in code with HyperFrames. In the user's
words: "The animation should be gradient movement and UI and minimalistic."

## Assets

- assets/source/eleven-v4.webp — the user-supplied logo still (white "Eleven" wordmark and a
  "V4" pill over a blurred coral / green light-streak gradient). The wordmark, pill and V4 are
  traced from it; the gradient is the background plate with the logo removed.

## Customizations

- Gradient movement: the user's own gradient, driven by a WebGL shader from the timeline —
  blooms out of the dark along its light streaks, then keeps flowing for the whole piece.
- UI motion: the wordmark streams in behind a text caret, the caret morphs into the V4 pill,
  "V4" slides up inside it, and a single press-and-ripple lands the lockup.

## Notes

- Minimal: one motif (caret → chip), no extra copy, no tagline or URL.
- Final frame matches the supplied still (same layout, same gradient), held for editing room.
