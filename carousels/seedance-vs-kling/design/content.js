// Template content. Frames are placeholders and every note/score is a stand-in:
// real copy gets written only after both clips are generated and watched.
const round = (n, kicker, title) => [
  { type: "result", kicker: `Round 0${n} · ${kicker}`, title, caption: "Same input, same settings. Swipe for the notes." },
  { type: "notes", kicker: `Round 0${n} · Notes`,
    title: "Placeholder: one-line verdict.",
    rows: [
      { label: "Motion realism", a: { note: "Short note from watching the clip.", score: 0 }, b: { note: "Short note from watching the clip.", score: 0 } },
      { label: "Visual quality", a: { note: "Short note from watching the clip.", score: 0 }, b: { note: "Short note from watching the clip.", score: 0 } },
      { label: "Prompt following", a: { note: "Which details landed or got dropped.", score: 0 }, b: { note: "Which details landed or got dropped.", score: 0 } },
    ] },
];

window.CAROUSEL = {
  handle: "@ashokreddyai",
  headlineColor: "b",
  models: {
    a: { name: "Seedance 2.5", short: "Seedance", settings: ["9:16 · same duration per test", "Audio matched per test · no enhancer", "Same refs / first frame"] },
    b: { name: "Kling 4.0", short: "Kling", settings: ["9:16 · same duration per test", "Audio matched per test · no enhancer", "Same refs / first frame"] },
  },
  slides: [
    { type: "cover", kicker: "Seedance 2.5 vs Kling 4.0",
      title: "Same prompt.<br>Two films.",
      sub: "Four tests. Identical inputs. Swipe to see who held up." },
    { type: "setup", kicker: "The test",
      title: "Four tests.<br>One prompt each.",
      prompts: [
        "Multi-shot realism: one character, golden-hour hillside, three cuts.",
        "Animated scene: stylised world, camera move, character action.",
        "UGC: creator talks to a phone camera about a product.",
        "First frame: both models start from the exact same image.",
      ] },
    ...round(1, "Multi-shot realism", "Three cuts, one face."),
    ...round(2, "Animated scene", "The animated world."),
    ...round(3, "UGC", "The phone-camera test."),
    ...round(4, "First frame", "Same first frame."),
    { type: "score", kicker: "Scoreboard", title: "Four rounds, tallied.",
      rows: [
        { label: "Motion realism", a: "–", b: "–" },
        { label: "Visual quality", a: "–", b: "–" },
        { label: "Prompt following", a: "–", b: "–" },
        { label: "Rounds won", a: "–", b: "–" },
      ] },
    { type: "takeaway", kicker: "Takeaway",
      title: "Placeholder:<br>the honest verdict.",
      a: "Where Seedance was strongest, and where it slipped.",
      b: "Where Kling was strongest, and where it slipped.",
      cta: "Comment “CLASH” and I’ll send all four prompts." },
  ],
};
