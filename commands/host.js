const { SlashCommandBuilder } = require('discord.js');
const { buildLobbyEmbed, buildLobbyComponents } = require('../embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('host')
    .setDescription('Create an Among Us lobby')
    .addStringOption(opt =>
      opt.setName('code')
        .setDescription('6-character lobby code')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('capacity')
        .setDescription('Lobby capacity (1–15)')
        .setRequired(true)
    ),

  async execute(interaction, lobbyManager) {
    const code = interaction.options.getString('code').toUpperCase();
    const capacity = interaction.options.getInteger('capacity');

    await interaction.deferReply();

    const lobby = lobbyManager.createLobby({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      hostId: interaction.user.id,
      hostName: interaction.user.username,
      code,
      capacity
    });

    const embed = buildLobbyEmbed(lobby);
    const components = buildLobbyComponents(lobby);

    const msg = await interaction.editReply({
      embeds: [embed],
      components
    });

    lobby.messageId = msg.id;

    await interaction.channel.send(`@everyone Lobby One: ${code}`);
  }
};
