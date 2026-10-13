// First-person body and the handheld camera riding on it.
//
// The feel follows the reference footage: the view eases after the mouse
// rather than snapping to it, banks into turns, drifts like a hand-held
// camera, bobs with each step, and the walk starts with getting up off the
// carpet.

import { CELL } from './world.js';

const RADIUS = 0.3; // body radius for collisions
const EYE = 1.62;
const WALK = 1.55; // m/s
const RUN = 3.3;
const DEG = Math.PI / 180;

export class Player {
  constructor(world) {
    this.world = world;
    this.x = CELL / 2;
    this.z = CELL / 2;
    this.vx = 0;
    this.vz = 0;

    // Where the viewer is steering the look (yaw: + turns left, pitch: + looks up).
    this.aimYaw = Math.PI * 0.25;
    this.aimPitch = 0;
    // The camera's actual, smoothed orientation and its rates.
    this.yaw = this.aimYaw;
    this.pitch = -1.25;
    this.roll = 0.35;
    this.yawRate = 0;
    this.pitchRate = 0;

    this.lean = 0; // metres to the side, from leaning the head
    this.leanTarget = 0;
    this.phase = 0; // walk cycle
    this.time = 0;
    this.wake = 0; // 0 lying on the floor → 1 standing
    this.onStep = null;
    this.camera = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0 };
  }

  // input: { move: [strafe, forward], run, look: [dYaw, dPitch], head: { yaw, pitch, lean } | null }
  update(dt, input, reducedMotion = false) {
    this.time += dt;
    this.wake = Math.min(1, this.wake + dt / 2.6);
    const rise = easeInOut(this.wake);

    // ---- look
    this.aimYaw += input.look[0];
    this.aimPitch = clamp(this.aimPitch + input.look[1], -80 * DEG, 80 * DEG);
    let yawTarget = this.aimYaw;
    let pitchTarget = this.aimPitch;
    if (input.head) {
      yawTarget += input.head.yaw;
      pitchTarget = clamp(pitchTarget + input.head.pitch, -80 * DEG, 80 * DEG);
    }
    // While getting up, the camera comes up from staring at the carpet.
    pitchTarget = lerp(-1.25, pitchTarget, rise);
    const prevYaw = this.yaw, prevPitch = this.pitch;
    const ease = 1 - Math.exp(-dt / (input.head ? 0.12 : 0.085));
    this.yaw += (yawTarget - this.yaw) * ease;
    this.pitch += (pitchTarget - this.pitch) * ease;
    this.yawRate = (this.yaw - prevYaw) / Math.max(dt, 1e-4);
    this.pitchRate = (this.pitch - prevPitch) / Math.max(dt, 1e-4);

    // ---- move
    const [strafe, forward] = input.move;
    const len = Math.hypot(strafe, forward);
    const speed = (input.run ? RUN : WALK) * Math.min(1, len) * rise;
    let wx = 0, wz = 0;
    if (len > 0.01) {
      const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw); // forward along the view
      const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
      wx = ((fx * forward + rx * strafe) / Math.max(1, len)) * speed;
      wz = ((fz * forward + rz * strafe) / Math.max(1, len)) * speed;
    }
    const accel = 1 - Math.exp(-dt / (len > 0.01 ? 0.22 : 0.16));
    this.vx += (wx - this.vx) * accel;
    this.vz += (wz - this.vz) * accel;
    this.moveAndCollide(this.vx * dt, this.vz * dt);

    // ---- walk cycle
    const v = Math.hypot(this.vx, this.vz);
    const stride = v / WALK; // 0 standing, 1 walking, ~2 running
    const prevPhase = this.phase;
    this.phase += dt * (3.6 + 2.2 * Math.min(stride, 2)) * Math.min(1, stride * 1.5);
    if (Math.floor(this.phase / Math.PI) !== Math.floor(prevPhase / Math.PI) && v > 0.3) this.onStep?.(Math.min(1, stride));
    const bob = reducedMotion ? 0 : Math.min(1.4, stride);

    // ---- lean (peeking with the head), kept out of the walls
    this.leanTarget = input.head ? input.head.lean : 0;
    this.lean += (this.leanTarget - this.lean) * (1 - Math.exp(-dt / 0.15));
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    let lean = this.lean;
    for (let k = 0; k < 6 && Math.abs(lean) > 0.01 && this.blocked(this.x + rx * lean, this.z + rz * lean, 0.12); k++) lean *= 0.6;

    // ---- the hand-held camera
    const t = this.time;
    const hand = reducedMotion ? 0 : 1;
    const driftYaw = hand * (0.006 * Math.sin(t * 0.71) + 0.004 * Math.sin(t * 1.83 + 1.3)) * (1 + bob);
    const driftPitch = hand * (0.005 * Math.sin(t * 0.93 + 0.4) + 0.003 * Math.sin(t * 2.31)) * (1 + bob);
    const bank = clamp(this.yawRate * 0.05, -0.2, 0.2); // lean into turns
    const rollTarget = hand * (bank + 0.012 * Math.sin(t * 0.57) + 0.012 * bob * Math.sin(this.phase)) + (1 - rise) * 0.35;
    this.roll += (rollTarget - this.roll) * (1 - Math.exp(-dt / 0.22));

    const c = this.camera;
    c.x = this.x + rx * (lean + 0.025 * bob * Math.sin(this.phase));
    c.z = this.z + rz * (lean + 0.025 * bob * Math.sin(this.phase));
    c.y = lerp(0.22, EYE, rise) + 0.032 * bob * Math.sin(this.phase * 2) - Math.abs(lean) * 0.08;
    c.yaw = this.yaw + driftYaw;
    c.pitch = this.pitch + driftPitch - 0.012 * bob * Math.sin(this.phase * 2);
    c.roll = this.roll;
  }

  // Slide along walls: move on each axis separately and push back out of any box.
  moveAndCollide(dx, dz) {
    const boxes = this.world.nearbyBoxes(this.x + dx, this.z + dz);
    this.x += dx;
    for (const b of boxes) {
      if (this.z > b[2] - RADIUS && this.z < b[3] + RADIUS && this.x > b[0] - RADIUS && this.x < b[1] + RADIUS) {
        this.x = dx > 0 ? b[0] - RADIUS : dx < 0 ? b[1] + RADIUS : this.x;
        this.vx = 0;
      }
    }
    this.z += dz;
    for (const b of boxes) {
      if (this.x > b[0] - RADIUS && this.x < b[1] + RADIUS && this.z > b[2] - RADIUS && this.z < b[3] + RADIUS) {
        this.z = dz > 0 ? b[2] - RADIUS : dz < 0 ? b[3] + RADIUS : this.z;
        this.vz = 0;
      }
    }
  }

  blocked(x, z, r) {
    return this.world.nearbyBoxes(x, z).some((b) => x > b[0] - r && x < b[1] + r && z > b[2] - r && z < b[3] + r);
  }

  get speed() {
    return Math.hypot(this.vx, this.vz);
  }
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}
