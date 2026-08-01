// systems/feedback-system.js — central feedback API.
//
// Provides a single point through which any system can request:
//   - hit-stop  (small, medium, big — from config.feedback.hitstop*)
//   - shake     (intensity + duration)
//   - flash     (color overlay, via separate ui/feedback-overlay.js later)
//   - slowmo    (time scale)
//
// The actual visual application lives in main.js (which owns the camera and
// game loop). This class is just a clean façade so systems don't have to know
// about config keys, event names, or how to read time-scale.

import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';
import { settings } from '../core/settings.js';

export class FeedbackSystem {
  constructor(bus, hitstop) {
    this.bus = bus;
    this.hitstop = hitstop;
    this.timeScale = 1.0;
    this._slowmoTimer = 0;
  }

  _reduceMotion() { return !!settings.get('reduceMotion'); }

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

  // Phase 2: camera kick. The cameraRig subscribes to a kickRequested payload
  // and applies it as an additive offset that decays. direction is a Vector3.
  cameraKick(direction, intensity = 0.5, duration = 0.22) {
    if (this._reduceMotion()) return;
    this.bus.emit(EVENTS.CAMERA_KICK, { direction, intensity, duration });
  }

  // Called every frame; recovers time scale to 1.0 when timer expires.
  update(dt) {
    if (this.timeScale !== 1.0) {
      this._slowmoTimer -= dt;
      if (this._slowmoTimer <= 0) this.timeScale = 1.0;
    }
  }
}
