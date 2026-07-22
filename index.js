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
  fetch(https://lobby-mgr.onrender.com)
    .catch(() => {});
}, 1000 * 60 * 5); // every 5 minutes


// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
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

// Secret commands
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const [cmd] = message.content.slice(1).split(/\s+/);

  try {
    // Delete the user's command message IMMEDIATELY
    message.delete().catch(() => {});

    let reply;

    // SECRET COMMANDS
    if (cmd === 'registercommands') {
      reply = await message.channel.send('All commands registered');
    }

    if (cmd === 'purgecommands') {
      reply = await message.channel.send('All commands purged');
    }

    if (cmd === 'sleepau') {
      reply = await message.channel.send('All lobbies closed');
    }

    // Auto-delete the bot's reply after 10 seconds
    if (reply) {
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 10000);
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
