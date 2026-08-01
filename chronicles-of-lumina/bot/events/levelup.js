// events/levelup.js — messageCreate → reacts to "level up" / "aufgestiegen".
import { Events } from 'discord.js';

const TRIGGER = /(level[\s-]?up|aufgestiegen|lv\.?\s*\d+|level \d+ erreicht)/i;
const REPLY_CHANCE = 0.35; // not every match — keep it special
const PHRASES = [
  '🎉 Das Kristallreich feiert mit dir! Möge dein neues Level lang und ruhmreich sein.',
  '🌟 Aufgestiegen! Die Sterne von Sonnenhain leuchten heller für dich.',
  '✨ Noch ein Kristall in deiner Krone. Stolz des Dorfes!',
];

export const name = Events.MessageCreate;
export const once = false;
export async function execute(message) {
  if (message.author.bot || !message.guild) return;
  if (!TRIGGER.test(message.content)) return;
  if (Math.random() > REPLY_CHANCE) {
    await message.react('🎉').catch(() => {});
    return;
  }
  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  await message.reply({ content: phrase }).catch(() => {});
}
