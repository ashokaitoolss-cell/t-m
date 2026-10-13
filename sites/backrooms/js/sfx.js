// Game sound, all synthesised: the phones' bells, the line (hold music, DTMF,
// clicks, static), the Tenant (creaks, footfalls, breathing, its humming),
// and the score (drone, heartbeat, stingers, the scream).
//
// Sounds in the world go through HRTF panners, so with headphones you can
// find a ringing phone by ear. The line is mono and band-limited like a
// telephone earpiece.

// Für Elise (Beethoven, 1810), the opening bars, in sixteenth notes:
// [melody note (MIDI) or null for a rest, length, left-hand arpeggio].
const FUR_ELISE = [
  [76, 1], [75, 1],
  [76, 1], [75, 1], [76, 1], [71, 1], [74, 1], [72, 1],
  [69, 2, [45, 52, 57]], [null, 1], [60, 1], [64, 1], [69, 1],
  [71, 2, [40, 52, 56]], [null, 1], [64, 1], [68, 1], [71, 1],
  [72, 2, [45, 52, 57]], [null, 1], [64, 1], [76, 1], [75, 1],
  [76, 1], [75, 1], [76, 1], [71, 1], [74, 1], [72, 1],
  [69, 2, [45, 52, 57]], [null, 1], [60, 1], [64, 1], [69, 1],
  [71, 2, [40, 52, 56]], [null, 1], [64, 1], [72, 1], [71, 1],
  [69, 4, [45, 52, 57]],
];

const DTMF = {
  1: [697, 1209], 2: [697, 1336], 3: [697, 1477],
  4: [770, 1209], 5: [770, 1336], 6: [770, 1477],
  7: [852, 1209], 8: [852, 1336], 9: [852, 1477],
  '*': [941, 1209], 0: [941, 1336], '#': [941, 1477],
};

const midiHz = (m) => 440 * 2 ** ((m - 69) / 12);

export class Horror {
  constructor(ambience) {
    this.amb = ambience;
    this.ctx = null;
    this.boxes = new Set();
    this.heart = { level: 0, next: 0 };
  }

  // After the ambience has started (inside a user gesture).
  init() {
    if (this.ctx || !this.amb.ctx) return;
    const ctx = (this.ctx = this.amb.ctx);
    this.noise = this.amb.noiseBuffer(3);
    this.out = this.gain(1, this.amb.master);

    // A big, damp room for everything that happens out there.
    const verb = ctx.createConvolver();
    verb.buffer = impulse(ctx, 2.6, 2.4);
    this.verb = this.gain(1);
    this.verb.connect(verb).connect(this.gain(0.8, this.out));

    // The line: an earpiece, 300–3400 Hz, a little overdriven.
    const hp = this.filter('highpass', 320, 0.7);
    const lp = this.filter('lowpass', 3200, 0.9);
    const grit = ctx.createWaveShaper();
    grit.curve = shaper(2.2);
    this.line = this.gain(1);
    this.line.connect(hp).connect(lp).connect(grit).connect(this.gain(0.9, this.out));
    this.static = this.loopNoise(this.filter('bandpass', 1800, 0.4), 0, this.line);

    // The score: a low drone that rises with the tension, and tinnitus.
    this.droneFilter = this.filter('lowpass', 140, 2.5);
    this.drone = this.gain(0, this.out);
    this.droneFilter.connect(this.drone);
    for (const [f, type, g] of [[55, 'sawtooth', 0.3], [55.4, 'sawtooth', 0.3], [82.6, 'sawtooth', 0.18], [36.7, 'sine', 0.6], [116.5, 'triangle', 0.08]]) {
      this.osc(type, f, this.gain(g, this.droneFilter));
    }
    this.osc('sine', 0.07, this.gain(60, this.droneFilter.frequency)); // slow breathing of the filter
    this.tinnitus = this.gain(0, this.out);
    this.osc('sine', 3520, this.gain(0.5, this.tinnitus));
    this.osc('sine', 3527, this.gain(0.5, this.tinnitus));
  }

  get now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  // ---------------------------------------------------------------- plumbing

  gain(value, to) {
    const g = this.ctx.createGain();
    g.gain.value = value;
    if (to) g.connect(to);
    return g;
  }

  filter(type, freq, q = 1) {
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  osc(type, freq, to, start = this.now) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    if (to) o.connect(to);
    o.start(start);
    return o;
  }

  loopNoise(through, level, to, rate = 1) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.playbackRate.value = rate;
    src.loopStart = Math.random() * 2;
    const g = this.gain(level, to);
    src.connect(through).connect(g);
    src.start(this.now, Math.random() * 2);
    return g;
  }

  // A one-shot noise burst through `chain` (first node), envelope applied by caller.
  burst(t, duration, to, rate = 1) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = rate;
    src.connect(to);
    src.start(t, Math.random() * Math.max(0, 2.9 - duration * rate), duration + 0.05);
    return src;
  }

  env(param, t, peak, attack, decay, hold = 0) {
    param.cancelScheduledValues(t);
    param.setValueAtTime(0.0001, t);
    param.linearRampToValueAtTime(peak, t + attack);
    if (hold) param.setValueAtTime(peak, t + attack + hold);
    param.exponentialRampToValueAtTime(0.0001, t + attack + hold + decay);
  }

  panner(x, y, z, ref = 1.5, rolloff = 1) {
    const p = this.ctx.createPanner();
    p.panningModel = 'HRTF';
    p.distanceModel = 'inverse';
    p.refDistance = ref;
    p.rolloffFactor = rolloff;
    p.maxDistance = 200;
    place(p, x, y, z);
    return p;
  }

  setListener(x, y, z, yaw, pitch) {
    if (!this.ctx) return;
    const L = this.ctx.listener;
    const fx = -Math.sin(yaw) * Math.cos(pitch), fy = Math.sin(pitch), fz = -Math.cos(yaw) * Math.cos(pitch);
    if (L.positionX) {
      L.positionX.value = x;
      L.positionY.value = y;
      L.positionZ.value = z;
      L.forwardX.value = fx;
      L.forwardY.value = fy;
      L.forwardZ.value = fz;
      L.upX.value = 0;
      L.upY.value = 1;
      L.upZ.value = 0;
    } else {
      L.setPosition(x, y, z);
      L.setOrientation(fx, fy, fz, 0, 1, 0);
    }
  }

  // A sound placed in the world: panner → (dry, reverb send).
  spot(x, y, z, ref = 1.5, rolloff = 1, wet = 0.35) {
    const p = this.panner(x, y, z, ref, rolloff);
    p.connect(this.out);
    p.connect(this.gain(wet, this.verb));
    return p;
  }

  // ---------------------------------------------------------------- phones

  // An old electromechanical bell: two gongs hammered ~22 times a second.
  // Cadence (UK style): ring-ring … ring-ring. Positioned and muffled by the
  // caller each frame.
  ringer() {
    const ctx = this.ctx;
    const pan = this.panner(0, 0, 0, 2.2, 1.05);
    const muffle = this.filter('lowpass', 9000, 0.5);
    const gate = this.gain(0);
    const bell = this.gain(0.5);
    const hammer = this.osc('square', 22, this.gain(0.5, bell.gain));
    const partials = [[1180, 0.45], [1645, 0.32], [2390, 0.2], [3310, 0.1], [590, 0.12]];
    const tones = partials.map(([f, g]) => this.osc('triangle', f * (0.99 + Math.random() * 0.02), this.gain(g, bell)));
    bell.connect(muffle).connect(gate).connect(pan);
    pan.connect(this.out);
    pan.connect(this.gain(0.45, this.verb));
    let on = false;
    return {
      set: (x, y, z, open, ringing) => {
        place(pan, x, y, z);
        muffle.frequency.setTargetAtTime(open, ctx.currentTime, 0.1);
        if (ringing !== on) {
          on = ringing;
          gate.gain.setTargetAtTime(ringing ? 0.55 : 0, ctx.currentTime, ringing ? 0.004 : 0.02);
        }
      },
      stop: () => {
        gate.gain.setTargetAtTime(0, ctx.currentTime, 0.01);
        setTimeout(() => {
          [hammer, ...tones].forEach((o) => o.stop());
          pan.disconnect();
        }, 200);
      },
    };
  }

  // Lifting or dropping a handset: a plastic clack and the hook switch.
  clack(heavy = false) {
    if (!this.ctx) return;
    const t = this.now;
    const g = this.gain(0, this.out);
    this.burst(t, 0.08, this.filter('bandpass', heavy ? 900 : 2200, 1.2)).connect(g);
    this.env(g.gain, t, heavy ? 0.5 : 0.35, 0.002, 0.07);
    const thump = this.gain(0, this.out);
    const o = this.osc('sine', heavy ? 120 : 180, thump, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    this.env(thump.gain, t, heavy ? 0.4 : 0.15, 0.002, 0.12);
    o.stop(t + 0.2);
  }

  lineOpen(on) {
    if (!this.ctx) return;
    this.static.gain.setTargetAtTime(on ? 0.025 : 0, this.now, 0.05);
  }

  // The line goes dead: a click and a fall-off of the static.
  lineCut() {
    if (!this.ctx) return;
    this.clack(false);
    this.static.gain.setTargetAtTime(0, this.now, 0.01);
  }

  dtmf(key, duration = 0.22, through = this.line) {
    if (!this.ctx || !DTMF[key]) return;
    const t = this.now;
    const g = this.gain(0, through);
    for (const f of DTMF[key]) this.osc('sine', f, g, t).stop(t + duration + 0.05);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.005);
    g.gain.setValueAtTime(0.07, t + duration);
    g.gain.linearRampToValueAtTime(0, t + duration + 0.01);
  }

  // Dial tone (350 + 440 Hz) on the line until stopped.
  dialTone() {
    const g = this.gain(0, this.line);
    const o = [this.osc('sine', 350, g), this.osc('sine', 440, g)];
    g.gain.setTargetAtTime(0.05, this.now, 0.01);
    return () => {
      g.gain.setTargetAtTime(0, this.now, 0.01);
      o.forEach((x) => x.stop(this.now + 0.1));
    };
  }

  // Busy signal: 480 + 620 Hz, half a second on, half off.
  busy(cycles = 4) {
    if (!this.ctx) return;
    const t = this.now + 0.05;
    const g = this.gain(0, this.line);
    const o = [this.osc('sine', 480, g, t), this.osc('sine', 620, g, t)];
    for (let k = 0; k < cycles; k++) {
      g.gain.setValueAtTime(0.05, t + k);
      g.gain.setValueAtTime(0, t + k + 0.5);
    }
    o.forEach((x) => x.stop(t + cycles));
  }

  // Hold music. `where`: 'line' (in your ear) or [x, y, z] in the world.
  music(options = {}) {
    if (!this.ctx) return null;
    const box = new MusicBox(this, options);
    this.boxes.add(box);
    return box;
  }

  // Formant babble, for a voice when speech synthesis isn't available.
  babble(seconds, low = false) {
    if (!this.ctx) return;
    const t = this.now;
    const src = this.osc('sawtooth', low ? 90 : 165, null, t);
    const f1 = this.filter('bandpass', 600, 6), f2 = this.filter('bandpass', 1200, 8);
    const g = this.gain(0, this.line);
    src.connect(f1).connect(g);
    src.connect(f2).connect(g);
    const vowels = [[300, 2300], [400, 2000], [600, 1700], [750, 1200], [500, 900], [350, 800]];
    for (let s = 0; s < seconds; s += 0.11 + Math.random() * 0.08) {
      const [a, b] = vowels[(Math.random() * vowels.length) | 0];
      f1.frequency.setTargetAtTime(a, t + s, 0.02);
      f2.frequency.setTargetAtTime(b, t + s, 0.02);
      src.frequency.setTargetAtTime((low ? 90 : 165) * (0.85 + Math.random() * 0.3), t + s, 0.05);
      g.gain.setTargetAtTime(Math.random() < 0.18 ? 0 : 0.25, t + s, 0.02);
    }
    g.gain.setTargetAtTime(0, t + seconds, 0.05);
    src.stop(t + seconds + 0.3);
  }

  // ---------------------------------------------------------------- power

  powerDown() {
    if (!this.ctx) return;
    const t = this.now;
    // The relay: a heavy clunk.
    const thump = this.gain(0, this.out);
    const o = this.osc('sine', 90, thump, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 0.3);
    this.env(thump.gain, t, 0.55, 0.003, 0.35);
    o.stop(t + 0.5);
    const crack = this.gain(0, this.out);
    this.burst(t, 0.2, this.filter('lowpass', 1400, 0.7)).connect(crack);
    crack.connect(this.verb);
    this.env(crack.gain, t, 0.35, 0.002, 0.18);
    // Ballasts winding down.
    const whine = this.gain(0, this.out);
    const w = this.osc('sine', 760, whine, t);
    w.frequency.exponentialRampToValueAtTime(45, t + 1.6);
    this.env(whine.gain, t, 0.05, 0.01, 1.6);
    w.stop(t + 1.8);
    this.tinnitus.gain.setTargetAtTime(0.012, t + 0.3, 0.6);
    this.tinnitus.gain.setTargetAtTime(0, t + 3, 1.5);
  }

  // A tube starting: a tiny ping and a tick.
  tink(level = 1) {
    if (!this.ctx) return;
    const t = this.now;
    const g = this.gain(0, this.out);
    g.connect(this.verb);
    const o = this.osc('sine', 3800 + Math.random() * 1600, g, t);
    this.env(g.gain, t, 0.05 * level, 0.001, 0.09);
    o.stop(t + 0.15);
    const c = this.gain(0, this.out);
    this.burst(t, 0.02, this.filter('highpass', 3000, 0.7)).connect(c);
    this.env(c.gain, t, 0.12 * level, 0.001, 0.02);
  }

  // ---------------------------------------------------------------- the Tenant

  // It moved: joints creaking and a wet footfall on the carpet.
  creak(x, y, z, level = 1) {
    if (!this.ctx) return;
    const t = this.now + Math.random() * 0.05;
    const p = this.spot(x, y, z, 1.4, 1.2, 0.5);
    const g = this.gain(0, p);
    const o = this.osc('sawtooth', 70 + Math.random() * 50, null, t);
    const bp = this.filter('bandpass', 500, 14);
    bp.frequency.setValueAtTime(380 + Math.random() * 200, t);
    bp.frequency.exponentialRampToValueAtTime(1300 + Math.random() * 900, t + 0.35);
    o.frequency.setValueAtTime(o.frequency.value, t);
    o.frequency.linearRampToValueAtTime(o.frequency.value * 0.7, t + 0.35);
    o.connect(bp).connect(g);
    this.env(g.gain, t, 0.5 * level, 0.03, 0.35);
    o.stop(t + 0.5);
    const step = this.gain(0, p);
    this.burst(t + 0.12, 0.2, this.filter('lowpass', 260, 0.8)).connect(step);
    this.env(step.gain, t + 0.12, 0.9 * level, 0.005, 0.18);
  }

  breathe(x, y, z, level = 1) {
    if (!this.ctx) return;
    const t = this.now;
    const p = this.spot(x, y, z, 1.0, 1.4, 0.3);
    const g = this.gain(0, p);
    this.burst(t, 1.8, this.filter('bandpass', 650, 1.4), 0.6).connect(g);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35 * level, t + 0.7);
    g.gain.exponentialRampToValueAtTime(0.06 * level, t + 0.95);
    g.gain.exponentialRampToValueAtTime(0.25 * level, t + 1.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  }

  // ---------------------------------------------------------------- the score

  setTension(level) {
    if (!this.ctx) return;
    this.drone.gain.setTargetAtTime(0.09 * level, this.now, 1.2);
    this.droneFilter.frequency.setTargetAtTime(110 + 420 * level, this.now, 1.5);
  }

  setHeart(level) {
    this.heart.level = level;
  }

  // A shriek of strings over a low hit: you just saw it.
  stinger(level = 1) {
    if (!this.ctx || level <= 0.02) return;
    const t = this.now;
    const strings = this.gain(0, this.out);
    strings.connect(this.verb);
    const hp = this.filter('highpass', 650, 0.7);
    hp.connect(strings);
    const base = 1046 + Math.random() * 200;
    for (let k = 0; k < 7; k++) {
      const o = this.osc('sawtooth', base * 2 ** ((k * 1.3 + Math.random()) / 12), hp, t);
      const vib = this.osc('sine', 5.5 + Math.random() * 3, this.gain(18, o.frequency), t);
      o.frequency.setValueAtTime(o.frequency.value * 0.96, t);
      o.frequency.linearRampToValueAtTime(o.frequency.value * 1.03, t + 0.6);
      o.stop(t + 2.2);
      vib.stop(t + 2.2);
    }
    this.env(strings.gain, t, 0.05 * level, 0.02, 1.8, 0.15);
    const hit = this.gain(0, this.out);
    const o = this.osc('sine', 70, hit, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.9);
    this.env(hit.gain, t, 0.55 * level, 0.004, 0.9);
    o.stop(t + 1.1);
    const n = this.gain(0, this.out);
    this.burst(t, 0.4, this.filter('lowpass', 900, 0.7)).connect(n);
    this.env(n.gain, t, 0.25 * level, 0.003, 0.35);
  }

  // The jumpscare.
  scream(level = 1, seconds = 1.3) {
    if (!this.ctx) return;
    const t = this.now;
    const out = this.gain(0, this.out);
    out.connect(this.verb);
    const shape = this.ctx.createWaveShaper();
    shape.curve = shaper(6);
    const band = this.filter('bandpass', 1400, 0.6);
    band.frequency.setValueAtTime(900, t);
    band.frequency.exponentialRampToValueAtTime(2600, t + 0.25);
    band.frequency.exponentialRampToValueAtTime(1100, t + seconds);
    shape.connect(band).connect(out);
    for (let k = 0; k < 6; k++) {
      const f = 380 + k * 97 + Math.random() * 60;
      const o = this.osc('sawtooth', f, this.gain(0.25, shape), t);
      o.frequency.setValueAtTime(f * 0.8, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.18);
      o.frequency.exponentialRampToValueAtTime(f * 1.1, t + seconds);
      this.osc('square', 9 + Math.random() * 9, this.gain(f * 0.08, o.frequency), t).stop(t + seconds + 0.3);
      o.stop(t + seconds + 0.3);
    }
    this.burst(t, seconds, this.filter('bandpass', 2600, 0.9)).connect(this.gain(0.8, out));
    this.env(out.gain, t, 0.5 * level, 0.01, 0.25, seconds - 0.2);
    const boom = this.gain(0, this.out);
    const o = this.osc('sine', 60, boom, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 1.4);
    this.env(boom.gain, t, 0.6 * level, 0.004, 1.4);
    o.stop(t + 1.6);
    this.tinnitus.gain.setTargetAtTime(0.02 * level, t + seconds, 0.2);
    this.tinnitus.gain.setTargetAtTime(0, t + seconds + 2, 1.2);
  }

  // Call every frame.
  update() {
    if (!this.ctx) return;
    const now = this.now;
    for (const box of this.boxes) {
      if (box.done) this.boxes.delete(box);
      else box.update(now);
    }
    // Heartbeat, faster as it gets closer.
    const h = this.heart;
    if (h.level > 0.03) {
      if (h.next < now) h.next = now + 0.05;
      if (h.next < now + 0.12) {
        const bpm = 62 + 78 * h.level;
        this.beat(h.next, h.level);
        this.beat(h.next + 0.17, h.level * 0.6);
        h.next += 60 / bpm;
      }
    }
  }

  beat(t, level) {
    const g = this.gain(0, this.out);
    const lp = this.filter('lowpass', 140, 0.7);
    lp.connect(g);
    const o = this.osc('sine', 58, lp, t);
    o.frequency.setValueAtTime(62, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.16);
    this.env(g.gain, t, 0.55 * level, 0.008, 0.17);
    o.stop(t + 0.3);
  }

  // Silence everything the game started (not the ambience).
  hush() {
    for (const box of this.boxes) box.stop(0.05);
    this.heart.level = 0;
    if (this.ctx) {
      this.drone.gain.setTargetAtTime(0, this.now, 0.1);
      this.static.gain.setTargetAtTime(0, this.now, 0.05);
    }
  }
}

// ------------------------------------------------------------------ music

// Plays FUR_ELISE in a loop, scheduled a little ahead each frame.
//   voice  'chip'  cheap on-hold synth (square + sub), or
//          'hum'   a throat humming the tune, out of tune, slow
//   warp   0..1: tape wow, flutter, dropouts and sagging pitch
//   where  'line' or [x, y, z]
class MusicBox {
  constructor(h, { voice = 'chip', tempo = 0.17, transpose = 0, warp = 0, level = 0.3, where = 'line' } = {}) {
    this.h = h;
    this.voice = voice;
    this.tempo = tempo;
    this.transpose = transpose;
    this.warp = warp;
    this.done = false;
    this.oscs = [];
    const ctx = h.ctx;
    if (where === 'line') {
      this.out = h.gain(level, h.line);
    } else {
      this.pan = h.spot(where[0], where[1], where[2], 1.2, 1.3, 0.4);
      this.out = h.gain(level, this.pan);
    }
    // Tape: slow wow and fast flutter on every note's pitch.
    this.wobble = h.gain(1);
    const wow = h.osc('sine', 0.55, h.gain(10 + warp * 55, this.wobble));
    const flutter = h.osc('sine', 6.3, h.gain(3 + warp * 8, this.wobble));
    this.oscs.push(wow, flutter);
    if (voice === 'hum') {
      this.hum = h.osc('sawtooth', 110);
      this.wobble.connect(this.hum.detune);
      this.humEnv = h.gain(0);
      const f1 = h.filter('bandpass', 320, 5), f2 = h.filter('bandpass', 820, 7);
      this.hum.connect(f1).connect(this.humEnv);
      this.hum.connect(f2).connect(h.gain(0.5, this.humEnv));
      this.humEnv.connect(this.out);
      this.oscs.push(this.hum);
    }
    this.index = 0;
    this.next = ctx.currentTime + 0.08;
  }

  update(now) {
    if (this.next < now - 0.1) this.next = now + 0.05; // after a pause, pick up where we are
    while (!this.done && this.next < now + 0.3) {
      const [note, len, bass] = FUR_ELISE[this.index % FUR_ELISE.length];
      const step = this.tempo * (1 + (Math.random() - 0.5) * 0.08 * this.warp);
      const dur = len * step;
      const sag = -this.warp * 70 - (this.index % 37 === 0 ? this.warp * 150 : 0); // cents
      const dropout = Math.random() < this.warp * 0.12;
      if (this.voice === 'hum') {
        if (note === null || dropout) this.humEnv.gain.setTargetAtTime(0.04, this.next, 0.06);
        else {
          this.hum.frequency.setTargetAtTime(midiHz(note - 12 + this.transpose), this.next, 0.05);
          this.hum.detune.setValueAtTime(sag - 35, this.next);
          this.humEnv.gain.setTargetAtTime(0.5, this.next, 0.05);
        }
      } else {
        if (note !== null && !dropout) this.note(note + this.transpose, this.next, dur, 0.22, sag);
        if (bass && !dropout) bass.forEach((b, k) => this.note(b + this.transpose, this.next + k * step, step * 2.5, 0.12, sag));
      }
      this.next += dur;
      this.index++;
    }
  }

  note(midi, t, dur, level, cents) {
    const h = this.h;
    const g = h.gain(0, this.out);
    const a = h.osc('square', midiHz(midi), h.gain(0.5, g), t);
    const b = h.osc('triangle', midiHz(midi) / 2, g, t);
    for (const o of [a, b]) {
      o.detune.value = cents;
      this.wobble.connect(o.detune);
      o.stop(t + dur * 1.8 + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(level, t + 0.006);
    g.gain.exponentialRampToValueAtTime(level * 0.35, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.8);
    setTimeout(() => {
      try {
        this.wobble.disconnect(a.detune);
        this.wobble.disconnect(b.detune);
      } catch {
        // already gone
      }
    }, (t - h.now + dur * 1.8 + 0.2) * 1000);
  }

  setLevel(level, seconds = 0.15) {
    this.out.gain.setTargetAtTime(level, this.h.now, seconds / 3);
  }

  moveTo(x, y, z) {
    if (this.pan) place(this.pan, x, y, z);
  }

  stop(fade = 0.1) {
    if (this.done) return;
    this.done = true;
    const t = this.h.now;
    this.out.gain.setTargetAtTime(0, t, fade / 3);
    setTimeout(() => {
      this.oscs.forEach((o) => o.stop());
      this.out.disconnect();
      this.pan?.disconnect();
    }, fade * 1000 + 300);
  }
}

// ------------------------------------------------------------------ helpers

function place(p, x, y, z) {
  if (p.positionX) {
    p.positionX.value = x;
    p.positionY.value = y;
    p.positionZ.value = z;
  } else {
    p.setPosition(x, y, z);
  }
}

function impulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay * 0.6;
  }
  return buf;
}

function shaper(amount) {
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount) / Math.tanh(amount);
  }
  return curve;
}
