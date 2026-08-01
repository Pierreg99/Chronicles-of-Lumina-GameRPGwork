// commands/help.js — /help
import { SlashCommandBuilder } from 'discord.js';
import { helpEmbed } from '../lib/embeds.js';

export const data = new SlashCommandBuilder().setName('help').setDescription('Zeige alle LuminaBot-Befehle');

export async function execute(interaction) {
  await interaction.reply({ embeds: [helpEmbed()], ephemeral: true });
}
