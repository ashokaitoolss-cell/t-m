// Scenes offered in the picker.
//
// Captured scenes are the public sample files from antimatter15/splat, served
// from Hugging Face. `preset` places each one in the window box:
//   rotation  Euler degrees (X, then Y, then Z) applied to the capture; the X
//             tilts were measured by finding the plane each object rests on
//   size      the capture's robust radius (80th percentile) maps to this many units
//   position  where its centre ends up (window units; the glass is z = 0)
//   crop      drop splats further than this many radii from the centre
//   maxScale  drop splats wider than this (window units), e.g. sky in outdoor captures
//   spin      turntable speed in radians per second
//   room      draw the box behind the glass (and hide splats outside it)

const SAMPLES = 'https://huggingface.co/cakewalk/splat-data/resolve/main/';

export const SCENES = [
  {
    id: 'orrery',
    title: 'Orrery',
    caption: 'Procedural · built in the browser',
    procedural: true,
    room: true,
  },
  {
    id: 'sneaker',
    title: 'Sneaker',
    caption: 'Captured · 8.7 MB',
    url: `${SAMPLES}nike.splat`,
    bytes: 8655712,
    room: true,
    preset: { rotation: [148.5, 0, 3.2], size: 0.33, position: [0, -0.04, -0.45], crop: 2.2, spin: 0.18 },
  },
  {
    id: 'plush',
    title: 'Plush',
    caption: 'Captured · 9.0 MB',
    url: `${SAMPLES}plush.splat`,
    bytes: 9007936,
    room: true,
    preset: { rotation: [145.7, 0, -3.4], size: 0.33, position: [0, -0.04, -0.45], crop: 2.2, spin: 0.18 },
  },
  {
    id: 'train',
    title: 'Train',
    caption: 'Captured · 33 MB',
    url: `${SAMPLES}train.splat`,
    bytes: 32848256,
    room: true,
    // A 360° capture: crop the middle out as a diorama and drop the huge sky splats.
    preset: { rotation: [185.7, 315, -1.9], size: 1.1, position: [0, -0.12, -0.55], crop: 0.42, maxScale: 0.015, spin: 0.05 },
  },
];

// Files the viewer opens themselves: centred, sized to fit and turned the
// right way up for the usual COLMAP-style (y down) captures.
export const USER_PRESET = { rotation: [180, 0, 0], size: 0.32, position: [0, 0, -0.5], crop: 3, spin: 0 };
