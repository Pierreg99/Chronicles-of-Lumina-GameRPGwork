// systems/magic.js — spell schools + spell registry + cast/regen.
//
// Three schools (Feuer, Eis, Blitz) with 4 spells each (12 total).
// Each spell has: school, name, description, manaCost, cooldownSec,
// damage (or heal), range, aoe, kind ('damage' | 'heal' | 'buff' |
// 'utility'), particle color, and any per-spell flags.

export const SPELL_SCHOOLS = Object.freeze({
  FIRE:  { id: 'fire',  name: 'Feuer',  color: '#FF6B35', particle: '#FF8855' },
  ICE:   { id: 'ice',   name: 'Eis',    color: '#60A5FA', particle: '#A8DDEE' },
  LIGHTNING: { id: 'lightning', name: 'Blitz', color: '#FCD34D', particle: '#FFE066' },
});

const SPELLS = {
  // ── Feuer (4) ──
  fireball:     { id: 'fireball',     school: 'fire',  name: 'Feuerball',     desc: 'Schleudert einen Feuerball auf einen Gegner.',              kind: 'damage',   manaCost: 8,  cooldownSec: 1.5, damage: 4, range: 12, aoe: 0,  level: 1 },
  ignite:       { id: 'ignite',       school: 'fire',  name: 'Entzünden',     desc: 'Setzt einen Gegner in Brand (DOT).',                      kind: 'damage',   manaCost: 6,  cooldownSec: 2.0, damage: 2, range: 8,  aoe: 0,  level: 1, dot: { duration: 4, tick: 1 } },
  firewall:     { id: 'firewall',     school: 'fire',  name: 'Feuerwand',     desc: 'Erzeugt eine Flammenwand, die Gegner zurückschleudert.', kind: 'utility',  manaCost: 12, cooldownSec: 6.0, damage: 3, range: 0,  aoe: 4,  level: 2, knockback: 5 },
  meteor:       { id: 'meteor',       school: 'fire',  name: 'Meteor',        desc: 'Lässt einen Meteoriten auf ein Gebiet einschlagen.',     kind: 'damage',   manaCost: 30, cooldownSec: 12.0, damage: 18, range: 16, aoe: 5, level: 3 },

  // ── Eis (4) ──
  frostbolt:    { id: 'frostbolt',    school: 'ice',   name: 'Frostblitz',    desc: 'Ein einzelner Eis-Schuss, der verlangsamt.',             kind: 'damage',   manaCost: 6,  cooldownSec: 1.0, damage: 3, range: 14, aoe: 0,  level: 1, slow: 0.5 },
  iceshield:    { id: 'iceshield',    school: 'ice',   name: 'Eisschild',     desc: 'Hüllt den Spieler in einen Eisschild (Schadensreduktion).', kind: 'buff', manaCost: 10, cooldownSec: 8.0, range: 0,  aoe: 0, level: 1, duration: 6, damageReduction: 0.5 },
  blizzard:     { id: 'blizzard',     school: 'ice',   name: 'Blizzard',      desc: 'Ein Schneesturm, der allen im Bereich Schaden zufügt.', kind: 'damage',   manaCost: 22, cooldownSec: 9.0, damage: 6, range: 0,  aoe: 8,  level: 2, slow: 0.3 },
  frozentomb:   { id: 'frozentomb',   school: 'ice',   name: 'Frostgrab',     desc: 'Friert einen Gegner für 4 Sekunden ein.',               kind: 'damage',   manaCost: 14, cooldownSec: 7.0, damage: 5, range: 6,  aoe: 0,  level: 2, freeze: 4.0 },

  // ── Blitz (4) ──
  spark:        { id: 'spark',        school: 'lightning', name: 'Funke',     desc: 'Schneller Blitz, der nahestehende Gegner trifft.',     kind: 'damage',   manaCost: 4,  cooldownSec: 0.5, damage: 2, range: 6,  aoe: 2,  level: 1 },
  heal:         { id: 'heal',         school: 'lightning', name: 'Heilung',   desc: 'Heilt den Spieler sofort um X HP.',                     kind: 'heal',     manaCost: 12, cooldownSec: 5.0, heal: 6,    range: 0,  aoe: 0,  level: 1 },
  lightningbolt:{ id: 'lightningbolt',school: 'lightning', name: 'Blitzschlag',desc: 'Ein einzelner starker Blitz.',                          kind: 'damage',   manaCost: 14, cooldownSec: 3.0, damage: 9, range: 18, aoe: 0,  level: 2 },
  timewarp:     { id: 'timewarp',     school: 'lightning', name: 'Zeitverzerrung', desc: 'Verlangsamt alle Gegner in Reichweite (2x Slowmo).',kind: 'utility',  manaCost: 20, cooldownSec: 15.0, range: 0,  aoe: 10, level: 3, duration: 4, slowFactor: 0.5 },
};

export function getSpell(id) { return SPELLS[id] || null; }
export function listSpells() { return Object.values(SPELLS); }
export function listSpellsBySchool(schoolId) {
  return Object.values(SPELLS).filter((s) => s.school === schoolId);
}

/**
 * Try to cast a spell. Returns { ok, reason, spell } where reason
 * is the failure string if ok is false.
 * @param {string} spellId
 * @param {object} state — game state with .mana, .spellCooldowns
 * @param {number} now — current time (sec)
 */
export function tryCast(spellId, state, now) {
  const spell = SPELLS[spellId];
  if (!spell) return { ok: false, reason: 'unknown_spell', spell: null };

  state.spellCooldowns = state.spellCooldowns || {};
  const cdEnd = state.spellCooldowns[spellId] || 0;
  if (now < cdEnd) {
    return { ok: false, reason: 'on_cooldown', spell, remaining: cdEnd - now };
  }
  if ((state.mana || 0) < spell.manaCost) {
    return { ok: false, reason: 'no_mana', spell };
  }

  // Success — deduct mana, set cooldown
  state.mana -= spell.manaCost;
  state.spellCooldowns[spellId] = now + spell.cooldownSec;
  return { ok: true, reason: null, spell };
}

/**
 * Regenerate mana over time. Caps at maxMana (caller-provided).
 * @param {object} state
 * @param {number} dt
 * @param {number} maxMana
 * @param {number} regenPerSec
 */
export function regenMana(state, dt, maxMana, regenPerSec) {
  state.mana = Math.min(maxMana, (state.mana || 0) + regenPerSec * dt);
}

/**
 * Map a spell to its dominant particle color (for the existing
 * particle system).
 * @param {string} spellId
 * @returns {string} hex color
 */
export function spellParticleColor(spellId) {
  const spell = SPELLS[spellId];
  if (!spell) return '#ffffff';
  return SPELL_SCHOOLS[spell.school.toUpperCase()]?.particle || '#ffffff';
}

/**
 * Map a spell to the kind of effect (used by the cast handler to
 * decide what to do — apply damage, heal, AoE, etc.)
 */
export function spellKind(spellId) {
  return SPELLS[spellId]?.kind || 'damage';
}

/**
 * Group spells by school for UI.
 * @returns {Record<string, object[]>}
 */
export function groupSpellsBySchool() {
  const out = {};
  for (const s of Object.values(SPELLS)) {
    if (!out[s.school]) out[s.school] = [];
    out[s.school].push(s);
  }
  return out;
}
