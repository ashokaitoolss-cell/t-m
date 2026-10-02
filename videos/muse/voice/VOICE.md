# Muse — voice

Direction: **cute, bubbly, female. A friend who happens to remember everything.** Fun and friendly first, efficient second. She is not an assistant reading a status report. She is the friend who texts "did you eat?" and also already paid your electricity bill. The comedy is the gap between how light she sounds and how much she has already done.

Listen on the playable board: https://claude.ai/artifact/J5PK3cgsa1CG6DgkPUBy3c (source: `board.html`, auditions bundled as page files).

## Target voice (the spec)

| Trait | Target |
|---|---|
| Register | Light, high-ish young-woman voice. Airy and small, never a baby voice, never a squeak |
| Texture | Soft, slightly breathy, rounded, with a smile in it. No rasp, no nasal edge, no vocal fry |
| Energy | Bubbly. Bounces on the good-morning lines, giggles at her own "say yesss", drops to a near-whisper for "Chatbots." and the 11:02 PM bedtime beat |
| Pace | Brisk and a little impatient, like a friend who is already halfway out the door. One-word replies ("Ordered." "Already did.") land as a shrug and a grin, not a confirmation |
| Accent | Neutral Indian-English or a light international English. Must say "daal" and the cook's Hindi naturally. Avoid a heavy American read |
| Anti-reference | Not Siri or Alexa, not a customer-service voice, not a corporate assistant, not a Minion, not an anime squeak |

## Auditions in `auditions/`

Rendered through Higgsfield on Oct 1 2026, all reading the same test line. I cannot listen to audio in this session, so these are candidates for you to A/B, not a ranked pick. ElevenLabs renders are the closest preview of what ElevenLabs itself will give you.

Test line:
> Recovery thirty-one… and it's red. Good morning! Got the late-night flight. Give me a yes and I'll get my work started. Only three of the eleven things on last night's to-do list matter. The rest, I can handle. Last set. I believe in you. Mostly.

**Bubbly batch, listen first** (female, fun and friendly, shorter line that opens on "Good morning!"):

| File | Preset | Engine | Why |
|---|---|---|---|
| `41-anush-elevenlabs.mp3` | Anush | ElevenLabs | Indian-named preset, may carry the accent the cook beat needs |
| `42-gracie-elevenlabs.mp3` | Gracie | ElevenLabs | Light and bright |
| `43-hallie-elevenlabs.mp3` | Hallie | ElevenLabs | Warm, chatty |
| `44-willow-elevenlabs.mp3` | Willow | ElevenLabs | Soft and friendly |
| `45-bella-elevenlabs.mp3` | Bella | ElevenLabs | Playful |
| `46-annie-elevenlabs.mp3` | Annie | ElevenLabs | Upbeat |
| `47-skye-elevenlabs.mp3` | Skye | ElevenLabs | Airy |
| `48-chloe-elevenlabs.mp3` | Chloe | ElevenLabs | Quick, bright |
| `49-zoe-elevenlabs.mp3` | Zoe | ElevenLabs | Quick, bright |
| `50-roxie-elevenlabs.mp3` | Roxie | ElevenLabs | Bigger personality, slower |
| `51-kiki-seed-pitchup3-fast.mp3` | Kiki | Seed Audio, pitch +3, speed +12 | Pitched up and quick for maximum bounce |
| `52-pixie-seed-pitchup4-fast.mp3` | Pixie | Seed Audio, pitch +4, speed +12 | Pitched up and quick, highest of the set |

**Earlier female reads** (first female pass, a little more composed, longer line opening on "Recovery thirty-one"):

| File | Preset | Engine | Why |
|---|---|---|---|
| `10-pixie-elevenlabs.mp3` | Pixie | ElevenLabs | Soft high register, the closest "fluffy" reference |
| `27-pixie-seed-pitchup2.mp3` | Pixie | Seed Audio, pitch +2, speed +8 | Same voice, a touch brighter and quicker |
| `21-daisy-elevenlabs.mp3` | Daisy | ElevenLabs | Light and friendly |
| `28-daisy-seed-pitchup3.mp3` | Daisy | Seed Audio, pitch +3, speed +8 | Pitched up, quicker |
| `22-evie-elevenlabs.mp3` | Evie | ElevenLabs | Young, bright |
| `23-juno-elevenlabs.mp3` | Juno | ElevenLabs | Warm, a little more grounded |
| `24-hana-elevenlabs.mp3` | Hana | ElevenLabs | Shortest, fastest read |
| `25-kiki-elevenlabs.mp3` | Kiki | ElevenLabs | Playful |
| `26-lucy-elevenlabs.mp3` | Lucy | ElevenLabs | Soft, slower |

**Superseded male reads** (made before the female direction, kept for reference): `01`–`09`, `11`. One render (Cody via ElevenLabs) failed on the provider side and was not retried.

## Build it in ElevenLabs v4

Eleven v4 is the current flagship. It follows audio tags such as [whispers], [laughs], [sighs] more reliably than v3, supports Voice Design with attributes like age, accent, pacing and tone, and can clone from about 10 seconds of audio. Voice Design previews support audio tags, so the whisper beat can be tested before committing.

**Step 1 — Voice Design prompt (Voices → Voice Design, model Eleven v4):**

> A small, cute, fluffy plush creature who is your bubbly best friend and happens to remember everything. Young woman, light and airy voice, soft and slightly breathy, with a constant smile in the tone, clearly not a child and not a cartoon squeak. Neutral Indian-English accent, crisp consonants, quick excited pacing with little giggles. Warm, teasing and encouraging, never formal, never like a customer-service assistant. Drops to a cosy whisper for secrets and bedtime. Studio-clean, close-mic, no reverb.

Generate 3 previews with the test line above. Pick the one where "Already did." lands flat and funny and "Good morning!" sounds like she is smiling.

**Step 2 — Settings for the final generations (Eleven v4):**

| Setting | Value | Why |
|---|---|---|
| Stability | 40–50 | Enough variation for the playful lines, not so loose it drifts between takes |
| Similarity | 75–80 | Keep the designed timbre |
| Style exaggeration | 35–45 | Bubbly needs bounce. Above 50 it tips into mascot-costume |
| Speed | 1.05–1.10 | Muse is a half-step ahead of Ashok |
| Speaker boost | on | Keeps the light voice present in a mix with room tone |

**Step 3 — Script with v4 audio tags (ready to paste):**

```
[giggles] Recovery thirty-one… [teasing] and it's red. Good morning!
[quick] Got the late-night flight. Give me a yes and I'll get my work started.
[restless] We don't rest! Say yesss, say yesss, I'm ready to rollll!
[matter-of-fact] Access?
[excited, rapid] Last night's reel was the best one this month. I handled forty emails; three need your reply.
[breezy] Only three of the eleven things on last night's to-do list matter. The rest, I can handle. One brand wants you for exposure.
[shrugging, amused] Already did.
[bright] The brand advance has landed. It came back in stock zero point five… zero point six… zero point seven… one second ago. Should I order?
[singsong] Ordered.
[warm, amused] You never have to.
[polite, on a call] Can you connect me to a real human?
[whispers] Chatbots.
[cheerful] Recovery's red. Light day.
[cheering] Last set. I believe in you. [giggles] Mostly.
[soft, gentle] Asleep by eleven-thirty and you wake up green.
[soft] Say it like you mean it.
```

**Step 4 — If a preset audition wins instead:** clone it. Render 20–30 s of clean lines with the winning preset, upload to ElevenLabs Instant Voice Clone on v4 (10 s minimum), then apply the same settings and tags. Check the preset's licence allows that use first.

## Decision needed from you

1. Pick the pitch and energy from the female auditions above (or say "higher" / "lower" / "softer").
2. Confirm the accent: neutral Indian-English (recommended, matches the Hindi cook beat) or light international English.
3. Then I render the full Draft 3 line set in the chosen voice.
