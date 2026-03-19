// Player - 에디터 + 소켓 클라이언트 + 미리보기
import { executePlayerCode, executePixelWarCode } from './gameEngine.js'

// URL에서 플레이어 ID 추출
const params = new URLSearchParams(window.location.search)
const playerId = parseInt(params.get('id')) || 1

// DOM 요소
const playerIdEl = document.getElementById('player-id')
const modalPlayerIdEl = document.getElementById('modal-player-id')
const playerNameEl = document.getElementById('player-name')
const statusBadge = document.getElementById('status-badge')
const missionBanner = document.getElementById('mission-banner')
const missionText = document.getElementById('mission-text')
const previewCanvas = document.getElementById('preview-canvas')
const previewCtx = previewCanvas.getContext('2d')
const runBtn = document.getElementById('run-btn')
const statStatus = document.getElementById('stat-status')
const statFps = document.getElementById('stat-fps')

// 모달 요소
const nameModal = document.getElementById('name-modal')
const nameInput = document.getElementById('name-input')
const nameSubmit = document.getElementById('name-submit')

// 상태
let editor = null
let socket = null
let playerName = ''
let currentCode = ''
let playerData = {}
let frame = 0
let lastFrameTime = performance.now()
let fps = 60
let gameMode = 'sandbox'
let myBall = { x: 160, y: 120 }

// 팀 정보
const TEAMS = {
  red: { color: '#ff4444', players: [1, 2, 3, 4, 5, 6] },
  blue: { color: '#4444ff', players: [7, 8, 9, 10, 11, 12] }
}

function getTeam(id) {
  if (TEAMS.red.players.includes(id)) return 'red'
  if (TEAMS.blue.players.includes(id)) return 'blue'
  return null
}

const myTeam = getTeam(playerId)
const myTeamColor = myTeam ? TEAMS[myTeam].color : '#888'

// 플레이어 ID 표시
playerIdEl.textContent = playerId
modalPlayerIdEl.textContent = playerId

// 기본 코드 템플릿
const sandboxTemplate = `function setup(cell) {
  // 초기화 코드
  cell.data.x = cell.width / 2
  cell.data.y = cell.height / 2
  cell.data.hue = Math.random() * 360
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  // 배경
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, cellW, cellH)

  // 애니메이션
  const x = myData.x + Math.sin(frame * 0.05) * 30
  const y = myData.y + Math.cos(frame * 0.03) * 20

  // 원 그리기
  ctx.beginPath()
  ctx.arc(x, y, 40, 0, Math.PI * 2)
  ctx.fillStyle = \`hsl(\${(myData.hue + frame) % 360}, 70%, 60%)\`
  ctx.fill()

  // 텍스트
  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Hello! 🎮', cellW/2, cellH - 30)
}`

// 플레이어별 다른 기본 패턴
const pixelwarTemplates = {
  // 1번: 원형 궤도
  1: `// 🔴 원형 궤도로 영역을 넓혀라!
function setup(cell) {
  cell.data.radius = 50
}
function draw(ctx, world) {
  const { frame, myBall, canvasW, canvasH, myData } = world
  myData.radius = Math.min(myData.radius + 0.5, 300)
  myBall.x = canvasW/2 + Math.cos(frame * 0.04) * myData.radius
  myBall.y = canvasH/2 + Math.sin(frame * 0.04) * myData.radius
}`,

  // 2번: 튕기는 공
  2: `// 🔴 벽에 튕기며 전진!
function setup(cell) {
  cell.data.vx = 5
  cell.data.vy = 3
}
function draw(ctx, world) {
  const { myBall, canvasW, canvasH, myData } = world
  myBall.x += myData.vx
  myBall.y += myData.vy
  if (myBall.x < 25 || myBall.x > canvasW - 25) myData.vx *= -1
  if (myBall.y < 25 || myBall.y > canvasH - 25) myData.vy *= -1
}`,

  // 3번: 지그재그
  3: `// 🔴 지그재그로 영역 확보!
function setup(cell) {
  cell.data.dir = 1
}
function draw(ctx, world) {
  const { frame, myBall, canvasW, canvasH, myData } = world
  myBall.x += 4
  myBall.y += myData.dir * 3
  if (myBall.x > canvasW - 25) { myBall.x = 25; myBall.y += 50 }
  if (myBall.y < 25 || myBall.y > canvasH - 25) myData.dir *= -1
}`,

  // 4번: 나선형
  4: `// 🔴 나선형으로 중앙부터 점령!
function setup(cell) {
  cell.data.angle = 0
  cell.data.radius = 0
}
function draw(ctx, world) {
  const { myBall, canvasW, canvasH, myData } = world
  myData.angle += 0.08
  myData.radius += 0.3
  if (myData.radius > 350) myData.radius = 0
  myBall.x = canvasW/2 + Math.cos(myData.angle) * myData.radius
  myBall.y = canvasH/2 + Math.sin(myData.angle) * myData.radius
}`,

  // 5번: 8자 움직임
  5: `// 🔴 8자로 넓은 영역을!
function setup(cell) {}
function draw(ctx, world) {
  const { frame, myBall, canvasW, canvasH } = world
  myBall.x = canvasW/2 + Math.sin(frame * 0.03) * 250
  myBall.y = canvasH/2 + Math.sin(frame * 0.06) * 150
}`,

  // 6번: 랜덤 워크
  6: `// 🔴 예측불가 랜덤 워크!
function setup(cell) {}
function draw(ctx, world) {
  const { myBall, canvasW, canvasH } = world
  myBall.x += (Math.random() - 0.5) * 12
  myBall.y += (Math.random() - 0.5) * 12
  myBall.x = Math.max(25, Math.min(canvasW - 25, myBall.x))
  myBall.y = Math.max(25, Math.min(canvasH - 25, myBall.y))
}`,

  // 7번: 파랑 - 반대 원형
  7: `// 🔵 반시계 원형 궤도!
function setup(cell) {
  cell.data.radius = 50
}
function draw(ctx, world) {
  const { frame, myBall, canvasW, canvasH, myData } = world
  myData.radius = Math.min(myData.radius + 0.5, 300)
  myBall.x = canvasW/2 + Math.cos(-frame * 0.04) * myData.radius
  myBall.y = canvasH/2 + Math.sin(-frame * 0.04) * myData.radius
}`,

  // 8번: 대각선 튕김
  8: `// 🔵 대각선 반사!
function setup(cell) {
  cell.data.vx = -4
  cell.data.vy = 5
}
function draw(ctx, world) {
  const { myBall, canvasW, canvasH, myData } = world
  myBall.x += myData.vx
  myBall.y += myData.vy
  if (myBall.x < 25 || myBall.x > canvasW - 25) myData.vx *= -1
  if (myBall.y < 25 || myBall.y > canvasH - 25) myData.vy *= -1
}`,

  // 9번: 수평 스캔
  9: `// 🔵 수평 스캔 공격!
function setup(cell) {
  cell.data.dir = 1
}
function draw(ctx, world) {
  const { myBall, canvasW, canvasH, myData } = world
  myBall.x += myData.dir * 5
  if (myBall.x > canvasW - 25 || myBall.x < 25) {
    myData.dir *= -1
    myBall.y += 40
    if (myBall.y > canvasH - 25) myBall.y = 25
  }
}`,

  // 10번: 역나선
  10: `// 🔵 바깥에서 안으로 나선!
function setup(cell) {
  cell.data.angle = 0
  cell.data.radius = 300
}
function draw(ctx, world) {
  const { myBall, canvasW, canvasH, myData } = world
  myData.angle -= 0.08
  myData.radius -= 0.3
  if (myData.radius < 10) myData.radius = 300
  myBall.x = canvasW/2 + Math.cos(myData.angle) * myData.radius
  myBall.y = canvasH/2 + Math.sin(myData.angle) * myData.radius
}`,

  // 11번: 하트 모양
  11: `// 🔵 하트를 그려라!
function setup(cell) {}
function draw(ctx, world) {
  const { frame, myBall, canvasW, canvasH } = world
  const t = frame * 0.05
  myBall.x = canvasW/2 + 150 * Math.pow(Math.sin(t), 3)
  myBall.y = canvasH/2 - (130*Math.cos(t) - 50*Math.cos(2*t) - 20*Math.cos(3*t))
}`,

  // 12번: 브라운 운동
  12: `// 🔵 브라운 운동 침투!
function setup(cell) {
  cell.data.vx = 0
  cell.data.vy = 0
}
function draw(ctx, world) {
  const { myBall, canvasW, canvasH, myData } = world
  myData.vx += (Math.random() - 0.5) * 2
  myData.vy += (Math.random() - 0.5) * 2
  myData.vx *= 0.95
  myData.vy *= 0.95
  myBall.x += myData.vx
  myBall.y += myData.vy
  if (myBall.x < 25) myBall.x = 25
  if (myBall.x > canvasW - 25) myBall.x = canvasW - 25
  if (myBall.y < 25) myBall.y = 25
  if (myBall.y > canvasH - 25) myBall.y = canvasH - 25
}`
}

function getPixelwarTemplate() {
  return pixelwarTemplates[playerId] || pixelwarTemplates[1]
}

function getDefaultCode() {
  return gameMode === 'pixelwar' ? getPixelwarTemplate() : sandboxTemplate
}

// Monaco Editor 초기화
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } })
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: getDefaultCode(),
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    tabSize: 2
  })

  // Ctrl+Enter로 실행
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode)

  // 에디터 로드 후 초기 코드 설정
  currentCode = getDefaultCode()
  playerData = {}
  runSetup()
})

// 이름 입력 모달 처리
function showNameModal() {
  nameModal.classList.remove('modal-hidden')
  nameInput.focus()
}

function hideNameModal() {
  nameModal.classList.add('modal-hidden')
}

function submitName() {
  const name = nameInput.value.trim() || `Player ${playerId}`
  playerName = name
  playerNameEl.value = name
  hideNameModal()

  // 소켓 연결 및 참가
  connectSocket()
}

nameSubmit.addEventListener('click', submitName)
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitName()
})

// 이름 변경 시 서버에 전송
playerNameEl.addEventListener('change', () => {
  playerName = playerNameEl.value.trim() || `Player ${playerId}`
  if (socket) {
    socket.emit('player:name', { playerId, name: playerName })
  }
})

// Socket 연결
function connectSocket() {
  socket = io()

  socket.on('connect', () => {
    console.log('🔌 Connected to server')
    updateStatus('connected', '연결됨')

    socket.emit('player:join', { playerId, name: playerName })
  })

  socket.on('disconnect', () => {
    updateStatus('error', '연결 끊김')
  })

  socket.on('game:state', (state) => {
    console.log('📦 Game state:', state)

    // 게임 모드 변경 감지
    if (state.gameMode !== gameMode) {
      const oldMode = gameMode
      gameMode = state.gameMode
      console.log('🎮 Mode changed:', oldMode, '->', gameMode)

      // 에디터 템플릿 변경 (기본 템플릿 사용 중이면 새 템플릿으로 교체)
      if (editor) {
        const newCode = getDefaultCode()
        editor.setValue(newCode)
        currentCode = newCode
        playerData = {}
        myBall = { x: previewCanvas.width / 2, y: previewCanvas.height / 2 }
        runSetup()
      }

      updateModeUI()
    }

    if (state.mission && state.mission.text) {
      showMission(state.mission.text)
    }
  })

  socket.on('game:mission', ({ text }) => {
    showMission(text)
  })

  socket.on('game:start', (data) => {
    console.log('🎮 Game started:', data.gameMode)
    if (data.gameMode !== gameMode) {
      gameMode = data.gameMode

      // 에디터 템플릿 변경
      if (editor) {
        const newCode = getDefaultCode()
        editor.setValue(newCode)
        currentCode = newCode
        playerData = {}
        myBall = { x: previewCanvas.width / 2, y: previewCanvas.height / 2 }
        runSetup()
      }

      updateModeUI()
    }
  })

  socket.on('player:update', (data) => {
    // 내 코드가 외부에서 리셋된 경우
    if (data.playerId === playerId && data.code === '' && editor) {
      const newCode = getDefaultCode()
      editor.setValue(newCode)
      currentCode = newCode
      playerData = {}
      myBall = { x: previewCanvas.width / 2, y: previewCanvas.height / 2 }
      runSetup()
    }
  })
}

// 모드에 따른 UI 업데이트
function updateModeUI() {
  if (gameMode === 'pixelwar') {
    // 팀 색상 표시
    document.body.style.borderTop = `4px solid ${myTeamColor}`
    missionBanner.classList.add('active')
    missionText.textContent = `⚔️ 픽셀 전쟁! 당신은 ${myTeam === 'red' ? '🔴 RED' : '🔵 BLUE'} 팀입니다!`
  } else {
    document.body.style.borderTop = 'none'
  }
}

// 상태 업데이트
function updateStatus(type, text) {
  statusBadge.textContent = text
  statusBadge.className = `status-badge ${type}`
  statStatus.textContent = text
}

// 미션 표시
function showMission(text) {
  missionText.textContent = text
  missionBanner.classList.add('active')
}

// setup 실행
function runSetup() {
  const cell = {
    width: previewCanvas.width,
    height: previewCanvas.height,
    data: {}
  }

  try {
    const setupFn = new Function('cell', `
      ${currentCode}
      if (typeof setup === 'function') setup(cell);
    `)
    setupFn(cell)
    playerData = cell.data
  } catch (e) {
    console.error('Setup error:', e)
  }
}

// 코드 실행
function runCode() {
  if (!editor) return

  currentCode = editor.getValue()
  playerData = {}

  // setup 먼저 실행
  runSetup()

  // 서버에 코드 전송
  if (socket) {
    socket.emit('player:code', { playerId, code: currentCode })
  }

  updateStatus('connected', '실행됨')
}

runBtn.addEventListener('click', runCode)

// 프리뷰 렌더링 루프
function previewLoop() {
  frame++

  // FPS 계산
  const now = performance.now()
  const delta = now - lastFrameTime
  if (delta >= 1000) {
    fps = Math.round(frame / (delta / 1000))
    statFps.textContent = fps
    frame = 0
    lastFrameTime = now
  }

  if (gameMode === 'pixelwar') {
    // 픽셀워 프리뷰
    previewPixelWar()
  } else {
    // 샌드박스 프리뷰
    previewSandbox()
  }

  requestAnimationFrame(previewLoop)
}

function previewSandbox() {
  const world = {
    frame,
    cellW: previewCanvas.width,
    cellH: previewCanvas.height,
    players: {},
    gameData: {},
    myData: playerData
  }

  const player = { data: playerData, needsSetup: false }
  const result = executePlayerCode(currentCode, previewCtx, world, player)
  playerData = player.data

  if (result.error) {
    drawError(result.error)
  }
}

function previewPixelWar() {
  // 배경
  previewCtx.fillStyle = '#111'
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)

  // 플레이어 코드 실행
  const world = {
    frame,
    canvasW: previewCanvas.width,
    canvasH: previewCanvas.height,
    myBall: myBall,
    myTeam: myTeam,
    myData: playerData,
    allBalls: {},
    score: { red: 50, blue: 50 }
  }

  const player = { data: playerData, needsSetup: false }
  const result = executePixelWarCode(currentCode, world, player)
  playerData = player.data

  // 경계 체크
  myBall.x = Math.max(25, Math.min(previewCanvas.width - 25, myBall.x))
  myBall.y = Math.max(25, Math.min(previewCanvas.height - 25, myBall.y))

  // 공 그리기
  previewCtx.beginPath()
  previewCtx.arc(myBall.x, myBall.y, 25, 0, Math.PI * 2)
  previewCtx.fillStyle = myTeamColor
  previewCtx.fill()
  previewCtx.strokeStyle = '#fff'
  previewCtx.lineWidth = 3
  previewCtx.stroke()

  // 플레이어 번호
  previewCtx.fillStyle = '#fff'
  previewCtx.font = 'bold 14px sans-serif'
  previewCtx.textAlign = 'center'
  previewCtx.textBaseline = 'middle'
  previewCtx.fillText(playerId.toString(), myBall.x, myBall.y)

  // 팀 정보
  previewCtx.fillStyle = myTeamColor
  previewCtx.font = 'bold 16px sans-serif'
  previewCtx.textAlign = 'left'
  previewCtx.textBaseline = 'top'
  previewCtx.fillText(myTeam === 'red' ? '🔴 RED TEAM' : '🔵 BLUE TEAM', 10, 10)

  if (result.error) {
    drawError(result.error)
  }
}

function drawError(error) {
  previewCtx.fillStyle = 'rgba(0,0,0,0.8)'
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)

  previewCtx.strokeStyle = '#ff4444'
  previewCtx.lineWidth = 4
  previewCtx.strokeRect(2, 2, previewCanvas.width - 4, previewCanvas.height - 4)

  previewCtx.fillStyle = '#ff4444'
  previewCtx.font = '14px monospace'
  previewCtx.textAlign = 'center'
  previewCtx.textBaseline = 'middle'
  previewCtx.fillText('🔴 ERROR', previewCanvas.width / 2, 30)
  previewCtx.fillStyle = '#ff8888'
  previewCtx.font = '12px monospace'
  previewCtx.fillText(error.slice(0, 40), previewCanvas.width / 2, previewCanvas.height / 2)

  updateStatus('error', '에러')
}

// 시작
showNameModal()
previewLoop()
