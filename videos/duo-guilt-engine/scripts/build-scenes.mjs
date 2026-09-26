#!/usr/bin/env node
// Generates every scene sub-composition (compositions/frames/NN-slug.html) and the
// caption track (compositions/captions.html) from data/scenes.mjs.
// Re-run after editing a spec; the generated files are not hand-edited.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scenes } from "../data/scenes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1080;
const H = 1920;
const TOTAL = 60.5;
const r3 = (v) => Math.round(v * 1000) / 1000;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pad = (n) => String(n).padStart(2, "0");

// Measurements of the real plates (scripts/analyze-plates.py). Absent until the plates
// have been downloaded and analysed; the specs' own positions are used meanwhile.
const LAYOUT_PATH = join(ROOT, "data/layout.json");
const LAYOUT = existsSync(LAYOUT_PATH) ? JSON.parse(readFileSync(LAYOUT_PATH, "utf8")) : {};
// Hand-checked corrections (data/layout-overrides.json) win over the automatic measurements.
const OVERRIDES_PATH = join(ROOT, "data/layout-overrides.json");
if (Object.keys(LAYOUT).length && existsSync(OVERRIDES_PATH)) {
  for (const [key, fix] of Object.entries(JSON.parse(readFileSync(OVERRIDES_PATH, "utf8")))) {
    if (!key.startsWith("_")) LAYOUT[key] = { ...(LAYOUT[key] || {}), ...fix };
  }
}

const FONTS = `@font-face { font-family: "Instrument Serif"; font-style: normal; font-weight: 400; src: url("assets/fonts/InstrumentSerif-Regular.woff2") format("woff2"); }
        @font-face { font-family: "Instrument Serif"; font-style: italic; font-weight: 400; src: url("assets/fonts/InstrumentSerif-Italic.woff2") format("woff2"); }
        @font-face { font-family: "Caveat"; font-style: normal; font-weight: 700; src: url("assets/fonts/Caveat-700-latin.woff2") format("woff2"); }
        @font-face { font-family: "Inter"; font-style: normal; font-weight: 100 900; src: url("assets/fonts/Inter.woff2") format("woff2"); }`;

const SCENE_CSS = `.sk-cam, .sk-ov { position: absolute; inset: 0; }
        .sk-plane { position: absolute; inset: 0; will-change: transform; }
        .sk-img { position: absolute; left: -54px; top: -96px; width: 1188px; height: 2112px; object-fit: cover; }
        .sk-fg { position: absolute; left: 0; width: 820px; height: auto; }
        .sk-svg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; }
        .marker { fill: none; stroke-width: 11px; stroke-linecap: round; stroke-linejoin: round; }
        .marker.thin { stroke-width: 6px; }
        .chalk { fill: none; stroke-width: 11px; stroke-linecap: round; stroke-linejoin: round; opacity: 0.88; }
        .sk-glint { position: absolute; left: 0; top: 0; width: 48px; height: 48px; opacity: 0; filter: drop-shadow(0 0 6px #fffdf2) drop-shadow(0 0 16px rgba(255, 246, 214, 0.9)); }
        .sk-glint i { position: absolute; inset: 0; background: #fffdf4; clip-path: polygon(50% 0%, 57% 43%, 100% 50%, 57% 57%, 50% 100%, 43% 57%, 0% 50%, 43% 43%); }
        .tw { opacity: 0; display: inline-block; }
        .tw.sp { width: 0.26em; }
        .noti { position: absolute; display: flex; gap: 22px; align-items: flex-start; padding: 24px 26px; border-radius: 34px; background: rgba(248, 247, 243, 0.95); box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38); font-family: "Inter", sans-serif; color: #141414; opacity: 0; }
        .noti-icon { width: 84px; height: 84px; border-radius: 20px; background: #58cc02; flex: none; overflow: hidden; display: flex; align-items: flex-end; justify-content: center; }
        .noti-icon img { width: 76px; height: auto; margin-bottom: -6px; }
        .noti-body { flex: 1; min-width: 0; }
        .noti-top { display: flex; justify-content: space-between; font-size: 26px; font-weight: 500; color: #6b6b6b; }
        .noti-app { color: #141414; font-weight: 700; }
        .noti-l1 { font-size: 32px; font-weight: 700; margin-top: 4px; }
        .noti-l2 { font-size: 30px; font-weight: 500; line-height: 1.25; margin-top: 2px; white-space: normal; }
        .noti-l2 .tw { display: inline; }
        .screen { position: absolute; overflow: hidden; background: linear-gradient(180deg, #2c3b2d, #0f1611); }
        .screen-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 62%, rgba(150, 215, 95, 0.4), transparent 62%); }
        .dancer { position: absolute; left: 15%; bottom: 20%; width: 70%; height: auto; }
        .screen-rail { position: absolute; right: 20px; bottom: 24%; display: flex; flex-direction: column; gap: 26px; }
        .screen-rail i { display: block; width: 46px; height: 46px; border-radius: 50%; background: rgba(255, 255, 255, 0.85); }
        .screen-caption { position: absolute; left: 24px; right: 110px; bottom: 44px; }
        .screen-caption b { display: block; height: 14px; margin-top: 12px; border-radius: 7px; background: rgba(255, 255, 255, 0.72); }
        .screen-caption b + b { width: 60%; }
        .heart { position: absolute; top: 0; width: 64px; height: 60px; opacity: 0; }
        .heart path { fill: #ff4b6e; }
        .card-line { position: absolute; left: 0; top: 896px; width: 1080px; text-align: center; font-family: "Instrument Serif", serif; font-size: 54px; line-height: 1.2; color: #1d1b17; white-space: nowrap; }
        .kw { display: inline-block; position: relative; transform-origin: 50% 58%; }
        .uline { position: absolute; left: -4%; bottom: -0.26em; width: 108%; height: 0.5em; overflow: visible; }
        .uline path { fill: none; stroke: #f2c230; stroke-width: 10px; stroke-linecap: round; vector-effect: non-scaling-stroke; }
        .bubble { position: absolute; inset: 0; opacity: 0; }
        .bubble-svg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.3)); }
        .bubble-svg path, .bubble-svg circle { fill: #f7f4ec; stroke: #2a2622; stroke-width: 4px; }
        .bubble img { position: absolute; width: 124px; height: auto; }
        .obj { position: absolute; filter: drop-shadow(18px 28px 18px rgba(40, 30, 20, 0.35)); }
        .obj img { width: 100%; height: 100%; }
        .polaroid { position: absolute; background: #f6f3ea; padding: 34px 34px 0; box-shadow: 0 30px 50px rgba(30, 20, 10, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2); }
        .polaroid img { display: block; width: 100%; height: auto; }
        .pol-note { height: 170px; line-height: 170px; text-align: center; font-family: "Caveat", cursive; font-weight: 700; font-size: 64px; color: #2b2622; transform: rotate(-2deg); }
        .scrawl { position: absolute; font-family: "Caveat", cursive; font-weight: 700; white-space: nowrap; line-height: 1; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45); }
        .flash { position: absolute; inset: 0; opacity: 0; background: radial-gradient(circle at 50% 42%, #fffaf0, rgba(255, 250, 240, 0.55)); }`;

// ---------------------------------------------------------------- hand-drawn paths
function rng(seed) {
  let s = seed;
  return () => {
    const x = Math.sin(s++ * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
}

// Catmull-Rom through points -> cubic Bezier path.
function smoothPath(pts) {
  let d = `M ${r3(pts[0][0])} ${r3(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${r3(c1[0])} ${r3(c1[1])}, ${r3(c2[0])} ${r3(c2[1])}, ${r3(p2[0])} ${r3(p2[1])}`;
  }
  return d;
}

// A marker loop that overshoots its start, like a quick circle drawn by hand.
function wobblyEllipse(cx, cy, rx, ry, seed) {
  const rand = rng(seed);
  const pts = [];
  const start = -2.2 + rand() * 0.4;
  const turns = 1.12;
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const th = start + (i / n) * Math.PI * 2 * turns;
    const k = 1 + 0.05 * Math.sin(3 * th + seed) + (rand() - 0.5) * 0.04 + (i / n) * 0.06;
    pts.push([cx + Math.cos(th) * rx * k, cy + Math.sin(th) * ry * k]);
  }
  return smoothPath(pts);
}

function wobblyLine(x0, y0, x1, y1, seed, bow = 0.06) {
  const rand = rng(seed);
  const pts = [];
  const n = 6;
  const nx = -(y1 - y0);
  const ny = x1 - x0;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const b = Math.sin(u * Math.PI) * bow + (rand() - 0.5) * 0.015;
    pts.push([x0 + (x1 - x0) * u + nx * b, y0 + (y1 - y0) * u + ny * b]);
  }
  return smoothPath(pts);
}

function arrowHead(x, y, angDeg, len = 46) {
  const a = (angDeg * Math.PI) / 180;
  const l = [x - Math.cos(a - 0.5) * len, y - Math.sin(a - 0.5) * len];
  const r = [x - Math.cos(a + 0.5) * len, y - Math.sin(a + 0.5) * len];
  return `M ${r3(l[0])} ${r3(l[1])} L ${x} ${y} L ${r3(r[0])} ${r3(r[1])}`;
}

// Thought cloud: overlapping lobes around an ellipse, as one path.
function cloudPath(cx, cy, rx, ry, seed) {
  const rand = rng(seed);
  const lobes = 9;
  let d = "";
  const pts = [];
  for (let i = 0; i < lobes; i++) {
    const th = (i / lobes) * Math.PI * 2;
    pts.push([cx + Math.cos(th) * rx, cy + Math.sin(th) * ry]);
  }
  d = `M ${r3(pts[0][0])} ${r3(pts[0][1])}`;
  for (let i = 0; i < lobes; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % lobes];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const out = 0.62 + rand() * 0.25;
    const qx = mx + (mx - cx) * out;
    const qy = my + (my - cy) * out;
    d += ` Q ${r3(qx)} ${r3(qy)}, ${r3(b[0])} ${r3(b[1])}`;
  }
  return d + " Z";
}

// ---------------------------------------------------------------- pin specs to the plates
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const centre = (b) => [Math.round((b[0] + b[2]) / 2), Math.round((b[1] + b[3]) / 2)];

function applyLayout(sc0) {
  const sc = structuredClone(sc0);
  const L = sc.kind === "plate" ? LAYOUT[sc.plate] : null;
  if (!L) return sc;
  const subj = L.subject;
  const anchors = {
    subject: subj && [centre(subj)[0], Math.round(subj[1] + (subj[3] - subj[1]) * 0.35)],
    duo: L.duo && L.duo.c,
    glow: L.glow && L.glow.c,
    face: L.face,
    brass: L.brass && L.brass.c,
    blue: L.blue && L.blue.c,
    screen: L.screen && centre(L.screen.bbox),
  };
  const boxes = { duo: L.duo && L.duo.bbox, glow: L.glow && L.glow.bbox, brass: L.brass && L.brass.bbox, blue: L.blue && L.blue.bbox, subject: subj };

  if (sc.focusAnchor && anchors[sc.focusAnchor]) sc.focus = anchors[sc.focusAnchor];
  else if (anchors.subject) sc.focus = anchors.subject;
  for (const c of sc.captions || []) {
    if (c.lockY) continue;
    if (L.caption_y) c.y = L.caption_y;
    if (L.caption_x) c.x = L.caption_x;
    if (L.caption_ink) c.ink = L.caption_ink;
  }

  for (const o of sc.overlays || []) {
    const a = o.at && anchors[o.at === "subject-right" ? "subject" : o.at];
    const b = o.at && boxes[o.at === "subject-right" ? "subject" : o.at];
    if (!a) continue;
    if (o.type === "circle" || o.type === "buzz") {
      o.x = a[0];
      o.y = a[1];
      if (o.type === "circle" && b) {
        o.rx = clamp((b[2] - b[0]) / 2 + 70, 110, 320);
        o.ry = clamp((b[3] - b[1]) / 2 + 60, 90, 300);
      }
    } else if (o.type === "x") {
      o.x = a[0];
      o.y = a[1];
      if (b) o.size = o.at === "blue" ? clamp(Math.min(b[2] - b[0], b[3] - b[1]) * 0.8, 360, 760) : clamp(Math.max(b[2] - b[0], b[3] - b[1]) + 80, 220, 520);
    } else if (o.type === "arrow" && o.at === "face") {
      const hx = a[0] - 95, hy = a[1] + 75;
      const tx = clamp(a[0] - 340, 110, 700), ty = clamp(a[1] + 420, 400, 1500);
      o.d = `M ${tx} ${ty} C ${tx + 40} ${ty - 150}, ${hx - 130} ${hy + 70}, ${hx} ${hy}`;
      o.head = [hx, hy, Math.round((Math.atan2(-70, 130) * 180) / Math.PI)];
      sc._tail = [tx, ty];
    } else if (o.type === "arrow" && o.at === "subject-right" && b) {
      const x = clamp(b[2] + 55, 140, 990);
      const y0 = clamp(b[3] - 160, 500, 1600), y1 = clamp(b[1] + 110, 260, y0 - 300);
      o.d = `M ${x - 25} ${y0} C ${x + 10} ${y0 - 180}, ${x - 30} ${y1 + 200}, ${x + 30} ${y1}`;
      o.head = [x + 30, y1, -78];
    } else if (o.type === "scrawl" && o.at === "face" && sc._tail) {
      o.x = clamp(sc._tail[0] - 120, 40, 700);
      o.y = clamp(sc._tail[1] + 20, 300, 1560);
    }
  }

  if (sc.notification && sc.notification.at === "screen" && L.screen) {
    const [x0, y0, x1] = L.screen.bbox;
    sc.notification.w = clamp(x1 - x0 - 36, 380, 620);
    sc.notification.x = Math.round((x0 + x1) / 2);
    sc.notification.y = y0 + 40;
  }
  if (sc.screen && sc.screen.at === "screen" && L.screen) {
    const [x0, y0, x1, y1] = L.screen.bbox;
    Object.assign(sc.screen, { x: Math.round((x0 + x1) / 2), y: Math.round((y0 + y1) / 2), w: x1 - x0, h: y1 - y0, r: Math.round(Math.min(48, (x1 - x0) * 0.09)) });
    sc.heartsTop = y1 - 240;
    (sc.hearts || []).forEach((h, i) => (h.x = x1 - 150 + [0, -40, 20, -25, 10][i % 5]));
  }
  if (sc.bubbles && L.heads && L.heads.length) {
    sc.bubbles.forEach((bb, i) => {
      const hd = L.heads[Math.min(i, L.heads.length - 1)];
      if (i >= L.heads.length) return;
      bb.x = clamp(hd[0], 215, 865);
      bb.y = clamp(hd[1] - 250, 250, 1500);
      bb.tail = [hd[0] + 10, hd[1] - 45];
    });
  }
  for (const g of sc.glints || []) {
    const b = g.near && boxes[g.near];
    if (!b) continue;
    const k = (sc.glints.indexOf(g) * 5 + sc.num) % 4;
    const pts = [[b[2] + 10, b[1] + 20], [b[0] - 10, (b[1] + b[3]) / 2], [b[2] - 20, b[3] - 30], [b[0] + 30, b[1] - 10]];
    g.x = Math.round(clamp(pts[k][0], 60, 1020));
    g.y = Math.round(clamp(pts[k][1], 140, 1780));
  }
  return sc;
}

// ---------------------------------------------------------------- scene builders
function localize(keys, start) {
  return (keys || []).map((k) => ({ ...k, t: r3(k.t - start) }));
}

function sceneHtml(spec) {
  const sc = applyLayout(spec);
  const id = `f${pad(spec.num)}`;
  const L = (t) => r3(t - sc.start);
  const dur = r3(sc.end - sc.start);
  const planes = [];
  const puppets = [];
  const breathe = [];
  const cam = [];
  const ov = []; // annotation layer: rides the camera so marks stay pinned to the picture
  const screenOv = []; // screen-space: flashes (glints are added here by scenekit)
  const build = [];

  const bgSrc =
    sc.kind === "plate" ? `assets/scene/${sc.plate}-bg.jpg` : "assets/scene/paper.jpg";
  // Far plane, then (when the plate has distinct layers) a midground cut from it by depth.
  // Parallax speeds follow the guide: far 0.3x, midground ~0.55x, subject 1x, foreground ~2x.
  const hasMid = sc.kind === "plate" && existsSync(join(ROOT, `assets/scene/${sc.plate}-mid.png`));
  cam.push(`<div id="${id}-bgp" class="sk-plane"><img class="sk-img" src="${bgSrc}" alt="" /></div>`);
  planes.push({ id: `${id}-bgp`, depth: sc.kind !== "plate" ? 1 : sc.cut ? 0.3 : 0.5 });
  if (hasMid) {
    cam.push(`<div id="${id}-midp" class="sk-plane"><img class="sk-img" src="assets/scene/${sc.plate}-mid.png" alt="" /></div>`);
    planes.push({ id: `${id}-midp`, depth: sc.cut ? 0.55 : 0.85 });
  }

  if (sc.kind === "plate" && sc.cut) {
    cam.push(`<div id="${id}-subp" class="sk-plane"><img id="${id}-sub" class="sk-img" src="assets/scene/${sc.plate}-sub.png" alt="" /></div>`);
    planes.push({ id: `${id}-subp`, depth: 1 });
    if (sc.puppet) puppets.push({ id: `${id}-sub`, origin: sc.puppet.origin, keys: localize(sc.puppet.keys, sc.start) });
    if (sc.breathe) breathe.push({ id: `${id}-sub` });

  } else if (sc.kind === "plate" && sc.puppet) {
    puppets.push({ id: `${id}-bgp`, origin: sc.puppet.origin, keys: localize(sc.puppet.keys, sc.start) });
  }

  // Layer nearer than the subject (e.g. the crowd in front of giant Duo): above it, faster.
  if (sc.kind === "plate" && existsSync(join(ROOT, `assets/scene/${sc.plate}-front.png`))) {
    cam.push(`<div id="${id}-frontp" class="sk-plane"><img class="sk-img" src="assets/scene/${sc.plate}-front.png" alt="" /></div>`);
    planes.push({ id: `${id}-frontp`, depth: 1.35 });
  }

  // Phone notification (rides the camera with the phone).
  if (sc.notification) {
    const n = sc.notification;
    const chars = [...n.line2].map((ch, i) => `<span id="${id}-n${i}" class="tw">${esc(ch)}</span>`).join("");
    cam.push(`<div id="${id}-notip" class="sk-plane"><div id="${id}-noti" class="noti" style="left:${n.x - n.w / 2}px;top:${n.y}px;width:${n.w}px">
          <div class="noti-icon"><img src="assets/scene/duo.png" alt="" /></div>
          <div class="noti-body"><div class="noti-top"><span class="noti-app">${esc(n.title)}</span><span class="noti-time">now</span></div>
          <div class="noti-l1">${esc(n.line1)}</div><div class="noti-l2">${chars}</div></div></div></div>`);
    planes.push({ id: `${id}-notip`, depth: 1 });
    build.push(`tl.fromTo("#${id}-noti", { y: -150, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.36, ease: "back.out(1.7)", immediateRender: false }, ${L(n.t)});`);
    [...n.line2].forEach((_, i) => build.push(`tl.set("#${id}-n${i}", { opacity: 1 }, ${r3(L(n.t2) + i / 28)});`));
  }

  // Vertical video playing on a phone screen.
  if (sc.screen) {
    const s = sc.screen;
    cam.push(`<div id="${id}-scrp" class="sk-plane"><div class="screen" style="left:${s.x - s.w / 2}px;top:${s.y - s.h / 2}px;width:${s.w}px;height:${s.h}px;border-radius:${s.r}px">
          <div class="screen-glow"></div><img id="${id}-dancer" class="dancer" src="assets/scene/duo.png" alt="" />
          <div class="screen-rail"><i></i><i></i><i></i><i></i></div><div class="screen-caption"><b></b><b></b></div></div></div>`);
    planes.push({ id: `${id}-scrp`, depth: 1 });
    const keys = [];
    for (let t = 0; t <= dur + 0.001; t += 0.2) {
      const beat = Math.round(t / 0.2) % 4;
      keys.push({ t: r3(t), r: [-9, 0, 9, 0][beat], y: [0, -26, 0, -26][beat], ease: "power2.out" });
    }
    puppets.push({ id: `${id}-dancer`, origin: "50% 100%", keys });
  }

  // Foreground passer-by crossing the lens (heavily blurred, fastest plane).
  if (sc.fg) {
    const f = sc.fg;
    cam.push(`<div id="${id}-fgp" class="sk-plane"><img id="${id}-fg" class="sk-fg" src="assets/scene/${f.img}.png" alt="" style="top:${f.y}px;transform-origin:0 0" /></div>`);
    planes.push({ id: `${id}-fgp`, depth: 1.8 });
    puppets.push({ id: `${id}-fg`, keys: [
      { t: 0, x: f.x0, s: f.s }, { t: L(f.t0), x: f.x0, s: f.s }, { t: L(f.t1), x: f.x1, s: f.s, ease: "none" },
    ] });
  }

  // Tabletop object on paper (spin in, float, spin out).
  if (sc.kind === "tabletop") {
    const o = sc.object;
    ov.push(`<div id="${id}-objw" class="obj" style="left:${o.x - o.w / 2}px;top:${o.y - o.w / 2}px;width:${o.w}px;height:${o.w}px"><img id="${id}-obj" src="assets/scene/${o.img}.png" alt="" /></div>`);
    build.push(`tl.fromTo("#${id}-objw", { rotation: -210, scale: 0.35, opacity: 0, filter: "blur(14px)" }, { rotation: -6, scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.34, ease: "power3.out", immediateRender: false }, ${L(o.tin)});`);
    build.push(`tl.to("#${id}-objw", { rotation: 170, x: 980, y: -160, scale: 0.8, filter: "blur(12px)", duration: 0.3, ease: "power2.in" }, ${L(o.tout)});`);
    puppets.push({ id: `${id}-obj`, keys: [
      { t: 0, y: 0 }, { t: 0.7, y: -10, ease: "sine.inOut" }, { t: 1.4, y: 4, ease: "sine.inOut" }, { t: 2.2, y: -8, ease: "sine.inOut" },
    ] });
  }

  // Polaroid dropped onto paper.
  if (sc.polaroid) {
    const p = sc.polaroid;
    ov.push(`<div id="${id}-pol" class="polaroid" style="left:${p.x - p.w / 2}px;top:${p.y - p.w * 0.62}px;width:${p.w}px">
          <img src="assets/scene/polaroid-photo.jpg" alt="" /><div class="pol-note">${esc(p.note)}</div></div>`);
    build.push(`tl.fromTo("#${id}-pol", { x: 760, y: -620, rotation: 28, scale: 1.12 }, { x: 0, y: 0, rotation: ${p.rot}, scale: 1, duration: 0.42, ease: "power3.out", immediateRender: false }, ${L(p.t)});`);
    build.push(`tl.fromTo("#${id}-pol", { rotation: ${p.rot} }, { rotation: ${p.rot + 1.4}, duration: 1.4, ease: "sine.inOut", immediateRender: false }, ${r3(L(p.t) + 0.42)});`);
  }

  // Paper card text: one chunk at a time, typed on at ~28 characters per second.
  if (sc.kind === "card") {
    sc.card.forEach((chunk, ci) => {
      const next = sc.card[ci + 1];
      const parts = chunk.text.split(/(\{[^}]+\})/).filter(Boolean);
      let html = "";
      let n = 0;
      parts.forEach((part) => {
        const special = part.startsWith("{");
        const text = special ? part.slice(1, -1) : part;
        const letters = [...text]
          .map((ch) => `<span id="${id}-c${ci}-${n++}" class="tw${ch === " " ? " sp" : ""}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`)
          .join("");
        html += special ? `<span id="${id}-k${ci}" class="kw">${letters}${chunk.underline ? `<svg class="uline" viewBox="0 0 100 24" preserveAspectRatio="none"><path id="${id}-ul" d="M 2 14 C 26 8, 58 18, 98 10 M 94 16 C 66 13, 34 19, 6 17"/></svg>` : ""}</span>` : letters;
      });
      ov.push(`<div id="${id}-card${ci}" class="card-line">${html}</div>`);
      for (let i = 0; i < n; i++) build.push(`tl.set("#${id}-c${ci}-${i}", { opacity: 1 }, ${r3(L(chunk.t) + i / 28)});`);
      if (next) build.push(`tl.set("#${id}-card${ci}", { opacity: 0 }, ${L(next.t)});`);
      if (chunk.flip) build.push(`tl.fromTo("#${id}-k${ci}", { rotation: 0 }, { rotation: 180, duration: 0.34, ease: "back.out(1.6)", immediateRender: false }, ${L(chunk.flip)});`);
      if (chunk.underline) build.push(`kit.draw("${id}-ul", ${L(chunk.underline)}, 0.3);`);
      if (chunk.scatter) sc._scatter = { ci, n, t: L(chunk.scatter), from: [...chunk.text.replace(/[{}]/g, "")].length - [...chunk.text.match(/\{([^}]+)\}/)[1]].length };
    });
  }

  // Hand-drawn overlays (screen space, above the camera).
  const svg = [];
  let seed = sc.num * 13;
  for (const o of sc.overlays || []) {
    seed += 7;
    const cls = o.type === "chalk" ? "chalk" : "marker";
    const color = o.color || "#f3f0e6";
    if (o.type === "circle") {
      svg.push(`<path id="${id}-${o.id}" class="${cls}" stroke="${color}" d="${wobblyEllipse(o.x, o.y, o.rx, o.ry, seed)}"/>`);
      build.push(`kit.draw("${id}-${o.id}", ${L(o.t)}, ${o.dur});`);
    } else if (o.type === "x") {
      const h = o.size / 2;
      svg.push(`<path id="${id}-${o.id}a" class="${cls}" stroke="${color}" d="${wobblyLine(o.x - h, o.y - h, o.x + h, o.y + h, seed, 0.04)}"/>`);
      svg.push(`<path id="${id}-${o.id}b" class="${cls}" stroke="${color}" d="${wobblyLine(o.x + h * 0.95, o.y - h * 1.02, o.x - h * 0.9, o.y + h * 0.97, seed + 3, -0.05)}"/>`);
      build.push(`kit.draw("${id}-${o.id}a", ${L(o.t)}, ${r3(o.dur * 0.5)});`);
      build.push(`kit.draw("${id}-${o.id}b", ${r3(L(o.t) + o.dur * 0.55)}, ${r3(o.dur * 0.5)});`);
    } else if (o.type === "arrow" || o.type === "chalk") {
      svg.push(`<path id="${id}-${o.id}" class="${cls}" stroke="${color}" d="${o.d}"/>`);
      svg.push(`<path id="${id}-${o.id}h" class="${cls}" stroke="${color}" d="${arrowHead(...o.head)}"/>`);
      build.push(`kit.draw("${id}-${o.id}", ${L(o.t)}, ${o.dur});`);
      build.push(`kit.draw("${id}-${o.id}h", ${r3(L(o.t) + o.dur)}, 0.12);`);
    } else if (o.type === "buzz") {
      const arcs = [-1, 1]
        .map((side) =>
          [0, 1]
            .map((k) => {
              const rx = 70 + k * 34;
              const x0 = o.x + side * rx;
              return `M ${x0} ${o.y - 44 - k * 16} Q ${x0 + side * 22} ${o.y}, ${x0} ${o.y + 44 + k * 16}`;
            })
            .join(" "),
        )
        .join(" ");
      svg.push(`<path id="${id}-${o.id}" class="marker thin" stroke="#f3f0e6" d="${arcs}" opacity="0"/>`);
      const steps = Math.round(o.dur * 15);
      for (let s = 0; s < steps; s++) {
        const t = r3(L(o.t) + s / 15);
        build.push(`tl.set("#${id}-${o.id}", { opacity: ${s % 2 ? 0.55 : 1}, x: ${s % 2 ? 3 : -3} }, ${t});`);
      }
      build.push(`tl.set("#${id}-${o.id}", { opacity: 0 }, ${r3(L(o.t) + o.dur)});`);
    } else if (o.type === "scrawl") {
      ov.push(`<div id="${id}-${o.id}" class="scrawl" style="left:${o.x}px;top:${o.y}px;color:${color};font-size:${o.size}px;transform:rotate(${o.rot}deg)">${esc(o.text)}</div>`);
      build.push(`tl.fromTo("#${id}-${o.id}", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: ${o.dur}, ease: "power1.inOut", immediateRender: false }, ${L(o.t)});`);
    }
  }

  // Thought bubbles pinned above heads.
  for (const b of sc.bubbles || []) {
    seed += 5;
    const [tx, ty] = b.tail;
    const dots = [0.35, 0.62].map((u, i) => {
      const x = b.x + (tx - b.x) * (0.55 + u * 0.5);
      const y = b.y + 120 + (ty - b.y - 120) * u;
      return `<circle cx="${r3(x)}" cy="${r3(y)}" r="${16 - i * 6}"/>`;
    });
    ov.push(`<div id="${id}-${b.id}" class="bubble" style="transform-origin:${b.x}px ${b.y + 90}px">
          <svg class="bubble-svg" viewBox="0 0 ${W} ${H}"><path d="${cloudPath(b.x, b.y, 150, 104, seed)}"/>${dots.join("")}</svg>
          <img src="assets/scene/duo.png#${b.id}" alt="" style="left:${b.x - 62}px;top:${b.y - 84}px" /></div>`);
    build.push(`kit.pop("${id}-${b.id}", ${L(b.t)});`);
  }

  // Hearts floating up from a phone screen (stepped); they ride the camera with the phone.
  if (sc.hearts) {
    const hearts = sc.hearts.map((h, i) => `<svg id="${id}-h${i}" class="heart" viewBox="0 0 32 30" style="left:${h.x}px;top:${sc.heartsTop || 1180}px"><path d="M16 29 C 6 21, 0 15, 0 8.5 C 0 3.6, 3.8 0, 8.5 0 C 11.6 0, 14.3 1.7, 16 4.3 C 17.7 1.7, 20.4 0, 23.5 0 C 28.2 0, 32 3.6, 32 8.5 C 32 15, 26 21, 16 29 Z"/></svg>`);
    cam.push(`<div id="${id}-heartp" class="sk-plane">${hearts.join("")}</div>`);
    planes.push({ id: `${id}-heartp`, depth: 1 });
    sc.hearts.forEach((h, i) =>
      puppets.push({ id: `${id}-h${i}`, keys: [
        { t: 0, y: 0, o: 0, s: 0.4 }, { t: L(h.t), y: 0, o: 0, s: 0.4 }, { t: r3(L(h.t) + 0.12), y: -40, o: 1, s: 1.1, ease: "back.out(2)" },
        { t: r3(L(h.t) + 1.0), y: -420, o: 0, s: 0.9, ease: "power1.in" },
      ] }),
    );
  }

  if (sc.flash) {
    screenOv.push(`<div id="${id}-flash" class="flash"></div>`);
    build.push(`tl.fromTo("#${id}-flash", { opacity: 0.92 }, { opacity: 0, duration: ${sc.flash.dur}, ease: "power2.out", immediateRender: false }, ${L(sc.flash.t)});`);
  }

  let onStep = "";
  if (sc._scatter) {
    const s = sc._scatter;
    onStep = `onStep: function (ts, step) {
          var boil = Math.floor(step / 2);
          for (var i = ${s.from}; i < ${s.n}; i++) {
            var on = ts >= ${s.t};
            var h1 = SceneKit.hash(i * 31 + 7), h2 = SceneKit.hash(i * 17 + 3), b = SceneKit.hash(boil * 13 + i * 5);
            gsap.set("#${id}-c${s.ci}-" + i, on
              ? { y: (h1 - 0.5) * 70 + (b - 0.5) * 6, x: (h2 - 0.5) * 16, rotation: (h2 - 0.5) * 36 + (b - 0.5) * 4 }
              : { y: 0, x: 0, rotation: 0 });
          }
        },`;
  }

  planes.push({ id: `${id}-ovp`, depth: 1 });

  // A gentle lateral drift on every painted scene (alternating direction) so the plane
  // speeds read as parallax even without a push-in.
  let camera = localize(sc.camera, sc.start);
  if (sc.kind === "plate" && !camera.some((k) => k.x !== undefined)) {
    const dir = sc.num % 2 ? 1 : -1;
    camera = camera.map((k, i) => ({ ...k, x: i === 0 ? 14 * dir : i === camera.length - 1 ? -14 * dir : 0 }));
    if (camera.length > 2) camera = camera.map((k) => ({ ...k, x: r3(14 * dir * (1 - 2 * (k.t / dur))) }));
  }

  const cfg = {
    duration: dur,
    focus: sc.focus || [W / 2, H / 2],
    camera,
    punches: localize(sc.punches, sc.start),
    shake: localize(sc.shake, sc.start),
    wiggle: sc.wiggle,
    planes,
    puppets,
    breathe,
    glints: localize(sc.glints, sc.start),
  };

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- Generated by scripts/build-scenes.mjs from data/scenes.mjs (scene ${sc.num}). Edit the spec, not this file. -->
  </head>
  <body>
    <template>
      <style>
        ${FONTS}
        #root { position: absolute; inset: 0; overflow: hidden; background: #1b1a18; }
        ${SCENE_CSS}
      </style>
      <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
        <div id="${id}-cam" class="sk-cam">
          ${cam.join("\n          ")}
          <div id="${id}-ovp" class="sk-plane">
            ${ov.join("\n            ")}
            ${svg.length ? `<svg class="sk-svg" viewBox="0 0 ${W} ${H}">${svg.join("")}</svg>` : ""}
          </div>
        </div>
        <div id="${id}-ov" class="sk-ov">
          ${screenOv.join("\n          ")}
        </div>
      </div>
      <script>
        SceneKit.mount("${id}", Object.assign(${JSON.stringify(cfg)}, {
          ${onStep}
          build: function (tl, kit) {
            ${build.join("\n            ")}
          },
        }));
      </script>
    </template>
  </body>
</html>
`;
}

// ---------------------------------------------------------------- captions track
function captionsHtml() {
  const chunks = [];
  for (const spec of scenes) {
    const sc = applyLayout(spec);
    const caps = sc.captions || [];
    caps.forEach((c, i) => {
      const next = caps[i + 1];
      chunks.push({ ...c, end: next ? next.t : sc.end, scene: sc.num });
    });
  }
  const els = [];
  const build = [];
  const jitters = [];
  chunks.forEach((c, i) => {
    const size = c.size || 60;
    const cls = ["cap", c.anim || "pop", c.ink === "dark" ? "dark" : ""].filter(Boolean).join(" ");
    let inner = esc(c.text);
    if (c.mark) {
      const w = esc(c.mark.word);
      inner = inner.replace(
        w,
        `<span class="mk">${w}<svg viewBox="0 0 100 24" preserveAspectRatio="none"><path id="cap${i}-mk" d="M 0 13 C 24 8, 60 17, 100 10 M 97 15 C 68 12, 34 18, 3 15"/></svg></span>`,
      );
    }
    const style = `top:${c.y - Math.round(size * 0.62)}px;font-size:${size}px${c.x ? `;left:${c.x - 540}px` : ""}${c.tint ? `;--tint:${c.tint}` : ""}`;
    els.push(`<div id="cap${i}" class="${cls}" style="${style}"><span class="cap-in">${inner}</span></div>`);
    const t0 = r3(c.t);
    const t1 = r3(c.end);
    if (c.anim === "scale") {
      build.push(`tl.fromTo("#cap${i}", { opacity: 0, scale: 0.55, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "back.out(2)", immediateRender: false }, ${t0});`);
    } else if (c.anim === "box") {
      build.push(`tl.fromTo("#cap${i}", { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 0.14, ease: "power3.out", immediateRender: false }, ${t0});`);
    } else if (c.anim === "stiff") {
      build.push(`tl.set("#cap${i}", { opacity: 1 }, ${t0});`);
    } else {
      build.push(`tl.fromTo("#cap${i}", { opacity: 0, scale: 1.08, y: 8, filter: "blur(12px)" }, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.1, ease: "power2.out", immediateRender: false }, ${t0});`);
      if (c.anim === "jitter") jitters.push({ i, t0, t1 });
    }
    if (c.mark) {
      build.push(`(function(){ var p = document.getElementById("cap${i}-mk"); var l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l, opacity: 0 }); tl.set(p, { opacity: 1 }, ${r3(c.mark.t)}); tl.fromTo(p, { strokeDashoffset: l }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, ${r3(c.mark.t)}); })();`);
    }
    build.push(`tl.set("#cap${i}", { opacity: 0 }, ${t1});`);
  });

  const jitterCode = jitters.length
    ? `var J = ${JSON.stringify(jitters)};
        tl.eventCallback("onUpdate", function () {
          var t = tl.time(), step = Math.floor(t * 15 + 1e-6);
          for (var k = 0; k < J.length; k++) {
            var on = t >= J[k].t0 && t < J[k].t1;
            var h = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
            gsap.set("#cap" + J[k].i + " .cap-in", on ? { x: (h(step * 3) - 0.5) * 16, y: (h(step * 7) - 0.5) * 12, rotation: (h(step * 11) - 0.5) * 7 } : { x: 0, y: 0, rotation: 0 });
          }
        });`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- Generated by scripts/build-scenes.mjs: one caption track for the whole video. -->
  </head>
  <body>
    <template>
      <style>
        ${FONTS}
        #root { position: absolute; inset: 0; pointer-events: none; }
        .cap { position: absolute; left: 0; width: ${W}px; text-align: center; opacity: 0; white-space: nowrap; line-height: 1.15; }
        .cap-in { display: inline-block; position: relative; font-family: "Instrument Serif", serif; font-style: italic; color: var(--tint, #fdfcf8); letter-spacing: -0.005em;
          text-shadow: 0 0 16px rgba(255, 250, 235, 0.32), 0 1px 2px rgba(0, 0, 0, 0.55), 0 3px 18px rgba(0, 0, 0, 0.45); }
        .cap.dark .cap-in { color: #1d1b17; text-shadow: 0 0 1px rgba(29, 27, 23, 0.25); }
        .cap.box .cap-in { background: #0f0e0d; padding: 0.02em 0.32em 0.12em; text-shadow: none; }
        .cap.stiff .cap-in { font-style: normal; letter-spacing: 0.1em; font-size: 0.86em; }
        .mk { position: relative; display: inline-block; }
        .mk svg { position: absolute; left: -6%; top: 36%; width: 112%; height: 0.42em; overflow: visible; }
        .mk path { fill: none; stroke: #e0412f; stroke-width: 7px; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
      </style>
      <div id="root" data-composition-id="captions" data-width="${W}" data-height="${H}">
        ${els.join("\n        ")}
      </div>
      <script>
        var tl = gsap.timeline({ paused: true });
        tl.to({ p: 0 }, { p: 1, duration: ${TOTAL}, ease: "none" }, 0);
        ${build.join("\n        ")}
        ${jitterCode}
        window.__timelines["captions"] = tl;
      </script>
    </template>
  </body>
</html>
`;
}

// ---------------------------------------------------------------- write
mkdirSync(join(ROOT, "compositions/frames"), { recursive: true });
for (const sc of scenes) {
  writeFileSync(join(ROOT, `compositions/frames/${pad(sc.num)}-${sc.slug}.html`), sceneHtml(sc));
}
writeFileSync(join(ROOT, "compositions/captions.html"), captionsHtml());
console.log(`scenes: ${scenes.length}, captions: ${scenes.reduce((n, s) => n + (s.captions || []).length, 0)}`);
