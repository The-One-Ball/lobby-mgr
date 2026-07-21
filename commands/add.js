const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const lobbyManager = require("../lobbyManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a player to your lobby")
    .addUserOption(option =>
      option.setName("player")
        .setDescription("The player to add")
        .setRequired(true)
    ),

  async execute(interaction) {
    const hostId = interaction.user.id;
    const hostName = interaction.user.username;

    const player = interaction.options.getUser("player");
    const playerName = player.username;

    const result = lobbyManager.addPlayerToLobby(hostId, playerName);

    if (result.error) {
      return interaction.reply({ content: result.error, ephemeral: true });
    }

    const lobby = result.lobby;

    const embed = new EmbedBuilder()
      .setTitle(`${lobby.hostName}'s Lobby`)
      .setDescription(`Players:\n${lobby.players.map(p => `• ${p}`).join("\n")}`)
      .setColor("Orange");

    return interaction.reply({
      content: `${playerName} has been added to your lobby.`,
      embeds: [embed],
      ephemeral: false
    });
  }
};
