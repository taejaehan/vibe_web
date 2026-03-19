// Admin - 게임 컨트롤 패널

const socket = io()

// DOM 요소
const gameStatus = document.getElementById('game-status')
const playerList = document.getElementById('player-list')
const gameMode = document.getElementById('game-mode')
const missionText = document.getElementById('mission-text')
const missionTime = document.getElementById('mission-time')
const logList = document.getElementById('log-list')

// 버튼
const btnSetMode = document.getElementById('btn-set-mode')
const btnStart = document.getElementById('btn-start')
const btnReset = document.getElementById('btn-reset')
const btnMission = document.getElementById('btn-mission')
const btnClearMission = document.getElementById('btn-clear-mission')

// 상태
const players = {}

// 로그 추가
function addLog(event, message) {
  const time = new Date().toLocaleTimeString()
  const entry = document.createElement('div')
  entry.className = 'log-entry'
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-event">${event}</span> ${message}`
  logList.insertBefore(entry, logList.firstChild)

  // 최대 50개 유지
  while (logList.children.length > 50) {
    logList.removeChild(logList.lastChild)
  }
}

// 플레이어 카드 렌더링
function renderPlayers() {
  playerList.innerHTML = ''

  for (let id = 1; id <= 12; id++) {
    const player = players[id]
    const card = document.createElement('div')

    if (player) {
      card.className = `player-card ${player.status || 'connected'}`
      card.innerHTML = `
        <button class="reset-btn" data-id="${id}">✕</button>
        <div class="player-id">#${id}</div>
        <div class="player-name">${player.name || `Player ${id}`}</div>
        <div class="player-status">${getStatusText(player.status)}</div>
      `
    } else {
      card.className = 'player-card empty'
      card.innerHTML = `
        <div class="player-id">#${id}</div>
        <div class="player-name">빈 슬롯</div>
        <div class="player-status">-</div>
      `
    }

    playerList.appendChild(card)
  }

  // 리셋 버튼 이벤트
  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const playerId = parseInt(btn.dataset.id)
      if (confirm(`Player ${playerId}의 코드를 리셋할까요?`)) {
        socket.emit('admin:resetPlayer', { playerId })
        addLog('RESET', `Player ${playerId} 코드 리셋`)
      }
    })
  })
}

function getStatusText(status) {
  switch (status) {
    case 'connected': return '🟢 연결됨'
    case 'ready': return '✅ 준비됨'
    case 'error': return '🔴 에러'
    case 'disconnected': return '⚫ 연결 끊김'
    default: return '🟢 연결됨'
  }
}

// 게임 상태 업데이트
function updateGameStatus(status) {
  gameStatus.textContent = status === 'playing' ? '게임 진행 중' : '대기 중'
  gameStatus.className = `status ${status}`
}

// Socket 이벤트
socket.on('connect', () => {
  addLog('CONNECT', '서버에 연결됨')
  socket.emit('request:state')
})

socket.on('game:state', (state) => {
  addLog('STATE', `게임 상태 수신 (모드: ${state.gameMode})`)

  // 플레이어 상태 업데이트
  for (const [id, player] of Object.entries(state.players)) {
    players[id] = player
  }
  renderPlayers()

  // 게임 모드 설정
  gameMode.value = state.gameMode
  updateGameStatus(state.status)

  // 미션 표시
  if (state.mission) {
    missionText.value = state.mission.text
  }
})

socket.on('player:update', (data) => {
  const { playerId, ...rest } = data

  if (!players[playerId]) {
    players[playerId] = { id: playerId }
  }
  Object.assign(players[playerId], rest)

  addLog('PLAYER', `Player ${playerId} 업데이트 (${rest.status || 'code'})`)
  renderPlayers()
})

socket.on('game:start', (data) => {
  addLog('START', `게임 시작 (모드: ${data.gameMode})`)
  updateGameStatus('playing')
})

// 버튼 이벤트
btnSetMode.addEventListener('click', () => {
  socket.emit('admin:setMode', { gameMode: gameMode.value })
  addLog('MODE', `게임 모드 변경: ${gameMode.value}`)
})

btnStart.addEventListener('click', () => {
  socket.emit('admin:start')
})

btnReset.addEventListener('click', () => {
  if (confirm('정말 게임을 리셋할까요?')) {
    socket.emit('admin:reset')
    addLog('RESET', '게임 전체 리셋')
  }
})

btnMission.addEventListener('click', () => {
  const text = missionText.value.trim()
  if (!text) {
    alert('미션 내용을 입력하세요')
    return
  }
  const timeLimit = parseInt(missionTime.value) || 180
  socket.emit('admin:mission', { text, timeLimit })
  addLog('MISSION', `미션 전송: "${text}" (${timeLimit}초)`)
})

btnClearMission.addEventListener('click', () => {
  socket.emit('admin:mission', { text: '', timeLimit: 0 })
  missionText.value = ''
  addLog('MISSION', '미션 해제')
})

// 특수 이벤트 버튼
document.querySelectorAll('.event-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const eventType = btn.dataset.event
    socket.emit('admin:event', { type: eventType, data: {} })
    addLog('EVENT', `특수 이벤트 발동: ${eventType}`)
  })
})

// 초기 렌더링
renderPlayers()
