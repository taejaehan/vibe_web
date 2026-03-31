// Digital Installation — schnauzer mosaic portrait
// Real photo downsampled to 20x20 pixel mosaic with breathing + blink animation

function setup(cell) {
  const grid = [
    ['#705852','#6e5750','#6c544f','#69514d','#664e48','#67534d','#5e4741','#5c443e','#59403a','#563c37','#553c36','#513933','#4d352f','#4b332e','#47312b','#452f2a','#46312a','#452e29','#31271e','#262019'],
    ['#5a3f38','#583d36','#553a34','#543933','#543833','#523b36','#452e28','#482f2a','#4a2f29','#472d28','#472d27','#462c26','#432b25','#422a25','#402923','#3f2822','#412a24','#3f2722','#33291f','#302a1f'],
    ['#593b35','#543730','#51362f','#4f352d','#4f342e','#4b312b','#472e29','#442b25','#432a24','#422924','#412823','#412922','#3c241d','#3e251f','#3d251e','#3d251e','#3e261f','#3e2620','#231b16','#2d2720'],
    ['#533631','#51352f','#4c312a','#4a2f28','#442720','#3e221c','#422924','#412824','#402722','#3e2621','#3d2520','#381f19','#473632','#433b39','#433531','#38211b','#38221d','#301c18','#271f19','#2d2720'],
    ['#673b2c','#643b2d','#62382c','#61392e','#795d55','#7c6660','#522d23','#4e291e','#522d20','#4f2a1d','#48251a','#594e4b','#a1a3a3','#838686','#30302f','#291917','#1f1312','#070607','#29221c','#30271f'],
    ['#784532','#6c3b2a','#634439','#aea9a6','#f5f0ea','#f2f0ea','#95827a','#5a2a1a','#6b3e2d','#703f2b','#90766a','#c3c3c1','#c1bbb5','#928f89','#504d4a','#2d1b17','#241613','#0b090a','#241c17','#393025'],
    ['#6f3f30','#653224','#7b6964','#adada7','#c1b0a3','#cbbdaf','#555754','#2a100a','#582516','#462219','#3a3c3c','#948b82','#7f7268','#827d74','#68635f','#2f1b16','#281a17','#0b0808','#1c1613','#41382c'],
    ['#714331','#6f3d29','#92786f','#a9a69e','#ac9d8d','#a59c94','#868987','#b0adad','#b09f9b','#aca3a0','#8a8c8c','#5d5a57','#5a5148','#777469','#6f6b66','#37221d','#251713','#0b0607','#221a18','#3e352b'],
    ['#6e4230','#6b3b26','#998076','#c4c4bf','#a1978b','#a8a5a0','#f0eee9','#eeedea','#767979','#9b9c99','#c6c4bd','#afafad','#696865','#43413b','#59524e','#3a241e','#251511','#090507','#41372c','#524636'],
    ['#673b2a','#6c3d2a','#744f40','#504946','#404242','#535453','#413f3d','#2b2a28','#0d0e0f','#050606','#151413','#292a29','#30302f','#1e1e1e','#110604','#3a201a','#251612','#0b0607','#574b39','#7b6a4e'],
    ['#733e2b','#77412d','#743c28','#704131','#484240','#404040','#58595c','#8b8c8c','#6e706f','#525352','#303233','#040608','#3e3d3a','#1f1d1b','#140909','#3f241d','#241512','#0c0808','#4e4130','#493d2e'],
    ['#713c2a','#703b29','#6e3b2a','#713826','#75574d','#b9baba','#fcfaf4','#e0dcd5','#6d6c6a','#6b6964','#a09a91','#4f4f4d','#57504d','#13100f','#180e0d','#3e231c','#221411','#140e0c','#7a6348','#413427'],
    ['#8a553d','#8b573e','#8d5a40','#8a553c','#cbb7ae','#ffffff','#fffeea','#bab6ad','#0a0b0b','#211f1d','#ab9c8a','#dbcfbf','#9c9287','#373430','#190d0b','#3e241d','#170a0a','#1a1310','#7c654a','#2a211a'],
    ['#6d4531','#6b4430','#633d29','#755543','#fcfbf8','#f7efdc','#f4e9d4','#e9e0d2','#857d75','#9a8f83','#d4c4b0','#e4d8ca','#e1d6c9','#6a635f','#342a27','#3c231d','#403124','#3b3123','#5d4b37','#17100e'],
    ['#2a1915','#2f1d19','#2e1c16','#32201b','#c4bfbb','#fff7e1','#ceb59c','#b9a48f','#b9a898','#b8a696','#b39d85','#e0d0bb','#ddd0c2','#483b39','#392926','#38201a','#594734','#786547','#534431','#0b0709'],
    ['#443935','#22120f','#261611','#23100a','#372620','#c2bbb3','#d8c1ab','#c9ad94','#c1ab95','#baa38f','#b9a48e','#c1b3a2','#6e6760','#251410','#291610','#381f19','#24140f','#4a3928','#442f20','#271711'],
    ['#5e3d2f','#542c1a','#502c1b','#713f26','#663d2b','#262526','#5a5654','#aba29b','#dbd5d0','#989189','#959089','#7f7e7c','#1f2323','#543627','#653926','#321b17','#472618','#703d25','#7a442b','#804a2e'],
    ['#a6603d','#a36040','#a76544','#b06742','#7f5746','#2f3133','#4d4d4d','#515254','#3e3f40','#202224','#212323','#313030','#232425','#28201c','#854f39','#432a25','#3d2419','#77462d','#6f3f28','#6a3c24'],
    ['#cf835a','#b46e49','#c17952','#cc7e52','#8f6753','#464a4c','#444342','#535354','#313131','#0e0f0f','#1b1d1c','#1b1b1b','#181818','#151817','#473630','#633d32','#593525','#814e33','#965838','#995837'],
    ['#cf825a','#c87d54','#c87951','#c7794f','#755b4e','#3a3e40','#201f1f','#3a3a3b','#4a4b4c','#1d1e1d','#232424','#262627','#181918','#1a1a19','#191d1e','#83533c','#be7348','#c27d53','#b8704a','#ac633e'],
  ]

  const pixels = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      pixels.push({ gx: c, gy: r, color: grid[r][c] })
    }
  }

  // Eye positions (approximate from the photo)
  const eyePixels = [
    {gx:8, gy:9}, {gx:9, gy:9},   // left eye
    {gx:10, gy:9}, {gx:11, gy:9},  // right eye area
  ]

  const sparkles = []
  for (let i = 0; i < 30; i++) {
    sparkles.push({
      x: Math.random(), y: Math.random(),
      size: Math.random() * 1 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.01,
    })
  }

  cell.data.pixels = pixels
  cell.data.eyePixels = eyePixels
  cell.data.sparkles = sparkles
  cell.data.COLS = 20
  cell.data.ROWS = 20
  cell.data.blinkTimer = 0
  cell.data.isBlinking = false
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world
  if (!myData) return
  const { pixels, eyePixels, sparkles, COLS, ROWS } = myData

  // Dark background
  ctx.fillStyle = '#0a0908'
  ctx.fillRect(0, 0, cellW, cellH)

  const pixSize = Math.min(cellW / COLS, cellH / ROWS)
  const totalW = COLS * pixSize
  const totalH = ROWS * pixSize
  const offsetX = (cellW - totalW) / 2
  const offsetY = (cellH - totalH) / 2

  // Subtle breathing
  const breathe = Math.sin(frame * 0.02) * 0.3

  // Blink
  myData.blinkTimer++
  if (!myData.isBlinking && myData.blinkTimer > 220 + Math.random() * 80) {
    myData.isBlinking = true
    myData.blinkTimer = 0
  }
  if (myData.isBlinking && myData.blinkTimer > 8) {
    myData.isBlinking = false
    myData.blinkTimer = 0
  }

  // Check if pixel is an eye
  function isEye(gx, gy) {
    return myData.eyePixels.some(e => e.gx === gx && e.gy === gy)
  }

  // Draw mosaic
  for (const p of pixels) {
    const x = offsetX + p.gx * pixSize
    const yOff = p.gy > 14 ? breathe : 0
    const y = offsetY + p.gy * pixSize + yOff

    let color = p.color
    // Blink: darken eye pixels
    if (myData.isBlinking && isEye(p.gx, p.gy)) {
      color = '#020202'
    }

    // Gentle shimmer
    const shimmer = 0.9 + 0.1 * Math.sin(frame * 0.012 + p.gx * 0.4 + p.gy * 0.3)
    ctx.globalAlpha = shimmer
    ctx.fillStyle = color
    ctx.fillRect(x + 0.3, y + 0.3, pixSize - 0.6, pixSize - 0.6)
  }
  ctx.globalAlpha = 1

  // Sparkles
  for (const s of sparkles) {
    s.phase += s.speed
    ctx.globalAlpha = 0.08 + 0.15 * Math.abs(Math.sin(s.phase))
    ctx.fillStyle = '#f0e4d0'
    ctx.beginPath()
    ctx.arc(s.x * cellW, s.y * cellH, s.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
