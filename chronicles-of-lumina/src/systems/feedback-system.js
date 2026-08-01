// systems/feedback-system.js — central feedback API.
// Phase R1: takes `game`.
// Phase R7: takes `settings` (DI) so tests can inject a fresh instance.

import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';

export class FeedbackSystem {
  constructor(game, settings) {
    this.game = game;
    this.bus = game.bus;
    this.hitstop = game.hitstop;
    this.settings = settings;
    this.timeScale = 1.0;
    this._slowmoTimer = 0;
  }

  _reduceMotion() { return !!(this.settings && this.settings.get('reduceMotion')); }

  hitstopSmall() { this.hitstop.freeze(CONFIG.feedback.hitstopSmall); this.bus.emit(EVENTS.HITSTOP, { size: 'small' }); }
  hitstopBig()   { this.hitstop.freeze(CONFIG.feedback.hitstopBig);   this.bus.emit(EVENTS.HITSTOP, { size: 'big' }); }
  hitstopBoss()  { this.hitstop.freeze(CONFIG.feedback.hitstopBoss);  this.bus.emit(EVENTS.HITSTOP, { size: 'boss' }); }

  shakeSmall()  { if (!this._reduceMotion()) this.bus.emit(EVENTS.SHAKE, CONFIG.feedback.shakeSmall); }
  shakeMedium() { if (!this._reduceMotion()) this.bus.emit(EVENTS.SHAKE, CONFIG.feedback.shakeMedium); }
  shakeBig()    { if (!this._reduceMotion()) this.bus.emit(EVENTS.SHAKE, CONFIG.feedback.shakeBig); }

  flashDamage() { this.bus.emit(EVENTS.FLASH, CONFIG.feedback.flashDamage); }

  slowmoSlam() {
    if (this._reduceMotion()) return;
    this.timeScale = CONFIG.feedback.slowmoSlam.factor;
    this._slowmoTimer = CONFIG.feedback.slowmoSlam.duration;
    this.bus.emit(EVENTS.SLOWMO, { factor: this.timeScale, duration: this._slowmoTimer });
  }

  cameraKick(direction, intensity = 0.5, duration = 0.22) {
    if (this._reduceMotion()) return;
    this.bus.emit(EVENTS.CAMERA_KICK, { direction, intensity, duration });
  }

  update(dt) {
    if (this.timeScale !== 1.0) {
      this._slowmoTimer -= dt;
      if (this._slowmoTimer <= 0) this.timeScale = 1.0;
    }
  }
}
