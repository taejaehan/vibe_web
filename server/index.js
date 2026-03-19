import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createServer as createViteServer } from 'vite'
import GameState from './gameState.js'

const app = express()
const server = createServer(app)
const io = new Server(server)
const gameState = new GameState()

// Vite 미들웨어 설정 (개발 모드)
async function setupVite() {
  const vite = await createViteServer({
    root: 'client',
    server: { middlewareMode: true },
    appType: 'mpa'
  })
  app.use(vite.middlewares)
}

// Socket.io 이벤트 핸들링
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  // 플레이어 접속
  socket.on('player:join', ({ playerId, name }) => {
    console.log(`👤 Player ${playerId} joined: ${name}`)

    // 기존 플레이어가 있으면 업데이트, 없으면 새로 추가
    const existing = gameState.getPlayer(playerId)
    if (existing) {
      existing.socketId = socket.id
      if (name) existing.name = name
    } else {
      gameState.addPlayer(playerId, name, socket.id)
    }

    // 해당 플레이어에게 현재 상태 전송
    socket.emit('game:state', gameState.getState())

    // 모든 클라이언트에게 플레이어 업데이트 알림
    io.emit('player:update', {
      playerId,
      ...gameState.getPlayer(playerId)
    })
  })

  // 플레이어 이름 변경
  socket.on('player:name', ({ playerId, name }) => {
    gameState.updatePlayerName(playerId, name)
    io.emit('player:update', {
      playerId,
      ...gameState.getPlayer(playerId)
    })
  })

  // 플레이어 코드 제출
  socket.on('player:code', ({ playerId, code }) => {
    console.log(`📝 Player ${playerId} submitted code (${code.length} chars)`)
    gameState.updatePlayerCode(playerId, code)
    // 모든 클라이언트(특히 stage)에게 코드 업데이트 알림
    io.emit('player:update', {
      playerId,
      code,
      status: gameState.getPlayer(playerId)?.status
    })
  })

  // 플레이어 준비 완료
  socket.on('player:ready', ({ playerId }) => {
    gameState.updatePlayerStatus(playerId, 'ready')
    io.emit('player:update', {
      playerId,
      ...gameState.getPlayer(playerId)
    })
  })

  // 플레이어 에러 상태
  socket.on('player:error', ({ playerId, error }) => {
    gameState.updatePlayerStatus(playerId, 'error')
    io.emit('player:update', {
      playerId,
      status: 'error',
      error
    })
  })

  // Admin: 게임 모드 변경
  socket.on('admin:setMode', ({ gameMode }) => {
    gameState.setGameMode(gameMode)
    io.emit('game:state', gameState.getState())
  })

  // Admin: 게임 시작
  socket.on('admin:start', () => {
    gameState.startGame()
    io.emit('game:start', {
      gameMode: gameState.gameMode,
      config: {}
    })
  })

  // Admin: 게임 리셋
  socket.on('admin:reset', () => {
    gameState.resetGame()
    io.emit('game:state', gameState.getState())
  })

  // Admin: 미션 전송
  socket.on('admin:mission', ({ text, timeLimit }) => {
    gameState.setMission(text, timeLimit)
    io.emit('game:mission', { text, timeLimit })
  })

  // Admin: 특수 이벤트
  socket.on('admin:event', ({ type, targetId, data }) => {
    io.emit('game:event', { type, targetId, data })
  })

  // Admin: 플레이어 강제 리셋
  socket.on('admin:resetPlayer', ({ playerId }) => {
    gameState.updatePlayerCode(playerId, '')
    gameState.updatePlayerStatus(playerId, 'connected')
    io.emit('player:update', {
      playerId,
      code: '',
      status: 'connected'
    })
  })

  // Stage/Admin 접속 시 전체 상태 요청
  socket.on('request:state', () => {
    socket.emit('game:state', gameState.getState())
  })

  // 연결 해제
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id)
    const player = gameState.getPlayerBySocketId(socket.id)
    if (player) {
      player.status = 'disconnected'
      io.emit('player:update', {
        playerId: player.id,
        status: 'disconnected'
      })
    }
  })
})

// 서버 시작
const PORT = process.env.PORT || 3000

setupVite().then(() => {
  server.listen(PORT, () => {
    console.log(`
🎮 VibeBattle Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Stage:  http://localhost:${PORT}/stage.html
🎮 Player: http://localhost:${PORT}/player.html?id=1
🔧 Admin:  http://localhost:${PORT}/admin.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `)
  })
})
