// Streams the endless floor plan in and out around the player, CHUNK x CHUNK
// cells at a time: one mesh each for walls, floor, ceiling and light panels,
// plus a small baked occlusion map that darkens the floor and ceiling where
// they meet the walls.

import * as THREE from 'three';
import { CELL, CHUNK, HEIGHT } from './world.js';

const SIZE = CELL * CHUNK;
const AO_RES = 128; // texels across a chunk (~22 cm each)
const AO_PAD = 12; // texels of neighbouring chunks rasterised for continuity

export class ChunkManager {
  constructor(world, materials, scene, radius = 3) {
    this.world = world;
    this.materials = materials;
    this.scene = scene;
    this.radius = radius;
    this.chunks = new Map();
    this.panelGeometry = panelGeometry();
    this.plane = new THREE.PlaneGeometry(SIZE, SIZE);
  }

  // Build missing chunks near (x, z), nearest first, at most `budget` per call.
  update(x, z, budget = 2) {
    const ci = Math.floor(x / SIZE), cj = Math.floor(z / SIZE);
    const wanted = [];
    for (let i = ci - this.radius; i <= ci + this.radius; i++) {
      for (let j = cj - this.radius; j <= cj + this.radius; j++) {
        const key = `${i},${j}`;
        if (!this.chunks.has(key)) wanted.push([(i - ci) ** 2 + (j - cj) ** 2, i, j, key]);
      }
    }
    wanted.sort((a, b) => a[0] - b[0]);
    for (const [, i, j, key] of wanted.slice(0, budget)) this.chunks.set(key, this.build(i, j));

    for (const [key, chunk] of this.chunks) {
      if (Math.abs(chunk.i - ci) > this.radius + 1 || Math.abs(chunk.j - cj) > this.radius + 1) {
        this.dispose(chunk);
        this.chunks.delete(key);
      }
    }
    return wanted.length - Math.min(budget, wanted.length);
  }

  build(ci, cj) {
    const group = new THREE.Group();
    const x0 = ci * SIZE, z0 = cj * SIZE;
    const i0 = ci * CHUNK, j0 = cj * CHUNK;

    // Walls and pillars owned by this chunk's cells.
    const boxes = [];
    for (let i = i0; i < i0 + CHUNK; i++) for (let j = j0; j < j0 + CHUNK; j++) boxes.push(...this.world.cellBoxes(i, j));
    if (boxes.length) group.add(new THREE.Mesh(boxGeometry(boxes), this.materials.wall));

    // Floor and ceiling, darkened near anything standing on them.
    const occlusion = this.occlusion(i0, j0, x0, z0);
    const centre = new THREE.Vector3(x0 + SIZE / 2, 0, z0 + SIZE / 2);
    const floorMaterial = this.materials.floor();
    const ceilingMaterial = this.materials.ceiling();
    for (const m of [floorMaterial, ceilingMaterial]) {
      m.uniforms.uOcclusion.value = occlusion;
      m.uniforms.uChunk.value.set(x0, z0, SIZE);
    }
    const floor = new THREE.Mesh(this.plane, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.copy(centre);
    const ceiling = new THREE.Mesh(this.plane, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(centre.x, HEIGHT, centre.z);
    group.add(floor, ceiling);

    const panels = new THREE.Mesh(this.panelGeometry, this.materials.panel);
    panels.position.set(x0, 0, z0);
    group.add(panels);

    this.scene.add(group);
    return { i: ci, j: cj, group, occlusion, floorMaterial, ceilingMaterial };
  }

  // Rasterise wall footprints (including the neighbours' edge cells) and blur them.
  occlusion(i0, j0, x0, z0) {
    const res = AO_RES + AO_PAD * 2;
    const scale = AO_RES / SIZE;
    const grid = new Float32Array(res * res);
    for (let i = i0 - 1; i <= i0 + CHUNK; i++) {
      for (let j = j0 - 1; j <= j0 + CHUNK; j++) {
        for (const [bx0, bx1, bz0, bz1, by0] of this.world.cellBoxes(i, j)) {
          if (by0 > 0.5) continue; // door headers don't touch the floor
          const u0 = Math.max(0, Math.floor((bx0 - x0) * scale) + AO_PAD);
          const u1 = Math.min(res - 1, Math.ceil((bx1 - x0) * scale) + AO_PAD);
          const v0 = Math.max(0, Math.floor((bz0 - z0) * scale) + AO_PAD);
          const v1 = Math.min(res - 1, Math.ceil((bz1 - z0) * scale) + AO_PAD);
          for (let v = v0; v <= v1; v++) for (let u = u0; u <= u1; u++) grid[v * res + u] = 1;
        }
      }
    }
    let a = grid, b = new Float32Array(res * res);
    for (let pass = 0; pass < 3; pass++) {
      blur(a, b, res, 4, 1, res);
      blur(b, a, res, 4, res, 1);
    }
    const data = new Uint8Array(AO_RES * AO_RES);
    for (let v = 0; v < AO_RES; v++) {
      for (let u = 0; u < AO_RES; u++) {
        const occ = Math.min(1, a[(v + AO_PAD) * res + u + AO_PAD] * 2.2);
        data[v * AO_RES + u] = Math.round((1 - occ) * 255);
      }
    }
    const tex = new THREE.DataTexture(data, AO_RES, AO_RES, THREE.RedFormat, THREE.UnsignedByteType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  dispose(chunk) {
    this.scene.remove(chunk.group);
    for (const child of chunk.group.children) {
      if (child.geometry !== this.plane && child.geometry !== this.panelGeometry) child.geometry.dispose();
    }
    chunk.occlusion.dispose();
    chunk.floorMaterial.dispose();
    chunk.ceilingMaterial.dispose();
  }

  get count() {
    return this.chunks.size;
  }
}

// Box blur of radius r along one axis (step = 1 for rows, res for columns).
function blur(src, dst, res, r, step, lineStep) {
  const w = 1 / (2 * r + 1);
  for (let line = 0; line < res; line++) {
    const base = line * lineStep;
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += src[base + Math.min(res - 1, Math.max(0, k)) * step];
    for (let k = 0; k < res; k++) {
      dst[base + k * step] = acc * w;
      const out = Math.max(0, k - r), inn = Math.min(res - 1, k + r + 1);
      acc += src[base + inn * step] - src[base + out * step];
    }
  }
}

// One mesh for many boxes [x0, x1, z0, z1, y0, y1]; four sides and the
// underside (visible under door headers). Tops are hidden by the ceiling.
function boxGeometry(boxes) {
  const pos = [], nor = [];
  const quad = (a, b, c, d, n) => {
    for (const p of [a, b, c, a, c, d]) pos.push(...p);
    for (let k = 0; k < 6; k++) nor.push(...n);
  };
  for (const [x0, x1, z0, z1, y0, y1] of boxes) {
    quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0]);
    quad([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0], [-1, 0, 0]);
    quad([x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1], [0, 0, 1]);
    quad([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [0, 0, -1]);
    if (y0 > 0) quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.computeBoundingSphere();
  return g;
}

// A 1.2 m square fluorescent panel in the middle of every cell's ceiling,
// facing down; positioned per chunk.
function panelGeometry() {
  const pos = [], nor = [];
  const y = HEIGHT - 0.004;
  for (let i = 0; i < CHUNK; i++) {
    for (let j = 0; j < CHUNK; j++) {
      const cx = (i + 0.5) * CELL, cz = (j + 0.5) * CELL, h = 0.6;
      const a = [cx - h, y, cz - h], b = [cx + h, y, cz - h], c = [cx + h, y, cz + h], d = [cx - h, y, cz + h];
      for (const p of [a, b, c, a, c, d]) pos.push(...p);
      for (let k = 0; k < 6; k++) nor.push(0, -1, 0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.computeBoundingSphere();
  return g;
}
