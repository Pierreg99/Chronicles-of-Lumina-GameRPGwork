// ui/menus.js — start / pause / end screens. Listens to screen-state
// changes and shows/hides overlays declaratively. The DOM is no longer
// poked from main.js for these panels.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN, transition } from '../core/screen-state.js';

const PANELS = {
  [SCREEN.START]:     'start-screen',
  [SCREEN.PAUSED]:    'pause-screen',
  [SCREEN.ENDScreen]: 'end-screen',
};

export class Menus {
  constructor(bus, callbacks = {}) {
    this.bus = bus;
    this.cb = callbacks;
    this._wireButtons();
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _wireButtons() {
    const start = document.getElementById('start-btn');
    if (start) start.onclick = () => this.cb.onStart && this.cb.onStart();

    const resume = document.getElementById('resume-btn');
    if (resume) resume.onclick = () => this.cb.onResume && this.cb.onResume();

    const restart = document.getElementById('restart-btn');
    if (restart) restart.onclick = () => this.cb.onRestart && this.cb.onRestart();

    const endRestart = document.getElementById('end-restart-btn');
    if (endRestart) endRestart.onclick = () => this.cb.onRestart && this.cb.onRestart();

    const mute = document.getElementById('mute-btn');
    if (mute) mute.onclick = () => {
      import('../engine/audio.js').then((m) => {
        const muted = m.toggleMute();
        mute.textContent = muted ? 'Stumm: AN' : 'Stumm: AUS';
      });
    };
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

  showEndscreen({ win, time, kills, crystals }) {
    const el = document.getElementById('end-screen');
    if (!el) return;
    el.style.display = 'flex';
    el.querySelector('h1').innerHTML = win ? 'Demo <span>abgeschlossen</span>' : 'Demo <span>beendet</span>';
    document.getElementById('end-time').textContent = Math.round(time) + 's';
    document.getElementById('end-kills').textContent = kills;
    document.getElementById('end-crystals').textContent = crystals;
  }
}
