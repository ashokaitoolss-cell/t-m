#!/usr/bin/env node
// Cuts the user's keyboard recording (assets/sfx/src/typing.mp3) into one clip per typing
// moment: the paper-card typewriter reveals and the phone notification. Each clip starts
// on a keystroke, is sped up (pitch-preserved) toward the on-screen typing rate, lasts
// exactly as long as the text takes to type, and fades out. Different moments use
// different stretches of the take so they don't sound identical.
// Writes assets/sfx/typing-NN.wav and data/typing.json (read by build-timeline.mjs).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scenes } from "../data/scenes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "assets/sfx/src/typing.mp3");
const SR = 48000;
const CPS = 28; // on-screen typing rate
const RATE = 1.35; // speed-up applied to the recording
const TAIL = 0.07;

// Typing moments: [start time, characters typed, label].
const moments = [];
for (const sc of scenes) {
  for (const chunk of sc.card || []) {
    moments.push({ t: chunk.t, n: [...chunk.text.replace(/[{}]/g, "")].length, label: `card ${sc.num}` });
  }
  if (sc.notification) {
    moments.push({ t: sc.notification.t2, n: [...sc.notification.line2].length, label: "notification" });
  }
}

// Decode to mono float and find keystroke onsets.
const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", SRC, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], {
  maxBuffer: 1 << 28,
});
const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4);
const hop = Math.round(SR * 0.004);
const env = [];
for (let i = 0; i + hop <= x.length; i += hop) {
  let m = 0;
  for (let j = i; j < i + hop; j++) m = Math.max(m, Math.abs(x[j]));
  env.push(m);
}
const peak = Math.max(...env);
// A keystroke is a sharp rise over the recent average, at least 45 ms after the last one.
const onsets = [];
let last = -1;
for (let k = 10; k < env.length; k++) {
  let avg = 0;
  for (let j = k - 10; j < k; j++) avg += env[j];
  avg /= 10;
  const t = (k * hop) / SR;
  if (env[k] > peak * 0.08 && env[k] > avg * 2.2 && t - last > 0.045) {
    onsets.push(t);
    last = t;
  }
}
const typingEnd = onsets[onsets.length - 1];

// Spread the moments across the take: pick onsets far apart that leave enough typing after them.
const out = [];
let cursor = 0;
moments.forEach((m, i) => {
  const dur = Math.round((m.n / CPS + TAIL) * 1000) / 1000;
  const need = dur * RATE;
  const usable = onsets.filter((o) => o + need <= typingEnd + 0.05);
  const start = usable[Math.floor((cursor * usable.length) / moments.length) % usable.length];
  cursor += 1;
  const file = `typing-${String(i + 1).padStart(2, "0")}.wav`;
  // Peak-match every slice (to about -4 dBFS) so the typing sits evenly under the voice.
  let slicePeak = 1e-6;
  for (let j = Math.floor(start * SR); j < Math.min(x.length, Math.floor((start + need) * SR)); j++) slicePeak = Math.max(slicePeak, Math.abs(x[j]));
  const gain = Math.min(8, 0.63 / slicePeak);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-ss", start.toFixed(4), "-t", (need + 0.1).toFixed(4), "-i", SRC,
    "-af", `atempo=${RATE},atrim=0:${dur},asetpts=N/SR/TB,afade=t=in:d=0.004,afade=t=out:st=${(dur - 0.06).toFixed(3)}:d=0.06,volume=${gain.toFixed(3)}`,
    "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", join(ROOT, "assets/sfx", file),
  ]);
  out.push({ t: m.t, file, dur, source_start: Math.round(start * 1000) / 1000, label: m.label });
});

writeFileSync(join(ROOT, "data/typing.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`typing: ${out.length} clips from ${onsets.length} keystrokes`);
