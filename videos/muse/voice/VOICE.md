# Muse — voice

Direction: **cute and fluffy, female**. A soft, round, bright little voice delivering ruthless efficiency ("Already did.") with total calm. The comedy is the gap between how she sounds and what she has already done.

## Target voice (the spec)

| Trait | Target |
|---|---|
| Register | Light, high-ish young-woman voice. Airy and small, never a baby voice, never a squeak |
| Texture | Soft, slightly breathy, rounded. Think a plush toy that talks. No rasp, no nasal edge, no vocal fry |
| Energy | Bouncy on the good-morning lines, drops to a near-whisper for "Chatbots." and the 11:02 PM bedtime beat |
| Pace | Brisk. Muse is always slightly ahead of Ashok. Clipped one-word replies ("Ordered." "Already did.") land dry, no upward lilt |
| Accent | Neutral Indian-English or a light international English. Must say "daal" and the cook's Hindi naturally. Avoid a heavy American read |
| Anti-reference | Not Siri or Alexa, not a Minion, not an anime squeak, not a customer-service voice |

## Auditions in `auditions/`

Rendered through Higgsfield on Oct 1 2026, all reading the same test line. I cannot listen to audio in this session, so these are candidates for you to A/B, not a ranked pick. ElevenLabs renders are the closest preview of what ElevenLabs itself will give you.

Test line:
> Recovery thirty-one… and it's red. Good morning! Got the late-night flight. Give me a yes and I'll get my work started. Only three of the eleven things on last night's to-do list matter. The rest, I can handle. Last set. I believe in you. Mostly.

**Listen to these first** (female, cute direction):

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

> A small, cute, fluffy plush creature who works as a hyper-efficient personal assistant. Young woman, light and airy voice, soft and slightly breathy with a warm rounded tone, clearly not a child and not a cartoon squeak. Neutral Indian-English accent, crisp consonants, fast confident pacing. Cheerful and bright, with a playful deadpan when delivering one-word answers. Not robotic. Studio-clean, close-mic, no reverb.

Generate 3 previews with the test line above. Pick the one where "Already did." lands flat and funny and "Good morning!" sounds like she is smiling.

**Step 2 — Settings for the final generations (Eleven v4):**

| Setting | Value | Why |
|---|---|---|
| Stability | 40–50 | Enough variation for the playful lines, not so loose it drifts between takes |
| Similarity | 75–80 | Keep the designed timbre |
| Style exaggeration | 25–35 | A little bounce. Higher starts to sound like a mascot costume |
| Speed | 1.05–1.10 | Muse is a half-step ahead of Ashok |
| Speaker boost | on | Keeps the light voice present in a mix with room tone |

**Step 3 — Script with v4 audio tags (ready to paste):**

```
[cheerful] Recovery thirty-one… [playful] and it's red. Good morning!
[quick] Got the late-night flight. Give me a yes and I'll get my work started.
[restless] We don't rest! Say yesss, say yesss, I'm ready to rollll!
[matter-of-fact] Access?
[rapid, upbeat] Last night's reel was the best one this month. I handled forty emails; three need your reply.
[calm] Only three of the eleven things on last night's to-do list matter. The rest, I can handle. One brand wants you for exposure.
[deadpan] Already did.
[bright] The brand advance has landed. It came back in stock zero point five… zero point six… zero point seven… one second ago. Should I order?
[deadpan] Ordered.
[warm, amused] You never have to.
[polite, on a call] Can you connect me to a real human?
[whispers] Chatbots.
[cheerful] Recovery's red. Light day.
[encouraging] Last set. I believe in you. [deadpan] Mostly.
[soft, gentle] Asleep by eleven-thirty and you wake up green.
[soft] Say it like you mean it.
```

**Step 4 — If a preset audition wins instead:** clone it. Render 20–30 s of clean lines with the winning preset, upload to ElevenLabs Instant Voice Clone on v4 (10 s minimum), then apply the same settings and tags. Check the preset's licence allows that use first.

## Decision needed from you

1. Pick the pitch and energy from the female auditions above (or say "higher" / "lower" / "softer").
2. Confirm the accent: neutral Indian-English (recommended, matches the Hindi cook beat) or light international English.
3. Then I render the full Draft 3 line set in the chosen voice.
