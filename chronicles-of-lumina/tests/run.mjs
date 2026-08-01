// tests/run.mjs — entry point. Runs every *.test.mjs file in this folder.
// Usage: `npm test` (or `node tests/run.mjs`).
import './_setup.mjs';
import { group, test, assert, done } from './_runner.mjs';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => f.endsWith('.test.mjs')).sort();

console.log(`Chronicles of Lumina — unit tests (${files.length} files)\n`);

for (const f of files) {
  console.log(`Running ${f}…`);
  await import(join(here, f));
}

done();
