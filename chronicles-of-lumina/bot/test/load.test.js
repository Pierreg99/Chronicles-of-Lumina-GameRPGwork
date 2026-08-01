// test/load.test.js — load every command + event without a real Discord connection.
// Verifies imports, JSON-parsing, and embed-builder function signatures.
import assert from 'node:assert/strict';
import { loadCommands, loadEvents } from '../lib/loader.js';
import { announceEmbed, patchEmbed, statusEmbed, helpEmbed, loreEmbed, leaderboardEmbed, bugReportEmbed, suggestionEmbed } from '../lib/embeds.js';
import { Store, classifyComplexity } from '../lib/store.js';
import { parsePatchDescription } from '../lib/parser.js';
import loreData from '../data/lore.json' with { type: 'json' };

// 1. Commands
const cmds = await loadCommands();
assert.ok(cmds.length >= 8, `expected ≥8 commands, got ${cmds.length}`);
for (const c of cmds) {
  assert.ok(typeof c.name === 'string' && c.name.length);
  assert.ok(c.data && typeof c.data.toJSON === 'function', `${c.name} missing SlashCommandBuilder`);
  assert.equal(typeof c.execute, 'function', `${c.name} missing execute()`);
}

// 2. Events
const evts = await loadEvents();
assert.ok(evts.length >= 3, `expected ≥3 events, got ${evts.length}`);
for (const e of evts) {
  assert.ok(typeof e.name === 'string');
  assert.equal(typeof e.execute, 'function');
}

// 3. Embeds — every builder returns an object with toJSON()
const sample = [
  announceEmbed('Hallo Welt', { tag: 'Dorfälteste' }),
  patchEmbed('0.9.2', { neu: ['A'], geaendert: ['B'], gefixt: ['C'] }),
  statusEmbed({ heroes: 42, world: 'X', build: 'Y', version: 'v0.9.2' }),
  helpEmbed(),
  loreEmbed(loreData[0]),
  leaderboardEmbed([{ name: 'A', crystals: 1 }]),
  bugReportEmbed({ id: 1234, user: { id: '1' }, description: 'x', createdAt: 'now' }),
  suggestionEmbed({ id: 1234, user: { id: '1' }, idea: 'x', complexity: '🟢', createdAt: 'now' }),
];
for (const e of sample) {
  const j = e.toJSON();
  assert.ok(j.title || j.description, 'embed has no title or description');
}

// 4. Parser
const p = parsePatchDescription('Neu: hello\nGeändert: world\nGefixt: !');
assert.deepEqual(p, { neu: ['• hello'], geaendert: ['• world'], gefixt: ['• !'] });

// 5. Store
const rep = await Store.addBugReport({ user: { id: 'u1', tag: 'u1#1' }, description: 't' });
assert.equal(rep.id.length, 4);
const sug = await Store.addSuggestion({ user: { id: 'u2', tag: 'u2#2' }, idea: 'Neues Biome', complexity: classifyComplexity('Neues Biome') });
assert.equal(sug.complexity, '🟣 komplex');
const lb = await Store.leaderboard();
assert.equal(lb.length, 5);

// 6. Complexity heuristic
assert.equal(classifyComplexity('mehr Sound'), '🟢 einfach');
assert.equal(classifyComplexity('Boss mit neuer KI'), '🟠 mittel');
assert.equal(classifyComplexity('komplett neue Story'), '🟣 komplex');

// 7. GitHub release — format + mock fetch
import { createRelease, formatReleaseBody, isGitHubConfigured } from '../lib/github.js';
const body = formatReleaseBody({ neu: ['Asset-Gen'], geaendert: ['materials.js'], gefixt: ['Test-Pollution'] }, '0.9.2');
assert.match(body, /# v0\.9\.2/);
assert.match(body, /- Asset-Gen/);
assert.match(body, /- materials\.js/);
assert.match(body, /- Test-Pollution/);

assert.equal(isGitHubConfigured(), false); // no env in test

// Mock fetch for createRelease
process.env.GITHUB_TOKEN = 'ghp_test';
process.env.GITHUB_REPO   = 'foo/bar';
assert.equal(isGitHubConfigured(), true);

let capturedRequest = null;
const mockFetch = async (url, opts) => {
  capturedRequest = { url, opts: { ...opts, body: JSON.parse(opts.body) } };
  return new Response(JSON.stringify({ html_url: 'https://github.com/foo/bar/releases/tag/v0.9.2', id: 1 }), {
    status: 201, headers: { 'content-type': 'application/json' },
  });
};
const release = await createRelease({ tag: 'v0.9.2', name: 'v0.9.2', body, draft: true, fetchImpl: mockFetch });
assert.equal(release.html_url, 'https://github.com/foo/bar/releases/tag/v0.9.2');
assert.equal(capturedRequest.url, 'https://api.github.com/repos/foo/bar/releases');
assert.equal(capturedRequest.opts.body.tag_name, 'v0.9.2');
assert.equal(capturedRequest.opts.body.draft, true);
assert.match(capturedRequest.opts.headers.Authorization, /^Bearer ghp_test$/);

// 422 already-exists error path
const mockFetch422 = async () => new Response('{"message":"Validation Failed","errors":[{"resource":"Release","code":"already_exists"}]}', { status: 422 });
await assert.rejects(
  () => createRelease({ tag: 'v0.9.2', name: 'v0.9.2', body, fetchImpl: mockFetch422 }),
  /Tag v0\.9\.2 existiert bereits/,
);

// Network error
const mockFetchFails = async () => { throw new Error('socket hang up'); };
await assert.rejects(() => createRelease({ tag: 'v0.9.2', name: 'v0.9.2', body, fetchImpl: mockFetchFails }), /socket hang up/);

delete process.env.GITHUB_TOKEN;
delete process.env.GITHUB_REPO;

console.log(`✓ ${cmds.length} commands, ${evts.length} events, ${sample.length} embeds, parser + store + github OK`);
