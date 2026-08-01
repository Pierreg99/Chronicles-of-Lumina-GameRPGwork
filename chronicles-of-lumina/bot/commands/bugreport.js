// commands/bugreport.js — /bugreport
import { SlashCommandBuilder } from 'discord.js';
import { bugReportEmbed } from '../lib/embeds.js';
import { Store } from '../lib/store.js';

export const data = new SlashCommandBuilder()
  .setName('bugreport')
  .setDescription('Bug im Spiel melden')
  .addStringOption((o) => o.setName('beschreibung').setDescription('Was ist passiert? Wie reproduzierbar?').setRequired(true));

export async function execute(interaction) {
  const description = interaction.options.getString('beschreibung', true);
  const entry = await Store.addBugReport({ user: interaction.user, description });
  await interaction.reply({
    embeds: [bugReportEmbed({
      id: entry.id,
      user: interaction.user,
      description: entry.description,
      createdAt: new Date(entry.createdAt).toLocaleString('de-DE'),
    })],
    ephemeral: true,
  });
}
