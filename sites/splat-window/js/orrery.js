// "Orrery": the built-in scene, generated procedurally so the site works with
// no downloads. A spiral galaxy turns slowly in the middle of the box while
// lit planets hang on threads around it — two of them in front of the glass.
//
// generateOrrery() runs in the worker and builds the splats. orreryPose() runs
// every frame on the main thread and returns the animated group transforms;
// both read the same ORRERY description so they always agree.

import { compose, translation, scaling, rotationX, rotationY, rotationZ, eulerDegrees, identity } from './math.js';

export const ROOM_DEPTH = 1.1;

// Planet positions: `nx` is a fraction of the half-width of the box, `y` a
// height; `portrait` swaps in a taller arrangement for phones held upright.
// Each planet and its thread are separate groups so the thread can stretch
// to whatever height the layout puts the planet at.
export const ORRERY = {
  galaxy: { group: 1, x: 0.02, y: -0.03, z: -0.6, radius: 0.36, tilt: [-63, 0, 14], spin: 0.05 },
  orbs: [
    { group: 2, kind: 'gold', nx: -0.86, y: 0.1, z: -0.3, r: 0.07, portrait: [-0.75, 0.16] },
    { group: 3, kind: 'glass', nx: 0.83, y: -0.1, z: -0.24, r: 0.085, portrait: [0.75, -0.18] },
    { group: 4, kind: 'pearl', nx: 0.22, y: 0.3, z: 0.14, r: 0.045, portrait: [0.45, 0.33] },
    { group: 5, kind: 'magenta', nx: -0.27, y: -0.33, z: 0.2, r: 0.036, portrait: [0.35, -0.3] },
    { group: 6, kind: 'ringed', nx: 0.8, y: 0.28, z: -0.86, r: 0.058, portrait: [-0.5, 0.36] },
    { group: 7, kind: 'coral', nx: -0.88, y: -0.3, z: -0.88, r: 0.075, portrait: [-0.6, -0.36] },
  ].map((orb, i) => ({ ...orb, threadGroup: 8 + i, period: [5.3 + i * 0.7, 7.9 + i * 0.5], phase: i * 1.9 })),
};

// Orbs behind the glass hang from the ceiling of the box; the ones in front of
// it hang from somewhere above the screen.
function pivotY(orb) {
  return orb.z < 0 ? 0.5 : 1.9;
}

// ---------------------------------------------------------------- animation

export function orreryPose(time, aspect, out) {
  const { galaxy, orbs } = ORRERY;
  identity(out.subarray(0, 16));
  const portrait = aspect < 0.9;
  const half = aspect / 2;

  const radius = Math.min(galaxy.radius, aspect * 0.42);
  const g = compose(
    translation(galaxy.x * aspect, galaxy.y, galaxy.z),
    eulerDegrees(galaxy.tilt),
    rotationY(time * galaxy.spin),
    scaling(radius),
  );
  out.set(g, galaxy.group * 16);

  // Planets shrink on narrow screens so they don't crowd the box.
  const size = Math.min(1, Math.max(0.55, aspect / 1.3));
  const shadows = [];
  for (const orb of orbs) {
    const [nx, y] = portrait ? orb.portrait : [orb.nx, orb.y];
    const r = orb.r * size;
    const x = orb.z < 0 ? nx * Math.max(0, half - r - 0.04) : nx * half * 0.8;
    const top = pivotY(orb);
    const len = top - y;
    const swayZ = 0.035 * Math.sin((time * 2 * Math.PI) / orb.period[0] + orb.phase);
    const swayX = 0.025 * Math.sin((time * 2 * Math.PI) / orb.period[1] + orb.phase * 1.7);
    const hang = compose(translation(x, top, orb.z), rotationZ(swayZ), rotationX(swayX));
    // The thread is generated one unit long, hanging from the origin.
    out.set(compose(hang, scaling(1, len - r * 0.9, 1)), orb.threadGroup * 16);
    const m = compose(hang, translation(0, -len, 0), scaling(size));
    out.set(m, orb.group * 16);
    shadows.push([m[12], m[13], m[14], r]);
  }
  return {
    shadows,
    glow: [galaxy.x * aspect, galaxy.y, galaxy.z, radius / galaxy.radius],
    glowColor: [1.0, 0.72, 0.48],
  };
}

// ---------------------------------------------------------------- generation

const LIGHT = normalize([-0.5, 0.75, 0.45]);
const HALF = normalize([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

const MATERIALS = {
  gold: { base: [1.0, 0.7, 0.3], ambient: 0.1, diffuse: 0.78, spec: 1.1, specColor: [1.0, 0.86, 0.6], shine: 26, rim: 0.28, rimColor: [1.0, 0.75, 0.45] },
  pearl: { base: [0.93, 0.91, 0.88], ambient: 0.2, diffuse: 0.8, spec: 0.65, specColor: [1, 1, 1], shine: 48, rim: 0.32, rimColor: [0.6, 0.75, 1.0] },
  glass: { base: [0.3, 0.8, 0.86], ambient: 0.35, diffuse: 0.25, spec: 1.5, specColor: [1, 1, 1], shine: 90, rim: 0.85, rimColor: [0.55, 1.0, 0.95], alpha: 0.3 },
  magenta: { base: [0.96, 0.26, 0.58], ambient: 0.12, diffuse: 0.82, spec: 0.75, specColor: [1.0, 0.82, 0.92], shine: 38, rim: 0.35, rimColor: [1.0, 0.5, 0.8] },
  ringed: { base: [0.32, 0.47, 1.0], ambient: 0.12, diffuse: 0.82, spec: 0.5, specColor: [0.85, 0.9, 1.0], shine: 30, rim: 0.4, rimColor: [0.5, 0.7, 1.0], bands: true },
  coral: { base: [1.0, 0.42, 0.3], ambient: 0.12, diffuse: 0.86, spec: 0.35, specColor: [1.0, 0.85, 0.8], shine: 20, rim: 0.3, rimColor: [1.0, 0.6, 0.5] },
};

export function generateOrrery(seed = 7) {
  const rand = mulberry32(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const b = new Builder(260000);

  addDust(b, rand);
  addGalaxy(b, rand, gauss, ORRERY.galaxy.group);
  for (const orb of ORRERY.orbs) addOrb(b, rand, orb);
  return b.finish();
}

function addDust(b, rand) {
  for (let i = 0; i < 1100; i++) {
    const x = (rand() * 2 - 1) * 1.6;
    const y = rand() - 0.5;
    const z = -ROOM_DEPTH + rand() * (ROOM_DEPTH + 0.35);
    const s = 0.0009 + rand() * rand() * 0.002;
    const warm = rand();
    b.sphere(x, y, z, s, [1.0, 0.9 + 0.06 * warm, 0.78 + 0.18 * warm], 0.15 + rand() * 0.45, 0);
  }
}

function addGalaxy(b, rand, gauss, group) {
  // Built with unit radius in the local XZ plane; the group transform tilts,
  // spins and sizes it.
  const core = [1.0, 0.86, 0.62];
  const arm = [0.66, 0.78, 1.0];
  const hii = [1.0, 0.45, 0.66];
  const pitch = 0.3; // tan of the spiral's pitch angle
  const r0 = 0.07;
  const arms = 2;

  // Soft outer glow, laid down first so it sits under everything else.
  for (let i = 0; i < 5000; i++) {
    const r = Math.min(1.05, Math.abs(gauss()) * 0.42);
    const a = rand() * Math.PI * 2;
    const t = Math.min(1, r / 0.9);
    const c = mix([1.0, 0.78, 0.55], [0.42, 0.38, 0.9], t);
    b.disc(r * Math.cos(a), gauss() * 0.02, r * Math.sin(a), 0.03 + rand() * 0.05, 0.25, c, 0.035 + 0.03 * (1 - t), group);
  }

  // Bulge.
  for (let i = 0; i < 16000; i++) {
    const r = Math.abs(gauss()) * 0.11;
    const [dx, dy, dz] = randomUnit(rand);
    const heat = rand();
    const c = mix(core, [1.0, 0.97, 0.9], heat * heat);
    b.sphere(dx * r, dy * r * 0.55, dz * r, 0.004 + rand() * 0.008, scaleColor(c, 0.85 + 0.3 * rand()), 0.35 + rand() * 0.35, group);
  }

  // Spiral arms: a faint nebulous band, then stars and star-forming knots.
  const armPoint = (k, u, width) => {
    const r = r0 + u * (1 - r0);
    let theta = (k * 2 * Math.PI) / arms + Math.log(r / r0) / pitch;
    theta += gauss() * (0.16 + 0.1 * u) * width;
    const spread = gauss() * 0.03 * (0.4 + r) * width;
    return [r, r * Math.cos(theta) - spread * Math.sin(theta), r * Math.sin(theta) + spread * Math.cos(theta)];
  };
  for (let i = 0; i < 9000; i++) {
    const [r, x, z] = armPoint(i % arms, Math.pow(rand(), 0.8), 0.8);
    const c = mix(core, arm, Math.min(1, (r - r0) / 0.6));
    b.disc(x, gauss() * 0.008, z, 0.018 + rand() * 0.02, 0.3, c, 0.05 * (1.1 - r), group);
  }
  for (let i = 0; i < 90000; i++) {
    const u = Math.pow(rand(), 0.75);
    const [r, x, z] = armPoint(i % arms, u, 1);
    const y = gauss() * 0.012 * (1.2 - r);
    let c = mix(core, arm, Math.min(1, (r - r0) / 0.6));
    let alpha = (0.3 + rand() * 0.5) * (1 - 0.5 * u);
    let s = 0.0022 + rand() * rand() * 0.006;
    if (rand() < 0.02 && r > 0.25) {
      c = hii;
      s *= 2;
      alpha = 0.65;
    } else if (rand() < 0.04) {
      c = [1, 1, 1]; // a bright young star
      alpha = 0.95;
    }
    b.sphere(x, y, z, s, scaleColor(c, 0.8 + 0.35 * rand()), alpha, group);
  }

  // Dust lanes on the inner edge of each arm.
  for (let i = 0; i < 14000; i++) {
    const k = i % arms;
    const u = Math.pow(rand(), 0.8);
    const r = r0 * 2 + u * (0.85 - r0 * 2);
    let theta = (k * 2 * Math.PI) / arms + Math.log(r / r0) / pitch - 0.28;
    theta += gauss() * 0.07;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    b.disc(x, gauss() * 0.004, z, 0.008 + rand() * 0.014, 0.3, [0.11, 0.065, 0.05], 0.16 + rand() * 0.2, group);
  }

  // Older stars filling the disc between the arms.
  for (let i = 0; i < 24000; i++) {
    const r = Math.min(1.05, -Math.log(1 - rand() * 0.98) * 0.24);
    const a = rand() * Math.PI * 2;
    const c = mix([1.0, 0.9, 0.72], [0.8, 0.82, 0.95], Math.min(1, r));
    b.sphere(r * Math.cos(a), gauss() * 0.015, r * Math.sin(a), 0.0025 + rand() * 0.004, c, 0.25 + rand() * 0.35, group);
  }

  // A sprinkle of halo stars.
  for (let i = 0; i < 1600; i++) {
    const [dx, dy, dz] = randomUnit(rand);
    const r = 0.2 + rand() * 1.1;
    b.sphere(dx * r, dy * r * 0.6, dz * r, 0.002 + rand() * 0.003, [0.9, 0.93, 1.0], 0.5 + rand() * 0.5, group);
  }
}

function addOrb(b, rand, orb) {
  const mat = MATERIALS[orb.kind];
  const r = orb.r;

  // Thread: one unit long, hanging down from the origin; its group stretches it.
  const steps = 300;
  for (let i = 0; i < steps; i++) {
    const y = -(i + 0.5) / steps;
    b.push(0, y, 0, 0.0006, 0.6 / steps, 0.0006, 1, 0, 0, 0, 0.78, 0.8, 0.86, 0.7, orb.threadGroup);
  }

  if (orb.kind === 'glass') {
    shell(b, 0, 0, 0, r * 0.42, 1800, (n) => {
      const glow = 0.75 + 0.25 * Math.max(0, dot(n, LIGHT));
      return [scaleColor([0.6, 1.0, 0.92], glow), 0.95];
    }, orb.group);
  }

  const count = Math.round(7500 * (r / 0.07) ** 2);
  shell(b, 0, 0, 0, r, Math.max(2500, count), (n) => {
    let base = mat.base;
    if (mat.bands) {
      const band = 0.86 + 0.14 * Math.sin(n[1] * 19 + Math.sin(n[1] * 7) * 1.5);
      base = scaleColor(base, band);
    }
    return [shade(n, mat, base), mat.alpha ?? 1];
  }, orb.group);

  if (orb.kind === 'ringed') {
    const tilt = 0.42;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < 9000; i++) {
      const rr = r * (1.45 + rand() * 0.8);
      const a = rand() * Math.PI * 2;
      const lx = rr * Math.cos(a), lz = rr * Math.sin(a);
      // Tilt the ring about the X axis so its near side dips towards the viewer.
      const y1 = -lz * st;
      const z1 = lz * ct;
      const band = 0.75 + 0.25 * Math.sin((rr / r) * 26);
      const lit = lz * ct > -r * 0.2 || Math.abs(lx) > r ? 1 : 0.35; // the planet shades the back of the ring
      const c = scaleColor([0.96, 0.86, 0.7], band * lit);
      b.push(lx, y1, z1, 0.0028, 0.0006, 0.0028, Math.cos(tilt / 2), Math.sin(tilt / 2), 0, 0, c[0], c[1], c[2], 0.5, orb.group);
    }
  }
}

// Points on a sphere (Fibonacci lattice), each a flat disc lying on the surface.
function shell(b, cx, cy, cz, r, count, colorAt, group) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const spacing = r * Math.sqrt((4 * Math.PI) / count);
  const s = spacing * 0.72;
  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) * 2) / count;
    const rad = Math.sqrt(1 - y * y);
    const phi = i * golden;
    const n = [Math.cos(phi) * rad, y, Math.sin(phi) * rad];
    const [c, a] = colorAt(n);
    // Quaternion turning +Z onto the normal.
    let qw = 1 + n[2], qx = -n[1], qy = n[0];
    if (qw < 1e-6) { qw = 0; qx = 1; qy = 0; }
    b.push(cx + n[0] * r, cy + n[1] * r, cz + n[2] * r, s, s, s * 0.18, qw, qx, qy, 0, c[0], c[1], c[2], a, group);
  }
}

function shade(n, mat, base) {
  const ndl = Math.max(0, dot(n, LIGHT));
  const wrap = (ndl + 0.15) / 1.15;
  const ndh = Math.max(0, dot(n, HALF));
  const ndv = Math.max(0, n[2]);
  const bounce = Math.max(0, -n[1]) * 0.12;
  const diff = mat.ambient + mat.diffuse * wrap + bounce;
  const spec = mat.spec * Math.pow(ndh, mat.shine);
  const rim = mat.rim * Math.pow(1 - ndv, 3);
  return [0, 1, 2].map((k) => base[k] * diff + mat.specColor[k] * spec + mat.rimColor[k] * rim);
}

class Builder {
  constructor(capacity) {
    this.n = 0;
    this.alloc(capacity);
  }
  alloc(cap) {
    const old = this;
    const grow = (Type, k, prev) => {
      const a = new Type(cap * k);
      if (prev) a.set(prev.subarray(0, Math.min(prev.length, cap * k)));
      return a;
    };
    this.position = grow(Float32Array, 3, old.position);
    this.scale = grow(Float32Array, 3, old.scale);
    this.rotation = grow(Float32Array, 4, old.rotation);
    this.color = grow(Uint8Array, 4, old.color);
    this.group = grow(Uint8Array, 1, old.group);
    this.cap = cap;
  }
  push(x, y, z, sx, sy, sz, qw, qx, qy, qz, r, g, bl, a, group) {
    if (this.n === this.cap) this.alloc(this.cap * 2);
    const i = this.n++;
    this.position.set([x, y, z], i * 3);
    this.scale.set([sx, sy, sz], i * 3);
    const ql = Math.hypot(qw, qx, qy, qz) || 1;
    this.rotation.set([qw / ql, qx / ql, qy / ql, qz / ql], i * 4);
    this.color.set([byte(r), byte(g), byte(bl), byte(a)], i * 4);
    this.group[i] = group;
  }
  sphere(x, y, z, s, c, a, group) {
    this.push(x, y, z, s, s, s, 1, 0, 0, 0, c[0], c[1], c[2], a, group);
  }
  // A flattened splat lying in the local XZ plane (the galaxy's disc).
  disc(x, y, z, s, flat, c, a, group) {
    this.push(x, y, z, s, s * flat, s, 1, 0, 0, 0, c[0], c[1], c[2], a, group);
  }
  finish() {
    const n = this.n;
    return {
      count: n,
      position: this.position.slice(0, n * 3),
      scale: this.scale.slice(0, n * 3),
      rotation: this.rotation.slice(0, n * 4),
      color: this.color.slice(0, n * 4),
      group: this.group.slice(0, n),
    };
  }
}

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomUnit(rand) {
  const z = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return [r * Math.cos(a), r * Math.sin(a), z];
}

function normalize(v) {
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function mix(a, b, t) {
  return [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * t);
}

function scaleColor(c, k) {
  return [c[0] * k, c[1] * k, c[2] * k];
}

function byte(v) {
  return v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255);
}
