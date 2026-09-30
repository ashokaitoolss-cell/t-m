---
title: First Light
purpose: a short film for the Kling 4.0 release
length: 58s
aspect: 21:9
method: Anerneq (20-block prompts, tagged assets, one source of light, fix one block at a time)
status: treatment, awaiting approval
---

# FIRST LIGHT

A film first. The whole night is the premiere of Kling 4.0, but its name is only read in the last
shot.

## Director's statement

**Theme.** Someone always hands you the light.

**Pitch.** On a rainy night in a small town, the cinema premieres a new picture, and the old
projectionist lets his granddaughter start it. It's her first time.

**Visual language (functional, not decorative).**

- **21:9.** Two people stay small inside a big, dark building. 21:9 is also new in Kling 4.0.
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
4. **Made the way 4.0 works.** 21:9 ultra-wide (new in 4.0). The one spoken line is lip-synced in
   camera. The marquee relies on 4.0's text that holds legible as the camera moves. Shots 1.1 and
   4.1 are the same frame, dark and then lit, using first/last-frame keyframes.

No product talk inside the film. After the marquee: black, then a small card.

## Cast, places, props

Each asset has one `@` tag, a text description, and a reference sheet. Faces are generated once
and never run through a model again. A new state gets a new tag.

| Tag | Description (describe, don't name) |
|---|---|
| `@GRANDPA` | Late 70s, tall and stooped. Large, thick-fingered hands with small old burn scars on the fingertips. Grey stubble, deep-set eyes, a knitted charcoal cardigan over a collared shirt, reading glasses on a cord. **Voice lock:** low, dry, unhurried, a slight rasp, words formed on the tail of an exhale. |
| `@GIRL` | About 9. Small, slim hands. Dark hair flattened by rain. A navy wool duffel coat two sizes too big, sleeves rolled, rubber boots. She must never look like him: age, size, hands. |
| `@CINEMA_EXT_NIGHT` | A small single-screen cinema on a street corner, 1950s facade, a dark marquee with changeable letters, wet cobbles, one cold blue-white street lamp. No cars, no people, no shop signs. |
| `@CINEMA_EXT_LIT` | The same frame after the marquee is lit. New tag, not an overwrite. |
| `@BOOTH` | A cramped projection room with a low ceiling, bare brick, film cans stacked on shelves, a small square port window in the front wall, one caged work lamp. |
| `@AUDITORIUM` | Dark and empty. Rows of worn seats falling away into black, a high ceiling you can't see. |
| `@PROJECTOR` | A heavy cast-iron machine the height of a man, two big metal reels on arms above and below, a lamp housing at the back, the film running through a gate past a small bright lens. |
| `@NEW_CAN` | A clean, unscratched silver film can sitting among dented, rusted old ones, a paper label on its side always turned away from camera (LABEL NOT SHOWN in every block). |
| `@SWITCH` | A worn black bakelite rotary switch on a metal plate, the paint rubbed off where thumbs have turned it for decades. |

## Shot list

Every sequence is covered wide, medium and close, the way a scene is shot for real.

### SEQ 1 · THE STREET · 0:00–0:13 · cold

| # | Size | Len | What happens | Sound |
|---|---|---|---|---|
| 1.1 | WIDE | 6s | Night, rain, the empty corner. The cinema is dark, the marquee blank. A small figure runs across the wet street with a coat held over her head, toward the side door. The operator is across the street under an awning and does not travel. | rain on the awning, her boots in water |
| 1.2 | MEDIUM | 4s | The side door. He opens it before she knocks, warm lamp spill behind him. She ducks under his arm without stopping. He glances once up the empty street, then shuts it. | latch; the rain cuts off |
| 1.3 | CLOSE | 3s | Iron stairs. Her wet boots climb two at a time, water dripping from the coat hem. His slower, heavier steps follow into frame. | boots on iron, his breath |

### SEQ 2 · THE BOOTH · 0:13–0:35 · one lamp

| # | Size | Len | What happens | Sound |
|---|---|---|---|---|
| 2.1 | WIDE | 5s | The booth, low and cramped, the projector, the one caged lamp. He hangs her dripping coat on a nail; she climbs onto a film crate to see. On the shelf among the dented cans, the one new can. Beyond the lamp, darkness. | drips, the lamp's faint buzz |
| 2.2 | CLOSE | 4s | The new can is open, its reel on the projector. His hands thread the film through the gate and round the sprockets. Thick, scarred, certain; he isn't looking at them. | film ticking over metal |
| 2.3 | MEDIUM | 5s | Two-shot. He stops with the last loop undone, looks at her, holds out the loose end. **"Your turn."** She takes it. | the line, then nothing |
| 2.4 | CLOSE | 4s | Her small hands. The film slips off the sprocket once. She seats it again; the teeth catch. | one small click |
| 2.5 | CLOSE | 4s | Him, watching her hands, not her face. His thumb rubs across his fingertips as if he were doing it himself. | his breath, held |

### SEQ 3 · THE BEAM · 0:35–0:49

| # | Size | Len | What happens | Sound |
|---|---|---|---|---|
| 3.1 | CLOSE | 3s | Her finger over the switch. A held beat. Behind her, out of focus, he nods once. She turns it. | silence, then the clunk |
| 3.2 | WIDE | 5s | Reverse, from the empty auditorium: the beam fires out of the small port window and across the dark over the empty rows, dust turning in it. The screen is never shown. | the projector starts to chatter |
| 3.3 | MEDIUM | 6s | Through the port glass: both faces in the flicker. She stares at the screen, lips parted, breath held. He isn't watching the screen. He's watching her. | projector, muffled by glass |

### SEQ 4 · NOW SHOWING · 0:49–0:58

| # | Size | Len | What happens | Sound |
|---|---|---|---|---|
| 4.1 | WIDE | 6s | The same frame as 1.1. Rain, the empty corner. The marquee bulbs warm up a few at a time, and the letters read **KLING 4.0 / NOW SHOWING**. | rain, the projector faint through the wall, the bulbs' tick |
| card | — | 3s | Black. `Kling 4.0`, small, centred. | silence |

**Runtime 58s** · 12 shots + card · 11 cuts.

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

- **Marquee wording.** `NOW SHOWING` if the film goes out on release day; `OCTOBER` or
  `PREMIERE TONIGHT` if it goes out before, as a teaser.
- **Engine.** Kling 4.0 isn't on Higgsfield yet (the account lists Kling 3.0: 16:9 max, 15s).
  Kling's full 4.0 release is due in October. Seedance 2.5 is available now with 21:9 and 30s clips.
- **Credits.** Stills and the animatic are cheap. Video iteration at Anerneq's rate (about 15
  rounds per shot) is not.
