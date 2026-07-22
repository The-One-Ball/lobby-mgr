const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a player to your lobby (host only)')
    .addUserOption(opt =>
      opt.setName('player')
        .setDescription('Player to add')
        .setRequired(true)
    ),

  async execute(interaction, lobbyManager) {
    const player = interaction.options.getUser('player');

    // Find the lobby where this user is the host
    const hostLobby = lobbyManager.getLobbyByHost(interaction.user.id);

    // If the user is not a host of any lobby
    if (!hostLobby) {
      return interaction.reply({
        content: 'You are not the host of any active lobby.',
        ephemeral: true
      });
    }

    // Add player if not already in lobby
    if (!hostLobby.players.includes(player.id)) {
      hostLobby.players.push(player.id);
      hostLobby.currentCount = hostLobby.players.length;
    }

    return interaction.reply({
      content: `Added ${player.username} to lobby ${hostLobby.code}.`,
      ephemeral: false
    });
  }
};
