// commands/patch.js — /patch
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { patchEmbed } from '../lib/embeds.js';
import { parsePatchDescription } from '../lib/parser.js';

export const data = new SlashCommandBuilder()
  .setName('patch')
  .setDescription('Patch-Notes-Embed (nur Mods)')
  .addStringOption((o) => o.setName('version').setDescription('z.B. 0.9.2').setRequired(true))
  .addStringOption((o) => o.setName('beschreibung').setDescription('Mehrzeilig: Neu: / Geändert: / Gefixt:').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  const version = interaction.options.getString('version', true);
  const desc    = interaction.options.getString('beschreibung', true);
  const sections = parsePatchDescription(desc);
  await interaction.reply({ embeds: [patchEmbed(version, sections)] });
}
