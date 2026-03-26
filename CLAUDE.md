# Vibe Canvas — Claude Code 가이드

이 프로젝트에 새 참여자를 추가할 때 반드시 지켜야 할 규칙입니다.

## 파일 위치 (절대 틀리면 안 됨)

모든 정적 파일은 **`public/` 폴더 안에** 있어야 합니다. 루트의 `data/`나 `projects/`에 넣으면 빌드에 포함되지 않습니다.

- 캔버스 코드: `public/projects/{id}/main.js`
- 프로젝트 메타: `public/data/{id}.json`
- 참여자 목록: `public/data/config.json`

## 새 참여자 추가 시 체크리스트

1. `public/projects/{id}/main.js` 생성 — `setup(cell)`과 `draw(ctx, world)` 함수 필수
2. `public/data/{id}.json` 생성 — id, title, description, url, stack, code 필드 포함
3. `public/data/config.json`의 `players` 배열 맨 뒤에 ID 추가
4. JSON의 `code` 필드 값은 `projects/{id}/main.js` (public/ 접두사 없음)
5. 브랜치는 `add/{id}` 로 생성
6. 기존 파일(index.html, js/*, 다른 사람 파일) 절대 수정 금지

## draw() 작성 규칙

- 좌표는 `cellW`, `cellH` 기준 비율로 작성 (절대값 하드코딩 금지)
- 매 프레임 `ctx.fillRect(0, 0, cellW, cellH)`로 배경 그리기
- 사용 가능한 world 변수: `cellW`, `cellH`, `frame`, `myData`
