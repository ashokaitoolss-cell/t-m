---
workflow: general-video
flow: companion
storyboard: no
message: "Clock It! is an analog point of view for people building what comes next — and the whole brand was made with AI."
aspect: 1920x1080
language: en
audience: tech and AI founders; design-minded, upper-middle-class buyers whose working lives are intensely digital
length: 38s
angle: product launch with a twist reveal
---

## Intent

A product launch film for the Clock It! watch, built only from motion design and a code-built
3D model of the watch: no photos, no footage, no voiceover, no captions. It opens on the
problem — generic, screen-first taste in watches and accessories among founders — introduces
the watch, shows why it is different, lands the brand, then reveals that none of it is real:
the idea, concept, product, images, brand guidelines and this film were all made with AI.

Style: the ssspin.io reel as studied in the style doc (https://claude.ai/code/artifact/40b3c779-c665-4fcf-a920-4ed61a29cbc4):
one hero at dead centre, symmetrical framing, pastel/neutral palette with a complementary
accent, living gradients, soft bevelled 3D, nothing ever static, fluid spring-and-ease motion
with motion blur on fast moves, landings on the beat, and no hard cuts — every change is a
morph or a camera move. The user wants it to feel like a real product launch; animations
polished, a little brisk rather than slow, always smooth. Text carries the story but stays
light.

## Assets

- ../lab/watch.js — procedural three.js model of the watch (fluted bezel, olive dial, charcoal
  hands, oxide centre cap, ball crown, separate bracelet links) and the extruded logo. Built from
  the product photos and the turnaround sheet; the user approved the rebuilt cross-section.
- Logo (user-supplied image): two offset rectangular segments framing an exact interval — "a
  compact abstract pause". Traced into `logoShape()` in watch.js.
- Brand palette "01 — Olive / Object": Warm Paper #F3EFE6 (background), Charcoal #242521 (text),
  Olive #596047 (primary), Brass #AC9167 (support), Oxide #913F3B (accent, used sparingly).
- Typography "02 — Instrument Sans + Inter": display Instrument Sans Medium 500, body Inter
  Regular 400. Avoid heavy weights.
- Brand brief (clock-it-brief.md): lines "An analog point of view.", "For people building what
  comes next.", "Good taste. On your time."; voice short, assured, quietly witty.
- SFX library https://genxi-media-sfx.netlify.app/ — the user asked for this library for this film:
  "very tactile sfx, and ethereal sounding sfx".

## Customizations

- Music composed in code: minimal, warm, 100 BPM; busier and more digital in the problem act,
  warm when the watch arrives, a one-beat pause on the logo (its "interval"), a shift for the
  AI reveal.
- SFX: very tactile (watch ticks, crown clicks, metal link clinks, soft presses) and ethereal
  (glassy shimmers, airy swells), all picked from the user's library.
- Real 3D watch rendered with three.js inside the composition; links fly off and reassemble
  into the logo.
- Motion blur on fast moves (sub-frame accumulation on the 3D layer).

## Notes

- No hard cuts. No voiceover, no captions, no images or video clips.
- Brief guardrails: name only visible design cues; no claims about metal, movement, origin,
  price or durability; never "gold", "Swiss-made", "handcrafted", "automatic", "sustainable".
  Spell "Clock It!" exactly. No crowns, shields, clock-hand icons or gold gradients in brand moments.
- The reveal is honest: Clock It! is a concept brand; everything was generated with AI.
