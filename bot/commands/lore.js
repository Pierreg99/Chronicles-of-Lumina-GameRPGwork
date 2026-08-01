// commands/lore.js — /lore [thema]
import { SlashCommandBuilder } from 'discord.js';
import { loreEmbed } from '../lib/embeds.js';
import loreData from '../data/lore.json' with { type: 'json' };

export const data = new SlashCommandBuilder()
  .setName('lore')
  .setDescription('Lore-Eintrag aus der Lumina-Welt')
  .addStringOption((o) => o.setName('thema').setDescription('z.B. slime, kristall, schrein').setRequired(false));

export async function execute(interaction) {
  const thema = (interaction.options.getString('thema') ?? '').toLowerCase().trim();
  const pool = thema ? loreData.filter((e) => e.tag.includes(thema) || e.title.toLowerCase().includes(thema)) : loreData;
  const entry = pool[Math.floor(Math.random() * pool.length)] ?? loreData[0];
  await interaction.reply({ embeds: [loreEmbed(entry)] });
}
