// Sound, all synthesised: the fluorescent hum-buzz (louder under a panel,
// crackling near a flickering one), the dead air of the rooms, and soft
// footsteps on wet carpet.

export class Ambience {
  constructor() {
    this.ctx = null;
    this.volume = 0.8;
    this.muted = false;
  }

  // Must be called from a user gesture (browsers keep audio off until then).
  start() {
    if (this.ctx) return this.ctx.resume();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(ctx.destination);

    // Mains hum: 60 Hz and its harmonics, slightly detuned so it beats.
    this.hum = ctx.createGain();
    this.hum.gain.value = 0.05;
    this.hum.connect(this.master);
    const tone = (freq, type, gain, detune = 0) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g).connect(this.hum);
      o.start();
    };
    tone(60, 'sine', 0.55);
    tone(120, 'sine', 0.5, 3);
    tone(180, 'triangle', 0.16, -4);
    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.value = 120;
    const sawFilter = ctx.createBiquadFilter();
    sawFilter.type = 'lowpass';
    sawFilter.frequency.value = 900;
    const sawGain = ctx.createGain();
    sawGain.gain.value = 0.12;
    saw.connect(sawFilter).connect(sawGain).connect(this.hum);
    saw.start();

    // The buzz: band-passed noise chopped at 120 Hz like a ballast.
    const noise = this.noiseBuffer(2);
    const buzzSrc = ctx.createBufferSource();
    buzzSrc.buffer = noise;
    buzzSrc.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 3800;
    band.Q.value = 3;
    this.buzz = ctx.createGain();
    this.buzz.gain.value = 0;
    const chop = ctx.createOscillator();
    chop.frequency.value = 120;
    const chopDepth = ctx.createGain();
    chopDepth.gain.value = 0.5;
    const buzzLevel = ctx.createGain();
    buzzLevel.gain.value = 0.5;
    chop.connect(chopDepth).connect(buzzLevel.gain);
    buzzSrc.connect(band).connect(buzzLevel).connect(this.buzz).connect(this.master);
    buzzSrc.start();
    chop.start();

    // Room tone: low rumble of air handling somewhere far away.
    const roomSrc = ctx.createBufferSource();
    roomSrc.buffer = noise;
    roomSrc.loop = true;
    roomSrc.playbackRate.value = 0.5;
    const roomFilter = ctx.createBiquadFilter();
    roomFilter.type = 'lowpass';
    roomFilter.frequency.value = 160;
    const room = ctx.createGain();
    room.gain.value = 0.22;
    roomSrc.connect(roomFilter).connect(room).connect(this.master);
    roomSrc.start();

    this.crackleGain = ctx.createGain();
    this.crackleGain.gain.value = 0;
    const crackSrc = ctx.createBufferSource();
    crackSrc.buffer = noise;
    crackSrc.loop = true;
    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 2500;
    crackSrc.connect(crackFilter).connect(this.crackleGain).connect(this.master);
    crackSrc.start();
  }

  noiseBuffer(seconds) {
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // nearLight: 0..1 how close the nearest lit panel is; flicker: 0..1 a
  // flickering panel nearby is currently off/on-ing.
  update(nearLight, flicker) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.buzz.gain.setTargetAtTime(0.012 + 0.05 * nearLight, t, 0.3);
    this.hum.gain.setTargetAtTime(0.035 + 0.035 * nearLight, t, 0.3);
    this.crackleGain.gain.setTargetAtTime(flicker * 0.05, t, 0.02);
  }

  step(intensity) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.stepNoise ||= this.noiseBuffer(0.25);
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420 + Math.random() * 200;
    const g = ctx.createGain();
    const peak = 0.12 + 0.12 * intensity;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16 + 0.05 * intensity);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 0.3);
  }

  setVolume(v) {
    this.volume = v;
    this.apply();
  }

  setMuted(m) {
    this.muted = m;
    this.apply();
  }

  apply() {
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
  }

  suspend() {
    this.ctx?.suspend();
  }

  resume() {
    this.ctx?.resume();
  }
}
