// WebGL2 Gaussian splat renderer with an off-axis "window" camera.
//
// Splats are drawn as screen-space ellipses (the EWA projection used by 3D
// Gaussian Splatting), sorted nearest-first and composited front-to-back.
// After them, a full-screen pass ray-casts the box behind the glass (or a
// plain backdrop) into whatever coverage the splats left.

import { windowCamera } from './math.js';

export const MAX_GROUPS = 32;
export const MAX_SHADOWS = 8;

const SPLAT_VS = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

uniform usampler2D u_data;
uniform mat4 u_view;
uniform mat4 u_proj;
uniform mat4 u_groups[${MAX_GROUPS}];
uniform vec2 u_focal;
uniform vec2 u_viewport;
uniform vec4 u_box; // half width, half height, depth, clip-to-box flag

in uint a_index;

out vec4 v_color;
out vec2 v_pos;

void main() {
  ivec2 uv = ivec2(int((a_index & 1023u) << 1), int(a_index >> 10));
  uvec4 t0 = texelFetch(u_data, uv, 0);
  uvec4 t1 = texelFetch(u_data, uv + ivec2(1, 0), 0);

  mat4 group = u_groups[t1.w & 31u];
  vec4 world = group * vec4(uintBitsToFloat(t0.xyz), 1.0);

  // Behind the glass, anything outside the box is inside its walls.
  if (u_box.w > 0.5 && world.z < 0.0 &&
      (abs(world.x) > u_box.x || abs(world.y) > u_box.y || world.z < -u_box.z)) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }

  vec4 cam = u_view * world;
  float depth = -cam.z;
  vec4 clip = u_proj * cam;
  float bound = 1.3 * clip.w;
  if (depth < 0.02 || abs(clip.x) > bound || abs(clip.y) > bound) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }

  vec2 a = unpackHalf2x16(t1.x);
  vec2 b = unpackHalf2x16(t1.y);
  vec2 c = unpackHalf2x16(t1.z);
  mat3 sigma = mat3(a.x, a.y, b.x,
                    a.y, b.y, c.x,
                    b.x, c.x, c.y) * (1.0 / 16.0);

  // Jacobian of the perspective projection, in pixels. The window frustum's
  // shear only adds a constant offset after the divide, so it does not appear.
  mat3 J = mat3(u_focal.x / depth, 0.0, 0.0,
                0.0, u_focal.y / depth, 0.0,
                u_focal.x * cam.x / (depth * depth), u_focal.y * cam.y / (depth * depth), 0.0);
  mat3 T = J * mat3(u_view * group);
  mat3 cov = T * sigma * transpose(T);

  // Low-pass filter (at least ~one pixel wide), then the ellipse's axes.
  float d1 = cov[0][0] + 0.3;
  float d2 = cov[1][1] + 0.3;
  float off = cov[0][1];
  float mid = 0.5 * (d1 + d2);
  float radius = length(vec2(0.5 * (d1 - d2), off));
  float lambda1 = mid + radius;
  float lambda2 = mid - radius;
  if (lambda2 < 0.0) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }
  vec2 axis = vec2(off, lambda1 - d1);
  axis = dot(axis, axis) < 1e-12 ? vec2(1.0, 0.0) : normalize(axis);
  vec2 major = min(sqrt(2.0 * lambda1), 1024.0) * axis;
  vec2 minor = min(sqrt(2.0 * lambda2), 1024.0) * vec2(axis.y, -axis.x);

  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 4.0 - 2.0;
  v_pos = corner;
  v_color = vec4(t0.w & 255u, (t0.w >> 8) & 255u, (t0.w >> 16) & 255u, t0.w >> 24) / 255.0;

  vec2 center = clip.xy / clip.w;
  gl_Position = vec4(center + (corner.x * major + corner.y * minor) * 2.0 / u_viewport, 0.0, 1.0);
}`;

const SPLAT_FS = /* glsl */ `#version 300 es
precision highp float;
in vec4 v_color;
in vec2 v_pos;
out vec4 fragColor;
void main() {
  float power = -dot(v_pos, v_pos);
  if (power < -4.0) discard;
  float alpha = exp(power) * v_color.a;
  fragColor = vec4(alpha * v_color.rgb, alpha);
}`;

const FULLSCREEN_VS = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID & 1) << 2), float((gl_VertexID & 2) << 1)) - 1.0;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// The box behind the glass: walls with a fine grid, soft light falling in
// from the window, ambient occlusion in the corners, contact shadows under
// hanging objects and an optional glow (the galaxy lighting the back wall).
const ROOM_FS = /* glsl */ `#version 300 es
precision highp float;

uniform vec3 u_eye;
uniform vec2 u_half;
uniform float u_depth;
uniform vec2 u_resolution;
uniform float u_room;
uniform vec3 u_accent;
uniform vec4 u_shadows[${MAX_SHADOWS}];
uniform int u_shadowCount;
uniform vec4 u_glow;
uniform vec3 u_glowColor;

out vec4 fragColor;

const vec3 LIGHT_DIR = normalize(vec3(0.5, -0.75, -0.45)); // direction light travels
const float GRID = 0.1;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 backdrop(vec2 uv) {
  vec2 p = (uv - 0.5) * vec2(u_half.x / u_half.y, 1.0);
  float v = smoothstep(1.1, 0.0, length(p));
  return mix(vec3(0.012, 0.013, 0.02), vec3(0.06, 0.064, 0.085), v);
}

// Anti-aliased lines every GRID units along one coordinate.
float gridLine(float coord, float footprint) {
  float dist = abs(fract(coord / GRID + 0.5) - 0.5) * GRID;
  float w = max(footprint, 1e-5);
  float line = 1.0 - smoothstep(0.4 * w, 1.4 * w, dist);
  return line * (1.0 - smoothstep(0.12 * GRID, 0.45 * GRID, w));
}

float edgeLine(float dist, float footprint) {
  float w = max(footprint, 1e-5);
  return 1.0 - smoothstep(0.6 * w, 2.0 * w, dist);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = backdrop(uv);

  if (u_room > 0.5) {
    vec3 s = vec3((uv * 2.0 - 1.0) * u_half, 0.0);
    vec3 dir = s - u_eye;
    float tx = abs(dir.x) > 1e-6 ? (sign(dir.x) * u_half.x - s.x) / dir.x : 1e6;
    float ty = abs(dir.y) > 1e-6 ? (sign(dir.y) * u_half.y - s.y) / dir.y : 1e6;
    float tz = (-u_depth - s.z) / dir.z;
    float t = min(tz, min(tx, ty));
    vec3 p = s + dir * t;
    vec3 fw = fwidth(p);

    vec2 q, qfw, edgeDist;
    float shade;
    if (t == tz) {           // back wall
      q = p.xy; qfw = fw.xy;
      edgeDist = u_half - abs(p.xy);
      shade = 1.0;
    } else if (t == tx) {    // left / right walls
      q = vec2(p.z, p.y); qfw = fw.zy;
      edgeDist = vec2(p.z + u_depth, u_half.y - abs(p.y));
      shade = 0.8;
    } else {                 // floor / ceiling
      q = vec2(p.x, p.z); qfw = fw.xz;
      edgeDist = vec2(u_half.x - abs(p.x), p.z + u_depth);
      shade = dir.y < 0.0 ? 0.95 : 0.66;
    }

    float depthT = clamp(-p.z / u_depth, 0.0, 1.0);
    vec3 wall = vec3(0.05, 0.056, 0.076) * shade * mix(1.3, 0.5, depthT);
    float ao = smoothstep(0.0, 0.2, min(edgeDist.x, edgeDist.y));
    wall *= mix(0.5, 1.0, ao);

    vec3 g = p - u_glow.xyz;
    wall += u_glowColor * min(u_glow.w * 0.08 / (0.04 + dot(g, g) * 2.5), 0.16);

    float grid = max(gridLine(q.x, qfw.x), gridLine(q.y, qfw.y));
    float edge = max(edgeLine(edgeDist.x, qfw.x), edgeLine(edgeDist.y, qfw.y));
    vec3 lines = u_accent * (grid * 0.36 + edge * 0.6) * mix(1.0, 0.4, depthT);
    col = wall + lines;

    float shadow = 0.0;
    for (int i = 0; i < ${MAX_SHADOWS}; i++) {
      if (i >= u_shadowCount) break;
      vec4 sh = u_shadows[i];
      vec3 v = p - sh.xyz;
      float along = dot(v, LIGHT_DIR);
      if (along <= 0.0) continue;
      float perp = length(v - LIGHT_DIR * along);
      float r = sh.w * (1.0 + 0.9 * along) + 0.01;
      float s1 = 1.0 - smoothstep(0.2 * r, 1.4 * r, perp);
      shadow = max(shadow, s1 * exp(-1.6 * along) * 0.8);
    }
    col *= 1.0 - shadow;
  }

  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = vec4(col, 1.0);
}`;

export class SplatRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: new URLSearchParams(location.search).has('capture'),
    });
    if (!gl) throw new Error('WebGL2 is not available in this browser.');
    this.gl = gl;
    this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    this.splatProgram = program(gl, SPLAT_VS, SPLAT_FS);
    this.roomProgram = program(gl, FULLSCREEN_VS, ROOM_FS);
    this.su = uniforms(gl, this.splatProgram, ['u_data', 'u_view', 'u_proj', 'u_groups', 'u_focal', 'u_viewport', 'u_box']);
    this.ru = uniforms(gl, this.roomProgram, [
      'u_eye', 'u_half', 'u_depth', 'u_resolution', 'u_room', 'u_accent',
      'u_shadows', 'u_shadowCount', 'u_glow', 'u_glowColor',
    ]);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.indexBuffer = gl.createBuffer();
    const loc = gl.getAttribLocation(this.splatProgram, 'a_index');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribIPointer(loc, 1, gl.UNSIGNED_INT, 0, 0);
    gl.vertexAttribDivisor(loc, 1);
    gl.bindVertexArray(null);

    this.emptyVao = gl.createVertexArray();
    this.texture = null;
    this.count = 0;
    this.drawCount = 0;
    this.shadowData = new Float32Array(MAX_SHADOWS * 4);
  }

  setScene({ data, width, height, count }) {
    const gl = this.gl;
    if (this.texture) gl.deleteTexture(this.texture);
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, width, height, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, data);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, count * 4, gl.DYNAMIC_DRAW);
    this.count = count;
    this.drawCount = 0; // nothing is drawn until the first depth sort arrives
  }

  setOrder(indices) {
    if (indices.length !== this.count) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, indices);
    this.drawCount = indices.length;
  }

  resize(cssWidth, cssHeight, pixelRatio) {
    const w = Math.max(1, Math.round(cssWidth * pixelRatio));
    const h = Math.max(1, Math.round(cssHeight * pixelRatio));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  render({ eye, aspect, groups, room, depth, accent, shadows = [], glow, glowColor }) {
    const gl = this.gl;
    const W = this.canvas.width, H = this.canvas.height;
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    // Front-to-back "under" compositing: each layer only fills what is left.
    gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);

    const { proj, view } = windowCamera(eye, aspect, 0.02, eye[2] + 200);

    if (this.texture && this.drawCount > 0) {
      gl.useProgram(this.splatProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(this.su.u_data, 0);
      gl.uniformMatrix4fv(this.su.u_view, false, view);
      gl.uniformMatrix4fv(this.su.u_proj, false, proj);
      gl.uniformMatrix4fv(this.su.u_groups, false, groups);
      gl.uniform2f(this.su.u_focal, (proj[0] * W) / 2, (proj[5] * H) / 2);
      gl.uniform2f(this.su.u_viewport, W, H);
      gl.uniform4f(this.su.u_box, aspect / 2, 0.5, depth, room ? 1 : 0);
      gl.bindVertexArray(this.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.drawCount);
      gl.bindVertexArray(null);
    }

    gl.useProgram(this.roomProgram);
    gl.uniform3fv(this.ru.u_eye, eye);
    gl.uniform2f(this.ru.u_half, aspect / 2, 0.5);
    gl.uniform1f(this.ru.u_depth, depth);
    gl.uniform2f(this.ru.u_resolution, W, H);
    gl.uniform1f(this.ru.u_room, room ? 1 : 0);
    gl.uniform3fv(this.ru.u_accent, accent);
    const n = Math.min(shadows.length, MAX_SHADOWS);
    for (let i = 0; i < n; i++) this.shadowData.set(shadows[i], i * 4);
    gl.uniform4fv(this.ru.u_shadows, this.shadowData);
    gl.uniform1i(this.ru.u_shadowCount, n);
    gl.uniform4fv(this.ru.u_glow, glow || [0, 0, 0, 0]);
    gl.uniform3fv(this.ru.u_glowColor, glowColor || [0, 0, 0]);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
}

function program(gl, vsSource, fsSource) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vsSource], [gl.FRAGMENT_SHADER, fsSource]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compile failed: ${gl.getShaderInfoLog(s)}`);
    }
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`Program link failed: ${gl.getProgramInfoLog(p)}`);
  return p;
}

function uniforms(gl, p, names) {
  return Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));
}
