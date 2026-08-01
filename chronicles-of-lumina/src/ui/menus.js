// ui/menus.js — start / pause / end screens + their buttons.

import { EVENTS } from '../core/constants.js';

export class Menus {
  constructor(bus, onStart, onRestart, onResume) {
    this.bus = bus;
    this.onStart = onStart;
    this.onRestart = onRestart;
    this.onResume = onResume;
    this._wire();
  }

  _wire() {
    const start = document.getElementById('start-btn');
    if (start) start.onclick = () => this.onStart && this.onStart();

    const resume = document.getElementById('resume-btn');
    if (resume) resume.onclick = () => this.onResume && this.onResume();

    const restart = document.getElementById('restart-btn');
    if (restart) restart.onclick = () => this.onRestart && this.onRestart();

    const endRestart = document.getElementById('end-restart-btn');
    if (endRestart) endRestart.onclick = () => this.onRestart && this.onRestart();

    const mute = document.getElementById('mute-btn');
    if (mute) mute.onclick = () => {
      import('../engine/audio.js').then((m) => {
        const muted = m.toggleMute();
        mute.textContent = muted ? 'Stumm: AN' : 'Stumm: AUS';
      });
    };
  }

  show(panel) {
    const el = document.getElementById(panel + '-screen');
    if (el) el.style.display = 'flex';
  }

  hide(panel) {
    const el = document.getElementById(panel + '-screen');
    if (el) el.style.display = 'none';
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
