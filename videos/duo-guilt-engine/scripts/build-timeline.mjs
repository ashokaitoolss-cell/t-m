#!/usr/bin/env node
// Builds index.html (the master timeline) from STORYBOARD.md.
// Each `## Frame N` becomes a sub-composition clip on the scene track; the voiceover
// sits on its own audio track. Frames whose src file is missing get an outline
// placeholder so the timeline previews end to end before every scene is built.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { scenes } = await import("../data/scenes.mjs");
const { cues } = await import("../data/sfx.mjs");
const W = 1080;
const H = 1920;
const TOTAL = 60.5;

// Studio lanes: scenes, captions, voiceover, then as many SFX lanes as overlaps need, then music.
const TRACK = { scenes: 0, captions: 1, vo: 2, sfx: 3 };

function parseFrames(md) {
  const frames = [];
  for (const block of md.split(/^## Frame /m).slice(1)) {
    const [heading, ...rest] = block.split("\n");
    const [, num, title] = heading.match(/^(\d+)\s+—\s+(.*)$/) || [];
    const meta = {};
    for (const line of rest) {
      const m = line.match(/^- ([a-z_]+): (.*)$/);
      if (m) meta[m[1]] = m[2].trim();
    }
    frames.push({
      num: Number(num),
      title,
      start: Number(meta.start),
      duration: parseFloat(meta.duration),
      scene: meta.scene || "",
      voiceover: (meta.voiceover || "").replace(/^"|"$/g, ""),
      src: meta.src,
    });
  }
  return frames;
}

// Sub-compositions are linted per file, so each one declares the fonts it uses.
// URLs are project-root relative: the assembler inlines frame styles into index.html.
export const FONT_FACES = `@font-face {
          font-family: "Instrument Serif";
          font-style: normal;
          font-weight: 400;
          src: url("assets/fonts/InstrumentSerif-Regular.woff2") format("woff2");
        }
        @font-face {
          font-family: "Instrument Serif";
          font-style: italic;
          font-weight: 400;
          src: url("assets/fonts/InstrumentSerif-Italic.woff2") format("woff2");
        }`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const compId = (f) => `f${String(f.num).padStart(2, "0")}`;

function outlineFrame(f) {
  const id = compId(f);
  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>
        ${FONT_FACES}
        #root {
          position: absolute;
          inset: 0;
          background: #e9e4d8;
          color: #1d1b17;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 36px;
          padding: 0 110px;
          text-align: center;
        }
        #${id}-num {
          font-family: "Instrument Serif", serif;
          font-size: 40px;
          letter-spacing: 0.12em;
          opacity: 0.55;
        }
        #${id}-vo {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          font-size: 64px;
          line-height: 1.1;
        }
        #${id}-scene {
          font-family: "Instrument Serif", serif;
          font-size: 36px;
          line-height: 1.3;
          opacity: 0.6;
        }
      </style>
      <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
        <div id="${id}-num">SCENE ${String(f.num).padStart(2, "0")} · OUTLINE</div>
        <div id="${id}-vo">${esc(f.voiceover)}</div>
        <div id="${id}-scene">${esc(f.scene)}</div>
      </div>
      <script>
        const tl = gsap.timeline({ paused: true });
        tl.fromTo("#${id}-vo", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0);
        window.__timelines["${id}"] = tl;
      </script>
    </template>
  </body>
</html>
`;
}

const frames = parseFrames(readFileSync(join(ROOT, "STORYBOARD.md"), "utf8"));
for (let i = 0; i < frames.length; i++) {
  const f = frames[i];
  const next = frames[i + 1];
  const end = next ? next.start : TOTAL;
  if (Math.abs(f.start + f.duration - end) > 0.011) {
    throw new Error(`Frame ${f.num}: start ${f.start} + ${f.duration} != next start ${end}`);
  }
  const path = join(ROOT, f.src);
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, outlineFrame(f));
  }
}

const sceneHosts = frames
  .map(
    (f) =>
      `      <div id="${compId(f)}-host" class="clip scene" data-composition-id="${compId(f)}" data-composition-src="${f.src}" data-start="${f.start.toFixed(2)}" data-duration="${f.duration.toFixed(2)}" data-track-index="${TRACK.scenes}" data-width="${W}" data-height="${H}" data-label="${esc(`${String(f.num).padStart(2, "0")} ${f.title}`)}"></div>`,
  )
  .join("\n");

// SFX clips: the cue sheet plus the user's keyboard recording, cut per typing moment
// by scripts/prep-typing.mjs (paper-card typewriter reveals and the phone notification).
// Library cuts (scripts/prep-sfx.py) carry a lead: seconds from clip start to the sound's
// peak. Starting the clip that much early puts the peak of a whoosh or riser on the beat.
const picks = JSON.parse(readFileSync(join(ROOT, "data/sfx-picks.json"), "utf8")).picks;
const sfx = cues.map(([t, name, gain, note]) => ({
  t: Math.max(0, Math.round((t - (picks[name]?.lead ?? 0)) * 1000) / 1000),
  name,
  gain,
  note,
}));
const typing = JSON.parse(readFileSync(join(ROOT, "data/typing.json"), "utf8"));
for (const c of typing) sfx.push({ t: c.t, name: c.file.replace(/\.wav$/, ""), gain: 0.55, note: `typing (${c.label})` });
sfx.sort((a, b) => a.t - b.t);
// 16-bit mono 48 kHz WAVs with a 44-byte header (scripts/synth-sfx.py, scripts/prep-sfx.py).
const wavSeconds = (name) => (statSync(join(ROOT, `assets/sfx/${name}.wav`)).size - 44) / (48000 * 2);
const laneEnds = [];
for (const c of sfx) {
  c.dur = Math.round(wavSeconds(c.name) * 1000) / 1000;
  let lane = laneEnds.findIndex((end) => end <= c.t + 1e-6);
  if (lane < 0) lane = laneEnds.push(0) - 1;
  laneEnds[lane] = c.t + c.dur;
  c.lane = TRACK.sfx + lane;
}
TRACK.music = TRACK.sfx + laneEnds.length;
const sfxClips = sfx
  .map(
    (c, i) =>
      `      <audio id="sfx-${String(i + 1).padStart(3, "0")}" src="assets/sfx/${c.name}.wav" data-audio-group="sfx" data-start="${c.t.toFixed(3)}" data-duration="${c.dur}" data-track-index="${c.lane}" data-volume="${c.gain}" data-label="${esc(c.note)}"></audio>`,
  )
  .join("\n");

const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/vendor/scenekit.js"></script>
    <style>
      @font-face {
        font-family: "Instrument Serif";
        font-style: normal;
        font-weight: 400;
        src: url("assets/fonts/InstrumentSerif-Regular.woff2") format("woff2");
      }
      @font-face {
        font-family: "Instrument Serif";
        font-style: italic;
        font-weight: 400;
        src: url("assets/fonts/InstrumentSerif-Italic.woff2") format("woff2");
      }
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 100 900;
        src: url("assets/fonts/Inter.woff2") format("woff2");
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html,
      body {
        margin: 0;
        width: ${W}px;
        height: ${H}px;
        overflow: hidden;
        background: #0c0b0a;
      }
      #root {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #0c0b0a;
      }
      .clip {
        position: absolute;
        inset: 0;
      }
      .scene {
        z-index: 1;
      }
      .captions {
        z-index: 5;
      }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="${TOTAL}"
      data-width="${W}"
      data-height="${H}"
    >
      <!-- Track ${TRACK.scenes}: scenes, one sub-composition per spoken phrase (generated from STORYBOARD.md) -->
${sceneHosts}

      <!-- Track ${TRACK.captions}: captions, one track for the whole video (generated by scripts/build-scenes.mjs) -->
      <div id="captions-host" class="clip captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-track-kind="captions" data-start="0" data-duration="${TOTAL}" data-track-index="${TRACK.captions}" data-width="${W}" data-height="${H}" data-label="Captions"></div>

      <!-- Track ${TRACK.vo}: voiceover -->
      <audio id="vo" src="assets/audio/vo.mp3" data-audio-group="voiceover" data-start="0" data-duration="${TOTAL}" data-track-index="${TRACK.vo}" data-volume="1" data-label="Voiceover"></audio>

      <!-- Tracks ${TRACK.sfx}-${TRACK.music - 1}: sound effects, one per visual event (data/sfx.mjs) -->
${sfxClips}

      <!-- Track ${TRACK.music}: low, bassy bed (drops out on the paper-card turns) -->
      <audio id="bed" src="assets/audio/bed.wav" data-audio-group="music" data-start="0" data-duration="${TOTAL}" data-track-index="${TRACK.music}" data-volume="0.55" data-label="Music bed"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

writeFileSync(join(ROOT, "index.html"), index);
console.log(`index.html: ${frames.length} scenes, ${sfx.length} sfx clips, ${TOTAL}s`);
