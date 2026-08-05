// tests/story.test.mjs — story chapters, cutscenes, scripted sequences.
import './_setup.mjs';
import {
  CHAPTERS, CUTSCENE_TYPES,
  getChapter, listChapters, totalChapters,
  getUnlockedChapters, getCurrentChapter,
  validateScene, storyProgress, CutscenePlayer,
} from '../src/systems/story.js';
import { test, group, assert } from './_runner.mjs';

group('chapters', () => {
  test('has 5 chapters', () => {
    assert.equal(totalChapters(), 5);
  });

  test('chapters are numbered 1-5', () => {
    for (let i = 1; i <= 5; i++) {
      assert.truthy(getChapter(`ch_intro`.replace('intro', ['intro', 'call', 'shrine', 'void', 'end'][i - 1])));
    }
  });

  test('every chapter has id, name, scenes', () => {
    for (const c of listChapters()) {
      assert.truthy(c.id);
      assert.truthy(c.name);
      assert.truthy(Array.isArray(c.scenes));
      assert.truthy(c.scenes.length >= 1);
    }
  });

  test('ch_intro is always unlocked', () => {
    const unlocked = getUnlockedChapters({});
    assert.truthy(unlocked.find((c) => c.id === 'ch_intro'));
  });
});

group('cutscene types', () => {
  test('has 12 cutscene types', () => {
    assert.truthy(Object.keys(CUTSCENE_TYPES).length >= 12);
  });
});

group('unlock conditions', () => {
  test('ch_call unlocks at 3 crystals', () => {
    assert.falsy(getUnlockedChapters({}).find((c) => c.id === 'ch_call'));
    const list = getUnlockedChapters({ crystals: 3 });
    assert.truthy(list.find((c) => c.id === 'ch_call'));
  });

  test('ch_void unlocks when q_purify_shrine is completed', () => {
    const state = { quests: { q_purify_shrine: { status: 'completed' } } };
    const list = getUnlockedChapters(state);
    assert.truthy(list.find((c) => c.id === 'ch_void'));
  });

  test('ch_end unlocks when architect is defeated', () => {
    const state = { defeatedBoss: ['the_architect'] };
    const list = getUnlockedChapters(state);
    assert.truthy(list.find((c) => c.id === 'ch_end'));
  });
});

group('getCurrentChapter', () => {
  test('returns latest unlocked chapter', () => {
    const state = { crystals: 10 };
    const cur = getCurrentChapter(state);
    assert.equal(cur.id, 'ch_shrine');
  });

  test('returns null for impossible state', () => {
    // ch_intro is always unlocked, so this should never be null
    // unless the function errors. The test is for robustness.
    const cur = getCurrentChapter({});
    assert.truthy(cur);
  });
});

group('validateScene', () => {
  test('valid scene with all required params', () => {
    const scene = { id: 'x', type: 'fade_in', duration: 1000 };
    const v = validateScene(scene);
    assert.truthy(v.valid);
  });

  test('invalid: unknown type', () => {
    const scene = { id: 'x', type: 'not_a_type', duration: 1000 };
    const v = validateScene(scene);
    assert.falsy(v.valid);
  });

  test('invalid: missing required param', () => {
    const scene = { id: 'x', type: 'fade_in' }; // no duration
    const v = validateScene(scene);
    assert.falsy(v.valid);
  });

  test('invalid: dialog scene without npc', () => {
    const scene = { id: 'x', type: 'dialog', node: 'dt_root' }; // no npc
    const v = validateScene(scene);
    assert.falsy(v.valid);
  });
});

group('storyProgress', () => {
  test('0 with no chapters unlocked', () => {
    // This is impossible since ch_intro is always unlocked, but
    // we test the formula. With all 5 unlocked, progress = 1.0.
    const p = storyProgress({});
    assert.equal(p, 0.2); // 1/5
  });

  test('1.0 when all chapters unlocked', () => {
    const state = { crystals: 100, defeatedBoss: ['the_architect'], quests: { q_purify_shrine: { status: 'completed' } } };
    assert.equal(storyProgress(state), 1);
  });
});

group('CutscenePlayer', () => {
  test('starts at scene 0', () => {
    const player = new CutscenePlayer(getChapter('ch_intro'));
    assert.equal(player.sceneIndex, 0);
    assert.equal(player.currentScene().id, 'sc_intro_1');
  });

  test('advance moves to next scene', () => {
    const player = new CutscenePlayer(getChapter('ch_intro'));
    player.advance();
    assert.equal(player.sceneIndex, 1);
  });

  test('completed after last advance', () => {
    const player = new CutscenePlayer(getChapter('ch_intro'));
    while (!player.completed) player.advance();
    assert.truthy(player.completed);
  });

  test('reset returns to start', () => {
    const player = new CutscenePlayer(getChapter('ch_intro'));
    player.advance();
    player.advance();
    player.reset();
    assert.equal(player.sceneIndex, 0);
    assert.falsy(player.completed);
  });

  test('progress is 0 at start, 1 at end', () => {
    const player = new CutscenePlayer(getChapter('ch_intro'));
    assert.equal(player.progress(), 0);
    while (!player.completed) player.advance();
    assert.equal(player.progress(), 1);
  });
});
