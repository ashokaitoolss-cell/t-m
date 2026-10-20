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
Photorealistic empty location plate: a sweeping right-hand hairpin on a narrow mountain pass at evening golden hour, seen from the inside of the bend at road level, from the mountain side, looking across the road toward the valley. In the foreground, the rough rock face and a strip of gravel shoulder on the inside of the bend. Across the smooth dark asphalt, with its faded white centre line, a low weathered stone wall runs along the outside of the bend. Beyond the wall, a deep green valley drops away to layered blue ridgelines. The low sun hangs just above the far ridges, directly behind the road, backlighting the scene and raking long shadows across the asphalt toward camera. Uphill to the right, the road climbs toward a crest with a small stone viewpoint. Clear, calm sky, gold at the horizon fading to soft blue. No people, no vehicles. Shot on 35mm, natural colour, light valley haze, fine film grain.
```

### 1D: Video (references: @Image1 = 1A sheet, @Image2 = 1B bike, @Image3 = 1C, 15 s, audio off)

```
Create a 15-second vertical 9:16 live-action film in five shots joined by hard cuts at 3, 6, 9 and 12 seconds. Use @Image1 as the only rider, @Image2 as the only motorcycle and @Image3 as the only location.

THE STORY
A rider is racing the sunset. The sun is about to drop behind the far ridges, and he wants to reach the viewpoint at the top of the pass before it does. One hairpin stands between him and the crest. He attacks it like he has ridden it a hundred times: late on the brakes, body off the bike, footpeg scraping, front wheel lifting on the way out. He makes it over the crest just as the last sliver of sun disappears. This is a film about style, skill and intent. Every movement he makes is decisive, precise and confident. Nothing is casual, hesitant or slow.

THE 180-DEGREE RULE (APPLIES TO EVERY SHOT)
The line of action is the rider's direction of travel through the bend. Every camera stays on the same side of that line: the inside of the bend, the mountain side of the road, looking out across the road toward the valley.
Because of this, in every single shot:
- the rider travels from screen left to screen right
- he leans toward camera through the corner
- the stone wall, the valley and the low sun are always behind him
No shot ever crosses to the valley side of the road, and no shot ever shows him moving right to left.

THE WORLD
The road from @Image3 is a narrow mountain pass. It has a sweeping right-hand hairpin with rough rock and a gravel shoulder on the inside, and a low weathered stone wall on the outside. Beyond the wall, a deep green valley falls away to layered blue ridgelines. The sun is a hand's width above the far ridges, directly behind the road from the camera's side, and sinking. It backlights everything with hot gold light and throws long shadows across the asphalt toward camera. Uphill to screen right, the road climbs to a crest with a small stone viewpoint.

IDENTIFY AND PRESERVE THE RIDER AND BIKE
The rider is the man in @Image1. Take his face from the close-up panel: a lean South Asian man in his mid-thirties with short black wavy hair, dark-brown eyes, thick eyebrows, a thin pale scar through his left eyebrow and two-day stubble. Take his clothes from the front and back panels: the worn tan leather jacket with dark armour and a small orange chest stripe, half-zipped over a charcoal tee, black gloves, dark-grey riding jeans and black ankle boots. He rides without a helmet; the wind moves his hair in every shot.
The motorcycle is the one in @Image2: a café racer with a matte olive-green tank and thin cream pinstripe, black frame, brown leather seat, round headlight, brushed-steel exhaust on the right side (the side facing camera) and black spoked wheels.
Rider and bike are identical in every shot. Ignore the sheet layout and grey backdrops.

0–3 SECONDS — THE DEADLINE (TRACKING, ROAD LEVEL, ALONGSIDE)
A low tracking camera runs alongside the bike at the same speed on the mountain side of the road. It frames rider and bike in profile, moving left to right, with the valley and the sinking sun beyond the stone wall.
He is tucked low on the straight before the bend. He lifts his eyes and glances at the sun as it nears the ridgeline; his jaw sets. He twists the throttle hard with his right hand, the gloved wrist rolling down sharply. The bike surges: the rear squats, the front goes light, the exhaust facing camera shimmers with heat, and the wind flattens his hair back and presses his jacket against his chest.
The camera keeps pace, then falls slightly behind as the bike pulls away toward screen right and the bend.

HARD CUT

3–6 SECONDS — LATE ON THE BRAKES (HIGH ANGLE, INSIDE OF THE BEND)
Cut to a high angle above the rock face on the inside of the bend, looking down across the hairpin toward the valley. The bike rushes in from screen left, much faster than looks safe.
At the last possible moment he brakes hard. The front fork dives, the rear wheel goes light and twitches, and the bike's nose drops. In the same motion he shifts his body off the seat toward the inside of the bend (toward camera), pushes his right knee out wide and drops his head and shoulders low and inside.
The bike tips into the lean in one decisive motion. The camera holds steady, with just a slight tilt down to follow him into the bend.

HARD CUT

6–9 SECONDS — THE SCRAPE (LOW ANGLE, APEX, ROAD LEVEL)
Cut to a camera on the asphalt at the apex, on the inside line, looking across the road with the stone wall and the blazing sun behind. The bike sweeps through from screen left at a deep lean, around 40 degrees, leaning toward camera, so that his knee and the right footpeg come within a hand's width of the lens.
The footpeg kisses the asphalt and throws a short spray of orange sparks that tumble toward camera. His right knee hovers just above the road. The tyre deforms against the asphalt and holds its line; fine gravel skitters from under it toward the lens. The sun blazes directly behind him, a bright rim of light runs along his hair, shoulders and the curve of the tank, and a soft lens flare spills across the frame.
The camera pans with him to screen right. He passes close and fast, and the motion blur on the spokes is consistent with real wheel speed.

HARD CUT

9–12 SECONDS — EYES ON THE EXIT (CLOSE-UP, TANK-MOUNTED)
Cut to a camera rigidly mounted low on the tank, looking back up at his face. He is still deep in the lean through the second half of the bend. The horizon behind him is tilted, the rock face blurs past on screen left, and the valley and sun are on screen right.
His eyes are locked on the exit of the bend, not on the road in front of him. He is completely focused, then the corner of his mouth lifts into a small, sure half-smile: he knows he has nailed it.
His skin is fully real at this distance: visible pores on his nose and cheekbones, individual stubble hairs lit gold along the jaw, a light sheen of sweat at the hairline, and wet, reflective eyes with the sun as a bright catchlight. His hair whips in the wind. The jacket leather ripples at the shoulder and creases at the elbow, and his gloved hands grip the bars with the leather tight across the knuckles. A fine constant vibration runs through the mount.
At around 11.5 seconds he starts to pull the bike upright, and the horizon begins to level.

HARD CUT

12–15 SECONDS — THE LAST LIGHT (WIDE PROFILE, EXIT TO CREST)
Cut to a wide profile on the mountain side of the road at the exit of the hairpin, looking across toward the valley, with the crest and viewpoint at screen right. The bike snaps upright out of the bend, still moving left to right.
He opens the throttle fully. The rear squats and the front wheel lifts a few inches off the asphalt for half a second, then sets down cleanly. He tucks in and charges up the last stretch to the crest.
As he reaches the top, the sun slips behind the far ridgeline. The last sliver of gold flares across the lens, then is gone, leaving the sky glowing and his silhouette sharp against it at the viewpoint.
The camera pans with him to screen right at a steady speed. The valley and ridges slide behind in parallax. Dust lifted by the bike hangs glowing in the last light and slowly settles. End on his silhouette at the crest against the afterglow.

SKIN, PHYSICS AND MOTION
Everything happens in real time with real speed and mass; there is no slow motion. The bike moves like a real 200 kg machine. It dives hard under braking, snaps into the lean, holds a precise line through the apex, squats and lifts the front wheel under full throttle, and sets down with a small compression of the fork. The rider's body leads the bike: his weight moves to the inside before the bike tips, and his eyes look ahead to the exit before the bike turns.
Every movement is sharp and committed. There are no floaty, hesitant or lazy motions. Tyres stay in contact with the road, and wheel spin matches road speed. Sparks, gravel, dust, hair and leather all react physically. Skin, leather and steel stay textured and real; nothing is smoothed or waxy.

CAMERA, STYLE AND CONTINUITY
High-end live-action motorsport cinema with a 35mm anamorphic look, natural film grain, soft highlight roll-off and a warm golden-hour grade. Every camera move is purposeful: tracking alongside, holding high and steady, sitting at road level, mounted on the bike, then panning wide.
Continuity:
- every camera stays on the mountain side of the road
- the rider always moves left to right
- the sun always sits behind the road over the valley, sinking a little in each shot until it sets in the final one
- each cut lands on the action at the moment it happens
Rider, clothes, hair and bike are identical in every shot.
No crossing the 180-degree line, mirrored or flipped shots, right-to-left movement, slow motion, speed ramps, crash zooms, dissolves, lazy or floaty riding, extra vehicles, extra people, floating or sliding wheels, warped spokes, morphing faces, plastic skin, text, subtitles or logos.
```

---


## Test 2: Animated story (stop-motion claymation)

**Tests:** whether the model holds a hand-made stop-motion look (clay texture, fingerprints, choppy frame rate, a real miniature set), plus comic timing, character acting, and story across five shots.

**The story:** a baby clay dragon wants to catch a glowing firefly circling the kitchen lamp. It fails twice, comically. Then a sugar sneeze accidentally turns into its first flight.

### 2A: Character sheet (image, 21:9)

```
Stop-motion claymation character reference sheet, three panels side by side on one wide canvas, the same character in every panel, no text, no labels, no captions, no watermarks.

Panel 1 (left, about 40% of the width): tight close-up of the face of a baby dragon sculpted from plasticine clay, filling the frame, looking straight into the lens with a hopeful expression. A rounded mint-green head with a short snout and two tiny nostrils, big glossy black bead eyes with a white highlight, small soft orange horn nubs, a cream-coloured belly and chin, rosy cheeks. Visible fingerprints, tiny tool marks and slight smudges in the clay surface. Warm practical lamp light from the side, dark warm background, macro lens, shallow depth of field.

Panel 2 (middle): full-body front view, standing on its hind legs, arms at its sides. Chubby pear-shaped body about the size of a teacup, stubby legs with three rounded toes, small arms, a short curled tail. Two small bat-like wings in pale orange clay with thin darker veins, slightly too small for its body. Plain warm-grey studio backdrop, soft even lighting.

Panel 3 (right): full-body back view, same pose and backdrop, showing the wings folded on its back, a row of tiny orange spine bumps down its back, and the curled tail.

Handmade plasticine stop-motion look, consistent colours and proportions across the panels, clean thin gaps between panels.
```

### 2B: Location reference (image, 9:16)

```
Stop-motion claymation miniature set: a cosy old kitchen at night, built at tabletop scale from clay, wood, card and fabric. A worn wooden kitchen table fills the lower half of frame, with a checked red-and-cream cloth at its far end, a small open sugar bowl, a teacup and a few crumbs. Above the table, on the right, a warm brass pendant lamp hangs on a cord and casts a cone of golden light. Behind, a window shows a dark blue night with a felt moon. Shelves with tiny jars line the back wall. No characters. Handmade textures everywhere: visible wood grain, felt and fabric weave, clay fingerprints. Warm practical lighting with deep cosy shadows. Macro lens, shallow depth of field.
```

### 2C: Video (references: @Image1 = 2A sheet, @Image2 = 2B, 15 s, audio off)

```
Create a 15-second vertical 9:16 stop-motion claymation short film in five shots joined by hard cuts at 3, 6, 9 and 12 seconds. Use @Image1 as the only character and @Image2 as the only set. It must look and move like real handmade stop-motion animation shot frame by frame on a miniature set: plasticine characters, a physical tabletop set, real macro lenses and practical lights. Nothing looks like smooth CG.

THE STORY
A tiny clay dragon has never flown. Tonight, a glowing firefly is circling the kitchen lamp above the table, and the dragon wants to reach it more than anything. It jumps and flops. It flaps and crash-lands into the sugar bowl. Covered in sugar, it sneezes, and the sneeze bursts out as a puff of fire that blasts it into the air. For the first time, it is flying. It loops the lamp and ends up nose to nose with the firefly, which lands gently on its snout. The film is about determination, comic failure and a joyful surprise. Every action has clear intention and big, readable emotion: hope, frustration, grit, shock, joy.

THE 180-DEGREE RULE (APPLIES TO EVERY SHOT)
The line of action runs along the long edge of the table, from the dragon to the lamp. Every camera stays on the near side of the table, the side facing the viewer.
In every shot:
- the dragon is on the left and the lamp and firefly are on the right
- every jump and flight moves from screen left toward screen right
- the window and shelves are always in the background
No shot crosses to the far side of the table.

IDENTIFY AND PRESERVE THE CHARACTER AND SET
The dragon is the character in @Image1. It has a mint-green clay body, a cream belly and chin, big glossy black bead eyes, small orange horn nubs, rosy cheeks, pale-orange bat wings that are slightly too small, tiny orange spine bumps and a curled tail. It stays on-model in every shot, with visible fingerprints and tool marks on its clay.
The set is @Image2:
- the worn wooden table with a checked cloth at the far end, the sugar bowl and the teacup
- the brass pendant lamp hanging on the right, casting a warm cone of light
- the night window with a felt moon, and the shelves of tiny jars behind
The firefly is a tiny clay beetle with a soft glowing yellow-green tail, and it circles slowly inside the lamp's cone of light.

0–3 SECONDS — THE WISH (MEDIUM, EYE LEVEL WITH THE DRAGON)
The camera is at table height on the near side. The dragon stands on the table at screen left, looking up and to the right at the firefly circling the lamp.
Its eyes go wide, and its pupils follow the firefly's loops. It clasps its little hands together. Its tail curls tighter with longing. It takes a big determined breath, so its belly swells and its cheeks puff, and it narrows its eyes at the target.

HARD CUT

3–6 SECONDS — FAIL ONE (WIDE, TABLE LEVEL)
Cut to a wide view along the table, with the dragon on the left and the lamp high on the right. The dragon crouches, wiggles its bottom and leaps up and to the right toward the light, with its tiny wings flapping frantically.
It rises only a few centimetres, hangs there for one frozen comic beat, then drops flat on its belly on the table with a SPLAT squash. Its body flattens and spreads, then springs back into shape. It peels its face off the wood, and a fingerprint smudge is left on its cheek.

HARD CUT

6–9 SECONDS — FAIL TWO, THE SUGAR BOWL (MEDIUM, SLIGHTLY HIGHER)
Cut to a slightly higher angle on the middle of the table. The sugar bowl is just to the right of the dragon, and the lamp is above on the right.
The dragon backs up for a run-up, then sprints left to right with its little feet pattering and flaps as hard as it can. This time it lifts off, wobbles, and veers straight into the sugar bowl. It tumbles inside, and a shower of sugar grains bursts up and rains down around it. It pops its head out of the bowl coated in white sugar: dazed, its eyes crossed, its wings drooping.
Then it shakes itself off and climbs out with grim determination, its brow furrowed and its fists clenched.

HARD CUT

9–12 SECONDS — THE SNEEZE (CLOSE-UP ON THE FACE)
Cut to a close-up of the dragon's sugar-dusted face, facing right toward the lamp.
Sugar tickles its nose. Its nostrils twitch, its eyes squeeze shut, its head tilts back: "ah… ah…" Then it sneezes with a huge head snap. A puff of stylised clay-and-cotton fire, orange and yellow and shaped like a little cloud, bursts out of its nose. The recoil blasts the dragon backward and upward and out of the top of the frame. The fire puff hangs for a beat and dissolves into wisps of cotton smoke.

HARD CUT

12–15 SECONDS — FIRST FLIGHT (WIDE, LOW ANGLE LOOKING UP AT THE LAMP)
Cut to a low angle from table level, looking up at the lamp on the right with the night window behind. The dragon shoots up into frame from screen left, carried by the momentum of the sneeze.
Its eyes open in shock, and it realises it is flying. Its wings start beating properly at last, strong and even. A delighted grin spreads across its face. It swoops left to right in a full loop around the lamp cord, its tail streaming behind, and comes to a hover nose to nose with the firefly in the cone of light.
The firefly circles once and settles gently on the tip of its snout. The dragon goes cross-eyed looking at it, then giggles, its cheeks glowing rosy. The firefly's soft yellow-green light glows on its face. End on that warm, still moment.

STOP-MOTION CRAFT, PHYSICS AND MOTION
The film is animated on twos at a choppy 12 frames per second, like real stop-motion. Every frame is a slightly different physical pose. The clay surface boils subtly between frames: fingerprints shift, highlights flicker, tiny smudges appear.
Squash and stretch is exaggerated and readable: it flattens on landing, stretches on take-off, and its cheeks puff when it breathes. Every action has a clear anticipation and follow-through. The wings flap with visible effort, and the tail and belly jiggle and overlap after each stop.
The set has real miniature physics: sugar grains are tiny physical beads that bounce and scatter, and the fire and smoke are handmade from cotton, cellophane and clay. The lamp light is a real practical bulb, creating warm hotspots and soft falloff.
The emotions are big and clear: hope, frustration, grit, shock, joy.

CAMERA, STYLE AND CONTINUITY
Classic handmade claymation look, shot on a real macro lens with shallow depth of field and tiny-scale bokeh, warm practical tungsten light, cosy deep shadows and a gentle film grain.
Continuity:
- every camera stays on the near side of the table
- the dragon starts on the left and every move goes left to right toward the lamp on the right
- each cut picks up exactly where the last shot ended
- the dragon's design, the sugar on its face after the sugar bowl and the set stay consistent
No smooth CG motion, plastic or glossy rendering, live-action elements, crossing the 180-degree line, mirrored shots, extra characters, text, subtitles, logos or dissolves.
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
