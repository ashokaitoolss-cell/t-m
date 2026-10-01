---
project: muse
status: rough idea, not finalized
source: Muse — Script (Draft 3) PDF, @wawefilms, Oct 1 2026
mascot: reference/muse-mascot.webp (supplied by Ashok, Oct 1 2026)
character: female
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
| Neck | Muted teal satin ribbon tied in a soft bow at the lower edge of the face patch, two short tails down the belly |
| Lanyard | Thin black cord around where the neck would be, small blank white ID card on the belly below the bow |
| Prop | Slim black tablet tucked under the right stub arm |
| Clothing | None otherwise, fur stays visible |
| Variant | Same look with a slim muted teal knitted tie instead of the bow (see `F5`) |
| Default expression | The mascot's own calm smile |
| Expression set | Neutral, happy-arc-eyes grin, restless wide-eye "o", half-lid deadpan, wink with stub arm to mouth, closed-eye sleepy smile |

Colour logic: the blush beret picks up the cheek blush, the teal bow is the single cool accent and carries over to the gym variant.

## Character sheets (`character-sheets/`)

Generated with GPT Image 2.5 (high, 2k) through Higgsfield on Oct 1 2026, with the mascot as the image reference.

| File | What it is |
|---|---|
| `F1-split.png` | Hero sheet. Full body + chest-up close-up |
| `F2-turnaround.png` | Front / 3/4 / profile / back. Back view shows only beret, lanyard cord and fur |
| `F3-expressions.png` | Full body + six expressions |
| `F4-scale.png` | Beside a 175 cm stand-in, beret top on the belt line. Stand-in is an anonymous generated figure, not Ashok |
| `F5-split-tie-variant.png` | Same look with the knitted tie in place of the bow. Optional |

Earlier passes are kept for reference only:
- `superseded-male-pa/`: the mascot dressed with a flat cap and tie, before the female direction.
- `superseded-human-pa/`: the first pass, built before the mascot was supplied, which treated Muse as a small human.

**Recommendation:** the bow look (`F1`). The tie variant is there if the tie gag matters more than the silhouette.

Optional, not done: tiny eyelashes on the dot eyes would push the female read further, but that edits the mascot's face. Say so if you want it.

## Reusable identity block (paste into any image prompt, always attach `reference/muse-mascot.webp` as the image reference)

> The character is exactly the mascot from the reference image, unchanged: a chubby plush creature with cream off-white fluffy fur, one rounded hooded head-and-body silhouette with no neck, an oval smooth peach-toned face patch, two small glossy black dot eyes, soft pink blush circles on the cheeks, a tiny curved black smile, two short stubby rounded arms with no fingers, two short stubby legs, no ears, no tail, no nose, same fur colour, same face and same proportions as the reference. She is dressed as a female personal assistant: a soft blush-pink wool beret perched on top of the hooded head and tilted slightly to one side, round thin gold-wire spectacles resting on the face patch in front of the eyes, a neat muted teal satin ribbon tied in a soft pussy-bow at the lower edge of the face patch with two short ribbon tails hanging down the belly, a thin black lanyard with a small blank white ID card on the belly below the bow, a slim black tablet tucked under the right stub arm, no other clothing. Soft 3D plush render matching the reference, realistic short fur strands, matte plush texture, soft wool texture on the beret, soft diffused studio lighting.

## Next steps

- Confirm bow vs tie (recommend bow).
- Gym variant: same beret and spectacles, teal sweatband or tiny teal track top, no bow.
- Scene plates: comp Muse against Ashok's own plates using the belt line as the scale reference. Sitting-on-table and sitting-on-bed-with-luggage poses are the two most used in the script.
- Voice: see `voice/VOICE.md`.
