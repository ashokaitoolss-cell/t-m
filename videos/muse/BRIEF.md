---
project: muse
status: rough idea, not finalized
source: Muse — Script (Draft 3) PDF, @wawefilms, Oct 1 2026
---

# Muse — character brief

## What the script says (Draft 3 read-through)

Eight beats, roughly 60–90 s:

1. **Old Life montage** (0:00–0:12) — Ashok's day loops three times: wake, brush, desk, send, sleep. Each loop more tired.
2. **The News** (0:12–0:14) — third night, phone in bed, faint news of Meta launching Muse. He falls asleep holding the phone.
3. **She's Here** (0:14–0:22) — Muse is beside the bed with luggage. "Recovery thirty-one… and it's red. Good morning!" Access granted.
4. **The Washroom** — Muse follows, dumping information. Forty emails handled, three need a reply. "Tell them exposure doesn't pay rent." / "Already did."
5. **Kitchen** — brand advance landed, item back in stock, cook's 1:58 voice note sped to 100x, order placed. "Two brands are 45 days late. Sending both of them emails."
6. **Muse at Work** — Ashok paints Muse while Muse works. "Can you order my—" / "Ordered." Whispered "Chatbots." wink.
7. **The Gym** — approvals mid-rep. "Last set. I believe in you. Mostly."
8. **Ending** — 11:02 PM. "Asleep by 11:30 and you wake up green." Muse keeps working beside him.

What the script needs from the character:
- Always one step ahead: finishes Ashok's sentences, acts before approval, deadpan confidence.
- Physically small and portable: sits on the kitchen table, on the desk, next to the bed with luggage, spins into a tiny trainer outfit.
- Warm, not cold: the "I believe in you. Mostly." and bedtime beats are affection, not nagging.
- Costume changes are implied (trainer outfit at the gym), so the base look needs a strong silhouette that survives swaps: cap + spectacles + tie.

**Open point:** the script writes Muse as "she". This brief follows the newer direction (male PA, "he") from today's message. If Muse stays "she", the sheets regenerate with the same wardrobe on a female character and the voice shortlist changes.

## Character bible — MUSE (locked unless changed)

| Attribute | Spec |
|---|---|
| Role | Ashok's AI personal assistant, launched by Meta (fictional framing) |
| Height | ~90 cm. Top of cap level with Ashok's belt line / waist (Ashok ≈ 175 cm) |
| Proportions | Grown man, scaled down. Look A: true 1:7 adult ratio. Look B: gently stylized 1:5 head ratio (recommended) |
| Age read | Mid-thirties, not a child, not a caricature |
| Skin / heritage | Warm medium-brown South Asian skin |
| Face | Oval, defined jawline, straight nose, closely trimmed short black beard and moustache |
| Hair | Short black, side-parted, under the cap |
| Eyes | Dark brown, muted catchlights, no glare |
| Spectacles | Round, thin gold-wire frames |
| Hat | Charcoal herringbone wool flat cap (newsboy) |
| Shirt | Crisp white cotton oxford, sleeves rolled to the forearm |
| Tie | Slim muted teal knitted tie, flat square bottom |
| Waistcoat | Fitted charcoal, plain charcoal back panel |
| Trousers | Slim navy tapered chinos, tan leather belt |
| Shoes | Polished tan leather brogues |
| Props | Thin black lanyard with a small blank white ID card. Slim black tablet under the left arm. No bag, no watch |
| Default expression | Calm, confident slight smile |
| Expression set | Neutral-attentive, playful good-morning grin, restless eyebrow raise, deadpan "already did it" smirk, whisper-and-wink, warm sleepy late-night smile |

## Character sheets (`character-sheets/`)

Two looks, same bible. Generated with GPT Image 2.5 (high, 2k) through Higgsfield on Oct 1 2026.

| File | What it is |
|---|---|
| `A1-photoreal-split.png` | Look A, live-action composite look. Full body + chest-up |
| `A2-photoreal-turnaround.png` | Look A, front / 3/4 / profile / back |
| `A3-photoreal-expressions.png` | Look A, full body + six expressions |
| `A4-photoreal-scale.png` | Look A beside a 175 cm stand-in. **Came out too tall (chest height), needs a regen or a comp fix** |
| `B1-3d-split.png` | Look B, stylized 3D. Full body + chest-up |
| `B2-3d-turnaround.png` | Look B, front / 3/4 / profile / back |
| `B3-3d-expressions.png` | Look B, full body + six expressions |
| `B4-3d-scale.png` | Look B beside the stand-in. **Cap sits exactly on the waist line, this one is correct** |

**Recommendation: Look B (stylized 3D).** Reasons: it reads instantly as a character and not a composited small man, the slightly bigger head and softer features match the "cute and fluffy" voice direction, and it will sit more comfortably on a table or desk in live-action plates without uncanny-valley problems. Look A is kept as the fallback if the film wants Muse to feel like a tiny real person.

The scale stand-in is an anonymous generated figure, not Ashok. For the real film, comp Muse against Ashok's own plate using the waist line as the reference.

## Reusable identity block (paste into any image prompt)

> MUSE, an original character: a small adult man about 90 cm tall with adult proportions gently stylized, slightly larger head of about one to five head-to-body ratio, clearly a grown man in his mid-thirties and not a child, warm medium-brown South Asian skin, oval face with a defined jawline, straight nose, neat short black hair side-parted under the cap, closely trimmed short black beard and moustache, dark brown eyes behind round thin gold-wire spectacles, calm confident slight smile, wearing a charcoal herringbone wool flat cap, crisp white cotton oxford shirt with sleeves rolled to the forearm, a slim muted teal knitted tie with a flat square bottom, a fitted charcoal waistcoat, slim navy tapered trousers with a tan leather belt, polished tan leather brogues, a thin black lanyard with a small blank white ID card, a slim black tablet tucked under the left arm, no bag, no watch, stylized 3D character render, smooth subsurface-scattering skin, detailed hair strands and realistic wool, cotton and knit cloth materials.

For Look A swap the render clause for: "visible fine skin texture with natural pores, no digital smoothing, no beauty filter, high-end unretouched commercial photography style, cinematic realism" and use "fully adult proportions simply scaled down, adult head-to-body ratio of about one to seven".

## Next steps

- Lock Look A vs B (recommend B).
- Regenerate `A4` only if Look A is chosen.
- Gym variant: same head, cap and spectacles, tiny trainer outfit (teal track top keeps the tie colour as the brand accent).
- Train a reusable Soul / character reference from `B1` + `B2` so every scene plate gets the same face.
- Voice: see `voice/VOICE.md`.
