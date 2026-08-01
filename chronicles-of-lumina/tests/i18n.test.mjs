// tests/i18n.test.mjs — i18n module + key coverage between DE and EN locales.
import './_setup.mjs';
import { t, setLocale, getLocale, availableLocales } from '../src/core/i18n.js';
import de from '../src/locales/de.json' with { type: 'json' };
import en from '../src/locales/en.json' with { type: 'json' };
import { test, group, assert, done } from './_runner.mjs';

// Walk a nested object and yield every leaf string + its dotted path.
function* walk(prefix, obj) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') yield* walk(path, v);
    else if (typeof v === 'string') yield [path, v];
  }
}

group('i18n', () => {
  test('availableLocales() includes de and en', () => {
    const list = availableLocales();
    assert.truthy(list.includes('de'));
    assert.truthy(list.includes('en'));
  });

  test('getLocale() returns a valid locale', () => {
    const loc = getLocale();
    assert.truthy(['de', 'en'].includes(loc));
  });

  test('setLocale() switches and persists', () => {
    setLocale('en');
    assert.equal(getLocale(), 'en');
    assert.equal(t('ui.startBtn'), 'Begin adventure');
    setLocale('de');
    assert.equal(getLocale(), 'de');
    assert.equal(t('ui.startBtn'), 'Abenteuer beginnen');
  });

  test('t() supports {param} interpolation', () => {
    setLocale('de');
    assert.equal(t('hud.questCount', { current: 3, target: 10 }), '3 / 10');
  });

  test('t() falls back to key when missing in both locales', () => {
    assert.equal(t('this.key.does.not.exist'), 'this.key.does.not.exist');
  });

  test('all DE keys have a matching EN key (no orphans)', () => {
    const deKeys = new Set(Array.from(walk('', de)).map(([p]) => p));
    const enKeys = new Set(Array.from(walk('', en)).map(([p]) => p));
    const missingInEN = [...deKeys].filter((k) => !enKeys.has(k));
    const extraInEN  = [...enKeys].filter((k) => !deKeys.has(k));
    assert.deepEqual(missingInEN, [], `DE keys missing in EN: ${missingInEN.join(', ')}`);
    assert.deepEqual(extraInEN,  [], `EN keys missing in DE: ${extraInEN.join(', ')}`);
  });

  test('codex and dialog sections have entries for all 8 ids', () => {
    const codexIds = ['slime_blue', 'slime_green', 'slime_purple', 'boss_nebelkoloss',
                      'crystal', 'berry', 'shrine', 'village'];
    for (const id of codexIds) {
      const deEntry = de.codex?.[id];
      const enEntry = en.codex?.[id];
      assert.truthy(deEntry?.name, `DE codex.${id}.name missing`);
      assert.truthy(deEntry?.desc, `DE codex.${id}.desc missing`);
      assert.truthy(enEntry?.name, `EN codex.${id}.name missing`);
      assert.truthy(enEntry?.desc, `EN codex.${id}.desc missing`);
    }
    assert.truthy(de.dialog?.elder_intro);
    assert.truthy(de.dialog?.boss_warning);
    assert.truthy(de.dialog?.victory);
    assert.truthy(en.dialog?.elder_intro);
    assert.truthy(en.dialog?.boss_warning);
    assert.truthy(en.dialog?.victory);
  });
});

done();
