// The game's on-screen display: extension digits, objective, subtitles,
// sound captions, the interaction prompt, your eyes, the dial pad and the
// end cards. Only touches the DOM when something changed.

const $ = (s) => document.querySelector(s);

export class Hud {
  constructor() {
    this.root = $('#game-hud');
    this.ext = $('#ext-digits');
    this.objectiveEl = $('#objective');
    this.subtitleEl = $('#subtitle');
    this.captionEl = $('#caption');
    this.promptEl = $('#prompt');
    this.eyesEl = $('#eyes');
    this.eyeFill = $('#eye-fill');
    this.eyeLabel = $('#eye-label');
    this.eyeTip = $('#eye-tip');
    this.warningEl = $('#warning');
    this.holdButton = $('#hold-eyes');
    this.dialpad = $('#dialpad');
    this.dialDisplay = $('#dial-display');
    this.ending = $('#ending');
    this.cache = new Map();
  }

  put(key, value, apply) {
    if (this.cache.get(key) === value) return;
    this.cache.set(key, value);
    apply(value);
  }

  show(on) {
    this.put('show', on, (v) => (this.root.hidden = !v));
  }

  digits(code, found, hidden) {
    const text = code.map((d, k) => (k < found ? (hidden ? '•' : String(d)) : '_')).join(' ');
    this.put('ext', text, (v) => (this.ext.textContent = v));
  }

  flashDigit() {
    this.ext.classList.remove('new');
    void this.ext.offsetWidth;
    this.ext.classList.add('new');
  }

  objective(text) {
    this.put('objective', text, (v) => {
      this.objectiveEl.textContent = v;
      this.objectiveEl.hidden = !v;
    });
  }

  // A line from the Operator; `digit` (if given) is shown large.
  subtitle(speaker, text, digit) {
    const key = `${speaker}|${text}|${digit}`;
    this.put('subtitle', key, () => {
      this.subtitleEl.replaceChildren();
      if (!text) {
        this.subtitleEl.hidden = true;
        return;
      }
      if (speaker) {
        const who = document.createElement('b');
        who.textContent = `${speaker}: `;
        this.subtitleEl.append(who);
      }
      this.subtitleEl.append(text);
      if (digit !== undefined) {
        const d = document.createElement('strong');
        d.className = 'digit';
        d.textContent = ` ${digit}`;
        this.subtitleEl.append(d);
      }
      this.subtitleEl.hidden = false;
    });
  }

  caption(text) {
    this.put('caption', text || '', (v) => {
      this.captionEl.textContent = v;
      this.captionEl.hidden = !v;
    });
  }

  prompt(text) {
    this.put('prompt', text || '', (v) => {
      this.promptEl.textContent = v;
      this.promptEl.hidden = !v;
    });
  }

  warning(text) {
    this.put('warning', text || '', (v) => {
      this.warningEl.textContent = v;
      this.warningEl.hidden = !v;
    });
  }

  // { mode, meter 0..1, closed, fighting, faceLost, touch }
  eyes(e) {
    const label = e.mode === 'camera' ? (e.faceLost ? 'EYES ?' : e.closed ? 'EYES SHUT' : 'EYES OPEN') : e.closed ? 'EYES SHUT' : 'EYES';
    this.put('eyeLabel', label, (v) => (this.eyeLabel.textContent = v));
    const pct = Math.round(e.meter * 50) * 2;
    this.put('eyeFill', pct, (v) => (this.eyeFill.style.width = `${v}%`));
    const state = e.closed ? 'shut' : e.fighting ? 'fight' : e.meter > 0.7 ? 'dry' : 'ok';
    this.put('eyeState', state, (v) => (this.eyesEl.dataset.state = v));
    let tip = '';
    if (e.mode === 'manual') {
      if (e.fighting) tip = e.touch ? 'keep holding…' : 'holding them open…';
      else if (e.meter > 0.7) tip = e.touch ? 'hold the eye button' : 'hold SPACE';
    }
    this.put('eyeTip', tip, (v) => (this.eyeTip.textContent = v));
    this.put('holdButton', e.mode === 'manual' && e.touch, (v) => (this.holdButton.hidden = !v));
  }

  dial(open, entry = '') {
    this.put('dialOpen', open, (v) => (this.dialpad.hidden = !v));
    this.put('dialEntry', entry, (v) => (this.dialDisplay.textContent = v.padEnd(5, '_').split('').join(' ')));
  }

  // kind: 'caught' | 'won'; stats: { time, blinks, deaths, code }
  end(kind, stats) {
    const caught = kind === 'caught';
    $('#end-eyebrow').textContent = caught ? 'Call disconnected' : 'Call transferred';
    $('#end-title').textContent = caught ? 'He answered for you.' : 'Transferred.';
    $('#end-text').textContent = caught
      ? 'Every call is important to us. Your place in the queue has been kept.'
      : `Extension ${stats.code} connected. You were on hold for ${clock(stats.time)} and blinked ${stats.blinks} times. Please hold.`;
    $('#end-redial').hidden = !caught;
    $('#end-again').hidden = caught;
    this.ending.dataset.kind = kind;
    this.ending.hidden = false;
    // Not focused on purpose: a Space still held from fighting your eyes
    // would press the button the moment you let go.
  }

  hideEnd() {
    this.ending.hidden = true;
  }
}

function clock(seconds) {
  const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
