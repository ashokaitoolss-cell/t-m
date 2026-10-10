# More trees than stars

A 5 s vertical (720×1280, 24 fps) explainer built with the *vox-motion-graphics* skill:
Mixed Media editorial collage, one narrated line, burned captions.

> Earth has three trillion trees, more than all the stars in our galaxy.

Paper-cutout trees pop up on a yellow ground under a navy halftone sky, multiply until
they crowd out the cut-paper stars, and a coral marker circle closes on the stack.

## Facts

- About 3.04 trillion trees (Crowther et al., *Nature*, 2015; ground plots plus satellite data).
  [Yale School of the Environment](https://environment.yale.edu/news/article/Yale-study-reveals-there-are-3-trillion-trees-on-earth)
- The Milky Way holds an estimated 100–400 billion stars; some estimates go as high as a trillion.
  [NASA Goddard](https://asd.gsfc.nasa.gov/blueshift/?p=7791),
  [Space.com](https://www.space.com/25959-how-many-stars-are-in-the-milky-way.html)

## Higgsfield jobs

| Part | Model | Job |
| --- | --- | --- |
| Style key | Mixed Media explainer preset | media `cadafbf0-5fe4-455e-a756-ec7505f4bfb5` |
| Clip, 5 s, 9:16 | `gemini_omni` (3D RENDER preset declined) | `96bb41bb-ea89-4b99-97c3-c6b4ae5aef71` |
| Voice, Jasper | `seed_audio` | `c81b3968-7ed7-4a39-bf4f-cfd6fc080341` |

Jasper was the deepest male preset by median pitch (about 87 Hz) of the twelve sampled.

## Build

```bash
scripts/build.sh   # renders/trees-vs-stars.mp4
```

Needs ffmpeg with libass. The raw take is 5.5 s, so the build trims its lead-in, shortens
the comma pause and speeds it up 5% to land the line by 4.8 s. Captions are in
`captions.ass` (Anton, "THREE TRILLION" in coral and "STARS" in star yellow).
