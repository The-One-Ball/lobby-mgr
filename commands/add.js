const { SlashCommandBuilder } = require('discord.js');
const { buildLobbyEmbed, buildLobbyComponents } = require('../embedBuilder');

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
    const lobby = lobbyManager.getLobbyByHost(interaction.user.id);

    if (!lobby) {
      return interaction.reply({
        content: 'You are not the host of any active lobby.',
        ephemeral: true
      });
    }

    // Add player if not already in lobby
    if (!lobby.players.includes(player.id)) {
      lobby.players.push(player.id);
      lobby.currentCount = lobby.players.length;
    }

    // Update the lobby embed + buttons
    try {
      const embed = buildLobbyEmbed(lobby);
      const components = buildLobbyComponents(lobby);

      const channel = await interaction.guild.channels.fetch(lobby.channelId);
      const msg = await channel.messages.fetch(lobby.messageId);

      await msg.edit({ embeds: [embed], components });
    } catch (err) {
      console.error("Failed to update lobby message:", err);

      return interaction.reply({
        content: `Added ${player.username}, but I couldn't update the lobby message due to missing permissions.`,
        ephemeral: true
      });
    }

    // Success
    return interaction.reply({
      content: `Added ${player.username} to lobby ${lobby.code}.`,
      ephemeral: true
    });
  }
};
