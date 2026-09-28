// Clock It! launch film — the 3D layer and everything coupled to it.
//
// One perspective camera, one scene, every object's state a pure function of film time `t`
// (seconds). HyperFrames dispatches `hf-seek` per frame; we render that exact time. Fast
// moves get real motion blur: the scene is re-posed at several sub-frame times inside a
// 180-degree shutter and the renders are averaged (linear light, premultiplied alpha).
// DOM pieces that must stay glued to the 3D (the red dot, the olive stage's circular edge,
// the text flanking the watch) are positioned here too, from the same `t`.
import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";
import { buildWatch, setTime, buildLogo, brassMaterial, linkGeometry, linkSpecs, COLORS } from "./watch.js";

const W = 1920, H = 1080, FPS = 60, FOV = 22;
const TAN = Math.tan((FOV / 2) * Math.PI / 180);
const B = (n) => n * 0.6; // beat -> seconds (100 BPM)

// ---------------------------------------------------------------- easing + keyframes
const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const E = {
  lin: (x) => x,
  in2: (x) => x * x,
  in3: (x) => x * x * x,
  in25: (x) => Math.pow(x, 2.5),
  out2: (x) => 1 - (1 - x) ** 2,
  out3: (x) => 1 - (1 - x) ** 3,
  out25: (x) => 1 - Math.pow(1 - x, 2.5),
  out4: (x) => 1 - (1 - x) ** 4,
  expo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  io2: (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  back: (s = 1.6) => (x) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2,
  // Damped spring that lands exactly on 1: overshoots, dips, settles.
  spring: (f = 1.6, d = 5.2) => (x) => {
    const v = 1 - Math.exp(-d * x) * Math.cos(2 * Math.PI * f * x);
    const k = x > 0.82 ? (x - 0.82) / 0.18 : 0;
    return v + (1 - v) * k * k * (3 - 2 * k);
  },
};
const lerp = (a, b, x) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * x) : a + (b - a) * x);
// keys: [[time, value, ease-into-this-key], ...]
function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const x = t1 > t0 ? (t - t0) / (t1 - t0) : 1;
        return lerp(v0, v1, (e || E.io2)(clamp01(x)));
      }
    }
    return keys[keys.length - 1][1];
  };
}
const win = (t, a, b) => t >= a && t < b;
const prog = (t, a, b, e = E.lin) => e(clamp01((t - a) / (b - a)));
// Seeded hash in [0,1): deterministic "random" per index.
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------- renderer + scene
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.setClearColor(0x000000, 0);
renderer.autoClear = false; // the accumulation buffer must survive between samples

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const key = new THREE.DirectionalLight(0xfff1e0, 1.7);
const rim = new THREE.DirectionalLight(0xe9f0ff, 0.7);
scene.add(key, rim, key.target, rim.target);
const cam = new THREE.PerspectiveCamera(FOV, W / H, 2, 5000);

// Offscreen buffers: every frame is drawn into `sample`, added into `accum` with weight 1/K,
// then tone-mapped to the canvas. K = 1 for still-ish frames, more during fast moves.
const rtOpts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: true, samples: 4 };
const sample = new THREE.WebGLRenderTarget(W, H, rtOpts);
const accum = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false });
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadGeo = new THREE.PlaneGeometry(2, 2);
const addMat = new THREE.ShaderMaterial({
  uniforms: { tex: { value: null }, w: { value: 1 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  fragmentShader: "uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv) * w; }",
  // Plain sum (ONE, ONE) on premultiplied samples; additive blending would square the weight.
  blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor, depthTest: false, depthWrite: false, transparent: true,
});
const outMat = new THREE.ShaderMaterial({
  uniforms: { tex: { value: null } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  // Neutral tone map shoulder (Khronos PBR Neutral, no toe) on un-premultiplied colour, then sRGB.
  fragmentShader: `uniform sampler2D tex; varying vec2 vUv;
    vec3 neutral(vec3 c){ // highlight shoulder only, no toe, so flat brand colours stay exact
      float p=max(c.r,max(c.g,c.b)); if(p<0.76) return c; float d=1.0-0.76; float np=1.0-d*d/(p+d-0.76);
      c*=np/p; float g=1.0-1.0/(0.15*(p-np)+1.0); return mix(c, vec3(np), g); }
    vec3 srgb(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4))-0.055, step(0.0031308, c)); }
    void main(){ vec4 a=texture2D(tex, vUv); float al=clamp(a.a,0.0,1.0); vec3 c=al>1e-4? a.rgb/al : vec3(0.0);
      c=srgb(clamp(neutral(c),0.0,1.0)); gl_FragColor=vec4(c*al, al); }`,
  blending: THREE.NoBlending, depthTest: false, depthWrite: false,
});
const addQuad = new THREE.Mesh(quadGeo, addMat);
const outQuad = new THREE.Mesh(quadGeo, outMat);
const quadScene = new THREE.Scene();
quadScene.add(addQuad);
const outScene = new THREE.Scene();
outScene.add(outQuad);

// ---------------------------------------------------------------- objects
const brassLinkMat = brassMaterial({ repeat: [1, 2.5] });

// The Clock It! watch. Its group origin sits at the case back; shift it so the oxide centre
// cap — "the point" — is the world origin, which is where the camera always looks.
const watch = buildWatch({ links: 7 });
const watchRoot = new THREE.Group(); // pose (position/rotation/scale) lives here
watch.group.position.z = -9.0;
watchRoot.add(watch.group);
scene.add(watchRoot);
const links = [];
for (let i = 0; i < 7; i++) links.push(watch.bracelet.up[i], watch.bracelet.down[i]);
links.forEach((m) => { m.userData.restPos = m.position.clone(); });

// Ten extra links that join the bracelet links in the sunburst.
const spare = linkSpecs(7)[3];
const extraLinks = [];
for (let i = 0; i < 10; i++) {
  const m = new THREE.Mesh(linkGeometry(spare), brassLinkMat);
  m.visible = false;
  scene.add(m);
  extraLinks.push(m);
}
// Burst links live in world space (not inside the watch) during the climax.
const burstLinks = [];
for (let i = 0; i < 24; i++) {
  const m = new THREE.Mesh(linkGeometry(spare), brassLinkMat);
  m.visible = false;
  scene.add(m);
  burstLinks.push(m);
}

// Generic smartwatch: glossy black slab, "9:41" screen, one red badge.
function screenTexture(on) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 640;
  const g = c.getContext("2d");
  g.fillStyle = "#08090a";
  g.fillRect(0, 0, 512, 640);
  if (on) {
    g.fillStyle = "#f1efe9";
    g.font = "500 190px Inter";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("9:41", 256, 330);
    g.fillStyle = "rgba(241,239,233,0.45)";
    g.font = "400 44px Inter";
    g.fillText("Mon 12", 256, 470);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const bodyGeo = new RoundedBoxGeometry(38, 46, 10.5, 6, 7.5);
const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x141517, roughness: 0.28, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12 });
const strapGeo = new RoundedBoxGeometry(24, 34, 3.2, 4, 1.4);
const strapMat = new THREE.MeshPhysicalMaterial({ color: 0x2b2c2f, roughness: 0.72, metalness: 0, sheen: 0.4 });
const screenGeo = new THREE.PlaneGeometry(31.5, 39.4);
let screenOnMat = null, screenOffMat = null;
const badgeGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.8, 40);
// Unlit, so the badge (and the watch's centre cap) match the DOM dot's #913F3B exactly.
const badgeMat = new THREE.MeshBasicMaterial({ color: COLORS.oxide });
const BADGE = new THREE.Vector3(12.5, 16.5, 5.9); // badge centre in smartwatch space
watch.cap.material = badgeMat;

function makeSmart() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  const top = new THREE.Mesh(strapGeo, strapMat); top.position.set(0, 36, -1.5);
  const bot = new THREE.Mesh(strapGeo, strapMat); bot.position.set(0, -36, -1.5);
  const screen = new THREE.Mesh(screenGeo, screenOnMat); screen.position.z = 5.3;
  const badge = new THREE.Mesh(badgeGeo, badgeMat); badge.rotation.x = Math.PI / 2; badge.position.copy(BADGE);
  g.add(body, top, bot, screen, badge);
  g.userData = { screen, badge };
  return g;
}
// The smartwatch wall: 9 x 5, centre is index 22.
const COLS = 9, ROWS = 5, SX = 58, SY = 112;
const smarts = [];
const smartRoot = new THREE.Group();
scene.add(smartRoot);

// The logo: extruded symbol, scaled so each segment matches a standing link.
const LOGO_S = 0.3;
const logoMat = new THREE.MeshPhysicalMaterial({ color: COLORS.brassMetal, metalness: 1, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.4 });
const logo = buildLogo(logoMat, 10);
logo.scale.setScalar(LOGO_S);
logo.visible = false;
scene.add(logo);
const OLIVE = new THREE.Color(COLORS.olive), BRASS = new THREE.Color(COLORS.brassMetal);
// Segment centres/sizes (world mm) of the logo, from the traced artboard.
const SEG = {
  left: { x: -17.65 * LOGO_S, y: -11.95 * LOGO_S, w: 46.5 * LOGO_S, h: 90.9 * LOGO_S },
  right: { x: 17.7 * LOGO_S, y: 11.9 * LOGO_S, w: 46.6 * LOGO_S, h: 90.6 * LOGO_S },
};

// Wireframe of the watch for the reveal: the model's real mesh edges.
const wireMat = new THREE.LineBasicMaterial({ color: COLORS.olive, transparent: true, opacity: 0, depthWrite: false });
const wire = new THREE.Group();
{
  // Head only (no bracelet) so the words below stay clear; a sparse lathe reads as a model.
  const lo = buildWatch({ links: 7, ridges: 40, seg: 2 });
  lo.group.updateMatrixWorld(true);
  const skip = new Set([...lo.bracelet.up, ...lo.bracelet.down]);
  lo.group.traverse((o) => {
    if (!o.isMesh || skip.has(o)) return;
    const geo = o === lo.bezel ? new THREE.WireframeGeometry(o.geometry) : new THREE.EdgesGeometry(o.geometry, 30);
    const l = new THREE.LineSegments(geo, wireMat);
    l.applyMatrix4(o.matrixWorld);
    wire.add(l);
  });
}
const wireRoot = new THREE.Group();
wire.position.z = -9.0;
wireRoot.add(wire);
wireRoot.visible = false;
scene.add(wireRoot);
const logoWireMat = new THREE.LineBasicMaterial({ color: COLORS.olive, transparent: true, opacity: 0, depthWrite: false });
const logoWire = new THREE.LineSegments(new THREE.WireframeGeometry(logo.geometry), logoWireMat);
logoWire.scale.setScalar(LOGO_S);
logoWire.visible = false;
scene.add(logoWire);

// ---------------------------------------------------------------- the choreography
// Camera rig: always looks at `target`; distance, azimuth (deg), elevation (deg), roll (deg).
const camD = track([
  [B(9.3), 150], [B(10.0), 150], [B(11), 178, E.io2], [B(12), 640, E.io3], [B(13.75), 662, E.lin], [B(14.6), 320, E.in3],
  [B(16), 240], [B(17.8), 210, E.out3], [B(18.2), 215], [B(21), 345, E.io3], [B(25.2), 330, E.lin],
  [B(26), 300, E.io2], [B(27.3), 18, E.in3], [B(27.5), 270, E.lin], [B(28), 270], [B(32), 262, E.lin], [B(33.8), 178, E.io3],
  [B(36), 168, E.lin], [B(37.4), 262, E.io3], [B(40), 255, E.lin], [B(41), 300, E.io2], [B(43), 330, E.lin],
  [B(44.4), 200, E.io3], [B(46), 200], [B(47.2), 597, E.io3], [B(52.5), 597], [B(53.6), 215, E.io3], [B(59.6), 200, E.lin], [B(64), 200],
]);
const camAz = track([
  [B(0), 0], [B(21), 0], [B(24.5), -4, E.io2], [B(26), 0, E.io2], [B(32), 0], [B(33.8), 44, E.io3], [B(36), 52, E.lin],
  [B(37.4), 0, E.io3], [B(54), 0], [B(64), 18, E.lin],
]);
const camEl = track([
  [B(0), 0], [B(32), 0], [B(33.8), 11, E.io3], [B(36), 14, E.lin], [B(37.4), 0, E.io3], [B(54), 4], [B(64), 10, E.lin],
]);
// Camera target offset (mm): dive aims at the empty lower dial; macro aims at the bezel.
const camTarget = track([
  [B(0), [0, 0, 0]], [B(10), [0, 0, 0]], [B(11), [-12.5, -16.5, 0], E.io3], [B(13.75), [-12.5, -16.5, 0]],
  [B(14.6), [0, 0, 0], E.in3], [B(26.2), [0, 0, 0]], [B(27.3), [0, -8, -1], E.in3], [B(27.5), [0, 0, 0], E.lin],
  [B(32), [0, 0, 0]], [B(33.8), [3, 3, 2], E.io3], [B(36), [3, 3, 2]], [B(37.4), [0, 0, 0], E.io3],
]);

// Smartwatch wall.
const SMART_IN = B(9.3), SMART_WALL = B(11.2), SMART_OFF = B(13.25), IMPLODE_A = B(13.75), IMPLODE_B = B(14.6);
function smartPose(t) {
  const show = win(t, SMART_IN, IMPLODE_B + 0.02) || win(t, B(28), B(30.5));
  smartRoot.visible = show;
  if (!show) return;
  const act3 = t >= B(28);
  smarts.forEach((g, i) => {
    const c = (i % COLS) - 4, r = Math.floor(i / COLS) - 2;
    const centre = c === 0 && r === 0;
    let x = c * SX, y = r * SY, z = 0, s = 1, rz = 0, ry = 0;
    // The centre watch's badge sits on the world origin while it is the hero.
    if (act3) {
      if (!centre) { g.visible = false; return; }
      g.visible = true;
      x = 0; y = 0; z = track([[B(28), -220], [B(29), 0, E.out3]])(t);
      s = track([[B(28), 0.35], [B(29), 1, E.out3]])(t);
      ry = track([[B(29.8), 0], [B(30.5), Math.PI / 2, E.in25]])(t);
      g.visible = t < B(30.5);
    } else {
      g.visible = true;
      // The wall is offset so the centre watch's badge sits on the world origin.
      x -= BADGE.x; y -= BADGE.y;
      // Everyone but the centre fades up from the centre outwards once the camera pulls back.
      const dist = Math.hypot(c, r * 1.4);
      const appear = SMART_WALL + 0.08 + dist * 0.11;
      if (!centre) s = prog(t, appear, appear + 0.45, E.back(1.3));
      else s = prog(t, SMART_IN, B(10), E.back(1.5));
      // The hero grows around its badge, which stays pinned to the origin.
      if (centre) { x = -BADGE.x * s; y = -BADGE.y * s; }
      // Sync ping: tiny vibration on every watch at the same moment.
      for (const p of [B(12), B(12.5), B(13)]) {
        const k = prog(t, p, p + 0.28);
        if (k > 0 && k < 1) x += Math.sin((t - p) * 2 * Math.PI * 26) * 0.9 * (1 - k);
      }
      // Implosion: everything is pulled onto the origin badge while shrinking to nothing.
      const k = prog(t, IMPLODE_A, IMPLODE_B, E.in3);
      if (k > 0) {
        s *= 1 - k;
        const tx = -BADGE.x * s, ty = -BADGE.y * s;
        x = lerp(x, tx, centre ? 1 : k); y = lerp(y, ty, centre ? 1 : k);
        rz = centre ? 0 : (hash(i) - 0.5) * 1.6 * k;
        z = centre ? 0 : -40 * k;
      }
    }
    g.position.set(x, y, z);
    g.rotation.set(0, ry, rz);
    g.scale.setScalar(Math.max(1e-4, s));
    // Screens off at SMART_OFF; badges pulse on the pings; in act 3 one ping.
    const off = !act3 && t >= SMART_OFF;
    g.userData.screen.material = off ? screenOffMat : screenOnMat;
    let bs = 1;
    const pings = act3 ? [B(29)] : [B(12), B(12.5), B(13)];
    for (const p of pings) bs += 0.55 * Math.max(0, 1 - Math.abs(t - p - 0.06) / 0.16);
    g.userData.badge.visible = !off || (centre && !act3);
    g.userData.badge.scale.setScalar(bs);
  });
}

// The watch. Poses per act; links have their own choreography.
const WATCH_IN = B(16), WATCH_LAND = B(18);
const wRotY = track([
  [WATCH_IN, -Math.PI * 3 - 0.35], [WATCH_LAND, -0.35, E.out3], [B(21), -0.22, E.io2], [B(25.4), -0.18, E.lin],
  [B(26.2), 0, E.io2], [B(28), 0], [B(30.5), -Math.PI / 2], [B(31.2), -0.32, E.back(1.2)], [B(32), -0.3, E.lin],
  [B(33.8), -0.25, E.io2], [B(37.4), -0.08, E.io2], [B(40), -0.05, E.lin], [B(41), 0.05, E.io2],
]);
const wRotX = track([
  [WATCH_IN, 0.9], [WATCH_LAND, 0.1, E.out3], [B(26.2), 0, E.io2], [B(30.5), 0.05], [B(31.2), 0.1, E.out3],
  [B(37.4), 0.02, E.io2],
]);
const wScale = track([
  [WATCH_IN, 0.012], [WATCH_LAND - 0.24, 1.05, E.out3], [WATCH_LAND + 0.3, 1, E.spring(1.3, 5)], [B(43), 1], [B(43.8), 0.028, E.in3],
]);
function watchPose(t) {
  const act2 = win(t, WATCH_IN, B(27.3));
  const act3 = win(t, B(30.5), B(43.8));
  watchRoot.visible = act2 || act3;
  if (!watchRoot.visible) return;
  // Idle life: a slow sway and breathing tilt, never fully still.
  const sway = 0.035 * Math.sin((t / 3.4) * 2 * Math.PI) + 0.02 * Math.sin((t / 1.9) * 2 * Math.PI + 1.3);
  const tilt = 0.022 * Math.sin((t / 4.2) * 2 * Math.PI + 0.4);
  watchRoot.rotation.set(wRotX(t) + tilt, wRotY(t) + sway, 0);
  watchRoot.scale.setScalar(wScale(t));
  // Crown press on beat 24, hands spring round to 10:10.
  watch.crown.position.x = 18.55 - 0.9 * Math.max(0, 1 - Math.abs(t - B(24) - 0.06) / 0.12);
  let minutes = 9 + track([[B(24), 0], [B(25.2), 61, E.spring(0.9, 5.4)]])(t);
  // "Quiet, not smart": the minute hand steps once per beat, like a tick.
  if (t > B(36)) minutes += Math.min(4, Math.floor((t - B(36)) / 0.6)) + prog((t - B(36)) % 0.6, 0, 0.12, E.back(2)) * (t < B(40) ? 1 : 0);
  setTime(watch, 10, minutes);
  // Links: hidden in the spin-in; unfold one by one; hidden on the olive stage; leave for the burst.
  links.forEach((m, i) => {
    const dir = m.userData.dir, idx = m.userData.index;
    const start = B(18.25) + i * 0.085;
    let k = prog(t, start, start + 0.38, E.back(1.25));
    if (act3) k = 0; // head only on the olive stage
    if (t >= B(40) && t < B(43.8)) k = 0; // handed to the burst links
    m.visible = k > 0.001;
    const rest = m.userData.restPos;
    m.position.set(rest.x, lerp(dir * 12, rest.y, k), lerp(-4, rest.z, k));
    m.rotation.set(dir * (1 - k) * 1.4, 0, 0);
    m.scale.setScalar(lerp(0.45, 1, k));
  });
}

// Sunburst of 24 links, then the burst, then two links become the logo.
const SUN_IN = B(40.4), SUN_SPIN = B(41.2), BURST = B(43), LOCK = B(45);
function burstPose(t) {
  const show = win(t, SUN_IN, B(45.02));
  burstLinks.forEach((m, i) => {
    m.visible = show;
    if (!show) return;
    const keep = i === 0 || i === 12; // these two become the logo
    const a0 = (i / 24) * Math.PI * 2;
    const spin = track([[SUN_IN, -0.8], [SUN_SPIN, 0, E.out3], [BURST, 0.9, E.in2]])(t);
    const a = a0 + spin + Math.PI / 2;
    const appear = prog(t, SUN_IN + (i % 12) * 0.03, SUN_IN + (i % 12) * 0.03 + 0.5, E.out3);
    let R = lerp(16, 35, appear);
    let s = lerp(0.3, 1.5, appear);
    let z = lerp(-14, -2 - (i % 2) * 1.2, appear);
    if (!keep) {
      const k = prog(t, BURST, BURST + 0.45, E.in3);
      R += k * 420; z += k * 60; s *= 1 - 0.3 * k;
    }
    // Radial array: each link's long axis points outward, like turbine vanes.
    let x = R * Math.cos(a), y = R * Math.sin(a), rz = a, rx = 0.7, sx = 1, sy = 1;
    if (keep) {
      // The two keepers slide into the logo: stand upright, stretch to the segment size.
      const k = prog(t, B(43.6), LOCK, E.io3);
      const seg = i === 0 ? SEG.right : SEG.left;
      const spec = spare;
      x = lerp(x, seg.x, k); y = lerp(y, seg.y, k);
      rz = lerp(rz, Math.round((rz - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2, k);
      rx = lerp(rx, 0, k);
      sx = lerp(1, seg.h / spec.w, k); sy = lerp(1, seg.w / spec.l, k);
      s = lerp(s, 1, k);
    }
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    m.scale.set(s * sx, s * sy, s);
  });
  // Logo: appears the instant the two links lock.
  const logoOn = win(t, LOCK, B(53.2));
  logo.visible = logoOn;
  if (logoOn) {
    const c = prog(t, LOCK, LOCK + 0.6, E.out2);
    logoMat.color.copy(BRASS).lerp(OLIVE, c);
    logoMat.metalness = lerp(1, 0.08, c);
    logoMat.roughness = lerp(0.42, 0.5, c);
    // Settle face-on with a little life; slide left for the wordmark.
    const ry = track([[LOCK, 0], [B(46), 0.35, E.out3], [B(48), 0.12, E.io2], [B(50), 0.05, E.lin]])(t) + 0.03 * Math.sin(t * 1.7);
    const x = track([[B(46), 0], [B(47.2), -62.4, E.io3]])(t);
    const fade = prog(t, B(52.2), B(53.2));
    logo.position.set(x, 0, 0);
    logo.rotation.set(0.04 * Math.sin(t * 1.3), ry, 0);
    logo.scale.setScalar(LOGO_S * (1 + 0.04 * prog(t, LOCK, LOCK + 0.12) * (1 - prog(t, LOCK + 0.12, LOCK + 0.5))));
    logoMat.opacity = 1 - fade;
    logoMat.transparent = fade > 0;
    logoWire.visible = fade > 0;
    logoWire.position.copy(logo.position); logoWire.rotation.copy(logo.rotation);
    logoWireMat.opacity = 0.65 * fade;
  } else logoWire.visible = false;
}

// Reveal: the watch returns as its own wireframe, then collapses into the dot.
function wirePose(t) {
  const show = win(t, B(52.6), B(59.6));
  wireRoot.visible = show;
  if (!show) return;
  const inK = prog(t, B(52.6), B(54), E.out3);
  const outK = prog(t, B(58), B(59.5), E.in3);
  wireMat.opacity = 0.42 * inK * (1 - outK);
  wireRoot.rotation.set(0.18 + 0.05 * Math.sin(t * 0.9), -0.6 + (t - B(52.6)) * 0.32, 0.05);
  wireRoot.scale.setScalar(lerp(0.82, 1, inK) * (1 - outK * 0.98));
}

// Which frames get motion blur, and how many sub-frame samples.
const BLUR = [
  [B(13.7), B(14.7), 6], [WATCH_IN, WATCH_LAND - 0.25, 7], [B(18.2), B(19.4), 4], [B(26.5), B(27.4), 6],
  [B(30.1), B(31.2), 6], [B(40.3), B(41.3), 4], [BURST - 0.05, BURST + 0.55, 8], [B(43.6), LOCK + 0.05, 4],
  [B(43), B(43.9), 6],
];
function samplesAt(t) { let k = 1; for (const [a, b, n] of BLUR) if (t >= a && t < b) k = Math.max(k, n); return k; }

// ---------------------------------------------------------------- DOM coupled to 3D
const dom = {
  dot: document.getElementById("dot"),
  olive: document.getElementById("olive"),
};
const pxPerMm = (d) => H / (2 * d * TAN);
function project(v) {
  const p = v.clone().project(cam);
  return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H];
}

function poseCamera(t) {
  // Continuous micro-orbit so even holds breathe; the target itself never leaves centre.
  const d = camD(t);
  const az = ((camAz(t) + 0.45 * Math.sin(t * 0.61)) * Math.PI) / 180;
  const el = ((camEl(t) + 0.35 * Math.sin(t * 0.47 + 1.1)) * Math.PI) / 180;
  const tg = camTarget(t);
  cam.position.set(tg[0] + d * Math.sin(az) * Math.cos(el), tg[1] + d * Math.sin(el), tg[2] + d * Math.cos(az) * Math.cos(el));
  cam.up.set(0, 1, 0);
  cam.lookAt(tg[0], tg[1], tg[2]);
  cam.updateMatrixWorld();
  // Key light rakes across the bezel during the macro.
  const la = (-40 + 110 * prog(t, B(32), B(36), E.io2) * (t < B(37) ? 1 : 0)) * Math.PI / 180;
  key.position.set(Math.sin(la) * 100, 90, Math.cos(la) * 100);
  rim.position.set(90, -30, -80);
}

function pose(t) {
  poseCamera(t);
  smartPose(t);
  watchPose(t);
  burstPose(t);
  wirePose(t);
}

function applyDom(t) {
  // Olive stage: its circular edge matches the dial on the way in (dive) and out (collapse).
  const dialR = 13.45;
  let r = 0;
  if (t >= B(26.6) && t < B(40.8)) {
    if (t < B(27.3)) {
      const [cx, cy] = project(new THREE.Vector3(0, 0, -1).applyMatrix4(watchRoot.matrixWorld));
      const px = dialR * pxPerMm(Math.max(8, cam.position.distanceTo(new THREE.Vector3(0, 0, -1))));
      r = px; dom.olive.style.setProperty("--cx", `${cx}px`); dom.olive.style.setProperty("--cy", `${cy}px`);
    } else if (t < B(40)) r = 2600;
    else {
      const d = cam.position.length();
      const target = dialR * pxPerMm(d) * wScale(t);
      r = lerp(2600, target, prog(t, B(40), B(40.8), E.in3));
      dom.olive.style.setProperty("--cx", `960px`); dom.olive.style.setProperty("--cy", `540px`);
    }
  }
  dom.olive.style.setProperty("--r", `${Math.max(0, r)}px`);
  dom.olive.style.opacity = r > 0 ? 1 : 0;
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const K = samplesAt(t);
  const shutter = 0.5 / FPS; // 180 degrees
  renderer.setRenderTarget(accum);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  addMat.uniforms.tex.value = sample.texture;
  addMat.uniforms.w.value = 1 / K;
  for (let k = 0; k < K; k++) {
    const ts = K === 1 ? t : t - shutter * (1 - k / (K - 1)) + shutter * 0.5;
    pose(ts);
    renderer.setRenderTarget(sample);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.setRenderTarget(accum);
    renderer.render(quadScene, quadCam);
  }
  pose(t);
  applyDom(t);
  renderer.setRenderTarget(null);
  outMat.uniforms.tex.value = accum.texture;
  renderer.render(outScene, quadCam);
}

// ---------------------------------------------------------------- build + hook up
async function build() {
  await document.fonts.load('500 190px "Inter"');
  await document.fonts.load('400 44px "Inter"');
  screenOnMat = new THREE.MeshBasicMaterial({ map: screenTexture(true), toneMapped: false });
  screenOffMat = new THREE.MeshBasicMaterial({ map: screenTexture(false), toneMapped: false });
  for (let i = 0; i < COLS * ROWS; i++) { const g = makeSmart(); smarts.push(g); smartRoot.add(g); }
  // Warm up shaders so the first captured frame is complete.
  renderer.compile(scene, cam);
  renderAt(window.__hfThreeTime || 0);
}
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
let built = false;
const ready = build().then(() => { built = true; });
window.__hf.buildReady["clock-it-3d"] = ready;
window.addEventListener("hf-seek", (e) => {
  if (built) renderAt(e.detail.time);
  else ready.then(() => renderAt(e.detail.time));
});
// Debug hook for local stills: window.__renderAt(t).
window.__renderAt = (t) => ready.then(() => renderAt(t));
