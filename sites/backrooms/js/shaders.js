// Materials for Level 0 and the camcorder post pass.
//
// All surfaces are lit by the same function: every grid cell has a square
// fluorescent panel in the middle of its ceiling, and each fragment sums the
// light from the 3x3 panels around it. Whether a panel is on, dead or
// flickering comes from an integer hash that matches world.js exactly, so the
// panels, the light they cast and the hum you hear all agree, everywhere,
// without a single light object in the scene.
//
// The game turns the screws through three shared uniforms: uDead (the
// fraction of panels that have died; it only ever grows, so a dead light
// stays dead), uFlicker (how many stutter) and uPower (the mains: 0 during a
// blackout). Ambient light follows how many panels are lit nearby, so dead
// stretches really are dark.

import * as THREE from 'three';
import { CELL, HEIGHT } from './world.js';

export const COMMON = /* glsl */ `
uniform float uTime;
uniform int uSeed;
uniform vec3 uHaze;
uniform float uHazeDensity;
uniform float uAmbient;
uniform float uLightGain;
uniform float uDead;
uniform float uFlicker;
uniform float uPower;

const float CELL = ${CELL.toFixed(4)};
const float HEIGHT = ${HEIGHT.toFixed(4)};

uint hash32(uint x) {
  x ^= x >> 16u; x *= 0x7feb352du;
  x ^= x >> 15u; x *= 0x846ca68bu;
  x ^= x >> 16u;
  return x;
}

float hash3(int i, int j, int k) {
  uint h = hash32((uint(i) * 73856093u) ^ hash32((uint(j) * 19349663u) ^ hash32(uint(k) + uint(uSeed))));
  return float(h) / 4294967296.0;
}

// 0 = dead tube, 1 = steady; flickering panels stutter between the two.
float panelLevel(ivec2 c) {
  float r = hash3(c.x, c.y, 5);
  if (r < uDead) return 0.0;
  float level = 1.0;
  if (r > 1.0 - uFlicker) {
    float tick = floor(uTime * 11.0 + r * 997.0);
    float burst = step(0.62, fract(uTime * 0.21 + r * 13.0)); // bad stretches come and go
    level = hash3(int(tick), c.x * 31 + c.y, 77) > 0.5 * burst + 0.1 ? 1.0 : 0.06;
  }
  return level * uPower;
}

// Diffuse light from the nine nearest ceiling panels (downward-facing area
// lights). Also reports how lit the surroundings are, for the ambient term.
float panelLight(vec3 p, vec3 n, out float lit) {
  ivec2 c = ivec2(floor(p.xz / CELL));
  float sum = 0.0, wsum = 0.0, lsum = 0.0;
  for (int dx = -1; dx <= 1; dx++) {
    for (int dz = -1; dz <= 1; dz++) {
      ivec2 q = c + ivec2(dx, dz);
      float level = panelLevel(q);
      vec3 lp = vec3((float(q.x) + 0.5) * CELL, HEIGHT - 0.02, (float(q.y) + 0.5) * CELL);
      vec2 across = lp.xz - p.xz;
      float w = exp(-dot(across, across) / 9.0);
      wsum += w;
      lsum += w * level;
      if (level <= 0.0) continue;
      vec3 L = lp - p;
      float d2 = dot(L, L);
      L *= inversesqrt(d2);
      sum += level * max(L.y, 0.0) * max(dot(n, L), 0.0) / (1.0 + 0.32 * d2);
    }
  }
  lit = lsum / wsum;
  return sum;
}

// Ambient (bounce) light: almost nothing left where the panels are dead.
float ambient(float lit) {
  return uAmbient * (0.06 + 0.94 * lit);
}

vec3 haze(vec3 col, vec3 p, float lit) {
  float d = distance(p, cameraPosition) * uHazeDensity;
  return mix(col, uHaze * (0.04 + 0.96 * lit), 1.0 - exp(-d * d));
}

// The Level 0 wallpaper: a faint repeating diamond in columns.
vec3 wallpaper(float along, float y) {
  vec3 paper = vec3(0.78, 0.75, 0.7);
  vec2 m = fract(vec2(along / 0.18, y / 0.24)) - 0.5;
  float motif = 1.0 - smoothstep(0.0, 0.05, abs(abs(m.x) * 1.33 + abs(m.y) - 0.38));
  float column = 1.0 - smoothstep(0.0, 0.02, abs(fract(along / 0.18) - 0.5));
  return paper * (1.0 - 0.1 * motif - 0.05 * column);
}
`;

const VERTEX = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vLocal = position;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const WALL_FRAGMENT = /* glsl */ `
${COMMON}
uniform sampler2D uStains;
varying vec3 vWorld;
varying vec3 vNormal;

void main() {
  vec3 n = normalize(vNormal);
  bool facesX = abs(n.x) > 0.5;
  float along = facesX ? vWorld.z : vWorld.x;
  float across = facesX ? vWorld.x : vWorld.z;
  float y = vWorld.y;

  // Near-neutral albedos throughout: the camcorder grade supplies the yellow.
  vec3 paper = wallpaper(along, y);
  float seam = 1.0 - smoothstep(0.0, 0.0035, abs(fract(along / 0.53 + 0.5) - 0.5) * 0.53);
  paper *= 1.0 - 0.1 * seam;

  // Damp stains and grime gathering towards the floor.
  float stain = texture(uStains, vec2(along + across * 0.37, y) / 3.4).r;
  paper *= mix(1.0, smoothstep(0.3, 0.95, stain), 0.14);
  paper *= 1.0 - 0.14 * (1.0 - smoothstep(0.0, 0.8, y));

  // Baseboard.
  if (y < 0.1) paper = vec3(0.86, 0.83, 0.76) * (y > 0.085 ? 0.82 : 1.0);

  // The odd electrical outlet near the floor.
  float seg = floor(along / 2.4);
  if (hash3(int(seg), int(floor(across * 4.0)) * 2 + int(n.x + n.z > 0.0), 51) < 0.16) {
    vec2 o = vec2(along - (seg + 0.5) * 2.4, y - 0.26);
    if (abs(o.x) < 0.04 && abs(o.y) < 0.06) paper = vec3(0.09, 0.08, 0.06);
  }

  float lit;
  float light = panelLight(vWorld, n, lit);
  float ao = mix(0.62, 1.0, smoothstep(0.0, 0.5, y)) * mix(0.78, 1.0, smoothstep(0.0, 0.4, HEIGHT - y));
  vec3 col = paper * (ambient(lit) + uLightGain * light) * ao;
  gl_FragColor = vec4(haze(col, vWorld, lit), 1.0);
}
`;

const FLOOR_FRAGMENT = /* glsl */ `
${COMMON}
uniform sampler2D uCarpet;
uniform sampler2D uCarpetNormal;
uniform sampler2D uOcclusion;
uniform vec3 uChunk; // x0, z0, size
varying vec3 vWorld;

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  float a = hash3(int(i.x), int(i.y), 91), b = hash3(int(i.x) + 1, int(i.y), 91);
  float c = hash3(int(i.x), int(i.y) + 1, 91), d = hash3(int(i.x) + 1, int(i.y) + 1, 91);
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}

void main() {
  vec2 uv = vec2(vWorld.x, -vWorld.z) / 1.1;
  vec3 tex = texture(uCarpet, uv).rgb;
  float lum = dot(tex, vec3(0.3, 0.59, 0.11));
  // Coarse loops: more contrast than the source, most of its olive tint removed.
  vec3 carpet = vec3(0.3 + (lum - 0.3) * 1.9) * mix(vec3(1.0), tex / max(lum, 1e-3), 0.25) * 1.15;
  // Old, moist carpet: darker blotches that never quite dry.
  float damp = smoothstep(0.55, 0.85, noise(vWorld.xz * 0.28) * 0.7 + noise(vWorld.xz * 1.1) * 0.3);
  carpet *= 1.0 - 0.22 * damp;

  vec3 t = texture(uCarpetNormal, uv).xyz * 2.0 - 1.0;
  vec3 n = normalize(vec3(t.x, 0.0, -t.y) * 0.8 + vec3(0.0, t.z, 0.0));

  float occlusion = texture(uOcclusion, (vWorld.xz - uChunk.xy) / uChunk.z).r;
  float lit;
  float light = panelLight(vWorld, n, lit);
  vec3 col = carpet * (ambient(lit) + uLightGain * light) * mix(0.5, 1.0, occlusion);
  gl_FragColor = vec4(haze(col, vWorld, lit), 1.0);
}
`;

const CEILING_FRAGMENT = /* glsl */ `
${COMMON}
uniform sampler2D uTiles;
uniform sampler2D uOcclusion;
uniform vec3 uChunk;
varying vec3 vWorld;

void main() {
  // 1.2 m tiles (the texture holds 6 x 6) with the grid lines pulled darker.
  vec3 tex = texture(uTiles, vWorld.xz / 7.2).rgb;
  float lum = dot(tex, vec3(0.333));
  vec3 tile = vec3(0.9, 0.88, 0.84) * mix(0.42, 1.0, smoothstep(0.8, 0.93, lum)) * (0.9 + 0.1 * lum);

  // Now and then a tile is missing and there is only dark above.
  ivec2 t = ivec2(floor(vWorld.xz / 1.2));
  vec2 local = mod(vWorld.xz, CELL) - CELL * 0.5;
  ivec2 inCell = t - ivec2(floor(vWorld.xz / CELL)) * 3; // the middle tile holds the panel
  bool underPanel = inCell.x == 1 && inCell.y == 1;
  if (!underPanel && hash3(t.x, t.y, 61) < 0.006) tile = vec3(0.025, 0.02, 0.012);

  // Lit from below by bounce, with a halo around this cell's panel.
  ivec2 c = ivec2(floor(vWorld.xz / CELL));
  float edge = max(abs(local.x), abs(local.y)) - 0.6;
  float halo = panelLevel(c) * exp(-max(edge, 0.0) * 2.6);
  float lit;
  panelLight(vWorld - vec3(0.0, 0.3, 0.0), vec3(0.0, -1.0, 0.0), lit);
  float occlusion = texture(uOcclusion, (vWorld.xz - uChunk.xy) / uChunk.z).r;
  vec3 col = tile * (ambient(lit) * 0.7 + uLightGain * 0.45 * halo) * mix(0.6, 1.0, occlusion);
  gl_FragColor = vec4(haze(col, vWorld, lit), 1.0);
}
`;

const PANEL_FRAGMENT = /* glsl */ `
${COMMON}
varying vec3 vWorld;

void main() {
  ivec2 c = ivec2(floor(vWorld.xz / CELL));
  vec2 local = mod(vWorld.xz, CELL) - CELL * 0.5; // -0.6..0.6 across the panel
  float level = panelLevel(c);
  float frame = step(0.56, max(abs(local.x), abs(local.y)));
  // Prismatic diffuser: a fine grid, brightest in the middle of the panel.
  vec2 g = abs(fract(local / 0.05) - 0.5);
  float grid = 1.0 - 0.06 * step(0.42, max(g.x, g.y));
  float centre = 1.0 - 0.18 * dot(local, local);
  vec3 lit = vec3(1.0, 0.97, 0.86) * 5.5 * grid * centre;
  float near;
  panelLight(vWorld - vec3(0.0, 0.3, 0.0), vec3(0.0, -1.0, 0.0), near);
  vec3 dead = vec3(0.32, 0.31, 0.27) * (0.08 + 0.92 * near);
  vec3 col = mix(mix(dead, lit, level), vec3(0.55, 0.5, 0.4) * (ambient(near) + 0.4 * level), frame);
  gl_FragColor = vec4(haze(col, vWorld, near), 1.0);
}
`;

// Props (phones, side tables): a flat colour lit like everything else, with
// an optional emissive part (the ringing LED).
const PROP_FRAGMENT = /* glsl */ `
${COMMON}
uniform vec3 uColor;
uniform vec3 uEmissive;
varying vec3 vWorld;
varying vec3 vNormal;

void main() {
  vec3 n = normalize(vNormal);
  float lit;
  float light = panelLight(vWorld, n, lit);
  vec3 col = uColor * (ambient(lit) + uLightGain * light) + uEmissive;
  gl_FragColor = vec4(haze(col, vWorld, lit), 1.0);
}
`;

// The Tenant's suit: grubby beige wool with old water stains and tide
// marks, darker towards the hems. Also used, smoother, for its skin.
const SUIT_FRAGMENT = /* glsl */ `
${COMMON}
uniform vec3 uColor;
uniform float uWeave;
uniform float uLift;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;

float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  ivec3 c = ivec3(i);
  float a = hash3(c.x, c.y * 57 + c.z * 131, 17), b = hash3(c.x + 1, c.y * 57 + c.z * 131, 17);
  float d = hash3(c.x, (c.y + 1) * 57 + c.z * 131, 17), e = hash3(c.x + 1, (c.y + 1) * 57 + c.z * 131, 17);
  float g = hash3(c.x, c.y * 57 + (c.z + 1) * 131, 17), h = hash3(c.x + 1, c.y * 57 + (c.z + 1) * 131, 17);
  float k = hash3(c.x, (c.y + 1) * 57 + (c.z + 1) * 131, 17), l = hash3(c.x + 1, (c.y + 1) * 57 + (c.z + 1) * 131, 17);
  return mix(mix(mix(a, b, f.x), mix(d, e, f.x), f.y), mix(mix(g, h, f.x), mix(k, l, f.x), f.y), f.z);
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 col = uColor * (1.0 - uWeave * 0.04 * sin((vLocal.x + vLocal.y * 0.7 + vLocal.z) * 240.0));
  // A few old water stains with darker tide-mark rims, and grime low down.
  float s = vnoise(vLocal * 5.0 + 3.1) * 0.75 + vnoise(vLocal * 17.0) * 0.25;
  float stain = smoothstep(0.64, 0.7, s) * uWeave;
  float tide = smoothstep(0.02, 0.0, abs(s - 0.665)) * uWeave;
  col *= mix(vec3(1.0), vec3(0.86, 0.8, 0.7), stain);
  col *= 1.0 - 0.18 * tide;
  col *= mix(0.7, 1.0, smoothstep(0.0, 0.9, vWorld.y));
  float lit;
  float light = panelLight(vWorld, n, lit);
  col *= ambient(lit) * (0.85 + 0.45 * max(0.0, -n.y)) + uLightGain * light + uLift; // + bounce off the carpet
  gl_FragColor = vec4(haze(col, vWorld, lit), 1.0);
}
`;

// Its face is the wallpaper (local coordinates are metres on the head: x ear
// to ear, y chin to crown, z out of the face). uMouth tears it open.
const FACE_FRAGMENT = /* glsl */ `
${COMMON}
uniform float uMouth;
uniform float uLift;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;

void main() {
  vec3 n = normalize(vNormal);
  vec2 p = vLocal.xy + vec2(0.4, 0.31);
  vec2 m = fract(vec2(p.x / 0.18, p.y / 0.24)) - 0.5;
  float motif = 1.0 - smoothstep(0.0, 0.05, abs(abs(m.x) * 1.33 + abs(m.y) - 0.38));
  float column = 1.0 - smoothstep(0.0, 0.02, abs(fract(p.x / 0.18) - 0.5));
  vec3 col = vec3(0.78, 0.75, 0.7) * (1.0 - 0.42 * motif - 0.14 * column);

  // Old paper: grime and a damp bloom.
  float grime = hash3(int(floor(p.x * 90.0)), int(floor(p.y * 90.0)), 23);
  col *= 0.94 + 0.06 * grime;

  // A ragged tear from brow to chin, widest low down, like wallpaper pulled
  // off the wall: a frayed pale edge, then brown paste, then nothing.
  float y = vLocal.y;
  float jag = 0.0045 * sin(y * 97.0 + 0.7) + 0.003 * sin(y * 233.0 + 2.1) + 0.0022 * sin(y * 517.0) + 0.0015 * sin(y * 1131.0 + 0.4);
  float open = uMouth * (0.002 + 0.042 * smoothstep(0.1, -0.11, y) * (0.8 + 0.2 * sin(y * 41.0))) * smoothstep(-0.175, -0.13, y) * smoothstep(0.155, 0.05, y);
  float d = abs(vLocal.x + jag) - open;
  float front = step(0.0, vLocal.z) * step(0.0005, open);
  float fray = 0.0025 + 0.003 * hash3(int(floor(y * 600.0)), 1, 29);
  float paper = (1.0 - smoothstep(fray, fray + 0.0015, d)) * front;
  float paste = (1.0 - smoothstep(0.0, 0.0012, d)) * front;
  float hole = (1.0 - smoothstep(-0.006, -0.004, d)) * front;
  float lit;
  float light = panelLight(vWorld, n, lit);
  col *= ambient(lit) * (0.9 + 0.55 * max(0.0, -n.y)) + uLightGain * light + uLift; // + bounce off the carpet
  col = mix(col, col * 1.18 + 0.04, paper * 0.9);
  col = mix(col, vec3(0.12, 0.035, 0.02), paste);
  col = mix(col, vec3(0.008, 0.0, 0.0), hole);
  gl_FragColor = vec4(haze(col, vWorld, lit), 1.0);
}
`;

export function createMaterials(textures, seed) {
  const shared = {
    uTime: { value: 0 },
    uSeed: { value: seed | 0 },
    uHaze: { value: new THREE.Color(0.8, 0.77, 0.68) },
    uHazeDensity: { value: 0.026 },
    uAmbient: { value: 0.62 },
    uLightGain: { value: 1.7 },
    uDead: { value: 0.07 },
    uFlicker: { value: 0.035 },
    uPower: { value: 1 },
  };
  const make = (fragmentShader, extra = {}, options = {}) =>
    new THREE.ShaderMaterial({ uniforms: { ...shared, ...extra }, vertexShader: VERTEX, fragmentShader, ...options });

  const occlusion = () => ({ uOcclusion: { value: null }, uChunk: { value: new THREE.Vector3() } });
  return {
    shared,
    wall: make(WALL_FRAGMENT, { uStains: { value: textures.stains } }),
    // Floor and ceiling materials are cloned per chunk for its occlusion map.
    floor: () => make(FLOOR_FRAGMENT, { uCarpet: { value: textures.carpet }, uCarpetNormal: { value: textures.carpetNormal }, ...occlusion() }),
    ceiling: () => make(CEILING_FRAGMENT, { uTiles: { value: textures.ceiling }, ...occlusion() }),
    panel: make(PANEL_FRAGMENT),
    prop: (color, emissive = [0, 0, 0]) =>
      make(PROP_FRAGMENT, { uColor: { value: new THREE.Color(...color) }, uEmissive: { value: new THREE.Color(...emissive) } }),
    // The Tenant's materials share one uLift (extra light for the close-up).
    suit: (color, weave = 1, lift = { value: 0 }) =>
      make(SUIT_FRAGMENT, { uColor: { value: new THREE.Color(...color) }, uWeave: { value: weave }, uLift: lift }),
    face: (lift = { value: 0 }) => make(FACE_FRAGMENT, { uMouth: { value: 0 }, uLift: lift }),
  };
}

// ------------------------------------------------------------------ camcorder

const POST_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Bloom from the scene's mip chain, rotational motion blur, a warm overexposed
// grade, a touch of lens distortion and fringing, grain and vignette. On top:
// your eyelids (uLid), dry and watering eyes (uStrain) and the shock of being
// caught (uScare).
const POST_FRAGMENT = /* glsl */ `
uniform sampler2D tScene;
uniform vec2 uBlur;
uniform float uTime;
uniform float uExposure;
uniform float uLens;
uniform float uLid;
uniform float uStrain;
uniform float uScare;
uniform float uAspect;
varying vec2 vUv;

float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453); }

vec3 scene(vec2 uv, float spread) {
  vec2 c = uv - 0.5;
  vec2 shift = c * spread;
  return vec3(texture(tScene, uv + shift).r, texture(tScene, uv).g, texture(tScene, uv - shift).b);
}

void main() {
  vec2 c = vUv - 0.5;
  vec2 uv = 0.5 + c * (1.0 - 0.045 * uLens * dot(c, c));

  // Watering eyes: the image swims and runs.
  float t = uTime;
  uv += uStrain * vec2(0.004 * sin(uv.y * 31.0 + t * 1.7), 0.007 * sin(uv.x * 9.0 + t * 0.9) * smoothstep(0.2, 0.9, uv.y));
  // Caught: the camera jolts.
  uv += uScare * (vec2(rand(vec2(t, 1.0)), rand(vec2(1.0, t))) - 0.5) * 0.035;

  float spread = 0.0035 * uLens + 0.02 * uScare + 0.004 * uStrain;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 9; i++) col += scene(uv + uBlur * (float(i) / 8.0 - 0.5), spread);
  col /= 9.0;
  col = mix(col, textureLod(tScene, uv, 1.5 + 2.5 * uStrain).rgb, smoothstep(0.15, 1.0, uStrain) * 0.85);

  vec3 bloom = textureLod(tScene, uv, 3.0).rgb * 0.5 + textureLod(tScene, uv, 5.0).rgb * 0.3 + textureLod(tScene, uv, 7.0).rgb * 0.2;
  col += max(bloom - 1.1, 0.0) * 0.4;

  col *= uExposure;
  col = 1.0 - exp(-col);                                  // soft, bright shoulder
  // The footage's look is a per-channel curve: blue is crushed hard in the
  // mid and dark tones, green less, red hardly at all, so walls read ochre,
  // the ceiling deep orange-brown and the panels stay white.
  vec3 graded = pow(max(col, 0.0), vec3(0.45, 0.78, 1.65));
  float peak = max(col.r, max(col.g, col.b));
  col = mix(graded, vec3(1.0, 0.95, 0.86) * pow(peak, 0.45), smoothstep(0.8, 1.0, peak));

  // Shock: drained and reddened, high contrast.
  float l = dot(col, vec3(0.3, 0.59, 0.11));
  col = mix(col, vec3(l * 1.25, l * 0.45, l * 0.35), uScare * 0.7);

  float vignette = 0.32 + 0.45 * uStrain + 0.3 * uScare;
  col *= 1.0 - vignette * smoothstep(0.3, 0.85, length(c * vec2(1.25, 1.0)));
  col = mix(col, col * vec3(1.0, 0.75, 0.7), uStrain * smoothstep(0.3, 0.8, length(c)));
  col += (rand(gl_FragCoord.xy) - 0.5) * (0.035 * uLens + 0.08 * uScare);

  // Eyelids close from top and bottom, curved; shut is almost black, a little red.
  float x = c.x * uAspect;
  float edge = 0.5 * (1.0 - uLid) * (1.0 - 0.6 * x * x) + 0.02 * (1.0 - uLid);
  float lid = smoothstep(edge - 0.035, edge + 0.005, abs(c.y)) * step(0.001, uLid);
  lid = max(lid, smoothstep(0.85, 1.0, uLid));
  col = mix(col, vec3(0.035, 0.008, 0.005), lid);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createPost() {
  return new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: null },
      uBlur: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uExposure: { value: 1.08 },
      uLens: { value: 1.0 },
      uLid: { value: 0 },
      uStrain: { value: 0 },
      uScare: { value: 0 },
      uAspect: { value: 1.6 },
    },
    vertexShader: POST_VERTEX,
    fragmentShader: POST_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
}
