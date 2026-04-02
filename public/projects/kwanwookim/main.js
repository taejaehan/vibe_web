// 랜덤 타이포그래피 비주얼 — Kwanwookim
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?';
const WORDS = ['TYPE', 'VIBE', 'WAVE', 'GLYPH', 'FLUX', 'CODE', 'FORM', 'DRIFT'];

function setup(cell) {
  const count = 30;
  cell.data.glyphs = [];
  for (let i = 0; i < count; i++) {
    cell.data.glyphs.push({
      x: Math.random(),
      y: Math.random(),
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      size: 0.04 + Math.random() * 0.08,
      speed: 0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() * 360,
      opacity: 0.4 + Math.random() * 0.6,
      changeRate: Math.floor(20 + Math.random() * 60),
    });
  }
  cell.data.wordIndex = 0;
  cell.data.wordX = 0.5;
  cell.data.wordY = 0.5;
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world;
  const glyphs = myData.glyphs;

  // 잔상 효과 배경
  ctx.fillStyle = 'rgba(5, 5, 15, 0.18)';
  ctx.fillRect(0, 0, cellW, cellH);

  // 떠다니는 글리프들
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];

    // 프레임마다 랜덤하게 문자 교체
    if (frame % g.changeRate === i % g.changeRate) {
      g.char = CHARS[Math.floor(Math.random() * CHARS.length)];
      g.hue = (g.hue + 30 + Math.random() * 60) % 360;
    }

    // 위치 애니메이션
    const px = (g.x + Math.sin(frame * g.speed + g.phase) * 0.12) * cellW;
    const py = (g.y + Math.cos(frame * g.speed * 0.7 + g.phase) * 0.1) * cellH;

    const fontSize = g.size * cellW;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 글로우 효과
    ctx.shadowColor = `hsl(${g.hue}, 100%, 60%)`;
    ctx.shadowBlur = fontSize * 0.8;
    ctx.fillStyle = `hsla(${g.hue}, 90%, 70%, ${g.opacity})`;
    ctx.fillText(g.char, px, py);
    ctx.shadowBlur = 0;
  }

  // 중앙 단어 — 천천히 페이드 인/아웃
  const wordCycle = 120;
  const t = frame % wordCycle;
  const wordIdx = Math.floor(frame / wordCycle) % WORDS.length;
  const alpha = t < 20 ? t / 20 : t > 100 ? (wordCycle - t) / 20 : 1;
  const word = WORDS[wordIdx];

  const wSize = cellW * 0.13;
  ctx.font = `900 ${wSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const wHue = (frame * 0.8) % 360;
  ctx.shadowColor = `hsl(${wHue}, 100%, 65%)`;
  ctx.shadowBlur = wSize * 1.2;
  ctx.fillStyle = `hsla(${wHue}, 100%, 85%, ${alpha})`;
  ctx.fillText(word, cellW / 2, cellH / 2);
  ctx.shadowBlur = 0;

  // 하단 ID 표시
  const idSize = cellW * 0.04;
  ctx.font = `${idSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = `hsla(${(frame * 0.5) % 360}, 70%, 70%, 0.6)`;
  ctx.fillText('kwanwookim', cellW / 2, cellH - cellH * 0.04);
}
