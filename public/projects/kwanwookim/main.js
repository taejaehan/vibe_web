// reffect - Motion Creator — RIT STUDIO

function setup(cell) {
  cell.data.stars = [];
  for (let i = 0; i < 6; i++) {
    cell.data.stars.push({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      birth: Math.floor(Math.random() * 150),
      life: 70 + Math.floor(Math.random() * 80),
    });
  }
}

function drawGlint(ctx, x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(0.5, size * 0.06);
  ctx.lineCap = 'round';

  // 가로 암
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.bezierCurveTo(x - size * 0.2, y - size * 0.04, x - size * 0.05, y, x, y);
  ctx.bezierCurveTo(x + size * 0.05, y, x + size * 0.2, y + size * 0.04, x + size, y);
  ctx.stroke();

  // 세로 암
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.2, x, y - size * 0.05, x, y);
  ctx.bezierCurveTo(x, y + size * 0.05, x - size * 0.04, y + size * 0.2, x, y + size);
  ctx.stroke();

  // 중심 점
  ctx.beginPath();
  ctx.arc(x, y, size * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world;

  // 배경
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, cellW, cellH);

  // 엘립스 그리드
  const cols = 13;
  const rows = 9;
  const padX = cellW * 0.06;
  const padY = cellH * 0.08;
  const stepX = (cellW - padX * 2) / (cols - 1);
  const stepY = (cellH - padY * 2) / (rows - 1);
  const maxR = stepX * 0.38;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * stepX;
      const y = padY + r * stepY;

      const nx = c / (cols - 1) - 0.5;
      const ny = r / (rows - 1) - 0.5;
      const dist = Math.sqrt(nx * nx + ny * ny);
      const wave = Math.sin(frame * 0.045 - dist * 10 + c * 0.3);
      const t = wave * 0.5 + 0.5; // 0~1

      const rx = maxR * (0.15 + 0.85 * t);
      const ry = rx * 0.55;
      const alpha = 0.2 + 0.7 * t;

      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  // 스타 글린트
  const stars = myData.stars;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const age = (frame - s.birth + 600) % 600;
    if (age > s.life) {
      if (age > s.life + 2) {
        stars[i] = {
          x: 0.1 + Math.random() * 0.8,
          y: 0.1 + Math.random() * 0.8,
          birth: frame,
          life: 70 + Math.floor(Math.random() * 80),
        };
      }
      continue;
    }
    const t = age / s.life;
    const alpha = Math.sin(t * Math.PI);
    const size = cellW * 0.055 * Math.sin(t * Math.PI);
    drawGlint(ctx, s.x * cellW, s.y * cellH, size, alpha);
  }

  // 중앙 텍스트 — REFFECT
  const textSize = cellW * 0.11;
  ctx.font = `900 ${textSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const pulse = 0.75 + 0.25 * Math.sin(frame * 0.03);
  ctx.shadowColor = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = textSize * 0.6 * pulse;
  ctx.fillStyle = `rgba(255,255,255,${0.85 + 0.15 * pulse})`;
  ctx.fillText('REFFECT', cellW / 2, cellH / 2);
  ctx.shadowBlur = 0;

  // 하단 라벨
  const labelSize = cellW * 0.038;
  ctx.font = `${labelSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('RIT STUDIO®', cellW / 2, cellH - cellH * 0.04);
}
