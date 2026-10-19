// Design mock. Frames are placeholders and every note/score is a stand-in:
// real copy gets written only after both clips are generated and watched.
window.CAROUSEL = {
  handle: "@ashokreddyai",
  headlineColor: "b",
  models: {
    a: { name: "Seedance 2.0", short: "Seedance", settings: ["9:16 · 5 s · 1080p", "Text-to-video, audio off", "No seed / no enhancer"] },
    b: { name: "Kling 3.0", short: "Kling", settings: ["9:16 · 5 s · Pro mode", "Text-to-video, audio off", "No seed / no enhancer"] },
  },
  slides: [
    { type: "cover",
      hero: { model: "a" }, inset: { model: "b" }, peek: { model: "b" },
      title: "Same prompt.<br>Two films.",
      sub: "Seedance vs Kling. Three prompts, identical settings. Swipe for who listened." },
    { type: "setup", kicker: "The test", peek: { model: "a" },
      title: "One prompt in.<br>Two models out.",
      prompts: [
        "A barista pours steamed milk into a latte, forming a rosetta. Macro, slow push-in, warm window light.",
        "A street dancer spins into a freeze on wet asphalt at night. Neon reflections, handheld orbit.",
        "A red vintage convertible on a cliffside road at sunset. Drone tracks behind, then rises. Gulls cross frame.",
      ] },
    { type: "result", kicker: "Round 01 · Liquid physics",
      title: "The latte pour.",
      caption: "Frame at 3.0 s. Swipe for the notes." },
    { type: "notes", kicker: "Round 01 · Notes",
      title: "Placeholder: one-line verdict goes here.",
      rows: [
        { label: "Motion realism", a: { note: "Short note from watching the clip.", score: 4 }, b: { note: "Short note from watching the clip.", score: 3 } },
        { label: "Visual quality", a: { note: "Short note from watching the clip.", score: 3 }, b: { note: "Short note from watching the clip.", score: 4 } },
        { label: "Prompt following", a: { note: "Which prompt details landed or got dropped.", score: 4 }, b: { note: "Which prompt details landed or got dropped.", score: 4 } },
      ] },
    { type: "score", kicker: "Scoreboard", title: "Three rounds, tallied.",
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
      cta: "Comment “CLASH” and I’ll send all three prompts." },
  ],
};
