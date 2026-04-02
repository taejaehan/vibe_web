function setup(cell) {
  cell.data.blink = 0;
  cell.data.mouthOpen = 0;
  cell.data.bubbleTimer = 0;
  cell.data.bubbles = [];
  cell.data.messages = ["...", "uhh...", "duh!", "wut?", "hehe", "umm"];
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world;

  // Background - ocean blue
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, cellW, cellH);

  // Subtle bubble bg
  ctx.fillStyle = 'rgba(0, 150, 255, 0.04)';
  for (let i = 0; i < 5; i++) {
    const bx = (cellW * 0.1 * i + frame * 0.3 * (i % 2 === 0 ? 1 : -1)) % cellW;
    const by = (cellH * 0.2 * i + frame * 0.4) % cellH;
    ctx.beginPath();
    ctx.arc(bx, by, cellH * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chat UI title bar
  const barH = cellH * 0.1;
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(0, 0, cellW, barH);
  ctx.fillStyle = '#7ec8e3';
  ctx.font = `bold ${cellH * 0.045}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText('💬 SpongeBob Chat', cellW * 0.05, barH * 0.68);

  // Online indicator
  ctx.fillStyle = '#44ff88';
  ctx.beginPath();
  ctx.arc(cellW * 0.88, barH * 0.5, cellH * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aaffcc';
  ctx.font = `${cellH * 0.032}px monospace`;
  ctx.textAlign = 'right';
  ctx.fillText('online', cellW * 0.97, barH * 0.68);

  // SpongeBob center
  const cx = cellW * 0.5;
  const cy = cellH * 0.58;
  const sc = Math.min(cellW, cellH) * 0.0028;

  // Blink logic
  myData.blink = (myData.blink + 1) % 90;
  const isBlinking = myData.blink > 82;

  // Mouth animation
  const isTalking = Math.floor(frame / 20) % 2 === 0;
  const mouthH = isTalking ? sc * 6 : sc * 2;

  // Pants (brown)
  ctx.fillStyle = '#5c3a1e';
  ctx.fillRect(cx - sc * 16, cy + sc * 22, sc * 32, sc * 18);

  // Belt
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(cx - sc * 16, cy + sc * 20, sc * 32, sc * 4);
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(cx - sc * 4, cy + sc * 20, sc * 8, sc * 4);

  // Shirt (white)
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(cx - sc * 14, cy + sc * 2, sc * 28, sc * 20);

  // Tie (red)
  ctx.fillStyle = '#cc2200';
  ctx.beginPath();
  ctx.moveTo(cx, cy + sc * 4);
  ctx.lineTo(cx - sc * 5, cy + sc * 10);
  ctx.lineTo(cx, cy + sc * 20);
  ctx.lineTo(cx + sc * 5, cy + sc * 10);
  ctx.closePath();
  ctx.fill();

  // Body (yellow sponge)
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.roundRect(cx - sc * 18, cy - sc * 20, sc * 36, sc * 40, sc * 4);
  ctx.fill();

  // Sponge holes
  ctx.fillStyle = 'rgba(180, 100, 0, 0.25)';
  const holes = [
    [-10, -10, 4], [5, -14, 3], [-4, 0, 5], [10, 2, 3],
    [-12, 10, 3], [6, 12, 4], [-2, 18, 3], [12, -4, 2]
  ];
  for (const [hx, hy, hr] of holes) {
    ctx.beginPath();
    ctx.arc(cx + sc * hx, cy + sc * hy, sc * hr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes white
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(cx - sc * 8, cy - sc * 8, sc * 9, isBlinking ? sc * 1 : sc * 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + sc * 8, cy - sc * 8, sc * 9, isBlinking ? sc * 1 : sc * 11, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!isBlinking) {
    // Irises (blue)
    ctx.fillStyle = '#4488ff';
    ctx.beginPath();
    ctx.ellipse(cx - sc * 8, cy - sc * 6, sc * 6, sc * 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + sc * 8, cy - sc * 6, sc * 6, sc * 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx - sc * 8, cy - sc * 5, sc * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + sc * 8, cy - sc * 5, sc * 3, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(cx - sc * 6, cy - sc * 7, sc * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + sc * 10, cy - sc * 7, sc * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose
  ctx.fillStyle = '#d4a020';
  ctx.beginPath();
  ctx.ellipse(cx, cy + sc * 2, sc * 3, sc * 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheek blush
  ctx.fillStyle = 'rgba(255, 100, 80, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - sc * 14, cy + sc * 4, sc * 5, sc * 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + sc * 14, cy + sc * 4, sc * 5, sc * 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (big goofy smile)
  ctx.strokeStyle = '#111';
  ctx.lineWidth = sc * 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy + sc * 10, sc * 12, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Buck teeth
  ctx.fillStyle = 'white';
  ctx.fillRect(cx - sc * 6, cy + sc * 10, sc * 5, sc * mouthH);
  ctx.fillRect(cx + sc * 1, cy + sc * 10, sc * 5, sc * mouthH);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = sc * 0.5;
  ctx.strokeRect(cx - sc * 6, cy + sc * 10, sc * 5, sc * mouthH);
  ctx.strokeRect(cx + sc * 1, cy + sc * 10, sc * 5, sc * mouthH);

  // Arms
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = sc * 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - sc * 18, cy + sc * 5);
  ctx.quadraticCurveTo(cx - sc * 26, cy + sc * 15, cx - sc * 20, cy + sc * 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + sc * 18, cy + sc * 5);
  ctx.quadraticCurveTo(cx + sc * 26, cy + sc * 15, cx + sc * 20, cy + sc * 28);
  ctx.stroke();

  // Legs
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = sc * 6;
  ctx.beginPath();
  ctx.moveTo(cx - sc * 8, cy + sc * 40);
  ctx.lineTo(cx - sc * 10, cy + sc * 55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + sc * 8, cy + sc * 40);
  ctx.lineTo(cx + sc * 10, cy + sc * 55);
  ctx.stroke();

  // Shoes
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(cx - sc * 12, cy + sc * 57, sc * 8, sc * 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + sc * 12, cy + sc * 57, sc * 8, sc * 4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Chat bubble
  myData.bubbleTimer = (myData.bubbleTimer || 0) + 1;
  const bubbleCycle = 120;
  const t = myData.bubbleTimer % bubbleCycle;
  const msgIdx = Math.floor(myData.bubbleTimer / bubbleCycle) % myData.messages.length;

  if (t < bubbleCycle * 0.75) {
    const alpha = t < 10 ? t / 10 : t > bubbleCycle * 0.65 ? (bubbleCycle * 0.75 - t) / (bubbleCycle * 0.1) : 1;
    const bx = cx + sc * 20;
    const by = cy - sc * 35;
    const bw = cellW * 0.32;
    const bh = cellH * 0.1;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#7ec8e3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by - bh / 2, bw, bh, 8);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + bh / 2 - 2);
    ctx.lineTo(bx - 8, by + bh / 2 + 10);
    ctx.lineTo(bx + 18, by + bh / 2 - 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#7ec8e3';
    ctx.stroke();

    ctx.fillStyle = '#1a1a2e';
    ctx.font = `bold ${cellH * 0.038}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(myData.messages[msgIdx], bx + bw / 2, by + cellH * 0.03);
    ctx.restore();
  }

  // Name label
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(cx - cellW * 0.2, cellH * 0.88, cellW * 0.4, cellH * 0.09);
  ctx.fillStyle = '#f5c542';
  ctx.font = `bold ${cellH * 0.038}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('SpongeBot', cx, cellH * 0.935);
}
