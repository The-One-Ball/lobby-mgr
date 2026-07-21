const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const lobbyManager = require("../lobbyManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("code")
    .setDescription("Set your Among Us lobby code")
    .addStringOption(option =>
      option.setName("value")
        .setDescription("The game code (4-6 letters)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const hostId = interaction.user.id;
    const code = interaction.options.getString("value").toUpperCase();

    // Validate code
    if (!/^[A-Z]{4,6}$/.test(code)) {
      return interaction.reply({
        content: "Invalid code. Use 4-6 letters only.",
        ephemeral: true
      });
    }

    const result = lobbyManager.setCode(hostId, code);

    if (result.error) {
      return interaction.reply({ content: result.error, ephemeral: true });
    }

    const lobby = result.lobby;

    const embed = new EmbedBuilder()
      .setTitle(`${lobby.hostName}'s Lobby`)
      .setDescription(
        `Players:\n${lobby.players.map(p => `• ${p}`).join("\n")}\n\n` +
        `**Game Code:** ${lobby.code}`
      )
      .setColor("Orange");

    return interaction.reply({
      content: `Game code set to **${code}**.`,
      embeds: [embed],
      ephemeral: false
    });
  }
};