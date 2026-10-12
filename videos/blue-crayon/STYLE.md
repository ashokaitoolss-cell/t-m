# Blue Crayon — Look

The film is hand-painted, not clean 3D: a character-design painting brought to life.

## Style lock

Paste this block into every image and video prompt, word for word:

> Hand-painted digital character painting in a loose painterly style: chunky visible brush
> strokes made with a dry, bristly textured brush that leaves a stippled canvas-grain pattern,
> thick gouache-and-oil-like paint dabs, broken colour inside each stroke, forms modelled with
> warm light and cool violet-grey shadows, slightly caricatured simplified chunky shapes, warm
> saturated accents of burnt orange, rose red and ochre, character-design concept painting for an
> animated feature film.

What it means in practice:

- **Brush.** A dry, bristly brush that breaks up into a stipple. You can see every stroke, and
  edges are broken, not airbrushed.
- **Colour.** Warm light (burnt orange, rose, ochre) against cool violet-grey shadows. The
  robot's mint is the main cool note in warm scenes.
- **Shapes.** Chunky and a little caricatured: big heads, simple masses, few details.
- **Edges.** On character art the strokes thin out and dissolve into off-white paper. In film
  shots the painted environment fills the frame.

Don't name a living artist or an existing film character in prompts. Describe the technique
instead, as above.

## Robot design reference

Round 1 robot **B** (`assets/round1/robot_gpt_b.jpg`, Higgsfield job
`5d70bef3-25e7-4c57-98e3-51214672c209`) is the robot's design. The painterly versions are
generated from it.

## Midjourney prompts

These are written for Midjourney's prompt box. To lock the brush look harder, add your style
images with `--sref <image URL>`. To keep the robot's design, attach the robot B sheet as an
image or omni reference (`--oref` on V7).

**1 · Robot, curious portrait**
```
chest-up three-quarter portrait of a small shy robot, rounded egg-shaped head with a dent on top, dark smoked-glass visor with two big round warm-white glowing eyes and no mouth, faded pale-mint painted metal with chipped edges and orange rust streaks, one brass bolt on its chest, head tilted, eyes wide and curious, hand-painted digital painting, loose painterly brushwork, chunky dry-brush strokes with stippled canvas texture, gouache and oil paint dabs, broken colour, warm burnt orange rose and ochre light with cool violet-grey shadows, caricatured chunky shapes, animated feature concept art, strokes dissolving into off-white paper at the edges --ar 3:4 --s 250 --no text, signature, watermark, logo
```

**2 · Robot, frightened portrait (dark)**
```
chest-up portrait of a small frightened robot hiding, shoulders hunched, head pulled down, two tiny glowing eye dots on a dark smoked-glass visor, rounded egg-shaped dented head, faded pale-mint painted metal with rust streaks, deep warm reddish-brown painted background, single warm key light from the right, eye glow the brightest point, hand-painted digital painting, chunky dry-brush strokes with stippled canvas texture, thick gouache and oil dabs, cool violet-grey shadows, animated feature concept art --ar 3:4 --s 250 --no text, signature, watermark, logo
```

**3 · Robot, model sheet**
```
character model sheet of one small robot, top row front view three-quarter view side view back view, bottom row five head close-ups showing fear curious joy hurt resolve through its two round glowing eyes, rounded egg-shaped dented head, dark glass visor, no mouth, stubby three-fingered hands, short legs, faded pale-mint paint with orange rust streaks, hand-painted digital painting, loose painterly brushwork, dry-brush strokes with stippled canvas texture, warm light and cool violet-grey shadows, off-white paper background, strokes dissolving at the edges --ar 16:9 --s 200 --no text, labels, signature, watermark
```

**4 · The Boy, portrait**
```
chest-up portrait of a giggling five-year-old boy, round soft face, big dark eyes squeezed with laughter, small button nose, faint freckles, messy dark-brown hair sticking up, oversized mustard-yellow hoodie, hand-painted digital painting, loose painterly brushwork, chunky dry-brush strokes with stippled canvas texture, gouache and oil paint dabs, warm burnt orange rose and ochre skin light with cool violet-grey shadows, caricatured chunky shapes, animated feature concept art, strokes dissolving into off-white paper at the edges --ar 3:4 --s 250 --no text, signature, watermark, logo
```

**5 · Papa, portrait**
```
chest-up portrait of a tired father in his mid-thirties, defined jaw, short dark untidy hair, short stubble, heavy tired eyes, stern unsmiling mouth, light-blue work shirt with sleeves rolled up, steel wristwatch, hand-painted digital painting, loose painterly brushwork, chunky dry-brush strokes with stippled canvas texture, gouache and oil paint dabs, warm burnt orange and rose skin light with cool violet-grey shadows, caricatured chunky adult shapes, animated feature concept art, deep warm brown painted background --ar 3:4 --s 250 --no text, signature, watermark, logo
```

**6 · Key frame — the taped crayon (shot 09)**
```
a five-year-old boy in an oversized mustard-yellow hoodie taping a blue crayon onto the stubby finger of a small pale-mint robot with a dark glass visor and two big glowing eyes, both sitting at a low kid's table by a window in warm evening lamplight, crayons and paper scattered, child drawings taped on the wall behind, hand-painted digital painting, loose painterly brushwork, chunky dry-brush strokes with stippled canvas texture, warm burnt orange and ochre lamplight with cool violet-grey shadows, animated feature film still --ar 16:9 --s 250 --no text, signature, watermark, logo
```

**7 · Key frame — the robot hiding (shot 03)**
```
a small frightened pale-mint robot curled up in a shadowed gap between stacked wooden market crates, knees to its chest, two small glowing eyes on a dark glass visor, a red rubber ball resting against its foot, sunlit busy market street out of focus behind, warm golden morning light slicing in, hand-painted digital painting, loose painterly brushwork, chunky dry-brush strokes with stippled canvas texture, cool violet-grey shadows, animated feature film still --ar 16:9 --s 250 --no text, signature, watermark, logo
```

**8 · Key frame — the last shot (shot 30)**
```
over-the-shoulder shot from behind a sobbing father in a dark child's bedroom at night, his shoulder in the foreground, a small pale-mint robot held in his hug with its chin resting on his shoulder, the robot's two big round warm glowing eyes wide and still, staring past camera, the only light in the room, a crayon drawing hanging from its hand, near-black room with cool violet shadows, hand-painted digital painting, loose painterly brushwork, chunky dry-brush strokes with stippled canvas texture, animated feature film still --ar 16:9 --s 250 --no text, signature, watermark, logo
```
