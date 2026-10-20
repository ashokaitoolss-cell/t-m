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
Photorealistic empty location plate: a gentle grassy hillside above a calm valley lake at evening golden hour. A narrow dirt footpath winds up through waist-high wild grass and scattered yellow wildflowers toward an old weathered wooden fence near the crest. Below, the lake is still and mirror-like, with soft forested hills on the far shore. The sky is clear and peaceful, pale blue fading to warm peach near the horizon, with a few thin high clouds catching the light. The sun is low, just above the far hills, backlighting the grass so every seed head glows. No people. Shot on 35mm at eye level, natural colour, gentle haze in the valley, fine film grain.
```

### 1C: Video (references: @Image1 = 1A sheet, @Image2 = 1B, 12 s, audio off)

```
Create a 12-second vertical 9:16 live-action film in three shots joined by two hard cuts, at 4 seconds and 8 seconds. Use @Image1 as the only character and @Image2 as the only location. The result should feel like real footage on a calm evening at golden hour: true skin in warm sunlight, true fabric weight, grass and air that move with the breeze, real-time speed.

THE WORLD
Build the hillside from @Image2 as a complete physical space. A narrow dirt footpath winds up through waist-high wild grass and scattered yellow wildflowers to an old wooden fence near the crest. Below lies a still valley lake with forested hills on the far shore. The sky is clear and peaceful: pale blue overhead, fading to warm peach at the horizon, with a few thin high clouds lit gold. The sun sits low above the far hills. It backlights the grass so every seed head glows, and it throws long soft shadows down the slope toward camera. A light, steady breeze moves through the grass in slow visible waves. A faint haze hangs over the valley.

IDENTIFY AND PRESERVE THE CHARACTER
The man is the person in @Image1. Take his face from the close-up panel: a lean South Asian face in his mid-thirties, short black hair with a slight wave, two-day stubble, a thin pale scar crossing his left eyebrow, dark-brown eyes. Take his clothes from the front and back panels: a faded olive field jacket worn open, a charcoal crew-neck tee, a worn leather watch on his left wrist, dark-grey cargo trousers, scuffed brown leather boots. These stay identical in all three shots. Ignore the sheet layout and grey backdrop; only the man and his clothes come from @Image1.

0–4 SECONDS — UP THROUGH THE GRASS
Open on a wide shot from higher up the path, looking down the slope with the lake and the low sun behind him. The man walks up the path toward camera, framed slightly left of centre, in near-silhouette with a bright golden rim of light around his hair, shoulders and jacket edges.
His walk has real weight on the slope: he leans slightly forward, each step lands flat and pushes off, his knees bend a little more on the incline, and the open jacket swings with the stride, its hem lagging a fraction behind his body. His right hand trails out to the side and brushes the tops of the grass; the stems bend under his fingers, then spring back and sway after he passes. Small dust motes lift from the path at each footfall and drift sideways in the sunbeams.
The breeze sends slow waves across the grass around him. Seed heads glow where the sun shines through them, and his long shadow stretches up the path ahead of him.
The camera is handheld and eases backward with him at walking pace, with small organic drift rather than shake. Out-of-focus grass stems in the near foreground pass through the bottom of frame.

HARD CUT

4–8 SECONDS — FACE IN THE SUN
Cut to a close-up of his face in three-quarter profile, facing right, with the low sun just behind his head and to the left. Soft lens flare blooms at the left edge of frame; the far hills and lake melt into warm bokeh.
He stops at the crest and turns his face toward the sun. His eyes narrow slightly against the light, and the fine skin around them gathers into small creases. He takes a slow, deep breath: his nostrils flare, his chest and shoulders rise and settle, and his jaw relaxes on the exhale.
Skin is fully real in this warm light: visible pores across the nose and cheek, individual stubble hairs lit gold along the jaw, fine peach fuzz glowing on the cheekbone and the rim of the ear, the ear's edge glowing warm red-orange where the sun shines through it, slight natural redness at the nose tip, and a light natural sheen on the forehead. The scar is a slightly raised pale line that interrupts the eyebrow hairs. The breeze lifts a few loose strands of his hair, which catch the light and settle. His eyes are wet and reflective, with the sun as a small bright catchlight. He blinks once, naturally.
The camera is locked off with very shallow depth of field, focused on his eye and the scar.

HARD CUT

8–12 SECONDS — AT THE FENCE
Cut to an over-the-shoulder view from behind his right shoulder. The back of the olive jacket fills the left third of frame, with the lake, the far hills and the low sun beyond him.
He rests his forearms on the old wooden fence. The weathered rail takes his weight, and his jacket sleeves bunch and crease at the elbows. He unscrews the cap of a small steel thermos, pours hot tea into the cap and holds it in both hands. The tea pours as a thin, steady stream that splashes slightly as it fills the cup; steam rises from the cup and is caught and lit gold by the backlight, then drifts sideways with the breeze. His watch catches a glint of sun as he lifts the cup.
At around 10 seconds, a small flock of birds crosses the sky far above the lake from right to left, wings beating unevenly. Their reflections move across the still water below.
The camera stays perfectly still, with focus on his hands and the steaming cup. End on him holding the cup at the fence, looking out over the lake, as the sun touches the far hills.

SKIN, PHYSICS AND MOTION
Everything moves at real-time speed with real mass. His body moves as one connected system: breathing lifts the chest and shoulders, the slope changes how he walks, and leaning on the fence moves weight into his forearms. Grass, hair, steam and fabric all react to the same steady breeze from the left, at the same strength in every shot. Sunlight stays warm and directional, with real backlight, rim light, translucency through the ear and grass, and gentle bounce light from the ground filling the shadow side of his face. His skin stays textured and imperfect in every shot, never smoothed, waxy or airbrushed.

CAMERA, STYLE AND CONTINUITY
Hyper-realistic live-action cinema with a 35mm anamorphic feel, natural film grain, soft highlight roll-off and a natural warm golden-hour grade. All light comes from the low evening sun and the open sky; there is no artificial light. The sun's direction stays consistent across the cuts, low and behind him. Exactly three shots, with clean hard cuts at 4 and 8 seconds. His identity, wardrobe and watch are identical in every shot.
No slow motion, music-video gloss, beauty filter, plastic skin, overexposed or blown-out faces, face morphing, extra fingers, extra people, text, subtitles, logos, dissolves or crash zooms.
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
Create a 10-second vertical 9:16 3D animated feature-film scene in three continuous beats with no cuts. The camera moves in one connected path from her face, across the rooftop, and out into the sky. Use @Image1 as the only character and @Image2 as the only location. The whole clip stays in high-end stylised 3D animation; nothing turns photoreal.

THE WORLD
Build the rooftop workshop from @Image2 as a complete 3D set floating above a sea of soft clouds at golden hour. The roof tiles have real thickness and slight unevenness. Crooked chimneys and hanging lanterns sit around its edges. The half-built wooden glider sits near the edge of the roof: a wooden frame with canvas wings stretched over ribs. Blueprints, loose papers and small gears are scattered on the tiles. A warm low sun sits behind the scene, throwing long soft shadows and rim-lighting every edge.

IDENTIFY AND PRESERVE THE CHARACTER
The girl is the character in @Image1. Take her face from the close-up panel: a ten-year-old girl with a messy copper bob, freckles across her nose and cheeks, and big expressive green eyes. Take her outfit from the front and back panels: oversized brass flying goggles, a yellow raincoat covered in patches and small tools, and red rubber boots. Her proportions, colours and design stay on-model in every frame. Ignore the sheet layout.

0–3 SECONDS — GOGGLES DOWN
Begin on a low-angle close-up of her face against the golden sky. She reaches up with both hands and pulls the goggles down over her eyes. First comes a small anticipation as she grips the strap; then the goggles snap down, and the strap stretches and settles against her hair. Her copper bob bounces with the movement and settles with a slight overlap.
She takes a breath (her shoulders rise and fall), then gives one firm nod. Her cheeks squash slightly at the bottom of the nod and spring back.
The camera slowly pulls back and down, keeping her centred, until her whole upper body and the roof behind her are visible.

3–6 SECONDS — THE RUN AND THE LEAP
Without a cut, the camera swings to the side and tracks alongside her at waist height as she sprints toward the glider. Her run has clear weight and timing. Her boots strike the tiles and leave small scuff marks. The coat tails flap behind her with a fraction of a second's delay, the tools on her coat jiggle, and her arms pump.
At the roof edge she crouches (a squash), then springs (a stretch) and lands in the glider's seat. The whole glider dips under her weight, its wooden frame flexing and its canvas wings rippling.
The glider tips forward off the edge. Her takeoff kicks up blueprints and loose papers, which lift off the roof and swirl behind her in a spiral, tumbling and catching the light.

6–10 SECONDS — CATCH THE WIND
The camera rises off the roof and swings into a wide arc around the glider. The glider drops toward the clouds and gains speed, its nose pointing down and its wingtips flexing upward under the load. It skims the top of a cloud and kicks up a soft wake of cloud vapour, then catches the wind and swoops upward in a smooth curve. Its wings bend and recover as the air takes the weight.
She throws one arm up in triumph. Her coat ripples in the wind, and her hair streams back from under the goggle strap.
The camera finishes its arc slightly above and behind the glider. End on the glider climbing toward the low sun, the rooftop town small in the distance.

ANIMATION, PHYSICS AND MOTION
Every action follows clear animation principles: anticipation before each big move, squash and stretch, overlapping action on her hair, coat and goggle strap, and follow-through after every stop. The glider has believable aerodynamics and weight. It dips when she lands, sinks before it lifts, and banks into its turns. Paper, cloth and cloud vapour react to wind and movement; nothing floats without a cause.

CAMERA, STYLE AND CONTINUITY
Use one continuous camera path with no cuts: close-up, pull-back, tracking run, then the rising aerial arc. Keep the stylised 3D feature-film look throughout, with soft subsurface skin, painterly volumetric golden light, rich saturated colour and gentle rim light. Lighting direction stays consistent, with the sun low and behind.
No style shifts, photoreal elements, extra characters, text, logos, cuts or dissolves, and no character drifting off-model.
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
Create a 10-second vertical 9:16 UGC video, filmed as one continuous take on an iPhone front camera held at arm's length. Use @Image1 as the only person, @Image2 as the room and @Image3 as the product. It must be indistinguishable from real phone footage someone posted from their bedroom.

THE ROOM
The bedroom is the one in @Image2. An unmade bed has cream linen and a knitted throw. Warm fairy lights hang on the wall above it, and a cluttered wooden nightstand with books, a candle and a plant sits to one side. Soft afternoon window light comes from the left.

IDENTIFY AND PRESERVE THE CREATOR AND PRODUCT
The woman is the person in @Image1. Take her face from the close-up panel: mid-twenties, curly dark hair in a loose claw clip with a few curls falling free around her face, minimal makeup and small gold hoop earrings. She wears the oversized cream knit sweater from the front panel.
She sits cross-legged on the bed, framed from mid-chest up, slightly left of centre, at arm's length from the lens. Her left arm reaches toward the camera and holds the phone, which is never visible. Her right hand holds the tumbler from @Image3: matte sage green, with a bamboo lid, a short metal straw and an embossed leaf logo. The tumbler keeps exactly that shape, colour and logo.

0–2 SECONDS — PRODUCT INTO FRAME
She lifts the tumbler into frame beside her face, with the logo turned toward the lens. Her fingers wrap around it naturally: four fingers in front, thumb behind, and the fingertips pressing lightly into its matte surface. The phone's autofocus briefly hunts between her face and the tumbler, then locks onto the tumbler.

2–7 SECONDS — THE LINE
She looks straight into the lens and says, casual and excited, in a natural American accent:
"Okay, I've had this thing for three weeks and my coffee is still hot by lunch. Like… actually hot."
The speech is physically real. Her lips form each sound: they close fully on the "m" and "b" sounds, and her teeth and tongue are visible on "th" and "l". Her jaw moves with the syllables. She leaves a short natural pause before "Like…", and her eyebrows lift and her eyes widen slightly on "actually hot". Her head bobs a little with the rhythm of the sentence, and the loose curls move with it.

7–9 SECONDS — TAP AND SIP
She taps the bamboo lid twice with her index finger; the fingertip compresses slightly on each tap. She brings the straw to her lips and takes a sip: her lips close around the metal, her cheeks hollow slightly, her throat moves once as she swallows, and she lowers the tumbler.

9–10 SECONDS — THE SHRUG
She laughs. The laugh reaches her eyes and the skin at their corners creases, her shoulders rise in a small shrug, and the knit sweater shifts with them.

SKIN, PHYSICS AND MOTION
Her skin is real and unretouched: visible pores, fine peach fuzz catching the window light along her jaw, slight shine on the nose and forehead, natural colour variation and small imperfections. Her eyes are wet and reflective, with the window and the fairy lights as catchlights, and she blinks at a natural rate. The knit sweater has real thickness: it stretches at the elbow when she lifts her arm and bunches at the wrist. Her hand and the tumbler behave as two separate solid objects; nothing merges. Because her arm holds the phone, the frame sways slightly as she talks and moves.

AUDIO
Her voice is close to the phone mic with slight bedroom room tone. Two soft hollow taps on the bamboo, a quiet sip, and faint ambient room sound. No music.

CAMERA, STYLE AND CONTINUITY
This is real iPhone front-camera footage, shot handheld at arm's length in one take: slight wide-angle distortion, mild compression, and auto-exposure that adjusts a little when the tumbler enters frame. No cinematic grading or studio lighting. Her identity, outfit and the tumbler stay exactly as referenced throughout.
No cuts, captions, subtitles, music, extra people, plastic skin, warped fingers or extra fingers, product shape drift, or lip-sync drift.
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
Create an 8-second vertical 9:16 image-to-video shot, using @Image1 as the exact first frame. It is one continuous shot with a slow push-in toward the wok, in which the frozen moment in the image comes alive with real fire, liquid and food physics.

IDENTIFY AND PRESERVE THE SCENE
Begin on the exact supplied image and hold it for about half a second before anything moves. The chef is the man in @Image1. He is middle-aged, with a white headband and a grey linen apron, and stands behind the steel counter at chest height in frame. His right hand holds the carbon-steel wok's handle over a high blue-orange flame. A pile of fresh vegetables and a small bowl of dark sauce sit on the counter in front of him. The dim, narrow kitchen, the warm tungsten practicals, the hanging lamp, the steam and the deep shadows all stay exactly as in the image. His face, clothing, the kitchen layout and the lighting must not be re-imagined; they only move.

0–2 SECONDS — THE POUR
He picks up the sauce bowl with his left hand and pours it into the hot wok in one smooth motion. The sauce is viscous: it leaves the rim as a thick glossy ribbon and narrows as it falls. Where it hits the hot metal, it spits and bubbles instantly, and the first wisp of steam shoots up.

2–4 SECONDS — THE FLARE
A tall burst of orange-yellow flame erupts from the wok, licking up past the rim, rolling and twisting as it rises, with a translucent blue core at its base. The flame lights his face, the steel counter and the underside of the hanging lamp with flickering warm light that moves with it. Heat shimmer distorts the air above the wok. Within a second and a half the flame collapses back down to the base of the pan.

4–7 SECONDS — TWO FLIPS
He tosses the vegetables with two quick flips. Each flip starts in his shoulder, travels through his forearm and ends in a sharp wrist snap; the tendons stand out along his forearm under the skin. The vegetables lift in a coherent arc, tumble with real mass (heavier pieces lower, lighter leaves higher) and land back in the pan; a few drops of glistening oil fly off the rim. The wok has real weight, and the handle dips slightly in his grip at the top of each toss.

7–8 SECONDS — THE SETTLE
Thick steam and a little smoke curl up past the hanging lamp, catching its light and thinning as they rise. He glances down into the wok, satisfied, his brow relaxing.

SKIN, PHYSICS AND MOTION
His skin is real at every distance: pores, fine creases at the eyes and forehead, and a light sheen of sweat on his brow and upper lip that catches the firelight. His eyes reflect the flame. The linen apron creases and moves with his torso. Fire, oil, steam and food obey real physics and real-time speed, and his body moves as one connected system.

CAMERA, STYLE AND CONTINUITY
One continuous shot. The camera starts at the exact framing of @Image1 and pushes slowly and steadily toward the wok from chest height, with natural shallow depth of field. Focus stays on the wok and his hands, and his face stays readable. Hyper-realistic live-action cinema matching @Image1: warm tungsten practicals, deep shadows, 35mm film grain.
No cuts, slow motion, re-framing, re-imagined face or kitchen, extra people, warped hands, floating food, fake-looking fire or text.
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
