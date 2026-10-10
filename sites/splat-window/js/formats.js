// Gaussian splat file parsers.
//
// Every format is decoded into the same in-memory "splat set":
//   count     number of splats
//   position  Float32Array(3n)  centre
//   scale     Float32Array(3n)  standard deviation along each local axis (linear, not log)
//   rotation  Float32Array(4n)  unit quaternion, (w, x, y, z)
//   color     Uint8Array(4n)    sRGB colour + opacity in alpha
//   group     Uint8Array(n)     index of the animated transform the splat follows (0 = static)

export const SH_C0 = 0.28209479177387814;

export function createSplatSet(count) {
  return {
    count,
    position: new Float32Array(count * 3),
    scale: new Float32Array(count * 3),
    rotation: new Float32Array(count * 4),
    color: new Uint8Array(count * 4),
    group: new Uint8Array(count),
  };
}

export function detectFormat(buffer, name = '') {
  const head = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));
  if (head[0] === 0x70 && head[1] === 0x6c && head[2] === 0x79) return 'ply'; // "ply"
  if (head[0] === 0x1f && head[1] === 0x8b) {
    throw new Error('Compressed (.spz / gzip) files are not supported yet — export as .ply or .splat.');
  }
  if (/\.splat$/i.test(name) || buffer.byteLength % 32 === 0) return 'splat';
  throw new Error('Unrecognised file. Expected a 3D Gaussian Splatting .ply or a .splat file.');
}

export function parseSplatFile(buffer, name) {
  return detectFormat(buffer, name) === 'ply' ? parsePly(buffer) : parseSplat(buffer);
}

// .splat (antimatter15): 32 bytes per splat
//   float32 x, y, z | float32 sx, sy, sz | uint8 r, g, b, a | uint8 qw, qx, qy, qz (q * 128 + 128)
export function parseSplat(buffer) {
  const n = Math.floor(buffer.byteLength / 32);
  if (n === 0) throw new Error('The .splat file is empty.');
  const f32 = new Float32Array(buffer, 0, n * 8);
  const u8 = new Uint8Array(buffer, 0, n * 32);
  const set = createSplatSet(n);
  const { position, scale, rotation, color } = set;
  for (let i = 0; i < n; i++) {
    const f = i * 8;
    const b = i * 32;
    position[i * 3] = f32[f];
    position[i * 3 + 1] = f32[f + 1];
    position[i * 3 + 2] = f32[f + 2];
    scale[i * 3] = f32[f + 3];
    scale[i * 3 + 1] = f32[f + 4];
    scale[i * 3 + 2] = f32[f + 5];
    color[i * 4] = u8[b + 24];
    color[i * 4 + 1] = u8[b + 25];
    color[i * 4 + 2] = u8[b + 26];
    color[i * 4 + 3] = u8[b + 27];
    const qw = (u8[b + 28] - 128) / 128;
    const qx = (u8[b + 29] - 128) / 128;
    const qy = (u8[b + 30] - 128) / 128;
    const qz = (u8[b + 31] - 128) / 128;
    writeQuat(rotation, i, qw, qx, qy, qz);
  }
  return set;
}

const PLY_TYPES = {
  char: ['getInt8', 1], int8: ['getInt8', 1],
  uchar: ['getUint8', 1], uint8: ['getUint8', 1],
  short: ['getInt16', 2], int16: ['getInt16', 2],
  ushort: ['getUint16', 2], uint16: ['getUint16', 2],
  int: ['getInt32', 4], int32: ['getInt32', 4],
  uint: ['getUint32', 4], uint32: ['getUint32', 4],
  float: ['getFloat32', 4], float32: ['getFloat32', 4],
  double: ['getFloat64', 8], float64: ['getFloat64', 8],
};

// Binary little-endian PLY as written by the reference 3D Gaussian Splatting
// trainer (and most tools that export it): x y z, f_dc_*, f_rest_*, opacity,
// scale_* (log), rot_* (w x y z). Plain coloured point clouds also load.
export function parsePly(buffer) {
  const bytes = new Uint8Array(buffer);
  const headerEnd = findHeaderEnd(bytes);
  const header = new TextDecoder().decode(bytes.subarray(0, headerEnd));
  const lines = header.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines[0] !== 'ply') throw new Error('Not a PLY file.');

  const elements = [];
  let format = null;
  for (const line of lines.slice(1)) {
    const parts = line.split(/\s+/);
    if (parts[0] === 'format') format = parts[1];
    else if (parts[0] === 'element') elements.push({ name: parts[1], count: parseInt(parts[2], 10), props: [], stride: 0 });
    else if (parts[0] === 'property') {
      const el = elements[elements.length - 1];
      if (!el) throw new Error('Malformed PLY header.');
      if (parts[1] === 'list') {
        el.hasList = true;
        continue;
      }
      const type = PLY_TYPES[parts[1]];
      if (!type) throw new Error(`Unsupported PLY property type "${parts[1]}".`);
      el.props.push({ name: parts[2], getter: type[0], offset: el.stride });
      el.stride += type[1];
    }
  }
  if (format !== 'binary_little_endian') {
    throw new Error(`Only binary little-endian PLY files are supported (this one is "${format}").`);
  }

  let offset = headerEnd;
  let vertex = null;
  for (const el of elements) {
    if (el.name === 'vertex') {
      vertex = el;
      break;
    }
    if (el.hasList) throw new Error(`Cannot skip PLY element "${el.name}" with list properties.`);
    offset += el.stride * el.count;
  }
  if (!vertex) throw new Error('PLY file has no vertex element.');
  if (vertex.hasList) throw new Error('PLY vertex element with list properties is not supported.');

  const n = vertex.count;
  if (offset + n * vertex.stride > buffer.byteLength) throw new Error('PLY file is truncated.');
  const prop = Object.fromEntries(vertex.props.map((p) => [p.name, p]));
  if (!prop.x || !prop.y || !prop.z) throw new Error('PLY vertices have no x/y/z.');

  const view = new DataView(buffer);
  const reader = (name) => {
    const p = prop[name];
    if (!p) return null;
    const get = view[p.getter].bind(view);
    return (base) => get(base + p.offset, true);
  };
  const rx = reader('x'), ry = reader('y'), rz = reader('z');
  const rs = ['scale_0', 'scale_1', 'scale_2'].map(reader);
  const rq = ['rot_0', 'rot_1', 'rot_2', 'rot_3'].map(reader);
  const rdc = ['f_dc_0', 'f_dc_1', 'f_dc_2'].map(reader);
  const rrgb = ['red', 'green', 'blue'].map(reader);
  const rop = reader('opacity');
  const hasScale = rs.every(Boolean);
  const hasRot = rq.every(Boolean);
  const hasDc = rdc.every(Boolean);
  const hasRgb = rrgb.every(Boolean);

  const set = createSplatSet(n);
  const { position, scale, rotation, color } = set;
  for (let i = 0; i < n; i++) {
    const base = offset + i * vertex.stride;
    position[i * 3] = rx(base);
    position[i * 3 + 1] = ry(base);
    position[i * 3 + 2] = rz(base);
    if (hasScale) {
      scale[i * 3] = Math.exp(rs[0](base));
      scale[i * 3 + 1] = Math.exp(rs[1](base));
      scale[i * 3 + 2] = Math.exp(rs[2](base));
    }
    if (hasRot) writeQuat(rotation, i, rq[0](base), rq[1](base), rq[2](base), rq[3](base));
    else writeQuat(rotation, i, 1, 0, 0, 0);
    if (hasDc) {
      color[i * 4] = toByte(0.5 + SH_C0 * rdc[0](base));
      color[i * 4 + 1] = toByte(0.5 + SH_C0 * rdc[1](base));
      color[i * 4 + 2] = toByte(0.5 + SH_C0 * rdc[2](base));
    } else if (hasRgb) {
      color[i * 4] = rrgb[0](base);
      color[i * 4 + 1] = rrgb[1](base);
      color[i * 4 + 2] = rrgb[2](base);
    } else {
      color[i * 4] = color[i * 4 + 1] = color[i * 4 + 2] = 200;
    }
    color[i * 4 + 3] = rop ? toByte(1 / (1 + Math.exp(-rop(base)))) : 255;
  }

  if (!hasScale) {
    // A plain point cloud: give every point a size from the average spacing.
    const b = bounds(position, n);
    const extent = Math.max(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]);
    const s = (extent / Math.cbrt(n)) * 0.35;
    scale.fill(s);
  }
  return set;
}

function findHeaderEnd(bytes) {
  const marker = 'end_header';
  const limit = Math.min(bytes.length, 64 * 1024);
  outer: for (let i = 0; i < limit - marker.length; i++) {
    for (let j = 0; j < marker.length; j++) {
      if (bytes[i + j] !== marker.charCodeAt(j)) continue outer;
    }
    let end = i + marker.length;
    if (bytes[end] === 0x0d) end++;
    if (bytes[end] === 0x0a) end++;
    return end;
  }
  throw new Error('PLY header has no end_header.');
}

function writeQuat(out, i, w, x, y, z) {
  const len = Math.hypot(w, x, y, z) || 1;
  out[i * 4] = w / len;
  out[i * 4 + 1] = x / len;
  out[i * 4 + 2] = y / len;
  out[i * 4 + 3] = z / len;
}

function toByte(v) {
  return v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255);
}

export function bounds(position, n) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) {
      const v = position[i * 3 + k];
      if (v < min[k]) min[k] = v;
      if (v > max[k]) max[k] = v;
    }
  }
  return { min, max };
}
