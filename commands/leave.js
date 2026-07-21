const { SlashCommandBuilder } = require("discord.js");
const lobbyManager = require("../lobbyManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave someone's lobby")
    .addUserOption(option =>
      option.setName("host")
        .setDescription("The host of the lobby you want to leave")
        .setRequired(true)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser("host");
    const playerName = interaction.user.username;

    const result = lobbyManager.leaveLobby(host.id, playerName);

    if (result.error) {
      return interaction.reply({ content: result.error, ephemeral: true });
    }

    return interaction.reply({
      content: `${playerName} left ${host.username}'s lobby.\nPlayers remaining: ${result.lobby.players.join(", ")}`,
      ephemeral: false
    });
  }
};