// events/screenshot.js — messageCreate in #screenshots → auto-react + comment.
import { Events } from 'discord.js';

const REACTIONS = ['✨', '🎮', '🌟'];
const COMMENTS = [
  'Beeindruckend! Die Kristalle leuchten hell.',
  'Was für ein Screenshot! Aren wäre stolz.',
  'Die Wildnis lebt — wunderschön eingefangen.',
];

export const name = Events.MessageCreate;
export const once = false;
export async function execute(message) {
  if (message.author.bot || !message.guild) return;
  const channelId = process.env.SCREENSHOT_CHANNEL_ID;
  if (!channelId || message.channel.id !== channelId) return;
  if (message.attachments.size === 0) return;
  for (const r of REACTIONS) await message.react(r).catch(() => {});
  if (Math.random() < 0.5) {
    const c = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
    await message.reply({ content: c }).catch(() => {});
  }
}
