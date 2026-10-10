// Level 0: an endless, deterministic layout of yellow rooms.
//
// The floor plan is a pure function of the seed. Rooms sit on a grid of
// CELL-sized squares; walls run along the grid lines in broken runs (so you
// get long corridors with openings as well as pockets of small rooms), some
// with doorways cut into them, and the odd square pillar stands in the open.
// Every cell has a fluorescent panel in the middle of its ceiling. Whether a
// panel is lit, dead or flickering is decided by the same integer hash on the
// CPU and in the shaders (see shaders.js), so the two always agree.

export const CELL = 3.6; // metres; six 0.6 m ceiling tiles
export const HEIGHT = 2.75; // floor to ceiling
export const WALL = 0.16; // wall thickness
export const CHUNK = 8; // cells per chunk side
export const DOOR = { width: 1.1, height: 2.15 };
export const PILLAR = 0.72;

// lowbias32 (Chris Wellons). Written with Math.imul so it matches the GLSL
// version bit for bit.
export function hash32(x) {
  x >>>= 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

export function hash3(i, j, k, seed) {
  const h = hash32((Math.imul(i, 73856093) ^ hash32((Math.imul(j, 19349663) ^ hash32((k + seed) >>> 0)) >>> 0)) >>> 0);
  return h / 4294967296;
}

// How a ceiling panel behaves: 0 = dead, 1 = steady, 2 = flickering.
export function lightKind(i, j, seed) {
  const r = hash3(i, j, 5, seed);
  return r < 0.07 ? 0 : r > 0.965 ? 2 : 1;
}

// Smooth 1D value noise along a grid line, so walls come in runs.
function lineNoise(t, line, axis, seed) {
  const i = Math.floor(t);
  const f = t - i;
  const a = hash3(i, line, 11 + axis, seed);
  const b = hash3(i + 1, line, 11 + axis, seed);
  const s = f * f * (3 - 2 * f);
  return a + (b - a) * s;
}

// 2D value noise: some regions are open halls, others tight mazes.
function areaNoise(x, y, seed) {
  const i = Math.floor(x), j = Math.floor(y);
  const fx = x - i, fy = y - j;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const v = (a, b) => hash3(i + a, j + b, 21, seed);
  const top = v(0, 0) + (v(1, 0) - v(0, 0)) * sx;
  const bottom = v(0, 1) + (v(1, 1) - v(0, 1)) * sx;
  return top + (bottom - top) * sy;
}

// Fraction of grid lines that carry wall: low in the big pillared halls,
// higher where it turns into a maze.
function density(i, j, seed) {
  const n = areaNoise(i * 0.11 + 0.37, j * 0.11 - 0.61, seed);
  return 0.32 + 0.4 * Math.min(1, Math.max(0, (n - 0.2) / 0.6));
}

export class World {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.chunks = new Map();
  }

  // Wall on the east (axis 0) or north (axis 1) edge of cell (i, j)?
  // Returns null, or { door } with the doorway's centre along the edge (0..1).
  edge(axis, i, j) {
    const along = axis === 0 ? j : i;
    const line = axis === 0 ? i : j;
    const n = lineNoise(along * 0.55, line, axis, this.seed);
    if (n < 1 - density(i, j, this.seed)) return null;
    const d = hash3(i, j, 31 + axis, this.seed);
    return { door: d < 0.3 ? 0.3 + d * 1.3 : null };
  }

  pillar(i, j) {
    // A pillar at the corner (i, j) of the grid, only where no wall meets it.
    if (hash3(i, j, 41, this.seed) > 0.3) return false;
    return !this.edge(0, i - 1, j) && !this.edge(0, i - 1, j - 1) && !this.edge(1, i, j - 1) && !this.edge(1, i - 1, j - 1);
  }

  // Solid boxes for the cell (i, j): the walls on its east and north edges
  // and a pillar on its south-west corner. [x0, x1, z0, z1, y0, y1]
  cellBoxes(i, j) {
    const boxes = [];
    const x0 = i * CELL, z0 = j * CELL;
    const t = WALL / 2;
    for (const axis of [0, 1]) {
      const e = this.edge(axis, i, j);
      if (!e) continue;
      // Run along the edge from a to b (z for axis 0, x for axis 1).
      const a = (axis === 0 ? z0 : x0) - t;
      const b = (axis === 0 ? z0 : x0) + CELL + t;
      const fixed = axis === 0 ? x0 + CELL : z0 + CELL;
      const box = (p, q, y0, y1) =>
        axis === 0 ? [fixed - t, fixed + t, p, q, y0, y1] : [p, q, fixed - t, fixed + t, y0, y1];
      if (e.door === null) {
        boxes.push(box(a, b, 0, HEIGHT));
      } else {
        const c = (axis === 0 ? z0 : x0) + e.door * CELL;
        const g0 = c - DOOR.width / 2, g1 = c + DOOR.width / 2;
        boxes.push(box(a, g0, 0, HEIGHT), box(g1, b, 0, HEIGHT), box(g0, g1, DOOR.height, HEIGHT));
      }
    }
    if (this.pillar(i, j)) {
      const h = PILLAR / 2;
      boxes.push([x0 - h, x0 + h, z0 - h, z0 + h, 0, HEIGHT]);
    }
    return boxes;
  }

  // Can you walk from cell (i, j) to its neighbour (di, dj)? Doorways count.
  passable(i, j, di, dj) {
    const e = di === 1 ? this.edge(0, i, j) : di === -1 ? this.edge(0, i - 1, j) : dj === 1 ? this.edge(1, i, j) : this.edge(1, i, j - 1);
    return !e || e.door !== null;
  }

  // A starting cell with plenty of rooms reachable from it, searching
  // outwards from the origin so nobody begins in a sealed pocket.
  findSpawn() {
    for (let r = 0; r < 12; r++) {
      for (let i = -r; i <= r; i++) {
        for (let j = -r; j <= r; j++) {
          if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
          if (this.pillarAround(i, j)) continue;
          if (this.reachable(i, j, 300) >= 300) return [(i + 0.5) * CELL, (j + 0.5) * CELL];
        }
      }
    }
    return [CELL / 2, CELL / 2];
  }

  pillarAround(i, j) {
    return this.pillar(i, j) || this.pillar(i + 1, j) || this.pillar(i, j + 1) || this.pillar(i + 1, j + 1);
  }

  reachable(i0, j0, limit) {
    const seen = new Set([`${i0},${j0}`]);
    const queue = [[i0, j0]];
    while (queue.length && seen.size < limit) {
      const [i, j] = queue.shift();
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${i + di},${j + dj}`;
        if (!seen.has(key) && this.passable(i, j, di, dj)) {
          seen.add(key);
          queue.push([i + di, j + dj]);
        }
      }
    }
    return seen.size;
  }

  // Boxes a body at (x, z) could touch: the 3x3 cells around it (plus the
  // neighbours whose east/north walls bound those cells).
  nearbyBoxes(x, z) {
    const ci = Math.floor(x / CELL), cj = Math.floor(z / CELL);
    const out = [];
    for (let i = ci - 2; i <= ci + 1; i++) {
      for (let j = cj - 2; j <= cj + 1; j++) {
        for (const b of this.cellBoxes(i, j)) if (b[4] < 1.8) out.push(b);
      }
    }
    return out;
  }
}
