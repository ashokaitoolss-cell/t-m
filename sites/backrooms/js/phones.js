// Desk phones on little side tables. A ringing one rattles its handset and
// blinks its light; once answered its handset is left lying off the hook.

import * as THREE from 'three';

const TABLE = [0.4, 0.34, 0.26];
const CREAM = [0.74, 0.71, 0.63];
const RED = [0.55, 0.05, 0.035];
const KEYS = [0.12, 0.11, 0.1];
const TOP = 0.735; // table top

export class Phone {
  constructor(world, materials, scene, { x, z, yaw = 0, red = false }) {
    this.world = world;
    this.x = x;
    this.z = z;
    this.yaw = yaw;
    this.red = red;
    this.state = 'idle'; // idle | ringing | answered | off-hook
    this.ringOn = false;
    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.group.rotation.y = yaw;

    const body = materials.prop(red ? RED : CREAM);
    this.materials = [materials.prop(TABLE), body, materials.prop(KEYS)];
    this.led = materials.prop([0.2, 0.05, 0.04], [0, 0, 0]);
    this.materials.push(this.led);
    const [table, , keys] = this.materials;
    const box = (w, h, d, mat, px, py, pz) => {
      const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      o.position.set(px, py, pz);
      this.group.add(o);
      return o;
    };

    box(0.56, 0.03, 0.46, table, 0, TOP - 0.015, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.035, TOP - 0.03, 0.035, table, sx * 0.24, (TOP - 0.03) / 2, sz * 0.195);
    box(0.5, 0.02, 0.4, table, 0, 0.16, 0); // shelf

    box(0.2, 0.06, 0.22, body, 0, TOP + 0.03, 0);
    const pad = box(0.14, 0.012, 0.1, keys, 0, TOP + 0.064, 0.045);
    pad.rotation.x = 0.22;
    box(0.022, 0.012, 0.022, this.led, 0.075, TOP + 0.066, 0.085);

    // The handset sits across the back of the phone.
    this.handset = new THREE.Group();
    const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.021, 0.17, 4, 8), body);
    grip.rotation.z = Math.PI / 2;
    this.handset.add(grip);
    for (const sx of [-1, 1]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.035, 12), body);
      cup.position.set(sx * 0.09, -0.018, 0);
      this.handset.add(cup);
    }
    this.cradle = { x: 0, y: TOP + 0.098, z: -0.045, ry: 0 };
    this.handset.position.set(this.cradle.x, this.cradle.y, this.cradle.z);
    this.group.add(this.handset);
    scene.add(this.group);
    this.scene = scene;

    // Solid for walking into: the table's footprint.
    const quarter = Math.round(yaw / (Math.PI / 2)) % 2 !== 0;
    const hx = quarter ? 0.24 : 0.29, hz = quarter ? 0.29 : 0.24;
    this.box = world.addProp([x - hx, x + hx, z - hz, z + hz, 0, TOP]);
  }

  // Ear height above the table, for sound.
  get soundY() {
    return TOP + 0.1;
  }

  ring(on) {
    this.state = on ? 'ringing' : this.state === 'ringing' ? 'idle' : this.state;
  }

  answer() {
    this.state = 'answered';
    this.handset.visible = false;
  }

  // Left lying beside the phone, off the hook.
  leaveOffHook() {
    this.state = 'off-hook';
    this.handset.visible = true;
    this.handset.position.set(0.17, TOP + 0.045, 0.1);
    this.handset.rotation.set(0, 0.7, 0.12);
  }

  update(time, ringOn) {
    this.ringOn = this.state === 'ringing' && ringOn;
    const glow = this.ringOn ? 2.2 : this.state === 'off-hook' ? 0.25 * (Math.sin(time * 9) > 0 ? 1 : 0) : 0;
    this.led.uniforms.uEmissive.value.setRGB(glow, glow * 0.12, glow * 0.06);
    if (this.state === 'ringing' || this.state === 'idle') {
      const j = this.ringOn ? 1 : 0;
      const n = (k) => Math.sin(time * (61 + k * 17) + k * 2.1) * Math.sin(time * (37 + k * 11));
      this.handset.position.set(this.cradle.x + j * 0.003 * n(1), this.cradle.y + j * 0.004 * Math.abs(n(2)), this.cradle.z);
      this.handset.rotation.set(0, j * 0.04 * n(3), j * 0.05 * n(4));
    }
  }

  distanceTo(x, z) {
    return Math.hypot(this.x - x, this.z - z);
  }

  dispose() {
    this.scene.remove(this.group);
    this.world.removeProp(this.box);
    this.group.traverse((o) => o.geometry?.dispose());
    for (const m of this.materials) m.dispose();
  }
}
