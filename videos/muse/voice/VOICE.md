# Muse — voice

Direction: **cute and fluffy**. Now that the mascot is a cream plush creature, this is the whole brief: a soft, round, bright little voice delivering ruthless efficiency ("Already did.") with total calm. The comedy is the gap between how it sounds and what it has done.

## Target voice (the spec)

| Trait | Target |
|---|---|
| Register | High and light. A boyish, airy tenor, pitched above a normal adult male voice. Reads as "he" per today's direction but could pass as genderless. Never a baby, never a chipmunk |
| Texture | Soft, breathy, rounded. Think a plush toy that talks. No gravel, no rasp, no nasal edge |
| Energy | Bouncy on the good-morning lines, drops to a near-whisper for "Chatbots." and the 11:02 PM bedtime beat |
| Pace | Brisk. Muse is always slightly ahead of Ashok. Clipped one-word replies ("Ordered." "Already did.") land dry, no upward lilt |
| Accent | Neutral Indian-English or a light international English. Must say "daal" and the cook's Hindi naturally. Avoid a heavy American read |
| Anti-reference | Not a robotic assistant voice, not Siri or Alexa, not a Minion, not a mascot squeak |

## Auditions in `auditions/`

Rendered through Higgsfield on Oct 1 2026, all reading the same test line. I cannot listen to audio in this session, so these are candidates for you to A/B, not a ranked pick. The ElevenLabs renders are the closest preview of what ElevenLabs itself will give you.

Test line:
> Recovery thirty-one… and it's red. Good morning! Got the late-night flight. Give me a yes and I'll get my work started. Only three of the eleven things on last night's to-do list matter. The rest, I can handle. Last set. I believe in you. Mostly.

**Listen to these first** (the cute direction, matches the plush):

| File | Preset | Engine | Why |
|---|---|---|---|
| `08-archie-seed-pitchup5.mp3` | Archie | Seed Audio, pitch +5, speed +10 | Highest and quickest |
| `07-benji-seed-pitchup4.mp3` | Benji | Seed Audio, pitch +4, speed +8 | Pitched up, a little rounder |
| `09-cody-seed-pitchup3.mp3` | Cody | Seed Audio, pitch +3, speed +6 | Gentlest lift |
| `10-pixie-elevenlabs.mp3` | Pixie | ElevenLabs | Soft high register. Female preset, but the closest ElevenLabs reference for "fluffy" |

**Baseline adult reads** (made before the mascot arrived, probably too grown-up now):

| File | Preset | Engine |
|---|---|---|
| `01-grady-elevenlabs.mp3` | Grady | ElevenLabs |
| `02-holden-elevenlabs.mp3` | Holden | ElevenLabs |
| `03-archie-elevenlabs.mp3` | Archie | ElevenLabs |
| `04-benji-elevenlabs.mp3` | Benji | ElevenLabs |
| `05-dylan-elevenlabs.mp3` | Dylan | ElevenLabs |
| `06-jasper-elevenlabs.mp3` | Jasper | ElevenLabs |
| `11-evan-elevenlabs.mp3` | Evan | ElevenLabs |

One render (Cody via ElevenLabs) failed on the provider side and was not retried.

## Build it in ElevenLabs v4

Eleven v4 is the current flagship. It follows audio tags such as [whispers], [laughs], [sighs] more reliably than v3, supports Voice Design with attributes like age, accent, pacing and tone, and can clone from about 10 seconds of audio. Voice Design previews support audio tags, so the whisper beat can be tested before committing.

**Step 1 — Voice Design prompt (Voices → Voice Design, model Eleven v4):**

> A small, cute, fluffy plush creature that works as a hyper-efficient personal assistant. High, light, airy boyish voice, soft and slightly breathy with a warm rounded tone, clearly not a child and not a cartoon squeak. Neutral Indian-English accent, crisp consonants, fast confident pacing. Cheerful and bright, with a playful deadpan when delivering one-word answers. Not robotic. Studio-clean, close-mic, no reverb.

Generate 3 previews with the test line above. Pick the one where "Already did." lands flat and funny and "Good morning!" sounds like it is smiling.

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

1. Pick the pitch and energy from 08 / 07 / 09 / 10 (or say "higher" / "lower" / "softer").
2. Confirm the accent: neutral Indian-English (recommended, matches the Hindi cook beat) or light international English.
3. Then I render the full Draft 3 line set in the chosen voice.
