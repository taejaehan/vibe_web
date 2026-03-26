// 오로라 보레알리스 — 극지 오로라 + 별 + 유성 이펙트
function setup(cell) {
  cell.data.stars = []
  cell.data.meteors = []
  cell.data.treeline = []

  for (let i = 0; i < 130; i++) {
    cell.data.stars.push({
      x: Math.random(),
      y: Math.random() * 0.55,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2
    })
  }

  const steps = 240
  for (let i = 0; i <= steps; i++) {
    const base = 0.09 + Math.sin(i * 0.18) * 0.025 + Math.sin(i * 0.05) * 0.015
    const spike = Math.random() > 0.91 ? 0.045 + Math.random() * 0.04 : 0
    cell.data.treeline.push(base + spike)
  }
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  // 밤하늘 배경
  const skyGrad = ctx.createLinearGradient(0, 0, 0, cellH)
  skyGrad.addColorStop(0, '#000814')
  skyGrad.addColorStop(0.55, '#010d1f')
  skyGrad.addColorStop(1, '#010c08')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, cellW, cellH)

  // 별
  for (const s of myData.stars) {
    const tw = 0.5 + Math.sin(s.phase + frame * 0.025) * 0.5
    const alpha = s.brightness * tw * 0.85
    ctx.beginPath()
    ctx.arc(s.x * cellW, s.y * cellH, s.brightness * 1.4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(210, 225, 255, ${alpha})`
    ctx.fill()
  }

  // 오로라 레이어
  const layers = [
    { hue: 145, offset: 0.0,  speed: 0.007, baseY: 0.30, h: 0.28 },
    { hue: 185, offset: 1.8,  speed: 0.005, baseY: 0.20, h: 0.36 },
    { hue: 270, offset: 3.2,  speed: 0.009, baseY: 0.28, h: 0.22 },
    { hue: 205, offset: 0.9,  speed: 0.006, baseY: 0.18, h: 0.30 },
  ]

  ctx.save()
  ctx.globalCompositeOperation = 'screen'

  for (const layer of layers) {
    const t = frame * layer.speed + layer.offset
    const stripes = Math.floor(cellW / 2)

    for (let i = 0; i <= stripes; i++) {
      const nx = i / stripes
      const waveY = Math.sin(nx * 7.0 + t) * 0.07
                  + Math.sin(nx * 3.5 + t * 1.4) * 0.04
      const topY  = (layer.baseY + waveY) * cellH
      const curtH = layer.h * cellH * (0.65 + Math.sin(nx * 5 + t * 0.6) * 0.35)
      const botY  = topY + curtH

      const brightness = 0.4 + Math.sin(nx * 4 + t * 0.9) * 0.35
      const alpha = brightness * 0.13

      const grad = ctx.createLinearGradient(0, topY, 0, botY)
      grad.addColorStop(0.0, `hsla(${layer.hue},      85%, 60%, 0)`)
      grad.addColorStop(0.15,`hsla(${layer.hue},      90%, 65%, ${alpha})`)
      grad.addColorStop(0.55,`hsla(${layer.hue + 18}, 80%, 55%, ${alpha * 0.75})`)
      grad.addColorStop(1.0, `hsla(${layer.hue + 40}, 70%, 40%, 0)`)

      ctx.fillStyle = grad
      ctx.fillRect(nx * cellW - 1.5, topY, 3.5, botY - topY)
    }
  }

  ctx.restore()

  // 유성
  if (frame % 140 === 10) {
    myData.meteors.push({
      x: (0.2 + Math.random() * 0.6) * cellW,
      y: 0,
      vx: (Math.random() - 0.4) * 3.5,
      vy: 2.8 + Math.random() * 3,
      life: 1
    })
  }

  for (let i = myData.meteors.length - 1; i >= 0; i--) {
    const m = myData.meteors[i]
    const tailLen = 18
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(m.x - m.vx * tailLen * 0.09, m.y - m.vy * tailLen * 0.09)
    ctx.strokeStyle = `rgba(220, 235, 255, ${m.life * 0.75})`
    ctx.lineWidth = m.life * 1.8
    ctx.stroke()

    m.x += m.vx
    m.y += m.vy
    m.life -= 0.022

    if (m.life <= 0 || m.y > cellH * 0.65) myData.meteors.splice(i, 1)
  }

  // 나무 실루엣
  const steps = myData.treeline.length - 1
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(0, cellH)
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * cellW
    const y = cellH - myData.treeline[i] * cellH
    ctx.lineTo(x, y)
  }
  ctx.lineTo(cellW, cellH)
  ctx.closePath()
  ctx.fill()
}
