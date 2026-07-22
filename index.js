const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const lobbyManager = require('./lobbyManager');
const buttons = require('./buttons');

// KEEP-ALIVE SERVER FOR RENDER
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(3000);

// SELF-PING TO PREVENT RENDER HIBERNATION
setInterval(() => {
  fetch(process.env.RENDER_EXTERNAL_URL).catch(() => {});
}, 1000 * 60 * 5); // every 5 minutes

// Create client
// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: ['CHANNEL'] // required for DM deletion + message deletion in DMs
});

// Load commands
client.commands = new Collection();
const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction, lobbyManager);
    }

    if (interaction.isButton()) {
      await buttons.execute(interaction, lobbyManager);
    }
  } catch (err) {
    console.error('Interaction error:', err);
  }
});

// SECRET COMMANDS (GLOBAL)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const [cmd] = message.content.slice(1).split(/\s+/);

  try {
    // Delete user command immediately
    message.delete().catch(() => {});

    let reply;

    // REGISTER COMMANDS (GLOBAL)
    if (cmd === 'registercommands') {
      await client.application.commands.set(client.commands.map(c => c.data));
      reply = await message.channel.send('All slash commands registered globally.');
    }

    // PURGE COMMANDS (GLOBAL)
    if (cmd === 'purgecommands') {
      await client.application.commands.set([]);
      reply = await message.channel.send('All slash commands purged globally.');
    }

    // CLOSE ALL LOBBIES (GLOBAL)
    if (cmd === 'sleepau') {
      lobbyManager.closeAllLobbies();
      reply = await message.channel.send('All lobbies closed globally.');
    }

    // Auto-delete bot reply after 10 seconds
    if (reply) {
      setTimeout(() => reply.delete().catch(() => {}), 10000);
    }

  } catch (err) {
    console.error('Secret command error:', err);
  }
});

// Bot online DM
client.once(Events.ClientReady, async () => {
  try {
    const owner = await client.users.fetch(process.env.OWNER_ID);
    await owner.send('Lobby Manager Bot is now online.');
  } catch (err) {
    console.log('DM to owner failed:', err);
  }
});

// SINGLE login call (important!)
client.login(process.env.TOKEN);
