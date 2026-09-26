// Scene specs for the Duo explainer. All times are ABSOLUTE seconds on the master
// timeline (from data/words.json); the generator converts them to scene-local time.
// Positions are px on the 1080x1920 stage. Anything tied to the picture names an anchor
// (`at`, `near`, `focusAnchor`: subject, duo, glow, face, brass, blue, screen, heads) and is
// re-pinned by build-scenes.mjs from data/layout.json, measured on the real plates by
// scripts/analyze-plates.py; the literal positions here are the fallback.
//
// kinds: plate (painted scene, optional cut-out subject), card (text on paper),
//        tabletop (object on paper), polaroid (photo on paper)
// caption anims: pop (3-frame blur-in), box (black label), scale (key word grows),
//                jitter (stepped shake), stiff (upright roman, no motion)

const C = (t, text, o = {}) => ({ t, text, ...o });

export const scenes = [
  {
    num: 1, slug: "hook", start: 0, end: 2.4, kind: "plate", plate: "f01", cut: true,
    focus: [540, 1050],
    camera: [{ t: 0, s: 1.0 }, { t: 2.4, s: 1.07 }],
    punches: [{ t: 0.86, s: 1.06 }],
    fg: { img: "fg-man", t0: 0.95, t1: 2.4, x0: -980, x1: 1250, y: 760, s: 1.9 },
    breathe: true,
    glints: [{ x: 700, y: 760, t: 0.35, near: "subject" }, { x: 380, y: 980, t: 1.6, near: "subject" }],
    captions: [
      C(0.05, "Duolingo didn't", { anim: "box", y: 1210 }),
      C(0.86, "turn an owl", { y: 1210 }),
      C(1.42, "into a mascot.", { y: 1210, mark: { type: "strike", word: "mascot.", t: 1.95 } }),
    ],
  },
  {
    num: 2, slug: "growth-engine", start: 2.4, end: 4.9, kind: "plate", plate: "f02", cut: true,
    focus: [540, 1000],
    camera: [{ t: 2.4, s: 1.0 }, { t: 4.9, s: 1.04 }],
    punches: [{ t: 3.72, s: 1.22 }],
    puppet: { origin: "50% 90%", keys: [
      { t: 2.4, r: 0 }, { t: 2.8, r: -3 }, { t: 3.2, r: 1.5 }, { t: 3.6, r: -3 }, { t: 4.0, r: 1.5 }, { t: 4.4, r: -3 }, { t: 4.9, r: 0 },
    ] },
    overlays: [{ type: "arrow", id: "arrow", at: "subject-right", t: 3.76, dur: 0.45, color: "#7ccf3a",
      d: "M 830 1330 C 850 1150, 820 980, 900 760", head: [900, 760, -70] }],
    glints: [{ x: 905, y: 730, t: 4.2 }, { x: 760, y: 880, t: 4.45 }],
    captions: [
      C(2.52, "they turned guilt", { y: 1270 }),
      C(3.34, "into a", { y: 1270 }),
      C(3.72, "growth engine.", { y: 1270, anim: "scale" }),
    ],
  },
  {
    num: 3, slug: "before-famous", start: 4.9, end: 7.05, kind: "plate", plate: "f03", cut: true,
    focus: [540, 1150],
    camera: [{ t: 4.9, s: 1.1 }, { t: 7.05, s: 1.0 }],
    fg: { img: "fg-woman", t0: 4.95, t1: 6.35, x0: 1250, x1: -1000, y: 700, s: 2.0 },
    breathe: true,
    captions: [
      C(5.18, "before Duo", { y: 800 }),
      C(5.98, "was internet famous,", { y: 800 }),
    ],
  },
  {
    num: 4, slug: "most-annoying", start: 7.05, end: 9.85, kind: "plate", plate: "f04", cut: false,
    focus: [760, 820], focusAnchor: "glow",
    camera: [{ t: 7.05, s: 1.0 }, { t: 9.85, s: 1.3, ease: "power1.in" }],
    shake: [{ t: 7.3, dur: 0.35, amp: 7 }, { t: 8.0, dur: 0.35, amp: 7 }],
    overlays: [
      { type: "buzz", id: "buzz1", at: "glow", x: 760, y: 820, t: 7.3, dur: 0.4 },
      { type: "buzz", id: "buzz2", at: "glow", x: 760, y: 820, t: 8.0, dur: 0.4 },
      { type: "circle", id: "circle", at: "glow", x: 760, y: 820, rx: 150, ry: 120, t: 8.24, dur: 0.4, color: "#e0412f" },
    ],
    captions: [
      C(7.74, "the most annoying", { y: 1330 }),
      C(8.7, "part of the product.", { y: 1330 }),
    ],
  },
  {
    num: 5, slug: "showing-up", start: 9.85, end: 11.85, kind: "plate", plate: "f05", cut: true,
    focus: [560, 860],
    camera: [{ t: 9.85, s: 1.0 }, { t: 11.85, s: 1.08 }],
    puppet: { origin: "50% 80%", keys: [
      { t: 9.85, r: 0 }, { t: 10.38, r: 0 }, { t: 10.62, r: -9, ease: "back.out(2)" }, { t: 11.3, r: -9 }, { t: 11.6, r: -4 },
    ] },
    glints: [{ x: 640, y: 700, t: 10.45, near: "subject" }],
    captions: [
      C(9.92, "that little", { y: 1300 }),
      C(10.38, "green owl", { y: 1300, anim: "scale" }),
      C(11.02, "showing up like,", { y: 1300 }),
    ],
  },
  {
    num: 6, slug: "spanish-lesson", start: 11.85, end: 14.25, kind: "plate", plate: "f06", cut: true,
    focus: [540, 900],
    camera: [{ t: 11.85, s: 1.0 }, { t: 14.25, s: 1.04 }],
    punches: [{ t: 12.46, s: 1.18 }],
    shake: [{ t: 11.92, dur: 0.3, amp: 5 }],
    focusAnchor: "screen",
    notification: { at: "screen", x: 540, y: 560, w: 560, t: 11.92, title: "Duo", line1: "hey,", line2: "you forgot your Spanish lesson.", t2: 12.46 },
    captions: [],
  },
  {
    num: 7, slug: "hide-that", start: 14.25, end: 16.0, kind: "plate", plate: "f07", cut: true,
    focus: [540, 1000],
    camera: [{ t: 14.25, s: 1.0 }, { t: 16.0, s: 1.03 }],
    punches: [{ t: 15.12, s: 1.2 }],
    puppet: { origin: "50% 100%", keys: [{ t: 14.25, x: 0 }, { t: 15.1, x: 0 }, { t: 15.3, x: 14, ease: "power3.out" }, { t: 15.5, x: 6 }] },
    captions: [
      C(14.32, "most brands", { y: 1360 }),
      C(14.96, "would hide that.", { y: 1360 }),
    ],
  },
  {
    num: 8, slug: "card-opposite", start: 16.0, end: 17.92, kind: "card",
    camera: [{ t: 16.0, s: 1.0 }, { t: 17.92, s: 1.04 }],
    card: [
      { t: 16.08, text: "Duolingo did" },
      { t: 17.12, text: "the {opposite.}", flip: 17.62 },
    ],
  },
  {
    num: 9, slug: "joke-in-head", start: 17.92, end: 20.42, kind: "plate", plate: "f09", cut: true,
    focus: [540, 900],
    camera: [{ t: 17.92, s: 1.06, x: 50 }, { t: 20.42, s: 1.1, x: -50 }],
    bubbles: [ // pinned above the heads measured in the plate
      { id: "b1", x: 250, y: 560, t: 18.96, tail: [270, 760] },
      { id: "b2", x: 560, y: 470, t: 19.36, tail: [545, 700] },
      { id: "b3", x: 850, y: 560, t: 19.76, tail: [820, 760] },
    ],
    captions: [
      C(18.16, "took the joke", { y: 1380 }),
      C(18.96, "everyone already had", { y: 1380 }),
      C(19.76, "in their head", { y: 1380 }),
    ],
  },
  {
    num: 10, slug: "personality", start: 20.42, end: 23.3, kind: "plate", plate: "f10", cut: false,
    focus: [540, 700], focusAnchor: "duo",
    camera: [{ t: 20.42, s: 1.0 }, { t: 23.3, s: 1.6, ease: "power2.inOut" }],
    glints: [{ x: 700, y: 560, t: 21.7, near: "duo" }, { x: 420, y: 760, t: 22.2, near: "duo" }],
    captions: [
      C(21.04, "the entire", { y: 1330 }),
      C(21.68, "personality", { y: 1330, anim: "scale", size: 84 }),
      C(22.16, "of the brand.", { y: 1330 }),
    ],
  },
  {
    num: 11, slug: "not-a-logo", start: 23.3, end: 25.52, kind: "tabletop", object: "icon",
    camera: [{ t: 23.3, s: 1.0 }, { t: 25.52, s: 1.06 }],
    object: { img: "icon", w: 560, x: 540, y: 860, tin: 23.3, tout: 25.2 },
    overlays: [{ type: "x", id: "x", x: 540, y: 860, size: 470, t: 24.56, dur: 0.36, color: "#e0412f" }],
    captions: [
      C(23.36, "suddenly,", { y: 1330, ink: "dark" }),
      C(24.0, "Duo wasn't", { y: 1330, ink: "dark" }),
      C(24.88, "a logo.", { y: 1330, ink: "dark" }),
    ],
  },
  {
    num: 12, slug: "character", start: 25.52, end: 26.66, kind: "plate", plate: "f12", cut: true,
    focus: [540, 1000],
    camera: [{ t: 25.52, s: 1.0 }, { t: 26.66, s: 1.04 }],
    punches: [{ t: 25.92, s: 1.15 }],
    flash: { t: 25.52, dur: 0.28 },
    glints: [{ x: 330, y: 700, t: 25.6, near: "subject" }, { x: 760, y: 640, t: 25.85, near: "subject" }, { x: 800, y: 1100, t: 26.1, near: "subject" }, { x: 290, y: 1150, t: 26.35, near: "subject" }],
    captions: [C(25.92, "a character.", { y: 1380, anim: "scale", size: 80 })],
  },
  {
    num: 13, slug: "petty", start: 26.66, end: 27.3, kind: "plate", plate: "f13", cut: true,
    focus: [540, 850],
    camera: [{ t: 26.66, s: 1.14 }, { t: 26.95, s: 1.04, ease: "power3.out" }, { t: 27.3, s: 1.02 }],
    captions: [C(26.72, "Petty,", { y: 1330, anim: "scale", size: 92 })],
  },
  {
    num: 14, slug: "needy", start: 27.3, end: 28.02, kind: "plate", plate: "f14", cut: true,
    focus: [540, 1150],
    camera: [{ t: 27.3, s: 1.14 }, { t: 27.6, s: 1.04, ease: "power3.out" }, { t: 28.02, s: 1.02 }],
    captions: [C(27.36, "needy,", { y: 760, anim: "scale", size: 92 })],
  },
  {
    num: 15, slug: "unhinged", start: 28.02, end: 28.82, kind: "plate", plate: "f15", cut: true,
    focus: [540, 850],
    camera: [{ t: 28.02, s: 1.1, r: -1.5 }, { t: 28.82, s: 1.04, r: 1 }],
    wiggle: { x: 9, y: 8, r: 0.8, f: 5 },
    captions: [C(28.08, "unhinged,", { y: 1330, anim: "jitter", size: 92 })],
  },
  {
    num: 16, slug: "threatening", start: 28.82, end: 30.18, kind: "plate", plate: "f16", cut: false,
    focus: [540, 760],
    camera: [{ t: 28.82, s: 1.0 }, { t: 30.18, s: 1.15, ease: "power1.in" }],
    shake: [{ t: 29.52, dur: 0.25, amp: 6 }],
    captions: [
      C(28.88, "low-key", { y: 1180 }),
      C(29.52, "threatening,", { y: 1180, anim: "scale", size: 88 }),
    ],
  },
  {
    num: 17, slug: "lovable", start: 30.18, end: 31.92, kind: "plate", plate: "f17", cut: true,
    focus: [540, 850],
    camera: [{ t: 30.18, s: 1.02 }, { t: 31.92, s: 1.08 }],
    breathe: true,
    glints: [{ x: 300, y: 620, t: 30.9, near: "subject" }, { x: 800, y: 700, t: 31.1, near: "subject" }, { x: 700, y: 1050, t: 31.35, near: "subject" }],
    captions: [
      C(30.24, "and weirdly", { y: 1330 }),
      C(31.04, "lovable.", { y: 1330, anim: "scale", size: 88 }),
    ],
  },
  {
    num: 18, slug: "card-genius", start: 31.92, end: 33.28, kind: "card",
    camera: [{ t: 31.92, s: 1.0 }, { t: 33.28, s: 1.04 }],
    card: [
      { t: 32.0, text: "That's the" },
      { t: 32.48, text: "{genius} part.", underline: 32.66 },
    ],
    glints: [{ x: 430, y: 915, t: 32.95 }],
  },
  {
    num: 19, slug: "brand-voice", start: 33.28, end: 36.18, kind: "plate", plate: "f19", cut: true,
    focus: [540, 900],
    camera: [{ t: 33.28, s: 1.0 }, { t: 36.18, s: 1.08 }],
    puppet: { origin: "50% 100%", keys: [
      { t: 33.28, r: 0 }, { t: 33.4, r: -1.2 }, { t: 33.53, r: 1.0 }, { t: 33.67, r: -1.0 }, { t: 33.8, r: 0.6 }, { t: 34.0, r: 0 },
    ] },
    focusAnchor: "brass",
    overlays: [{ type: "x", id: "x", at: "brass", x: 790, y: 800, size: 300, t: 34.4, dur: 0.34, color: "#e0412f" }],
    captions: [
      C(34.16, "didn't force", { y: 1380 }),
      C(34.64, "a brand voice", { y: 1380 }),
      C(35.28, "onto the internet.", { y: 1380 }),
    ],
  },
  {
    num: 20, slug: "found-emotion", start: 36.18, end: 39.38, kind: "plate", plate: "f20", cut: true,
    focus: [540, 780], focusAnchor: "face",
    camera: [{ t: 36.18, s: 1.0 }, { t: 39.38, s: 1.35, ease: "power1.inOut" }],
    overlays: [
      { type: "arrow", id: "arrow", at: "face", t: 36.8, dur: 0.4, color: "#f2c230",
        d: "M 190 1130 C 230 1010, 300 930, 400 880", head: [400, 880, -25] },
      { type: "scrawl", id: "word", at: "face", text: "guilt", x: 120, y: 1150, t: 36.95, dur: 0.45, color: "#f2c230", size: 96, rot: -8 },
    ],
    captions: [
      C(36.24, "they found", { y: 1390 }),
      C(36.64, "the emotion", { y: 1390 }),
      C(37.28, "people already", { y: 1390 }),
      C(37.84, "associated with the app", { y: 1390 }),
    ],
  },
  {
    num: 21, slug: "culture", start: 39.38, end: 42.0, kind: "plate", plate: "f21", cut: true,
    focus: [540, 900], focusAnchor: "duo",
    camera: [{ t: 39.38, s: 1.12 }, { t: 42.0, s: 1.0, ease: "power1.out" }],
    puppet: { origin: "50% 100%", keys: [{ t: 39.38, s: 0.82 }, { t: 39.6, s: 0.82 }, { t: 40.1, s: 1.0, ease: "back.out(1.6)" }] },
    shake: [{ t: 41.36, dur: 0.4, amp: 10 }],
    captions: [
      C(39.6, "exaggerated it", { y: 1390 }),
      C(40.64, "until it became", { y: 1390 }),
      C(41.36, "culture.", { y: 1390, anim: "scale", size: 96 }),
    ],
  },
  {
    num: 22, slug: "tiktok", start: 42.0, end: 43.92, kind: "plate", plate: "f22", cut: true,
    focus: [540, 900],
    camera: [{ t: 42.0, s: 1.0 }, { t: 43.92, s: 1.03 }],
    punches: [{ t: 42.56, s: 1.2 }],
    focusAnchor: "screen",
    screen: { at: "screen", x: 540, y: 900, w: 470, h: 960, r: 44, t: 42.0 },
    hearts: [{ t: 42.6, x: 700 }, { t: 42.85, x: 650 }, { t: 43.05, x: 730 }, { t: 43.3, x: 680 }, { t: 43.5, x: 720 }],
    captions: [
      C(42.08, "that's why", { y: 470, lockY: true }),
      C(42.56, "the TikTok worked.", { y: 470, lockY: true }),
    ],
  },
  {
    num: 23, slug: "card-random", start: 43.92, end: 45.7, kind: "card",
    camera: [{ t: 43.92, s: 1.0 }, { t: 45.7, s: 1.04 }],
    card: [
      { t: 44.0, text: "not because the owl" },
      { t: 44.96, text: "was {random,}", scatter: 45.3 },
    ],
  },
  {
    num: 24, slug: "alive", start: 45.7, end: 48.16, kind: "plate", plate: "f24", cut: true,
    focus: [540, 950], focusAnchor: "duo",
    camera: [{ t: 45.7, s: 1.0 }, { t: 48.16, s: 1.1 }],
    glints: [{ x: 620, y: 780, t: 47.1, near: "duo" }, { x: 430, y: 880, t: 47.3, near: "duo" }, { x: 700, y: 1000, t: 47.5, near: "duo" }],
    captions: [
      C(46.0, "the owl made", { y: 1390 }),
      C(46.64, "the product", { y: 1390 }),
      C(47.04, "feel alive.", { y: 1390, anim: "scale", size: 84 }),
    ],
  },
  {
    num: 25, slug: "professional", start: 48.16, end: 50.0, kind: "plate", plate: "f25", cut: false,
    focus: [540, 900],
    camera: [{ t: 48.16, s: 1.06, x: 40 }, { t: 50.0, s: 1.06, x: -40 }],
    wiggle: { x: 1.2, y: 1.2, r: 0.03 },
    captions: [
      C(48.24, "most brands", { y: 1390 }),
      C(48.96, "try to look", { y: 1390 }),
      C(49.36, "professional.", { y: 1390, anim: "stiff" }),
    ],
  },
  {
    num: 26, slug: "recognizable", start: 50.0, end: 52.08, kind: "plate", plate: "f26", cut: true,
    focus: [540, 1000], focusAnchor: "duo",
    camera: [{ t: 50.0, s: 1.0 }, { t: 52.08, s: 1.5, ease: "power2.in" }],
    glints: [{ x: 620, y: 900, t: 51.15, near: "duo" }, { x: 460, y: 1060, t: 51.35, near: "duo" }],
    captions: [
      C(50.08, "Duolingo became", { y: 1390 }),
      C(51.12, "recognizable.", { y: 1390, anim: "scale", size: 88, tint: "#b7e36a" }),
    ],
  },
  {
    num: 27, slug: "beats-polished", start: 52.08, end: 55.6, kind: "plate", plate: "f27", cut: true,
    focus: [540, 900], focusAnchor: "duo",
    camera: [{ t: 52.08, s: 1.0 }, { t: 55.6, s: 1.06 }],
    punches: [{ t: 53.68, s: 1.25 }],
    shake: [{ t: 53.72, dur: 0.3, amp: 8 }],
    captions: [
      C(52.32, "on social,", { y: 1390 }),
      C(53.04, "recognizable", { y: 1390 }),
      C(53.68, "beats polished", { y: 1390, anim: "scale" }),
      C(54.56, "almost every time.", { y: 1390 }),
    ],
  },
  {
    num: 28, slug: "whole-play", start: 55.6, end: 56.96, kind: "plate", plate: "f28", cut: false,
    focus: [540, 900],
    camera: [{ t: 55.6, s: 1.0 }, { t: 56.96, s: 1.04 }],
    punches: [{ t: 56.16, s: 1.12 }],
    overlays: [
      { type: "chalk", id: "c1", t: 55.75, dur: 0.35, d: "M 220 1250 C 300 1080, 420 1000, 520 930", head: [520, 930, -35] },
      { type: "chalk", id: "c2", t: 55.95, dur: 0.35, d: "M 860 1260 C 800 1100, 700 1000, 600 940", head: [600, 940, -140] },
    ],
    captions: [C(55.68, "that's the whole play.", { y: 1400 })],
  },
  {
    num: 29, slug: "dont-build", start: 56.96, end: 58.4, kind: "plate", plate: "f29", cut: false,
    focus: [540, 900],
    camera: [{ t: 56.96, s: 1.0 }, { t: 58.4, s: 1.05 }],
    focusAnchor: "blue",
    overlays: [{ type: "x", id: "x", at: "blue", x: 540, y: 880, size: 640, t: 57.1, dur: 0.4, color: "#e0412f" }],
    captions: [
      C(57.04, "don't build", { y: 1390 }),
      C(57.6, "a mascot.", { y: 1390 }),
    ],
  },
  {
    num: 30, slug: "memory", start: 58.4, end: 60.5, kind: "polaroid",
    camera: [{ t: 58.4, s: 1.0 }, { t: 60.5, s: 1.08 }],
    polaroid: { x: 540, y: 820, w: 760, t: 58.4, rot: -4, note: "the memory" },
    glints: [{ x: 850, y: 420, t: 59.3 }, { x: 250, y: 1150, t: 59.7 }],
    captions: [
      C(58.48, "build a memory", { y: 1420, ink: "dark" }),
      C(59.28, "people can joke about.", { y: 1420, ink: "dark" }),
    ],
  },
];
