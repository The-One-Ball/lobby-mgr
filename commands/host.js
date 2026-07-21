const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const lobbyManager = require("../lobbyManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("host")
    .setDescription("Create a new Among Us lobby"),

  async execute(interaction) {
    const hostId = interaction.user.id;
    const hostName = interaction.user.username;

    const result = lobbyManager.createLobby(hostId, hostName);

    if (result.error) {
      return interaction.reply({ content: result.error, ephemeral: true });
    }

    const lobby = result.lobby;

    const embed = new EmbedBuilder()
      .setTitle(`${hostName}'s Lobby`)
      .setDescription(`Players:\n${lobby.players.map(p => `• ${p}`).join("\n")}`)
      .setColor("Orange")
      .setFooter({ text: "Among Us Lobby Manager" });

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

    const sentMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    lobbyManager.attachMessage(
      hostId,
      sentMessage.id,
      sentMessage.channel.id
    );
  }
};
