import { group, test, assert } from './_runner.mjs';
import { copyText } from '../src/utils/clipboard.js';

group('clipboard', () => {
  test('returns false without clipboard/document (node defaults)', async () => {
    const ok = await copyText('hello', { promptFallback: false });
    assert.equal(ok, false);
  });

  test('uses injected clipboard.writeText', async () => {
    const writes = [];
    const ok = await copyText('map=verdant:1', {
      promptFallback: false,
      clipboard: { writeText: async (t) => { writes.push(t); } },
    });
    assert.equal(ok, true);
    assert.equal(writes[0], 'map=verdant:1');
  });

  test('falls back when clipboard.writeText rejects', async () => {
    const ok = await copyText('x', {
      promptFallback: false,
      clipboard: { writeText: async () => { throw new Error('denied'); } },
    });
    assert.equal(ok, false);
  });

  test('prompt fallback called when nothing else works', async () => {
    const prompts = [];
    const ok = await copyText('url', {
      promptFallback: true,
      prompt: (msg, def) => { prompts.push([msg, def]); return def; },
    });
    assert.equal(ok, false);
    assert.equal(prompts.length, 1);
    assert.equal(prompts[0][1], 'url');
  });
});
