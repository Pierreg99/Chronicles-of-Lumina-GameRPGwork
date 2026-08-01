// commands/status.js — /status
import { SlashCommandBuilder } from 'discord.js';
import { statusEmbed } from '../lib/embeds.js';
import { readFile } from 'node:fs/promises';

async function readProjectFile(rel) {
  try {
    const p = new URL(`../../${rel}`, import.meta.url);
    return (await readFile(p, 'utf8')).trim();
  } catch { return null; }
}

export const data = new SlashCommandBuilder().setName('status').setDescription('Aktueller Server- und Spielstatus');

export async function execute(interaction) {
  const pkgRaw   = await readProjectFile('package.json');
  const clRaw    = await readProjectFile('CHANGELOG.md');
  const version  = pkgRaw ? JSON.parse(pkgRaw).version : 'unbekannt';
  const buildTag = clRaw?.match(/^##\s*\[([0-9.]+)\]/m)?.[1] ?? version;
  const heroes   = interaction.guild?.memberCount ?? '—';
  await interaction.reply({
    embeds: [statusEmbed({
      heroes,
      world: 'Lumina World Alpha',
      build: `Build ${buildTag}`,
      version: `v${version}`,
    })],
  });
}
