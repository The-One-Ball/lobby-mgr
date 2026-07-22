const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a player from the lobby')
    .addUserOption(opt =>
      opt.setName('player')
        .setDescription('Player to kick')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('lobby')
        .setDescription('Lobby ID')
        .setRequired(true)
    ),

  async execute(interaction, lobbyManager) {
    const player = interaction.options.getUser('player');
    const lobbyId = interaction.options.getString('lobby');

    const lobby = lobbyManager.getLobby(lobbyId);
    if (!lobby) {
      return interaction.reply({ content: 'Lobby not found.', ephemeral: true });
    }

    if (interaction.user.id !== lobby.hostId) {
      return interaction.reply({ content: 'Only the host can kick players.', ephemeral: true });
    }

    lobby.players = lobby.players.filter(id => id !== player.id);
    lobby.currentCount = lobby.players.length;

    return interaction.reply({ content: `Kicked ${player.username} from lobby ${lobby.code}.`, ephemeral: true });
  }
};
