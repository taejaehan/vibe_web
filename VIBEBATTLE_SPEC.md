# 🎮 VibeBattle — 실시간 바이브코딩 배틀 플랫폼

## 한 줄 요약
12명이 각자 브라우저에서 코드를 작성하면, 하나의 공유 캔버스에 실시간으로 반영되는 라이브 코딩 배틀 쇼 플랫폼

---

## 즉시 실행 목표
```bash
npm install
npm run dev
# → localhost:3000/stage    (OBS용 12분할 전체 화면)
# → localhost:3000/player/1 (참가자 1번 접속)
# → localhost:3000/admin    (호스트 컨트롤 패널)
```

---

## 기술 스택
- **Backend**: Node.js + Express + Socket.io
- **Frontend**: Vite + Vanilla JS (프레임워크 없이)
- **에디터**: Monaco Editor (CDN)
- **캔버스**: HTML5 Canvas API
- **패키지**: `express` `socket.io` `vite`

---

## 디렉토리 구조
```
vibebattle/
├── server/
│   ├── index.js          ← Express + Socket.io 서버
│   └── gameState.js      ← 서버 사이드 게임 상태 관리
├── client/
│   ├── stage.html        ← 12분할 전체 캔버스 (OBS용)
│   ├── player.html       ← 참가자 코딩 화면
│   ├── admin.html        ← 호스트 컨트롤 패널
│   └── js/
│       ├── stage.js      ← 캔버스 렌더링 엔진
│       ├── player.js     ← 에디터 + 소켓 클라이언트
│       ├── admin.js      ← 게임 컨트롤 로직
│       └── gameEngine.js ← 플레이어 코드 실행 + 에러 격리
├── games/                ← 🔑 게임 모드 모듈 (핵심)
│   ├── index.js          ← 게임 모드 로더
│   ├── sandbox.js        ← 기본 자유 모드
│   ├── zoo.js            ← 동물원 미션
│   └── pixelwar.js       ← 픽셀 전쟁 모드
├── package.json
└── vite.config.js
```

---

## 핵심 개념

### 메인 코드 vs 플레이어 코드

```
메인 코드 (games/*.js)
  → 게임 규칙, 공유 상태, 월드 제공
  → 매 프레임 각 플레이어 draw() 호출
  → 참가자가 수정 불가

플레이어 코드 (브라우저 에디터에서 작성)
  → setup(cell) : 초기화, 한 번 실행
  → draw(ctx, world) : 매 프레임 실행
  → 에러 발생 시 해당 셀만 격리, 나머지 정상 동작
```

### 플레이어 코드 인터페이스

플레이어는 아래 두 함수만 작성하면 됨:

```javascript
function setup(cell) {
  // cell.width, cell.height 사용 가능
  // 초기 상태 세팅
  cell.data.particles = []
  cell.data.color = 'red'
}

function draw(ctx, world) {
  // ctx : 내 셀 전용 (이미 클리핑됨, 좌표는 0,0 기준)
  // world.frame    : 현재 프레임 번호
  // world.cellW    : 셀 너비
  // world.cellH    : 셀 높이
  // world.players  : 전체 플레이어 공개 상태 (읽기 전용)
  // world.gameData : 현재 게임 모드 공유 데이터
  // world.myData   : 내 setup에서 저장한 데이터
  
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, world.cellW, world.cellH)
}
```

---

## 게임 엔진 동작 방식

### stage.js 메인 루프 (중요)

```javascript
function mainLoop() {
  // 1. 배경 클리어
  // 2. 게임 모드의 drawBackground(ctx, world) 호출
  // 3. 각 플레이어 셀 순서대로:
  //    - ctx.save()
  //    - translate(cellX, cellY)
  //    - clip() 으로 셀 영역 제한
  //    - try { player.draw(ctx, world) }
  //    - catch { 빨간 테두리 + 에러 메시지 표시 }
  //    - ctx.restore()
  // 4. 게임 모드의 drawOverlay(ctx, world) 호출 (영역 선 등)
  // 5. requestAnimationFrame(mainLoop)
}
```

### 에러 셀 시각화
```
┌──────────────┐
│ 🔴 ERROR      │  ← 빨간 테두리
│               │
│  player.js:3  │  ← 에러 위치
│  is not def.. │  ← 에러 메시지
│               │
│  [Player 3]   │
└──────────────┘
```
에러 수정 후 실행 버튼 클릭 시 즉시 정상화

---

## 소켓 이벤트 명세

### Client → Server
```javascript
'player:join'     { playerId, name }          // 접속
'player:code'     { playerId, code }           // 코드 제출
'player:ready'    { playerId }                 // 준비 완료
```

### Server → Client
```javascript
'game:state'      { players, gameMode, status } // 전체 상태
'game:start'      { gameMode, config }          // 게임 시작
'game:mission'    { text, timeLimit }           // 미션 공지
'player:update'   { playerId, code, status }    // 특정 플레이어 변경
'game:event'      { type, data }                // 게임 중 이벤트
```

### Admin → Server
```javascript
'admin:setMode'   { gameMode }                 // 게임 모드 변경
'admin:start'                                  // 게임 시작
'admin:reset'                                  // 전체 리셋
'admin:mission'   { text, timeLimit }          // 미션 전송
'admin:event'     { type, targetId, data }     // 특수 이벤트 발동
```

---

## 게임 모드 모듈 구조 (games/*.js)

모든 게임 모드는 아래 인터페이스를 구현:

```javascript
// games/zoo.js 예시
export default {
  name: 'zoo',
  displayName: '🦁 동물원 만들기',
  description: '각자 동물 하나씩, 함께 동물원 완성!',
  
  // 게임 시작 시 초기화
  init(world) {
    world.gameData.theme = 'jungle'
  },

  // 매 프레임 배경 (플레이어 셀 아래)
  drawBackground(ctx, world) {
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, world.width, world.height)
  },

  // 매 프레임 오버레이 (플레이어 셀 위)
  drawOverlay(ctx, world) {
    // 셀 구분선 그리기
    drawGrid(ctx, world)
  },

  // 플레이어 코드에 주입할 기본 템플릿
  playerTemplate: `
function setup(cell) {
  cell.data.x = cell.width / 2
  cell.data.y = cell.height / 2
}

function draw(ctx, world) {
  // 여기에 동물을 그려보세요!
  ctx.fillStyle = '#333'
  ctx.fillRect(0, 0, world.cellW, world.cellH)
  
  ctx.fillStyle = 'white'
  ctx.font = '40px serif'
  ctx.textAlign = 'center'
  ctx.fillText('🐾', world.cellW/2, world.cellH/2)
}
  `
}
```

---

## 화면별 상세

### /stage (OBS용)
- 전체 캔버스 (기본 1920x1080)
- 12개 셀 그리드 (4열 x 3행)
- 각 셀 상단에 플레이어 이름 표시
- 에러 셀은 빨간 테두리
- 접속 안 한 셀은 "EMPTY" 표시
- UI 없음, 캔버스만

### /player/:id
```
┌─────────────────────────────────┐
│ 🎮 VibeBattle  [ Player 3 - Jay ]│
├─────────────────────────────────┤
│ 📋 미션: 살아있는 생명체를 만들어라│
├──────────────────┬──────────────┤
│                  │ 내 셀 미리보기│
│  Monaco Editor   │  (실시간)    │
│                  │              │
│                  │              │
│                  ├──────────────┤
│                  │ 📡 상태: 연결됨│
│                  │ ⚡ 프레임: 60  │
└──────────────────┴──────────────┘
         [ 실행 (Ctrl+Enter) ]
```

### /admin
- 플레이어 접속 현황 (이름, 상태, 마지막 실행 시간)
- 게임 모드 선택 드롭다운
- 미션 텍스트 입력 + 전송
- 게임 시작 / 리셋 버튼
- 특수 이벤트 버튼들 (사보타주, 룰 변경 등)
- 각 플레이어 강제 리셋 버튼

---

## 플레이어 코드 실행 샌드박스

보안 + 에러 격리를 위해 Function 생성자 사용:

```javascript
function executePlayerCode(code, ctx, world) {
  try {
    const fn = new Function('ctx', 'world', `
      ${code}
      if (typeof draw === 'function') draw(ctx, world);
    `)
    fn(ctx, world)
  } catch(e) {
    return { error: e.message }
  }
  return { error: null }
}
```

setup()은 코드 제출 시 한 번만 실행, draw()는 매 프레임 실행.

---

## 레이아웃 계산

```javascript
const GRID = {
  cols: 4,
  rows: 3,
  total: 12,
  // 캔버스 크기에서 자동 계산
  cellW: canvasWidth / cols,
  cellH: canvasHeight / rows,
  // playerId(1~12) → 셀 좌표
  getCell: (id) => ({
    x: ((id-1) % cols) * cellW,
    y: Math.floor((id-1) / cols) * cellH
  })
}
```

---

## 개발 순서 (우선순위)

1. **서버 기본** - Express + Socket.io + 게임 상태 관리
2. **stage.html** - 12분할 캔버스 + 메인 루프
3. **player.html** - Monaco 에디터 + 소켓 연결 + 미리보기
4. **에러 격리** - try/catch + 에러 셀 시각화
5. **admin.html** - 게임 컨트롤 패널
6. **games/sandbox.js** - 기본 자유 모드
7. **games/zoo.js** - 첫 번째 미션 모드
8. **테스트** - 호스트 + 멀티 탭으로 플레이어 시뮬레이션

---

## 즉시 테스트 방법

```bash
# 터미널 1
npm run dev

# 브라우저에서:
# 탭 1: localhost:3000/stage       ← 전체 화면
# 탭 2: localhost:3000/player/1    ← 내가 플레이어 1
# 탭 3: localhost:3000/player/2    ← 내가 플레이어 2 (테스트)
# 탭 4: localhost:3000/admin       ← 호스트 패널
```

---

## 참고: 비개발자 참가자 안내 문구

```
📱 접속 방법
1. 같은 WiFi 연결
2. 브라우저에서 192.168.x.x:3000/player/[번호] 접속
3. Claude.ai 에서 코드 만들어서 붙여넣기
4. Ctrl+Enter 로 실행

💡 Claude한테 이렇게 물어보세요:
"draw(ctx, world) 함수 안에서 
 cellW, cellH 크기의 캔버스에 
 [원하는 것] 그리는 코드 짜줘"
```

---

## 확장 가능성 (나중에)

- [ ] 온라인 배포 (Railway + 도메인)
- [ ] 관전자 채팅 (Twitch 연동)
- [ ] 코드 저장 + 갤러리
- [ ] 투표 시스템 (QR코드로 관객 참여)
- [ ] 녹화 + 하이라이트 자동 편집
