// systems/interaction-system.js — handles E key for shrine and elder.

import { EVENTS } from '../core/constants.js';
import { state } from '../core/state.js';

export class InteractionSystem {
  constructor({ bus, player, shrine, elder, dialogueSystem, questSystem }) {
    this.bus = bus;
    this.player = player;
    this.shrine = shrine;
    this.elder = elder;
    this.dialogueSystem = dialogueSystem;
    this.questSystem = questSystem;
  }

  // Returns 'shrine' | 'elder' | null
  nearestInteractable() {
    if (!this.player) return null;
    const pp = this.player.position;
    if (this.shrine && this.shrine.group) {
      if (pp.distanceTo(this.shrine.group.position) < 4.5) return 'shrine';
    }
    if (this.elder) {
      if (pp.distanceTo(this.elder.position) < 3) return 'elder';
    }
    return null;
  }

  interact() {
    const target = this.nearestInteractable();
    if (!target) return;
    if (target === 'shrine') return this._onShrine();
    if (target === 'elder') return this._onElder();
  }

  _onShrine() {
    if (!this.questSystem.isReady()) {
      this.dialogueSystem.say('Schrein', `Der Schrein ist noch verdorben. Ihm fehlen ${this.questSystem.target - this.questSystem.crystals} Lichtkristalle.`);
      return;
    }
    if (state.bossActive && !this.bossDefeated()) {
      this.dialogueSystem.say('Schrein', 'Der Nebel-Koloss blockiert den Schrein! Besiege ihn zuerst.');
      return;
    }
    this.bus.emit(EVENTS.SHRINE_CLEANSE);
  }

  _onElder() {
    this.dialogueSystem.startIntro();
  }

  bossDefeated() { return state.bossDefeated; }
}
