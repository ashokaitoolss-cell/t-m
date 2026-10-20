# Seedance 2.5 vs Kling 4.0: test prompts

Ground rules for every test:

- Paste the same prompt word for word into both models.
- Use the same reference images in both.
- Set both to 9:16 with the same duration.
- Turn the prompt enhancer off in both.
- Only use a seed if both models support one.
- Generate once per model and use the first result. Rerolling until one wins skews the comparison.
- If you do reroll, do it the same number of times on both and note it.

Reference tags: the video prompts use Seedance's `@Image1 / @Image2 / @Image3` tags, numbered in the order you upload the images. In Kling 4.0, keep the prompt text identical and only swap each tag for however Kling labels its reference slots (attach the images in the same order).

Workflow: make the character sheets and location images first (any image model), then reuse those exact files as references in both video models. Each character sheet is one wide image with three panels: a face close-up, a full-body front view and a full-body back view.
The "no text, no labels" line matters: image models like to invent garbled catalogue text on sheets like this, and that text can leak into the video.

---

## Test 1: Multi-shot, extreme realism

**Tests:** whether the face and outfit stay the same across cuts, whether each cut lands where the prompt says, and how real the skin, light and handheld camera feel.

### 1A: Character sheet (image, 21:9)

```
Character reference sheet, three panels side by side on one wide canvas, the same man in every panel, no text, no labels, no captions, no watermarks.

Panel 1 (left, about 40% of the width): tight close-up portrait filling the frame, face slightly turned, looking straight into the lens. A 34-year-old South Asian man, lean face, short black hair with a slight wave, two-day stubble, a thin scar through his left eyebrow, tired dark-brown eyes. Dark moody background, warm low-key side light, 35mm film look, visible pores and fine skin texture, no retouching.

Panel 2 (middle): full-body front view, standing straight, arms relaxed at his sides, framed from the chin down to the shoes. Faded olive field jacket worn open over a charcoal crew-neck tee, a worn leather watch on his left wrist, dark-grey straight-leg cargo trousers, scuffed brown leather boots. Plain mid-grey seamless studio backdrop, flat even lighting, catalogue-style.

Panel 3 (right): full-body back view, same outfit and pose, same framing and grey backdrop, showing the back of the jacket and boots.

Photorealistic, consistent outfit and proportions across the panels, clean thin gaps between panels.
```

### 1B: Location reference (image, 9:16)

```
Photorealistic empty location plate: a narrow night-market alley in Bangkok just after rain. Wet asphalt reflecting red and amber paper lanterns, steam rising from a closed noodle stall on the left, tangled overhead cables, a flickering green neon pharmacy sign at the far end, puddles with ripples. No people. Shot on 35mm at eye level, shallow depth of field, cinematic teal-and-amber grade, fine film grain.
```

### 1C: Video (references: @Image1 = 1A sheet, @Image2 = 1B, 12 s, audio off)

```
[REFERENCES]
@Image1 is the character: use his face, scar, hair, stubble, field jacket, tee, watch, trousers and boots exactly as shown. The close-up panel defines his face; the front and back panels define his outfit. Ignore the sheet layout and its grey backdrop.
@Image2 is the location: the rain-soaked Bangkok night-market alley. Keep its lanterns, closed noodle stall on the left, overhead cables and green neon pharmacy sign at the far end.

[STYLE]
Hyper-realistic live-action cinema, 35mm anamorphic look, shallow depth of field, natural film grain, teal-and-amber night grade, practical light only (paper lanterns, neon, wet reflections). Real skin with pores and stubble, fabric with weight, water that behaves like water. No beauty filter, no slow motion, no music-video gloss.

[SUBJECT LOCK]
One man only, the man from @Image1, in every shot. Same face, same scar through the left eyebrow, same olive jacket worn open, same leather watch on the left wrist. No other people in the alley. Lighting direction stays consistent: lanterns above and to his right, green neon behind him.

[SHOT 1 | 0–4s | WIDE, HANDHELD PUSH-IN]
Frame: low eye-level wide from the far end of the alley, the man small in the centre of frame, lanterns lining both sides, steam drifting from the closed noodle stall on the left.
Action: he walks toward camera at an unhurried pace, hands in his jacket pockets, boots splashing through shallow puddles; red and amber lantern light slides across his face as he passes under each lantern.
Camera: slow handheld push-in, subtle natural shake, focus pulling with him.
Detail: puddle ripples and reflections break as his boots land; steam bends around his shoulders.

[HARD CUT]

[SHOT 2 | 4–8s | CLOSE-UP, PROFILE]
Frame: tight close-up of his face in left profile, filling the right two-thirds of frame; green neon bokeh behind him on the left.
Action: he stops walking, holds still for a beat, then turns his head to glance back over his shoulder; breath fogs in the cold air; a single raindrop falls from the lantern above and lands on his cheek.
Camera: locked off, very shallow focus on his eye and scar, background melting into bokeh.
Detail: micro-movements in the jaw and eyes, wet hair strands catching light, no plastic skin.

[HARD CUT]

[SHOT 3 | 8–12s | OVER-THE-SHOULDER, STATIC]
Frame: over his right shoulder from behind, the back of the olive jacket filling the left third of frame, the alley stretching away with the green neon sign at the far end.
Action: he pulls a small folded paper note from his jacket pocket, unfolds it with both hands, and reads it; at second 11 the green neon sign flickers twice and goes dark, leaving only lantern light.
Camera: static, no movement, focus on the note in his hands.
Last frame: his silhouette holding the open note, the far end of the alley now dark.

[CONSTRAINTS]
Exactly three shots with clean hard cuts at 4s and 8s. Identity, wardrobe and watch identical across all shots. Real-world physics and real-time speed. No text, no subtitles, no logos, no extra characters, no morphing faces or hands, no camera-shake blur on the faces.
```

---

## Test 2: Animated scene

**Tests:** whether the animation style holds for the whole clip, whether the character acts with clear intent, and how well the camera move and lighting are staged.

### 2A: Character sheet (image, 21:9)

```
Character reference sheet for a 3D animated feature film, three panels side by side on one wide canvas, the same girl in every panel, no text, no labels, no captions, no watermarks.

Panel 1 (left, about 40% of the width): tight close-up of her face filling the frame, looking into the camera with a confident grin. A 10-year-old girl inventor, messy copper bob, oversized brass flying goggles pushed up on her forehead, freckles, big expressive green eyes. Warm soft key light, dark teal background.

Panel 2 (middle): full-body front view, standing straight, arms relaxed at her sides. Yellow raincoat covered in patches and small tools, red rubber boots, goggles on her forehead. Plain light-grey studio backdrop, flat even lighting.

Panel 3 (right): full-body back view, same outfit and pose, same grey backdrop, showing the back of the raincoat with its patches and the goggle strap.

Stylised 3D animation look, soft subsurface skin, soft global illumination, consistent proportions and colours across the panels, clean thin gaps between panels.
```

### 2B: Location reference (image, 9:16)

```
3D animated feature-film environment: a floating rooftop workshop on a cloud-top town at golden hour. Crooked chimneys, hanging lanterns, a half-built wooden glider with canvas wings in the centre, scattered gears and blueprints, a windsock, fluffy stylised clouds below and a warm orange sky. No characters. Stylised shapes, rich saturated colour, soft volumetric light.
```

### 2C: Video (references: @Image1 = 2A sheet, @Image2 = 2B, 10 s, audio off)

```
[REFERENCES]
@Image1 is the character: the girl inventor. Use her face, copper bob, freckles, green eyes, brass goggles, patched yellow raincoat and red rubber boots exactly as shown. The close-up panel defines her face; the front and back panels define her outfit. Ignore the sheet layout and backdrop.
@Image2 is the location: the floating rooftop workshop above the clouds at golden hour, with the half-built wooden glider in the centre.

[STYLE]
High-end 3D animated feature film. Stylised proportions, soft subsurface skin, painterly volumetric golden-hour light, rich saturated colour, gentle rim light. Expressive animation with clear anticipation, squash and stretch, and follow-through on her hair, coat tails and goggle strap. The whole clip stays in this style; nothing photoreal.

[SUBJECT LOCK]
One character only, the girl from @Image1. Same face, outfit and proportions throughout. The glider matches @Image2: wooden frame, canvas wings.

[BEAT 1 | 0–3s | LOW-ANGLE CLOSE-UP]
Frame: low-angle close-up of her face, sky and lanterns behind her.
Action: she pulls the brass goggles down over her eyes with both hands, takes a breath, and gives one determined nod; her copper hair bounces with the motion.
Camera: slow pull-back that keeps her centred.

[BEAT 2 | 3–6s | WIDE, TRACKING]
Frame: wide shot of the rooftop, the glider at the edge in the centre-right.
Action: she sprints across the roof, boots slapping the tiles, coat tails flapping, and leaps into the glider's seat; the glider tips forward off the edge; blueprints and loose papers lift off the roof and swirl behind her.
Camera: tracks alongside her at waist height, then rises as the glider drops.

[BEAT 3 | 6–10s | SWEEPING AERIAL ARC]
Frame: the glider small against a huge golden sky, clouds below.
Action: the glider dips toward the clouds, skims their surface, catches the wind and swoops upward; she throws one arm up in triumph.
Camera: continuous sweeping arc around the glider, ending slightly above and behind it.
Last frame: the glider climbing toward the sun, the rooftop town small in the background.

[CONSTRAINTS]
One continuous camera move per beat, no hard cuts. The character stays on-model and the art style never shifts. No text, no logos, no live-action elements, no extra characters.
```

---

## Test 3: UGC

**Tests:** whether the clip passes as real phone footage, plus lip-sync, hand–product interaction and the creator's delivery.

> Turn audio **on** for both models in this test. Generated speech is part of what UGC tests. If one model can't do native audio, note it on the slide and don't fake it.

### 3A: Creator character sheet (image, 21:9)

```
Character reference sheet, three panels side by side on one wide canvas, the same woman in every panel, no text, no labels, no captions, no watermarks.

Panel 1 (left, about 40% of the width): candid close-up of her face filling the frame, as if taken on an iPhone front camera, soft smile, looking into the lens. A 26-year-old Latina woman, curly dark hair in a loose claw clip, minimal makeup, small gold hoop earrings. Natural window light, warm background with blurred fairy lights, real skin texture, unedited.

Panel 2 (middle): full-body front view, standing straight, arms relaxed at her sides. Oversized cream knit sweater, light-wash straight-leg jeans, white socks, no shoes. Plain mid-grey seamless studio backdrop, flat even lighting, catalogue-style.

Panel 3 (right): full-body back view, same outfit and pose, same grey backdrop, showing the claw clip and the back of the sweater.

Photorealistic, consistent outfit and proportions across the panels, clean thin gaps between panels.
```

### 3A-2: Bedroom location (image, 9:16)

```
Photorealistic empty location plate: a small sunlit apartment bedroom, unmade bed with cream linen and a knitted throw, warm fairy lights on the wall above it, a cluttered wooden nightstand with books, a candle and a plant, afternoon window light from the left. No people. Shot on an iPhone at seated eye level, natural colours, unedited social-media look.
```

### 3B: Product reference (image, 1:1)

```
Product photo of a matte sage-green insulated tumbler with a bamboo lid and a short metal straw, small embossed leaf logo, on a plain white surface, soft daylight, realistic.
```

### 3C: Video (references: @Image1 = 3A sheet, @Image2 = 3A-2 bedroom, @Image3 = 3B product, 10 s, audio ON)

```
[REFERENCES]
@Image1 is the creator: use her face, curly hair in a claw clip, gold hoops and cream knit sweater exactly as shown. The close-up panel defines her face. Ignore the sheet layout and grey backdrop.
@Image2 is the setting: her sunlit bedroom with fairy lights and the cluttered nightstand.
@Image3 is the product: the matte sage-green tumbler with bamboo lid, short metal straw and embossed leaf logo. Keep its shape, colour and logo exactly.

[STYLE]
Real vertical UGC footage shot on an iPhone front camera. Natural window light, slight wide-angle lens distortion, mild compression, auto-exposure and autofocus behaving like a real phone. No cinematic grade, no studio lighting, no captions, no music.

[SUBJECT LOCK]
One person only, the woman from @Image1, sitting cross-legged on the bed from @Image2, framed from mid-chest up, centred, at arm's length. She holds the tumbler from @Image3 in her right hand. The phone is in her left hand (the camera itself, never visible).

[PERFORMANCE | 0–10s, ONE CONTINUOUS TAKE]
0–2s: she lifts the tumbler into frame beside her face, logo toward camera; the autofocus briefly hunts and then locks onto the tumbler.
2–7s: she looks straight into the lens and says, casual and excited, in a natural American accent:
"Okay, I've had this thing for three weeks and my coffee is still hot by lunch. Like… actually hot."
Accurate lip-sync, a small pause before "Like…", eyebrows raised on "actually hot".
7–9s: she taps the bamboo lid twice with one finger, then takes a sip through the metal straw.
9–10s: she laughs and gives a little shrug at the camera.
Camera: handheld at arm's length with slight natural sway, no zoom, no cuts.

[AUDIO]
Her voice close to the phone mic with slight room echo; two soft taps on bamboo; a faint sip; quiet bedroom ambience. No music.

[CONSTRAINTS]
One take, no cuts. The tumbler keeps its shape and logo and never merges with her hand. Five fingers on each hand. No on-screen text, no subtitles, no extra people.
```

---

## Test 4: First frame (image-to-video)

**Tests:** whether the model keeps the first frame exactly (same face, colours and composition) and what motion it adds from there.

### 4A: First frame (image, 9:16)

```
Photorealistic cinematic still: a middle-aged Japanese chef with a white headband and a grey linen apron stands behind a steel counter in a dim, narrow restaurant kitchen, holding a carbon-steel wok over a high flame, a pile of fresh vegetables and a small bowl of sauce on the counter. Warm tungsten practicals, steam in the air, deep shadows, shot on 35mm at chest height, shallow depth of field, film grain.
```

### 4B: Video (first frame: @Image1 = 4A, 8 s, audio off)

```
[FIRST FRAME]
@Image1 is the exact first frame. Frame 0 must match it pixel for pixel: the chef's face, white headband and grey linen apron, the steel counter, the wok, the vegetables, the sauce bowl, the lighting and the composition. Animate from it; do not re-imagine it.

[STYLE]
Hyper-realistic live-action cinema, matching @Image1: warm tungsten practicals, deep shadows, steam in the air, 35mm film grain, shallow depth of field.

[ACTION | 0–8s, ONE CONTINUOUS SHOT]
0–2s: the chef picks up the small sauce bowl with his left hand and pours the dark sauce into the hot wok in one smooth motion.
2–4s: a tall burst of orange flame erupts from the wok, lighting up his face and the steel counter, then settles down.
4–7s: he tosses the vegetables with two quick flips of the wok; the vegetables arc up and land back in the pan; oil spits.
7–8s: steam and smoke curl up past the hanging lamp; he glances down into the wok, satisfied.
Camera: slow, steady push-in toward the wok from chest height; no cuts.

[CONSTRAINTS]
His face, clothing, kitchen layout and lighting stay identical to @Image1. Realistic fire, liquid, oil and food physics with real weight and timing. Hands keep five fingers and a natural grip on the wok handle. No text, no cuts, no extra people, no slow motion.
```

---

## What to capture for the carousel

For each test, save:

1. The best still from each clip, taken at the **same timestamp** in both (for the result slide).
2. The original image references or first frame (one can sit on the result slide's caption line).
3. Three short notes per model while watching:
   - **Motion realism:** weight, physics, any jitter or morphing.
   - **Visual quality:** detail, artifacts, how faces and hands hold up.
   - **Prompt following:** which instructions landed and which got dropped (e.g. "missed the neon flicker").
