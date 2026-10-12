---
message: "The friend his father refused is the one who gives the boy back to him."
aspect: 1920x1080
language: English (eight short lines; the robot never speaks)
length: 90s
angle: silent short film, made with AI
---

# Blue Crayon (working title)

A 90-second short with almost no dialogue. The robot never speaks. The people say eight short
lines between them, and the last one is a voiceover. The full screenplay is `SCRIPT.pdf`.

## Logline

A frightened stray robot becomes a five-year-old's best friend through one ritual: drawing
together, with a crayon taped to its clumsy finger. The boy's father never accepts it. After
the boy is gone, the robot brings the father the last drawing his son made — and it is the
first time the father takes anything from its hand.

## The ritual: the taped crayon

The robot's three stubby fingers can't hold a crayon; it keeps slipping. The boy giggles, rips a
strip of tape and tapes a blue crayon to the robot's finger. From then on that is how every
drawing session starts — *rrrip*, tape, crayon — and the drawings go up on the wall by the
living-room window until the wall is covered.

Why this one:

- **Wordless.** Tape, crayon, a wall filling up: readable in a second, no explanation needed.
- **It's about the boy making room for the robot.** The robot can't do the thing; the boy finds a
  way so it can. That is their whole friendship in one gesture.
- **The wall is a progress bar.** It fills during the fun, a drawing falls off it during the
  grief.
- **It gives the robot something to carry at the end.** The last drawing, unfinished on the
  little table, is the "thing lying there" the robot stares at, and the thing it brings the father.
- **The crayon stays taped on.** Through the whole grief montage the robot never takes it off.
- **A mirror.** Earlier the robot holds up its own drawing to the father and he walks past without
  looking. At the end it holds up a drawing the same way, and this time he looks.

### The last drawing (the reveal)

Crayon on paper, five-year-old style: a tall stick figure labelled **PAPA** (backwards first P),
a small one labelled **ME** in the middle, and the robot (boxy body, big round eyes) — all
three holding hands under a big yellow sun, with a red heart over the robot. Papa is smiling.

The boy drew the three of them as a family, with himself as the bridge holding both their
hands. In the final hug the bridge is gone and the father and the robot hold each other directly.
Never show this drawing clearly until shot 28.

## Characters

Lock each one with a character sheet before generating any shots.

**The Boy (5).** Small, messy hair, oversized yellow hoodie, red sneakers, always has his red
rubber ball. Fearless, giggly, stubborn when it matters.

**Papa (mid-30s).** Stubble, tired eyes, rolled-up shirt sleeves, wristwatch, always half on his
phone. Not a villain: busy, tired and protective. Later: black suit, then a stained undershirt,
unshaven.

**The Robot.** About the boy's height (~1 m). Rounded egg-shaped head with a dark glass face
screen showing two large, round, soft warm-white eyes; small body; short legs; stubby
three-fingered hands. Faded pale-mint paint, scuffs, rust streaks, a dent on the head, one
mismatched bolt — it was thrown away. It moves slowly with hunched shoulders and makes no
voice sounds, only soft servo whirs. Its eyes glow, and in the dark acts that glow is the only
light.

Keep its range of expression small. These are the only five states:

| State | Eyes | Body |
| --- | --- | --- |
| Fear | small, quick blinks | curled up, trembling |
| Curious | widen, slow blink | head tilts |
| Joy | curve up into arcs | small bounce |
| Hurt | dim, look down | head lowers, arms hang |
| Resolve | brighten | straightens up |

Joy appears only in Acts 1–2. It never appears in Act 5.

**Props.**
- Red rubber ball: brings them together, then lies deflated under the table.
- Blue crayon and a roll of tape.
- The drawing wall.
- The last drawing.

## Locations

- **Market street.** Busy, sunlit stalls, and a shadowed gap between crates where the robot hides.
- **Apartment, living room.** The drawing corner: a low kid's table by the window, with the wall
  of drawings beside it. This is where the ritual happens and where the robot waits after the boy
  is gone.
- **Apartment, boy's bedroom.** Where he is sick, behind the door Papa keeps shut on the robot,
  and where Papa sits in the dark at the end.
- **Apartment, kitchen and hallway.**

## Look

Hand-painted: chunky dry-brush strokes with a canvas-grain stipple, warm light against cool
violet-grey shadows, and slightly caricatured shapes. The style lock and the Midjourney prompts
are in `STYLE.md`. The robot's design is round 1 robot B, repainted in this style in
`assets/painterly/`.

Test the look in motion before generating all 30 shots: painted brush texture can shimmer from
frame to frame in AI video.

Colour by act:

1. **The Ball.** Golden morning, busy, saturated.
2. **The Crayon.** Warm lamplight; crayon primaries on the wall.
3. **The Fever.** Grey-blue daylight, rain on the window.
4. **Empty.** Near-black and desaturated. The only colour is the drawing wall in the shadows.
5. **The Drawing.** Darkness lit only by the robot's warm eye-glow. The drawing's crayon colours
   are the brightest thing on screen.

## Sound

- **Voices.** Eight short lines, all in `SCRIPT.fountain`. The robot never speaks, only whirs.
  - Papa's flat "No." in the street is answered by the boy's "No!" when Papa tries to throw the
    robot out.
  - The boy's "Papa! Look!" (shot 15) comes back as the film's only voiceover, faint and far
    away, when Papa finally looks at the drawing (shot 28).
- **Bond motif:** the *rrrip* of tape and the scratch of crayon. A simple 4-note piano (or
  music-box) theme enters in the ritual montage.
- **Act 3:** the theme drops out, leaving rain.
- **Act 4:** near silence: a clock, a bottle on a table, a fading siren.
- **Act 5:** a servo creak as the robot rises, the paper rustling, then Papa's breath breaking
  into sobs. The 4-note theme returns once, slowly, unfinished, on the final shot. Cut to black
  in silence.

## Changes from the original outline

- In the street, Papa's refusal and the robot's "be my friend" are one exchange. The boy looks
  back; the robot, still in the shadows, lifts one small hand.
- The robot follows them home and the boy sneaks it in that night. Papa finds them drawing, and
  the boy stands in front of the robot with his arms spread.
- The robot's attempt to win Papa over is holding up its own drawing. This sets up the mirror at
  the end.
- The drawing corner is in the living room, so the robot can sit by it while it's shut out of the
  sick room.
- The death is shown only through ambulance lights at night and Papa coming home alone, in the
  rain, in a black suit.
- At the end Papa is in the boy's bedroom. The robot walks in through the door that was shut on it.

## Before generating

1. Character sheets for the Boy, Papa and the Robot. Include the robot's five eye states.
2. Generate the last drawing as one still and reuse it, so it is identical in shots 20, 25 and 28.
3. Generate one clip per shot, then trim. Shots run 2–4 s, so a 5 s generation per shot leaves
   room to trim.
