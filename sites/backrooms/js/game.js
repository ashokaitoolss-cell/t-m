// PLEASE HOLD
//
// Five phones ring, one at a time. Each call gives you one digit of an
// extension; dial it on the red phone to be transferred out. Every time you
// hang up, the power cuts out, and when it comes back more of the lights
// are dead for good.
//
// After the first call the Tenant is on your floor. It only moves while your
// eyes are closed (or the lights are out): each blink, it is closer. If it
// reaches you, you are put back on hold at the last phone you answered,
// with the digits you already have.

import * as THREE from 'three';
import { CELL, cellKey, routeLength } from './world.js';
import { Tenant } from './tenant.js';
import { Phone } from './phones.js';

const CALLS = 5;
const CATCH = 0.95; // metres along the route
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth'];
// Light after each call: the fraction of panels dead for good, and flickering.
const DEAD = [0.07, 0.17, 0.27, 0.36, 0.45, 0.53];
const FLICKER = [0.035, 0.06, 0.085, 0.11, 0.14, 0.17];
const SCRIPT = [
  ['Thank you for holding. Your call is important to us.', 'Please hold.'],
  ['Thank you for continuing to hold. A tenant has been assigned to your floor.', 'Please keep your eyes open.'],
  ['We are experiencing a high volume of blinking.', 'He is closer than he appears.'],
  ['Please remain on the line. He cannot move while you are watching him.', 'You blinked.'],
  ['This is your final digit.', 'Find the red phone. Dial your extension. Do not let him answer it.'],
];
// The Operator's voice wears down with every call.
const VOICE = [
  { rate: 0.97, pitch: 0.95 },
  { rate: 0.94, pitch: 0.88 },
  { rate: 0.9, pitch: 0.78 },
  { rate: 0.85, pitch: 0.66 },
  { rate: 0.8, pitch: 0.55 },
];

export class Game {
  // deps: world, scene, materials, player, eyes, tracker, sfx, operator, hud, settings, seed
  constructor(deps) {
    Object.assign(this, deps);
    this.rng = mulberry32((this.seed ^ 0x9e3779b9) >>> 0);
    this.code = Array.from({ length: CALLS }, () => Math.floor(this.rng() * 10));
    this.tenant = new Tenant(this.world, this.materials, this.scene);
    this.phones = [];
    this.current = null; // the phone you should answer next
    this.ringer = null;
    this.found = 0;
    this.phase = 'intro';
    this.t = 0;
    this.timers = [];
    this.flow = {};
    this.power = 1;
    this.powerSeq = [[0, 1]];
    this.lights = 0;
    this.scare = 0;
    this.flash = 0;
    this.whiteout = 0;
    this.lockMove = false;
    this.entry = '';
    this.field = null;
    this.fieldCell = null;
    this.gap = Infinity; // metres along the route between it and you
    this.hidden = false;
    this.moved = false;
    this.unseenMove = false;
    this.lastStinger = -10;
    this.creakAt = 0;
    this.hfov = 1.6;
    this.graceUntil = 0;
    this.deaths = 0;
    this.checkpoint = { x: this.player.x, z: this.player.z };
    this.captionUntil = 0;
    this.captionText = '';
    this.ringCaption = '';
    this.ringCheck = 0;
    this.eyes.onclose = () => this.onEyesClose();
    this.setLights(0);
  }

  start() {
    this.phase = 'intro';
    this.hud.show(true);
    this.hud.digits(this.code, 0, this.settings.hideDigits);
    this.hud.objective('');
    this.after(3).then(() => this.nextPhone());
  }

  // ------------------------------------------------------------ the clock

  after(seconds) {
    return new Promise((resolve) => this.timers.push({ at: this.t + seconds, resolve }));
  }

  runTimers() {
    if (!this.timers.length) return;
    const due = this.timers.filter((x) => x.at <= this.t);
    if (!due.length) return;
    this.timers = this.timers.filter((x) => x.at > this.t);
    due.forEach((x) => x.resolve());
  }

  // ------------------------------------------------------------ every frame

  // control: { holding, blink, answer, hfov }
  update(dt, control) {
    this.t += dt;
    this.hfov = control.hfov;
    this.runTimers();
    const over = this.phase === 'caught' || this.phase === 'won';
    if (!over) this.eyes.update(dt, { holding: control.holding, blink: control.blink, tracker: this.tracker });
    this.updatePower();
    this.updateField();
    this.updatePhones(control);
    this.updateTenant(dt);
    this.updateScare(dt);
    this.updateScore();
    this.updateHud(control);
  }

  // ------------------------------------------------------------ lights

  setLights(level) {
    this.lights = level;
    const s = this.materials.shared;
    s.uDead.value = DEAD[level];
    s.uFlicker.value = this.settings.reduceFlashing ? 0 : FLICKER[level];
  }

  // The power cuts out for `seconds`, then stutters back on. `onDark` runs
  // just before it comes back. Resolves once the lights are steady.
  blackout(seconds, onDark) {
    this.sfx.powerDown();
    const t = this.t + seconds;
    this.powerSeq = this.settings.reduceFlashing
      ? [[this.t, 0], [t, 0.25], [t + 0.4, 0.5], [t + 0.8, 0.75], [t + 1.2, 1]]
      : [[this.t, 0], [t, 1], [t + 0.07, 0], [t + 0.38, 1], [t + 0.46, 0], [t + 0.95, 0.7], [t + 1.03, 0], [t + 1.3, 1]];
    if (onDark) this.after(seconds - 0.15).then(onDark);
    return this.after(seconds + 1.35);
  }

  updatePower() {
    let p = 1;
    for (const [at, level] of this.powerSeq) if (at <= this.t) p = level;
    if (p > this.power + 0.2 && this.power < 0.5) this.sfx.tink(p);
    this.power = p;
    if (this.phase === 'won') return;
    const s = this.materials.shared;
    s.uPower.value = p;
    s.uAmbient.value = 0.62 * (0.1 + 0.9 * p);
  }

  get dark() {
    return this.power < 0.3;
  }

  // ------------------------------------------------------------ routes

  // Steps from the player's cell to everywhere nearby, refreshed when the
  // player crosses into another cell.
  updateField() {
    const i = Math.floor(this.player.x / CELL), j = Math.floor(this.player.z / CELL);
    const key = cellKey(i, j);
    if (key === this.fieldCell) return;
    this.fieldCell = key;
    this.field = this.world.distanceField(i, j, 40, 7000);
  }

  // Cells [i, j] at minD..maxD steps from the player, shuffled.
  cellsAround(minD, maxD) {
    const out = [];
    for (const [key, d] of this.field) {
      if (d >= minD && d <= maxD) out.push([Math.floor(key / 100000) - 50000, (key % 100000) - 50000]);
    }
    for (let k = out.length - 1; k > 0; k--) {
      const r = Math.floor(this.rng() * (k + 1));
      [out[k], out[r]] = [out[r], out[k]];
    }
    return out;
  }

  visibleFromPlayer(x, z) {
    const c = this.player.camera;
    const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz);
    if (d > 30 || d < 0.01) return d < 0.01;
    const fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw);
    if ((dx * fx + dz * fz) / d < Math.cos(this.hfov / 2 + 0.12)) return false;
    return this.world.lineOfSight(c.x, c.z, x, z, 1.6);
  }

  // ------------------------------------------------------------ phones

  ringOn() {
    const p = this.t % 3;
    return p < 0.4 || (p > 0.6 && p < 1.0);
  }

  // Put the next phone somewhere a few rooms away and start it ringing.
  nextPhone() {
    if (this.phase === 'caught' || this.phase === 'won') return;
    const red = this.found >= CALLS;
    const k = this.found;
    const [minD, maxD] = red ? [9, 14] : k === 0 ? [2, 4] : [5 + k, 8 + k];
    let spot = null;
    for (const [i, j] of this.cellsAround(minD, maxD)) {
      if (this.phones.some((p) => Math.floor(p.x / CELL) === i && Math.floor(p.z / CELL) === j)) continue;
      const x = (i + 0.5) * CELL + (this.rng() - 0.5) * 1.2;
      const z = (j + 0.5) * CELL + (this.rng() - 0.5) * 1.2;
      if (this.tenant.active && Math.hypot(x - this.tenant.x, z - this.tenant.z) < 7) continue;
      if (this.world.pointBlocked(x, z, 0.5, 0.5)) continue;
      spot = [x, z];
      break;
    }
    if (!spot) spot = [this.player.x + CELL, this.player.z]; // shouldn't happen
    const phone = new Phone(this.world, this.materials, this.scene, {
      x: spot[0],
      z: spot[1],
      yaw: Math.floor(this.rng() * 4) * (Math.PI / 2),
      red,
    });
    phone.index = k;
    this.phones.push(phone);
    this.current = phone;
    this.ringPhone(phone);
  }

  ringPhone(phone) {
    phone.ring(true);
    this.phase = phone.red ? 'final' : 'ringing';
    this.ringer?.stop();
    this.ringer = this.sfx.ringer && this.sfx.ctx ? this.sfx.ringer() : null;
    this.phoneField = this.world.distanceField(Math.floor(phone.x / CELL), Math.floor(phone.z / CELL), 40, 7000);
    this.hud.objective(phone.red ? 'Find the red phone. Dial the extension.' : 'A phone is ringing.');
  }

  updatePhones(control) {
    const on = this.ringOn();
    for (const p of this.phones) p.update(this.t, on);
    const phone = this.current;
    let prompt = '';
    if (phone && phone.state === 'ringing') {
      // The bell, muffled when it's round corners.
      if (this.ringer) {
        const straight = phone.distanceTo(this.player.x, this.player.z);
        const steps = this.phoneField.get(this.fieldCell);
        const around = steps === undefined ? 30 : Math.max(0, steps * CELL - straight);
        const open = this.world.lineOfSight(this.player.x, this.player.z, phone.x, phone.z, 1.0) ? 9000 : Math.max(450, 5000 / (1 + around * 0.25));
        this.ringer.set(phone.x, phone.soundY, phone.z, open, on && this.phase !== 'caught');
      }
      if (this.t > this.ringCheck) {
        this.ringCheck = this.t + 0.3;
        this.ringCaption = this.directionTo(phone);
      }
      if (phone.distanceTo(this.player.x, this.player.z) < 1.5 && !this.lockMove && this.phase !== 'caught') {
        prompt = phone.red ? 'E · pick up and dial' : 'E · answer';
        if (control.answer) this.answer(phone);
      }
    } else {
      this.ringCaption = '';
    }
    this.promptText = prompt;
  }

  // Which way to go for a phone: the first step of the walk there, relative
  // to where you're looking.
  directionTo(phone) {
    const route = this.world.route(this.phoneField, this.player.x, this.player.z, phone.x, phone.z);
    const label = phone.red ? 'red phone ringing' : 'phone ringing';
    if (!route) return `${label}, far away`;
    const [nx, nz] = route.length > 2 && Math.hypot(route[1][0] - this.player.x, route[1][1] - this.player.z) < 0.6 ? route[2] : route[1];
    const yaw = this.player.yaw;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const dx = nx - this.player.x, dz = nz - this.player.z;
    const a = Math.atan2(dx * rx + dz * rz, dx * fx + dz * fz); // + to the right
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    const arrow = arrows[(Math.round(a / (Math.PI / 4)) + 8) % 8];
    const len = routeLength(route);
    return `${arrow} ${label}${len > 25 ? ', far' : len < 5 ? ', close' : ''}`;
  }

  answer(phone = this.current) {
    if (!phone || phone.state !== 'ringing' || this.lockMove) return;
    if (phone.red) this.pickUpRed(phone);
    else this.takeCall(phone);
  }

  async takeCall(phone) {
    const flow = (this.flow = {});
    const k = phone.index;
    const live = () => flow === this.flow;
    phone.answer();
    this.ringer?.stop();
    this.ringer = null;
    this.phase = 'call';
    this.lockMove = true;
    this.sfx.clack();
    this.sfx.lineOpen(true);
    this.hud.objective('On hold.');
    this.hud.subtitle('', '♪ hold music ♪');
    this.callMusic = this.sfx.music({ warp: k * 0.2, level: 0.3 });
    await this.after(3.4);
    if (!live()) return;
    this.callMusic?.setLevel(0.05);
    const voice = VOICE[k];
    const [open, close] = SCRIPT[k];
    await this.say(open, voice);
    if (!live()) return;
    await this.say(`The ${ORDINAL[k]} digit of your extension is:`, voice);
    if (!live()) return;
    const digit = this.code[k];
    this.sfx.dtmf(digit, 0.32);
    this.found = Math.max(this.found, k + 1);
    this.hud.digits(this.code, this.found, this.settings.hideDigits);
    this.hud.flashDigit();
    await this.say(`${WORDS[digit]}.`, voice, digit);
    if (!live()) return;
    await this.after(0.5);
    if (!live()) return;
    await this.say(close, voice);
    if (!live()) return;
    this.hud.subtitle('', '♪ hold music ♪');
    this.callMusic?.setLevel(0.3);
    await this.after(1.8);
    if (!live()) return;
    this.endCall(phone);
    this.checkpoint = { x: this.player.x, z: this.player.z };
    this.phase = 'blackout';
    this.lockMove = false;
    await this.blackout(2.3 + k * 0.35, () => {
      this.setLights(this.found);
      if (k === 0) this.revealTenant();
    });
    if (!live()) return;
    if (k === 1) this.startHumming();
    this.nextPhone();
  }

  endCall(phone) {
    this.callMusic?.stop(0.04);
    this.callMusic = null;
    this.sfx.lineCut();
    this.hud.subtitle('', '');
    phone.leaveOffHook();
  }

  say(text, voice, digit) {
    this.hud.subtitle('Operator', text, digit);
    return this.operator.say(text, voice, (s) => this.after(s));
  }

  // The red phone: a dial tone, then you key in the extension.
  async pickUpRed(phone) {
    phone.answer();
    this.ringer?.stop();
    this.ringer = null;
    this.phase = 'dial';
    this.lockMove = true;
    this.sfx.clack();
    this.sfx.lineOpen(true);
    this.stopDialTone = this.sfx.ctx ? this.sfx.dialTone() : null;
    this.entry = '';
    this.hud.objective('Dial the extension.');
    this.hud.subtitle('', '');
    this.hud.dial(true, '');
  }

  dialKey(key) {
    if (this.phase !== 'dial') return;
    if (key === 'back') {
      this.entry = this.entry.slice(0, -1);
    } else if (/^[0-9]$/.test(key) && this.entry.length < CALLS) {
      this.stopDialTone?.();
      this.stopDialTone = null;
      this.entry += key;
      this.sfx.dtmf(key, 0.16);
      if (this.entry.length === CALLS) {
        const entry = this.entry;
        this.after(0.7).then(() => this.phase === 'dial' && this.entry === entry && this.submitDial());
      }
    }
    this.hud.dial(true, this.entry);
  }

  hangUp() {
    if (this.phase !== 'dial') return;
    this.stopDialTone?.();
    this.stopDialTone = null;
    this.hud.dial(false);
    this.sfx.lineCut();
    this.lockMove = false;
    this.current.state = 'idle';
    this.current.handset.visible = true;
    this.ringPhone(this.current);
  }

  async submitDial() {
    const flow = (this.flow = {});
    const live = () => flow === this.flow;
    const phone = this.current;
    const right = this.entry === this.code.join('');
    this.hud.dial(false);
    this.phase = 'connecting';
    this.lockMove = true;
    await this.after(0.9);
    if (!live()) return;
    if (right) {
      this.transfer();
      return;
    }
    await this.say('The extension you have dialled is not available.', VOICE[4]);
    if (!live()) return;
    await this.say('Please hold.', VOICE[4]);
    if (!live()) return;
    this.endCall(phone);
    this.lockMove = false;
    this.phase = 'blackout';
    await this.blackout(3.5);
    if (!live()) return;
    phone.state = 'idle';
    phone.handset.visible = true;
    phone.handset.position.set(phone.cradle.x, phone.cradle.y, phone.cradle.z);
    phone.handset.rotation.set(0, 0, 0);
    this.ringPhone(phone);
  }

  // You got through. The hold music plays clean, in tune at last, and the
  // lights come up and up until there's nothing but white.
  async transfer() {
    const flow = (this.flow = {});
    this.phase = 'transfer';
    this.sfx.setHeart(0);
    this.hum?.stop(1);
    await this.say('Thank you. Please hold while I transfer you.', { rate: 0.95, pitch: 1 });
    if (flow !== this.flow) return;
    this.hud.subtitle('', '♪ hold music ♪');
    this.callMusic = this.sfx.music({ warp: 0, level: 0.34 });
    this.tenant.show(false);
    this.phase = 'won';
    const s = this.materials.shared;
    const start = this.t;
    const fade = () => {
      const k = Math.min(1, (this.t - start) / 5);
      s.uDead.value = DEAD[this.lights] * (1 - k);
      s.uFlicker.value = 0;
      s.uPower.value = 1 + k * 2.5;
      s.uAmbient.value = 0.62 * (1 + k * 2);
      this.whiteout = Math.max(0, (this.t - start - 2.5) / 3);
      if (this.t - start < 6) this.after(0).then(fade);
      else this.finish();
    };
    fade();
  }

  finish() {
    this.hud.subtitle('', '');
    this.hud.end('won', { time: this.t, blinks: this.eyes.blinks, deaths: this.deaths, code: this.code.join('') });
    this.callMusic?.stop(3);
    this.sfx.hush();
  }

  // ------------------------------------------------------------ the Tenant

  // After the first call: when the lights come back, it's standing at the
  // end of the room. (Otherwise just out of sight.)
  revealTenant() {
    const c = this.player.camera;
    const fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw);
    let spot = null;
    for (let d = 11; d >= 5; d -= 0.5) {
      const x = c.x + fx * d, z = c.z + fz * d;
      if (!this.field.has(cellKey(Math.floor(x / CELL), Math.floor(z / CELL)))) continue;
      if (this.world.pointBlocked(x, z, 0.45, 1.0) || this.world.pointBlocked(x, z, 0.1, 2.5)) continue;
      if (this.world.lineOfSight(c.x, c.z, x, z, 1.6)) {
        spot = [x, z];
        break;
      }
    }
    if (!spot) spot = this.hiddenSpot(4, 6);
    this.tenant.place(spot[0], spot[1], this.player.x, this.player.z);
    this.tenant.pose(Math.random, 0);
    this.tenant.show(true);
    this.unseenMove = true;
    this.moved = false;
    this.gap = this.routeGap();
    this.graceUntil = this.t + 5; // let it be seen before it starts coming
  }

  // A cell centre at minD..maxD steps that you can't see.
  hiddenSpot(minD, maxD) {
    for (const [i, j] of this.cellsAround(minD, maxD)) {
      const x = (i + 0.5) * CELL, z = (j + 0.5) * CELL;
      if (!this.visibleFromPlayer(x, z) && !this.world.pointBlocked(x, z, 0.1, 2.5)) return [x, z];
    }
    const any = this.cellsAround(minD, maxD + 6)[0] || [Math.floor(this.player.x / CELL) + 3, Math.floor(this.player.z / CELL)];
    return [(any[0] + 0.5) * CELL, (any[1] + 0.5) * CELL];
  }

  routeGap() {
    const route = this.world.route(this.field, this.tenant.x, this.tenant.z, this.player.x, this.player.z);
    return route ? routeLength(route) : Infinity;
  }

  startHumming() {
    this.hum?.stop();
    this.hum = this.sfx.music({ voice: 'hum', tempo: 0.25, warp: 0.5, level: 0.9, where: [this.tenant.x, 2.4, this.tenant.z] });
  }

  // How far one blink lets it come: more with every call, and much more
  // when it has fallen far behind.
  blinkStep() {
    let step = 1.0 + 0.22 * this.found;
    if (this.gap > 12) step *= 1 + (this.gap - 12) * 0.2;
    return step;
  }

  onEyesClose() {
    if (!this.tenant.active || !this.hunting) return;
    this.moveTenant(this.blinkStep(), 'blink');
  }

  get hunting() {
    return this.tenant.active && this.t > this.graceUntil && ['ringing', 'call', 'blackout', 'final', 'dial', 'connecting'].includes(this.phase);
  }

  moveTenant(distance, why) {
    const t = this.tenant;
    const route = this.world.route(this.field, t.x, t.z, this.player.x, this.player.z);
    if (!route) {
      // Lost you entirely: it turns up somewhere behind you instead.
      const [x, z] = this.hiddenSpot(8, 11);
      t.place(x, z, this.player.x, this.player.z);
      this.moved = true;
      this.gap = this.routeGap();
      return;
    }
    const total = routeLength(route);
    // In the dark it comes closer, but it won't take you: that's your eyes' job.
    const go = Math.min(distance, total - (why === 'dark' ? 5 : 0));
    if (go <= 0.001) {
      this.gap = total;
      return;
    }
    this.gap = t.walk(route, go);
    t.place(t.x, t.z, this.player.x, this.player.z);
    this.moved = true;
    if (why === 'blink' || this.t > this.creakAt) {
      this.creakAt = this.t + 0.55;
      this.sfx.creak(t.x, 1.2, t.z, why === 'blink' ? 1 : 0.6);
      if (this.gap < 8) this.caption(this.gap < 3 ? 'something right in front of you' : 'something moves', 1.6);
    }
    if (this.gap < 3.5 && why === 'blink' && Math.random() < 0.5) this.sfx.breathe(t.x, 2.5, t.z, 1);
    if (this.gap <= CATCH) this.caught();
  }

  updateTenant(dt) {
    const t = this.tenant;
    if (!t.active || this.phase === 'caught' || this.phase === 'won' || this.phase === 'transfer') return;
    this.hum?.moveTo(t.x, 2.5, t.z);
    const hidden = this.eyes.closed || this.dark;
    if (this.hunting) {
      if (hidden) {
        let speed = 0;
        if (this.dark) speed = 1.7;
        else if (this.eyes.faceLost) speed = 1.3;
        else if (this.eyes.closedFor > 0.3) speed = 2.6; // a long blink: it keeps coming
        if (speed) this.moveTenant(speed * dt, this.dark ? 'dark' : 'closed');
      } else if (this.hidden && this.moved) {
        // Eyes open again: it's standing differently now.
        t.pose(Math.random, clamp((5 - this.gap) / 3.5, 0, 1));
        this.moved = false;
        this.unseenMove = true;
      }
    }
    this.hidden = hidden;
    if (hidden || this.phase === 'caught') return;

    // You see it (for the first time since it moved).
    if (this.unseenMove && this.visibleFromPlayer(t.x, t.z)) {
      this.unseenMove = false;
      const d = Math.hypot(t.x - this.player.x, t.z - this.player.z);
      if (this.t - this.lastStinger > 1.5) {
        this.sfx.stinger(clamp(1.25 - d / 12, 0.2, 1) * (this.settings.reducedScares ? 0.5 : 1));
        this.lastStinger = this.t;
      }
    }
    // Walking into it.
    if (this.hunting && Math.hypot(t.x - this.player.x, t.z - this.player.z) < 0.7) this.caught();
  }

  // ------------------------------------------------------------ caught

  caught() {
    if (this.phase === 'caught' || this.phase === 'won' || this.phase === 'transfer') return;
    this.flow = {};
    this.phase = 'caught';
    this.deaths++;
    this.lockMove = true;
    this.scareT = 0;
    this.cut = false;
    this.operator.cancel();
    this.callMusic?.stop(0.02);
    this.callMusic = null;
    this.stopDialTone?.();
    this.stopDialTone = null;
    this.hud.dial(false);
    this.hud.subtitle('', '');
    this.hud.prompt('');
    this.ringer?.set(0, 0, 0, 500, false);
    this.powerSeq = [[this.t, 1]];
    // Right in front of you.
    const c = this.player.camera;
    const fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw);
    this.tenant.place(c.x + fx * 0.95, c.z + fz * 0.95, c.x, c.z);
    this.tenant.pose(Math.random, 1);
    this.tenant.show(true);
    const gentle = this.settings.reducedScares;
    this.sfx.scream(gentle ? 0.3 : 1);
    this.sfx.setHeart(0);
    if (!gentle && !this.settings.reduceFlashing) this.flash = 1;
  }

  updateScare(dt) {
    this.flash = Math.max(0, this.flash - dt * 6);
    if (this.phase !== 'caught') {
      this.scare = Math.max(0, this.scare - dt * 2);
      return;
    }
    this.scareT += dt;
    const t = this.scareT;
    const c = this.player.camera;
    const cp = Math.cos(c.pitch);
    const ahead = 0.34;
    const target = {
      x: c.x - Math.sin(c.yaw) * cp * ahead,
      y: c.y + Math.sin(c.pitch) * ahead - 0.03,
      z: c.z - Math.cos(c.yaw) * cp * ahead,
    };
    this.tenant.lunge(new THREE.Vector3(target.x, target.y, target.z), Math.min(1, t / 0.2));
    this.tenant.mouth.value = clamp((t - 0.08) / 0.4, 0, 1);
    this.tenant.lift.value = 0.45;
    const gentle = this.settings.reducedScares;
    this.scare = (t < 1.3 ? 1 : Math.max(0, 1 - (t - 1.3) * 4)) * (gentle ? 0.4 : 1);
    if (t > 1.35 && !this.cut) {
      this.cut = true;
      this.blackScreen = true;
      this.sfx.lineCut();
      this.sfx.busy(3);
      this.hud.end('caught', {});
    }
  }

  // Back on hold: at the last phone you answered, with your digits; the
  // phone you were after rings again.
  retry() {
    if (this.phase !== 'caught') return;
    this.hud.hideEnd();
    this.blackScreen = false;
    this.scare = 0;
    this.tenant.unlunge();
    this.player.x = this.checkpoint.x;
    this.player.z = this.checkpoint.z;
    this.player.vx = this.player.vz = 0;
    this.player.wake = 0;
    this.player.pitch = -1.25;
    this.player.roll = 0.35;
    this.player.aimPitch = 0;
    this.eyes.reset();
    this.lockMove = false;
    this.fieldCell = null;
    this.updateField();
    this.setLights(this.found);
    this.powerSeq = [[this.t, 1]];
    const [x, z] = this.hiddenSpot(8, 11);
    this.tenant.place(x, z, this.player.x, this.player.z);
    this.tenant.pose(Math.random, 0);
    this.tenant.show(this.found > 0);
    this.gap = this.routeGap();
    this.graceUntil = this.t + 4;
    this.moved = false;
    this.unseenMove = true;
    this.hidden = false;
    if (this.found >= 2) this.startHumming();
    const phone = this.current;
    if (phone && phone.index < this.found && !phone.red) {
      // You'd already got that digit: on to the next.
      if (phone.state !== 'off-hook') phone.leaveOffHook();
      this.phase = 'blackout';
      this.after(2).then(() => this.phase === 'blackout' && this.nextPhone());
    } else if (phone) {
      phone.state = 'idle';
      phone.handset.visible = true;
      this.ringPhone(phone);
    } else {
      this.phase = 'intro';
      this.after(2).then(() => this.nextPhone());
    }
  }

  // ------------------------------------------------------------ sound & HUD

  updateScore() {
    if (this.phase === 'won' || this.phase === 'transfer') {
      this.sfx.setTension(0);
      return;
    }
    const near = this.tenant.active ? clamp((20 - this.gap) / 20, 0, 1) : 0;
    this.sfx.setTension(this.phase === 'caught' ? 0 : 0.12 + 0.05 * this.found + 0.6 * near);
    this.sfx.setHeart(this.tenant.active && this.phase !== 'caught' ? clamp((9 - this.gap) / 7, 0, 1) : 0);
  }

  caption(text, seconds) {
    this.captionText = text;
    this.captionUntil = this.t + seconds;
  }

  updateHud(control) {
    const hud = this.hud;
    const e = this.eyes;
    hud.eyes({ mode: e.mode, meter: e.meter, closed: e.closed, fighting: e.fighting, faceLost: e.faceLost, touch: control.touch });
    hud.warning(e.faceLost && this.hunting ? "It can't see your eyes. Neither can you." : '');
    hud.prompt(this.phase === 'caught' ? '' : this.promptText);
    let cap = '';
    if (this.settings.captions) {
      if (this.t < this.captionUntil) cap = `[${this.captionText}]`;
      else if (this.ringCaption) cap = `[${this.ringCaption}]`;
    }
    hud.caption(cap);
  }

  dispose() {
    this.ringer?.stop();
    this.callMusic?.stop();
    this.hum?.stop();
    for (const p of this.phones) p.dispose();
  }
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
