// lib/loader.js — auto-load all commands/ and events/ folders.
import { readdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

export async function loadCommands() {
  const dir = resolve(root, 'commands');
  const out = [];
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.js')).sort()) {
    const mod = await import(pathToFileURL(resolve(dir, file)).href);
    out.push({ name: mod.data.name, data: mod.data, execute: mod.execute });
  }
  return out;
}

export async function loadEvents() {
  const dir = resolve(root, 'events');
  const out = [];
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.js')).sort()) {
    const mod = await import(pathToFileURL(resolve(dir, file)).href);
    out.push({ name: mod.name, once: mod.once ?? false, execute: mod.execute });
  }
  return out;
}
