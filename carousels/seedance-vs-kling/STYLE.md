# Model-comparison carousel: style guide

Taken from the covers of two @ashokreddyai posts: the heat-vision post (DcVzK4-k9Yc) and the paper-scrap collage post (DbnsVLvk5ZK).
Only slide 1 of each was reachable without logging in. The story structure below therefore comes from those covers plus the full captions.

## What the reference posts do

- **Canvas:** 1080×1350 (4:5 portrait).
- **Cover grid (reference):** the result image runs full-bleed down the left half (0–500 px). A small "before" image sits top right (520–1020 × 0–550). Under it are a hand-drawn loop arrow, a 2-line headline and a 3-line sub.
- **Seamless swipe:** a 40 px strip of the next slide's image shows on the right edge of the cover. That strip pulls people to swipe.
- **Type:** one tight grotesk (Inter Display) at negative tracking. The headline is bold and the sub is medium. There's no second typeface.
- **Colour:** a near-black background with one accent colour for all text and the arrow (mint on green, blush on navy). There are no gradients or boxes behind the text.
- **Copy voice:** short declarative sentences. Line 1 is the hook and line 2 is the payoff, as in "Upload a photo. Get this back." Then there's a material list ("Charcoal sheet. Blush paper tears. Metal staples."), the thesis ("The image stays. The material changes.") and a keyword CTA ("Comment 'SCRAP'…").

## Series system for comparisons

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0E0F13` | All slides, every post |
| `--panel` / `--line` | `#16181E` / `#2A2D36` | Prompt card, tables |
| `--text` / `--muted` | `#F1EEE7` / `#8D909B` | Body copy / kickers, footers |
| `--a` | `#FF9A7A` coral | Model A (Seedance), always |
| `--b` | `#9BF2D2` mint | Model B (Kling), always |
| Headline | Inter Display Bold 76/58 px, −0.055em | One accent per post |
| Sub | Inter Display Medium 32 px, −0.035em | |
| Kicker | Inter Display SemiBold 22 px caps, +0.14em | "ROUND 01 · LIQUID PHYSICS" |

Every image carries a model chip (a dot plus the name, in that model's colour). A model keeps the same colour across the whole series.

## Slide flow

1. **Cover:** an even split. Model A takes the left half and model B the right, both full-height and labelled, with the hook on a fade across the bottom.
2. **The test:** the prompts word for word, plus each model's settings side by side.
3. **Rounds:** for each prompt there's a result slide (two 9:16 stills, labelled) and a notes slide. The notes cover motion realism, visual quality and prompt following, with one line per model and a 5-dot score.
4. **Scoreboard:** the totals across all rounds.
5. **Takeaway:** each model's strength and where it slipped, then the keyword CTA.

## Build

`content.js` holds all copy and image paths. `node design/render.mjs out/<name>` renders one PNG per slide.
