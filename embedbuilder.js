const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

function buildLobbyEmbed(lobby) {
  const isClosed = lobby.status === 'closed';

  const color = isClosed ? 0xff0000 : 0x00ff00;
  const circle = isClosed ? '🔴' : '🟢';
  const statusText = isClosed ? 'CLOSED' : 'OPEN';

  const membersList = lobby.players.length
    ? lobby.players.map(id => `<@${id}>`).join('\n')
    : '(none)';

  const queueList = lobby.queue.length
    ? lobby.queue.map(id => `<@${id}>`).join('\n')
    : '(none)';

  const closedMessage = isClosed ? '\n\n**Thank you for playing!**' : '';

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Among Us Lobby')
    .setDescription(
      `${circle} **${statusText}**\n` +
      `👑 Host: <@${lobby.hostId}>\n` +
      `**Code:** ${lobby.code}\n\n` +
      `**Lobby Members (${lobby.currentCount}/${lobby.capacity}):**\n${membersList}\n\n` +
      `**Queue (${lobby.queue.length}):**\n${queueList}` +
      closedMessage
    );
}

function buildLobbyComponents(lobby) {
  if (lobby.status === 'closed') {
    return [];
  }

  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ready:${lobby.id}`).setLabel("I'm Ready").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`done:${lobby.id}`).setLabel("I'm Done").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`refresh:${lobby.id}`).setLabel('Refresh').setStyle(ButtonStyle.Primary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`pullin:${lobby.id}`).setLabel('Pull In').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`close:${lobby.id}`).setLabel('Close').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`open:${lobby.id}`).setLabel('Lobby Open').setStyle(ButtonStyle.Primary)
    )
  ];
}

module.exports = { buildLobbyEmbed, buildLobbyComponents };
