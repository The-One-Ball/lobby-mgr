const { buildLobbyEmbed } = require('./embedBuilder');

module.exports = {
  async execute(interaction, lobbyManager) {
    const [action, lobbyId] = interaction.customId.split(':');
    const lobby = lobbyManager.getLobby(lobbyId);

    if (!lobby) {
      return interaction.deferUpdate();
    }

    // READY
    if (action === 'ready') {
      if (!lobby.players.includes(interaction.user.id)) {
        lobby.players.push(interaction.user.id);
        lobby.currentCount = lobby.players.length;

        // DM host
        try {
          const hostUser = await interaction.client.users.fetch(lobby.hostId);
          await hostUser.send(`${interaction.user.username} has joined your lobby (${lobby.code}).`);
        } catch {}
      }

      const embed = buildLobbyEmbed(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);
      await msg.edit({ embeds: [embed] });

      return interaction.deferUpdate();
    }

    // DONE
    if (action === 'done') {
      lobby.players = lobby.players.filter(id => id !== interaction.user.id);
      lobby.currentCount = lobby.players.length;

      const embed = buildLobbyEmbed(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);
      await msg.edit({ embeds: [embed] });

      return interaction.deferUpdate();
    }

    // REFRESH
    if (action === 'refresh') {
      const embed = buildLobbyEmbed(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);
      await msg.edit({ embeds: [embed] });

      return interaction.deferUpdate();
    }

    // PULL IN
    if (action === 'pullin') {
      if (interaction.user.id !== lobby.hostId) {
        return interaction.deferUpdate();
      }

      if (lobby.queue.length === 0) {
        return interaction.deferUpdate();
      }

      const userId = lobby.queue.shift();
      lobby.players.push(userId);
      lobby.currentCount = lobby.players.length;

      // DM pulled user
      try {
        const pulledUser = await interaction.client.users.fetch(userId);
        await pulledUser.send(`You have been pulled into the lobby (${lobby.code}) by ${lobby.hostName}.`);
      } catch {}

      const embed = buildLobbyEmbed(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);
      await msg.edit({ embeds: [embed] });

      return interaction.deferUpdate();
    }

    // CLOSE
    if (action === 'close') {
      lobby.status = 'closed';
      lobby.players = [];
      lobby.queue = [];
      lobby.currentCount = 0;

      const embed = buildLobbyEmbed(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);

      await msg.edit({
        content: 'Lobby is now closed.',
        embeds: [embed],
        components: [] // remove buttons
      });

      return interaction.deferUpdate();
    }

    // OPEN
    if (action === 'open') {
      lobby.status = 'open';

      const embed = buildLobbyEmbed(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);
      await msg.edit({ embeds: [embed], components: [] });

      return interaction.deferUpdate();
    }
  }
};
