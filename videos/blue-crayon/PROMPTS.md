# Blue Crayon — location prompts

Copy-paste prompts for the six location backgrounds in `assets/locations/`. Each prompt is three parts in the same order:
the scene, then the **Style** block, then the **Lens** block. The two blocks are identical in every prompt, so all the
backgrounds match. To make a new place, write a new scene part in the same shape (place and camera, what's there, light,
palette, mood, focal point, foreground element) and add the two blocks.

## How to use them

- **GPT Image 2.5, Nano Banana Pro, Seedream.** Attach the user's references listed under each scene (in
  `assets/locations/refs/`) as image references, and paste the prompt. The references hold the brushwork and colour; the
  prompt holds the scene. To keep the *same place* in a second version (the morning doorstep, the empty bedroom), attach
  the first plate and ask for an edit, as noted.
- **Midjourney.** Paste the prompt and add the Midjourney ending below. Upload `kitchen_night.jpg` and `market_morning.jpg`
  and pass them with `--sref`.
- **After generating,** run `scripts/lens_pass.py` at the default strength over the final frames so the edge falloff matches
  across shots.

## The shared blocks

**Style**

```
Hand-painted digital background painting for an animated feature film, in a visual-development colour-key style. Painted with a broad flat brush in hard-edged planes of colour, like gouache over oil: simplified, chunky shapes; slightly wonky, hand-drawn perspective; visible dry-brush drag marks; broken stroke edges; small impasto dabs on the highlights; subtle canvas grain. Imperfect and lived-in: chipped paint, scuffs, water stains, uneven bricks, peeling plaster, worn floorboards; nothing clean or new. One strong motivated light source; deep shadow shapes with lost edges; warm light against cool blue-violet and teal shadows; muted, slightly desaturated colour with one or two saturated accents.
```

**Lens**

```
Cinematic lens: crisp, detailed brushwork only around the focal point; toward the edges and corners the painting becomes loose, soft and blurred, with broad strokes and less detail, like a shallow depth of field; the foreground element is a large out-of-focus shape cutting into the frame; the corners fall off into shadow; a faint red and blue colour fringe at the very edges of the frame; slight atmospheric haze in depth. Widescreen 16:9 frame with no black bars. No people, no characters, no text, no logos.
```

**Avoid** (as a negative prompt, or `--no` in Midjourney)

```
photorealistic, 3D render, CGI, glossy, plastic, smooth airbrushed gradients, clean vector, outlines, cel shading, anime, oversharpened, HDR, people, text, watermark
```

**Midjourney ending**

```
--ar 16:9 --style raw --s 200 --sref <kitchen_night URL> <market_morning URL> --no people, text, 3d render, photorealistic, outlines, anime
```

## The six scenes

### 1. Doorstep, night rain

Shots 01–03, 10, 14–16. References: market_morning.jpg + kitchen_night.jpg.

```
Exterior, night, pouring rain. The front stoop of an old red-brick New York tenement, seen from across the street with a low, slightly angled camera. Five worn stone steps with black iron railings lead up to a dark green wooden front door with a small square window and a pale stone surround. Two dented galvanised trash bins stand at the foot of the steps, black iron fire escapes zigzag up the facade, and a single street lamp on the left throws a cold white cone of light full of rain streaks. The wet street mirrors the lamp in long, broken reflections. The building is dark, with no lit windows. Palette: blue-black night, ultramarine and teal shadows, dull brick red, a bottle-green door and cold white lamp highlights; no warm light anywhere. Mood: cold, shut out. Focal point: the green door and the steps. Foreground element: the wet red bodywork of a parked car cutting into the bottom-left corner, with soft bokeh from the rain highlights. Hand-painted digital background painting for an animated feature film, in a visual-development colour-key style. Painted with a broad flat brush in hard-edged planes of colour, like gouache over oil: simplified, chunky shapes; slightly wonky, hand-drawn perspective; visible dry-brush drag marks; broken stroke edges; small impasto dabs on the highlights; subtle canvas grain. Imperfect and lived-in: chipped paint, scuffs, water stains, uneven bricks, peeling plaster, worn floorboards; nothing clean or new. One strong motivated light source; deep shadow shapes with lost edges; warm light against cool blue-violet and teal shadows; muted, slightly desaturated colour with one or two saturated accents. Cinematic lens: crisp, detailed brushwork only around the focal point; toward the edges and corners the painting becomes loose, soft and blurred, with broad strokes and less detail, like a shallow depth of field; the foreground element is a large out-of-focus shape cutting into the frame; the corners fall off into shadow; a faint red and blue colour fringe at the very edges of the frame; slight atmospheric haze in depth. Widescreen 16:9 frame with no black bars. No people, no characters, no text, no logos.
```

### 2. Doorstep, morning

Shots 04–05. References: plate 1 + market_morning.jpg.

```
Exterior, early morning, clear sky. The same red-brick tenement stoop from across the street, with a low camera: stone steps with black iron railings, a dark green door with a small square window, two galvanised trash bins, black fire escapes, and an unlit iron street lamp on the left. A low golden sun rakes across the facade from the left, throwing long, hard, cool-blue shadows of the fire escapes onto warm orange brick. A clear cobalt sky sits at the top left, the dry pavement catches warm bounce light, and the far end of the street dissolves into pale golden haze. Palette: sunlit orange-red brick, golden ochre highlights, cobalt and blue-violet shadows, a bottle-green door. Mood: warm, hopeful, a new beginning. Focal point: the green door and the steps. Foreground element: a parked red car catching the sunlight, out of focus in the bottom-left corner, with warm bokeh glints. Hand-painted digital background painting for an animated feature film, in a visual-development colour-key style. Painted with a broad flat brush in hard-edged planes of colour, like gouache over oil: simplified, chunky shapes; slightly wonky, hand-drawn perspective; visible dry-brush drag marks; broken stroke edges; small impasto dabs on the highlights; subtle canvas grain. Imperfect and lived-in: chipped paint, scuffs, water stains, uneven bricks, peeling plaster, worn floorboards; nothing clean or new. One strong motivated light source; deep shadow shapes with lost edges; warm light against cool blue-violet and teal shadows; muted, slightly desaturated colour with one or two saturated accents. Cinematic lens: crisp, detailed brushwork only around the focal point; toward the edges and corners the painting becomes loose, soft and blurred, with broad strokes and less detail, like a shallow depth of field; the foreground element is a large out-of-focus shape cutting into the frame; the corners fall off into shadow; a faint red and blue colour fringe at the very edges of the frame; slight atmospheric haze in depth. Widescreen 16:9 frame with no black bars. No people, no characters, no text, no logos.
```

### 3. Front hall, night

Shots 03, 11, 13. References: kitchen_night.jpg + drawing_corner_night.jpg.

```
Interior, night. The narrow front hall of an old tenement apartment, with the camera at eye level looking straight at the closed front door. A scuffed, panelled wooden door has a small square window glowing saturated ultramarine, with rain and a blurry fire escape beyond it. Worn floorboards catch a sheet of blue light. On a frayed doormat sits a pair of small red canvas high-top sneakers. Coat hooks on the right hold a man's dark coat and a small mustard-yellow child's hoodie. There is an old cast-iron radiator on the left, faded green-grey walls, an unlit enamel ceiling lamp, and an open doorway on each side. The hall is almost dark: the only light is the cold blue window. Palette: near-black green-grey, deep ultramarine, cool slate; the only warm notes are the red sneakers and the mustard hoodie. Mood: grief, silence. Focal point: the door window, the doormat and the red sneakers. Foreground element: the dark edges of the open doors on both sides of the frame. Hand-painted digital background painting for an animated feature film, in a visual-development colour-key style. Painted with a broad flat brush in hard-edged planes of colour, like gouache over oil: simplified, chunky shapes; slightly wonky, hand-drawn perspective; visible dry-brush drag marks; broken stroke edges; small impasto dabs on the highlights; subtle canvas grain. Imperfect and lived-in: chipped paint, scuffs, water stains, uneven bricks, peeling plaster, worn floorboards; nothing clean or new. One strong motivated light source; deep shadow shapes with lost edges; warm light against cool blue-violet and teal shadows; muted, slightly desaturated colour with one or two saturated accents. Cinematic lens: crisp, detailed brushwork only around the focal point; toward the edges and corners the painting becomes loose, soft and blurred, with broad strokes and less detail, like a shallow depth of field; the foreground element is a large out-of-focus shape cutting into the frame; the corners fall off into shadow; a faint red and blue colour fringe at the very edges of the frame; slight atmospheric haze in depth. Widescreen 16:9 frame with no black bars. No people, no characters, no text, no logos.
```

### 4. Drawing corner, lamplight

Shots 06–07. References: drawing_corner_night.jpg + kitchen_night.jpg.

```
Interior, evening. A cosy corner of a tenement living room. A low white-painted wooden kid's table with two small chairs sits under a tall window. It is covered with paper, a box of crayons, loose crayons and a roll of masking tape, and a red rubber ball lies under it. The wall beside it is plastered with children's crayon drawings taped up with masking tape: a rainbow, a tree, a house, stars, a heart. There is an old radiator, and a sofa and floor lamp on the right. The window shows a deep blue dusk sky, lit windows in the buildings opposite, and a pink-orange glow at the horizon. Warm golden lamplight floods the corner. Palette: amber, honey, cream and warm wood against deep blue dusk and violet shadows, with crayon primaries on the drawings and the red ball. Mood: safe, happy, warm. Focal point: the little table and the crayons. Foreground element: the glowing floor lamp and sofa on the right, and a dark sofa arm cutting into the bottom-left corner. Hand-painted digital background painting for an animated feature film, in a visual-development colour-key style. Painted with a broad flat brush in hard-edged planes of colour, like gouache over oil: simplified, chunky shapes; slightly wonky, hand-drawn perspective; visible dry-brush drag marks; broken stroke edges; small impasto dabs on the highlights; subtle canvas grain. Imperfect and lived-in: chipped paint, scuffs, water stains, uneven bricks, peeling plaster, worn floorboards; nothing clean or new. One strong motivated light source; deep shadow shapes with lost edges; warm light against cool blue-violet and teal shadows; muted, slightly desaturated colour with one or two saturated accents. Cinematic lens: crisp, detailed brushwork only around the focal point; toward the edges and corners the painting becomes loose, soft and blurred, with broad strokes and less detail, like a shallow depth of field; the foreground element is a large out-of-focus shape cutting into the frame; the corners fall off into shadow; a faint red and blue colour fringe at the very edges of the frame; slight atmospheric haze in depth. Widescreen 16:9 frame with no black bars. No people, no characters, no text, no logos.
```

### 5. Bedroom, grey day

Shots 08. References: drawing_corner_night.jpg + kitchen_night.jpg.

```
Interior, rainy afternoon. A small child's bedroom in an old tenement. A small white-painted wooden bed stands against the wall with a rumpled rust-orange blanket and a pillow. A little bedside table holds a glass of water and a book. A tall double-hung window has rain running down the glass and a brick building opposite, with an old radiator beneath it. Three children's crayon drawings are taped to the wall above the bed: a cat, a robot and a tree. A toy truck, wooden blocks and a red ball lie on the worn floorboards, and there is a floor lamp and a toy box on the right. Soft, flat, grey-blue daylight comes from the window. Palette: slate blue, grey-violet and muted cream, with one warm note in the rust blanket and the floorboards. Mood: quiet, heavy, still. Focal point: the bed and the bedside table. Foreground element: the toys in the bottom-left corner and the floor lamp on the right. Hand-painted digital background painting for an animated feature film, in a visual-development colour-key style. Painted with a broad flat brush in hard-edged planes of colour, like gouache over oil: simplified, chunky shapes; slightly wonky, hand-drawn perspective; visible dry-brush drag marks; broken stroke edges; small impasto dabs on the highlights; subtle canvas grain. Imperfect and lived-in: chipped paint, scuffs, water stains, uneven bricks, peeling plaster, worn floorboards; nothing clean or new. One strong motivated light source; deep shadow shapes with lost edges; warm light against cool blue-violet and teal shadows; muted, slightly desaturated colour with one or two saturated accents. Cinematic lens: crisp, detailed brushwork only around the focal point; toward the edges and corners the painting becomes loose, soft and blurred, with broad strokes and less detail, like a shallow depth of field; the foreground element is a large out-of-focus shape cutting into the frame; the corners fall off into shadow; a faint red and blue colour fringe at the very edges of the frame; slight atmospheric haze in depth. Widescreen 16:9 frame with no black bars. No people, no characters, no text, no logos.
```

### 6. Bedroom, empty

Shots 09. References: plate 5 (as an edit).

```
Interior, rainy afternoon. The same small child's bedroom: a small white-painted wooden bed against the wall, now neatly made, with the rust-orange blanket pulled flat and tucked in and the pillow smoothed. The bedside table is empty, with no glass. A tall double-hung window has rain running down the glass and a brick building opposite, with an old radiator beneath it. Three children's crayon drawings are taped to the wall: a cat, a robot and a tree. A toy truck, wooden blocks and a red ball lie on the worn floorboards, and there is a floor lamp and a toy box on the right. Soft, flat, grey-blue daylight. Palette: slate blue, grey-violet and muted cream, with the rust blanket as the only warmth. Mood: emptiness; someone is gone. Focal point: the made bed. Foreground element: the toys in the bottom-left corner and the floor lamp on the right. Hand-painted digital background painting for an animated feature film, in a visual-development colour-key style. Painted with a broad flat brush in hard-edged planes of colour, like gouache over oil: simplified, chunky shapes; slightly wonky, hand-drawn perspective; visible dry-brush drag marks; broken stroke edges; small impasto dabs on the highlights; subtle canvas grain. Imperfect and lived-in: chipped paint, scuffs, water stains, uneven bricks, peeling plaster, worn floorboards; nothing clean or new. One strong motivated light source; deep shadow shapes with lost edges; warm light against cool blue-violet and teal shadows; muted, slightly desaturated colour with one or two saturated accents. Cinematic lens: crisp, detailed brushwork only around the focal point; toward the edges and corners the painting becomes loose, soft and blurred, with broad strokes and less detail, like a shallow depth of field; the foreground element is a large out-of-focus shape cutting into the frame; the corners fall off into shadow; a faint red and blue colour fringe at the very edges of the frame; slight atmospheric haze in depth. Widescreen 16:9 frame with no black bars. No people, no characters, no text, no logos.
```
