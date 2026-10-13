// Worker: decodes scenes, packs them into the GPU texture layout and keeps
// re-sorting splats by depth so the main thread never stalls.

import { parseSplatFile } from './formats.js';
import { generateOrrery } from './orrery.js';
import { eulerDegrees } from './math.js';

// Two RGBA32UI texels per splat, 1024 splats per texture row:
//   texel 0: float bits of x, y, z | rgba8
//   texel 1: half-float pairs of the 3D covariance (xx,xy) (xz,yy) (yz,zz) | group id
const SPLATS_PER_ROW = 1024;
const COV_SCALE = 16; // keeps tiny covariances out of half-float denormals; the shader divides it back out

let scene = null;
const counts = new Uint32Array(65536);

self.onmessage = (e) => {
  const msg = e.data;
  try {
    if (msg.type === 'load') load(msg);
    else if (msg.type === 'sort') sort(msg);
  } catch (err) {
    console.error(err);
    self.postMessage({ type: 'error', token: msg.token, message: err.message || String(err) });
  }
};

function load({ token, procedural, buffer, name, preset = {}, maxTextureSize = 4096 }) {
  const set = procedural ? generateOrrery() : parseSplatFile(buffer, name);
  const maxCount = maxTextureSize * SPLATS_PER_ROW;
  const packed = pack(set, procedural ? null : preset, maxCount);
  scene = {
    token,
    count: packed.count,
    position: packed.position,
    group: packed.group,
    depth: new Float32Array(packed.count),
    keys: new Uint16Array(packed.count),
  };
  self.postMessage(
    {
      type: 'loaded',
      token,
      count: packed.count,
      sourceCount: set.count,
      width: SPLATS_PER_ROW * 2,
      height: Math.ceil(packed.count / SPLATS_PER_ROW),
      data: packed.data,
    },
    [packed.data.buffer],
  );
}

// ------------------------------------------------------------------ framing

// Captured scenes come in whatever units and orientation the capture used.
// Find a robust centre and size, then rotate, scale and place the scene so it
// sits where the preset wants it inside the window box.
function framing(set, preset) {
  const n = set.count;
  const stride = Math.max(1, Math.floor(n / 60000));
  const xs = [], ys = [], zs = [];
  for (let i = 0; i < n; i += stride) {
    if (set.color[i * 4 + 3] < 64) continue;
    xs.push(set.position[i * 3]);
    ys.push(set.position[i * 3 + 1]);
    zs.push(set.position[i * 3 + 2]);
  }
  if (xs.length === 0) for (let i = 0; i < n; i += stride) {
    xs.push(set.position[i * 3]);
    ys.push(set.position[i * 3 + 1]);
    zs.push(set.position[i * 3 + 2]);
  }
  const center = preset.center || [median(xs), median(ys), median(zs)];
  const dists = xs.map((x, i) => Math.hypot(x - center[0], ys[i] - center[1], zs[i] - center[2]));
  dists.sort((a, b) => a - b);
  const radius = dists[Math.floor(dists.length * 0.8)] || 1;

  const r = eulerDegrees(preset.rotation || [0, 0, 0]);
  const k = (preset.size ?? 0.35) / radius;
  return {
    center,
    radius,
    crop: preset.crop ? preset.crop * radius : Infinity,
    maxScale: preset.maxScale ? preset.maxScale / k : Infinity,
    // 3x3 rotation * scale, row-major for the packing loop
    a: [r[0] * k, r[4] * k, r[8] * k, r[1] * k, r[5] * k, r[9] * k, r[2] * k, r[6] * k, r[10] * k],
    offset: preset.position || [0, 0, -0.5],
  };
}

function median(values) {
  const sorted = Float32Array.from(values).sort();
  return sorted[sorted.length >> 1] ?? 0;
}

// ------------------------------------------------------------------ packing

function pack(set, preset, maxCount) {
  const n = set.count;
  const f = preset
    ? framing(set, preset)
    : { center: [0, 0, 0], crop: Infinity, maxScale: Infinity, a: [1, 0, 0, 0, 1, 0, 0, 0, 1], offset: [0, 0, 0] };
  const { center, crop, maxScale, a, offset } = f;

  // Keep visible splats inside the crop sphere, minus oversized ones (sky).
  const keep = new Uint32Array(n);
  let m = 0;
  for (let i = 0; i < n && m < maxCount; i++) {
    if (set.color[i * 4 + 3] < 2) continue;
    if (Math.max(set.scale[i * 3], set.scale[i * 3 + 1], set.scale[i * 3 + 2]) > maxScale) continue;
    if (crop !== Infinity) {
      const dx = set.position[i * 3] - center[0];
      const dy = set.position[i * 3 + 1] - center[1];
      const dz = set.position[i * 3 + 2] - center[2];
      if (dx * dx + dy * dy + dz * dz > crop * crop) continue;
    }
    keep[m++] = i;
  }

  const rows = Math.ceil(m / SPLATS_PER_ROW);
  const data = new Uint32Array(rows * SPLATS_PER_ROW * 8);
  const floats = new Float32Array(data.buffer);
  const position = new Float32Array(m * 3);
  const group = new Uint8Array(m);
  const M = new Float64Array(9);

  for (let j = 0; j < m; j++) {
    const i = keep[j];
    const px = set.position[i * 3] - center[0];
    const py = set.position[i * 3 + 1] - center[1];
    const pz = set.position[i * 3 + 2] - center[2];
    const x = a[0] * px + a[1] * py + a[2] * pz + offset[0];
    const y = a[3] * px + a[4] * py + a[5] * pz + offset[1];
    const z = a[6] * px + a[7] * py + a[8] * pz + offset[2];
    position[j * 3] = x;
    position[j * 3 + 1] = y;
    position[j * 3 + 2] = z;
    group[j] = set.group[i];

    // Covariance = M Mᵀ with M = A · R(q) · S
    const qw = set.rotation[i * 4], qx = set.rotation[i * 4 + 1], qy = set.rotation[i * 4 + 2], qz = set.rotation[i * 4 + 3];
    const sx = set.scale[i * 3], sy = set.scale[i * 3 + 1], sz = set.scale[i * 3 + 2];
    const r00 = 1 - 2 * (qy * qy + qz * qz), r01 = 2 * (qx * qy - qw * qz), r02 = 2 * (qx * qz + qw * qy);
    const r10 = 2 * (qx * qy + qw * qz), r11 = 1 - 2 * (qx * qx + qz * qz), r12 = 2 * (qy * qz - qw * qx);
    const r20 = 2 * (qx * qz - qw * qy), r21 = 2 * (qy * qz + qw * qx), r22 = 1 - 2 * (qx * qx + qy * qy);
    for (let row = 0; row < 3; row++) {
      const a0 = a[row * 3], a1 = a[row * 3 + 1], a2 = a[row * 3 + 2];
      M[row * 3] = (a0 * r00 + a1 * r10 + a2 * r20) * sx;
      M[row * 3 + 1] = (a0 * r01 + a1 * r11 + a2 * r21) * sy;
      M[row * 3 + 2] = (a0 * r02 + a1 * r12 + a2 * r22) * sz;
    }
    const sxx = dot3(M, 0, 0), sxy = dot3(M, 0, 1), sxz = dot3(M, 0, 2);
    const syy = dot3(M, 1, 1), syz = dot3(M, 1, 2), szz = dot3(M, 2, 2);

    const o = j * 8;
    floats[o] = x;
    floats[o + 1] = y;
    floats[o + 2] = z;
    data[o + 3] =
      (set.color[i * 4] | (set.color[i * 4 + 1] << 8) | (set.color[i * 4 + 2] << 16) | (set.color[i * 4 + 3] << 24)) >>> 0;
    data[o + 4] = packHalf2(sxx * COV_SCALE, sxy * COV_SCALE);
    data[o + 5] = packHalf2(sxz * COV_SCALE, syy * COV_SCALE);
    data[o + 6] = packHalf2(syz * COV_SCALE, szz * COV_SCALE);
    data[o + 7] = set.group[i];
  }
  return { count: m, data, position, group };
}

function dot3(M, r1, r2) {
  return M[r1 * 3] * M[r2 * 3] + M[r1 * 3 + 1] * M[r2 * 3 + 1] + M[r1 * 3 + 2] * M[r2 * 3 + 2];
}

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);

function toHalf(value) {
  f32[0] = value;
  const x = u32[0];
  const sign = (x >>> 16) & 0x8000;
  const exp = ((x >>> 23) & 0xff) - 112; // rebias 127 -> 15
  const mant = x & 0x7fffff;
  if (exp <= 0) {
    if (exp < -10) return sign;
    const m = (mant | 0x800000) >>> (1 - exp);
    return sign | ((m + 0x1000) >>> 13);
  }
  if (exp >= 31) return sign | 0x7bff; // clamp to the largest finite half
  const h = sign | (exp << 10) | (mant >>> 13);
  return mant & 0x1000 && (h & 0x7fff) < 0x7bff ? h + 1 : h;
}

function packHalf2(lo, hi) {
  return (toHalf(lo) | (toHalf(hi) << 16)) >>> 0;
}

// ------------------------------------------------------------------ sorting

// rows: for every group, the third row of its transform (the world-space z of
// a splat is dot(row.xyz, p) + row.w). The window camera never rotates, so
// sorting by world z — nearest the viewer first — is exactly view-depth order.
function sort({ token, rows, buffer }) {
  if (!scene || scene.token !== token) {
    self.postMessage({ type: 'sorted', token, indices: buffer || null, stale: true }, buffer ? [buffer.buffer] : []);
    return;
  }
  const { count: n, position, group, depth, keys } = scene;
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < n; i++) {
    const g = group[i] * 4;
    const d = -(rows[g] * position[i * 3] + rows[g + 1] * position[i * 3 + 1] + rows[g + 2] * position[i * 3 + 2] + rows[g + 3]);
    depth[i] = d;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  const scale = max > min ? 65535 / (max - min) : 0;
  counts.fill(0);
  for (let i = 0; i < n; i++) {
    const k = ((depth[i] - min) * scale) | 0;
    keys[i] = k;
    counts[k]++;
  }
  let sum = 0;
  for (let k = 0; k < 65536; k++) {
    const c = counts[k];
    counts[k] = sum;
    sum += c;
  }
  const indices = buffer && buffer.length === n ? buffer : new Uint32Array(n);
  for (let i = 0; i < n; i++) indices[counts[keys[i]]++] = i;
  self.postMessage({ type: 'sorted', token, indices }, [indices.buffer]);
}
