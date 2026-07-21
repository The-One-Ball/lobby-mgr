const { SlashCommandBuilder } = require("discord.js");
const lobbyManager = require("../lobbyManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join someone's lobby")
    .addUserOption(option =>
      option.setName("host")
        .setDescription("The host of the lobby you want to join")
        .setRequired(true)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser("host");
    const playerName = interaction.user.username;

    const result = lobbyManager.joinLobby(host.id, playerName);

    if (result.error) {
      return interaction.reply({ content: result.error, ephemeral: true });
    }

    return interaction.reply({
      content: `${playerName} joined ${host.username}'s lobby!\nPlayers: ${result.lobby.players.join(", ")}`,
      ephemeral: false
    });
  }
};