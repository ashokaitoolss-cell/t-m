---
title: First Light
purpose: a short film for the Kling 4.0 release
length: 58s
aspect: 21:9
method: Anerneq (20-block prompts, tagged assets, one source of light, fix one block at a time)
engine: Seedance 2.5 (every shot and the spoken line)
status: story approved; storyboard in storyboard.html
---

# FIRST LIGHT

A film first. The whole night is the premiere of Kling 4.0, but its name is only read in the last
shot.

## Director's statement

**Theme.** Someone always hands you the light.

**Pitch.** On a rainy night in a small town, the cinema premieres a new picture, and the old
projectionist lets his granddaughter start it. It's her first time.

**Visual language (functional, not decorative).**

- **21:9.** Two people stay small inside a big, dark building.
- **Practical light only, one source per scene.** A cold street lamp outside, one caged work lamp in
  the booth, then the projector beam. Everything past two metres goes to darkness.
- **Handheld, never travels.** An operator who stands or kneels, breathes, drifts a beat late. No
  gimbal, no drone, no dolly.
- **Colour as meaning.** Graphite and cold blue everywhere. Warm amber only where a person makes
  light by hand: the lamp, the beam, and in the last shot the marquee.
- **No score.** Rain, iron stairs, breath, the projector. The quietest moment is the switch.

## How Kling 4.0 lives in the story

The release is the story, told as a premiere night. It isn't an ad added to the end.

1. **Premiere night.** Tonight the cinema opens a new picture. On the booth shelf, among the
   dented old cans, sits one new, clean can with its label turned away. The film they thread and
   start is that one, and nobody says what it is.
2. **The handover is the release.** His hands know the old machine by heart; hers are touching it
   for the first time. "Your turn." is the release, said as one line: a new generation starts the
   picture.
3. **The name lands last, inside the world.** The marquee bulbs warm up and the letters read
   `KLING 4.0 / NOW SHOWING`. The film we just watched was the premiere of Kling 4.0.
4. **Nods to what 4.0 adds.** The 21:9 frame (4.0's new ultra-wide) and a legible sign that holds
   while the camera breathes. Shots 1.1 and 4.2 are the same frame, dark and then lit.

No product talk inside the film. After the marquee: black, then a small card.

## Cast, places, props

Each asset has one `@` tag, a text description, and a reference sheet. Faces are generated once
and never run through a model again. A new state gets a new tag.

Props are locked from the location plates so they cannot drift from the rooms they live in
(`assets/props`, built by `scripts/prop_prompts.py` and `scripts/build_prop_sheets.py`). The
projector and the marquee are lifted straight out of the plates; the rest are Soul Cinema museum
stills on grey, described from the plates.

| Tag | Description (describe, don't name) |
|---|---|
| `@GRANDPA` | Late 70s, tall and stooped. Large, thick-fingered hands with small old burn scars on the fingertips. Grey stubble, deep-set eyes, a knitted charcoal cardigan over a collared shirt, reading glasses on a cord. **Voice lock:** low, dry, unhurried, a slight rasp, words formed on the tail of an exhale. |
| `@GIRL` | About 9. Small, slim hands. Dark hair flattened by rain. A navy wool duffel coat two sizes too big, sleeves rolled, rubber boots. She must never look like him: age, size, hands. |
| `@CINEMA_EXT_NIGHT` | A small single-screen cinema on a street corner, 1950s facade, a dark marquee with changeable letters, wet cobbles, one cold blue-white street lamp. No cars, no people, no shop signs. |
| `@CINEMA_EXT_LIT` | The same frame after the marquee is lit. New tag, not an overwrite. |
| `@BOOTH` | A cramped projection room with a low ceiling, bare brick, film cans stacked on shelves, a small square port window in the front wall, one caged work lamp. |
| `@AUDITORIUM` | Dark and empty. Rows of worn seats falling away into black, a high ceiling you can't see. |
| `@PROJECTOR` | The machine in the BOOTH plate, taken from the plate itself: a tapered dark blue-green steel pedestal; a gunmetal housing with a five-spoked handwheel over a round glass door; a four-spoked wheel on a short column on top; a thick steel lens tube aimed at the port, a ribbed motor drum under it; at the back a black cylindrical lamp house with a pale riveted end cap and a curved cable arm. |
| `@FILM_CANS` · `@NEW_CAN` | Plain round flat tins in dull grey tin plate, dented and scuffed, no labels; one new tin of the same size, bright and unscratched. Its label is never shown (LABEL NOT SHOWN in every block). |
| `@FILM_REEL` | A dark pressed-steel 35mm reel about 40 cm across, five wide curved cut-outs, loaded with dark brown film. |
| `@CRATE` | A low, wide, open-topped crate of honey-coloured pine, about 60 × 40 × 35 cm, the top edges worn smooth. She stands on it. |
| `@BOOTH_LAMP` | A clear pear-shaped bulb inside a round cage of thin black wire loops, on a single black cord. |
| `@SWITCH` | A big round black bakelite disc on a small square of pale painted brick, a cream knob crossed by a raised grip bar, rubbed smooth by decades of thumbs. |
| `@MARQUEE` | The lit board from the CINEMA_EXT_LIT plate: milk glass framed by a single row of warm clear bulbs, black block letters on two lines. |

## Shot list and storyboard

The story is in `STORY.md`. The shot list and storyboard (drawn 21:9 panels, an overhead plan per
scene, and the full shot table) are in `storyboard.html`, built by `scripts/build_storyboard.py`.

| Scene | Time | Shots |
|---|---|---|
| 1 · The street | 0:00–0:13 | 1.1 wide · 1.2 medium · 1.3 close |
| 2 · The booth | 0:13–0:35 | 2.1 wide · 2.2 insert · 2.3 medium two-shot · 2.4 insert · 2.5 close |
| 3 · The beam | 0:35–0:48 | 3.1 close · 3.2 wide reverse · 3.3 medium |
| 4 · Now showing | 0:48–0:58 | 4.1 insert · 4.2 wide (= 1.1) · card |

**Runtime 58s** · 13 shots + card.

## Method (from *Anerneq, Decoded*)

1. **A project skill for this film:** the 20 blocks in fixed order, with this film's own verbatim
   Style, Light, Lens and Capture text. The negative spine gets our additions: light rays from
   nowhere, glowing screens, sodium-orange streetlight, teal-and-orange grade, modern cars,
   phones, any readable text except the marquee.
2. **Assets as stills first:** character sheets (costume front/back on grey, then the face lit the
   way the film lights it), location plates with no people, props shot like museum objects.
3. **One keyframe still per shot, in 21:9,** cut to time as an animatic with the natural sound.
   This locks the film before any video is generated.
4. **Video per shot, or per sequence** as a single multi-cut clip (up to 30s) where continuity of
   light and wardrobe matters most, as with SEQ 2.
5. **Check each take against the anti-AI-tell rules. Fix one block at a time.**

## Open decisions

- **Reels on the projector.** The story gives the machine two big reels on arms; the BOOTH plate
  shows one wheel on a column on top and no lower arm. Proposed: the reel mounts on that top
  spindle, and the story line becomes "a big reel on top".
- **Marquee wording.** `NOW SHOWING` if the film goes out on release day; `OCTOBER` or
  `PREMIERE TONIGHT` if it goes out before, as a teaser.
- **Marquee text in Seedance.** Short text can still break in generation. If the letters don't hold,
  composite them onto 4.2 in the edit.
