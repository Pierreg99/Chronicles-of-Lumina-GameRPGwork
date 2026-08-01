// deploy.js — register slash commands with Discord.
// Run once after adding new commands: `npm run deploy`.
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { loadCommands } from './lib/loader.js';

const TOKEN     = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID  = process.env.DISCORD_GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('[FATAL] DISCORD_TOKEN and DISCORD_CLIENT_ID required. See .env.example.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);
const cmds = await loadCommands();
const body = cmds.map((c) => c.data.toJSON());

const route = GUILD_ID
  ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
  : Routes.applicationCommands(CLIENT_ID);

console.log(`[deploy] registering ${body.length} commands ${GUILD_ID ? `to guild ${GUILD_ID}` : 'globally'}…`);
const res = await rest.put(route, { body });
console.log(`[deploy] OK — ${res.length} commands registered.`);
