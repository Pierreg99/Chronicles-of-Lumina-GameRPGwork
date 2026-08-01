// entities/player-animation.js — pure data: animation tween state for the player.
// Currently the player does its own tweening inline; this module is a thin
// extension point so additional animations (emotes, casting) can plug in later.

export class PlayerAnimation {
  constructor(player) {
    this.player = player;
    this.emotes = [];
  }

  playEmote(name, duration = 1.5) {
    this.emotes.push({ name, until: performance.now() / 1000 + duration });
  }

  update(dt) {
    const now = performance.now() / 1000;
    this.emotes = this.emotes.filter((e) => e.until > now);
  }
}
