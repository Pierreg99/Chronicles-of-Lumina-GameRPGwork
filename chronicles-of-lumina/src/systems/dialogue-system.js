// systems/dialogue-system.js — small queue of dialog lines + 4s display.

import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';

export class DialogueSystem {
  constructor(bus) {
    this.bus = bus;
    this.queue = [];
    this.current = null;
    this.until = 0;
  }

  startIntro() {
    this.say('Dorfälteste', CONFIG.quest.elderIntro.join(' '));
  }

  bossWarning() {
    this.say('Nebel-Koloss', CONFIG.quest.bossWarning.join(' '));
  }

  bossDefeated() {
    this.say('Nebel-Koloss', 'Der Wächter ist besiegt! Der Schrein liegt vor dir.');
  }

  victory() {
    this.say('Dorfälteste', CONFIG.quest.victory.join(' '));
  }

  say(who, text) {
    this.current = { who, text };
    this.until = performance.now() / 1000 + 4.5;
    this.bus.emit(EVENTS.DIALOG_OPEN, this.current);
  }

  update() {
    if (this.current && performance.now() / 1000 > this.until) {
      this.current = null;
      this.bus.emit(EVENTS.DIALOG_CLOSE);
    }
  }

  get current2() { return this.current; }
}
