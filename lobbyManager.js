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

  getLobbyByHost(hostId) {
    for (const lobby of this.lobbies.values()) {
      if (lobby.hostId === hostId && lobby.status === 'open') {
        return lobby;
      }
    }
    return null;
  }

  getAllLobbies() {
    return Array.from(this.lobbies.values());
  }

  closeAllLobbies() {
    for (const lobby of this.lobbies.values()) {
      lobby.status = 'closed';
      lobby.players = [];
      lobby.queue = [];
      lobby.currentCount = 0;
    }
  }
}

module.exports = new LobbyManager();
