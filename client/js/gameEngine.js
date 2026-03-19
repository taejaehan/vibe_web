// 플레이어 코드 실행 + 에러 격리

// Sandbox 모드용 (ctx에 직접 그리기)
export function executePlayerCode(code, ctx, world, player) {
  try {
    // setup이 필요한 경우 실행
    if (player.needsSetup) {
      player.needsSetup = false
      player.data = {}

      const cell = {
        width: world.cellW,
        height: world.cellH,
        data: player.data
      }

      const setupFn = new Function('cell', `
        ${code}
        if (typeof setup === 'function') setup(cell);
      `)

      try {
        setupFn(cell)
        player.data = cell.data
      } catch (e) {
        return { error: `setup error: ${e.message}` }
      }
    }

    // draw 실행
    world.myData = player.data

    const drawFn = new Function('ctx', 'world', `
      ${code}
      if (typeof draw === 'function') draw(ctx, world);
    `)

    drawFn(ctx, world)

    return { error: null }
  } catch (e) {
    return { error: e.message }
  }
}

// PixelWar 모드용 (공 위치만 업데이트)
export function executePixelWarCode(code, world, player) {
  try {
    // setup이 필요한 경우 실행
    if (player.needsSetup) {
      player.needsSetup = false
      player.data = {}

      const cell = {
        width: world.canvasW,
        height: world.canvasH,
        data: player.data
      }

      const setupFn = new Function('cell', `
        ${code}
        if (typeof setup === 'function') setup(cell);
      `)

      try {
        setupFn(cell)
        player.data = cell.data
      } catch (e) {
        return { error: `setup error: ${e.message}` }
      }
    }

    // draw 실행 (ctx 없이, world.myBall 위치만 업데이트)
    world.myData = player.data

    // 가짜 ctx 제공 (호환성)
    const dummyCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {}
    }

    const drawFn = new Function('ctx', 'world', `
      ${code}
      if (typeof draw === 'function') draw(ctx, world);
    `)

    drawFn(dummyCtx, world)

    return { error: null }
  } catch (e) {
    return { error: e.message }
  }
}
