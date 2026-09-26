#!/usr/bin/env node
// Builds index.html (the master timeline) from STORYBOARD.md.
// Each `## Frame N` becomes a sub-composition clip on the scene track; the voiceover
// sits on its own audio track. Frames whose src file is missing get an outline
// placeholder so the timeline previews end to end before every scene is built.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1080;
const H = 1920;
const TOTAL = 60.5;

const TRACK = { scenes: 0, captions: 1, overlays: 2, texture: 3, vo: 4, sfx: 5, music: 6 };

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

const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="assets/vendor/gsap.min.js"></script>
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

      <!-- Track ${TRACK.vo}: voiceover -->
      <audio
        id="vo"
        src="assets/audio/vo.mp3"
        data-start="0"
        data-duration="${TOTAL}"
        data-track-index="${TRACK.vo}"
        data-volume="1"
      ></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

writeFileSync(join(ROOT, "index.html"), index);
console.log(`index.html: ${frames.length} scenes, ${TOTAL}s`);
