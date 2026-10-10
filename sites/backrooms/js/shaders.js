// Materials for Level 0 and the camcorder post pass.
//
// All surfaces are lit by the same function: every grid cell has a square
// fluorescent panel in the middle of its ceiling, and each fragment sums the
// light from the 3x3 panels around it. Whether a panel is on, dead or
// flickering comes from an integer hash that matches world.js exactly, so the
// panels, the light they cast and the hum you hear all agree, everywhere,
// without a single light object in the scene.

import * as THREE from 'three';
import { CELL, HEIGHT } from './world.js';

const COMMON = /* glsl */ `
uniform float uTime;
uniform int uSeed;
uniform vec3 uHaze;
uniform float uHazeDensity;
uniform float uAmbient;
uniform float uLightGain;

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
  if (r < 0.07) return 0.0;
  if (r > 0.965) {
    float tick = floor(uTime * 11.0 + r * 997.0);
    float burst = step(0.62, fract(uTime * 0.21 + r * 13.0)); // bad stretches come and go
    return hash3(int(tick), c.x * 31 + c.y, 77) > 0.5 * burst + 0.1 ? 1.0 : 0.06;
  }
  return 1.0;
}

// Diffuse light from the nine nearest ceiling panels (downward-facing area lights).
float panelLight(vec3 p, vec3 n) {
  ivec2 c = ivec2(floor(p.xz / CELL));
  float sum = 0.0;
  for (int dx = -1; dx <= 1; dx++) {
    for (int dz = -1; dz <= 1; dz++) {
      ivec2 q = c + ivec2(dx, dz);
      float level = panelLevel(q);
      if (level <= 0.0) continue;
      vec3 lp = vec3((float(q.x) + 0.5) * CELL, HEIGHT - 0.02, (float(q.y) + 0.5) * CELL);
      vec3 L = lp - p;
      float d2 = dot(L, L);
      L *= inversesqrt(d2);
      sum += level * max(L.y, 0.0) * max(dot(n, L), 0.0) / (1.0 + 0.32 * d2);
    }
  }
  return sum;
}

vec3 haze(vec3 col, vec3 p) {
  float d = distance(p, cameraPosition) * uHazeDensity;
  return mix(col, uHaze, 1.0 - exp(-d * d));
}
`;

const VERTEX = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
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

  // Mono-yellow wallpaper: a faint repeating diamond, strip seams every 0.53 m.
  // Near-neutral albedos throughout: the camcorder grade supplies the yellow.
  vec3 paper = vec3(0.78, 0.75, 0.7);
  vec2 m = fract(vec2(along / 0.18, y / 0.24)) - 0.5;
  float motif = 1.0 - smoothstep(0.0, 0.05, abs(abs(m.x) * 1.33 + abs(m.y) - 0.38));
  float column = 1.0 - smoothstep(0.0, 0.02, abs(fract(along / 0.18) - 0.5));
  paper *= 1.0 - 0.1 * motif - 0.05 * column;
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

  float light = panelLight(vWorld, n);
  float ao = mix(0.62, 1.0, smoothstep(0.0, 0.5, y)) * mix(0.78, 1.0, smoothstep(0.0, 0.4, HEIGHT - y));
  vec3 col = paper * (uAmbient + uLightGain * light) * ao;
  gl_FragColor = vec4(haze(col, vWorld), 1.0);
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
  float light = panelLight(vWorld, n);
  vec3 col = carpet * (uAmbient + uLightGain * light) * mix(0.5, 1.0, occlusion);
  gl_FragColor = vec4(haze(col, vWorld), 1.0);
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
  float occlusion = texture(uOcclusion, (vWorld.xz - uChunk.xy) / uChunk.z).r;
  vec3 col = tile * (uAmbient * 0.7 + uLightGain * 0.45 * halo) * mix(0.6, 1.0, occlusion);
  gl_FragColor = vec4(haze(col, vWorld), 1.0);
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
  vec3 dead = vec3(0.32, 0.31, 0.27);
  vec3 col = mix(mix(dead, lit, level), vec3(0.55, 0.5, 0.4) * (uAmbient + 0.4 * level), frame);
  gl_FragColor = vec4(haze(col, vWorld), 1.0);
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
  };
  const make = (fragmentShader, extra = {}) =>
    new THREE.ShaderMaterial({ uniforms: { ...shared, ...extra }, vertexShader: VERTEX, fragmentShader });

  const occlusion = () => ({ uOcclusion: { value: null }, uChunk: { value: new THREE.Vector3() } });
  return {
    shared,
    wall: make(WALL_FRAGMENT, { uStains: { value: textures.stains } }),
    // Floor and ceiling materials are cloned per chunk for its occlusion map.
    floor: () => make(FLOOR_FRAGMENT, { uCarpet: { value: textures.carpet }, uCarpetNormal: { value: textures.carpetNormal }, ...occlusion() }),
    ceiling: () => make(CEILING_FRAGMENT, { uTiles: { value: textures.ceiling }, ...occlusion() }),
    panel: make(PANEL_FRAGMENT),
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
// grade, a touch of lens distortion and fringing, grain and vignette.
const POST_FRAGMENT = /* glsl */ `
uniform sampler2D tScene;
uniform vec2 uBlur;
uniform float uTime;
uniform float uExposure;
uniform float uLens;
varying vec2 vUv;

float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453); }

vec3 scene(vec2 uv) {
  vec2 c = uv - 0.5;
  vec2 shift = c * 0.0035 * uLens;
  return vec3(texture(tScene, uv + shift).r, texture(tScene, uv).g, texture(tScene, uv - shift).b);
}

void main() {
  vec2 c = vUv - 0.5;
  vec2 uv = 0.5 + c * (1.0 - 0.045 * uLens * dot(c, c));

  vec3 col = vec3(0.0);
  for (int i = 0; i < 9; i++) col += scene(uv + uBlur * (float(i) / 8.0 - 0.5));
  col /= 9.0;

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

  col *= 1.0 - 0.32 * smoothstep(0.35, 0.85, length(c * vec2(1.25, 1.0)));
  col += (rand(gl_FragCoord.xy) - 0.5) * 0.035 * uLens;
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
    },
    vertexShader: POST_VERTEX,
    fragmentShader: POST_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
}
