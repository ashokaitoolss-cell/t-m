// Sound cue sheet: [time (s), sound in assets/sfx/, gain 0..1, note]. The time is the
// visual beat; swells start early by their measured lead so their peak lands on it.
// Tactile sounds (ticks, clicks, clinks, the latch) sit on contacts and landings;
// ethereal ones (glass bells, shimmer, air) carry arrivals and camera moves.
const B = (n) => n * 0.6;
export const cues = [
  // ACT I — the problem
  [0.3, "bellA", 0.7, "the dot appears"],
  [0.62, "air2", 0.4, "hairlines draw out"],
  [1.5, "tick", 0.75, "You"], [1.8, "tock", 0.7, "build"], [2.1, "tick", 0.75, "what"], [2.4, "tock", 0.7, "comes"], [2.7, "tick", 0.75, "next"],
  [3.02, "clinkB", 0.45, "the dot becomes the full stop"],
  [4.2, "ratchet2", 0.5, "the line decodes"],
  [5.8, "air", 0.45, "the dot flies to centre"],
  [6.0, "ping", 0.5, "it is a smartwatch badge"],
  [7.0, "air2", 0.4, "pull back to the wall"],
  [6.8, "uiclick", 0.5, "wall appears"], [6.9, "uiclick", 0.42, ""], [7.0, "uiclick", 0.38, ""], [7.1, "uiclick", 0.34, ""], [7.2, "uiclick", 0.3, ""],
  [B(12), "ping", 0.55, "everyone pings"], [B(12), "buzz", 0.45, ""],
  [B(12.5), "ping", 0.5, ""], [B(12.5), "buzz", 0.42, ""],
  [B(13), "ping", 0.5, ""], [B(13), "buzz", 0.42, ""],
  [B(13.25), "click", 0.6, "screens off"],
  [B(14.6), "suckLow", 0.6, "implosion into the dot"],
  [B(14.6) + 0.02, "clinkA", 0.35, "the dot"],
  // ACT II — the watch
  [B(16), "shimmer", 0.55, "the watch spins out of the dot"],
  [B(17.6), "whip", 0.35, "spin"],
  [B(18), "thump", 0.5, "landing"], [B(18), "bellB", 0.65, "landing"],
  ...Array.from({ length: 14 }, (_, i) => [B(18.25) + i * 0.085 + 0.2, i % 2 ? "clinkB" : "clinkA", 0.34 + 0.12 * ((i * 7) % 3) / 2, i ? "" : "links click out"]),
  [B(20), "tick", 0.45, "An"], [B(20.5), "tock", 0.4, "analog"], [B(21), "tick", 0.45, "point"], [B(21.5), "tock", 0.4, "of"], [B(22), "tick", 0.45, "view"],
  [B(24), "click", 0.8, "crown press"],
  [B(24) + 0.06, "ratchet", 0.55, "hands spin"],
  [B(25.2), "tock", 0.55, "hands settle at 10:10"],
  [B(26.2), "air", 0.4, "turn to face"],
  [B(27.3), "suckLow", 0.55, "dive into the dial"],
  [B(27.3) + 0.02, "thump", 0.35, "into olive"],
  // ACT III — why it's different
  [B(28.6), "air2", 0.4, "smartwatch floats in"],
  [B(29), "ping", 0.45, "one more ping"], [B(29), "buzz", 0.4, ""],
  [B(30.5), "whip", 0.5, "edge-on flip"],
  [B(30.5) + 0.02, "clinkB", 0.4, "swap"],
  [B(31), "bellB", 0.55, "olive dial lands"], [B(31), "thump", 0.3, ""],
  [B(33.2), "air", 0.45, "macro move"],
  [B(33.6), "sparkle", 0.5, "light across the ridges"],
  [B(37), "air2", 0.4, "camera back"],
  [B(36), "tick", 0.6, "minute step"], [B(37), "tock", 0.55, ""], [B(38), "tick", 0.6, ""], [B(39), "tock", 0.55, ""],
  [B(40.7), "suck", 0.45, "olive collapses into the dial"],
  ...Array.from({ length: 8 }, (_, i) => [B(40.4) + 0.05 + i * 0.07, i % 2 ? "clinkB" : "clinkA", 0.28, i ? "" : "links fan out"]),
  [B(42.2), "air", 0.45, "spin up"],
  [B(43), "whoosh", 0.7, "burst"],
  [B(43.9), "slide", 0.5, "two links slide together"],
  [B(45), "latch", 0.9, "LOCK: the logo, in silence"],
  // ACT IV — the brand
  [B(46), "warm", 0.6, "brand bloom"],
  [B(46.4), "tick", 0.45, "Clock"], [B(46.9), "tock", 0.4, "It"],
  [B(47.1), "clinkA", 0.35, "the bar of the !"],
  // The dot's hops end in bounce.out, which first touches down 0.145 s into its 0.4 s fall.
  [B(46.2) + 0.545, "clinkB", 0.5, "the dot lands as the ! dot"], [B(46.2) + 0.69, "tick", 0.2, "small rebound"],
  [B(48), "air2", 0.3, "tagline"],
  // ACT V — it isn't real
  [B(50.4), "ratchet2", 0.5, "tagline decodes"],
  [B(52.4), "air", 0.45, "exit"],
  [B(52.8), "shimmer", 0.5, "the wireframe arrives"],
  [B(53), "tick", 0.6, "The idea."], [B(54), "tock", 0.55, "The product."], [B(55), "tick", 0.6, "The photos."], [B(56), "tock", 0.55, "The brand."], [B(57), "tick", 0.6, "This film."],
  [B(59.2), "suck", 0.5, "the wireframe collapses into the dot"],
  [B(59.3), "bellA", 0.65, "the dot"],
  [B(59.6), "tick", 0.45, "All"], [B(59.6) + 0.2, "tock", 0.4, "made"], [B(59.6) + 0.4, "tick", 0.45, "with"], [B(59.6) + 0.6, "tock", 0.4, "AI"],
  [B(59.6) + 0.945, "clinkB", 0.45, "the full stop"], [B(59.6) + 1.09, "tick", 0.2, "small rebound"],
  [B(61), "air2", 0.25, "small print"],
];
