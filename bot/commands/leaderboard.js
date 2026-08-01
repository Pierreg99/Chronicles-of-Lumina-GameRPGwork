// commands/leaderboard.js — /leaderboard
import { SlashCommandBuilder } from 'discord.js';
import { leaderboardEmbed } from '../lib/embeds.js';
import { Store } from '../lib/store.js';

export const data = new SlashCommandBuilder().setName('leaderboard').setDescription('Top-5-Helden dieser Woche');

export async function execute(interaction) {
  const rows = await Store.leaderboard();
  await interaction.reply({ embeds: [leaderboardEmbed(rows)] });
}
