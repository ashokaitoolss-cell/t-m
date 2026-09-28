// Build index.html from src/index.html:
//  - inline assets/timeline.js (HyperFrames lint reads inline scripts for the registration);
//  - add the score and every sound cue (data/cues.mjs) as timed <audio> clips, each starting
//    early by its measured lead (data/sfx-leads.json) and packed onto as few lanes as fit.
// Edit src/index.html, assets/timeline.js and data/cues.mjs — never index.html.
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const TOTAL = 38.4;
const html = readFileSync(root + "src/index.html", "utf8");
const js = readFileSync(root + "assets/timeline.js", "utf8");
const { cues } = await import(root + "data/cues.mjs");
const leads = JSON.parse(readFileSync(root + "data/sfx-leads.json", "utf8"));

const clips = cues
  .map(([t, name, gain, note]) => {
    const L = leads[name];
    if (!L) throw new Error(`no sound "${name}"`);
    const lead = typeof L.lead === "number" ? L.lead : 0;
    const start = Math.max(0, Math.round((t - lead) * 1000) / 1000);
    return { start, dur: Math.min(L.dur, TOTAL - start), name, gain, note };
  })
  .filter((c) => c.dur > 0.01)
  .sort((a, b) => a.start - b.start);

const laneEnds = [];
for (const c of clips) {
  let lane = laneEnds.findIndex((end) => end <= c.start + 1e-6);
  if (lane < 0) lane = laneEnds.push(0) - 1;
  laneEnds[lane] = c.start + c.dur;
  c.lane = 5 + lane;
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const audio = [
  `      <audio id="music" src="assets/audio/music.wav" data-audio-group="music" data-start="0" data-duration="${TOTAL}" data-track-index="4" data-volume="0.8" data-label="Score (composed in code)"></audio>`,
  ...clips.map(
    (c, i) =>
      `      <audio id="sfx-${String(i + 1).padStart(3, "0")}" src="assets/sfx/${c.name}.wav" data-audio-group="sfx" data-start="${c.start.toFixed(3)}" data-duration="${c.dur.toFixed(3)}" data-track-index="${c.lane}" data-volume="${c.gain}" data-label="${esc(c.note || c.name)}"></audio>`,
  ),
].join("\n");

let out = html.replace('<script src="assets/timeline.js"></script>', `<script>\n${js}\n</script>`);
if (out === html) throw new Error("timeline.js script tag not found");
const marker = "      <!-- audio -->";
if (!out.includes(marker)) throw new Error("audio marker not found");
out = out.replace(marker, `      <!-- audio: score + ${clips.length} sound cues from data/cues.mjs -->\n${audio}`);
writeFileSync(root + "index.html", out);
// The same resolved cues for scripts/mix.py, which remixes the audio without a video re-render.
writeFileSync(
  root + "data/cues.json",
  JSON.stringify({ total: TOTAL, music: { src: "assets/audio/music.wav", gain: 0.8 }, clips: clips.map(({ start, dur, name, gain }) => ({ start, dur, name, gain })) }, null, 1) + "\n",
);
console.log(`index.html built: ${clips.length} sfx on ${laneEnds.length} lanes`);
