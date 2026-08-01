// ui/menus.js — start / pause / end screens. Listens to screen-state
// changes and shows/hides overlays declaratively. The DOM is no longer
// poked from main.js for these panels.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN, transition } from '../core/screen-state.js';
import { state } from '../core/state.js';

const PANELS = {
  [SCREEN.START]:     'start-screen',
  [SCREEN.PAUSED]:    'pause-screen',
  [SCREEN.ENDSCREEN]: 'end-screen',
};

export class Menus {
  constructor(bus, callbacks = {}) {
    this.bus = bus;
    this.cb = callbacks;
    this._wireButtons();
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  // Phase 8: open the settings modal. Exposed so main.js can wire it to a key.
  openSettings() {
    if (this.cb.onOpenSettings) this.cb.onOpenSettings();
  }

  _wireButtons() {
    const bind = (el, fn) => {
      if (!el) return;
      // Fire on both click and touchend (mobile fallback)
      const handler = (e) => { e.preventDefault(); fn(); };
      el.addEventListener('click', handler);
      el.addEventListener('touchend', handler, { passive: false });
    };

    bind(document.getElementById('start-btn'),     () => this.cb.onStart   && this.cb.onStart());
    bind(document.getElementById('resume-btn'),    () => this.cb.onResume  && this.cb.onResume());
    bind(document.getElementById('restart-btn'),   () => this.cb.onRestart && this.cb.onRestart());
    bind(document.getElementById('end-restart-btn'), () => this.cb.onRestart && this.cb.onRestart());

    const share = document.getElementById('end-share-btn');
    if (share) share.onclick = () => {
      const url = new URL(location.href);
      const seedEl = document.getElementById('end-seed');
      const s = seedEl ? seedEl.textContent : '';
      // Phase 19+: prefer the new map code (zone:seed) when set, fall
      // back to legacy ?seed= for back-compat.
      if (state.mapCode) {
        url.searchParams.set('map', state.mapCode);
      } else if (s && s !== '—') {
        url.searchParams.set('seed', s);
      }
      navigator.clipboard?.writeText(url.toString());
      share.textContent = 'Kopiert!';
      setTimeout(() => { share.textContent = 'Seed teilen'; }, 1500);
    };

    const mute = document.getElementById('mute-btn');
    if (mute) mute.onclick = () => {
      import('../engine/audio.js').then((m) => {
        const muted = m.toggleMute();
        const label = document.getElementById('mute-label');
        if (label) label.textContent = muted ? 'Stumm: AN' : 'Stumm: AUS';
        if (window.__updateMuteIcon) window.__updateMuteIcon(muted);
      });
    };

    // Pause hierarchy (Phase 5): Resume / Settings / Quit
    const pauseQuit = document.getElementById('pause-quit-btn');
    if (pauseQuit) pauseQuit.onclick = () => this.cb.onRestart && this.cb.onRestart();
    const pauseSettings = document.getElementById('pause-settings-btn');
    if (pauseSettings) pauseSettings.onclick = () => this.openSettings();
  }

  _apply(screen) {
    // Hide all overlay panels first.
    Object.values(PANELS).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const showId = PANELS[screen];
    if (showId) {
      const el = document.getElementById(showId);
      if (el) el.style.display = 'flex';
    }
  }

  showEndscreen({ win, time, kills, crystals, seed, score }) {
    const el = document.getElementById('end-screen');
    if (!el) return;
    el.style.display = 'flex';
    // Preserve the trophy icon; only swap the text portion of the h1.
    const h1 = el.querySelector('h1');
    if (h1) {
      // Find or create the text label span
      let label = h1.querySelector('.end-label');
      if (!label) {
        label = document.createElement('span');
        label.className = 'end-label';
        h1.appendChild(label);
      }
      label.innerHTML = win ? 'Demo <span>abgeschlossen</span>' : 'Demo <span>beendet</span>';
    }
    document.getElementById('end-time').textContent = Math.round(time) + 's';
    document.getElementById('end-kills').textContent = kills;
    document.getElementById('end-crystals').textContent = crystals;
    const seedEl = document.getElementById('end-seed');
    if (seedEl) seedEl.textContent = seed ?? '—';
    const scoreEl = document.getElementById('end-score');
    if (scoreEl) scoreEl.textContent = score ?? 0;
  }
}
