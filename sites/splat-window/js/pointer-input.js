// Mouse / touch fallback: the pointer stands in for the viewer's head.
// Point at the right of the page and you look in from the right; scroll (or
// pinch) to lean in and out.

import { clamp } from './viewer.js';

const REACH = 1.25; // how far past the page edge the virtual head can go

export class PointerInput {
  // `ignore`: a selector for controls the pointer can move over without
  // swinging the view.
  constructor(surface, { ignore = null } = {}) {
    this.nx = 0;
    this.ny = 0;
    this.lean = 1;
    this.lastInput = -Infinity;
    this.touches = new Map();
    this.pinch = null;

    const move = (e) => {
      if (e.pointerType !== 'mouse') return;
      if (ignore && e.target instanceof Element && e.target.closest(ignore)) return;
      this.point(e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', move, { passive: true });

    surface.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      surface.setPointerCapture(e.pointerId);
      this.touches.set(e.pointerId, [e.clientX, e.clientY]);
      if (this.touches.size === 1) this.point(e.clientX, e.clientY);
    });
    surface.addEventListener('pointermove', (e) => {
      if (!this.touches.has(e.pointerId)) return;
      this.touches.set(e.pointerId, [e.clientX, e.clientY]);
      if (this.touches.size === 1) this.point(e.clientX, e.clientY);
      else if (this.touches.size === 2) this.pinchMove();
    });
    const end = (e) => {
      this.touches.delete(e.pointerId);
      if (this.touches.size < 2) this.pinch = null;
    };
    surface.addEventListener('pointerup', end);
    surface.addEventListener('pointercancel', end);

    surface.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        this.lean = clamp(this.lean * Math.exp(delta * 0.0012), 0.4, 2.2);
        this.lastInput = performance.now();
      },
      { passive: false },
    );
  }

  point(x, y) {
    this.nx = clamp((x / innerWidth) * 2 - 1, -1, 1);
    this.ny = clamp((y / innerHeight) * 2 - 1, -1, 1);
    this.lastInput = performance.now();
  }

  pinchMove() {
    const [a, b] = [...this.touches.values()];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (this.pinch) this.lean = clamp(this.lean * (this.pinch / d), 0.4, 2.2);
    this.pinch = d;
    this.lastInput = performance.now();
  }

  reset() {
    this.nx = 0;
    this.ny = 0;
    this.lean = 1;
  }

  eye(aspect, distance) {
    return [this.nx * (aspect / 2) * REACH, -this.ny * 0.5 * REACH, distance * this.lean];
  }
}
