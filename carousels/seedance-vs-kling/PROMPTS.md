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

## Test 1: Multi-angle realism (mountain hairpin)

**Tests:** whether one continuous action stays coherent across four camera angles: the same rider, the same bike, the same direction of travel and the same sun at every cut. It also tests the physics of the lean and how real the skin, light and speed feel.

**Cinematography rules baked into the prompt:**
- **One action, no time jumps:** each shot picks up exactly where the last one ended (cutting on the action).
- **Same screen direction:** the bike always travels left to right, and the camera never crosses to the other side of the action.
- **Fixed light:** the sun stays low on screen left in every angle.
- **Shot order:** wide, low, close, wide.

### 1A: Rider character sheet (image, 21:9)

```
Character reference sheet, three panels side by side on one wide canvas, the same man in every panel, no text, no labels, no captions, no watermarks.

Panel 1 (left, about 40% of the width): tight close-up portrait of his face filling the frame, face slightly turned, looking straight into the lens. A 34-year-old South Asian man, lean face with defined cheekbones, short black hair with a slight wave, pushed back and a little windswept, dark-brown eyes, thick dark eyebrows, a thin pale scar through his left eyebrow, two-day stubble. Warm low-key side light, dark background, 35mm film look, visible pores and fine skin texture, natural under-eye shadows, no retouching.

Panel 2 (middle): full-body front view, standing straight, arms relaxed at his sides, framed from the chin down to the boots. Worn tan leather motorcycle jacket with dark armour panels at the shoulders and elbows, a small orange stripe across the chest, zipped halfway over a charcoal crew-neck tee, black leather riding gloves, dark-grey riding jeans, black ankle riding boots. Plain mid-grey seamless studio backdrop, flat even lighting, catalogue-style.

Panel 3 (right): full-body back view, same outfit and pose, same framing and grey backdrop, showing the back of his head and hair, the jacket's back protector panel and the boots.

Photorealistic, consistent outfit, hair and proportions across the panels, clean thin gaps between panels.
```

### 1B: Motorcycle reference (image, 16:9)

```
Photorealistic side-profile product shot of a modern café-racer motorcycle facing right: matte olive-green fuel tank with a thin cream pinstripe, black frame, short brown leather seat, round headlight, brushed-steel exhaust running along the right side, black spoked wheels with road tyres, low clip-on handlebars. Clean, slightly used, no logos or text. Plain mid-grey studio backdrop, soft even light, sharp detail.
```

### 1C: Location reference (image, 9:16)

```
Photorealistic empty location plate: a tight hairpin bend on a narrow mountain road at evening golden hour. Smooth dark asphalt with a faded white centre line, a low weathered stone wall on the outside of the bend, scattered small gravel at the edge of the road. Beyond the wall, a deep green valley falls away to layered blue ridgelines and a winding river far below. The sky is clear and calm, warm gold near the horizon fading to soft blue, with a few thin high clouds. The low sun sits just above the far ridges, raking long shadows across the road. No people, no vehicles. Shot on 35mm, natural colour, light haze in the valley, fine film grain.
```

### 1D: Video (references: @Image1 = 1A sheet, @Image2 = 1B bike, @Image3 = 1C, 12 s, audio off)

```
Create a 12-second vertical 9:16 live-action film of one continuous moment: a motorcyclist leaning through a mountain hairpin at golden hour, covered from four camera angles joined by hard cuts at 3, 6 and 9 seconds. Use @Image1 as the only rider, @Image2 as the only motorcycle and @Image3 as the only location.
The four angles must cut together like professional film coverage of one real take. Each shot continues the action exactly where the previous shot ended, with no time skipped and no action repeated. The bike always travels from screen left to screen right. The camera never crosses to the other side of the action. The low sun stays on screen left, ahead of the rider, in every angle.

THE WORLD
Build the road from @Image3 as one complete physical place. The hairpin bends tightly to the right. The smooth dark asphalt has a faded white centre line and loose gravel scattered along its edge. A low weathered stone wall runs along the outside of the bend, and beyond it a deep green valley drops away to layered blue ridgelines and a thin silver river. The sky is clear and calm: gold at the horizon, soft blue above, with a few thin high clouds lit warm. The sun is low above the far ridges, raking long hard-edged shadows across the road. A light haze softens the valley.

IDENTIFY AND PRESERVE THE RIDER AND BIKE
The rider is the man in @Image1. Take his face from the close-up panel: a lean South Asian man in his mid-thirties with dark-brown eyes, thick dark eyebrows, a thin pale scar through his left eyebrow and two-day stubble. Take his gear from the front and back panels: a gloss-black full-face helmet with the clear visor flipped up, a worn tan leather jacket with dark armour panels and a small orange chest stripe, black gloves, dark-grey riding jeans and black ankle boots.
The motorcycle is the one in @Image2: a café racer with a matte olive-green tank and thin cream pinstripe, black frame, brown leather seat, round headlight, brushed-steel exhaust on the right side and black spoked wheels.
Rider and bike stay identical in every shot. Ignore the sheet layout and the grey backdrops.

0–3 SECONDS — THE APPROACH (DRONE, HIGH WIDE)
Open high above and slightly behind the bike, looking down the road toward the hairpin, the valley opening up on the right of frame. The bike is small in the lower left third, travelling left to right along the road toward the bend, its long shadow stretching behind it.
At about 2 seconds the rider sits up slightly and brakes: the front fork compresses, the bike's nose dips, and its speed visibly drops.
The drone glides forward and descends slowly, following at a constant distance. End the shot just as the bike reaches the entry of the bend and begins to tip right.

HARD CUT

3–6 SECONDS — THE LEAN (LOW ANGLE, ROAD LEVEL)
Cut to a low camera at road level on the inside of the bend, near the centre line. The bike enters frame from the left already tipping into the lean, continuing the exact motion from the end of shot 1, and sweeps through the frame toward the right.
The lean is physically real: the bike and rider tip together to about 35 degrees, and the rider's inside knee drops out toward the asphalt. The front tyre deforms slightly where it meets the road, and the suspension loads up under the cornering force. Fine gravel at the road's edge skitters away from the rear tyre. The rear tyre leaves the faintest dust trail lit gold by the low sun behind it.
The sun sits low on screen left, just behind the bike, producing a soft lens flare and a bright rim of light along the tank, the rider's helmet and his jacket shoulders. The asphalt texture is crisp in the foreground and falls away into shallow depth of field.
The camera pans right to follow the bike, staying at road level. End as the bike reaches the apex of the turn, at maximum lean.

HARD CUT

6–9 SECONDS — THE FACE AT THE APEX (CLOSE-UP, MOUNTED)
Cut to a camera rigidly mounted on the front of the bike, low on the tank, looking back up at the rider. He is still at maximum lean through the apex, so the horizon behind him is tilted.
His visor is up. His eyes are fixed ahead through the turn, narrowed slightly against the wind and the sun, and he blinks once. Sunlight slides across the gloss helmet shell as the bike rotates through the bend, and a moving reflection of the sky and ridges travels across it.
His skin is fully real at this distance: visible pores on his nose and cheekbones, individual stubble hairs lit gold at the edge of the helmet opening, a light sheen of sweat on his brow, and his eyes wet and reflective with the sun as a small bright catchlight. The wind presses the leather jacket against his shoulders and ripples the loose fabric at his upper arm. His gloved hands grip the bars, and the leather creases at the knuckles.
Vibration from the engine and road passes through the mount as a fine, constant micro-shake. Behind him, the valley streams past in motion blur while he stays sharp.
At about 8.5 seconds he begins to pull the bike upright, and the horizon starts to level. End as the horizon is almost level.

HARD CUT

9–12 SECONDS — THE EXIT (WIDE SIDE PROFILE)
Cut to a wide side-profile view from across the road at the exit of the bend, the stone wall and the drop to the valley behind the road. The bike comes out of the bend from screen left, completing the stand-up from shot 3, then levels fully upright and accelerates toward screen right.
The rear suspension squats under acceleration, and the rider tucks slightly forward toward the tank. The exhaust's brushed steel catches a bright glint of sun. A thin haze of dust lifted from the road edge hangs in the sunbeams behind the bike and slowly settles.
The camera pans smoothly right with the bike at a steady speed, keeping it slightly left of centre, the valley and far ridges sliding behind it in parallax. End on the bike leaving frame right, the dust still settling and the sun touching the far ridges.

SKIN, PHYSICS AND MOTION
Everything happens in real time with real mass and real speed; there is no slow motion. The bike behaves like a real 200 kg machine: it dips under braking, rolls into the lean, holds a constant line through the apex and squats on acceleration. Rider and bike move as one system, with his body weight shifting into the turn before the bike follows. Tyres stay in contact with the road and the wheels spin at a speed that matches the road speed. Wind, dust and gravel react to the bike's passage. His skin, the leather and the helmet stay textured and real in every shot; nothing is smoothed or waxy.

CAMERA, STYLE AND CONTINUITY
Hyper-realistic live-action cinema shot on one camera system: 35mm anamorphic look, natural film grain, soft highlight roll-off and a warm natural golden-hour grade. The only light is the low evening sun and the open sky, with no artificial light.
Continuity across all four cuts:
- the bike always travels left to right
- the sun always sits low on screen left
- each cut matches the action at the moment it happens
- rider, helmet, jacket, gloves and bike are identical
- the road, wall, valley and time of day are identical
Four shots in this order: high wide, low, close, wide.
No slow motion, speed ramps, crash zooms, dissolves, sudden time-of-day changes, extra vehicles, extra people, floating or sliding wheels, warped spokes, morphing faces, plastic skin, text, subtitles or logos.
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
