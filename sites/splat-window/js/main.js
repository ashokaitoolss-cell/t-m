import { SplatRenderer, MAX_GROUPS } from './renderer.js';
import { orreryPose, ROOM_DEPTH } from './orrery.js';
import { compose, identity, rotationY, translation } from './math.js';
import { HeadTracker } from './head-tracker.js';
import { PointerInput } from './pointer-input.js';
import { defaultDistance, faceToEye, recenterCalibration } from './viewer.js';
import { SCENES, USER_PRESET } from './scenes.js';

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const capture = params.has('capture'); // fixed-view mode for screenshots
const ACCENT = [0.36, 0.53, 0.88];

// ------------------------------------------------------------------ settings

const settings = readSettings();

function readSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem('splat-window') || '{}') || {};
  } catch {
    // Storage blocked or corrupt: start from the defaults.
  }
  const finite = (v) => typeof v === 'number' && Number.isFinite(v);
  return {
    strength: finite(saved.strength) ? Math.min(2.5, Math.max(0.5, saved.strength)) : 1,
    room: saved.room !== false,
    preview: saved.preview !== false,
    calibration: Array.isArray(saved.calibration) && saved.calibration.length === 2 && saved.calibration.every(finite)
      ? saved.calibration
      : [0, 0],
    camera: saved.camera === true,
    introSeen: saved.introSeen === true,
  };
}

function saveSettings() {
  try {
    localStorage.setItem('splat-window', JSON.stringify(settings));
  } catch {
    // Private mode or storage disabled: settings just won't persist.
  }
}

// ------------------------------------------------------------------ setup

const canvas = $('#view');
let renderer;
try {
  renderer = new SplatRenderer(canvas);
} catch (err) {
  fatal(err.message);
  throw err;
}

const worker = new Worker(new URL('./splat-worker.js', import.meta.url), { type: 'module' });
const tracker = new HeadTracker($('#camera'));
const pointer = new PointerInput(canvas, { ignore: '.dock, .panel, .card, .toast' });

const groups = new Float32Array(16 * MAX_GROUPS);
for (let g = 0; g < MAX_GROUPS; g++) identity(groups.subarray(g * 16, g * 16 + 16));

const state = {
  entry: null, // scene on screen
  token: 0, // its worker token
  loadToken: 0, // newest requested scene
  loading: null,
  sceneStart: 0,
  sortBusy: false,
  sortBuffer: null,
  sortedRows: null,
  eye: [0, 0, defaultDistance()],
  source: 'idle',
  blendUntil: 0,
  lastFaceEye: null,
  quality: 1,
  slowFrames: 0,
  fastFrames: 0,
  capturedFrames: 0,
};

// ------------------------------------------------------------------ scenes

worker.onmessage = (e) => {
  const msg = e.data;
  if (msg.type === 'loaded') {
    if (msg.token !== state.loadToken) return; // superseded by a newer pick
    renderer.setScene(msg);
    state.token = msg.token;
    state.entry = state.loading;
    state.loading = null;
    state.sceneStart = performance.now();
    state.sortedRows = null;
    state.sortBuffer = null;
    hideLoader();
    updateSceneUi();
    $('#scene-caption').textContent = `${state.entry.title} · ${msg.count.toLocaleString()} splats`;
    document.body.classList.add('ready');
  } else if (msg.type === 'sorted') {
    state.sortBusy = false;
    if (!msg.stale && msg.token === state.token && msg.indices) renderer.setOrder(msg.indices);
    state.sortBuffer = msg.indices;
  } else if (msg.type === 'error') {
    if (msg.token !== state.loadToken) return;
    failLoad(msg.message);
  }
};

async function loadScene(entry) {
  const token = ++state.loadToken;
  state.abort?.abort();
  state.loading = entry;
  updateSceneUi();
  const maxTextureSize = renderer.maxTextureSize;
  if (entry.procedural) {
    worker.postMessage({ type: 'load', token, procedural: true, maxTextureSize });
    return;
  }
  try {
    let buffer;
    if (entry.file) {
      showLoader(`Reading ${entry.title}…`, null);
      buffer = await entry.file.arrayBuffer();
    } else {
      const abort = (state.abort = new AbortController());
      showLoader(`Downloading ${entry.title}…`, 0);
      buffer = await download(entry.url, entry.bytes, abort.signal, (p) => {
        if (token === state.loadToken) showLoader(`Downloading ${entry.title}… ${Math.round(p * 100)}%`, p);
      });
    }
    if (token !== state.loadToken) return;
    showLoader(`Preparing ${entry.title}…`, null);
    worker.postMessage(
      { type: 'load', token, buffer, name: entry.file ? entry.file.name : entry.url, preset: entry.preset, maxTextureSize },
      [buffer],
    );
  } catch (err) {
    if (err.name === 'AbortError' || token !== state.loadToken) return;
    failLoad(err.message);
  }
}

function failLoad(message) {
  hideLoader();
  toast(`Couldn't load that scene: ${message}`);
  const failed = state.loading;
  state.loading = null;
  updateSceneUi();
  if (!state.entry && failed !== SCENES[0]) loadScene(SCENES[0]); // nothing on screen yet
}

function pickScene(entry) {
  if (state.entry !== entry || state.loading) loadScene(entry);
}

async function download(url, expected, signal, onProgress) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`download failed (HTTP ${res.status})`);
  const total = Number(res.headers.get('content-length')) || expected || 0;
  if (!res.body) return res.arrayBuffer();
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) onProgress(Math.min(1, received / total));
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out.buffer;
}

// Animated transforms for the scene on screen.
function scenePose(entry, time, aspect) {
  if (entry.procedural) return orreryPose(time, aspect, groups);
  const p = entry.preset;
  const [x, y, z] = p.position;
  const angle = (p.spin || 0) * time;
  groups.set(compose(translation(x, y, z), rotationY(angle), translation(-x, -y, -z)), 0);
  return { shadows: entry.room ? [[x, y, z, p.size * 0.9]] : [], glow: null };
}

function maybeSort() {
  if (state.sortBusy || !state.token) return;
  const rows = new Float32Array(MAX_GROUPS * 4);
  for (let g = 0; g < MAX_GROUPS; g++) {
    rows[g * 4] = groups[g * 16 + 2];
    rows[g * 4 + 1] = groups[g * 16 + 6];
    rows[g * 4 + 2] = groups[g * 16 + 10];
    rows[g * 4 + 3] = groups[g * 16 + 14];
  }
  const prev = state.sortedRows;
  if (prev && rows.every((v, i) => Math.abs(v - prev[i]) < 1e-6)) return;
  state.sortedRows = rows;
  state.sortBusy = true;
  const buffer = state.sortBuffer && state.sortBuffer.length === renderer.count ? state.sortBuffer : null;
  state.sortBuffer = null;
  worker.postMessage({ type: 'sort', token: state.token, rows, buffer }, buffer ? [buffer.buffer] : []);
}

// ------------------------------------------------------------------ the eye

function targetEye(now, aspect) {
  const distance = defaultDistance();
  if (capture) return ['capture', captureEye(aspect, distance), 0.0001];

  if (tracker.state === 'tracking' && tracker.position) {
    state.lastFaceEye = faceToEye(tracker.position, settings);
    return ['face', state.lastFaceEye, 0.05];
  }
  if (tracker.running) {
    if (state.lastFaceEye && now - tracker.lastSeen < 1500) {
      return ['hold', state.lastFaceEye, 0.3]; // a blink or a glance away: stay put
    }
    // Face gone: the mouse takes over once it moves, otherwise settle in the middle.
    return pointer.lastInput > tracker.lastSeen
      ? ['pointer', pointer.eye(aspect, distance), 0.12]
      : ['search', [0, 0, distance], 0.8];
  }
  if (now - pointer.lastInput < 8000 || reducedMotion) {
    return ['pointer', pointer.eye(aspect, distance), 0.12];
  }
  // Nobody is steering: drift gently so the depth still reads.
  const t = now / 1000;
  return [
    'idle',
    [Math.sin(t * 0.31) * aspect * 0.34, Math.sin(t * 0.23 + 1.2) * 0.2, distance * (1 + 0.06 * Math.sin(t * 0.17))],
    0.9,
  ];
}

function captureEye(aspect, distance) {
  const v = (params.get('eye') || '').split(',').map(Number);
  return [v[0] || 0, v[1] || 0, v[2] || distance];
}

function updateEye(now, dt, aspect) {
  const [source, target, tau] = targetEye(now, aspect);
  if (source !== state.source) {
    state.source = source;
    state.blendUntil = now + 700;
    updateStatus();
  }
  const t = now < state.blendUntil ? Math.max(tau, 0.25) : tau;
  const k = capture ? 1 : 1 - Math.exp(-dt / t);
  for (let i = 0; i < 3; i++) state.eye[i] += (target[i] - state.eye[i]) * k;
}

// ------------------------------------------------------------------ loop

let last = performance.now();
let fpsTime = last, fpsFrames = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  adaptQuality(dt);

  const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
  renderer.resize(cssW, cssH, Math.min(devicePixelRatio || 1, 2) * state.quality);
  const aspect = cssW / cssH;
  updateEye(now, dt, aspect);

  const entry = state.entry;
  let pose = { shadows: [], glow: null };
  if (entry) {
    const time = capture ? Number(params.get('t')) || 0 : reducedMotion ? 0 : (now - state.sceneStart) / 1000;
    pose = scenePose(entry, time, aspect);
    maybeSort();
  }
  const room = entry ? entry.room && settings.room : true;
  renderer.render({
    eye: state.eye,
    aspect,
    groups,
    room,
    depth: ROOM_DEPTH,
    accent: ACCENT,
    shadows: room ? pose.shadows : [],
    glow: room ? pose.glow : null,
    glowColor: pose.glowColor,
  });

  if (settings.preview && tracker.running) tracker.drawPreview($('#preview-canvas'));

  if (capture && renderer.drawCount > 0 && !state.sortBusy && ++state.capturedFrames > 2) {
    renderer.gl.finish();
    document.body.dataset.captured = 'true'; // a still frame is ready; stop burning CPU
    return;
  }

  fpsFrames++;
  if (debug && now - fpsTime > 500) {
    debug.textContent = `${Math.round((fpsFrames * 1000) / (now - fpsTime))} fps · ${renderer.drawCount.toLocaleString()} splats · q ${state.quality.toFixed(2)} · eye ${state.eye.map((v) => v.toFixed(2)).join(', ')} · ${state.source}`;
    fpsTime = now;
    fpsFrames = 0;
  }
  requestAnimationFrame(frame);
}

// Drop the render resolution when frames are slow, raise it again when there's headroom.
function adaptQuality(dt) {
  if (capture || document.hidden) return;
  if (dt > 1 / 40) state.slowFrames++;
  else state.slowFrames = Math.max(0, state.slowFrames - 1);
  if (dt < 1 / 55) state.fastFrames++;
  else state.fastFrames = 0;
  if (state.slowFrames > 30 && state.quality > 0.5) {
    state.quality = Math.max(0.5, state.quality * 0.85);
    state.slowFrames = 0;
  } else if (state.fastFrames > 240 && state.quality < 1) {
    state.quality = Math.min(1, state.quality * 1.1);
    state.fastFrames = 0;
  }
}

// ------------------------------------------------------------------ UI

const debug = params.has('debug') ? Object.assign(document.createElement('div'), { className: 'debug' }) : null;
if (debug) {
  document.body.append(debug);
  window.splatWindow = { state, tracker, pointer, settings };
}

function buildScenePicker() {
  const list = $('#scenes');
  SCENES.forEach((entry, i) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.dataset.scene = entry.id;
    b.textContent = entry.title;
    b.title = `${entry.title} — ${entry.caption} (${i + 1})`;
    b.addEventListener('click', () => pickScene(entry));
    list.append(b);
  });
  const open = document.createElement('button');
  open.className = 'chip chip-open';
  open.type = 'button';
  open.textContent = 'Open…';
  open.title = 'Open a .ply or .splat file (O)';
  open.addEventListener('click', () => $('#file-input').click());
  list.append(open);
}

function updateSceneUi() {
  const active = state.loading || state.entry;
  for (const b of document.querySelectorAll('[data-scene]')) {
    const on = active && b.dataset.scene === active.id;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.classList.toggle('busy', !!(state.loading && b.dataset.scene === state.loading.id));
  }
}

function openFile(file) {
  if (!file) return;
  loadScene({ id: 'file', title: file.name, caption: 'Your file', file, room: true, preset: USER_PRESET });
}

const STATUS = {
  face: ['on', 'Face tracking'],
  hold: ['wait', 'Looking for you…'],
  search: ['wait', 'No face found'],
  pointer: ['', 'Mouse'],
  idle: ['', 'Mouse'],
  capture: ['', 'Fixed view'],
};

function updateStatus() {
  let [cls, text] = STATUS[state.source] || STATUS.pointer;
  if (tracker.state === 'starting') [cls, text] = ['wait', 'Starting camera…'];
  else if (tracker.state === 'lost' && state.source === 'pointer') [cls, text] = ['wait', 'No face found · using mouse'];
  else if (tracker.state === 'error') [cls, text] = ['off', 'Camera unavailable · using mouse'];
  else if (cls === '' && matchMedia('(pointer: coarse)').matches) text = 'Touch';
  const el = $('#status');
  el.dataset.state = cls;
  $('#status-text').textContent = text;

  // Keep the status and preview up while the camera can't find anyone.
  document.body.classList.toggle('searching', tracker.state === 'lost' || tracker.state === 'starting');

  const camOn = tracker.state !== 'off' && tracker.state !== 'error';
  $('#btn-camera').setAttribute('aria-pressed', camOn ? 'true' : 'false');
  $('#preview').hidden = !(settings.preview && tracker.running);
}

tracker.onstatechange = () => updateStatus();

async function startCamera() {
  settings.camera = true;
  saveSettings();
  try {
    await tracker.start();
  } catch (err) {
    settings.camera = false;
    saveSettings();
    toast(`${err.message} Using the mouse instead.`);
  }
}

function stopCamera() {
  settings.camera = false;
  saveSettings();
  tracker.stop();
}

function recenter() {
  if (tracker.state === 'tracking' && tracker.position) {
    settings.calibration = recenterCalibration(tracker.position);
    saveSettings();
    toast('Centred on where you are now.');
  } else {
    pointer.reset();
    toast('View reset.');
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

function setRoom(on) {
  settings.room = on;
  $('#opt-room').checked = on;
  saveSettings();
}

function closeIntro() {
  $('#intro').classList.add('gone');
  settings.introSeen = true;
  saveSettings();
}

let toastTimer = 0;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 4200);
}

function showLoader(text, progress) {
  $('#loader').hidden = false;
  $('#loader-text').textContent = text;
  const fill = $('#loader-fill');
  fill.classList.toggle('indeterminate', progress === null);
  if (progress !== null) fill.style.transform = `scaleX(${progress})`;
}

function hideLoader() {
  $('#loader').hidden = true;
}

function fatal(message) {
  document.body.classList.add('fatal');
  $('#fatal-text').textContent = message;
  $('#fatal').hidden = false;
}

function wireUi() {
  buildScenePicker();

  $('#btn-camera').addEventListener('click', () => (tracker.state === 'off' || tracker.state === 'error' ? startCamera() : stopCamera()));
  $('#btn-recenter').addEventListener('click', recenter);
  $('#btn-fullscreen').addEventListener('click', toggleFullscreen);

  const panel = $('#settings');
  const settingsButton = $('#btn-settings');
  const setPanel = (open) => {
    panel.hidden = !open;
    settingsButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  settingsButton.addEventListener('click', () => setPanel(panel.hidden));
  document.addEventListener('pointerdown', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !settingsButton.contains(e.target)) setPanel(false);
  });

  const strength = $('#opt-strength');
  const strengthOut = $('#out-strength');
  strength.value = settings.strength;
  strengthOut.textContent = `${Number(settings.strength).toFixed(2)}×`;
  strength.addEventListener('input', () => {
    settings.strength = Number(strength.value);
    strengthOut.textContent = `${settings.strength.toFixed(2)}×`;
    saveSettings();
  });
  $('#opt-room').checked = settings.room;
  $('#opt-room').addEventListener('change', (e) => setRoom(e.target.checked));
  $('#opt-preview').checked = settings.preview;
  $('#opt-preview').addEventListener('change', (e) => {
    settings.preview = e.target.checked;
    saveSettings();
    updateStatus();
  });

  $('#intro-camera').addEventListener('click', () => {
    closeIntro();
    startCamera();
  });
  $('#intro-mouse').addEventListener('click', closeIntro);

  $('#file-input').addEventListener('change', (e) => {
    openFile(e.target.files[0]);
    e.target.value = '';
  });

  // Drag and drop a capture anywhere on the page.
  let dragDepth = 0;
  const drop = $('#drop');
  window.addEventListener('dragenter', (e) => {
    if (![...(e.dataTransfer?.types || [])].includes('Files')) return;
    e.preventDefault();
    dragDepth++;
    drop.hidden = false;
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('dragleave', () => {
    if (--dragDepth <= 0) {
      dragDepth = 0;
      drop.hidden = true;
    }
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDepth = 0;
    drop.hidden = true;
    openFile(e.dataTransfer?.files?.[0]);
  });

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.matches('input, textarea')) return;
    const key = e.key.toLowerCase();
    if (key === 'c') recenter();
    else if (key === 'f') toggleFullscreen();
    else if (key === 'g') setRoom(!settings.room);
    else if (key === 'h') document.body.classList.toggle('hud-hidden');
    else if (key === 'o') $('#file-input').click();
    else if (key === 'escape') {
      setPanel(false);
      if (!$('#intro').classList.contains('gone')) closeIntro();
    } else if (/^[1-9]$/.test(key) && SCENES[Number(key) - 1]) pickScene(SCENES[Number(key) - 1]);
    else return;
    wake();
  });

  // Let the controls fade away while nobody is using them. In mouse mode the
  // pointer is the viewer's head, so only bring them back near the edges.
  let calmTimer = 0;
  const wake = () => {
    document.body.classList.remove('calm');
    clearTimeout(calmTimer);
    calmTimer = setTimeout(() => {
      if (panel.hidden && $('#loader').hidden) document.body.classList.add('calm');
    }, 3500);
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' || e.clientY < 90 || e.clientY > innerHeight - 130) wake();
    },
    { passive: true },
  );
  window.addEventListener('pointerdown', wake, { passive: true });
  wake();

  if (!document.fullscreenEnabled) $('#btn-fullscreen').hidden = true; // e.g. iPhone Safari
  if (matchMedia('(pointer: coarse)').matches) $('#intro-mouse').textContent = 'Use touch instead';
  document.addEventListener('fullscreenchange', () => {
    $('#btn-fullscreen').setAttribute('aria-pressed', document.fullscreenElement ? 'true' : 'false');
  });
}

// ------------------------------------------------------------------ start

function initialScene() {
  const url = params.get('url');
  if (url) {
    const num = (key, fallback) => {
      const raw = params.get(key);
      const v = raw ? raw.split(',').map(Number) : [];
      return v.length && v.every(Number.isFinite) ? v : fallback;
    };
    return {
      id: 'url',
      title: url.split('/').pop().split('?')[0] || 'Remote scene',
      caption: 'From URL',
      url,
      room: params.get('room') !== '0',
      preset: {
        rotation: num('rot', USER_PRESET.rotation),
        size: num('size', [USER_PRESET.size])[0],
        position: num('pos', USER_PRESET.position),
        crop: num('crop', [USER_PRESET.crop])[0],
        maxScale: num('maxScale', [0])[0],
        spin: num('spin', [0])[0],
      },
    };
  }
  return SCENES.find((s) => s.id === params.get('scene')) || SCENES[0];
}

wireUi();
updateStatus();
loadScene(initialScene());
requestAnimationFrame(frame);

if (!capture && !settings.introSeen) $('#intro').classList.remove('gone');
if (!capture && settings.camera) {
  // Only resume the camera automatically if permission is already granted.
  navigator.permissions
    ?.query({ name: 'camera' })
    .then((p) => p.state === 'granted' && startCamera())
    .catch(() => {});
}
