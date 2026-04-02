function setup(cell) {
  const w = cell.width
  const h = cell.height
  const d = cell.data

  // 파칭코 핀 (상대좌표 0~1)
  d.pins = []
  for (let row = 0; row < 4; row++) {
    const count = row + 2
    for (let col = 0; col < count; col++) {
      d.pins.push({
        x: (col + 1) / (count + 1),
        y: 0.15 + row * 0.2
      })
    }
  }

  // 파칭코 공
  d.balls = []
  for (let i = 0; i < 3; i++) {
    d.balls.push({ x: 0.3 + Math.random() * 0.4, y: -0.1 * i, vx: 0, vy: 0.008 })
  }

  // 별 필드
  d.stars = []
  for (let i = 0; i < 25; i++) {
    d.stars.push({ x: Math.random(), y: Math.random(), speed: 0.002 + Math.random() * 0.005, size: Math.random() * 0.6 + 0.4 })
  }

  // 적기
  d.enemies = []
  for (let i = 0; i < 4; i++) {
    d.enemies.push({ x: 0.2 + i * 0.2, y: 0.1 + i * 0.08, baseX: 0.2 + i * 0.2 })
  }

  // 레이저
  d.laser = { active: false, y: 0, x: 0 }

  // 눈 파티클
  d.snow = []
  for (let i = 0; i < 35; i++) {
    d.snow.push({ x: Math.random(), y: Math.random(), vx: 0, vy: 0.003 + Math.random() * 0.004, size: Math.random() * 0.5 + 0.5 })
  }

  d.activePanel = 0
  d.headerMessages = ['JUN WEB GAME LAB!', 'WELCOME TO MY ARCADE!', 'GAME OVER? NEVER!']
  d.headerIdx = 0
  d.headerState = 'typing' // 'typing' | 'wait' | 'erasing'
  d.typedLen = 0
  d.waitTimer = 0
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world
  const d = myData

  // 배경
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, cellW, cellH)

  const headerH = cellH * 0.1
  const footerH = cellH * 0.08
  const panelW = cellW / 3
  const panelH = cellH - headerH - footerH

  // 헤더 - 타이핑 효과
  const currentMsg = d.headerMessages[d.headerIdx]
  if (d.headerState === 'typing') {
    if (frame % 4 === 0 && d.typedLen < currentMsg.length) d.typedLen++
    if (d.typedLen === currentMsg.length) { d.headerState = 'wait'; d.waitTimer = 0 }
  } else if (d.headerState === 'wait') {
    d.waitTimer++
    if (d.waitTimer >= 240) d.headerState = 'erasing' // 4초 (60fps 기준)
  } else if (d.headerState === 'erasing') {
    if (frame % 2 === 0 && d.typedLen > 0) d.typedLen--
    if (d.typedLen === 0) {
      d.headerIdx = (d.headerIdx + 1) % d.headerMessages.length
      d.headerState = 'typing'
    }
  }
  const displayText = currentMsg.substring(0, d.typedLen)
  const fontSize = Math.max(8, cellW * 0.04)
  ctx.font = `bold ${fontSize}px monospace`
  ctx.fillStyle = '#00ff88'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(displayText, cellW * 0.04, headerH / 2)
  // 블링크 커서
  if (frame % 40 < 20) {
    const tw = ctx.measureText(displayText).width
    ctx.fillRect(cellW * 0.04 + tw + 2, headerH * 0.25, fontSize * 0.1, headerH * 0.5)
  }

  // 활성화 사이클
  if (frame % 200 === 0) d.activePanel = (d.activePanel + 1) % 3

  const titles = ['PACHINKO', 'STARWARS', 'NEZUKO']

  // 3개 패널 그리기
  for (let p = 0; p < 3; p++) {
    const px = p * panelW
    const py = headerH
    const isActive = p === d.activePanel
    const alpha = isActive ? 1.0 : 0.45

    ctx.save()
    ctx.globalAlpha = alpha

    // 패널 클리핑
    ctx.beginPath()
    ctx.rect(px + 1, py, panelW - 2, panelH)
    ctx.clip()

    // 패널 배경
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(px, py, panelW, panelH)

    if (p === 0) drawPachinko(ctx, px, py, panelW, panelH, d, frame)
    else if (p === 1) drawStarWars(ctx, px, py, panelW, panelH, d, frame)
    else drawSnowstorm(ctx, px, py, panelW, panelH, d, frame)

    ctx.restore()

    // 활성 테두리 글로우
    if (isActive) {
      ctx.save()
      ctx.strokeStyle = '#00ff88'
      ctx.shadowColor = '#00ff88'
      ctx.shadowBlur = 8
      ctx.lineWidth = 2
      ctx.strokeRect(px + 1, py, panelW - 2, panelH)
      ctx.restore()
    }

    // 패널 제목
    const titleSize = Math.max(6, cellW * 0.028)
    ctx.font = `${titleSize}px monospace`
    ctx.fillStyle = isActive ? '#00ff88' : '#555555'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(titles[p], px + panelW / 2, headerH + panelH + footerH / 2)
  }

  // 구분선
  ctx.strokeStyle = 'rgba(0,255,136,0.3)'
  ctx.lineWidth = 1
  for (let i = 1; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(i * panelW, headerH)
    ctx.lineTo(i * panelW, headerH + panelH)
    ctx.stroke()
  }
}

function drawPachinko(ctx, px, py, w, h, d, frame) {
  const pinR = Math.max(2, w * 0.03)
  const ballR = Math.max(3, w * 0.05)

  // 핀
  for (const pin of d.pins) {
    const x = px + pin.x * w
    const y = py + pin.y * h
    ctx.beginPath()
    ctx.arc(x, y, pinR, 0, Math.PI * 2)
    ctx.fillStyle = '#444444'
    ctx.fill()
  }

  // 공 업데이트 & 그리기
  for (const ball of d.balls) {
    ball.vy += 0.0004 // 중력
    ball.x += ball.vx
    ball.y += ball.vy

    // 핀 충돌
    for (const pin of d.pins) {
      const dx = ball.x - pin.x
      const dy = ball.y - pin.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const minDist = 0.06
      if (dist < minDist && dist > 0) {
        ball.vx = dx / dist * 0.012 + (Math.random() - 0.5) * 0.006
        ball.vy = Math.abs(ball.vy) * 0.5
        ball.x = pin.x + dx / dist * minDist
        ball.y = pin.y + dy / dist * minDist
      }
    }

    // 벽 반사
    if (ball.x < 0.05) { ball.x = 0.05; ball.vx = Math.abs(ball.vx) }
    if (ball.x > 0.95) { ball.x = 0.95; ball.vx = -Math.abs(ball.vx) }

    // 바닥 리셋
    if (ball.y > 1.05) {
      ball.y = -0.05
      ball.x = 0.3 + Math.random() * 0.4
      ball.vx = 0
      ball.vy = 0.008
    }

    // 글로우 그리기
    const bx = px + ball.x * w
    const by = py + ball.y * h
    ctx.save()
    ctx.shadowColor = '#00ff88'
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(bx, by, ballR, 0, Math.PI * 2)
    ctx.fillStyle = '#00ff88'
    ctx.fill()
    ctx.restore()
  }
}

function drawStarWars(ctx, px, py, w, h, d, frame) {
  // 별 필드
  for (const star of d.stars) {
    star.y += star.speed
    if (star.y > 1) { star.y = 0; star.x = Math.random() }
    const sx = px + star.x * w
    const sy = py + star.y * h
    const sr = star.size * Math.max(1, w * 0.01)
    ctx.fillStyle = `rgba(255,255,255,${0.3 + star.speed * 80})`
    ctx.fillRect(sx, sy, sr, sr)
  }

  // 내 전투기 (V자)
  const shipX = px + w / 2
  const shipY = py + h * 0.85
  const shipSize = Math.max(4, w * 0.08)
  ctx.beginPath()
  ctx.moveTo(shipX, shipY - shipSize)
  ctx.lineTo(shipX + shipSize * 0.7, shipY + shipSize * 0.3)
  ctx.lineTo(shipX + shipSize * 0.2, shipY)
  ctx.lineTo(shipX - shipSize * 0.2, shipY)
  ctx.lineTo(shipX - shipSize * 0.7, shipY + shipSize * 0.3)
  ctx.closePath()
  ctx.fillStyle = '#00ff88'
  ctx.fill()

  // 적기
  const enemySize = Math.max(3, w * 0.06)
  for (let i = 0; i < d.enemies.length; i++) {
    const e = d.enemies[i]
    e.x = e.baseX + Math.sin(frame * 0.03 + i) * 0.15
    e.y += 0.002
    if (e.y > 1.1) { e.y = -0.05; e.baseX = 0.15 + Math.random() * 0.7 }

    const ex = px + e.x * w
    const ey = py + e.y * h
    ctx.beginPath()
    ctx.moveTo(ex, ey + enemySize)
    ctx.lineTo(ex + enemySize * 0.5, ey - enemySize * 0.3)
    ctx.lineTo(ex - enemySize * 0.5, ey - enemySize * 0.3)
    ctx.closePath()
    ctx.fillStyle = '#ff4444'
    ctx.fill()
  }

  // 레이저
  if (frame % 60 < 3) {
    d.laser.active = true
    d.laser.y = 0.85
    d.laser.x = 0.5
  }
  if (d.laser.active) {
    d.laser.y -= 0.04
    if (d.laser.y < -0.05) d.laser.active = false
    const lx = px + d.laser.x * w
    const ly = py + d.laser.y * h
    ctx.save()
    ctx.shadowColor = '#00ff88'
    ctx.shadowBlur = 4
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(lx, ly)
    ctx.lineTo(lx, ly + h * 0.04)
    ctx.stroke()
    ctx.restore()
  }

  // 스캔라인
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(px, py + y, w, 1)
  }
}

function drawSnowstorm(ctx, px, py, w, h, d, frame) {
  // 눈 업데이트
  const wind = Math.sin(frame * 0.01) * 0.008
  for (const s of d.snow) {
    s.x += wind + (Math.random() - 0.5) * 0.005
    s.y += s.vy
    if (s.y > 1) { s.y = -0.02; s.x = Math.random() }
    if (s.x < 0) s.x = 1
    if (s.x > 1) s.x = 0
  }

  // 화이트아웃 배경
  ctx.fillStyle = 'rgba(200,210,220,0.15)'
  ctx.fillRect(px, py, w, h)

  // 시야 원 (펄스)
  const cx = px + w / 2
  const cy = py + h / 2
  const visRadius = (0.15 + Math.sin(frame * 0.02) * 0.05) * Math.min(w, h)

  // 시야 밖을 어둡게 (화이트아웃 효과)
  ctx.save()
  ctx.fillStyle = 'rgba(180,190,200,0.6)'
  ctx.fillRect(px, py, w, h)
  // 시야 안을 뚫기
  ctx.globalCompositeOperation = 'destination-out'
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, visRadius)
  grad.addColorStop(0, 'rgba(0,0,0,1)')
  grad.addColorStop(0.7, 'rgba(0,0,0,0.8)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, visRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 실루엣 (시야 안에 작게)
  const silW = w * 0.08
  const silH = h * 0.12
  const silX = cx - silW / 2 + Math.sin(frame * 0.008) * w * 0.02
  const silY = cy - silH / 2
  ctx.fillStyle = 'rgba(80,40,60,0.5)'
  // 머리
  ctx.beginPath()
  ctx.arc(silX + silW / 2, silY, silW * 0.35, 0, Math.PI * 2)
  ctx.fill()
  // 몸
  ctx.fillRect(silX + silW * 0.2, silY, silW * 0.6, silH * 0.8)

  // 눈 파티클 그리기
  for (const s of d.snow) {
    const sx = px + s.x * w
    const sy = py + s.y * h
    const sr = s.size * Math.max(1, w * 0.01)
    ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.3})`
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  }
}
