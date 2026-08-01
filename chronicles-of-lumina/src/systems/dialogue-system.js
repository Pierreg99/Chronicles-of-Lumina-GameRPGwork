// systems/dialogue-system.js — small queue of dialog lines + 4s display.
// Phase R1: takes `game`.

import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';
import { t } from '../core/i18n.js';

/**
 * @typedef {import('../core/game.js').Game} Game
 *
 * @typedef {object} DialogLine
 * @property {string} who
 * @property {string} text
 * @property {Array<{id:string,label:string,onPick?:(id:string)=>void}>|null} choices
 */

/**
 * Tiny dialog queue with auto-dismiss after 4.5 s (or until a choice is picked).
 * @see EVENTS.DIALOG_OPEN
 * @see EVENTS.DIALOG_CHOICE
 * @see EVENTS.DIALOG_CLOSE
 */
export class DialogueSystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    /** @type {Array<DialogLine>} reserved queue (not used by current say() flow). */
    this.queue = [];
    /** @type {DialogLine|null} */
    this.current = null;
    this.until = 0;
    this._hasChoices = false;
  }

  startIntro() {
    // Pull from config if non-empty, otherwise the localized string.
    const text = (CONFIG.quest.elderIntro?.length)
      ? CONFIG.quest.elderIntro.join(' ')
      : t('dialog.elder_intro');
    this.say(t('dialog.speakers.elder'), text);
  }

  bossWarning() {
    const text = (CONFIG.quest.bossWarning?.length)
      ? CONFIG.quest.bossWarning.join(' ')
      : t('dialog.boss_warning');
    this.say(t('dialog.speakers.colossus'), text);
  }

  bossDefeated() {
    this.say(t('dialog.speakers.colossus'), t('dialog.boss_defeated'));
  }

  victory() {
    const text = (CONFIG.quest.victory?.length)
      ? CONFIG.quest.victory.join(' ')
      : t('dialog.victory');
    this.say(t('dialog.speakers.elder'), text);
  }

  /**
   * Show a single line in the dialog panel. Lines with `choices` stay open
   * until a choice is picked; plain lines auto-dismiss after 4.5 s.
   * @param {string} who
   * @param {string} text
   * @param {Array<{id:string,label:string,onPick?:(id:string)=>void}>|null} [choices]
   * @returns {void}
   */
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
