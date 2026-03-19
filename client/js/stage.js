// Stage - 12분할 캔버스 + 메인 루프 + 픽셀워 모드
import { executePlayerCode, executePixelWarCode } from './gameEngine.js'

const canvas = document.getElementById('stage-canvas')
const ctx = canvas.getContext('2d')
const socket = io()

// 그리드 설정 (sandbox용)
const GRID = {
  cols: 4,
  rows: 3,
  total: 12
}

// 픽셀워 설정
const PIXELWAR = {
  ballRadius: 25,
  timeLimit: 180,
  teams: {
    red: { color: '#ff4444', players: [1, 2, 3, 4, 5, 6] },
    blue: { color: '#4444ff', players: [7, 8, 9, 10, 11, 12] }
  },
  paintCanvas: null,
  paintCtx: null,
  startTime: null,
  score: { red: 0, blue: 0 },
  balls: {},
  gameOver: false
}

// 캔버스 크기 (16:9 비율 유지)
function resizeCanvas() {
  const ratio = 16 / 9
  let width = window.innerWidth
  let height = window.innerHeight

  if (width / height > ratio) {
    width = height * ratio
  } else {
    height = width / ratio
  }

  canvas.width = width
  canvas.height = height

  GRID.cellW = width / GRID.cols
  GRID.cellH = height / GRID.rows

  // 픽셀워 페인트 캔버스도 리사이즈
  if (PIXELWAR.paintCanvas) {
    // 기존 내용 보존
    const oldCanvas = PIXELWAR.paintCanvas
    PIXELWAR.paintCanvas = document.createElement('canvas')
    PIXELWAR.paintCanvas.width = width
    PIXELWAR.paintCanvas.height = height
    PIXELWAR.paintCtx = PIXELWAR.paintCanvas.getContext('2d')
    PIXELWAR.paintCtx.drawImage(oldCanvas, 0, 0, width, height)
  }
}

// 플레이어 상태 저장
const players = {}
let gameMode = 'sandbox'
let mission = null
let frame = 0

// ============ SANDBOX 모드 함수들 ============

function getCell(playerId) {
  const id = parseInt(playerId)
  return {
    x: ((id - 1) % GRID.cols) * GRID.cellW,
    y: Math.floor((id - 1) / GRID.cols) * GRID.cellH
  }
}

function drawEmptyCell(ctx, x, y, w, h, playerId) {
  ctx.fillStyle = '#2a2a3e'
  ctx.fillRect(x, y, w, h)

  ctx.fillStyle = '#444'
  ctx.font = `${Math.min(w, h) * 0.15}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('EMPTY', x + w/2, y + h/2 - 10)
  ctx.font = `${Math.min(w, h) * 0.08}px sans-serif`
  ctx.fillText(`Player ${playerId}`, x + w/2, y + h/2 + 20)
}

function drawErrorCell(ctx, x, y, w, h, player, error) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(x, y, w, h)

  ctx.strokeStyle = '#ff4444'
  ctx.lineWidth = 4
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4)

  ctx.fillStyle = '#ff4444'
  ctx.font = `${Math.min(w, h) * 0.12}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('🔴 ERROR', x + w/2, y + 30)

  ctx.fillStyle = '#ff8888'
  ctx.font = `${Math.min(w, h) * 0.06}px monospace`
  const errorLines = error.split('\n').slice(0, 3)
  errorLines.forEach((line, i) => {
    const truncated = line.length > 30 ? line.slice(0, 30) + '...' : line
    ctx.fillText(truncated, x + w/2, y + h/2 + i * 20)
  })

  ctx.fillStyle = '#666'
  ctx.font = `${Math.min(w, h) * 0.08}px sans-serif`
  ctx.fillText(`[${player.name}]`, x + w/2, y + h - 20)
}

function drawPlayerName(ctx, x, y, w, player) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(x, y, w, 24)

  ctx.fillStyle = '#fff'
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`#${player.id} ${player.name}`, x + 8, y + 5)
}

function drawGrid() {
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2

  for (let i = 1; i < GRID.cols; i++) {
    ctx.beginPath()
    ctx.moveTo(i * GRID.cellW, 0)
    ctx.lineTo(i * GRID.cellW, canvas.height)
    ctx.stroke()
  }

  for (let i = 1; i < GRID.rows; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * GRID.cellH)
    ctx.lineTo(canvas.width, i * GRID.cellH)
    ctx.stroke()
  }
}

function drawMission() {
  if (!mission || !mission.text) return

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, canvas.width, 50)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`📋 미션: ${mission.text}`, canvas.width / 2, 32)
}

function sandboxLoop() {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let playerId = 1; playerId <= GRID.total; playerId++) {
    const { x, y } = getCell(playerId)
    const player = players[playerId]

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, GRID.cellW, GRID.cellH)
    ctx.clip()

    if (!player || !player.code) {
      drawEmptyCell(ctx, x, y, GRID.cellW, GRID.cellH, playerId)
    } else {
      ctx.translate(x, y)

      const world = {
        frame,
        cellW: GRID.cellW,
        cellH: GRID.cellH,
        players: Object.fromEntries(
          Object.entries(players).map(([id, p]) => [id, { id: p.id, name: p.name, status: p.status }])
        ),
        gameData: {},
        myData: player.data || {}
      }

      const result = executePlayerCode(player.code, ctx, world, player)

      ctx.translate(-x, -y)

      if (result.error) {
        player.hasError = true
        player.errorMessage = result.error
        drawErrorCell(ctx, x, y, GRID.cellW, GRID.cellH, player, result.error)
      } else {
        player.hasError = false
        drawPlayerName(ctx, x, y, GRID.cellW, player)
      }
    }

    ctx.restore()
  }

  drawGrid()
  drawMission()
}

// ============ PIXELWAR 모드 함수들 ============

function getTeam(playerId) {
  const id = parseInt(playerId)
  if (PIXELWAR.teams.red.players.includes(id)) return 'red'
  if (PIXELWAR.teams.blue.players.includes(id)) return 'blue'
  return null
}

function getTeamColor(playerId) {
  const team = getTeam(playerId)
  return team ? PIXELWAR.teams[team].color : '#888'
}

function initPixelWar() {
  // 페인트 캔버스 생성
  PIXELWAR.paintCanvas = document.createElement('canvas')
  PIXELWAR.paintCanvas.width = canvas.width
  PIXELWAR.paintCanvas.height = canvas.height
  PIXELWAR.paintCtx = PIXELWAR.paintCanvas.getContext('2d')

  // 검정 배경으로 초기화
  PIXELWAR.paintCtx.fillStyle = '#111'
  PIXELWAR.paintCtx.fillRect(0, 0, canvas.width, canvas.height)

  PIXELWAR.startTime = Date.now()
  PIXELWAR.gameOver = false
  PIXELWAR.score = { red: 0, blue: 0 }

  // 각 플레이어 공 초기화
  for (let id = 1; id <= 12; id++) {
    PIXELWAR.balls[id] = {
      x: 50 + Math.random() * (canvas.width - 100),
      y: 50 + Math.random() * (canvas.height - 100)
    }
  }
}

function calculateScore() {
  const imageData = PIXELWAR.paintCtx.getImageData(0, 0, PIXELWAR.paintCanvas.width, PIXELWAR.paintCanvas.height)
  const data = imageData.data
  let red = 0, blue = 0

  // 샘플링 (성능 위해 매 10픽셀마다)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // 빨강 판정 (r > 150, b < 100)
    if (r > 150 && b < 100) red++
    // 파랑 판정 (b > 150, r < 100)
    else if (b > 150 && r < 100) blue++
  }

  PIXELWAR.score = { red, blue }
}

function pixelwarLoop() {
  if (!PIXELWAR.paintCanvas) {
    initPixelWar()
  }

  // 시간 체크
  const elapsed = (Date.now() - PIXELWAR.startTime) / 1000
  const remaining = Math.max(0, PIXELWAR.timeLimit - elapsed)

  if (remaining <= 0 && !PIXELWAR.gameOver) {
    PIXELWAR.gameOver = true
  }

  // 각 플레이어 코드 실행하여 공 위치 업데이트
  for (let playerId = 1; playerId <= 12; playerId++) {
    const player = players[playerId]
    if (!player || !player.code) continue

    const ball = PIXELWAR.balls[playerId]
    if (!ball) {
      PIXELWAR.balls[playerId] = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      }
      continue
    }

    // 플레이어 코드 실행
    const world = {
      frame,
      canvasW: canvas.width,
      canvasH: canvas.height,
      myBall: ball,
      myTeam: getTeam(playerId),
      myData: player.data || {},
      allBalls: { ...PIXELWAR.balls },
      score: PIXELWAR.score
    }

    const result = executePixelWarCode(player.code, world, player)

    if (!result.error) {
      // 경계 체크
      ball.x = Math.max(PIXELWAR.ballRadius, Math.min(canvas.width - PIXELWAR.ballRadius, ball.x))
      ball.y = Math.max(PIXELWAR.ballRadius, Math.min(canvas.height - PIXELWAR.ballRadius, ball.y))

      // 페인트 캔버스에 그리기 (게임 진행 중일 때만)
      if (!PIXELWAR.gameOver) {
        PIXELWAR.paintCtx.beginPath()
        PIXELWAR.paintCtx.arc(ball.x, ball.y, PIXELWAR.ballRadius, 0, Math.PI * 2)
        PIXELWAR.paintCtx.fillStyle = getTeamColor(playerId)
        PIXELWAR.paintCtx.fill()
      }
    }
  }

  // 스코어 계산 (매 30프레임마다)
  if (frame % 30 === 0) {
    calculateScore()
  }

  // === 화면에 그리기 ===

  // 1. 페인트 캔버스 표시
  ctx.drawImage(PIXELWAR.paintCanvas, 0, 0)

  // 2. 각 플레이어 공 표시 (현재 위치에 작은 원)
  for (let playerId = 1; playerId <= 12; playerId++) {
    const player = players[playerId]
    const ball = PIXELWAR.balls[playerId]
    if (!ball) continue

    const color = getTeamColor(playerId)
    const isActive = player && player.code

    // 공 테두리
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, PIXELWAR.ballRadius, 0, Math.PI * 2)
    ctx.strokeStyle = isActive ? '#fff' : '#666'
    ctx.lineWidth = 3
    ctx.stroke()

    // 플레이어 번호
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(playerId.toString(), ball.x, ball.y)
  }

  // 3. 스코어보드
  const scoreHeight = 60
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, canvas.width, scoreHeight)

  // 타이머
  const mins = Math.floor(remaining / 60)
  const secs = Math.floor(remaining % 60)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`⏱ ${mins}:${secs.toString().padStart(2, '0')}`, canvas.width / 2, 38)

  // 빨강 스코어
  const total = PIXELWAR.score.red + PIXELWAR.score.blue || 1
  const redPercent = Math.round((PIXELWAR.score.red / total) * 100)
  const bluePercent = 100 - redPercent

  ctx.fillStyle = PIXELWAR.teams.red.color
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`🔴 RED: ${redPercent}%`, 30, 38)

  ctx.fillStyle = PIXELWAR.teams.blue.color
  ctx.textAlign = 'right'
  ctx.fillText(`${bluePercent}% :BLUE 🔵`, canvas.width - 30, 38)

  // 스코어바
  const barY = 52
  const barH = 6
  ctx.fillStyle = PIXELWAR.teams.red.color
  ctx.fillRect(0, barY, canvas.width * (redPercent / 100), barH)
  ctx.fillStyle = PIXELWAR.teams.blue.color
  ctx.fillRect(canvas.width * (redPercent / 100), barY, canvas.width * (bluePercent / 100), barH)

  // 4. 게임 오버 화면
  if (PIXELWAR.gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const winner = redPercent > bluePercent ? 'RED' : bluePercent > redPercent ? 'BLUE' : 'DRAW'
    const winColor = winner === 'RED' ? PIXELWAR.teams.red.color :
                     winner === 'BLUE' ? PIXELWAR.teams.blue.color : '#fff'

    ctx.fillStyle = winColor
    ctx.font = 'bold 72px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(winner === 'DRAW' ? '🤝 DRAW!' : `🏆 ${winner} WINS!`, canvas.width / 2, canvas.height / 2 - 30)

    ctx.fillStyle = '#fff'
    ctx.font = '36px sans-serif'
    ctx.fillText(`${redPercent}% vs ${bluePercent}%`, canvas.width / 2, canvas.height / 2 + 40)
  }
}

// ============ 메인 루프 ============

function mainLoop() {
  frame++

  if (gameMode === 'pixelwar') {
    pixelwarLoop()
  } else {
    sandboxLoop()
  }

  requestAnimationFrame(mainLoop)
}

// ============ Socket 이벤트 ============

socket.on('connect', () => {
  console.log('🔌 Stage connected')
  socket.emit('request:state')
})

socket.on('game:state', (state) => {
  console.log('📦 Game state received:', state)

  // 게임 모드 변경 감지
  const modeChanged = state.gameMode !== gameMode
  gameMode = state.gameMode

  if (modeChanged) {
    console.log('🎮 Mode changed to:', gameMode)
    if (gameMode === 'pixelwar') {
      initPixelWar()
    } else {
      // sandbox로 돌아갈 때 pixelwar 캔버스 정리
      PIXELWAR.paintCanvas = null
    }
  }

  // 리셋 감지
  if (state.status === 'waiting' && PIXELWAR.paintCanvas) {
    PIXELWAR.paintCanvas = null
  }

  mission = state.mission

  for (const [id, player] of Object.entries(state.players)) {
    const isNew = !players[id]
    players[id] = { ...players[id], ...player, data: players[id]?.data || {} }
    // 새 플레이어이거나 코드가 있으면 setup 필요
    if (isNew && player.code) {
      players[id].needsSetup = true
    }
  }
})

socket.on('player:update', (data) => {
  console.log('👤 Player update:', data.playerId, 'code length:', data.code?.length)
  if (data.code) {
    console.log('📝 Code preview:', data.code.slice(0, 100))
  }
  const { playerId, ...rest } = data

  if (!players[playerId]) {
    players[playerId] = { id: playerId, data: {} }
  }

  if (rest.code !== undefined && rest.code !== players[playerId].code) {
    players[playerId].needsSetup = true
  }

  Object.assign(players[playerId], rest)
})

socket.on('game:mission', (data) => {
  mission = data
})

socket.on('game:start', (data) => {
  console.log('🎮 Game started:', data.gameMode)
  gameMode = data.gameMode
  if (gameMode === 'pixelwar') {
    initPixelWar()
  }
})

// 초기화
resizeCanvas()
window.addEventListener('resize', resizeCanvas)
mainLoop()
