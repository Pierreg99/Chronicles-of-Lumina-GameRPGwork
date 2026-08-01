// ui/dialog-panel.js — bottom-center dialog (who + text). Auto-hides via timer.

import { EVENTS } from '../core/constants.js';

export class DialogPanel {
  constructor(bus) {
    this.bus = bus;
    this._hideTimer = null;
    bus.on(EVENTS.DIALOG_OPEN, (msg) => this.show(msg.who, msg.text));
    bus.on(EVENTS.DIALOG_CLOSE, () => this.hide());
  }

  show(who, text) {
    const el = document.getElementById('dialog');
    if (!el) return;
    el.querySelector('.who').textContent = who;
    el.querySelector('.text').textContent = text;
    el.style.display = 'block';
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => this.hide(), 4500);
  }

  hide() {
    const el = document.getElementById('dialog');
    if (el) el.style.display = 'none';
  }
}
