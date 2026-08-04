// tests/sky.test.mjs — day/night + weather system.
import './_setup.mjs';
import { SkySystem, WEATHER_PRESETS } from '../src/engine/sky.js';
import { test, group, assert } from './_runner.mjs';

const fakeScene = { children: [], background: null, fog: null };

group('SkySystem', () => {
  test('starts at noon by default', () => {
    const sky = new SkySystem(fakeScene, 'verdant');
    assert.equal(sky.timeOfDay, 0.5);
  });

  test('update advances time of day', () => {
    const sky = new SkySystem(fakeScene, 'verdant');
    sky.cycleSec = 100; // 100s cycle
    sky.update(10);
    assert.equal(Math.round(sky.timeOfDay * 100) / 100, 0.6);
  });

  test('time wraps after full cycle', () => {
    const sky = new SkySystem(fakeScene, 'verdant');
    sky.cycleSec = 100;
    sky.update(110);
    assert.truthy(sky.timeOfDay >= 0 && sky.timeOfDay < 1);
  });

  test('every zone has a weather preset', () => {
    for (const id of ['verdant', 'dunes', 'peaks', 'mire', 'ember',
                     'crystal', 'sky', 'reef', 'haunted', 'void']) {
      assert.truthy(WEATHER_PRESETS[id], `${id} missing weather preset`);
      assert.truthy(WEATHER_PRESETS[id].states.length > 0, `${id} no weather states`);
    }
  });

  test('valid weather states are non-empty for every zone', () => {
    for (const id of Object.keys(WEATHER_PRESETS)) {
      const sky = new SkySystem(fakeScene, id);
      const valid = sky.getValidWeather();
      assert.truthy(valid.length >= 1, `${id} no valid weather`);
    }
  });

  test('setZone changes default weather', () => {
    const sky = new SkySystem(fakeScene, 'verdant');
    sky.setZone('mire');
    assert.truthy(sky.weather === 'fog');
  });

  test('getTimeLabel returns HH:MM format', () => {
    const sky = new SkySystem(fakeScene, 'verdant');
    sky.timeOfDay = 0.5; // noon
    const label = sky.getTimeLabel();
    assert.truthy(/^\d{2}:\d{2}$/.test(label), `bad label: ${label}`);
    assert.equal(label, '12:00');
  });

  test('getPhaseName returns localized German name', () => {
    const sky = new SkySystem(fakeScene, 'verdant');
    sky.timeOfDay = 0.10; // pre-dawn
    assert.truthy(['Nacht', 'Morgenröte', 'Tag', 'Abenddämmerung', 'Abend']
      .includes(sky.getPhaseName()));
  });
});
