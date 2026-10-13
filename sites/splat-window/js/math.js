// Small column-major 4x4 matrix helpers (same layout WebGL expects).

export function identity(out = new Float32Array(16)) {
  out.fill(0);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}

export function multiply(a, b, out = new Float32Array(16)) {
  const r = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let row = 0; row < 4; row++) {
      r[c * 4 + row] =
        a[row] * b[c * 4] + a[4 + row] * b[c * 4 + 1] + a[8 + row] * b[c * 4 + 2] + a[12 + row] * b[c * 4 + 3];
    }
  }
  out.set(r);
  return out;
}

export function translation(x, y, z, out = new Float32Array(16)) {
  identity(out);
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

export function scaling(x, y = x, z = x, out = new Float32Array(16)) {
  identity(out);
  out[0] = x;
  out[5] = y;
  out[10] = z;
  return out;
}

export function rotationX(a, out = new Float32Array(16)) {
  identity(out);
  const c = Math.cos(a), s = Math.sin(a);
  out[5] = c; out[6] = s;
  out[9] = -s; out[10] = c;
  return out;
}

export function rotationY(a, out = new Float32Array(16)) {
  identity(out);
  const c = Math.cos(a), s = Math.sin(a);
  out[0] = c; out[2] = -s;
  out[8] = s; out[10] = c;
  return out;
}

export function rotationZ(a, out = new Float32Array(16)) {
  identity(out);
  const c = Math.cos(a), s = Math.sin(a);
  out[0] = c; out[1] = s;
  out[4] = -s; out[5] = c;
  return out;
}

// Rotation from Euler angles in degrees, applied X, then Y, then Z.
export function eulerDegrees([x = 0, y = 0, z = 0] = [], out = new Float32Array(16)) {
  const d = Math.PI / 180;
  return multiply(rotationZ(z * d), multiply(rotationY(y * d), rotationX(x * d)), out);
}

// Chain of matrices applied right-to-left, like writing A * B * C.
export function compose(...ms) {
  return ms.reduce((acc, m) => multiply(acc, m));
}

export function transformPoint(m, [x, y, z]) {
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

// Off-axis ("window") projection. The screen is a pane of glass centred on the
// origin in the z = 0 plane, `aspect` units wide and 1 unit tall. The eye sits
// at `eye` (z > 0, in front of the glass) and always looks straight through it,
// so the view never rotates; only the frustum shears as the head moves.
export function windowCamera(eye, aspect, near = 0.02, far = 200) {
  const [ex, ey, ez] = eye;
  const k = near / ez;
  const l = (-aspect / 2 - ex) * k;
  const r = (aspect / 2 - ex) * k;
  const b = (-0.5 - ey) * k;
  const t = (0.5 - ey) * k;
  const proj = new Float32Array(16);
  proj[0] = (2 * near) / (r - l);
  proj[5] = (2 * near) / (t - b);
  proj[8] = (r + l) / (r - l);
  proj[9] = (t + b) / (t - b);
  proj[10] = -(far + near) / (far - near);
  proj[11] = -1;
  proj[14] = (-2 * far * near) / (far - near);
  return { proj, view: translation(-ex, -ey, -ez) };
}
