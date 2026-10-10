// Keyboard, mouse (pointer lock) and touch.
//
//   W A S D / ↑ ↓   walk          ← →   turn
//   Shift           run           mouse look once the pointer is locked
//   Touch: drag on the left half to walk, on the right half to look.

const TURN_SPEED = 1.9; // rad/s for the arrow keys

export class Input {
  constructor(surface) {
    this.surface = surface;
    this.keys = new Set();
    this.lookX = 0;
    this.lookY = 0;
    this.sensitivity = 1;
    this.invertY = false;
    this.locked = false;
    this.onlockchange = null;
    this.stick = null; // { id, x0, y0, x, y }
    this.lookTouch = null; // { id, x, y }

    window.addEventListener('keydown', (e) => {
      if (e.target instanceof Element && e.target.closest('input, select, textarea')) return;
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === surface;
      this.lockedAt = performance.now();
      this.onlockchange?.(this.locked);
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      // Browsers can report one huge jump as the pointer locks; skip it and any spike.
      if (performance.now() - this.lockedAt < 150) return;
      if (Math.abs(e.movementX) > 300 || Math.abs(e.movementY) > 300) return;
      this.lookX += e.movementX;
      this.lookY += e.movementY;
    });

    surface.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      surface.setPointerCapture(e.pointerId);
      if (e.clientX < innerWidth / 2 && !this.stick) {
        this.stick = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY };
      } else if (!this.lookTouch) {
        this.lookTouch = { id: e.pointerId, x: e.clientX, y: e.clientY };
      }
    });
    surface.addEventListener('pointermove', (e) => {
      if (this.stick?.id === e.pointerId) {
        this.stick.x = e.clientX;
        this.stick.y = e.clientY;
      } else if (this.lookTouch?.id === e.pointerId) {
        this.lookX += (e.clientX - this.lookTouch.x) * 2.2;
        this.lookY += (e.clientY - this.lookTouch.y) * 2.2;
        this.lookTouch.x = e.clientX;
        this.lookTouch.y = e.clientY;
      }
    });
    const end = (e) => {
      if (this.stick?.id === e.pointerId) this.stick = null;
      if (this.lookTouch?.id === e.pointerId) this.lookTouch = null;
    };
    surface.addEventListener('pointerup', end);
    surface.addEventListener('pointercancel', end);
  }

  lock() {
    if (this.locked || !this.surface.requestPointerLock || matchMedia('(pointer: coarse)').matches) return;
    const plain = () => {
      try {
        this.surface.requestPointerLock()?.catch?.(() => {});
      } catch {
        // pointer lock unavailable (e.g. in some iframes): look stays click-free
      }
    };
    try {
      // Raw movement where supported (no OS acceleration), plain lock otherwise.
      this.surface.requestPointerLock({ unadjustedMovement: true })?.catch?.(plain);
    } catch {
      plain();
    }
  }

  unlock() {
    if (this.locked) document.exitPointerLock();
  }

  // Read and reset everything accumulated since the last frame.
  sample(dt) {
    const k = (code) => this.keys.has(code);
    let forward = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0);
    let strafe = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0);
    if (this.stick) {
      const dx = (this.stick.x - this.stick.x0) / 60, dy = (this.stick.y - this.stick.y0) / 60;
      const m = Math.hypot(dx, dy);
      if (m > 0.15) {
        strafe += dx / Math.max(1, m);
        forward -= dy / Math.max(1, m);
      }
    }
    const turn = ((k('ArrowLeft') ? 1 : 0) - (k('ArrowRight') ? 1 : 0)) * TURN_SPEED * dt;
    const scale = 0.0022 * this.sensitivity;
    const look = [-this.lookX * scale + turn, -this.lookY * scale * (this.invertY ? -1 : 1)];
    this.lookX = 0;
    this.lookY = 0;
    return {
      move: [strafe, forward],
      run: k('ShiftLeft') || k('ShiftRight') || (this.stick && Math.hypot(this.stick.x - this.stick.x0, this.stick.y - this.stick.y0) > 110),
      look,
    };
  }

  get moving() {
    return ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown'].some((c) => this.keys.has(c)) || !!this.stick;
  }
}
