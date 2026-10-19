# Seedance 2.5 vs Kling 4.0: test prompts

Ground rules for every test:

- Paste the same prompt word for word into both models.
- Use the same reference images in both.
- Set both to 9:16 with the same duration.
- Turn the prompt enhancer off in both.
- Only use a seed if both models support one.
- Generate once per model and use the first result. Rerolling until one wins skews the comparison.
- If you do reroll, do it the same number of times on both and note it.

Workflow: make the character and location images first (any image model), then reuse those exact files as references in both video models.

---

## Test 1: Multi-shot, extreme realism

**Tests:** whether the face and outfit stay the same across cuts, whether each cut lands where the prompt says, and how real the skin, light and handheld camera feel.

### 1A: Character reference (image, 3:4)

```
Photorealistic character reference of a 34-year-old South Asian man, lean build, short black hair with a slight wave, two-day stubble, a thin scar through his left eyebrow, tired dark-brown eyes. He wears a faded olive field jacket over a charcoal crew-neck tee, a worn leather watch on his left wrist. Front-facing, neutral expression, shoulders up, plain mid-grey studio backdrop, soft overcast key light, natural skin texture with pores and slight under-eye shadows, no retouching. Shot on 85mm, f/2.8, sharp focus on the eyes.
```

### 1B: Location reference (image, 9:16)

```
Photorealistic empty location plate: a narrow night-market alley in Bangkok just after rain. Wet asphalt reflecting red and amber paper lanterns, steam rising from a closed noodle stall on the left, tangled overhead cables, a flickering green neon pharmacy sign at the far end, puddles with ripples. No people. Shot on 35mm at eye level, shallow depth of field, cinematic teal-and-amber grade, fine film grain.
```

### 1C: Video (references: 1A + 1B, 12 s, audio off)

```
Cinematic multi-shot sequence, extreme photorealism, the man from the reference in the alley from the reference. Keep his face, scar, jacket and watch identical in every shot.

Shot 1 (0–4s): Wide shot from the end of the alley. He walks toward camera through the steam, hands in jacket pockets, lantern light sliding across his face. Slow handheld push-in.

Shot 2 (4–8s): Hard cut to a close-up of his face in profile. He stops, glances over his shoulder, breath visible in the cold air, raindrops falling from the lantern above him. Shallow focus, background neon bokeh.

Shot 3 (8–12s): Hard cut to an over-the-shoulder shot from behind him. He pulls a folded paper note from his pocket and opens it; the green neon sign flickers out. Camera holds still.

Natural motion, real-world physics, realistic skin and fabric, no slow motion, no text, no music video look.
```

---

## Test 2: Animated scene

**Tests:** whether the animation style holds for the whole clip, whether the character acts with clear intent, and how well the camera move and lighting are staged.

### 2A: Character reference (image, 3:4)

```
3D animated feature-film character design: a small 10-year-old girl inventor with a messy copper bob, oversized brass flying goggles pushed up on her forehead, freckles, big expressive green eyes, a yellow raincoat covered in patches and tools, red rubber boots. Full body, standing, three-quarter view, confident grin. Stylised proportions, soft subsurface skin, clean neutral pastel backdrop. Stylized 3D animation look, soft global illumination.
```

### 2B: Location reference (image, 9:16)

```
3D animated feature-film environment: a floating rooftop workshop on a cloud-top town at golden hour. Crooked chimneys, hanging lanterns, a half-built wooden glider with canvas wings in the centre, scattered gears and blueprints, a windsock, fluffy stylised clouds below and a warm orange sky. No characters. Stylised shapes, rich saturated colour, soft volumetric light.
```

### 2C: Video (references: 2A + 2B, 10 s, audio off)

```
3D animated feature-film scene, keep the exact style of the references. The girl from the reference stands in the rooftop workshop from the reference.

She pulls her goggles down over her eyes, gives a determined nod, runs across the roof and leaps into the wooden glider. The glider tips off the edge, dips toward the clouds, then catches the wind and swoops upward. Blueprints and loose papers swirl in the air behind her.

Camera: starts in a low-angle close-up on her face, pulls back to a wide shot as she runs, then follows the glider in a sweeping arc over the clouds. Golden hour light and expressive animation timing with squash and stretch. No live-action elements, no text.
```

---

## Test 3: UGC

**Tests:** whether the clip passes as real phone footage, plus lip-sync, hand–product interaction and the creator's delivery.

> Turn audio **on** for both models in this test. Generated speech is part of what UGC tests. If one model can't do native audio, note it on the slide and don't fake it.

### 3A: Creator reference (image, 9:16)

```
Candid iPhone front-camera selfie of a 26-year-old Latina woman, curly dark hair in a loose claw clip, minimal makeup, small gold hoops, oversized cream knit sweater. Sitting cross-legged on her bed in a small sunlit apartment bedroom, fairy lights and a cluttered nightstand behind her. Natural window light, slight lens distortion, real skin texture, unedited social-media look.
```

### 3B: Product reference (image, 1:1)

```
Product photo of a matte sage-green insulated tumbler with a bamboo lid and a short metal straw, small embossed leaf logo, on a plain white surface, soft daylight, realistic.
```

### 3C: Video (references: 3A + 3B, 10 s, audio ON)

```
Vertical UGC video, filmed on an iPhone front camera held at arm's length, slight natural hand shake. The woman from the reference sits on her bed and holds the green tumbler from the reference up to the camera.

She says, casual and excited, talking straight into the lens: "Okay, I've had this thing for three weeks and my coffee is still hot by lunch. Like… actually hot." She taps the bamboo lid, takes a sip through the straw, then laughs and shrugs at the camera.

Accurate lip-sync, natural pauses and facial expressions, realistic hand gripping the tumbler, autofocus breathing slightly. Real phone footage look: no cinematic grading, no studio lighting, no captions, no music.
```

---

## Test 4: First frame (image-to-video)

**Tests:** whether the model keeps the first frame exactly (same face, colours and composition) and what motion it adds from there.

### 4A: First frame (image, 9:16)

```
Photorealistic cinematic still: a middle-aged Japanese chef with a white headband and a grey linen apron stands behind a steel counter in a dim, narrow restaurant kitchen, holding a carbon-steel wok over a high flame, a pile of fresh vegetables and a small bowl of sauce on the counter. Warm tungsten practicals, steam in the air, deep shadows, shot on 35mm at chest height, shallow depth of field, film grain.
```

### 4B: Video (first frame: 4A, 8 s, audio off)

```
Starting exactly from the provided first frame. The chef pours the sauce into the wok; a tall burst of flame erupts and lights up his face, then dies down as he tosses the vegetables in two quick flips. Steam and smoke curl up past the hanging lamp. Slow push-in toward the wok. Keep his face, clothing, kitchen layout and lighting identical to the first frame. Realistic fire, liquid and food physics, no cuts, no text.
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
