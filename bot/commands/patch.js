// commands/patch.js — /patch
// 1) Postet einen Patch-Notes-Embed in Discord
// 2) Wenn GITHUB_TOKEN + GITHUB_REPO gesetzt sind: erstellt zusätzlich
//    einen Draft-Release auf GitHub mit denselben Notizen als Markdown.
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { patchEmbed } from '../lib/embeds.js';
import { parsePatchDescription } from '../lib/parser.js';
import { createRelease, formatReleaseBody, isGitHubConfigured } from '../lib/github.js';

export const data = new SlashCommandBuilder()
  .setName('patch')
  .setDescription('Patch-Notes-Embed (nur Mods) — optional GitHub-Release')
  .addStringOption((o) => o.setName('version').setDescription('z.B. 0.9.2').setRequired(true))
  .addStringOption((o) => o.setName('beschreibung').setDescription('Mehrzeilig: Neu: / Geändert: / Gefixt:').setRequired(true))
  .addBooleanOption((o) => o.setName('github_release').setDescription('Auch als GitHub-Draft-Release posten?').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  await interaction.deferReply();

  const version  = interaction.options.getString('version', true);
  const desc     = interaction.options.getString('beschreibung', true);
  const wantGH   = interaction.options.getBoolean('github_release');
  const sections = parsePatchDescription(desc);

  // 1) GitHub Release (draft) — only if explicitly opted-in AND configured
  let releaseUrl = null;
  let releaseError = null;
  const shouldCreateRelease = (wantGH ?? isGitHubConfigured()) && isGitHubConfigured();
  if (shouldCreateRelease) {
    try {
      const body = formatReleaseBody(sections, version);
      const rel = await createRelease({ tag: `v${version}`, name: `v${version}`, body, draft: true });
      releaseUrl = rel.html_url;
    } catch (e) {
      console.error(`[LuminaBot] /patch GitHub release failed:`, e);
      releaseError = e.message;
    }
  } else if (wantGH && !isGitHubConfigured()) {
    releaseError = 'GITHUB_TOKEN / GITHUB_REPO nicht gesetzt — siehe .env.example';
  }

  // 2) Discord-Embed
  const embed = patchEmbed(version, sections, { releaseUrl, releaseError });
  await interaction.editReply({ embeds: [embed] });
}
