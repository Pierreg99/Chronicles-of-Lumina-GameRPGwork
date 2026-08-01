// engine/input.js — keyboard + mouse drag + touch + virtual joystick.
// Reads from a single DOM element (#joy + 3 .actbtn) on mobile.

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

    // Virtual joystick
    const joyEl = document.getElementById('joy');
    const knob = joyEl && joyEl.querySelector('.knob');
    const move = (t) => {
      if (!joyEl) return;
      const r = joyEl.getBoundingClientRect();
      let dx = t.clientX - (r.left + 60);
      let dy = t.clientY - (r.top + 60);
      const len = Math.hypot(dx, dy);
      if (len > 44) { dx = dx / len * 44; dy = dy / len * 44; }
      if (knob) knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      this.joy.x = dx / 44;
      this.joy.y = dy / 44;
      this.joy.active = true;
    };
    if (joyEl) {
      joyEl.addEventListener('touchstart', (e) => { e.preventDefault(); move(e.touches[0]); }, { passive: false });
      joyEl.addEventListener('touchmove',  (e) => { e.preventDefault(); move(e.touches[0]); }, { passive: false });
      joyEl.addEventListener('touchend',   () => {
        this.joy = { x: 0, y: 0, active: false };
        if (knob) knob.style.transform = 'translate(-50%,-50%)';
      });
    }

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); }, { passive: false });
    };
    bind('btn-atk', () => { this.attackEdge = true; });
    bind('btn-int', () => { this.interactEdge = true; });
    bind('btn-roll', () => { this.dodgeEdge = true; });
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
  consumeCameraYaw() { const v = this.cameraYawDelta || 0; this.cameraYawDelta = 0; return -v; } // sign flipped
}
