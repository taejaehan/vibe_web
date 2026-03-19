// 게임 모드 로더
import sandbox from './sandbox.js'
import pixelwar from './pixelwar.js'

export const gameModes = {
  sandbox,
  pixelwar
}

export function getGameMode(name) {
  return gameModes[name] || gameModes.sandbox
}

export default gameModes
