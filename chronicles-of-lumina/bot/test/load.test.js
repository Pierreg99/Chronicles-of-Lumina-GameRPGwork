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

console.log(`✓ ${cmds.length} commands, ${evts.length} events, ${sample.length} embeds, parser + store OK`);
