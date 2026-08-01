// commands/suggestion.js — /suggestion
import { SlashCommandBuilder } from 'discord.js';
import { suggestionEmbed } from '../lib/embeds.js';
import { Store, classifyComplexity } from '../lib/store.js';

export const data = new SlashCommandBuilder()
  .setName('suggestion')
  .setDescription('Feature-Vorschlag einreichen')
  .addStringOption((o) => o.setName('idee').setDescription('Dein Vorschlag').setRequired(true));

export async function execute(interaction) {
  const idea = interaction.options.getString('idee', true);
  const complexity = classifyComplexity(idea);
  const entry = await Store.addSuggestion({ user: interaction.user, idea, complexity });
  await interaction.reply({
    embeds: [suggestionEmbed({
      id: entry.id,
      user: interaction.user,
      idea: entry.idea,
      complexity: entry.complexity,
      createdAt: new Date(entry.createdAt).toLocaleString('de-DE'),
    })],
    ephemeral: true,
  });
}
