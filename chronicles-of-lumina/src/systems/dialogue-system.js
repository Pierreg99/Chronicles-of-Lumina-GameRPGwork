// systems/dialogue-system.js — small queue of dialog lines + 4s display.
// Phase R1: takes `game`.

import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';

export class DialogueSystem {
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    this.queue = [];
    this.current = null;
    this.until = 0;
    this._hasChoices = false;
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

  say(who, text, choices = null) {
    this.current = { who, text, choices: choices || null };
    this._hasChoices = !!(choices && choices.length);
    this.until = this._hasChoices ? Infinity : (performance.now() / 1000 + 4.5);
    this.bus.emit(EVENTS.DIALOG_OPEN, this.current);
  }

  pickChoice(id) {
    if (!this.current || !this.current.choices) return;
    const choice = this.current.choices.find((c) => c.id === id);
    if (!choice) return;
    this.bus.emit(EVENTS.DIALOG_CHOICE, { id, who: this.current.who });
    choice.onPick && choice.onPick(id);
    this.current = null;
    this._hasChoices = false;
    this.bus.emit(EVENTS.DIALOG_CLOSE);
  }

  update() {
    if (this.current && !this._hasChoices && performance.now() / 1000 > this.until) {
      this.current = null;
      this.bus.emit(EVENTS.DIALOG_CLOSE);
    }
  }
}
