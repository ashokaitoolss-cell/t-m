// Procedural 3D model of the Clock It! watch, built from the proportions in the product
// photos. Units are millimetres; the dial faces +Z, 12 o'clock is +Y, the crown sits at +X.
// Every part is its own mesh so the film can animate them separately (links fly off and
// become the logo, the hands sweep, the crown presses).
import * as THREE from "three";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

// Brand palette (Olive / Object): paper, charcoal, olive, brass, oxide. The 3D materials
// use the brand hues; the lighting produces the darker and brighter tones seen in photos.
export const COLORS = {
  paper: 0xf3efe6,
  charcoal: 0x242521,
  olive: 0x596047,
  brass: 0xac9167,
  oxide: 0x913f3b,
  dial: 0x434433, // dial olive as photographed: a shade under the brand olive
  brassMetal: 0xb1a085, // brand brass, desaturated so the rendered metal matches the photos
};

// A seeded, repeatable "brushed metal" texture: fine streaks along U. Used as a roughness
// and bump map so the brass reads as satin-brushed like the photos, not polished.
let brushedTex = null;
function brushed() {
  if (brushedTex) return brushedTex;
  const W = 512, H = 512, data = new Uint8Array(W * H * 4);
  let seed = 1234567;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const rows = new Float32Array(H);
  for (let y = 0; y < H; y++) rows[y] = rnd();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Streak value varies slowly along x and fast across y.
      const v = 0.55 * rows[y] + 0.3 * rows[(y + 1) % H] + 0.15 * rnd();
      const c = Math.round(160 + 24 * v);
      const k = (y * W + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = c; data[k + 3] = 255;
    }
  }
  brushedTex = new THREE.DataTexture(data, W, H);
  brushedTex.wrapS = brushedTex.wrapT = THREE.RepeatWrapping;
  brushedTex.needsUpdate = true;
  return brushedTex;
}

// Brushed brass: fully metallic, satin, brushed in one direction.
export function brassMaterial(opts = {}) {
  const map = brushed().clone();
  map.needsUpdate = true;
  map.repeat.set(opts.repeat?.[0] ?? 1, opts.repeat?.[1] ?? 1);
  map.rotation = opts.brushAngle ?? 0;
  return new THREE.MeshPhysicalMaterial({
    color: COLORS.brassMetal,
    metalness: 1,
    roughness: opts.roughness ?? 0.5,
    roughnessMap: opts.brush === false ? null : map,
    bumpMap: null,
    anisotropy: opts.anisotropy ?? 0.35,
    anisotropyRotation: opts.anisotropyRotation ?? 0,
    vertexColors: !!opts.vertexColors,
    envMapIntensity: 1.0,
  });
}

// Case cross-section (r, z), measured from the side-view photo (case 38 mm across, about
// 9.7 mm deep). Front to back: inner lip, a rounded fluted bezel about 4.1 mm deep, a thin
// groove, a plain straight-sided middle band about 4.2 mm deep (it carries the crown), and a
// smaller stepped caseback about 1.1 mm deep. `f` marks how strongly the flutes apply.
function bezelProfile() {
  const pts = [];
  // Inner lip sloping up from the crystal's edge to the bezel's front face.
  pts.push({ r: 13.4, z: 8.0, f: 0 });
  pts.push({ r: 13.6, z: 8.4, f: 0 });
  pts.push({ r: 13.85, z: 8.75, f: 0 });
  pts.push({ r: 14.1, z: 9.15, f: 0 });
  pts.push({ r: 14.35, z: 9.5, f: 0 });
  pts.push({ r: 14.6, z: 9.66, f: 0.35 });
  // Rounded fluted bezel: a quarter-ellipse from the front face (r 15, z 9.7) out to the
  // widest point at its back edge (r 19, z 5.6).
  const cx = 15.0, cz = 5.6, ax = 4.0, az = 4.1;
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI / 2) * (1 - i / n);
    const u = i / n;
    const f = Math.min(1, 0.6 + u * 4) * Math.min(1, (1 - u) / 0.06 + 0.15);
    pts.push({ r: cx + ax * Math.cos(a), z: cz + az * Math.sin(a), f });
  }
  // Groove between the bezel and the middle band.
  pts.push({ r: 18.55, z: 5.47, f: 0 });
  pts.push({ r: 18.8, z: 5.3, f: 0 });
  // Middle band: straight sides, softly rounded edges.
  pts.push({ r: 18.85, z: 5.15, f: 0 });
  pts.push({ r: 18.85, z: 1.4, f: 0 });
  pts.push({ r: 18.75, z: 1.2, f: 0 });
  // Back shoulder, then the smaller stepped caseback.
  pts.push({ r: 18.5, z: 1.1, f: 0 });
  pts.push({ r: 16.6, z: 1.1, f: 0 });
  pts.push({ r: 16.4, z: 0.95, f: 0 });
  pts.push({ r: 16.4, z: 0.15, f: 0 });
  pts.push({ r: 16.2, z: 0.0, f: 0 });
  pts.push({ r: 0.0, z: 0.0, f: 0 });
  return pts;
}

// Lathe the profile with radial flutes: `ridges` grooves around the circumference, each a
// smooth rounded channel pushed in along the surface normal.
function bezelGeometry(ridges = 200, seg = 10) {
  const prof = bezelProfile();
  const N = ridges * seg;
  const M = prof.length;
  const pos = new Float32Array((N + 1) * M * 3);
  const uv = new Float32Array((N + 1) * M * 2);
  // Profile normals (2D) for pushing the grooves inward.
  const pn = prof.map((p, i) => {
    const a = prof[Math.max(0, i - 1)], b = prof[Math.min(M - 1, i + 1)];
    const dr = b.r - a.r, dz = b.z - a.z;
    const l = Math.hypot(dr, dz) || 1;
    return { r: dz / l, z: -dr / l };
  });
  const depth = 0.24;
  const col = new Float32Array((N + 1) * M * 3);
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * 2;
    const c = Math.cos(th), s = Math.sin(th);
    // Groove shape: rounded crest, narrow valley.
    const phase = (i % seg) / seg;
    // Narrow V-ish grooves between broad rounded crests.
    const g = Math.pow(0.5 - 0.5 * Math.cos(phase * Math.PI * 2), 3.0);
    for (let j = 0; j < M; j++) {
      const p = prof[j];
      const d = depth * g * p.f; // pn points into the metal, so grooves sink in
      const r = p.r + pn[j].r * d;
      const z = p.z + pn[j].z * d;
      const k = (i * M + j) * 3;
      pos[k] = r * c; pos[k + 1] = r * s; pos[k + 2] = z;
      uv[(i * M + j) * 2] = i / N; uv[(i * M + j) * 2 + 1] = j / (M - 1);
      // Fake occlusion: groove bottoms darker, so the fluting reads at any angle.
      const ao = 1 - 0.7 * g * p.f;
      col[k] = col[k + 1] = col[k + 2] = ao;
    }
  }
  const idx = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M - 1; j++) {
      const a = i * M + j, b = (i + 1) * M + j, c2 = (i + 1) * M + j + 1, d = i * M + j + 1;
      idx.push(a, d, b, b, d, c2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// A flat hand with a slightly angled, blunt tip, as in the photos.
function handGeometry(length, width, thick, tail = 1.2) {
  const s = new THREE.Shape();
  const w = width / 2;
  s.moveTo(-w, -tail);
  s.lineTo(w, -tail);
  s.lineTo(w, length - w * 0.6);
  s.lineTo(-w * 0.2, length);
  s.lineTo(-w, length - w * 0.2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
  return g;
}

// Link sizes along the bracelet: the end link tucks under the case and is longest, the
// rest taper slightly in width towards the clasp.
export function linkSpecs(count = 7) {
  const out = [{ w: 19.6, l: 22.0, t: 3.4 }];
  for (let i = 1; i < count; i++) out.push({ w: 18.6 - i * 0.12, l: 10.8, t: 3.4 });
  return out;
}

export function linkGeometry(spec) {
  return new RoundedBoxGeometry(spec.w, spec.l, spec.t, 4, 1.0);
}

// Build the whole watch. `links` = links per side. Returns the group plus named parts.
export function buildWatch(opts = {}) {
  const links = opts.links ?? 7;
  const group = new THREE.Group();
  const brass = brassMaterial({ brush: false, vertexColors: true, roughness: 0.42 });
  const brassPlain = brassMaterial({ brush: false, roughness: 0.42 });
  const brassLink = brassMaterial({ repeat: [1, 2.5] });

  const head = new THREE.Group();
  group.add(head);

  const bezel = new THREE.Mesh(bezelGeometry(opts.ridges ?? 200, opts.seg ?? 10), brass);
  head.add(bezel);

  const dial = new THREE.Mesh(
    new THREE.CylinderGeometry(13.45, 13.45, 0.4, 128),
    new THREE.MeshPhysicalMaterial({ color: COLORS.dial, roughness: 0.42, metalness: 0.25, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
  );
  dial.rotation.x = Math.PI / 2;
  dial.position.z = 7.8;
  head.add(dial);

  // Thin dark ring where the dial meets the lip (the shadow line in the photos).
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(13.4, 0.16, 8, 160),
    new THREE.MeshStandardMaterial({ color: 0x1e1c18, roughness: 0.8 }),
  );
  ring.position.z = 8.05;
  head.add(ring);

  const handMat = new THREE.MeshPhysicalMaterial({ color: COLORS.charcoal, roughness: 0.4, metalness: 0.35 });
  const hourHand = new THREE.Mesh(handGeometry(7.6, 0.95, 0.28), handMat);
  hourHand.position.z = 8.1;
  const minuteHand = new THREE.Mesh(handGeometry(11.6, 0.8, 0.28), handMat);
  minuteHand.position.z = 8.45;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.3, 48), handMat);
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 8.85;
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.92, 0.22, 48),
    new THREE.MeshPhysicalMaterial({ color: COLORS.oxide, roughness: 0.42, metalness: 0.05, clearcoat: 0.4 }),
  );
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 8.98;
  head.add(hourHand, minuteHand, hub, cap);

  // Crystal: a faint reflective disc, barely visible, as on a real watch.
  const crystal = new THREE.Mesh(
    new THREE.CylinderGeometry(14.15, 14.15, 0.2, 128),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.07, clearcoat: 1, envMapIntensity: 1.6 }),
  );
  crystal.rotation.x = Math.PI / 2;
  crystal.position.z = 9.25;
  head.add(crystal);
  // The crystal's edge catches light as a thin pale ring in the photos.
  const crystalEdge = new THREE.Mesh(
    new THREE.TorusGeometry(14.05, 0.14, 8, 160),
    new THREE.MeshPhysicalMaterial({ color: 0xd9d3c6, roughness: 0.2, metalness: 0, transparent: true, opacity: 0.55 }),
  );
  crystalEdge.position.z = 9.2;
  head.add(crystalEdge);

  // Crown: a 5.3 mm ball set into the middle band at 3 o'clock, standing about 2.9 mm
  // proud of the bezel when seen from the front.
  const crown = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.2, 24), brassPlain);
  stem.rotation.z = Math.PI / 2;
  stem.position.x = 0.1;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(2.9, 48, 32), brassPlain);
  ball.position.x = 1.0;
  crown.add(stem, ball);
  crown.position.set(18.55, 0, 3.3);
  head.add(crown);

  // Bracelet: links run up (+Y) and down (-Y) from under the case.
  const specs = linkSpecs(links);
  const bracelet = { up: [], down: [] };
  for (const dir of [1, -1]) {
    let y = dir * 12.0;
    specs.forEach((sp, i) => {
      const m = new THREE.Mesh(linkGeometry(sp), brassLink);
      y += dir * (sp.l / 2);
      // Links hang off the back half of the case, level with the caseback and band.
      m.position.set(0, y, 2.45);
      y += dir * (sp.l / 2 + 0.28);
      m.userData = { index: i, dir, rest: m.position.clone() };
      group.add(m);
      (dir > 0 ? bracelet.up : bracelet.down).push(m);
    });
  }

  return { group, head, bezel, dial, hourHand, minuteHand, cap, crown, bracelet, materials: { brass, brassPlain, brassLink } };
}

// Set the hands to h:m (12-hour), angles clockwise from 12 as on a real dial.
export function setTime(w, h, m) {
  const minA = (m / 60) * Math.PI * 2;
  const hourA = ((h % 12) / 12 + m / 720) * Math.PI * 2;
  w.minuteHand.rotation.z = -minA;
  w.hourHand.rotation.z = -hourA;
}

// Curl the bracelet round a wrist of radius R (mm), as in the side-view photo.
export function curlBracelet(w, R) {
  for (const list of [w.bracelet.up, w.bracelet.down]) {
    for (const m of list) {
      const rest = m.userData.rest;
      if (!R) { m.position.copy(rest); m.rotation.set(0, 0, 0); continue; }
      const s = Math.abs(rest.y) - 12; // arc length past the case
      const a = s / R;
      const dir = m.userData.dir;
      m.position.set(0, dir * (12 + R * Math.sin(a)), rest.z - R * (1 - Math.cos(a)));
      m.rotation.set(dir * -a, 0, 0);
    }
  }
}

// The Clock It! symbol: two offset links joined, with the slot between them, extruded with
// a soft bevel. Traced from the supplied logo (1932 px square artboard), in logo units / 10.
export function logoShape() {
  const k = 0.1;
  const P = (x, y) => [(x - 966) * k, -(y - 966) * k];
  const s = new THREE.Shape();
  const r = 1.2; // outer corner radius (logo units / 10)
  const f = 3.0; // inner fillet
  const pts = [
    // Clockwise outline of the union, starting at the right link's top-left corner.
    ["M", 910, 394], ["L", 1376, 394], ["L", 1376, 1300], ["L", 1022, 1300], ["L", 1022, 1540],
    ["L", 557, 1540], ["L", 557, 631], ["L", 910, 631], ["Z"],
  ];
  // Build with rounded corners via quadratic joins.
  const v = pts.filter((p) => p[0] !== "Z").map((p) => P(p[1], p[2]));
  const radii = [r, r, r, f, r, r, r, f];
  const n = v.length;
  for (let i = 0; i < n; i++) {
    const prev = v[(i - 1 + n) % n], cur = v[i], next = v[(i + 1) % n];
    const rad = radii[i];
    const d1 = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    const d2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const a = [cur[0] + (prev[0] - cur[0]) * (rad / d1), cur[1] + (prev[1] - cur[1]) * (rad / d1)];
    const b = [cur[0] + (next[0] - cur[0]) * (rad / d2), cur[1] + (next[1] - cur[1]) * (rad / d2)];
    if (i === 0) s.moveTo(a[0], a[1]); else s.lineTo(a[0], a[1]);
    s.quadraticCurveTo(cur[0], cur[1], b[0], b[1]);
  }
  s.closePath();
  // The slot where the two links overlap.
  const slot = new THREE.Path();
  const q = [P(912, 633), P(1020, 633), P(1020, 1297), P(912, 1297)];
  const sr = [3.0, 0.8, 3.0, 0.8];
  for (let i = 0; i < 4; i++) {
    const prev = q[(i + 3) % 4], cur = q[i], next = q[(i + 1) % 4];
    const rad = sr[i];
    const d1 = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    const d2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const a = [cur[0] + (prev[0] - cur[0]) * (rad / d1), cur[1] + (prev[1] - cur[1]) * (rad / d1)];
    const b = [cur[0] + (next[0] - cur[0]) * (rad / d2), cur[1] + (next[1] - cur[1]) * (rad / d2)];
    if (i === 0) slot.moveTo(a[0], a[1]); else slot.lineTo(a[0], a[1]);
    slot.quadraticCurveTo(cur[0], cur[1], b[0], b[1]);
  }
  slot.closePath();
  s.holes.push(slot);
  return s;
}

export function buildLogo(material, depth = 8) {
  const g = new THREE.ExtrudeGeometry(logoShape(), { depth, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 1.4, bevelSegments: 8, curveSegments: 16 });
  g.center();
  return new THREE.Mesh(g, material);
}
