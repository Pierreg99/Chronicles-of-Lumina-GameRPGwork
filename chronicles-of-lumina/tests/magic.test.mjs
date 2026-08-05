// tests/magic.test.mjs — magic system: schools, spells, cast, regen.
import './_setup.mjs';
import {
  SPELL_SCHOOLS, getSpell, listSpells, listSpellsBySchool,
  tryCast, regenMana, spellParticleColor, spellKind, groupSpellsBySchool,
} from '../src/systems/magic.js';
import { test, group, assert } from './_runner.mjs';

group('spell schools', () => {
  test('has 3 schools with id/name/color/particle', () => {
    assert.equal(Object.keys(SPELL_SCHOOLS).length, 3);
    for (const s of Object.values(SPELL_SCHOOLS)) {
      assert.truthy(s.id);
      assert.truthy(s.name);
      assert.truthy(s.color.startsWith('#'));
      assert.truthy(s.particle.startsWith('#'));
    }
  });
});

group('spell registry', () => {
  test('has 12 spells (4 per school)', () => {
    assert.equal(listSpells().length, 12);
    assert.equal(listSpellsBySchool('fire').length, 4);
    assert.equal(listSpellsBySchool('ice').length, 4);
    assert.equal(listSpellsBySchool('lightning').length, 4);
  });

  test('every spell has required fields', () => {
    for (const s of listSpells()) {
      assert.truthy(s.id, 'id');
      assert.truthy(s.school, 'school');
      assert.truthy(SPELL_SCHOOLS[s.school.toUpperCase()], 'school is valid');
      assert.truthy(s.name, 'name');
      assert.truthy(s.desc, 'desc');
      assert.truthy(['damage', 'heal', 'buff', 'utility'].includes(s.kind), 'kind');
      assert.truthy(s.manaCost > 0, 'manaCost positive');
      assert.truthy(s.cooldownSec > 0, 'cooldownSec positive');
    }
  });

  test('mana costs scale with power', () => {
    const fireball = getSpell('fireball');   // level 1
    const meteor   = getSpell('meteor');     // level 3
    assert.truthy(meteor.manaCost > fireball.manaCost,
      `meteor ${meteor.manaCost} should cost more than fireball ${fireball.manaCost}`);
  });

  test('getSpell returns null for unknown', () => {
    assert.equal(getSpell('not_a_spell'), null);
  });
});

group('tryCast', () => {
  test('success: deducts mana, sets cooldown', () => {
    const state = { mana: 50, spellCooldowns: {} };
    const result = tryCast('fireball', state, 0);
    assert.truthy(result.ok);
    assert.equal(state.mana, 50 - 8);
    assert.truthy(state.spellCooldowns.fireball > 0);
  });

  test('fails with no_mana when mana is too low', () => {
    const state = { mana: 3, spellCooldowns: {} };
    const result = tryCast('fireball', state, 0);
    assert.falsy(result.ok);
    assert.equal(result.reason, 'no_mana');
    assert.equal(state.mana, 3);
  });

  test('fails on cooldown', () => {
    const state = { mana: 50, spellCooldowns: { fireball: 5 } };
    const result = tryCast('fireball', state, 3);
    assert.falsy(result.ok);
    assert.equal(result.reason, 'on_cooldown');
    assert.equal(state.mana, 50); // mana not deducted
  });

  test('succeeds after cooldown expires', () => {
    const state = { mana: 50, spellCooldowns: { fireball: 5 } };
    const result = tryCast('fireball', state, 6);
    assert.truthy(result.ok);
  });

  test('returns unknown_spell for invalid id', () => {
    const state = { mana: 50, spellCooldowns: {} };
    const result = tryCast('not_a_spell', state, 0);
    assert.falsy(result.ok);
    assert.equal(result.reason, 'unknown_spell');
  });
});

group('regenMana', () => {
  test('regenerates mana over time', () => {
    const state = { mana: 10 };
    regenMana(state, 1.0, 20, 5); // 1s @ 5/sec = +5
    assert.equal(state.mana, 15);
  });

  test('caps at maxMana', () => {
    const state = { mana: 18 };
    regenMana(state, 5.0, 20, 5); // would add 25, but capped
    assert.equal(state.mana, 20);
  });

  test('handles zero mana + zero dt', () => {
    const state = { mana: 0 };
    regenMana(state, 0, 20, 5);
    assert.equal(state.mana, 0);
  });
});

group('spell helpers', () => {
  test('spellParticleColor returns school color', () => {
    assert.equal(spellParticleColor('fireball'), SPELL_SCHOOLS.FIRE.particle);
    assert.equal(spellParticleColor('frostbolt'), SPELL_SCHOOLS.ICE.particle);
  });

  test('spellKind returns the spell kind', () => {
    assert.equal(spellKind('fireball'), 'damage');
    assert.equal(spellKind('heal'), 'heal');
    assert.equal(spellKind('iceshield'), 'buff');
    assert.equal(spellKind('timewarp'), 'utility');
  });

  test('groupSpellsBySchool returns 3 groups', () => {
    const grouped = groupSpellsBySchool();
    assert.equal(Object.keys(grouped).length, 3);
    assert.equal(grouped.fire.length, 4);
    assert.equal(grouped.ice.length, 4);
    assert.equal(grouped.lightning.length, 4);
  });
});
