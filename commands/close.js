const { SlashCommandBuilder } = require("discord.js");
const lobbyManager = require("../lobbyManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close your lobby"),

  async execute(interaction) {
    const hostId = interaction.user.id;

    const result = lobbyManager.closeLobby(hostId);

    if (result.error) {
      return interaction.reply({ content: result.error, ephemeral: true });
    }

    return interaction.reply({
      content: `Your lobby has been closed.`,
      ephemeral: false
    });
  }
};
