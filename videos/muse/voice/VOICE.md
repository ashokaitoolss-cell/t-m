# Muse — voice

Direction from today: **cute and fluffy**. Small character, big competence. The comedy is a soft, bright, slightly breathy voice delivering ruthless efficiency ("Already did.") with total calm.

## Target voice (the spec)

| Trait | Target |
|---|---|
| Pitch | Light tenor, sits higher than a normal adult male voice but never a child or a chipmunk |
| Texture | Soft, a little breathy and rounded. Warm, not nasal. No gravel, no rasp |
| Energy | Quick and bouncy on the good-morning lines, drops to a near-whisper for "Chatbots." and the 11:02 PM bedtime beat |
| Pace | Brisk. Muse is always slightly ahead of Ashok. Clipped one-word replies ("Ordered." "Already did.") land dry, no upward lilt |
| Accent | Neutral Indian-English or a light international English. Must say "daal" and the cook's Hindi naturally. Avoid a heavy American read |
| Age read | Ageless, twenties-to-thirties |
| Anti-reference | Not a robotic assistant voice, not Siri or Alexa, not a cartoon mascot squeak |

## Auditions in `auditions/`

Rendered through Higgsfield on Oct 1 2026, all reading the same test line. I cannot listen to audio in this session, so these are candidates for you to A/B, not a ranked pick. The engine column matters: ElevenLabs renders are the closest preview of what you will get inside ElevenLabs itself.

Test line:
> Recovery thirty-one… and it's red. Good morning! Got the late-night flight. Give me a yes and I'll get my work started. Only three of the eleven things on last night's to-do list matter. The rest, I can handle. Last set. I believe in you. Mostly.

| File | Preset | Engine | Why it is here |
|---|---|---|---|
| `01-grady-elevenlabs.mp3` | Grady | ElevenLabs | Baseline competent-PA read |
| `02-holden-elevenlabs.mp3` | Holden | ElevenLabs | Baseline, warmer |
| `03-archie-elevenlabs.mp3` | Archie | ElevenLabs | Younger, lighter |
| `04-benji-elevenlabs.mp3` | Benji | ElevenLabs | Younger, lighter |
| `05-dylan-elevenlabs.mp3` | Dylan | ElevenLabs | Shortest, fastest read |
| `06-jasper-elevenlabs.mp3` | Jasper | ElevenLabs | Baseline |
| `07-benji-seed-pitchup4.mp3` | Benji | Seed Audio, pitch +4, speed +8 | **Cute direction:** pitched up and quicker |
| `08-archie-seed-pitchup5.mp3` | Archie | Seed Audio, pitch +5, speed +10 | **Cute direction:** highest, quickest |
| `09-cody-seed-pitchup3.mp3` | Cody | Seed Audio, pitch +3, speed +6 | **Cute direction:** gentler lift |
| `10-pixie-elevenlabs.mp3` | Pixie | ElevenLabs | Soft, high register, for reference on "fluffy" even though the preset is female |
| `11-evan-elevenlabs.mp3` | Evan | ElevenLabs | Lighter male |

One render (Cody via ElevenLabs) failed on the provider side and was not retried.

Listen to 07, 08 and 09 first. If one of those is the right pitch and energy, the ElevenLabs v4 Voice Design prompt below is how to make a proper owned voice at that pitch instead of a pitch-shifted preset.

## Build it in ElevenLabs v4

Eleven v4 is the current flagship. It follows audio tags such as [whispers], [laughs], [sighs] more reliably than v3, supports Voice Design with attributes like age, accent, pacing and tone, and can clone from about 10 seconds of audio. Voice Design previews support audio tags, so you can test the whisper beat before committing.

**Step 1 — Voice Design prompt (paste into Voices → Voice Design, model Eleven v4):**

> A small, cute, fluffy-sounding male assistant. Light tenor, higher than an average man but clearly an adult, soft and slightly breathy with a warm rounded tone. Neutral Indian-English accent, crisp consonants, fast confident pacing. Cheerful and bright, with a playful deadpan when delivering one-word answers. Not robotic, not a child, not a cartoon squeak. Studio-clean, close-mic, no reverb.

Generate 3 previews with the test line above. Pick the one where "Already did." lands flat and funny.

**Step 2 — Settings for the final generations (Eleven v4):**

| Setting | Value | Why |
|---|---|---|
| Stability | 40–50 | Enough variation for the playful lines, not so loose it drifts between takes |
| Similarity | 75–80 | Keep the designed timbre |
| Style exaggeration | 20–30 | A little bounce. Higher starts to sound like a mascot |
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

**Step 4 — If a preset audition wins instead:** clone it. Render 20–30 s of clean lines with the winning Higgsfield preset, upload to ElevenLabs Instant Voice Clone on v4 (10 s minimum), then apply the same settings and tags. Check the preset's licence allows that use before you do.

## Decision needed from you

1. Pick the pitch and energy from auditions 07 / 08 / 09 (or say "lower" / "higher").
2. Confirm the accent: neutral Indian-English (recommended, matches the Hindi cook beat) or light international English.
3. Then I generate the full Draft 3 line set in the chosen voice.
