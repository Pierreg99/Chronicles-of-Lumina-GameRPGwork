// ui/tutorial.js — context-sensitive tips that fire once per flag.
//
// Each step is a { id, when, text } triple. `when` is called every frame
// with the game state; when it returns true and the step hasn't been shown
// yet, the tip appears at the bottom of the screen for a few seconds.
//
// Steps are listed in order and dismiss independently.

import { screenBus, SCREEN } from '../core/screen-state.js';
import { state } from '../core/state.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING]);

export class Tutorial {
  constructor(bus) {
    this.bus = bus;
    this.el = null;
    this.shown = new Set();
    this.current = null;
    this._until = 0;

    this._build();
    bus.on('tick', () => this._tick());
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'tutorial';
    Object.assign(this.el.style, {
      position: 'fixed',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 20px',
      background: 'var(--surface)',
      border: 'var(--line)',
      borderRadius: 'var(--radius)',
      color: 'var(--text)',
      fontSize: '.9rem',
      zIndex: 12,
      maxWidth: 'min(420px, 80vw)',
      textAlign: 'center',
      pointerEvents: 'none',
      display: 'none',
      opacity: '0',
      transition: 'opacity .25s',
    });
    document.body.appendChild(this.el);
  }

  _apply(screen) {
    if (!this.el) return;
    if (!VISIBLE_SCREENS.has(screen)) {
      this.el.style.display = 'none';
      this.current = null;
    }
  }

  register(id, when, text, durationSec = 5) {
    this.steps = this.steps || [];
    this.steps.push({ id, when, text, durationSec });
  }

  _tick() {
    if (!this.steps) return;
    const t = state.time;
    for (const step of this.steps) {
      if (this.shown.has(step.id)) continue;
      if (this.current) break;
      try {
        if (step.when(state)) {
          this.shown.add(step.id);
          this.current = step;
          this._until = t + step.durationSec;
          this._show(step);
          this.bus.emit('tutorial:step', step);
          break;
        }
      } catch (_) { /* ignore predicate errors */ }
    }
    if (this.current && t > this._until) {
      this._hide();
    }
  }

  _show(step) {
    this.el.textContent = step.text;
    this.el.style.display = 'block';
    requestAnimationFrame(() => { this.el.style.opacity = '1'; });
  }

  _hide() {
    this.el.style.opacity = '0';
    setTimeout(() => {
      if (this.current && this.el) this.el.style.display = 'none';
    }, 260);
    this.current = null;
    this.bus.emit('tutorial:dismiss');
  }
}
