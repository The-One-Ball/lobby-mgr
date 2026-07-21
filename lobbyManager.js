const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "lobbies.json");

function loadLobbies() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading lobbies.json:", err);
    return {};
  }
}

function saveLobbies(lobbies) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(lobbies, null, 2));
  } catch (err) {
    console.error("Error saving lobbies.json:", err);
  }
}

function createLobby(hostId, hostName) {
  const lobbies = loadLobbies();

  if (lobbies[hostId]) {
    return { error: "You already have an active lobby." };
  }

  lobbies[hostId] = {
    hostId,
    hostName,
    players: [hostName],
    code: null,
    createdAt: Date.now()
  };

  saveLobbies(lobbies);

  return { success: true, lobby: lobbies[hostId] };
}

function joinLobby(hostId, playerName) {
  const lobbies = loadLobbies();

  if (!lobbies[hostId]) {
    return { error: "That lobby does not exist." };
  }

  if (lobbies[hostId].players.includes(playerName)) {
    return { error: "You are already in this lobby." };
  }

  lobbies[hostId].players.push(playerName);
  saveLobbies(lobbies);

  return { success: true, lobby: lobbies[hostId] };
}

function leaveLobby(hostId, playerName) {
  const lobbies = loadLobbies();

  if (!lobbies[hostId]) {
    return { error: "That lobby does not exist." };
  }

  const index = lobbies[hostId].players.indexOf(playerName);

  if (index === -1) {
    return { error: "You are not in this lobby." };
  }

  lobbies[hostId].players.splice(index, 1);

  saveLobbies(lobbies);

  return { success: true, lobby: lobbies[hostId] };
}

function closeLobby(hostId) {
  const lobbies = loadLobbies();

  if (!lobbies[hostId]) {
    return { error: "You do not have an active lobby." };
  }

  delete lobbies[hostId];
  saveLobbies(lobbies);

  return { success: true };
}

function attachMessage(hostId, messageId, channelId) {
  const lobbies = loadLobbies();

  if (!lobbies[hostId]) return;

  lobbies[hostId].messageId = messageId;
  lobbies[hostId].channelId = channelId;

  saveLobbies(lobbies);
}

function setCode(hostId, code) {
  const lobbies = loadLobbies();

  if (!lobbies[hostId]) {
    return { error: "You do not have an active lobby." };
  }

  lobbies[hostId].code = code;
  saveLobbies(lobbies);

  return { success: true, lobby: lobbies[hostId] };
}

module.exports = {
  loadLobbies,
  saveLobbies,
  createLobby,
  joinLobby,
  leaveLobby,
  closeLobby,
  attachMessage,
  setCode
};