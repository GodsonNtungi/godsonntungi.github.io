// Ship-noise widget: drag a ship past an underwater microphone and see what it records.
(() => {
  const sc = document.getElementById("lab-scene");
  if (!sc) return;
  // A generated 15-minute sea (dB per minute x pitch band): loud low pitches, slow swell, a little noise.
  const SEA_DB = [[78.2, 78.3, 78.8, 78.5, 75.5, 77.0, 74.7, 74.1, 74.9, 76.0, 74.7, 71.7, 70.5, 69.2, 69.5, 69.4, 66.6, 66.2, 64.0, 64.3, 57.0, 55.0, 56.2, 55.6, 51.9], [80.3, 77.6, 77.2, 77.7, 79.8, 79.0, 76.2, 76.9, 74.8, 75.1, 72.4, 73.1, 70.9, 70.9, 68.7, 67.1, 67.2, 65.0, 64.0, 61.7, 61.6, 57.6, 58.2, 57.2, 52.6], [82.8, 83.1, 80.3, 77.0, 76.2, 78.0, 80.5, 77.9, 77.5, 75.0, 73.3, 74.1, 70.7, 71.0, 70.9, 68.8, 68.2, 65.2, 65.3, 63.4, 58.4, 57.6, 56.2, 56.4, 53.9], [80.2, 79.9, 80.3, 80.5, 77.6, 75.5, 78.5, 76.4, 76.1, 74.9, 72.5, 70.9, 73.8, 72.8, 71.3, 68.9, 67.6, 65.0, 64.2, 61.8, 59.9, 59.3, 59.8, 52.2, 54.1], [82.3, 79.1, 81.3, 80.6, 79.3, 78.7, 76.7, 81.0, 81.3, 79.2, 75.3, 75.2, 74.3, 71.3, 70.9, 70.9, 68.0, 64.3, 63.6, 64.4, 61.7, 60.0, 60.8, 56.8, 53.5], [80.0, 83.3, 77.8, 82.1, 81.1, 78.1, 77.2, 79.3, 76.7, 74.6, 77.5, 73.9, 73.0, 71.4, 69.7, 69.0, 66.8, 66.8, 66.1, 64.5, 63.0, 61.7, 58.6, 54.5, 55.0], [78.5, 79.8, 81.1, 77.6, 82.3, 77.8, 76.4, 76.9, 76.2, 76.5, 75.4, 76.3, 73.3, 72.7, 69.6, 70.7, 67.3, 63.9, 67.6, 62.2, 60.4, 58.9, 59.5, 54.1, 53.9], [82.4, 84.3, 80.5, 80.7, 78.8, 82.9, 78.9, 78.3, 77.9, 75.4, 75.9, 72.9, 76.3, 72.5, 71.2, 72.1, 66.8, 69.6, 68.2, 62.9, 63.5, 60.5, 60.2, 56.9, 53.4], [81.8, 80.3, 80.6, 81.6, 81.5, 80.1, 76.2, 78.9, 76.6, 77.9, 75.0, 76.6, 74.1, 72.1, 71.4, 66.7, 69.1, 66.9, 63.4, 64.2, 62.3, 60.6, 58.0, 57.5, 55.5], [80.6, 80.2, 79.3, 78.7, 80.2, 77.8, 75.9, 77.9, 78.5, 75.4, 76.4, 74.8, 71.3, 72.3, 70.4, 70.3, 63.4, 67.7, 66.0, 61.7, 63.2, 59.4, 58.1, 57.2, 56.0], [81.7, 82.3, 81.7, 79.5, 82.8, 80.9, 79.3, 80.2, 78.6, 76.0, 77.6, 75.1, 74.9, 74.3, 73.0, 73.2, 69.1, 67.1, 64.7, 63.2, 63.5, 61.4, 57.4, 55.9, 54.1], [81.5, 77.3, 79.1, 75.6, 77.4, 79.5, 74.7, 77.9, 72.3, 74.5, 71.8, 72.5, 71.1, 71.6, 69.5, 68.1, 65.5, 65.6, 62.1, 60.7, 59.0, 59.2, 60.0, 54.3, 55.5], [77.0, 77.5, 79.0, 78.8, 78.6, 79.4, 75.9, 77.3, 75.3, 69.5, 71.5, 71.3, 71.2, 70.8, 68.2, 69.5, 64.4, 64.5, 64.4, 59.5, 61.6, 59.4, 55.7, 54.0, 51.8], [78.7, 80.4, 79.0, 75.6, 74.9, 77.8, 72.1, 73.1, 73.9, 74.0, 75.3, 72.4, 76.7, 70.2, 70.0, 69.0, 65.8, 66.0, 63.9, 61.7, 58.6, 57.1, 57.2, 53.9, 52.6], [78.6, 78.2, 77.5, 78.1, 78.1, 78.4, 76.4, 74.1, 73.1, 74.4, 70.0, 70.7, 72.1, 68.7, 67.0, 68.7, 61.1, 63.7, 61.6, 59.9, 60.4, 59.6, 57.1, 54.4, 51.9]];
  const SEA = SEA_DB.map(r => r.map(v => 10 ** (v / 10)));
  const seaTot = SEA.flat().reduce((a, b) => a + b, 0), seaMaxDb = 10 * Math.log10(Math.max(...SEA.flat()));
  const sea_t = SEA.map(r => r.reduce((a, b) => a + b, 0));
  const KM_W = 10, KM_H = 6.15, FREQ = [...Array(25)].map((_, b) => 10 ** (1.5 + 0.1 * b) / 1000);
  const absorb = f => 0.11 * f * f / (1 + f * f) + 44 * f * f / (4100 + f * f); // dB per km, Thorp
  const css = n => getComputedStyle(sc).getPropertyValue(n).trim();  // read from the widget, so it can be themed on its own
  const $ = id => document.getElementById(id);
  const sSrc = $("lab-size"), sSpd = $("lab-speed"), gridCv = $("lab-grid");
  const ship = { x: 0, y: -1.7 };
  let playMin = null, dragging = false, touched = false;

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
    const tint = css("--sea-tint");
    if (tint) [4, 2, 1].forEach((km, i) => { g.fillStyle = tint; g.globalAlpha = .35 + i * .2; g.beginPath(); g.arc(cx, cy, km / KM_W * W, 0, 7); g.fill(); });
    g.globalAlpha = 1;
    [1, 2, 4].forEach(km => { g.beginPath(); g.arc(cx, cy, km / KM_W * W, 0, 7); g.stroke();
      const rr = km / KM_W * W, a = km > 3 ? -0.3 : -0.62;  // labels on the ring, clear of each other and the corners
      g.fillStyle = muted; g.fillText(km + " km", cx + rr * Math.cos(a) + 4 * px, cy + rr * Math.sin(a) - 2 * px); });
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
    if (!touched) { g.fillStyle = red; g.font = `600 ${12 * px}px ${css("--font-sans")}`; g.fillText("← drag the ship →", bx - 52 * px, by + 26 * px); }

    const gg = gridCv.getContext("2d"), Wc = gridCv.width, Hc = gridCv.height, lo = seaMaxDb - 25;
    const dots = css("--grid-style") === "dots", gridInk = css("--grid-ink") || ink;
    gg.clearRect(0, 0, Wc, Hc);
    for (let t = 0; t < 15; t++) for (let b = 0; b < 25; b++) {
      const tot = SEA[t][b] + shp[t][b], x = t * Wc / 15, y = Hc - (b + 1) * Hc / 25;
      const lvlA = Math.max(.05, Math.min(1, (10 * Math.log10(tot) - lo) / 35)), part = shp[t][b] / tot;
      if (dots) {  // dot-matrix style: dot size is loudness, colour is who made the sound
        const cw = Wc / 15, ch = Hc / 25, rad = Math.min(cw, ch) * (.12 + .36 * lvlA);
        gg.globalAlpha = 1; gg.fillStyle = part > .5 ? red : gridInk; gg.globalAlpha = part > .5 ? .55 + .45 * part : .25 + .6 * lvlA;
        gg.beginPath(); gg.arc(x + cw / 2, y + ch / 2, rad, 0, 7); gg.fill();
      } else {
        gg.globalAlpha = lvlA; gg.fillStyle = ink; gg.fillRect(x, y, Wc / 15 + .5, Hc / 25 + .5);
        gg.globalAlpha = .85 * part; gg.fillStyle = red; gg.fillRect(x, y, Wc / 15 + .5, Hc / 25 + .5);
      }
    }
    gg.globalAlpha = 1;
    if (playMin != null) { gg.strokeStyle = red; gg.lineWidth = 2 * px; gg.strokeRect(playMin * Wc / 15 + px, px, Wc / 15 - 2 * px, Hc - 2 * px); }

    const shipE = shp.flat().reduce((a, b) => a + b, 0), share = shipE / (shipE + seaTot), dmin = Math.min(...r), lmax = Math.max(...lvl);
    const fmt = d => d < 1 ? (d * 1000).toFixed(0) + " m" : d.toFixed(1) + " km";
    $("lab-dmin").textContent = fmt(dmin);
    $("lab-loud").textContent = (lmax > 0 ? "+" : "") + lmax.toFixed(0) + " dB";
    $("lab-high").textContent = "-" + (absorb(FREQ[24]) * dmin).toFixed(1) + " dB";
    $("lab-share").textContent = (share * 100).toFixed(share < .1 ? 1 : 0) + "%";
    const bar = $("lab-bar"); if (bar) bar.style.setProperty("--p", (share * 100).toFixed(1) + "%");
    $("lab-size-v").textContent = (sSrc.value > 0 ? "+" : "") + sSrc.value + " dB";
    $("lab-speed-v").textContent = sSpd.value + " knots";
  }

  const kmAt = e => { const b = sc.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width - .5) * KM_W, y: (.5 - (e.clientY - b.top) / b.height) * KM_H }; };
  sc.addEventListener("pointerdown", e => { dragging = true; touched = true; sc.classList.add("is-drag"); sc.setPointerCapture(e.pointerId); Object.assign(ship, kmAt(e)); draw(); });
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
