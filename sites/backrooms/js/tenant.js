// The Tenant: a figure in a stained beige suit, too tall for the ceiling,
// its neck bent sideways so its head lies along the tiles. Its face is the
// wallpaper. It never moves while you watch; every time it does move it is
// standing differently.

import * as THREE from 'three';
import { HEIGHT } from './world.js';

const SUIT = [0.52, 0.47, 0.37];
const LAPEL = [0.43, 0.38, 0.29];
const SKIN = [0.6, 0.58, 0.52];
const SHIRT = [0.74, 0.72, 0.66];
const TIE = [0.26, 0.15, 0.09];
const SHOE = [0.08, 0.065, 0.05];

const HIP = 1.2; // hip height; shoulders at ~2.18, the head against the ceiling
const HEAD = { x: 0.6, y: HEIGHT - 0.118, z: 0.06 }; // head centre (local, side +1), its ear on the tiles
const TILT = 0.62; // its face turned down to watch you

export class Tenant {
  constructor(world, materials, scene) {
    this.world = world;
    this.lift = { value: 0 };
    this.mats = {
      suit: materials.suit(SUIT, 1, this.lift),
      skin: materials.suit(SKIN, 0, this.lift),
      shirt: materials.suit(SHIRT, 0.3, this.lift),
      tie: materials.suit(TIE, 0.5, this.lift),
      lapel: materials.suit(LAPEL, 1, this.lift),
      hair: materials.suit([0.13, 0.11, 0.085], 0, this.lift),
      shoe: materials.suit(SHOE, 0, this.lift),
      face: materials.face(this.lift),
    };
    this.x = 0;
    this.z = 0;
    this.yaw = 0;
    this.side = 1;
    this.active = false;
    this.root = new THREE.Group();
    this.root.visible = false;
    this.build();
    scene.add(this.root);
  }

  get mouth() {
    return this.mats.face.uniforms.uMouth;
  }

  build() {
    const m = this.mats;
    const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
      const o = new THREE.Mesh(geometry, material);
      o.position.set(x, y, z);
      return o;
    };
    const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 4, 10);

    // Legs and shoes, planted.
    for (const s of [-1, 1]) {
      const leg = mesh(capsule(0.082, 1.0), m.suit, s * 0.12, 0.66, 0);
      leg.rotation.z = s * 0.025;
      this.root.add(leg, mesh(new THREE.BoxGeometry(0.115, 0.08, 0.32), m.shoe, s * 0.13, 0.04, 0.05));
    }

    // Everything above the hips leans and twists as one.
    this.body = new THREE.Group();
    this.body.position.y = HIP;
    this.root.add(this.body);
    this.body.add(mesh(taperedBox(-0.3, 0.98), m.suit));
    this.body.add(mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.07, 12), m.shirt, 0, 0.98, 0));
    // Shirt front in the V of the jacket, the tie, lapels and two buttons.
    const front = (w, h, mat, x, y, z, rz = 0) => {
      const o = mesh(new THREE.BoxGeometry(w, h, 0.01), mat, x, y, z);
      o.rotation.set(-0.06, 0, rz);
      this.body.add(o);
      return o;
    };
    front(0.15, 0.3, m.shirt, 0, 0.8, 0.138);
    front(0.055, 0.44, m.tie, 0, 0.68, 0.146);
    front(0.075, 0.38, m.lapel, -0.075, 0.76, 0.149, -0.32);
    front(0.075, 0.38, m.lapel, 0.075, 0.76, 0.149, 0.32);
    for (const by of [0.36, 0.5]) this.body.add(mesh(new THREE.SphereGeometry(0.012, 8, 6), m.shoe, 0.012, by, 0.135));
    for (const s of [-1, 1]) {
      const pad = mesh(new THREE.SphereGeometry(0.085, 12, 8), m.suit, s * 0.29, 0.93, 0);
      pad.scale.set(1.25, 0.75, 1.1);
      this.body.add(pad);
    }

    // Arms long enough to reach its knees.
    this.arms = [-1, 1].map((s) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(s * 0.33, 0.9, 0);
      shoulder.add(mesh(capsule(0.06, 0.5), m.suit, 0, -0.3, 0));
      const elbow = new THREE.Group();
      elbow.position.y = -0.61;
      shoulder.add(elbow);
      elbow.add(mesh(capsule(0.053, 0.5), m.suit, 0, -0.3, 0));
      elbow.add(mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.04, 10), m.shirt, 0, -0.585, 0));
      const wrist = new THREE.Group();
      wrist.position.y = -0.62;
      elbow.add(wrist);
      wrist.add(mesh(new THREE.BoxGeometry(0.075, 0.12, 0.028), m.skin, 0, -0.06, 0));
      const fingers = [-0.027, -0.009, 0.009, 0.027].map((fx, k) => {
        const f = new THREE.Group();
        f.position.set(fx, -0.115, 0);
        f.add(mesh(capsule(0.0085, 0.14 + (k === 1 || k === 2 ? 0.02 : 0)), m.skin, 0, -0.08, 0));
        wrist.add(f);
        return f;
      });
      const thumb = new THREE.Group();
      thumb.position.set(-s * 0.04, -0.04, 0.012);
      thumb.rotation.z = -s * 0.5;
      thumb.add(mesh(capsule(0.009, 0.07), m.skin, 0, -0.045, 0));
      wrist.add(thumb);
      this.body.add(shoulder);
      return { side: s, shoulder, elbow, wrist, fingers };
    });

    // The neck bent along the ceiling, and the head lying on its side, one
    // version for each side.
    this.necks = [-1, 1].map((s) => {
      const g = new THREE.Group();
      g.position.y = 0.98;
      const neck = mesh(neckGeometry(s), m.skin);
      const head = this.makeHead(s);
      g.add(neck, head);
      this.body.add(g);
      return { side: s, group: g, neck, head };
    });

    // A soft shadow on the carpet, and a damp grey smudge on the tiles
    // where its head has been pressing.
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), blobMaterial(0.7, 0x000000));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.004;
    this.smudge = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.5), blobMaterial(0.55, 0x1a1208));
    this.smudge.rotation.x = Math.PI / 2;
    this.root.add(shadow, this.smudge);
  }

  makeHead(s) {
    // Elongated, a little flat; lying on its side with the crown pointing
    // sideways and the face (the wallpaper) towards you, tipped down.
    const pivot = new THREE.Group();
    pivot.position.set(s * HEAD.x, HEAD.y - HIP - 0.98, HEAD.z);
    pivot.rotation.x = TILT;
    const head = new THREE.Group();
    head.rotation.z = -s * Math.PI / 2;
    pivot.add(head);
    const m = this.mats;
    // Skull, then the face over its front like a mask: the wallpaper.
    head.add(new THREE.Mesh(faceShape(new THREE.SphereGeometry(1, 48, 32).scale(0.112, 0.185, 0.1), 0), m.skin));
    head.add(new THREE.Mesh(faceShape(new THREE.SphereGeometry(1, 56, 40, Math.PI / 2 - 1.05, 2.1, 0.3, 2.4).scale(0.112, 0.185, 0.1), 0.0025), m.face));
    // Thin, flattened hair over the crown and back.
    head.add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8, 0, 1.25).scale(0.116, 0.19, 0.104), m.hair));
    for (const e of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8).scale(0.014, 0.032, 0.022), m.skin);
      ear.position.set(e * 0.11, 0.0, -0.01);
      head.add(ear);
    }
    return pivot;
  }

  show(on) {
    this.active = on;
    this.root.visible = on;
  }

  // Stand at (x, z) facing the point (fx, fz), head on whichever side clears
  // the walls.
  place(x, z, fx, fz, rng = Math.random) {
    this.x = x;
    this.z = z;
    this.yaw = Math.atan2(fx - x, fz - z);
    this.root.position.set(x, 0, z);
    this.root.rotation.y = this.yaw;
    const clear = (s) => {
      const [hx, hz] = this.toWorld(s * HEAD.x, HEAD.z);
      const [nx, nz] = this.toWorld(s * HEAD.x * 0.45, 0.04);
      return !this.world.pointBlocked(hx, hz, 0.13, HEAD.y) && !this.world.pointBlocked(nx, nz, 0.08, HEAD.y);
    };
    const preferred = rng() < 0.5 ? -1 : 1;
    this.setSide(clear(preferred) ? preferred : clear(-preferred) ? -preferred : preferred);
  }

  setSide(s) {
    this.side = s;
    for (const n of this.necks) n.group.visible = n.side === s;
    this.smudge.position.set(s * (HEAD.x - 0.02), HEIGHT - 0.004, HEAD.z);
  }

  toWorld(lx, lz) {
    const c = Math.cos(this.yaw), s = Math.sin(this.yaw);
    return [this.x + lx * c + lz * s, this.z - lx * s + lz * c];
  }

  // A new stance. `near` (0..1) pulls it towards you, arms reaching.
  pose(rng, near = 0) {
    const r = rng;
    const lean = 0.02 + r() * 0.06 + near * 0.04;
    this.body.rotation.set(lean, (r() - 0.5) * 0.3, (r() - 0.5) * 0.05);
    // Keep the head flat on the ceiling whatever the body does.
    for (const n of this.necks) n.group.rotation.set(-lean, -this.body.rotation.y, -this.body.rotation.z);
    const reach = r() < 0.5 ? 0 : 1;
    this.arms.forEach((arm, k) => {
      const s = arm.side;
      let raise = -0.05 + r() * 0.3, out = 0.03 + r() * 0.16, bend = r() * 0.45, curl = 0.1 + r() * 0.6, spread = r() * 0.2;
      if ((near > 0.4 && k === reach) || near > 0.85) {
        raise = 1.1 + r() * 0.4;
        out = 0.04 + r() * 0.14;
        bend = r() * 0.15;
        curl = 0.05 + r() * 0.3;
        spread = 0.3 + r() * 0.25;
      }
      arm.shoulder.rotation.set(-raise, (r() - 0.5) * 0.3, s * out);
      arm.elbow.rotation.set(-bend, 0, 0);
      arm.wrist.rotation.set(-0.15 + r() * 0.3, (r() - 0.5) * 0.4, 0);
      arm.fingers.forEach((f, i) => f.rotation.set(-curl * (0.5 + r()), 0, (i - 1.5) * spread * 0.35));
    });
  }

  // Walk `distance` metres along `route` ([[x, z, door], ...] starting where
  // it stands), never stopping under a door frame. Returns the metres left
  // to the end of the route.
  walk(route, distance) {
    let go = distance;
    let at = walkAlong(route, go);
    for (let k = 0; k < 8 && at.rest > 0.5 && this.world.pointBlocked(at.x, at.z, 0.12, HEIGHT - 0.3); k++) {
      go += 0.2;
      at = walkAlong(route, go);
    }
    this.x = at.x;
    this.z = at.z;
    return at.rest;
  }

  // The close-up: its head comes down off the ceiling to `target` (world
  // space, right in front of your eyes) as t goes 0 → 1.
  lunge(target, t) {
    const n = this.necks.find((k) => k.side === this.side);
    const s = this.side;
    this.body.rotation.set(0.1 * t, 0, 0);
    n.group.rotation.set(0, 0, 0);
    this.smudge.visible = t < 0.5;
    this.root.updateMatrixWorld(true);
    const rest = n.group.localToWorld(new THREE.Vector3(s * HEAD.x, HEAD.y - HIP - 0.98, HEAD.z));
    const local = n.group.worldToLocal(rest.lerp(target, easeOut(t)));
    const top = new THREE.Vector3(s * 0.12, HEAD.y - HIP - 0.98 - 0.06, 0.05);
    const mid = top.clone().lerp(local, 0.5).add(new THREE.Vector3(s * 0.12, 0.08 * (1 - t), 0));
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.04, 0), new THREE.Vector3(0, 0.16, 0.01), top, mid, local.clone()]);
    n.neck.geometry.dispose();
    n.neck.geometry = new THREE.TubeGeometry(curve, 40, 0.054, 10, false);
    n.head.position.copy(local);
    n.head.rotation.set(TILT * (1 - t), 0, 0);
  }

  // Back to the resting neck after a close-up.
  unlunge() {
    this.smudge.visible = true;
    for (const n of this.necks) {
      n.neck.geometry.dispose();
      n.neck.geometry = neckGeometry(n.side);
      n.head.position.set(n.side * HEAD.x, HEAD.y - HIP - 0.98, HEAD.z);
      n.head.rotation.set(TILT, 0, 0);
    }
    this.mouth.value = 0;
    this.lift.value = 0;
  }
}

function walkAlong(route, distance) {
  let x = route[0][0], z = route[0][1];
  let left = distance;
  let k = 1;
  while (k < route.length) {
    const seg = Math.hypot(route[k][0] - x, route[k][1] - z);
    if (seg >= left) {
      if (seg > 0) {
        x += ((route[k][0] - x) * left) / seg;
        z += ((route[k][1] - z) * left) / seg;
      }
      break;
    }
    left -= seg;
    x = route[k][0];
    z = route[k][1];
    k++;
  }
  let rest = 0;
  if (k < route.length) {
    rest = Math.hypot(route[k][0] - x, route[k][1] - z);
    for (let q = k + 1; q < route.length; q++) rest += Math.hypot(route[q][0] - route[q - 1][0], route[q][1] - route[q - 1][1]);
  }
  return { x, z, rest };
}

// A jacket from its hem (y0, below the hips) to the shoulders (y1): flared
// a little at the hem, narrow at the waist, broad and square on top.
function taperedBox(y0, y1) {
  const g = new THREE.BoxGeometry(1, 1, 1, 1, 8, 1);
  const pos = g.attributes.position;
  const width = [[0, 0.44], [0.22, 0.4], [0.38, 0.36], [0.78, 0.6], [1, 0.66]];
  for (let k = 0; k < pos.count; k++) {
    const t = pos.getY(k) + 0.5; // 0 hem … 1 shoulders
    let w = width[0][1];
    for (let q = 1; q < width.length; q++) {
      if (t <= width[q][0]) {
        const [ta, wa] = width[q - 1], [tb, wb] = width[q];
        w = wa + ((wb - wa) * (t - ta)) / (tb - ta);
        break;
      }
    }
    const d = 0.25 + 0.035 * Math.sin(t * Math.PI);
    pos.setXYZ(k, pos.getX(k) * w, y0 + t * (y1 - y0), pos.getZ(k) * d);
  }
  g.computeVertexNormals();
  return g;
}

// Up from the collar, bent hard over, and along the tiles to the head.
function neckGeometry(s) {
  const top = HEAD.y - HIP - 0.98; // the head's height above the collar
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.04, 0),
    new THREE.Vector3(0, 0.16, 0.01),
    new THREE.Vector3(s * 0.03, top - 0.1, 0.03),
    new THREE.Vector3(s * 0.12, top + 0.01, 0.045),
    new THREE.Vector3(s * 0.27, top + 0.035, 0.055),
    new THREE.Vector3(s * (HEAD.x - 0.16), top + 0.02, HEAD.z),
  ]);
  return new THREE.TubeGeometry(curve, 36, 0.054, 10, false);
}

// Push a unit-sphere-derived head into a face: brow, eye hollows, nose,
// lips and chin, on the front (+z). `lift` floats the wallpaper over the skin.
function faceShape(geometry, lift) {
  const pos = geometry.attributes.position;
  const g = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2) - ((y - cy) / sy) ** 2);
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k), y = pos.getY(k), z = pos.getZ(k);
    const front = Math.max(0, z / 0.1);
    let dz = 0.024 * g(x, y, 0, 0.005, 0.016, 0.05) * (0.6 + 0.4 * smooth((0.06 - y) / 0.08)); // nose
    dz += 0.008 * g(x, y, 0, 0.075, 0.07, 0.016); // brow
    dz -= 0.011 * (g(x, y, -0.042, 0.045, 0.024, 0.016) + g(x, y, 0.042, 0.045, 0.024, 0.016)); // eye hollows
    dz += 0.006 * g(x, y, 0, -0.07, 0.03, 0.012); // lips
    dz += 0.008 * g(x, y, 0, -0.135, 0.035, 0.025); // chin
    dz -= 0.006 * (g(x, y, -0.075, -0.03, 0.02, 0.04) + g(x, y, 0.075, -0.03, 0.02, 0.04)); // hollow cheeks
    const scale = 1 + lift / 0.1;
    pos.setXYZ(k, x * scale, y * (1 + lift / 0.185), (z + dz * front ** 2) * scale);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function smooth(t) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function blobMaterial(alpha, color) {
  // A radial alpha mask (alphaMap reads the green channel).
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const v = (a) => `rgb(${Math.round(a * 255)},${Math.round(a * 255)},${Math.round(a * 255)})`;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 64, 64);
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, v(alpha));
  grad.addColorStop(0.5, v(alpha / 2));
  grad.addColorStop(1, '#000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.MeshBasicMaterial({ alphaMap: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, color });
}

function easeOut(t) {
  return 1 - (1 - t) ** 3;
}
