---
format: 1080x1920
duration: 60.5s
message: "Duolingo didn't build a mascot. It built a memory people joke about."
arc: Hook → Setup (the annoying owl) → Turn (did the opposite) → Character → Genius (emotion → culture) → Proof (TikTok) → Contrast (professional vs recognizable) → Payoff
audience: marketers, brand builders and creators on short-form social
mode: collaborative
style: 2.5D paper-halftone, painted 1960s magazine illustration
---

# Duo — the guilt engine

Every cut lands on the voiceover's word timings (`data/words.json`). Times are
absolute seconds on the master timeline. Each scene is its own sub-composition
clip on the scene track; captions, overlays (scribbles, bubbles, glints), SFX and
music sit on their own tracks.

## Video direction

- **Picture**: painterly semi-realistic 1960s magazine illustration, soft oil brushwork, muted
  desaturated world; Duo (and the one subject per scene) keeps full color. Duo reference:
  Higgsfield job `2c4a58fb-ee67-458f-9ef2-0c809361452a`.
- **Depth**: 3–4 planes per scene (fg blur 20–40 px, subject sharp, mid light blur, bg 8–15 px +
  60–100% desaturation). Clean plate behind every cut-out.
- **Camera**: one deliberate move per scene (push 1.3–2.5×, punch-in 1.2–1.4× on a caption, pan,
  or object entrance) + posterized wiggle (15 drawings/s, ≈2.6 px x / 2.4 px y, 0.05° tilt).
- **Texture (top of stack, every frame)**: halftone ~6 px @14° soft-light 18%, paper plate
  multiply 7%, radial edge blur (sharp inside 55%), vignette −25%, RGB split 0.5–1 px at edges,
  glow on captions/graphics only, 3–6 glints per scene.
- **Captions**: Instrument Serif; italic white + soft glow over pictures (~52 px, key words
  larger), roman near-black on paper (~40–44 px); 1–3 words; band y≈420–1400; never over a face.
  Animations: 3-frame blur-in pop, typewriter (≈28 cps) on paper, scale-up for key words,
  highlight box for the hook.
- **Sound**: VO from frame 1; low bassy bed that drops out/returns by section; one SFX per visual
  event (click/tick on cuts and caption pops, 0.2–0.3 s whoosh on slides/wipes, glass chime on
  glints, paper on cards, UI sounds for the phone, low hit on big moments); ~50 ms dip before key
  cuts; master −14 LUFS, TP ≤ −1 dBTP.

## Frame 1 — Hook: not a mascot

- scene: Duo on a velvet pedestal under a spotlight in a grey 1960s gallery; blurred visitors cross the lens
- start: 0.00
- duration: 2.40s
- transition_in: cut
- voiceover: "Duolingo didn't turn an owl into a mascot."
- captions: "Duolingo didn't" (highlight box) @0.00 · "turn an owl" @0.86 · "into a mascot." @1.42
- overlays: red marker strike across "mascot" @1.95
- motion: multi-phase-camera (push 1.00→1.06) · depth-of-field-blur (fg passer-by 2.5× drift) · css-marker-patterns (strike)
- sfx: low hit @0.00 · caption ticks · marker scribble @1.95 · short whoosh as the passer-by wipes
- status: outline
- src: compositions/frames/01-hook.html

Cold open on the denial. The owl is the only color in the room.

## Frame 2 — Guilt into a growth engine

- scene: Duo in a tiny engineer cap shovels coal into a huge brass engine in a dim 1960s engine room
- start: 2.40
- duration: 2.50s
- transition_in: cut
- voiceover: "They turned guilt into a growth engine."
- captions: "they turned guilt" @2.52 · "into a" @3.34 · "growth engine." @3.72
- overlays: green hand-drawn arrow draws upward beside the engine @3.76 · 2 glints
- motion: punch-in 1.25× on "growth engine" · svg-path-draw (arrow) · sine-wave-loop (furnace glow)
- sfx: whoosh on cut · mechanical thunk @2.88 ("guilt") · marker draw @3.76 · sparkle @4.2
- status: outline
- src: compositions/frames/02-growth-engine.html

## Frame 3 — Before he was famous

- scene: Duo alone on a bench in a grey 1960s train station; commuters in hats blur past in front
- start: 4.90
- duration: 2.15s
- transition_in: cut
- voiceover: "Because before Duo was internet famous,"
- captions: "before Duo" @5.18 · "was internet famous," @5.98
- motion: multi-phase-camera (slow pull-back 1.08→1.00) · depth-of-field-blur (foreground wipe)
- sfx: whoosh with the foreground crossing · tick on caption
- status: outline
- src: compositions/frames/03-before-famous.html

## Frame 4 — The most annoying part

- scene: top-down, a man in 1960s pajamas in bed with a pillow over his head; a phone glows on the nightstand
- start: 7.05
- duration: 2.80s
- transition_in: cut
- voiceover: "he was basically the most annoying part of the product."
- captions: "the most annoying" @7.74 · "part of the product." @8.70
- overlays: red marker circle around the phone @8.24
- motion: multi-phase-camera (push toward phone 1.0→1.3) · css-marker-patterns (circle)
- sfx: phone vibration x2 @7.3 / @8.0 · marker circle @8.24
- status: outline
- src: compositions/frames/04-most-annoying.html

## Frame 5 — Showing up like

- scene: Duo peeks round a bedroom door at night, hallway light spilling in
- start: 9.85
- duration: 2.00s
- transition_in: cut
- voiceover: "That little green owl showing up like,"
- captions: "that little" @9.92 · "green owl" @10.38 · "showing up like," @11.02
- motion: Duo plane slides out from behind the door edge (stepped puppet) · multi-phase-camera (push)
- sfx: soft door creak @10.0 · pop as Duo appears @10.40
- status: outline
- src: compositions/frames/05-showing-up.html

## Frame 6 — Hey, you forgot your Spanish lesson

- scene: a hand holds a phone in a dim bedroom; a notification drops onto the screen from Duo
- start: 11.85
- duration: 2.40s
- transition_in: cut
- voiceover: "hey, you forgot your Spanish lesson."
- captions: notification: "hey 👋" @11.92 then types "you forgot your Spanish lesson." @12.46 (≈28 cps)
- motion: spring-pop-entrance (notification slides + settles) · gsap-effects (typewriter) · punch-in 1.2× @12.46
- sfx: notification ding @11.92 · phone buzz · soft type ticks under the text
- status: outline
- src: compositions/frames/06-spanish-lesson.html

## Frame 7 — Most brands would hide that

- scene: a 1960s executive shoves a green owl plush into his desk drawer, glancing sideways
- start: 14.25
- duration: 1.75s
- transition_in: cut
- voiceover: "Most brands would hide that."
- captions: "most brands" @14.32 · "would hide that." @14.96
- motion: punch-in 1.2× on "hide" · drawer-push puppet (stepped)
- sfx: whoosh on cut · drawer slam @15.30
- status: outline
- src: compositions/frames/07-hide-that.html

## Frame 8 — Paper card: the opposite

- scene: text-only paper card; "opposite" flips upside down
- start: 16.00
- duration: 1.92s
- transition_in: cut
- voiceover: "Duolingo did the opposite."
- captions: typewriter "Duolingo did" @16.08 · "the opposite." @17.12 — "opposite" rotates 180° @17.40
- motion: kinetic-type-beats (paper card) · gsap-effects (typewriter)
- sfx: paper rustle on card in · paper flip @17.40 · ~50 ms dip before the next cut
- status: outline
- src: compositions/frames/08-card-opposite.html

The first story turn. A breather card.

## Frame 9 — The joke in everyone's head

- scene: 1960s commuters at a bus stop; three thought bubbles pop above their heads, each holding a tiny Duo
- start: 17.92
- duration: 2.50s
- transition_in: cut
- voiceover: "They took the joke everyone already had in their head"
- captions: "took the joke" @18.16 · "everyone already had" @18.96 · "in their head" @19.76
- overlays: thought bubbles pop @18.96 / @19.36 / @19.76 (pinned to heads)
- motion: pan across the three faces · spring-pop-entrance (bubbles)
- sfx: bubble pop x3
- status: outline
- src: compositions/frames/09-joke-in-head.html

## Frame 10 — The entire personality

- scene: a giant painted billboard of Duo's face over a grey 1960s city square
- start: 20.42
- duration: 2.88s
- transition_in: cut
- voiceover: "and made it the entire personality of the brand."
- captions: "the entire" @21.04 · "personality" @21.68 (scale-up) · "of the brand." @22.16
- motion: the one bold push-in (1.0→1.6 over the scene; planes slide apart) · glints on the billboard
- sfx: low hit on cut · push whoosh · sparkle @21.7
- status: outline
- src: compositions/frames/10-personality.html

## Frame 11 — Suddenly, not a logo

- scene: tabletop, a painted green owl app-icon card on paper; a red X scribbles over it and it spins away
- start: 23.30
- duration: 2.22s
- transition_in: whip (motion-blur-streak)
- voiceover: "Suddenly, Duo wasn't a logo."
- captions: "suddenly," @23.36 · "Duo wasn't" @24.00 · "a logo." @24.88
- overlays: red marker X @24.56 · icon spins out @25.20
- motion: motion-blur-streak (whip in) · spring-pop-entrance (icon spin-in 0.3 s) · css-marker-patterns (X)
- sfx: whip whoosh @23.30 · paper tap on icon land · marker X @24.56
- status: outline
- src: compositions/frames/11-not-a-logo.html

## Frame 12 — He was a character

- scene: Duo takes a theatrical bow on a vintage stage under a warm spotlight
- start: 25.52
- duration: 1.14s
- transition_in: light flash
- voiceover: "He was a character."
- captions: "a character." @25.92
- overlays: 4 glints twinkle
- motion: ambient-glow-bloom (flash in) · particle-burst (glints) · punch-in 1.2×
- sfx: low hit + sparkle chime
- status: outline
- src: compositions/frames/12-character.html

## Frame 13 — Petty

- scene: Duo, wings crossed, turned away with a side-eye
- start: 26.66
- duration: 0.64s
- transition_in: cut
- voiceover: "Petty,"
- captions: "Petty," (scale-up key word)
- motion: kinetic-type-beats (rapid montage beat 1/5) · punch-in
- sfx: pop hit
- status: outline
- src: compositions/frames/13-petty.html

## Frame 14 — Needy

- scene: Duo clings to a man's trouser leg with huge pleading eyes
- start: 27.30
- duration: 0.72s
- transition_in: cut
- voiceover: "needy,"
- captions: "needy,"
- motion: montage beat 2/5 · punch-in
- sfx: pop hit
- status: outline
- src: compositions/frames/14-needy.html

## Frame 15 — Unhinged

- scene: Duo wide-eyed, feathers ruffled, harsh flickering light, tilted frame
- start: 28.02
- duration: 0.80s
- transition_in: cut
- voiceover: "unhinged,"
- captions: "unhinged," (jittered)
- motion: montage beat 3/5 · stepped shake (bigger wiggle for 0.3 s)
- sfx: glitchy hit
- status: outline
- src: compositions/frames/15-unhinged.html

## Frame 16 — Low-key threatening

- scene: Duo silhouetted in a dark doorway at night, eyes glowing; a man peeks over his blanket
- start: 28.82
- duration: 1.36s
- transition_in: cut
- voiceover: "low-key threatening,"
- captions: "low-key" @28.88 · "threatening," @29.52
- motion: montage beat 4/5 · slow push 1.0→1.15
- sfx: low ominous hit @29.52
- status: outline
- src: compositions/frames/16-threatening.html

## Frame 17 — Weirdly lovable

- scene: a little girl hugs Duo in warm golden light
- start: 30.18
- duration: 1.74s
- transition_in: cut
- voiceover: "and weirdly lovable."
- captions: "and weirdly" @30.24 · "lovable." @31.04
- overlays: 3 glints
- motion: montage beat 5/5 · gentle push · particle-burst (glints)
- sfx: soft sparkle chime
- status: outline
- src: compositions/frames/17-lovable.html

## Frame 18 — Paper card: the genius part

- scene: text-only paper card; yellow marker underline scribbles under "genius"
- start: 31.92
- duration: 1.36s
- transition_in: cut
- voiceover: "That's the genius part."
- captions: typewriter "That's the" @32.00 · "genius part." @32.48
- overlays: yellow underline @32.60 · glint
- motion: kinetic-type-beats (paper card) · css-marker-patterns (highlight/underline)
- sfx: paper · marker swipe · chime
- status: outline
- src: compositions/frames/18-card-genius.html

## Frame 19 — Didn't force a brand voice

- scene: a 1960s ad man bellows into a big megaphone at a crowd that turns away; a red X lands on the megaphone
- start: 33.28
- duration: 2.90s
- transition_in: cut
- voiceover: "Duolingo didn't force a brand voice onto the internet."
- captions: "didn't force" @34.16 · "a brand voice" @34.64 · "onto the internet." @35.28
- overlays: red marker X over the megaphone @34.40
- motion: multi-phase-camera (push) · css-marker-patterns (X)
- sfx: megaphone squawk @33.4 · marker X @34.40
- status: outline
- src: compositions/frames/19-brand-voice.html

## Frame 20 — They found the emotion

- scene: extreme close-up of a man's guilty face lit blue by his phone at night
- start: 36.18
- duration: 3.20s
- transition_in: cut
- voiceover: "They found the emotion people already associated with the app"
- captions: "they found" @36.24 · "the emotion" @36.64 · "people already" @37.28 · "associated with the app" @37.84
- overlays: hand-drawn arrow + scribbled word "guilt" pointing at his face @36.80
- motion: multi-phase-camera (slow push 1.0→1.35) · svg-path-draw (arrow + word)
- sfx: marker scribble @36.80 · ticks on captions
- status: outline
- src: compositions/frames/20-found-emotion.html

## Frame 21 — Exaggerated into culture

- scene: Duo as a giant towering over a 1960s city like a B-movie poster; crowds point up
- start: 39.38
- duration: 2.62s
- transition_in: cut
- voiceover: "and exaggerated it until it became culture."
- captions: "exaggerated it" @39.60 · "until it became" @40.64 · "culture." @41.36 (scale-up)
- motion: Duo plane scales 0.7→1.0 on "exaggerated" while the camera pulls back · low glints
- sfx: rising whoosh @39.6 · big low boom @41.36 · crowd murmur under
- status: outline
- src: compositions/frames/21-culture.html

## Frame 22 — Why the TikTok worked

- scene: a hand holds a phone; on screen a vertical video of Duo dancing, hearts floating up
- start: 42.00
- duration: 1.92s
- transition_in: cut
- voiceover: "That's why the TikTok worked."
- captions: "that's why" @42.08 · "the TikTok worked." @42.56
- overlays: hearts float up from the screen (particle-burst) · Duo cut-out dances on screen (stepped)
- motion: punch-in 1.25× to the screen @42.56
- sfx: soft pops for hearts · tick
- status: outline
- src: compositions/frames/22-tiktok.html

## Frame 23 — Paper card: not random

- scene: text-only paper card; the letters of "random" jitter out of line
- start: 43.92
- duration: 1.78s
- transition_in: cut
- voiceover: "Not because the owl was random,"
- captions: typewriter "not because the owl" @44.00 · "was random," @44.96 — "random" letters scatter (seeded)
- motion: kinetic-type-beats (paper card) · deterministic per-letter jitter
- sfx: paper · tiny scatter bleeps
- status: outline
- src: compositions/frames/23-card-random.html

## Frame 24 — The product feels alive

- scene: tabletop, a phone on a desk; Duo climbs out of the screen and waves
- start: 45.70
- duration: 2.46s
- transition_in: cut
- voiceover: "because the owl made the product feel alive."
- captions: "the owl made" @46.00 · "the product" @46.64 · "feel alive." @47.04
- overlays: glints @47.10
- motion: Duo plane rises out of the screen (stepped puppet) · slow push
- sfx: whoosh-pop as he climbs · sparkle chime @47.10
- status: outline
- src: compositions/frames/24-alive.html

## Frame 25 — Most brands look professional

- scene: a symmetric grey 1960s boardroom of identical stiff men in grey suits
- start: 48.16
- duration: 1.84s
- transition_in: cut
- voiceover: "Most brands try to look professional."
- captions: "most brands" @48.24 · "try to look" @48.96 · "professional." @49.36
- motion: slow lateral pan
- sfx: whoosh on cut · muted tick (deliberately dull)
- status: outline
- src: compositions/frames/25-professional.html

## Frame 26 — Duolingo became recognizable

- scene: a crowd of identical grey-suited men in hats with one bright green Duo in the middle
- start: 50.00
- duration: 2.08s
- transition_in: cut
- voiceover: "Duolingo became recognizable."
- captions: "Duolingo became" @50.08 · "recognizable." @51.12
- motion: bold push-in 1.0→1.5 toward Duo; crowd planes slide apart
- sfx: push whoosh · glint chime @51.12
- status: outline
- src: compositions/frames/26-recognizable.html

## Frame 27 — Recognizable beats polished

- scene: a vintage boxing ring; Duo raises gloved wings in victory over a knocked-down polished mannequin in a suit
- start: 52.08
- duration: 3.52s
- transition_in: cut
- voiceover: "And on social, recognizable beats polished almost every time."
- captions: "on social," @52.32 · "recognizable" @53.04 · "beats polished" @53.68 · "almost every time." @54.56
- motion: punch-in 1.3× on "beats" · depth-of-field-blur (crowd fg)
- sfx: boxing bell @53.68 · punch thud · crowd cheer under
- status: outline
- src: compositions/frames/27-beats-polished.html

## Frame 28 — The whole play

- scene: a vintage coach's chalkboard with a play diagram; chalk arrows draw on toward a tiny chalk owl
- start: 55.60
- duration: 1.36s
- transition_in: cut
- voiceover: "That's the whole play."
- captions: "that's the whole play."
- overlays: chalk arrows draw @55.8
- motion: svg-path-draw (chalk arrows) · punch-in
- sfx: chalk scribble
- status: outline
- src: compositions/frames/28-whole-play.html

## Frame 29 — Don't build a mascot

- scene: top-down drafting table; a blueprint of an owl mascot costume gets a red X
- start: 56.96
- duration: 1.44s
- transition_in: cut
- voiceover: "Don't build a mascot."
- captions: "don't build" @57.04 · "a mascot." @57.60
- overlays: red marker X @57.10
- motion: css-marker-patterns (X) · slow push
- sfx: marker X · paper
- status: outline
- src: compositions/frames/29-dont-build.html

## Frame 30 — Build a memory

- scene: a polaroid slides onto warm paper: friends laughing together, Duo photobombing
- start: 58.40
- duration: 2.10s
- transition_in: cut
- voiceover: "Build a memory people can joke about."
- captions: "build a memory" @58.48 · "people can joke about." @59.28
- motion: spring-pop-entrance (polaroid slide + settle, 0.3 s spin) · slow 10% push · glints
- sfx: camera shutter + polaroid slide · soft chime; bed resolves out
- status: outline
- src: compositions/frames/30-memory.html

The payoff: the memory is literally a photo people keep.
