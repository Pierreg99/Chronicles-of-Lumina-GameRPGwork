// events/welcome.js — guildMemberAdd → greeting in WELCOME_CHANNEL_ID.
import { Events } from 'discord.js';

const WELCOME = (username) => `🌟 Willkommen in der Lumina-Community, **${username}**!
Die Welt der Kristalle wartet auf dich. Schreib \`/help\` um loszulegen.`;

export const name = Events.GuildMemberAdd;
export const once = false;
export async function execute(member) {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  if (!channelId) return;
  const ch = member.guild.channels.cache.get(channelId) ?? await member.guild.channels.fetch(channelId).catch(() => null);
  if (!ch) return;
  await ch.send(WELCOME(member.user.username)).catch(() => {});
}
