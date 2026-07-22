const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update lobby settings')
    .addStringOption(opt =>
      opt.setName('lobby')
        .setDescription('Lobby ID')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('code')
        .setDescription('New lobby code')
        .setRequired(false)
    )
    .addIntegerOption(opt =>
      opt.setName('capacity')
        .setDescription('New capacity')
        .setRequired(false)
    ),

  async execute(interaction, lobbyManager) {
    const lobbyId = interaction.options.getString('lobby');
    const newCode = interaction.options.getString('code');
    const newCapacity = interaction.options.getInteger('capacity');

    const lobby = lobbyManager.getLobby(lobbyId);
    if (!lobby) {
      return interaction.reply({ content: 'Lobby not found.', ephemeral: true });
    }

    if (interaction.user.id !== lobby.hostId) {
      return interaction.reply({ content: 'Only the host can update the lobby.', ephemeral: true });
    }

    if (newCode) lobby.code = newCode.toUpperCase();
    if (newCapacity) lobby.capacity = newCapacity;

    return interaction.reply({ content: 'Lobby updated.', ephemeral: true });
  }
};
