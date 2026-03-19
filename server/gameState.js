// 서버 사이드 게임 상태 관리

class GameState {
  constructor() {
    this.players = new Map() // playerId -> { id, name, code, status, socketId }
    this.gameMode = 'sandbox'
    this.status = 'waiting' // waiting, playing, paused
    this.mission = null
    this.gameData = {}
  }

  addPlayer(playerId, name, socketId) {
    this.players.set(playerId, {
      id: playerId,
      name: name || `Player ${playerId}`,
      code: '',
      status: 'connected', // connected, ready, error
      socketId: socketId,
      lastUpdate: Date.now()
    })
    return this.players.get(playerId)
  }

  removePlayer(playerId) {
    this.players.delete(playerId)
  }

  getPlayer(playerId) {
    return this.players.get(playerId)
  }

  getPlayerBySocketId(socketId) {
    for (const [id, player] of this.players) {
      if (player.socketId === socketId) return player
    }
    return null
  }

  updatePlayerCode(playerId, code) {
    const player = this.players.get(playerId)
    if (player) {
      player.code = code
      player.lastUpdate = Date.now()
    }
  }

  updatePlayerStatus(playerId, status) {
    const player = this.players.get(playerId)
    if (player) {
      player.status = status
    }
  }

  updatePlayerName(playerId, name) {
    const player = this.players.get(playerId)
    if (player) {
      player.name = name
    }
  }

  setGameMode(mode) {
    this.gameMode = mode
  }

  setMission(text, timeLimit) {
    this.mission = { text, timeLimit, startTime: Date.now() }
  }

  clearMission() {
    this.mission = null
  }

  startGame() {
    this.status = 'playing'
  }

  resetGame() {
    this.status = 'waiting'
    this.mission = null
    for (const player of this.players.values()) {
      player.code = ''
      player.status = 'connected'
    }
  }

  getState() {
    return {
      players: Object.fromEntries(this.players),
      gameMode: this.gameMode,
      status: this.status,
      mission: this.mission,
      gameData: this.gameData
    }
  }

  getPublicPlayerData() {
    const data = {}
    for (const [id, player] of this.players) {
      data[id] = {
        id: player.id,
        name: player.name,
        status: player.status
      }
    }
    return data
  }
}

export default GameState
