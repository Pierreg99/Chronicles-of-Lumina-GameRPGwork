// ui/damage-direction.js — when the player takes damage from an off-screen or
// far-away source, show a triangular arrow at the screen edge pointing
// toward the damage source.
//
//   ┌────────────────────────────────────────┐
//   │                                        │
//   │                                        │
//   │             ◀━━ HIT FROM LEFT          │  ← arrow sits at the edge
//   │                                        │     opposite to source
//   │                                        │
//   └────────────────────────────────────────┘

import * as THREE from 'three';
import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG]);

export class DamageDirection {
  constructor(bus, { camera, player }) {
    this.bus = bus;
    this.camera = camera;
    this.player = player;
    this.remaining = 0;
    this.angle = 0;        // radians, world-space (atan2 from -Z)
    this._projected = new THREE.Vector3();

    this._build();
    bus.on(EVENTS.DAMAGE_TAKEN, ({ source }) => this._onDamage(source));
    bus.on('tick', () => this._onTick());
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'damage-direction';
    this.el.innerHTML = `
      <svg viewBox="0 0 40 40" width="40" height="40">
        <polygon points="20,4 36,30 4,30" fill="#ff5555" stroke="#3a0a0a" stroke-width="2"/>
      </svg>`;
    Object.assign(this.el.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 11,
      pointerEvents: 'none',
      display: 'none',
      transition: 'opacity 0.2s ease-out',
      opacity: '0',
    });
    document.body.appendChild(this.el);
  }

  _apply(screen) {
    this.el.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
    if (!VISIBLE_SCREENS.has(screen)) this.remaining = 0;
  }

  _onDamage(source) {
    if (!source) return;
    const dx = source.x - this.player.position.x;
    const dz = source.z - this.player.position.z;
    // World-space angle (atan2 with -Z forward, +X right)
    this.angle = Math.atan2(dx, -dz);
    this.remaining = CONFIG.damageDirection.duration;
  }

  _onTick() {
    if (this.remaining > 0) {
      this.remaining -= 1 / 60;
      if (this.remaining <= 0) {
        this.el.style.opacity = '0';
        return;
      }
      this._render();
    }
  }

  _render() {
    // Project the world angle into screen space, accounting for the camera yaw.
    // We render a 2D arrow at the screen edge nearest to the source, rotated
    // to point inward (toward the source direction).
    const camYaw = this.camera.yaw || 0;
    // angle relative to camera forward
    const rel = this.angle - camYaw;
    // Normalize to [-PI, PI]
    let a = ((rel + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (a < -Math.PI) a += Math.PI * 2;

    // a in (-PI, PI]; 0 = source is straight ahead, PI = behind, PI/2 = right
    const margin = CONFIG.damageDirection.edgeMargin;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Pick anchor on the screen edge
    let x, y, rot;
    if (Math.abs(a) < Math.PI * 0.25) {
      // Front: top edge
      x = w * 0.5; y = margin;
      rot = 0;
    } else if (Math.abs(a) > Math.PI * 0.75) {
      // Behind: bottom edge
      x = w * 0.5; y = h - margin;
      rot = 180;
    } else if (a > 0) {
      // Right
      x = w - margin; y = h * 0.5;
      rot = 90;
    } else {
      // Left
      x = margin; y = h * 0.5;
      rot = 270;
    }
    // Flip arrow if source is behind (it should still point inward)
    const flip = a > Math.PI * 0.5 || a < -Math.PI * 0.5 ? 180 : 0;
    this.el.style.left = x + 'px';
    this.el.style.top = y + 'px';
    this.el.style.transform = `translate(-50%, -50%) rotate(${rot + flip}deg)`;
    this.el.style.opacity = '1';
  }
}
