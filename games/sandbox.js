// 기본 자유 모드
export default {
  name: 'sandbox',
  displayName: '🎨 Sandbox',
  description: '자유롭게 코딩하세요!',

  // 게임 시작 시 초기화
  init(world) {
    world.gameData.theme = 'default'
  },

  // 매 프레임 배경 (플레이어 셀 아래)
  drawBackground(ctx, world) {
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, world.width, world.height)
  },

  // 매 프레임 오버레이 (플레이어 셀 위)
  drawOverlay(ctx, world) {
    // 셀 구분선 그리기
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2

    const cols = 4
    const rows = 3
    const cellW = world.width / cols
    const cellH = world.height / rows

    // 세로선
    for (let i = 1; i < cols; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellW, 0)
      ctx.lineTo(i * cellW, world.height)
      ctx.stroke()
    }

    // 가로선
    for (let i = 1; i < rows; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * cellH)
      ctx.lineTo(world.width, i * cellH)
      ctx.stroke()
    }
  },

  // 플레이어 코드에 주입할 기본 템플릿
  playerTemplate: `function setup(cell) {
  cell.data.x = cell.width / 2
  cell.data.y = cell.height / 2
  cell.data.hue = Math.random() * 360
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  // 배경
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, cellW, cellH)

  // 원 애니메이션
  const x = myData.x + Math.sin(frame * 0.05) * 30
  const y = myData.y + Math.cos(frame * 0.03) * 20

  ctx.beginPath()
  ctx.arc(x, y, 40, 0, Math.PI * 2)
  ctx.fillStyle = \`hsl(\${(myData.hue + frame) % 360}, 70%, 60%)\`
  ctx.fill()
}`
}
