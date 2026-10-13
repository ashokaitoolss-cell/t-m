// Your eyes, as far as the Tenant is concerned.
//
// With the camera, they are your real eyes: a blink on the webcam is a blink
// in the game (the screen goes dark with it), and if the camera can't find
// your eyes at all, they count as closed.
//
// Without it, they dry out. After DRY_TIME seconds they blink on their own,
// unless you hold Space: then they sting, blur and water, and after
// MAX_FIGHT more seconds they slam shut for a long blink. B blinks on
// purpose, when you choose.

const DRY_TIME = 7.5;
const MAX_FIGHT = 4.5;
const LOST_GRACE = 0.45; // seconds without a face before it counts as closed

export class Eyes {
  constructor() {
    this.mode = 'manual'; // or 'camera'
    this.closed = false;
    this.lid = 0; // drawn eyelids: 0 open … 1 shut
    this.strain = 0; // blur and tears
    this.dryness = 0;
    this.fight = 0;
    this.blinks = 0;
    this.closedFor = 0;
    this.sinceBlink = 0;
    this.faceLost = false;
    this.lostFor = 0;
    this.blinkLeft = 0; // manual blink: seconds until the eyes open again
    this.blinkLength = 0;
    this.onclose = null;
    this.onopen = null;
  }

  reset() {
    this.closed = false;
    this.lid = 0;
    this.strain = 0;
    this.dryness = 0;
    this.fight = 0;
    this.blinkLeft = 0;
    this.closedFor = 0;
    this.sinceBlink = 0;
    this.faceLost = false;
    this.lostFor = 0;
  }

  // Shut for `seconds` (manual eyes only).
  blink(seconds) {
    if (this.mode !== 'manual' || this.blinkLeft > 0) return;
    this.blinkLeft = this.blinkLength = seconds;
  }

  // control: { holding (Space), blink (B pressed this frame), tracker }
  update(dt, control) {
    let closed;
    let lidTarget = 0;
    let strainTarget = 0;
    if (this.mode === 'camera') {
      const t = control.tracker;
      if (t.state === 'tracking') {
        this.lostFor = 0;
        this.faceLost = false;
        closed = t.eyesClosed;
        lidTarget = closed ? 1 : 0;
      } else {
        this.lostFor += dt;
        this.faceLost = this.lostFor > LOST_GRACE;
        closed = this.faceLost;
      }
      // Real eyes held open too long water for real; show it a little.
      strainTarget = smoothstep(9, 24, this.sinceBlink) * 0.45 + (this.faceLost ? 0.35 : 0);
    } else {
      this.faceLost = false;
      if (control.blink && this.blinkLeft <= 0) this.blink(0.16);
      if (this.blinkLeft > 0) {
        this.blinkLeft -= dt;
        closed = true;
        const into = this.blinkLength - this.blinkLeft;
        lidTarget = Math.min(1, into / 0.06, Math.max(0, this.blinkLeft) / 0.1 + 0.02);
        if (this.blinkLeft <= 0) {
          closed = false;
          this.dryness = 0;
          this.fight = 0;
        }
      } else {
        closed = false;
        this.dryness += dt / DRY_TIME;
        if (this.dryness >= 1) {
          if (control.holding) {
            this.fight += dt;
            // Fighting it: the lids twitch.
            lidTarget = 0.1 + 0.25 * Math.max(0, Math.sin(this.fight * 23) * Math.sin(this.fight * 7.3));
            if (this.fight >= MAX_FIGHT) this.blink(0.95); // they slam shut
          } else {
            this.blink(0.18 + 0.45 * Math.min(1, this.fight / MAX_FIGHT));
          }
        } else {
          lidTarget = 0.12 * smoothstep(0.6, 1, this.dryness); // heavy lids
        }
      }
      strainTarget = 0.45 * smoothstep(0.7, 1, this.dryness) + 0.75 * Math.min(1, this.fight / MAX_FIGHT);
    }

    const lidRate = this.mode === 'camera' ? 0.025 : 0.012;
    this.lid += (lidTarget - this.lid) * (1 - Math.exp(-dt / lidRate));
    if (closed && lidTarget >= 1 && this.lid > 0.98) this.lid = 1;
    this.strain += (strainTarget - this.strain) * (1 - Math.exp(-dt / (strainTarget > this.strain ? 0.6 : 0.35)));

    if (closed && !this.closed) {
      this.closed = true;
      this.closedFor = 0;
      this.onclose?.();
    } else if (!closed && this.closed) {
      this.closed = false;
      this.blinks++;
      this.sinceBlink = 0;
      this.onopen?.(this.closedFor);
    }
    if (this.closed) this.closedFor += dt;
    else this.sinceBlink += dt;
  }

  // 0..1 for the HUD: how dry (manual) or how long since a blink (camera).
  get meter() {
    return this.mode === 'manual' ? Math.min(1, this.dryness) : smoothstep(0, 20, this.sinceBlink);
  }

  get fighting() {
    return this.mode === 'manual' && this.fight > 0 && this.blinkLeft <= 0;
  }
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
