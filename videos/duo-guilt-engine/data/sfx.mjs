// Sound-design cue sheet: [absolute time (s), sound name in assets/sfx/, gain 0..1, note].
// One effect per visual event, matched to its material (paper for cards, marker for
// scribbles, UI sounds for the phone, glass chimes for glints, sub hits for big moments).
// Typewriter ticks for paper cards are added automatically from data/scenes.mjs.
export const cues = [
  // 01 hook
  [0.0, "low-hit", 0.55, "cold open"],
  [0.86, "tick", 0.5, "caption: turn an owl"],
  [1.0, "whoosh", 0.4, "passer-by crosses the lens"],
  [1.95, "marker", 0.8, "strike through mascot"],
  // 02 growth engine
  [2.4, "tick", 0.55, "cut"],
  [3.72, "pop", 0.6, "punch-in: growth engine"],
  [3.76, "marker", 0.7, "arrow draws up"],
  [4.2, "chime", 0.7, "glint"],
  // 03 before famous
  [4.9, "tick", 0.45, "cut"],
  [5.0, "whoosh", 0.45, "foreground wipe"],
  // 04 most annoying
  [7.05, "tick", 0.45, "cut"],
  [7.3, "buzz", 0.7, "phone buzz"],
  [8.0, "buzz", 0.7, "phone buzz"],
  [8.24, "marker", 0.8, "circle the phone"],
  // 05 showing up
  [9.85, "tick", 0.45, "cut"],
  [10.4, "pop", 0.55, "head tilt"],
  // 06 notification
  [11.92, "ding", 0.75, "notification"],
  [11.92, "buzz", 0.4, "phone buzz"],
  [12.46, "pop", 0.35, "punch-in"],
  // 07 hide that
  [14.25, "whoosh", 0.35, "cut"],
  [15.3, "drawer", 0.8, "drawer slam"],
  // 08 card: opposite
  [16.0, "paper", 0.7, "paper card"],
  [17.62, "paper-flip", 0.8, "opposite flips"],
  // 09 joke in head
  [17.92, "whoosh-low", 0.35, "pan"],
  [18.96, "pop", 0.6, "bubble"],
  [19.36, "pop", 0.6, "bubble"],
  [19.76, "pop", 0.65, "bubble"],
  // 10 personality
  [20.42, "low-hit", 0.55, "big moment"],
  [20.55, "riser", 0.3, "bold push-in"],
  [21.7, "chime", 0.6, "glint on billboard"],
  // 11 not a logo
  [23.3, "whip", 0.75, "whip in"],
  [23.55, "paper", 0.4, "icon lands"],
  [24.56, "marker", 0.85, "X"],
  [25.2, "whoosh", 0.55, "icon spins out"],
  // 12 character
  [25.52, "low-hit", 0.45, "flash"],
  [25.52, "chime", 0.8, "flash sparkle"],
  [25.92, "pop", 0.4, "punch-in"],
  // 13-17 montage
  [26.66, "punch", 0.55, "petty"],
  [27.3, "pop", 0.6, "needy"],
  [28.02, "glitch", 0.6, "unhinged"],
  [28.82, "whoosh-low", 0.35, "threatening in"],
  [29.52, "low-hit", 0.6, "threatening"],
  [30.9, "chime", 0.65, "lovable glint"],
  // 18 card: genius
  [31.92, "paper", 0.7, "paper card"],
  [32.66, "marker", 0.7, "underline"],
  [32.95, "chime", 0.6, "glint"],
  // 19 brand voice
  [33.28, "tick", 0.45, "cut"],
  [33.4, "megaphone", 0.5, "megaphone"],
  [34.4, "marker", 0.85, "X on megaphone"],
  // 20 found the emotion
  [36.18, "tick", 0.45, "cut"],
  [36.8, "marker-long", 0.75, "arrow + guilt"],
  // 21 culture
  [39.38, "riser", 0.45, "exaggerated"],
  [39.5, "crowd", 0.35, "city crowd"],
  [41.36, "boom", 0.75, "culture"],
  // 22 tiktok
  [42.0, "tick", 0.45, "cut"],
  [42.56, "pop", 0.45, "punch-in"],
  [42.6, "heart-pop", 0.6, "heart"],
  [42.85, "heart-pop", 0.55, "heart"],
  [43.05, "heart-pop", 0.6, "heart"],
  [43.3, "heart-pop", 0.5, "heart"],
  [43.5, "heart-pop", 0.55, "heart"],
  // 23 card: random
  [43.92, "paper", 0.7, "paper card"],
  [45.3, "glitch", 0.35, "letters scatter"],
  // 24 alive
  [45.7, "tick", 0.45, "cut"],
  [45.95, "whoosh", 0.45, "climbs out"],
  [47.1, "chime", 0.7, "glint"],
  // 25 professional (deliberately dull)
  [48.16, "tick", 0.35, "cut"],
  // 26 recognizable
  [50.0, "whoosh-low", 0.45, "bold push-in"],
  [51.12, "chime", 0.75, "recognizable"],
  // 27 beats polished
  [52.08, "crowd", 0.4, "ringside"],
  [53.68, "bell", 0.65, "beats"],
  [53.72, "punch", 0.6, "punch"],
  // 28 whole play
  [55.6, "tick", 0.45, "cut"],
  [55.75, "chalk", 0.8, "chalk arrow"],
  [55.95, "chalk", 0.7, "chalk arrow"],
  [56.16, "pop", 0.4, "punch-in"],
  // 29 don't build
  [56.96, "paper", 0.45, "cut"],
  [57.1, "marker", 0.85, "X"],
  // 30 memory
  [58.4, "shutter", 0.7, "the memory"],
  [58.45, "whoosh", 0.45, "polaroid drops"],
  [58.8, "paper", 0.5, "polaroid lands"],
  [59.3, "chime", 0.6, "glint"],
];

// Bed dips (~60 ms) just before key cuts so the next hit lands harder.
export const dips = [16.0, 20.42, 25.52, 31.92, 39.38, 43.92, 50.0, 58.4];
