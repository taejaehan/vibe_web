function setup(cell) {
  const particles = []
  const count = 60
  for (let i = 0; i < count; i++) {
    particles.push({
      angle: (Math.PI * 2 * i) / count,
      radius: 0.25,
      speed: 0.02 + Math.random() * 0.01,
      size: 2 + Math.random() * 3,
      hue: (360 / count) * i,
      trail: []
    })
  }
  cell.data.particles = particles
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  ctx.fillStyle = 'rgba(10, 0, 20, 0.15)'
  ctx.fillRect(0, 0, cellW, cellH)

  const cx = cellW / 2
  const cy = cellH / 2
  const baseRadius = Math.min(cellW, cellH) * 0.3

  myData.particles.forEach(function (p) {
    p.angle += p.speed
    const wobble = Math.sin(frame * 0.02 + p.hue) * 0.06
    const r = baseRadius * (p.radius + wobble)
    const x = cx + Math.cos(p.angle) * r
    const y = cy + Math.sin(p.angle) * r

    p.trail.push({ x: x, y: y })
    if (p.trail.length > 8) p.trail.shift()

    for (var t = 0; t < p.trail.length; t++) {
      var alpha = (t + 1) / p.trail.length
      var s = p.size * alpha
      ctx.beginPath()
      ctx.arc(p.trail[t].x, p.trail[t].y, s, 0, Math.PI * 2)
      ctx.fillStyle = 'hsla(' + ((p.hue + frame) % 360) + ', 100%, 60%, ' + (alpha * 0.5) + ')'
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(x, y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = 'hsl(' + ((p.hue + frame) % 360) + ', 100%, 70%)'
    ctx.shadowColor = 'hsl(' + ((p.hue + frame) % 360) + ', 100%, 60%)'
    ctx.shadowBlur = 15
    ctx.fill()
    ctx.shadowBlur = 0
  })
}
