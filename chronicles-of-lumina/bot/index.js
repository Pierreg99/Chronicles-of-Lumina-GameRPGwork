// index.js — LuminaBot main entry. Loads commands + events, connects to Discord.
import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { loadCommands, loadEvents } from './lib/loader.js';

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN || TOKEN === 'PASTE_TOKEN_HERE') {
  console.error('[FATAL] DISCORD_TOKEN missing. Copy .env.example to .env and fill in.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.GuildMember, Partials.Message],
});

client.once('ready', async (c) => {
  console.log(`[LuminaBot] online as ${c.user.tag} (${c.user.id})`);
  const cmds = await loadCommands();
  for (const cmd of cmds) c.commands ??= [], c.commands.push(cmd);
  const events = await loadEvents();
  for (const evt of events) {
    if (evt.once) client.once(evt.name, (...args) => evt.execute(...args));
    else client.on(evt.name, (...args) => evt.execute(...args));
  }
  console.log(`[LuminaBot] loaded ${cmds.length} commands, ${events.length} events`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands?.find((c) => c.name === interaction.commandName);
  if (!cmd) return interaction.reply({ content: 'Unbekannter Befehl.', ephemeral: true });
  try {
    await cmd.execute(interaction);
  } catch (e) {
    console.error(`[LuminaBot] /${interaction.commandName} failed:`, e);
    const reply = { content: '⚠️ Da ging etwas schief. Versuche es gleich nochmal.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
    else await interaction.reply(reply);
  }
});

client.login(TOKEN);
