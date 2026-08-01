// ui/mobile-controls.js — show/hide the mobile controls group based on pointer.

import { isMobile } from '../engine/mobile-input.js';

export class MobileControls {
  constructor() {
    this.el = document.getElementById('mobile-ui');
    this.applyVisibility();
    window.matchMedia('(pointer: coarse)').addEventListener?.('change', () => this.applyVisibility());
  }

  applyVisibility() {
    if (!this.el) return;
    this.el.style.display = isMobile() ? 'block' : 'none';
  }
}
