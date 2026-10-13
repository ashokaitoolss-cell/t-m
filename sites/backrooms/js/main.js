import * as THREE from 'three';
import { World, CELL, hash3, lightKind } from './world.js';
import { ChunkManager } from './chunks.js';
import { createMaterials, createPost } from './shaders.js';
import { Player } from './player.js';
import { Input } from './input.js';
import { HeadTracker } from './head-tracker.js';
import { Ambience } from './audio.js';
import { Horror } from './sfx.js';
import { Operator } from './voice.js';
import { Eyes } from './eyes.js';
import { Hud } from './hud.js';
import { Game } from './game.js';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const capture = params.has('capture'); // fixed view for screenshots
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HFOV = 92 * (Math.PI / 180); // wide, like the camcorder in the footage
const SHUTTER = 1 / 40; // seconds of motion smeared into each frame
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ settings

const settings = readSettings();

function readSettings() {
  let s = {};
  try {
    s = JSON.parse(localStorage.getItem('backrooms') || '{}') || {};
  } catch {
    // storage blocked: defaults only
  }
  const num = (v, lo, hi, d) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
  return {
    sensitivity: num(s.sensitivity, 0.2, 3, 1),
    headGain: num(s.headGain, 1, 4, 2.2),
    volume: num(s.volume, 0, 1, 0.8),
    blur: s.blur !== false,
    lens: s.lens !== false,
    overlay: s.overlay === true,
    invertY: s.invertY === true,
    preview: s.preview !== false,
    reducedScares: s.reducedScares === true,
    reduceFlashing: s.reduceFlashing === true,
    captions: s.captions !== false,
    voice: s.voice !== false,
    hideDigits: s.hideDigits === true,
  };
}

function saveSettings() {
  try {
    localStorage.setItem('backrooms', JSON.stringify(settings));
  } catch {
    // not persisted
  }
}

// ------------------------------------------------------------------ renderer

const canvas = $('#view');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: capture });
} catch (err) {
  fatal('This browser could not start WebGL2.');
  throw err;
}
renderer.setClearColor(0x000000, 1);
const halfFloat = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
const target = new THREE.WebGLRenderTarget(1, 1, {
  type: halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType,
  minFilter: THREE.LinearMipmapLinearFilter,
  magFilter: THREE.LinearFilter,
  generateMipmaps: true,
  depthBuffer: true,
  samples: capture ? 0 : 4,
});

const seed = Number.isFinite(Number(params.get('seed'))) && params.get('seed') ? Number(params.get('seed')) >>> 0 : (Math.random() * 2 ** 32) >>> 0;
const world = new World(seed);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, 1, 0.05, 160);
camera.rotation.order = 'YXZ';

const textures = loadTextures();
const materials = createMaterials(textures, seed);
if (settings.reduceFlashing) materials.shared.uFlicker.value = 0;
const chunks = new ChunkManager(world, materials, scene, 3);

const post = createPost();
const postScene = new THREE.Scene();
const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post);
postQuad.frustumCulled = false;
postScene.add(postQuad);
const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

function loadTextures() {
  const loader = new THREE.TextureLoader();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const load = (name, color) => {
    const t = loader.load(new URL(`../assets/${name}`, import.meta.url).href, undefined, undefined, () => {
      console.warn(`Could not load ${name}`);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso;
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return {
    carpet: load('carpet.jpg', true),
    carpetNormal: load('carpet-normal.jpg', false),
    ceiling: load('ceiling.jpg', true),
    stains: load('stains.jpg', false),
  };
}

// ------------------------------------------------------------------ actors

const player = new Player(world);
[player.x, player.z] = world.findSpawn();
// Behind the title card: standing, slowly looking around. Entering starts
// the walk lying on the carpet.
player.wake = 1;
player.pitch = 0;
player.roll = 0;
const input = new Input(canvas);
const tracker = new HeadTracker($('#camera'));
const audio = new Ambience();
const sfx = new Horror(audio);
const operator = new Operator(sfx);
const eyes = new Eyes();
const hud = new Hud();
let game = null;
input.sensitivity = settings.sensitivity;
operator.enabled = settings.voice;
operator.volume = settings.volume;
input.invertY = settings.invertY;
audio.volume = settings.volume;
player.onStep = (intensity) => audio.step(intensity);

const state = {
  started: false,
  paused: false,
  mode: 'mouse', // or 'camera'
  kind: 'game', // or 'walk'
  touchHold: false,
  tapAnswer: false,
  quality: 1,
  slow: 0,
  fast: 0,
  neutral: null, // calibrated head pose
  calibrateAt: 0,
  head: { yaw: 0, pitch: 0, lean: 0 },
  startTime: performance.now(),
  frames: 0,
  hintHidden: false,
};

if (capture) {
  const v = (key, d) => (params.get(key) || '').split(',').map(Number).concat(d).slice(0, d.length).map((x, i) => (Number.isFinite(x) ? x : d[i]));
  const [x, z] = v('pos', [player.x, player.z]);
  const [yaw, pitch] = v('look', [45, 0]);
  player.x = x;
  player.z = z;
  player.aimYaw = player.yaw = yaw * DEG;
  player.aimPitch = player.pitch = pitch * DEG;
  player.wake = 1;
  player.roll = 0;
  state.started = true;
}

// ------------------------------------------------------------------ loop

let last = performance.now();
let fpsTime = last, fpsFrames = 0;
const debug = params.has('debug') ? Object.assign(document.createElement('div'), { className: 'debug' }) : null;
if (debug) {
  document.body.append(debug);
  window.backrooms = { player, world, chunks, tracker, state, settings, input, eyes, sfx, materials, get game() { return game; } };
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  resize();

  const active = state.started && !state.paused;
  const sample = active ? input.sample(dt) : (input.sample(dt), { move: [0, 0], run: false, look: [state.started || reducedMotion ? 0 : 0.07 * dt, 0] });
  const touch = matchMedia('(pointer: coarse)').matches;
  if (game && active) {
    const mode = state.mode === 'camera' && tracker.running ? 'camera' : 'manual';
    if (eyes.mode !== mode) {
      eyes.mode = mode;
      eyes.reset();
    }
    game.update(dt, {
      holding: input.keys.has('Space') || state.touchHold,
      blink: input.took('KeyB'),
      answer: input.took('KeyE') || state.tapAnswer,
      hfov: 2 * Math.atan(Math.tan((camera.fov * DEG) / 2) * camera.aspect),
      touch,
    });
    state.tapAnswer = false;
    if (game.lockMove) {
      sample.move = [0, 0];
      sample.run = false;
    }
    if (game.phase === 'caught' && game.scareT < 1.4) sample.look = [0, 0];
  }
  input.pressed.clear();
  const head = headLook(dt, now);
  if (head && active) {
    // Hold the head turned past ~14° and the body keeps turning that way.
    const over = Math.abs(head.yaw) - 14 * DEG * settings.headGain;
    if (over > 0) sample.look[0] += Math.sign(head.yaw) * over * 1.6 * dt;
  }
  if (!capture) {
    player.update(dt, { ...sample, head: active ? head : null }, reducedMotion);
  } else {
    player.update(0, { move: [0, 0], run: false, look: [0, 0], head: null }, true);
  }

  const pending = chunks.update(player.x, player.z, capture ? 99 : state.frames < 2 ? 99 : 2);
  const c = player.camera;
  camera.position.set(c.x, c.y, c.z);
  camera.rotation.set(c.pitch, c.yaw, c.roll);

  const time = capture ? Number(params.get('t')) || 0 : (now - state.startTime) / 1000;
  materials.shared.uTime.value = time;
  post.uniforms.uTime.value = time;
  post.uniforms.uLens.value = settings.lens ? 1 : 0;
  const caught = game && game.phase === 'caught';
  document.body.classList.toggle('scare', !!caught);
  post.uniforms.uLid.value = game && !caught ? eyes.lid : 0;
  post.uniforms.uStrain.value = game && !caught ? eyes.strain : 0;
  post.uniforms.uScare.value = game ? game.scare : 0;
  post.uniforms.uExposure.value = 1.08 * (1 + (game ? 0.9 * game.flash + 6 * game.whiteout : 0));
  const vfov = camera.fov * DEG;
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const blur = settings.blur && !reducedMotion ? SHUTTER : 0;
  post.uniforms.uBlur.value.set(
    clamp((player.yawRate * blur) / hfov, -0.05, 0.05),
    clamp((-player.pitchRate * blur) / vfov, -0.05, 0.05),
  );

  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  post.uniforms.tScene.value = target.texture;
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCamera);

  if (state.started) {
    updateAudio(time);
    sfx.setListener(c.x, c.y, c.z, c.yaw, c.pitch);
    sfx.update();
  }
  if (settings.preview && tracker.running && state.mode === 'camera') tracker.drawPreview($('#preview-canvas'));
  if (settings.overlay) updateOverlay(time);
  state.frames++;

  if (capture && pending === 0 && ++state.capturedFrames > 2) {
    renderer.getContext().finish();
    document.body.dataset.captured = 'true';
    return;
  }
  adaptQuality(dt);
  if (debug && now - fpsTime > 500) {
    debug.textContent = `${Math.round((fpsFrames * 1000) / (now - fpsTime))} fps · ${chunks.count} chunks · q ${state.quality.toFixed(2)} · pos ${player.x.toFixed(1)}, ${player.z.toFixed(1)} · yaw ${((player.yaw / DEG) % 360).toFixed(0)}° · seed ${seed}`;
    fpsTime = now;
    fpsFrames = 0;
  }
  fpsFrames++;
  requestAnimationFrame(frame);
}
state.capturedFrames = 0;

// Head pose → view offsets, relative to the calibrated neutral pose.
function headLook(dt, now) {
  if (state.mode !== 'camera') return null;
  const target = { yaw: 0, pitch: 0, lean: 0 };
  if (tracker.state === 'tracking' && tracker.position) {
    if (!state.neutral && now > state.calibrateAt) recenterHead();
    if (state.neutral) {
      const g = settings.headGain;
      target.yaw = -clamp(g * (tracker.yaw - state.neutral.yaw), -1.7, 1.7);
      target.pitch = clamp(g * (tracker.pitch - state.neutral.pitch), -1.2, 1.2);
      target.lean = clamp((tracker.position[0] - state.neutral.x) * 0.0028, -0.4, 0.4);
    }
  }
  // Lost the face: ease back to looking straight ahead.
  const k = 1 - Math.exp(-dt / (tracker.state === 'tracking' ? 0.04 : 0.7));
  for (const key of ['yaw', 'pitch', 'lean']) state.head[key] += (target[key] - state.head[key]) * k;
  return state.head;
}

function recenterHead() {
  if (tracker.state !== 'tracking' || !tracker.position) return false;
  state.neutral = { yaw: tracker.yaw, pitch: tracker.pitch, x: tracker.position[0] };
  return true;
}

// The hum swells under lit panels; flickering ones crackle.
function updateAudio(time) {
  const ci = Math.floor(player.x / CELL), cj = Math.floor(player.z / CELL);
  let near = 0, crackle = 0;
  for (let i = ci - 1; i <= ci + 1; i++) {
    for (let j = cj - 1; j <= cj + 1; j++) {
      const kind = lightKind(i, j, seed, materials.shared.uDead.value, materials.shared.uFlicker.value);
      if (kind === 0) continue;
      const d2 = ((i + 0.5) * CELL - player.x) ** 2 + ((j + 0.5) * CELL - player.z) ** 2;
      near = Math.max(near, Math.exp(-d2 / 6));
      if (kind === 2) {
        const r = hash3(i, j, 5, seed);
        const unstable = (time * 0.21 + r * 13) % 1 > 0.62;
        if (unstable) crackle = Math.max(crackle, Math.exp(-d2 / 14) * (Math.random() < 0.5 ? 1 : 0.2));
      }
    }
  }
  audio.update(near, crackle, materials.shared.uPower.value);
}

function adaptQuality(dt) {
  if (document.hidden) return;
  if (dt > 1 / 40) state.slow++;
  else state.slow = Math.max(0, state.slow - 1);
  if (dt < 1 / 56) state.fast++;
  else state.fast = 0;
  if (state.slow > 40 && state.quality > 0.5) {
    state.quality = Math.max(0.5, state.quality * 0.85);
    state.slow = 0;
  } else if (state.fast > 300 && state.quality < 1) {
    state.quality = Math.min(1, state.quality * 1.1);
    state.fast = 0;
  }
}

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const ratio = Math.min(devicePixelRatio || 1, 1.5) * state.quality;
  const pw = Math.max(1, Math.round(w * ratio)), ph = Math.max(1, Math.round(h * ratio));
  if (canvas.width !== pw || canvas.height !== ph) {
    renderer.setPixelRatio(1);
    renderer.setSize(pw, ph, false);
    target.setSize(pw, ph);
  }
  const aspect = w / h;
  post.uniforms.uAspect.value = aspect;
  const vfov = clamp(2 * Math.atan(Math.tan(HFOV / 2) / aspect), 52 * DEG, 80 * DEG);
  if (camera.aspect !== aspect || Math.abs(camera.fov - vfov / DEG) > 1e-3) {
    camera.aspect = aspect;
    camera.fov = vfov / DEG;
    camera.updateProjectionMatrix();
  }
}

// ------------------------------------------------------------------ UI

// kind: 'camera' (the game, watching your real eyes), 'eyes' (the game
// without a camera) or 'walk' (Level 0 with nothing in it).
function start(kind) {
  if (state.started) return;
  document.activeElement?.blur?.(); // so Space/Enter can't press the button again
  const mode = kind === 'camera' ? 'camera' : 'mouse';
  state.mode = mode;
  state.kind = kind === 'walk' ? 'walk' : 'game';
  state.started = true;
  state.startTime = performance.now();
  document.body.classList.add('playing');
  $('#title').classList.add('gone');
  // Fade in from black, lying on the carpet.
  const fade = $('#fade');
  fade.classList.remove('out');
  void fade.offsetWidth;
  fade.classList.add('out');
  player.wake = 0;
  player.aimPitch = 0;
  player.pitch = -1.25;
  player.roll = 0.35;
  audio.start();
  audio.setMuted(false);
  if (state.kind === 'game') {
    sfx.init();
    operator.warm();
    eyes.mode = 'manual';
    game = new Game({ world, scene, materials, player, eyes, tracker, sfx, operator, hud, settings, seed });
    game.start();
    document.body.classList.add('game');
  }
  if (mode === 'camera') startCamera();
  else input.lock();
  updateStatus();
}

async function startCamera() {
  state.mode = 'camera';
  state.neutral = null;
  state.calibrateAt = performance.now() + 700; // let the filters settle first
  updateStatus();
  try {
    await tracker.start();
  } catch (err) {
    state.mode = 'mouse';
    toast(
      game
        ? `${err.message} Playing without the camera: your eyes will dry out. Hold Space to keep them open. Click to look around.`
        : `${err.message} Using the mouse instead. Click to look around.`,
    );
  }
  updateStatus();
}

function setPaused(paused) {
  state.paused = paused;
  $('#pause').hidden = !paused;
  document.body.classList.toggle('paused', paused);
  if (paused) {
    audio.setMuted(true);
    operator.pause();
  } else {
    audio.setMuted(state.muted === true);
    operator.resume();
  }
  updateHint();
}

function resume() {
  setPaused(false);
  if (state.mode === 'mouse' || input.lockedBefore) input.lock();
}

input.onlockchange = (locked) => {
  if (locked) {
    input.lockedBefore = true;
    if (state.paused) setPaused(false);
  } else if (state.started && state.mode === 'mouse' && !capture && !(game && ['caught', 'won'].includes(game.phase))) {
    setPaused(true); // Esc releases the mouse: pause
  }
  updateHint();
};

function updateStatus() {
  const el = $('#status');
  let text = 'Mouse look', cls = '';
  if (matchMedia('(pointer: coarse)').matches) text = 'Touch';
  if (state.mode === 'camera') {
    if (tracker.state === 'starting') [cls, text] = ['wait', 'Starting camera…'];
    else if (tracker.state === 'tracking') [cls, text] = ['on', 'Head look'];
    else if (tracker.state === 'lost') [cls, text] = ['wait', 'Looking for you…'];
    else if (tracker.state === 'error') [cls, text] = ['off', 'Camera unavailable'];
  }
  el.dataset.state = cls;
  $('#status-text').textContent = text;
  $('#preview').hidden = !(settings.preview && state.mode === 'camera' && tracker.running);
  $('#opt-camera').textContent = state.mode === 'camera' ? 'Switch to mouse look' : 'Look with your head (camera)';
  updateHint();
}
tracker.onstatechange = updateStatus;

function updateHint() {
  const hint = $('#hint');
  let text = '';
  if (state.started && !state.paused) {
    if (matchMedia('(pointer: coarse)').matches) text = state.hintHidden ? '' : 'Drag left to walk · drag right to look';
    else if (game && ['caught', 'won'].includes(game.phase)) text = '';
    else if (state.mode === 'mouse' && !input.locked) text = 'Click to look around';
    else if (!state.hintHidden) text = game ? 'WASD to walk · E to answer · Space keeps your eyes open · Esc for menu' : 'WASD to walk · Shift to run · Esc for menu';
  }
  hint.textContent = text;
  hint.hidden = !text;
}

const overlayStart = new Date();
function updateOverlay(time) {
  const d = new Date(overlayStart.getTime() + time * 1000);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const h = d.getHours() % 12 || 12;
  const stamp = `${d.getHours() < 12 ? 'AM' : 'PM'} ${h}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  $('#osd-time').textContent = `${stamp}\n${months[d.getMonth()]}. ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`;
}

let toastTimer = 0;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 4500);
}

function fatal(message) {
  $('#fatal-text').textContent = message;
  $('#fatal').hidden = false;
  document.body.classList.add('fatal');
}

function wireUi() {
  $('#play-camera').addEventListener('click', () => start('camera'));
  $('#play-eyes').addEventListener('click', () => start('eyes'));
  $('#just-walk').addEventListener('click', () => start('walk'));
  canvas.addEventListener('click', () => {
    if (state.started && !state.paused && !matchMedia('(pointer: coarse)').matches) input.lock();
  });
  wireGameUi();
  $('#resume').addEventListener('click', resume);
  $('#opt-camera').addEventListener('click', () => {
    if (state.mode === 'camera') {
      tracker.stop();
      state.mode = 'mouse';
      updateStatus();
    } else {
      startCamera();
    }
  });
  $('#recenter').addEventListener('click', () => {
    toast(recenterHead() ? 'Head look centred.' : 'Turn the camera on to recenter your head.');
  });
  $('#new-place').addEventListener('click', () => {
    const next = new URL(location.href);
    next.searchParams.set('seed', String((Math.random() * 2 ** 32) >>> 0));
    location.href = next.href;
  });
  $('#seed').textContent = String(seed);
  $('#copy-link').addEventListener('click', async () => {
    const link = new URL(location.href);
    link.searchParams.set('seed', String(seed));
    try {
      await navigator.clipboard.writeText(link.href);
      toast('Link to this place copied.');
    } catch {
      toast(link.href);
    }
  });

  const bindRange = (id, key, apply) => {
    const el = $(id);
    el.value = settings[key];
    el.addEventListener('input', () => {
      settings[key] = Number(el.value);
      apply?.(settings[key]);
      saveSettings();
    });
  };
  bindRange('#opt-sensitivity', 'sensitivity', (v) => (input.sensitivity = v));
  bindRange('#opt-head', 'headGain');
  bindRange('#opt-volume', 'volume', (v) => {
    audio.setVolume(v);
    if (!state.muted) operator.volume = v;
  });
  const bindToggle = (id, key, apply) => {
    const el = $(id);
    el.checked = settings[key];
    el.addEventListener('change', () => {
      settings[key] = el.checked;
      apply?.(el.checked);
      saveSettings();
    });
  };
  bindToggle('#opt-blur', 'blur');
  bindToggle('#opt-lens', 'lens');
  bindToggle('#opt-overlay', 'overlay', (on) => ($('#osd').hidden = !on));
  bindToggle('#opt-invert', 'invertY', (on) => (input.invertY = on));
  bindToggle('#opt-preview', 'preview', updateStatus);
  bindToggle('#opt-gentle', 'reducedScares');
  bindToggle('#opt-flashing', 'reduceFlashing', (on) => (game ? game.setLights(game.lights) : (materials.shared.uFlicker.value = on ? 0 : 0.035)));
  bindToggle('#opt-captions', 'captions');
  bindToggle('#opt-voice', 'voice', (on) => {
    operator.enabled = on;
    if (!on) operator.cancel();
  });
  bindToggle('#opt-hide', 'hideDigits', () => game && hud.digits(game.code, game.found, settings.hideDigits));
  $('#osd').hidden = !settings.overlay;

  window.addEventListener('keydown', (e) => {
    if (!state.started || capture) return;
    if (game?.phase === 'dial' && !state.paused) {
      const digit = /^(Digit|Numpad)([0-9])$/.exec(e.code);
      if (digit) game.dialKey(digit[2]);
      else if (e.code === 'Backspace') game.dialKey('back');
      if (digit || e.code === 'Backspace') return;
    }
    if (e.code === 'Escape' && state.mode === 'camera' && !input.locked) setPaused(!state.paused);
    else if (e.code === 'KeyC') toast(recenterHead() ? 'Head look centred.' : 'Recenter works with the camera on.');
    else if (e.code === 'KeyM') {
      state.muted = !state.muted;
      audio.setMuted(state.muted);
      operator.volume = state.muted ? 0 : settings.volume;
      if (state.muted) operator.cancel();
      toast(state.muted ? 'Sound off' : 'Sound on');
    } else if (e.code === 'KeyV') {
      settings.overlay = !settings.overlay;
      $('#opt-overlay').checked = settings.overlay;
      $('#osd').hidden = !settings.overlay;
      saveSettings();
    } else if (e.code === 'KeyF') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.().then(() => state.mode === 'mouse' && input.lock()).catch(() => {});
    }
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp'].includes(e.code) && !state.hintHidden) {
      setTimeout(() => {
        state.hintHidden = true;
        updateHint();
      }, 2500);
    }
  });
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' && !state.hintHidden) {
      setTimeout(() => {
        state.hintHidden = true;
        updateHint();
      }, 3000);
    }
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? audio.suspend() : audio.resume()));
  if (matchMedia('(pointer: coarse)').matches) $('#play-eyes').textContent = 'Play without camera (touch)';
}

function wireGameUi() {
  $('#menu').addEventListener('click', () => {
    input.unlock();
    setPaused(true);
  });
  $('#prompt').addEventListener('click', () => (state.tapAnswer = true));
  const hold = $('#hold-eyes');
  const setHold = (on) => {
    state.touchHold = on;
    hold.classList.toggle('held', on);
  };
  hold.addEventListener('pointerdown', (e) => {
    hold.setPointerCapture(e.pointerId);
    setHold(true);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) hold.addEventListener(type, () => setHold(false));
  hold.addEventListener('contextmenu', (e) => e.preventDefault());
  $('#keypad').addEventListener('click', (e) => {
    const key = e.target.closest('button')?.dataset.key;
    if (key) game?.dialKey(key);
  });
  $('#dial-hang').addEventListener('click', () => game?.hangUp());
  $('#end-redial').addEventListener('click', () => {
    game?.retry();
    if (state.mode === 'mouse') input.lock();
    updateHint();
  });
  const leave = (newPlace) => {
    const next = new URL(location.href);
    if (newPlace) next.searchParams.set('seed', String((Math.random() * 2 ** 32) >>> 0));
    else next.searchParams.delete('seed');
    location.href = next.href;
  };
  $('#end-again').addEventListener('click', () => leave(true));
  $('#end-quit').addEventListener('click', () => leave(false));
  // The end cards need the mouse back.
  new MutationObserver(() => {
    if (!$('#ending').hidden) {
      input.unlock();
      updateHint();
    }
  }).observe($('#ending'), { attributes: true, attributeFilter: ['hidden'] });
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

wireUi();
updateStatus();
updateHint();
if (capture) {
  $('#title').classList.add('gone');
  document.body.classList.add('playing', 'capture');
}
requestAnimationFrame(frame);
