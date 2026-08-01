// entities/player-combat.js — helpers around the player's hit / hurt flow.
// Kept as its own module so combat tuning can grow without touching Player.

import { state } from '../core/state.js';

export function applyHit(player, dmg) {
  const ok = player.takeDamage(dmg);
  if (ok) state.damageDealt = (state.damageDealt || 0) + 0; // placeholder for future tracking
  return ok;
}

export function onEnemyKilled(player, xpAmount) {
  player.kills = (player.kills || 0) + 1;
  state.killed[state.killed._last || 'slime_blue'] = (state.killed[state.killed._last || 'slime_blue'] || 0);
}
