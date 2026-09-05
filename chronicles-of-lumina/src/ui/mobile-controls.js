// ui/mobile-controls.js — show/hide the mobile controls group based on pointer.
// v0.13: keeps aria-hidden in sync and re-checks on orientation / resize.

import { isMobile } from '../engine/mobile-input.js';

export class MobileControls {
  constructor() {
    this.el = document.getElementById('mobile-ui');
    this.applyVisibility();
    window.matchMedia('(pointer: coarse)').addEventListener?.('change', () => this.applyVisibility());
    window.addEventListener('orientationchange', () => this.applyVisibility());
    window.addEventListener('resize', () => {
      // Debounce lightly — only re-apply visibility, not layout work
      clearTimeout(this._rz);
      this._rz = setTimeout(() => this.applyVisibility(), 120);
    });
  }

  applyVisibility() {
    if (!this.el) return;
    const show = isMobile();
    this.el.style.display = show ? 'block' : 'none';
    this.el.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
}
