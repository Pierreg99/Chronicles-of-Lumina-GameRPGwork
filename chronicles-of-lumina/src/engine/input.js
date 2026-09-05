// engine/input.js — keyboard + mouse drag + touch + virtual joystick + lookpad.
// Reads from #joy, #lookpad, and action buttons on mobile.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.dragging = false;
    this.lastX = 0;
    this.joy = { x: 0, y: 0, active: false };
    this.attackEdge = false;
    this.dodgeEdge = false;
    this.interactEdge = false;
    this.pauseEdge = false;
    this.inventoryEdge = false;
    this.codexEdge = false;
    this.cameraYawDelta = 0;
    this._install();
  }

  _install() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'Space') this.attackEdge = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.dodgeEdge = true;
      if (e.code === 'KeyE') this.interactEdge = true;
      if (e.code === 'Escape' || e.code === 'KeyP') this.pauseEdge = true;
      if (e.code === 'KeyI') this.inventoryEdge = true;
      if (e.code === 'KeyC') this.codexEdge = true;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.target === this.canvas) {
        this.attackEdge = true;
        this.dragging = true;
        this.lastX = e.clientX;
      }
    });
    window.addEventListener('mouseup', () => { this.dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (this.dragging) {
        this.cameraYawDelta = (e.clientX - this.lastX) * 0.005;
        this.lastX = e.clientX;
      }
    });

    // Virtual joystick — radius derived from element size (not hard-coded 60)
    const joyEl = document.getElementById('joy');
    const knob = joyEl && joyEl.querySelector('.knob');
    const move = (t) => {
      if (!joyEl) return;
      const r = joyEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const maxR = Math.max(24, Math.min(r.width, r.height) * 0.37);
      let dx = t.clientX - cx;
      let dy = t.clientY - cy;
      const len = Math.hypot(dx, dy);
      if (len > maxR) { dx = dx / len * maxR; dy = dy / len * maxR; }
      if (knob) knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      this.joy.x = dx / maxR;
      this.joy.y = dy / maxR;
      this.joy.active = true;
    };
    if (joyEl) {
      joyEl.addEventListener('touchstart', (e) => { e.preventDefault(); move(e.touches[0]); }, { passive: false });
      joyEl.addEventListener('touchmove',  (e) => { e.preventDefault(); move(e.touches[0]); }, { passive: false });
      joyEl.addEventListener('touchend',   () => {
        this.joy = { x: 0, y: 0, active: false };
        if (knob) knob.style.transform = 'translate(-50%,-50%)';
      });
      joyEl.addEventListener('touchcancel', () => {
        this.joy = { x: 0, y: 0, active: false };
        if (knob) knob.style.transform = 'translate(-50%,-50%)';
      });
    }

    // Lookpad — right-side drag for camera yaw on mobile
    const look = document.getElementById('lookpad');
    if (look) {
      let lookLastX = 0;
      look.addEventListener('touchstart', (e) => {
        e.preventDefault();
        lookLastX = e.touches[0].clientX;
      }, { passive: false });
      look.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const x = e.touches[0].clientX;
        this.cameraYawDelta += (x - lookLastX) * 0.006;
        lookLastX = x;
      }, { passive: false });
    }

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); }, { passive: false });
      // Desktop / pointer fallback for testing with mouse
      el.addEventListener('mousedown', (e) => { e.preventDefault(); fn(); });
    };
    bind('btn-atk', () => { this.attackEdge = true; });
    bind('btn-int', () => { this.interactEdge = true; });
    bind('btn-roll', () => { this.dodgeEdge = true; });
    bind('btn-pause', () => { this.pauseEdge = true; });
  }

  // ── polled values used each frame ────────────────────────
  moveX() {
    return (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0)
         - (this.keys.has('KeyA') || this.keys.has('ArrowLeft')  ? 1 : 0)
         + this.joy.x;
  }
  moveZ() {
    return (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0)
         - (this.keys.has('KeyW') || this.keys.has('ArrowUp')   ? 1 : 0)
         + this.joy.y;
  }
  consumeAttack()    { const v = this.attackEdge; this.attackEdge = false; return v; }
  consumeDodge()     { const v = this.dodgeEdge;  this.dodgeEdge  = false; return v; }
  consumeInteract()  { const v = this.interactEdge; this.interactEdge = false; return v; }
  consumePause()     { const v = this.pauseEdge;  this.pauseEdge  = false; return v; }
  consumeInventory() { const v = this.inventoryEdge; this.inventoryEdge = false; return v; }
  consumeCodex()     { const v = this.codexEdge;     this.codexEdge     = false; return v; }
  consumeCameraYaw() { const v = this.cameraYawDelta || 0; this.cameraYawDelta = 0; return -v; }
}
