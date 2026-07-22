const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transferhost')
    .setDescription('Transfer lobby host to another player')
    .addUserOption(opt =>
      opt.setName('player')
        .setDescription('New host')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('lobby')
        .setDescription('Lobby ID')
        .setRequired(true)
    ),

  async execute(interaction, lobbyManager) {
    const newHost = interaction.options.getUser('player');
    const lobbyId = interaction.options.getString('lobby');

    const lobby = lobbyManager.getLobby(lobbyId);
    if (!lobby) {
      return interaction.reply({ content: 'Lobby not found.', ephemeral: true });
    }

    if (interaction.user.id !== lobby.hostId) {
      return interaction.reply({ content: 'Only the current host can transfer ownership.', ephemeral: true });
    }

    lobby.hostId = newHost.id;
    lobby.hostName = newHost.username;

    return interaction.reply({ content: `Host transferred to ${newHost.username}.`, ephemeral: true });
  }
};
