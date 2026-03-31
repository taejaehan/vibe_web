// Hand Motion Particles — gesture-driven particle morphing
// Particles flow between organic shapes: sphere, spiral, heart, starburst

function setup(cell) {
  const COUNT = 600
  const particles = []
  const palette = ['#00fff2','#ff00e4','#aaff00','#ff6600','#6644ff','#00ff88','#ffdd00']

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random(), y: Math.random(),
      tx: Math.random(), ty: Math.random(),
      vx: 0, vy: 0,
      size: Math.random() * 2 + 0.5,
      color: palette[i % palette.length],
      alpha: Math.random() * 0.6 + 0.4,
    })
  }

  // Shape generators (normalized 0-1)
  function genSphere() {
    particles.forEach((p, i) => {
      const phi = Math.acos(-1 + (2 * i) / COUNT)
      const theta = Math.sqrt(COUNT * Math.PI) * phi
      p.tx = 0.5 + Math.cos(theta) * Math.sin(phi) * 0.3
      p.ty = 0.5 + Math.cos(phi) * 0.3
    })
  }
  function genSpiral() {
    particles.forEach((p, i) => {
      const t = i / COUNT
      const angle = t * Math.PI * 8
      const r = t * 0.35
      p.tx = 0.5 + Math.cos(angle) * r
      p.ty = 0.5 + Math.sin(angle) * r
    })
  }
  function genHeart() {
    particles.forEach((p, i) => {
      const t = (i / COUNT) * Math.PI * 2
      const x = 16 * Math.pow(Math.sin(t), 3)
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t))
      p.tx = 0.5 + x / 55
      p.ty = 0.5 + y / 55
    })
  }
  function genStarburst() {
    particles.forEach((p, i) => {
      const angle = (i / COUNT) * Math.PI * 2
      const arm = i % 5
      const r = (0.1 + Math.random() * 0.3) * (arm % 2 === 0 ? 1 : 0.5)
      p.tx = 0.5 + Math.cos(angle + arm) * r
      p.ty = 0.5 + Math.sin(angle + arm) * r
    })
  }
  function genRandom() {
    particles.forEach(p => {
      p.tx = 0.15 + Math.random() * 0.7
      p.ty = 0.15 + Math.random() * 0.7
    })
  }

  const shapes = [genSphere, genSpiral, genHeart, genStarburst, genRandom]
  let shapeIdx = 0
  let morphTimer = 0

  shapes[0]()

    cell.data.particles = particles
  cell.data.shapes = shapes
  cell.data.shapeIdx = shapeIdx
  cell.data.morphTimer = morphTimer
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world
  if (!myData) return
  const { particles, shapes } = myData

  // Background with trail effect
  ctx.fillStyle = 'rgba(8, 8, 18, 0.15)'
  ctx.fillRect(0, 0, cellW, cellH)

  // Auto-morph every 180 frames
  myData.morphTimer++
  if (myData.morphTimer > 180) {
    myData.morphTimer = 0
    myData.shapeIdx = (myData.shapeIdx + 1) % shapes.length
    shapes[myData.shapeIdx]()
  }

  // Update + draw particles
  for (const p of particles) {
    p.vx += (p.tx * cellW - p.x * cellW) * 0.03
    p.vy += (p.ty * cellH - p.y * cellH) * 0.03
    p.vx *= 0.92
    p.vy *= 0.92
    p.x += p.vx / cellW
    p.y += p.vy / cellH

    const pulse = 0.7 + 0.3 * Math.sin(frame * 0.05 + p.x * 10)
    ctx.globalAlpha = p.alpha * pulse
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x * cellW, p.y * cellH, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Subtle label
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.font = `${cellH * 0.04}px sans-serif`
  ctx.textAlign = 'center'
  const labels = ['sphere','spiral','heart','starburst','random']
  ctx.fillText(labels[myData.shapeIdx], cellW/2, cellH - 8)
}
