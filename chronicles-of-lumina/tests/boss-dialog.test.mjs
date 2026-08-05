// tests/boss-dialog.test.mjs — boss intro/taunt/death text.
import './_setup.mjs';
import {
  getBossDialog, listBossDialogs, listBossesByZone, totalBosses,
  getRandomTaunt, getBossPhaseText, bossTier, bossesByDifficulty,
} from '../src/systems/boss-dialog.js';
import { test, group, assert } from './_runner.mjs';

group('boss registry', () => {
  test('has 15+ bosses', () => {
    assert.truthy(totalBosses() >= 15, `only ${totalBosses()}`);
  });

  test('every boss has id, name, zone, intro, taunts, deathText, defeatedBy, stats', () => {
    for (const b of listBossDialogs()) {
      assert.truthy(b.id);
      assert.truthy(b.name);
      assert.truthy(b.zone);
      assert.truthy(b.intro);
      assert.truthy(Array.isArray(b.taunts) && b.taunts.length >= 1);
      assert.truthy(b.deathText);
      assert.truthy(b.defeatedBy);
      assert.truthy(b.stats);
      assert.truthy(b.stats.hp > 0);
      assert.truthy(b.stats.damage > 0);
    }
  });

  test('has at least 5 story bosses (architect + 4 biome bosses)', () => {
    const architect = getBossDialog('the_architect');
    assert.truthy(architect);
    // 4 main biome bosses + 1 architect
    const main = ['mist_colossus', 'sand_king', 'frost_lord', 'mire_mother', 'the_architect'];
    for (const id of main) {
      assert.truthy(getBossDialog(id), `${id} missing`);
    }
  });

  test('has at least 5 secret mini-bosses', () => {
    const secrets = ['ancient_treant', 'crystal_king', 'lava_forger', 'sky_seraph', 'kraken_lord', 'shadow_self', 'void_treant', 'crystal_warden', 'temple_guardian', 'shadow_lord'];
    for (const id of secrets) {
      assert.truthy(getBossDialog(id), `${id} missing`);
    }
  });
});

group('zone distribution', () => {
  test('every biome has at least 1 boss', () => {
    const zones = ['verdant', 'dunes', 'peaks', 'mire', 'ember', 'crystal', 'sky', 'reef', 'haunted', 'void'];
    for (const z of zones) {
      const list = listBossesByZone(z);
      assert.truthy(list.length >= 1, `${z} has 0 bosses`);
    }
  });
});

group('getRandomTaunt', () => {
  test('returns one of the boss taunts', () => {
    const taunt = getRandomTaunt('the_architect');
    const boss = getBossDialog('the_architect');
    assert.truthy(boss.taunts.includes(taunt));
  });

  test('returns null for unknown boss', () => {
    assert.equal(getRandomTaunt('not_a_boss'), null);
  });

  test('returns null for boss without taunts (defensive)', () => {
    const boss = getBossDialog('the_architect');
    const orig = boss.taunts;
    boss.taunts = [];
    assert.equal(getRandomTaunt('the_architect'), null);
    boss.taunts = orig;
  });
});

group('getBossPhaseText', () => {
  test('returns intro text', () => {
    const text = getBossPhaseText('the_architect', 'intro');
    assert.truthy(text);
    assert.truthy(text.length > 0);
  });

  test('returns death text', () => {
    const text = getBossPhaseText('the_architect', 'death');
    assert.truthy(text);
  });

  test('returns victory text', () => {
    const text = getBossPhaseText('the_architect', 'victory');
    assert.truthy(text);
  });

  test('returns a taunt', () => {
    const text = getBossPhaseText('the_architect', 'taunt');
    assert.truthy(text);
  });

  test('returns null for unknown phase', () => {
    assert.equal(getBossPhaseText('the_architect', 'not_a_phase'), null);
  });

  test('returns null for unknown boss', () => {
    assert.equal(getBossPhaseText('not_a_boss', 'intro'), null);
  });
});

group('bossTier', () => {
  test('architect is story tier', () => {
    assert.equal(bossTier('the_architect'), 'story');
  });

  test('mist_colossus is at least hard', () => {
    assert.truthy(['hard', 'story'].includes(bossTier('mist_colossus')));
  });

  test('unknown boss returns unknown', () => {
    assert.equal(bossTier('not_a_boss'), 'unknown');
  });
});

group('bossesByDifficulty', () => {
  test('returns bosses sorted by hp+damage*2', () => {
    const sorted = bossesByDifficulty();
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].stats.hp + sorted[i - 1].stats.damage * 2;
      const cur = sorted[i].stats.hp + sorted[i].stats.damage * 2;
      assert.truthy(prev <= cur);
    }
  });

  test('architect is among the hardest', () => {
    const sorted = bossesByDifficulty();
    const lastThree = sorted.slice(-3);
    const architectInLast = lastThree.find((b) => b.id === 'the_architect');
    assert.truthy(architectInLast);
  });
});
