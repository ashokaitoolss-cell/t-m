---
project: muse
status: rough idea, not finalized
source: Muse — Script (Draft 3) PDF, @wawefilms, Oct 1 2026
mascot: reference/muse-mascot.webp (supplied by Ashok, Oct 1 2026)
character: female
image model: Seedream 5.0 Pro (seedream_v5_pro) via Higgsfield, GPT Image 2.5 as alternate
---

# Muse — character brief

## What the script says (Draft 3 read-through)

Eight beats, roughly 60–90 s:

1. **Old Life montage** (0:00–0:12) — Ashok's day loops three times: wake, brush, desk, send, sleep. Each loop more tired.
2. **The News** (0:12–0:14) — third night, phone in bed, faint news of Meta launching Muse. He falls asleep holding the phone.
3. **She's Here** (0:14–0:22) — Muse is beside the bed with luggage. "Recovery thirty-one… and it's red. Good morning!" Access granted.
4. **The Washroom** — Muse follows, dumping information. Forty emails handled, three need a reply. "Tell them exposure doesn't pay rent." / "Already did."
5. **Kitchen** — brand advance landed, item back in stock, cook's 1:58 voice note sped to 100x, order placed. "Two brands are 45 days late. Sending both of them emails."
6. **Muse at Work** — Ashok paints Muse while she works. "Can you order my—" / "Ordered." Whispered "Chatbots." wink.
7. **The Gym** — approvals mid-rep. "Last set. I believe in you. Mostly."
8. **Ending** — 11:02 PM. "Asleep by 11:30 and you wake up green." Muse keeps working beside him.

What the script needs from the character:
- Always one step ahead: finishes Ashok's sentences, acts before approval, deadpan confidence.
- Physically small and portable: sits on the kitchen table, on the desk, next to the bed with luggage, spins into a tiny trainer outfit.
- Warm, not cold: the "I believe in you. Mostly." and bedtime beats are affection, not nagging.
- Costume changes are implied (trainer outfit at the gym), so the base look needs a strong silhouette that survives swaps: beret + spectacles + bow.

Muse is female, matching the script's "she".

## The mascot (base, do not change)

`reference/muse-mascot.webp` is the source of truth. Everything below is read off it:

| Attribute | Spec |
|---|---|
| Body | One rounded, hooded head-and-body silhouette, no neck, chubby |
| Fur | Cream / off-white, short plush fur, matte |
| Face | Oval smooth peach-toned face patch set into the fur |
| Eyes | Two small glossy black dots |
| Cheeks | Soft pink blush circles |
| Mouth | Tiny curved black smile |
| Arms | Two short stubby rounded arms, no fingers |
| Legs | Two short stubby legs, no feet detail |
| Not present | Ears, tail, nose, eyebrows, lashes |
| Render | Soft 3D plush, realistic fur strands, soft diffused light, white seamless |

## PA dressing (locked unless changed)

| Item | Spec |
|---|---|
| Height | ~90 cm. Top of the beret level with Ashok's belt line / waist (Ashok ≈ 175 cm) |
| Hat | Soft blush-pink wool beret perched on the hood, tilted slightly to one side |
| Spectacles | Round thin gold-wire frames resting on the face patch |
| Neck | Muted teal satin ribbon around where the neck would be, tied in a soft bow at the front, two short tails down the belly |
| Lanyard | Thin black cord around where the neck would be, small blank white ID card on the belly below the bow |
| Prop | Slim black tablet tucked under the right stub arm |
| Clothing | None otherwise, fur stays visible |
| Variant | Same look with a slim muted teal knitted tie instead of the bow (see `F5`) |
| Default expression | The mascot's own calm smile |
| Expression set | Neutral, happy-arc-eyes grin, restless wide-eye "o", half-lid deadpan, wink with stub arm to mouth, closed-eye sleepy smile |

Colour logic: the blush beret picks up the cheek blush, the teal bow is the single cool accent and carries over to the gym variant.

## Character sheets (`character-sheets/`)

Two renders of the same female dressing, both from the mascot as image reference, Oct 1 2026.

**Primary: Seedream 5.0 Pro** (`S*`, requested model). Softer, more real-plush fur, felt beret. It tied the teal ribbon around the neck like a choker with the bow at the front, which reads well and is now the locked placement.

| File | What it is |
|---|---|
| `S1-split.png` | Hero sheet. Full body + chest-up close-up |
| `S2-turnaround.png` | Front / 3/4 / profile / back. Body comes out slightly more egg-shaped than the mascot, use S1 for proportions |
| `S3-expressions.png` | Full body + six expressions |
| `S4-scale.png` | Beside a 175 cm stand-in, beret top just above the belt line (reads ~100 cm). Stand-in is an anonymous generated figure, not Ashok |
| `S5-split-tie-variant.png` | Knitted tie in place of the bow. The full-body panel lost the lanyard, close-up has it. Optional |

**Alternate: GPT Image 2.5** (`F*`). Tighter to the mascot proportions, bow sits at the face edge, lanyard consistent. Keep as the fallback if Seedream drifts on scene plates.

| File | What it is |
|---|---|
| `F1-split.png` | Hero sheet |
| `F2-turnaround.png` | Four views |
| `F3-expressions.png` | Six expressions |
| `F4-scale.png` | Scale against the stand-in |
| `F5-split-tie-variant.png` | Tie variant |

Earlier passes are kept for reference only:
- `superseded-male-pa/`: the mascot dressed with a flat cap and tie, before the female direction.
- `superseded-human-pa/`: the first pass, built before the mascot was supplied, which treated Muse as a small human.

**Recommendation:** the bow look, Seedream render (`S1`). The tie variant is there if the tie gag matters more than the silhouette.

Optional, not done: tiny eyelashes on the dot eyes would push the female read further, but that edits the mascot's face. Say so if you want it.

## Wardrobe by scene (`character-sheets/wardrobe/`)

Constants in every scene: the mascot itself, round gold spectacles. The beret and bow are the "office" signature and come off only where the script changes her clothes (gym) or the time of day changes her (late night). Rendered with Seedream 5.0 Pro using the mascot plus the locked hero sheet as references.

| Scene | Script beat | Outfit | File |
|---|---|---|---|
| 3. She's Here | Bedside, morning, "got the late-night flight", luggage | Beret, specs, bow, tiny camel belted trench with collar up, blush travel neck pillow, mint-green cabin suitcase with handle up, boarding pass in the pocket. No lanyard or tablet yet | `W1-arrival.png` |
| 4. The Washroom | Follows him to the washroom door, dumping information | Base PA look: beret, specs, bow, lanyard with blank ID, tablet | `../S1-split.png` |
| 5. Kitchen | Sits on the table at a laptop while he makes coffee | Beret, specs, bow, tiny open teal knitted cardigan with sleeves pushed up, cream coffee mug, small silver laptop | `W2-kitchen.png` |
| 6. Muse at Work | At his desk, on a call ("Can you connect me to a real human?") | Base PA look plus a tiny black headset with boom mic over the beret, a blank yellow sticky note on her belly, tablet | `W3-at-work.png` |
| 7. The Gym | "Muse spins into a tiny trainer outfit" | No beret: teal terry sweatband. Specs. Tiny teal zip track jacket with white sleeve stripes, white wristbands, silver whistle on a black cord in place of the bow, stopwatch. No lanyard or tablet | `W4-gym.png` |
| 8. Ending | 11:02 PM, "Muse keeps working beside him" | No beret: blush knitted nightcap with pom-pom. Specs. Oversized cream cable-knit cardigan, no bow, open laptop with a warm screen glow, mug of chamomile | `W5-late-night.png` |

`W0-lineup.png` shows all six side by side in script order for a one-glance continuity check.

Colour logic holds across scenes: blush for anything on the head, teal for anything at the neck or on the body, cream for the cosy pieces so they read as "more of her".

## Look of the film (grade and lighting)

Reference frames in `reference/grade/` (five stills Ashok supplied). What they share, and what every plate and prompt now carries:

- Colour-negative film emulation, fine 35mm grain, lifted blacks, soft highlight roll-off, halation on bulbs and windows.
- Teal-green shadows and cyan window daylight against warm amber tungsten practicals and low golden sun. Warm skin preserved through the grade.
- Muted greens, ochres and creams in the dressing. Vintage anamorphic feel: shallow focus, oval bokeh, soft frame edges, occasional horizontal flare.
- Lighting is motivated: one window, one bulb, one shaft of sun. No fill from nowhere.

Three of the five frames contain recognisable actors, so they stay in the repo as mood only and are never uploaded as generation references.

## Ashok — bathroom attire (`character-sheets/ashok/`)

Rendered with Soul 2.0 on the trained identity **Ashok - 2026 New** (`soul_id 18a426eb-5fa2-466f-a1cd-1a5a64f6cbe0`). A second ready identity, "Ashok Reddy - Final", has longer hair and is not used. The Soul Cinema trainings of Ashok on the account are in a failed state, so Ashok renders through Soul 2.0 only.

Soul 2.0 note: its single image slot is a subject reference, not a prop reference. Attaching the toothbrush photo there made the model render the toothbrush and drop Ashok. Props go in as text; the prop photo stays in `reference/` for the team and for Seedance.

| Item | Spec |
|---|---|
| Hair | Thick messy black bedhead, pushed up on one side |
| Face | Thin dark moustache, clean chin, medium-brown skin, half-lidded morning eyes |
| Top | Slept-in faded olive-grey crew-neck cotton tee, stretched collar, no print |
| Bottom | Soft navy cotton pyjama trousers, fine white check, drawstring |
| Feet | Bare |
| Props | Small cream cotton face towel over the left shoulder. Toothbrush per `reference/prop-toothbrush.png`: white body, sky-blue rubber grip panel and thumb pad, pale blue bristles, no brand text |

| File | What it is |
|---|---|
| `A1-bathroom-fullbody.png` | Full-body base on mid-gray seamless |
| `A2-bathroom-6panel.png` | Six-panel sheet: front, both profiles, back, face, toothbrush detail |
| `A3-doorway-toothbrush-cu.png` | The script's last beat in the film grade: leaning out of the washroom door, toothbrush in mouth, disbelief |
| `superseded/` | Earlier takes: eight-panel sheet with sandals, close-ups with a printed tee or the brush head outside the mouth, and the generic blue brush before Ashok supplied the real one |

## Locations (`locations/`)

Empty plates rendered with Soul Cinema, 16:9, in the film grade. Same room in every plate: terrazzo floor, window camera-left of the bed, pale wooden shelf with a pleated lamp, a plant and an orange mushroom lamp, desk with monitor, ring light and tripod, mesh chair with a hoodie, ceiling fan, washroom door at the far end with off-white tile, a teal-green tile band, a frosted window and one bare warm bulb.

| File | Angle | Used for |
|---|---|---|
| `L1-room-wide-toward-washroom.png` | From the foot of the bed toward the washroom door | Scene 4 shot 1, the walk from behind |
| `L2-washroom-doorway-from-room.png` | Low, three steps back from the door, slippers on the threshold | Muse's close-ups beside the door |
| `L3-washroom-interior-sink-mirror.png` | Inside, facing basin and mirror, bulb above, water heater, bucket | Ashok's close-up brushing |
| `L4-room-reverse-from-washroom.png` | From the washroom door back toward the bed and window, sun flaring | Reverse angles, Muse's eyeline, scene 3 and scene 8 backgrounds |

Location sheets (two 4K pages, built from these plates, not new renders): `locations/sheets/LS1-ashoks-room.png` and `locations/sheets/LS2-washroom.png`. Each page: hero plate, two secondary angles, a top-down plan with camera positions and light sources, locked dressing, light, continuity notes. Source HTML and the render script are in `locations/sheets/src/` (render with `node render.mjs <outdir>`).

Seedream 5.0 Pro six-angle sheets, generated from the plates as references: `locations/sheets/SD1-ashoks-room-6angles.png` (wide, reverse, doorway, desk corner, shelf corner, top-down plan) and `locations/sheets/SD2-washroom-6angles.png` (basin, looking out the door, threshold, heater corner, floor and bucket, top-down plan). Use the composed LS sheets for notes and the SD sheets for angles.

Open continuity point from the sheets: L1 puts the window on the left wall, L4 puts one behind the bed. Treat as two windows or lock one before scene plates. Recommendation: left wall is the key, the end-wall window stays for the flare shot only.

## Scene prompts (`scenes/`)

- `04-washroom/seedance-prompt.md`: the Washroom beat as one 15 s Seedance clip plus a two-clip split, with the @Image reference map.

## Reusable identity block (paste into any image prompt, always attach `reference/muse-mascot.webp` as the image reference)

> The character is exactly the mascot from the reference image, unchanged: a chubby plush creature with cream off-white fluffy fur, one rounded hooded head-and-body silhouette with no neck, an oval smooth peach-toned face patch, two small glossy black dot eyes, soft pink blush circles on the cheeks, a tiny curved black smile, two short stubby rounded arms with no fingers, two short stubby legs, no ears, no tail, no nose, same fur colour, same face and same proportions as the reference. She is dressed as a female personal assistant: a soft blush-pink wool beret perched on top of the hooded head and tilted slightly to one side, round thin gold-wire spectacles resting on the face patch in front of the eyes, a muted teal satin ribbon around where the neck would be tied in a soft bow at the front with two short ribbon tails hanging down the belly, a thin black lanyard with a small blank white ID card on the belly below the bow, a slim black tablet tucked under the right stub arm, no other clothing. Soft 3D plush render matching the reference, realistic short fur strands, matte plush texture, soft wool texture on the beret, soft diffused studio lighting.

## Next steps

- Confirm bow vs tie (recommend bow).
- Wardrobe by scene is done (see above). Remaining: a sitting pose per scene (table, desk, bedside) once plates exist.
- Scene 4 is prompt-ready. Next scenes in order of reference need: 3 (bedside with luggage), 5 (kitchen table), 6 (desk), 7 (gym), 8 (bedside night). Each needs one or two Soul Cinema plates and Ashok in that scene's attire.
- Voice: see `voice/VOICE.md`.
