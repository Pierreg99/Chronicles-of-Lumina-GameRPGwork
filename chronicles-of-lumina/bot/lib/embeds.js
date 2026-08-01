// lib/embeds.js — shared EmbedBuilder helpers for consistent Lumina-UI.
import { EmbedBuilder } from 'discord.js';

export const COLORS = {
  purple: 0x7B2FBE,
  green:  0x2FBE7B,
  gold:   0xFFD700,
  blue:   0x4A90D9,
  red:    0xBE2F2F,
  mist:   0x6a8caf,
};

const FOOTER = (text) => ({ text: `Chronicles of Lumina · ${text}` });

/** /announce — official announcement embed (lila) */
export function announceEmbed(text, author) {
  return new EmbedBuilder()
    .setColor(COLORS.purple)
    .setTitle('🌟 Lumina Announcement')
    .setDescription(text)
    .setAuthor({ name: author?.tag ?? 'Dorfälteste' })
    .setTimestamp()
    .setFooter(FOOTER('Offizielle Kunde'));
}

/** /patch — patch-notes embed (grün) */
export function patchEmbed(version, sections) {
  const e = new EmbedBuilder()
    .setColor(COLORS.green)
    .setTitle(`🛠️ Patch v${version}`)
    .setTimestamp()
    .setFooter(FOOTER(`v${version}`));
  if (sections.neu?.length)      e.addFields({ name: '🆕 Neu',     value: sections.neu.join('\n'),     inline: false });
  if (sections.geaendert?.length) e.addFields({ name: '🔄 Geändert', value: sections.geaendert.join('\n'), inline: false });
  if (sections.gefixt?.length)    e.addFields({ name: '🐛 Gefixt',  value: sections.gefixt.join('\n'),  inline: false });
  return e;
}

/** /status — server / game status (blau) */
export function statusEmbed({ heroes, world, build, version }) {
  return new EmbedBuilder()
    .setColor(COLORS.blue)
    .setTitle('🎮 Lumina Status')
    .addFields(
      { name: '👥 Helden aktiv',     value: String(heroes), inline: true },
      { name: '🌍 Welt',             value: world,         inline: true },
      { name: '🛠️ Letzter Build',    value: build,         inline: true },
      { name: '📦 Version',          value: version,       inline: true },
    )
    .setTimestamp()
    .setFooter(FOOTER('Live-Status'));
}

/** /help — full command list (blau) */
export function helpEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.blue)
    .setTitle('❓ LuminaBot — Befehle')
    .setDescription('Offizieller Bot für **Chronicles of Lumina**.')
    .addFields(
      { name: 'ℹ️  Info',     value: '`/help` · `/status` · `/lore [thema]`', inline: false },
      { name: '🎙️ Community', value: '`/announce` · `/leaderboard` · `/bugreport` · `/suggestion`', inline: false },
      { name: '🛠️ Entwickler', value: '`/patch`', inline: false },
    )
    .setFooter(FOOTER('LuminaBot · Made for Chronicles of Lumina'));
}

/** /lore — atmospheric lore entry (mist) */
export function loreEmbed(entry) {
  return new EmbedBuilder()
    .setColor(COLORS.mist)
    .setTitle(`📖 ${entry.title}`)
    .setDescription(entry.body)
    .setFooter(FOOTER(`Lore · ${entry.tag}`));
}

/** /leaderboard — top-5 list (gold) */
export function leaderboardEmbed(rows) {
  const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];
  const lines = rows.map((r, i) => `${medals[i]} **#${i + 1}** ${r.name} — ${r.crystals} Kristalle`);
  return new EmbedBuilder()
    .setColor(COLORS.gold)
    .setTitle('🏆 Lumina Leaderboard')
    .setDescription(lines.join('\n'))
    .setFooter(FOOTER('Tagesrang · Top 5'));
}

/** /bugreport — confirmed registration (rot) */
export function bugReportEmbed({ id, user, description, createdAt }) {
  return new EmbedBuilder()
    .setColor(COLORS.red)
    .setTitle(`🐛 Bug #${id} registriert`)
    .setDescription('Danke für deinen Report! Das Entwickler-Team schaut sich das an.')
    .addFields(
      { name: 'ID',           value: `#${id}`,         inline: true },
      { name: 'Datum',        value: createdAt,        inline: true },
      { name: 'Gemeldet von', value: `<@${user.id}>`,  inline: true },
      { name: 'Beschreibung', value: description,      inline: false },
    )
    .setFooter(FOOTER('Auch im GitHub-Issue-Tracker melden: github.com/Pierreg99/Lumina-Game/issues'));
}

/** /suggestion — creative confirmation (gold) */
export function suggestionEmbed({ id, user, idea, complexity, createdAt }) {
  return new EmbedBuilder()
    .setColor(COLORS.gold)
    .setTitle(`💡 Vorschlag #${id} notiert`)
    .setDescription('Deine Weisheit wurde in den Codex eingetragen, Wanderer.')
    .addFields(
      { name: 'ID',           value: `#${id}`,          inline: true },
      { name: 'Datum',        value: createdAt,         inline: true },
      { name: 'Vorschlag von', value: `<@${user.id}>`,  inline: true },
      { name: 'Umsetzbarkeit', value: complexity,        inline: true },
      { name: 'Idee',         value: idea,              inline: false },
    )
    .setFooter(FOOTER('Vorschläge · Lumina Codex'));
}
