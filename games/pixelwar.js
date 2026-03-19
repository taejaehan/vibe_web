// 픽셀 전쟁 모드
// 빨강 vs 파랑 - 캔버스를 물들여라!

export default {
  name: 'pixelwar',
  displayName: '⚔️ 픽셀 전쟁',
  description: '빨강 vs 파랑! 캔버스를 점령하라!',

  // 설정
  config: {
    ballRadius: 25,
    timeLimit: 180, // 3분
    teams: {
      red: { color: '#ff4444', players: [1, 2, 3, 4, 5, 6] },
      blue: { color: '#4444ff', players: [7, 8, 9, 10, 11, 12] }
    }
  },

  // 플레이어 팀 확인
  getTeam(playerId) {
    const id = parseInt(playerId)
    if (this.config.teams.red.players.includes(id)) return 'red'
    if (this.config.teams.blue.players.includes(id)) return 'blue'
    return null
  },

  getTeamColor(playerId) {
    const team = this.getTeam(playerId)
    return team ? this.config.teams[team].color : '#888'
  },

  // 게임 시작 시 초기화
  init(world) {
    world.gameData = {
      startTime: Date.now(),
      timeLimit: this.config.timeLimit,
      score: { red: 0, blue: 0 },
      balls: {}, // playerId -> { x, y }
      paintCanvas: null, // 오프스크린 캔버스 (stage에서 생성)
      gameOver: false
    }
  },

  // 플레이어 초기 위치 (랜덤)
  getInitialPosition(playerId, canvasWidth, canvasHeight) {
    const margin = 50
    return {
      x: margin + Math.random() * (canvasWidth - margin * 2),
      y: margin + Math.random() * (canvasHeight - margin * 2)
    }
  },

  // 플레이어 코드 템플릿
  playerTemplate: `// ⚔️ 픽셀 전쟁!
// world.myBall 을 움직여서 캔버스를 물들여라!

function setup(cell) {
  // 초기 설정
  cell.data.angle = Math.random() * Math.PI * 2
  cell.data.speed = 3
}

function draw(ctx, world) {
  const { frame, myBall, canvasW, canvasH } = world

  // 내 공 움직이기
  // myBall.x, myBall.y 를 직접 수정하세요!

  // 예시: 원형으로 움직이기
  const centerX = canvasW / 2
  const centerY = canvasH / 2
  const radius = Math.min(canvasW, canvasH) * 0.3

  myBall.x = centerX + Math.cos(frame * 0.02) * radius
  myBall.y = centerY + Math.sin(frame * 0.02) * radius

  // 또는: 랜덤 워크
  // myBall.x += (Math.random() - 0.5) * 10
  // myBall.y += (Math.random() - 0.5) * 10

  // 경계 체크 (자동으로 처리되지만 직접 해도 됨)
  // myBall.x = Math.max(0, Math.min(canvasW, myBall.x))
  // myBall.y = Math.max(0, Math.min(canvasH, myBall.y))
}`
}
