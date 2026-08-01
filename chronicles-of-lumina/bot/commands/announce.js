// commands/announce.js — /announce
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { announceEmbed } from '../lib/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Offizielle Lumina-Ankündigung (nur Mods)')
  .addStringOption((o) => o.setName('text').setDescription('Ankündigungstext').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  const text = interaction.options.getString('text', true);
  await interaction.reply({ embeds: [announceEmbed(text, interaction.user)] });
}
