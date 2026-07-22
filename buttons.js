const { buildLobbyEmbed, buildLobbyComponents } = require('./embedBuilder');

module.exports = {
  async execute(interaction, lobbyManager) {
    const [action, lobbyId] = interaction.customId.split(':');
    const lobby = lobbyManager.getLobby(lobbyId);

    if (!lobby) return interaction.deferUpdate();

    // ---------------------------
    // I'M READY → Add user to queue + DM host
    // ---------------------------
    if (action === 'ready') {
      if (!lobby.queue.includes(interaction.user.id)) {
        lobby.queue.push(interaction.user.id);

        // DM host
        try {
          const hostUser = await interaction.client.users.fetch(lobby.hostId);
          await hostUser.send(
            `${interaction.user.username} is ready to play in lobby **${lobby.code}**.`
          );
        } catch {}
      }

      const embed = buildLobbyEmbed(lobby);
      const components = buildLobbyComponents(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);

      await msg.edit({ embeds: [embed], components });
      return interaction.deferUpdate();
    }

    // ---------------------------
    // I'M DONE → Remove user from lobby + queue + DM user
    // ---------------------------
    if (action === 'done') {
      lobby.players = lobby.players.filter(id => id !== interaction.user.id);
      lobby.queue = lobby.queue.filter(id => id !== interaction.user.id);
      lobby.currentCount = lobby.players.length;

      // DM user
      try {
        await interaction.user.send(`Thank you for playing!`);
      } catch {}

      const embed = buildLobbyEmbed(lobby);
      const components = buildLobbyComponents(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);

      await msg.edit({ embeds: [embed], components });
      return interaction.deferUpdate();
    }

    // ---------------------------
    // REFRESH → Delete old message + repost updated embed
    // ---------------------------
    if (action === 'refresh') {
      const embed = buildLobbyEmbed(lobby);
      const components = buildLobbyComponents(lobby);

      const oldMsg = await interaction.channel.messages.fetch(lobby.messageId);

      // Delete old message
      await oldMsg.delete().catch(() => {});

      // Send new updated message
      const newMsg = await interaction.channel.send({
        embeds: [embed],
        components
      });

      // Update stored message ID
      lobby.messageId = newMsg.id;

      return interaction.deferUpdate();
    }

    // ---------------------------
    // HOST-ONLY: PULL IN → Move next queue user into lobby + DM user
    // ---------------------------
    if (action === 'pullin') {
      if (interaction.user.id !== lobby.hostId) return interaction.deferUpdate();
      if (lobby.queue.length === 0) return interaction.deferUpdate();

      const userId = lobby.queue.shift();
      lobby.players.push(userId);
      lobby.currentCount = lobby.players.length;

      // DM user
      try {
        const pulledUser = await interaction.client.users.fetch(userId);
        await pulledUser.send(
          `You're up! Enter **${lobby.code}** to join the game!`
        );
      } catch {}

      const embed = buildLobbyEmbed(lobby);
      const components = buildLobbyComponents(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);

      await msg.edit({ embeds: [embed], components });
      return interaction.deferUpdate();
    }

    // ---------------------------
    // CLOSE → Close lobby + clear players/queue + red embed + message
    // ---------------------------
    if (action === 'close') {
      lobby.status = 'closed';
      lobby.players = [];
      lobby.queue = [];
      lobby.currentCount = 0;

      const embed = buildLobbyEmbed(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);

      await msg.edit({
        content: `Thank you for playing! This lobby is now **closed**.`,
        embeds: [embed],
        components: [] // remove buttons
      });

      return interaction.deferUpdate();
    }

    // ---------------------------
    // LOBBY OPEN → Announce lobby open + restore buttons
    // ---------------------------
    if (action === 'open') {
      lobby.status = 'open';

      const embed = buildLobbyEmbed(lobby);
      const components = buildLobbyComponents(lobby);
      const msg = await interaction.channel.messages.fetch(lobby.messageId);

      // Restore embed + buttons
      await msg.edit({ embeds: [embed], components });

      // Announce lobby open
      await interaction.channel.send(
        `@everyone **Lobby Open!** Code: **${lobby.code}**`
      );

      return interaction.deferUpdate();
    }
  }
};
