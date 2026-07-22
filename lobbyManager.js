class LobbyManager {
  constructor() {
    this.lobbies = new Map();
    this.nextId = 1;
  }

  createLobby(data) {
    const id = String(this.nextId++);

    const lobby = {
      id,
      guildId: data.guildId,
      channelId: data.channelId,
      hostId: data.hostId,
      hostName: data.hostName,
      code: data.code,
      capacity: data.capacity,
      currentCount: 1,
      status: 'open',
      players: [data.hostId],
      queue: [],
      messageId: null
    };

    this.lobbies.set(id, lobby);
    return lobby;
  }

  getLobby(id) {
    return this.lobbies.get(String(id)) || null;
  }
}

module.exports = new LobbyManager();
