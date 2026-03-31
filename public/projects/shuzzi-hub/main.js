// Hub — tropical island with palm trees, hut, campfire, and fox
// Top-down isometric view of a cozy island floating on teal ocean

function setup(cell) {
  // Ocean waves
  const waves = []
  for (let i = 0; i < 25; i++) {
    waves.push({
      x: Math.random(), y: Math.random(),
      r: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.015,
    })
  }

  // Palm trees (positions on island)
  const palms = [
    { x: 0.32, y: 0.30 }, { x: 0.68, y: 0.32 },
    { x: 0.28, y: 0.58 }, { x: 0.72, y: 0.55 },
    { x: 0.40, y: 0.25 }, { x: 0.60, y: 0.65 },
  ]

  // Flowers
  const flowers = []
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 0.05 + Math.random() * 0.13
    flowers.push({
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.47 + Math.sin(angle) * dist * 0.7,
      color: ['#ff6b8a','#ffdd44','#cc66ff','#ff8844'][i % 4],
      phase: Math.random() * Math.PI * 2,
    })
  }

  // Fox position
  const fox = { x: 0.52, y: 0.50, dir: 1, walkPhase: 0 }

  // Campfire sparks
  const sparks = []
  for (let i = 0; i < 12; i++) {
    sparks.push({
      x: 0, y: 0, life: 0, maxLife: 30 + Math.random() * 30,
      vx: (Math.random() - 0.5) * 0.003,
      vy: -Math.random() * 0.005 - 0.002,
    })
  }

  cell.data.waves = waves
  cell.data.palms = palms
  cell.data.flowers = flowers
  cell.data.fox = fox
  cell.data.sparks = sparks
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world
  if (!myData) return
  const { waves, palms, flowers, fox, sparks } = myData

  // Ocean background
  ctx.fillStyle = '#3ba8b8'
  ctx.fillRect(0, 0, cellW, cellH)

  // Animated wave rings
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  for (const w of waves) {
    const pulse = 0.8 + 0.3 * Math.sin(frame * w.speed + w.phase)
    ctx.beginPath()
    ctx.arc(w.x * cellW, w.y * cellH, w.r * cellW * pulse, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Island shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.beginPath()
  ctx.ellipse(cellW*0.51, cellH*0.49, cellW*0.24, cellH*0.19, 0.05, 0, Math.PI*2)
  ctx.fill()

  // Sand beach ring
  ctx.fillStyle = '#f2d9a0'
  ctx.beginPath()
  ctx.ellipse(cellW*0.5, cellH*0.47, cellW*0.22, cellH*0.17, 0, 0, Math.PI*2)
  ctx.fill()

  // Green grass island
  ctx.fillStyle = '#7cb860'
  ctx.beginPath()
  ctx.ellipse(cellW*0.5, cellH*0.47, cellW*0.18, cellH*0.14, 0, 0, Math.PI*2)
  ctx.fill()

  // Darker grass patches
  ctx.fillStyle = '#5fa040'
  ctx.beginPath()
  ctx.ellipse(cellW*0.45, cellH*0.44, cellW*0.06, cellH*0.04, 0.3, 0, Math.PI*2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cellW*0.57, cellH*0.52, cellW*0.05, cellH*0.03, -0.2, 0, Math.PI*2)
  ctx.fill()

  // Little hut
  const hx = cellW * 0.38, hy = cellH * 0.40
  ctx.fillStyle = '#c4a472'
  ctx.fillRect(hx - 8, hy - 4, 16, 10)
  // Roof
  ctx.fillStyle = '#8B4513'
  ctx.beginPath()
  ctx.moveTo(hx - 10, hy - 4)
  ctx.lineTo(hx, hy - 12)
  ctx.lineTo(hx + 10, hy - 4)
  ctx.closePath()
  ctx.fill()

  // Flowers
  for (const f of flowers) {
    const sway = Math.sin(frame * 0.03 + f.phase) * 1.5
    ctx.fillStyle = f.color
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(f.x * cellW + sway, f.y * cellH, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Palm trees
  for (const p of palms) {
    const px = p.x * cellW, py = p.y * cellH
    // Trunk
    ctx.strokeStyle = '#8B6914'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px + 1, py - 14)
    ctx.stroke()
    // Leaves (3 fronds)
    const sway = Math.sin(frame * 0.02 + px) * 2
    ctx.strokeStyle = '#2d7a2d'
    ctx.lineWidth = 1.5
    for (let a = -1; a <= 1; a++) {
      ctx.beginPath()
      ctx.moveTo(px + 1, py - 14)
      const ex = px + a * 8 + sway
      const ey = py - 10 + Math.abs(a) * 3
      ctx.quadraticCurveTo(px + a * 4, py - 18, ex, ey)
      ctx.stroke()
    }
    // Leaf fills
    ctx.fillStyle = '#3a9a3a'
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.arc(px + 1 + sway * 0.3, py - 15, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // Campfire
  const cfx = cellW * 0.55, cfy = cellH * 0.48
  // Stones
  ctx.fillStyle = '#888'
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cfx + Math.cos(a) * 4, cfy + Math.sin(a) * 3, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
  // Fire glow
  const fireGlow = 0.3 + 0.2 * Math.sin(frame * 0.1)
  ctx.fillStyle = `rgba(255,150,30,${fireGlow})`
  ctx.beginPath()
  ctx.arc(cfx, cfy, 6, 0, Math.PI * 2)
  ctx.fill()
  // Flame
  ctx.fillStyle = '#ff6622'
  ctx.globalAlpha = 0.8 + 0.2 * Math.sin(frame * 0.15)
  ctx.beginPath()
  ctx.moveTo(cfx - 2, cfy + 1)
  ctx.quadraticCurveTo(cfx, cfy - 5 - Math.sin(frame * 0.2) * 2, cfx + 2, cfy + 1)
  ctx.fill()
  ctx.globalAlpha = 1

  // Fire sparks
  for (const s of sparks) {
    s.life++
    if (s.life > s.maxLife) {
      s.life = 0
      s.x = cfx / cellW + (Math.random() - 0.5) * 0.01
      s.y = cfy / cellH
    }
    s.x += s.vx
    s.y += s.vy
    const alpha = 1 - s.life / s.maxLife
    ctx.globalAlpha = alpha * 0.6
    ctx.fillStyle = s.life < s.maxLife * 0.3 ? '#ffaa33' : '#ff6633'
    ctx.beginPath()
    ctx.arc(s.x * cellW, s.y * cellH, 0.8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Fox (simple pixel creature)
  const fx = fox.x * cellW, fy = fox.y * cellH
  fox.walkPhase += 0.03
  const bobY = Math.sin(fox.walkPhase) * 0.8

  // Body
  ctx.fillStyle = '#e87020'
  ctx.fillRect(fx - 4, fy - 3 + bobY, 8, 5)
  // Head
  ctx.fillRect(fx + 3, fy - 5 + bobY, 5, 4)
  // Ears
  ctx.fillStyle = '#d06018'
  ctx.fillRect(fx + 4, fy - 7 + bobY, 2, 2)
  ctx.fillRect(fx + 6, fy - 7 + bobY, 2, 2)
  // Tail
  ctx.fillStyle = '#e87020'
  const tailWag = Math.sin(frame * 0.08) * 2
  ctx.beginPath()
  ctx.moveTo(fx - 4, fy - 1 + bobY)
  ctx.quadraticCurveTo(fx - 8, fy - 4 + tailWag + bobY, fx - 7, fy - 6 + bobY)
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#e87020'
  ctx.stroke()
  // White tail tip
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(fx - 7, fy - 6 + bobY, 1.2, 0, Math.PI * 2)
  ctx.fill()
  // Eye
  ctx.fillStyle = '#111'
  ctx.fillRect(fx + 6, fy - 4 + bobY, 1, 1)
}
