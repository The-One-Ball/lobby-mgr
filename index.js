const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

// ⭐ THIS WAS MISSING ⭐
const lobbyManager = require("./lobbyManager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  const lobbies = lobbyManager.loadLobbies();

  for (const hostId in lobbies) {
    const lobby = lobbies[hostId];

    // Skip lobbies missing message/channel IDs
    if (!lobby.messageId || !lobby.channelId) continue;

    try {
      const channel = await client.channels.fetch(lobby.channelId);
      const message = await channel.messages.fetch(lobby.messageId);

      const embed = new EmbedBuilder()
        .setTitle(`${lobby.hostName}'s Lobby`)
        .setDescription(`Players:\n${lobby.players.map(p => `• ${p}`).join("\n")}`)
        .setColor("Orange");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`join_${hostId}`)
          .setLabel("Join Lobby")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`leave_${hostId}`)
          .setLabel("Leave Lobby")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId(`close_${hostId}`)
          .setLabel("Close Lobby")
          .setStyle(ButtonStyle.Danger)
      );

      await message.edit({ embeds: [embed], components: [row] });

      console.log(`Restored lobby for ${lobby.hostName}`);
    } catch (err) {
      console.error(`Failed to restore lobby for ${lobby.hostName}:`, err);
    }
  }
});

client.on("interactionCreate", async interaction => {
  // ⭐ Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error executing this command.",
        ephemeral: true
      });
    }
  }

  // ⭐ Buttons
  if (interaction.isButton()) {
    const [action, hostId] = interaction.customId.split("_");
    const playerName = interaction.user.username;

    if (action === "join") {
      const result = lobbyManager.joinLobby(hostId, playerName);

      if (result.error) {
        return interaction.reply({ content: result.error, ephemeral: true });
      }

      const lobby = result.lobby;

      const embed = new EmbedBuilder()
        .setTitle(`${lobby.hostName}'s Lobby`)
        .setDescription(
  `Players:\n${lobby.players.map(p => `• ${p}`).join("\n")}` +
  (lobby.code ? `\n\n**Game Code:** ${lobby.code}` : "")
)
        .setColor("Orange");

      return interaction.update({ embeds: [embed] });
    }

    if (action === "leave") {
      const result = lobbyManager.leaveLobby(hostId, playerName);

      if (result.error) {
        return interaction.reply({ content: result.error, ephemeral: true });
      }

      const lobby = result.lobby;

      const embed = new EmbedBuilder()
        .setTitle(`${lobby.hostName}'s Lobby`)
        .setDescription(`Players:\n${lobby.players.map(p => `• ${p}`).join("\n")}`)
        .setColor("Orange");

      return interaction.update({ embeds: [embed] });
    }

    if (action === "close") {
      const result = lobbyManager.closeLobby(hostId);

      if (result.error) {
        return interaction.reply({ content: result.error, ephemeral: true });
      }

      return interaction.update({
        content: "This lobby has been closed.",
        embeds: [],
        components: []
      });
    }
  }
});

client.login(process.env.TOKEN);
