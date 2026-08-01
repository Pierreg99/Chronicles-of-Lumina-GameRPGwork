// ui/dialog-panel.js — bottom-center dialog (who + text). Auto-hides via
// timer OR stays open with choice buttons until one is picked.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG]);

export class DialogPanel {
  constructor(bus) {
    this.bus = bus;
    this._hideTimer = null;
    this.el = document.getElementById('dialog');
    // The .who div now contains an icon span + a .who-name span.
    // We only update the name span so the icon stays intact.
    this.whoEl = this.el && this.el.querySelector('.who-name');
    this.textEl = this.el && this.el.querySelector('.text');
    this.choicesHost = document.createElement('div');
    this.choicesHost.id = 'dialog-choices';
    Object.assign(this.choicesHost.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      marginTop: '8px',
    });
    if (this.el) this.el.appendChild(this.choicesHost);

    bus.on(EVENTS.DIALOG_OPEN, (msg) => this.show(msg));
    bus.on(EVENTS.DIALOG_CLOSE, () => this.hide());
    bus.on(EVENTS.DIALOG_CHOICE, () => this.hide());

    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _apply(screen) {
    if (!this.el) return;
    if (!VISIBLE_SCREENS.has(screen)) this.hide();
  }

  show(msg) {
    if (!this.el) return;
    if (this.whoEl) this.whoEl.textContent = msg.who;
    if (this.textEl) this.textEl.textContent = msg.text;
    this.choicesHost.innerHTML = '';
    if (msg.choices && msg.choices.length) {
      for (const c of msg.choices) {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = c.label;
        btn.onclick = () => this.bus.emit(EVENTS.DIALOG_CHOICE_REQUEST, { id: c.id });
        this.choicesHost.appendChild(btn);
      }
    }
    this.el.style.display = 'block';
    clearTimeout(this._hideTimer);
    if (!msg.choices) {
      this._hideTimer = setTimeout(() => this.hide(), 4500);
    }
  }

  hide() {
    if (this.el) this.el.style.display = 'none';
    if (this.choicesHost) this.choicesHost.innerHTML = '';
  }
}
