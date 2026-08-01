// events/moderation.js — messageCreate → soft-deescalation for toxic content.
// Simple keyword-based filter (no ML). Triggers are intentionally conservative —
// false positives are worse than false negatives.
import { Events } from 'discord.js';

const FLAGS = [
  /\b(hass|hate|kill yourself|kys)\b/i,
  /\b(arschloch|fick dich|hurensohn|missgeburt)\b/i,
];

export const name = Events.MessageCreate;
export const once = false;
export async function execute(message) {
  if (message.author.bot || !message.guild) return;
  if (!FLAGS.some((rx) => rx.test(message.content))) return;
  // Soft intervention — don't delete, just nudge.
  await message.reply({
    content:
      `:wave: ${message.author}, halt kurz inne. Im Dorf Sonnenhain reden wir miteinander, nicht übereinander. ` +
      'Wenn etwas dich stört — sag es ruhig, ich bin da.',
  }).catch(() => {});
}
