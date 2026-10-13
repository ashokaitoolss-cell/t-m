// The Operator: the automated voice on the line. The browser's own speech
// synthesis where it has a voice (a flat, polite machine voice suits an
// automated line); a formant babble where it doesn't. Subtitles either way.

export class Operator {
  constructor(sfx) {
    this.sfx = sfx;
    this.enabled = true;
    this.volume = 0.8;
    this.synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
    this.voice = null;
    if (this.synth) {
      this.pickVoice();
      this.synth.addEventListener?.('voiceschanged', () => this.pickVoice());
    }
  }

  pickVoice() {
    const voices = this.synth.getVoices().filter((v) => /^en/i.test(v.lang));
    const score = (v) =>
      (/en-GB/i.test(v.lang) ? 4 : 0) +
      (/female|libby|sonia|serena|kate|hazel|susan|moira|karen|samantha|zira|aria|jenny/i.test(v.name) ? 3 : 0) +
      (/google|natural|neural|premium|enhanced/i.test(v.name) ? 2 : 0) +
      (v.localService ? 1 : 0);
    this.voice = voices.sort((a, b) => score(b) - score(a))[0] || null;
  }

  // Inside a user gesture, so later speech is allowed (Safari).
  warm() {
    if (!this.synth) return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      this.synth.speak(u);
    } catch {
      // no speech
    }
  }

  get canSpeak() {
    return this.enabled && !!this.synth && !!this.voice;
  }

  // Speak `text`; resolves when it has been said. `after(seconds)` is the
  // game's clock, used so a browser that never reports the end can't hang
  // the call.
  say(text, { rate = 0.95, pitch = 0.9 } = {}, after) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const estimate = (words * 0.37) / rate + 0.35;
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };
      if (this.canSpeak) {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = this.voice;
        u.lang = this.voice.lang;
        u.rate = rate;
        u.pitch = pitch;
        u.volume = this.volume;
        u.onend = finish;
        u.onerror = finish;
        this.synth.speak(u);
        after(estimate * 2 + 2.5).then(finish);
      } else {
        this.sfx.babble(estimate, pitch < 0.75);
        after(estimate).then(finish);
      }
    });
  }

  cancel() {
    this.synth?.cancel();
  }

  pause() {
    this.synth?.pause();
  }

  resume() {
    this.synth?.resume();
  }
}
