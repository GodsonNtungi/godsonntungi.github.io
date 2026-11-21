// Ship-noise widget: drag a ship past an underwater microphone and see what it records.
(() => {
  const sc = document.getElementById("lab-scene");
  if (!sc) return;
  // A real 15-minute no-ship recording (dB per minute x pitch band), from my own synthetic training mixes.
  const SEA_DB = [[73.1, 72.7, 73.2, 78.3, 79.7, 80.5, 80.4, 81.0, 77.6, 78.2, 76.8, 74.4, 72.6, 70.9, 69.5, 67.9, 65.4, 63.4, 62.2, 61.3, 59.1, 57.5, 55.8, 54.2, 52.9], [74.5, 73.9, 75.2, 79.3, 80.0, 80.7, 81.0, 80.7, 79.3, 78.9, 78.0, 75.7, 73.7, 71.6, 70.1, 68.6, 66.3, 64.1, 63.1, 62.1, 59.9, 58.3, 56.7, 55.1, 53.8], [79.2, 76.3, 77.9, 81.1, 82.1, 81.6, 81.0, 82.4, 80.2, 80.1, 79.6, 76.3, 74.1, 72.2, 70.4, 68.9, 66.6, 64.5, 63.4, 62.5, 60.3, 58.6, 57.0, 55.4, 54.1], [77.5, 76.8, 79.1, 82.5, 82.1, 82.3, 81.5, 83.0, 80.5, 80.9, 79.8, 77.0, 74.3, 72.0, 70.3, 68.6, 66.1, 63.9, 62.8, 61.8, 59.6, 58.0, 56.3, 54.8, 53.4], [77.0, 76.7, 79.4, 82.5, 82.2, 82.4, 82.3, 83.8, 81.2, 81.5, 80.0, 77.3, 74.2, 71.7, 70.2, 68.3, 65.5, 63.3, 62.2, 61.3, 59.1, 57.4, 55.7, 54.2, 52.9], [73.7, 74.1, 78.4, 83.5, 81.9, 83.0, 83.8, 84.3, 82.3, 81.5, 81.3, 78.0, 74.7, 72.6, 70.7, 68.8, 66.0, 63.8, 62.7, 61.7, 59.6, 57.9, 56.2, 54.7, 53.3], [73.7, 73.7, 78.5, 85.4, 83.2, 83.4, 83.4, 84.1, 83.0, 82.7, 81.0, 78.6, 74.9, 73.2, 71.3, 69.1, 66.4, 64.1, 62.9, 62.0, 59.8, 58.1, 56.5, 54.9, 53.6], [77.1, 76.5, 80.6, 86.5, 84.0, 84.8, 84.9, 86.0, 83.7, 83.3, 82.2, 79.6, 76.4, 74.0, 71.7, 70.1, 67.0, 64.7, 63.6, 62.8, 60.6, 58.9, 57.2, 55.6, 54.2], [74.8, 76.8, 84.0, 87.2, 86.3, 85.4, 85.3, 87.0, 83.9, 84.8, 82.5, 78.9, 76.7, 74.0, 71.8, 69.7, 66.7, 64.2, 63.1, 62.2, 60.1, 58.3, 56.7, 55.1, 53.7], [75.5, 79.0, 86.6, 89.7, 87.9, 87.0, 87.3, 88.0, 85.0, 85.5, 83.5, 80.7, 76.7, 75.0, 72.6, 70.4, 67.0, 64.6, 63.3, 62.4, 60.3, 58.5, 57.0, 55.7, 54.5], [77.0, 80.0, 87.8, 90.0, 90.6, 87.7, 88.1, 89.6, 86.5, 86.2, 84.0, 81.3, 77.7, 75.8, 73.7, 71.6, 68.1, 65.5, 64.1, 63.2, 61.0, 59.4, 57.8, 56.4, 54.9], [79.0, 82.6, 89.6, 91.0, 89.1, 89.7, 90.0, 90.3, 87.4, 86.4, 85.6, 81.5, 78.7, 76.5, 74.5, 72.1, 68.5, 65.8, 64.4, 63.3, 61.1, 59.4, 57.8, 56.1, 54.9], [80.7, 87.6, 91.0, 91.3, 91.1, 89.5, 91.1, 91.4, 88.0, 88.2, 86.0, 82.1, 79.0, 77.5, 75.5, 72.8, 69.6, 66.6, 64.8, 63.3, 61.0, 59.2, 57.6, 56.0, 55.1], [79.1, 89.9, 93.4, 91.6, 92.0, 88.7, 91.3, 90.4, 88.0, 89.8, 87.5, 84.5, 81.3, 79.2, 76.8, 74.9, 70.3, 67.2, 65.2, 64.1, 61.9, 59.7, 58.3, 57.9, 56.8], [82.5, 89.1, 93.3, 96.3, 94.2, 92.7, 90.1, 91.2, 91.5, 89.6, 89.5, 87.7, 84.0, 80.9, 80.2, 77.7, 73.5, 70.1, 68.4, 67.8, 65.7, 63.6, 62.5, 62.0, 61.1]];
  const SEA = SEA_DB.map(r => r.map(v => 10 ** (v / 10)));
  const seaTot = SEA.flat().reduce((a, b) => a + b, 0), seaMaxDb = 10 * Math.log10(Math.max(...SEA.flat()));
  const sea_t = SEA.map(r => r.reduce((a, b) => a + b, 0));
  const KM_W = 10, KM_H = 6.15, FREQ = [...Array(25)].map((_, b) => 10 ** (1.5 + 0.1 * b) / 1000);
  const absorb = f => 0.11 * f * f / (1 + f * f) + 44 * f * f / (4100 + f * f); // dB per km, Thorp
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const $ = id => document.getElementById(id);
  const sSrc = $("lab-size"), sSpd = $("lab-speed"), gridCv = $("lab-grid");
  const ship = { x: 0, y: -1.7 };
  let playMin = null, dragging = false;

  const fit = cv => { const r = window.devicePixelRatio || 1, b = cv.getBoundingClientRect();
    cv.width = Math.round(b.width * r); cv.height = Math.round(b.height * r); };
  const toPx = (x, y) => [(x / KM_W + 0.5) * sc.width, (0.5 - y / KM_H) * sc.height];
  const track = () => [...Array(15)].map((_, t) => ({ x: ship.x + (t - 7) * sSpd.value * 1.852 / 60, y: ship.y }));

  function draw() {
    const px = window.devicePixelRatio || 1;
    const T = track(), r = T.map(p => Math.max(0.1, Math.hypot(p.x, p.y)));
    const src = +sSrc.value, spec = [...Array(25)].map((_, b) => 10 ** (-0.75 * b / 10));
    const specTot = spec.reduce((a, b) => a + b, 0);
    const lvl = r.map(d => src - 20 * Math.log10(d));
    const shp = T.map((_, t) => spec.map((v, b) => v * 10 ** (-absorb(FREQ[b]) * r[t] / 10) * sea_t[t] * 10 ** (lvl[t] / 10) / specTot));

    const g = sc.getContext("2d"), W = sc.width, H = sc.height, ink = css("--ink"), muted = css("--muted"), red = css("--ship");
    g.clearRect(0, 0, W, H);
    const [cx, cy] = toPx(0, 0);
    g.lineWidth = px; g.strokeStyle = css("--rule");
    g.font = `${11 * px}px ${css("--font-sans")}`;
    [1, 2, 4].forEach(km => { g.beginPath(); g.arc(cx, cy, km / KM_W * W, 0, 7); g.stroke();
      g.fillStyle = muted; g.fillText(km + " km", cx + km / KM_W * W + 4 * px, cy - 4 * px); });
    const P = T.map(p => toPx(p.x, p.y));
    g.setLineDash([5 * px, 5 * px]); g.strokeStyle = muted; g.beginPath(); g.moveTo(...P[0]); P.forEach(q => g.lineTo(...q)); g.stroke(); g.setLineDash([]);
    P.forEach((q, t) => { g.fillStyle = red; g.globalAlpha = Math.max(.15, Math.min(1, (lvl[t] + 20) / 30)); g.beginPath(); g.arc(q[0], q[1], 3 * px, 0, 7); g.fill(); });
    g.globalAlpha = 1;
    g.fillStyle = css("--sensor"); g.beginPath(); g.arc(cx, cy, 7 * px, 0, 7); g.fill();
    g.fillStyle = ink; g.font = `600 ${12 * px}px ${css("--font-sans")}`; g.fillText("microphone", cx + 10 * px, cy + 18 * px);
    const at = playMin == null ? 7 : playMin, [bx, by] = P[at];
    g.strokeStyle = red; g.lineWidth = 1.5 * px; g.setLineDash([2 * px, 4 * px]); g.beginPath(); g.moveTo(cx, cy); g.lineTo(bx, by); g.stroke(); g.setLineDash([]);
    g.fillStyle = red; g.beginPath();
    g.moveTo(bx + 16 * px, by); g.lineTo(bx + 6 * px, by - 7 * px); g.lineTo(bx - 14 * px, by - 7 * px); g.lineTo(bx - 14 * px, by + 7 * px); g.lineTo(bx + 6 * px, by + 7 * px); g.closePath(); g.fill();
    g.fillStyle = ink; g.fillText(`min ${at + 1}`, bx - 14 * px, by - 12 * px);

    const gg = gridCv.getContext("2d"), Wc = gridCv.width, Hc = gridCv.height, lo = seaMaxDb - 25;
    gg.clearRect(0, 0, Wc, Hc);
    for (let t = 0; t < 15; t++) for (let b = 0; b < 25; b++) {
      const tot = SEA[t][b] + shp[t][b], x = t * Wc / 15, y = Hc - (b + 1) * Hc / 25;
      gg.globalAlpha = Math.max(.05, Math.min(1, (10 * Math.log10(tot) - lo) / 35)); gg.fillStyle = ink; gg.fillRect(x, y, Wc / 15 + .5, Hc / 25 + .5);
      gg.globalAlpha = .85 * shp[t][b] / tot; gg.fillStyle = red; gg.fillRect(x, y, Wc / 15 + .5, Hc / 25 + .5);
    }
    gg.globalAlpha = 1;
    if (playMin != null) { gg.strokeStyle = red; gg.lineWidth = 2 * px; gg.strokeRect(playMin * Wc / 15 + px, px, Wc / 15 - 2 * px, Hc - 2 * px); }

    const shipE = shp.flat().reduce((a, b) => a + b, 0), share = shipE / (shipE + seaTot), dmin = Math.min(...r), lmax = Math.max(...lvl);
    const fmt = d => d < 1 ? (d * 1000).toFixed(0) + " m" : d.toFixed(1) + " km";
    $("lab-dmin").textContent = fmt(dmin);
    $("lab-loud").textContent = (lmax > 0 ? "+" : "") + lmax.toFixed(0) + " dB";
    $("lab-high").textContent = "-" + (absorb(FREQ[24]) * dmin).toFixed(1) + " dB";
    $("lab-share").textContent = (share * 100).toFixed(share < .1 ? 1 : 0) + "%";
    $("lab-size-v").textContent = (sSrc.value > 0 ? "+" : "") + sSrc.value + " dB";
    $("lab-speed-v").textContent = sSpd.value + " knots";
  }

  const kmAt = e => { const b = sc.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width - .5) * KM_W, y: (.5 - (e.clientY - b.top) / b.height) * KM_H }; };
  sc.addEventListener("pointerdown", e => { dragging = true; sc.classList.add("is-drag"); sc.setPointerCapture(e.pointerId); Object.assign(ship, kmAt(e)); draw(); });
  sc.addEventListener("pointermove", e => { if (dragging) { Object.assign(ship, kmAt(e)); draw(); } });
  sc.addEventListener("pointerup", () => { dragging = false; sc.classList.remove("is-drag"); });
  sc.addEventListener("keydown", e => {
    const step = { ArrowLeft: [-.2, 0], ArrowRight: [.2, 0], ArrowUp: [0, .2], ArrowDown: [0, -.2] }[e.key];
    if (!step) return; e.preventDefault(); ship.x += step[0]; ship.y += step[1]; draw();
  });
  [sSrc, sSpd].forEach(el => el.addEventListener("input", draw));
  const play = $("lab-play");
  play.addEventListener("click", () => {
    let t = 0; playMin = 0; play.disabled = true; draw();
    const id = setInterval(() => { t++; if (t > 14) { clearInterval(id); playMin = null; play.disabled = false; } else playMin = t; draw(); }, 400);
  });
  const resize = () => { fit(sc); fit(gridCv); draw(); };
  addEventListener("resize", resize);
  resize();
})();
