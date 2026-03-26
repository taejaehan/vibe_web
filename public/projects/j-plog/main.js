function setup(cell) {
  cell.data.captions = ["오늘의 산책", "어제 저녁", "그 날의 기억", "봄의 끝자락", "빛이 좋던 날", "잠깐의 쉼"];
  cell.data.tilts = [-0.05, 0.03, -0.025, 0.018, -0.038, 0.05];
}

function drawScene(ctx, px, py, pW, photoH, type) {
  if (type === 0) {
    // 산책길 - 하늘 + 길 + 나무
    ctx.fillStyle = '#b8c8d4';
    ctx.fillRect(px, py, pW, photoH * 0.55);
    ctx.fillStyle = '#a89880';
    ctx.fillRect(px, py + photoH * 0.55, pW, photoH * 0.45);
    ctx.fillStyle = '#bfb09a';
    ctx.beginPath();
    ctx.moveTo(px + pW * 0.3, py + photoH);
    ctx.lineTo(px + pW * 0.7, py + photoH);
    ctx.lineTo(px + pW * 0.56, py + photoH * 0.55);
    ctx.lineTo(px + pW * 0.44, py + photoH * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6b7a5e';
    ctx.fillRect(px + pW * 0.74, py + photoH * 0.5, pW * 0.03, photoH * 0.5);
    ctx.fillStyle = '#5e7052';
    ctx.beginPath();
    ctx.arc(px + pW * 0.755, py + photoH * 0.36, pW * 0.085, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 1) {
    // 저녁 창문 + 불빛
    ctx.fillStyle = '#1c1220';
    ctx.fillRect(px, py, pW, photoH * 0.65);
    ctx.fillStyle = '#100c14';
    ctx.fillRect(px, py + photoH * 0.65, pW, photoH * 0.35);
    var g = ctx.createLinearGradient(0, py + photoH * 0.58, 0, py + photoH * 0.68);
    g.addColorStop(0, 'rgba(160, 60, 30, 0.6)');
    g.addColorStop(1, 'rgba(160, 60, 30, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(px, py + photoH * 0.58, pW, photoH * 0.1);
    ctx.fillStyle = '#e8b840';
    [[0.18, 0.22], [0.32, 0.14], [0.58, 0.28], [0.72, 0.18], [0.48, 0.36]].forEach(function(w) {
      ctx.fillRect(px + pW * w[0], py + photoH * w[1], pW * 0.07, photoH * 0.09);
    });
  } else if (type === 2) {
    // 카페 창문
    ctx.fillStyle = '#ddd0b8';
    ctx.fillRect(px, py, pW, photoH);
    ctx.strokeStyle = '#7a6a50';
    ctx.lineWidth = Math.max(1, pW * 0.04);
    ctx.strokeRect(px + pW * 0.12, py + photoH * 0.1, pW * 0.76, photoH * 0.58);
    ctx.beginPath();
    ctx.moveTo(px + pW * 0.5, py + photoH * 0.1);
    ctx.lineTo(px + pW * 0.5, py + photoH * 0.68);
    ctx.moveTo(px + pW * 0.12, py + photoH * 0.39);
    ctx.lineTo(px + pW * 0.88, py + photoH * 0.39);
    ctx.stroke();
    ctx.fillStyle = '#c0aa88';
    ctx.fillRect(px + pW * 0.08, py + photoH * 0.74, pW * 0.84, photoH * 0.05);
    ctx.fillStyle = '#a08868';
    ctx.fillRect(px + pW * 0.35, py + photoH * 0.79, pW * 0.3, photoH * 0.18);
  } else if (type === 3) {
    // 꽃밭 봄
    ctx.fillStyle = '#c8dce8';
    ctx.fillRect(px, py, pW, photoH * 0.5);
    ctx.fillStyle = '#7a9e68';
    ctx.fillRect(px, py + photoH * 0.5, pW, photoH * 0.5);
    ctx.fillStyle = '#e878a0';
    for (var fi = 0; fi < 8; fi++) {
      var fx = px + pW * (0.1 + fi * 0.11);
      var fy = py + photoH * (0.52 + (fi % 3) * 0.1);
      ctx.beginPath();
      ctx.arc(fx, fy, pW * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f0a0c0';
    for (var fi2 = 0; fi2 < 5; fi2++) {
      var fx2 = px + pW * (0.15 + fi2 * 0.17);
      var fy2 = py + photoH * (0.6 + (fi2 % 2) * 0.12);
      ctx.beginPath();
      ctx.arc(fx2, fy2, pW * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 4) {
    // 햇빛 창 / 그림자
    ctx.fillStyle = '#f0e0c0';
    ctx.fillRect(px, py, pW, photoH);
    ctx.fillStyle = 'rgba(200, 160, 80, 0.25)';
    ctx.fillRect(px, py, pW * 0.5, photoH);
    for (var si = 0; si < 4; si++) {
      ctx.fillStyle = 'rgba(180, 130, 60, 0.15)';
      ctx.fillRect(px + pW * (0.05 + si * 0.12), py, pW * 0.06, photoH);
    }
    ctx.fillStyle = '#8a7050';
    ctx.fillRect(px, py + photoH * 0.82, pW, photoH * 0.03);
    ctx.fillRect(px + pW * 0.1, py + photoH * 0.85, pW * 0.35, photoH * 0.15);
  } else {
    // 풀밭 쉼
    var sky = ctx.createLinearGradient(0, py, 0, py + photoH * 0.5);
    sky.addColorStop(0, '#a0b8cc');
    sky.addColorStop(1, '#c8d8e4');
    ctx.fillStyle = sky;
    ctx.fillRect(px, py, pW, photoH * 0.5);
    ctx.fillStyle = '#889870';
    ctx.fillRect(px, py + photoH * 0.5, pW, photoH * 0.5);
    ctx.fillStyle = '#6a8058';
    ctx.beginPath();
    ctx.arc(px + pW * 0.5, py + photoH * 0.48, pW * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a7048';
    ctx.beginPath();
    ctx.arc(px + pW * 0.38, py + photoH * 0.52, pW * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + pW * 0.62, py + photoH * 0.52, pW * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world;

  const LOOP = 540;
  const f = frame % LOOP;

  ctx.fillStyle = '#0e0d0b';
  ctx.fillRect(0, 0, cellW, cellH);

  const cols = 3, rows = 2;
  const pW = cellW * 0.27;
  const pH = cellH * 0.43;
  const photoH = pH * 0.73;
  const marginH = pH - photoH;

  for (var i = 0; i < 6; i++) {
    var col = i % cols;
    var row = Math.floor(i / cols);

    var cx = cellW * (col + 0.5) / cols;
    var cy = cellH * (row + 0.5) / rows;
    var px = cx - pW / 2;
    var py = cy - pH / 2;

    var delay = i * 55;
    var localF = Math.max(0, f - delay);

    var alpha = Math.min(1, localF / 25);
    if (f > LOOP - 50) alpha *= (LOOP - f) / 50;
    if (alpha <= 0) continue;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(myData.tilts[i]);
    ctx.translate(-cx, -cy);

    // 폴라로이드 틀
    ctx.shadowColor = 'rgba(255, 240, 200, 0.12)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ede8df';
    ctx.fillRect(px, py, pW, pH);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // 사진 영역 clip
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pW, photoH);
    ctx.clip();

    drawScene(ctx, px, py, pW, photoH, i % 6);

    // 현상 오버레이
    var devStart = 20, devEnd = 110;
    if (localF < devEnd) {
      var progress = localF < devStart ? 0 : (localF - devStart) / (devEnd - devStart);
      var revealLine = photoH * Math.pow(progress, 0.65);
      var darkOpacity = 0.92 * (1 - progress * 0.12);
      ctx.fillStyle = 'rgba(8, 6, 4, ' + darkOpacity + ')';
      ctx.fillRect(px, py + revealLine, pW, photoH - revealLine);
      if (progress > 0.02 && progress < 0.98) {
        var edgeSize = photoH * 0.09;
        var grad = ctx.createLinearGradient(0, py + revealLine - edgeSize / 2, 0, py + revealLine + edgeSize / 2);
        grad.addColorStop(0, 'rgba(8, 6, 4, 0)');
        grad.addColorStop(1, 'rgba(8, 6, 4, ' + darkOpacity + ')');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py + revealLine - edgeSize / 2, pW, edgeSize);
      }
    }

    ctx.restore();

    // 캡션
    if (localF > 120) {
      var captionPhase = localF - 120;
      var caption = myData.captions[i];
      var chars = Math.min(caption.length, Math.floor(caption.length * captionPhase / 45));
      var text = caption.slice(0, chars);
      var showCursor = (chars < caption.length || Math.floor(frame / 20) % 2 === 0) && localF < 260;
      ctx.fillStyle = '#999';
      ctx.font = Math.max(7, pW * 0.095) + "px 'Courier New', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(text + (showCursor ? '|' : ''), px + pW / 2, py + photoH + marginH * 0.6);
    }

    ctx.restore();
  }
}
