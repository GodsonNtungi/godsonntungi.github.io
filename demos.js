// Small in-browser demos for each discipline, plus count-up and reveal motion.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Motion: tiles fade up once, numbers count up once.
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; io.unobserve(el); el.classList.add("in");
    const n = el.querySelector("[data-count]");
    if (n && !still) {
      const to = +n.dataset.count, t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 900), e = 1 - (1 - k) ** 3;
        n.textContent = Math.round(to * e).toLocaleString(); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
  }), { threshold: .2 });
  document.querySelectorAll(".rise").forEach(el => io.observe(el));

  // Timeline: the line draws year by year from 2021, arrows move two years, drag to scroll.
  const yrs = $(".years");
  if (yrs) {
    const items = [...yrs.querySelectorAll("li:not(.rail)")], btns = document.querySelectorAll(".tn");
    const step = () => items[1].offsetLeft - items[0].offsetLeft;
    let reached = -1, target = -1, timer = null, shown = false;
    const dotX = i => items[i].offsetLeft + 10;
    // the rail is a rising signal chart: a line that climbs year by year, a soft area under it, a ring per year
    const rail = yrs.querySelector(".rail"), NS = "http://www.w3.org/2000/svg", H = 122, BASE = 118, N = items.length;
    const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
    const svg = mk("svg", { "aria-hidden": "true", height: H }); rail.innerHTML = ""; rail.appendChild(svg);
    const defs = mk("defs", {}, svg);
    const ag = mk("linearGradient", { id: "tl-a", x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    mk("stop", { offset: 0, "stop-color": "#D93C1A", "stop-opacity": .18 }, ag); mk("stop", { offset: 1, "stop-color": "#D93C1A", "stop-opacity": 0 }, ag);
    const lg = mk("linearGradient", { id: "tl-l", x1: 0, x2: 1, gradientUnits: "userSpaceOnUse" }, defs);
    const s1 = mk("stop", { offset: 0, "stop-color": "#12151B" }, lg), s2 = mk("stop", { offset: .82, "stop-color": "#12151B" }, lg); mk("stop", { offset: 1, "stop-color": "#D93C1A" }, lg);
    const sh = mk("filter", { id: "tl-s", x: "-30%", y: "-50%", width: "160%", height: "220%" }, defs);
    mk("feDropShadow", { dx: 0, dy: 2, stdDeviation: 3, "flood-color": "#D93C1A", "flood-opacity": .14 }, sh);
    const clip = mk("rect", { x: 0, y: -40, height: 200, width: 0, class: "clip" }, mk("clipPath", { id: "tl-c" }, defs));
    const grid = mk("g", {}, svg), preview = mk("path", { class: "pre" }, svg), drawn = mk("g", { "clip-path": "url(#tl-c)" }, svg);
    const area = mk("path", { fill: "url(#tl-a)" }, drawn), line = mk("path", { class: "ln", stroke: "url(#tl-l)" }, drawn);
    const P = items.map(li => ({ drop: mk("line", { class: "drop" }, svg), tag: Object.assign(mk("text", { class: "tag", "text-anchor": "start" }, svg), { textContent: li.dataset.tag || "" }),
      ring: mk("circle", { class: "ring" }, svg), dot: mk("circle", { class: "mk", r: 5 }, svg) }));
    const pill = mk("g", { class: "nowpill" }, svg);
    mk("line", { x1: 0, x2: 0, y1: 2, y2: 18, stroke: "#E8B4A4", "stroke-width": 1 }, pill);
    mk("rect", { x: -38, y: -24, width: 76, height: 26, rx: 13, fill: "#fff", stroke: "#EFD3C9", "stroke-width": 1, filter: "url(#tl-s)" }, pill);
    mk("circle", { cx: -24, cy: -11, r: 3.5, fill: "#D93C1A" }, pill); mk("circle", { cx: -24, cy: -11, r: 3.5, fill: "#D93C1A", class: "live" }, pill);
    Object.assign(mk("text", { x: -15, y: -6.5, "text-anchor": "start", class: "nowtxt" }, pill), { textContent: "Today" });
    let xs = [], yv = () => 0;
    const wave = () => {
      const W = yrs.scrollWidth - 4, x0 = dotX(0), x1 = dotX(N - 1), per = step();
      xs = items.map((_, i) => dotX(i));
      yv = x => { const u = Math.max(0, Math.min(1, (x - x0) / (x1 - x0))); return 90 - 34 * u ** 1.35 - 6 * Math.sin(Math.PI * 2 * (x - x0) / per); };
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W);
      lg.setAttribute("x2", x1); s2.setAttribute("offset", .82);
      let dd = ""; for (let x = x0; x <= x1; x += 3) dd += (dd ? " L" : "M") + x + "," + yv(x).toFixed(1);
      preview.setAttribute("d", dd); line.setAttribute("d", dd); area.setAttribute("d", dd + ` L${x1},${BASE} L${x0},${BASE} Z`);
      grid.innerHTML = ""; [66, 86, 106].forEach(y => mk("line", { x1: x0, x2: x1, y1: y, y2: y, class: "gl" }, grid));
      P.forEach((p, i) => { const x = xs[i], y = yv(x);
        p.drop.setAttribute("x1", x); p.drop.setAttribute("x2", x); p.drop.setAttribute("y1", y + 8); p.drop.setAttribute("y2", H);
        p.tag.setAttribute("x", x + 10); p.tag.setAttribute("y", y - 20);
        ["dot", "ring"].forEach(k => { p[k].setAttribute("cx", x); p[k].setAttribute("cy", y); }); p.ring.setAttribute("r", 9); });
    };
    const paint = () => {
      clip.setAttribute("width", reached < 0 ? 0 : xs[reached] + 6);
      const fin = reached === N - 1 && reached === target;
      P.forEach((p, i) => { const on = i <= reached, now = i === reached && reached === target;
        p.dot.setAttribute("class", "mk" + (now ? " now" : on ? " on" : ""));
        p.tag.style.opacity = now && fin ? 0 : on ? 1 : .45; p.drop.style.opacity = on ? 1 : .5;
        p.ring.style.display = now ? "" : "none"; });
      pill.style.opacity = fin ? 1 : 0;
      if (fin) pill.setAttribute("transform", `translate(${xs[N - 1]},${yv(xs[N - 1]) - 28})`);
      items.forEach((li, i) => li.classList.toggle("on", i <= reached));
      // a label that would run past the visible edge flips to the left of its point
      const edge = yrs.scrollLeft + yrs.clientWidth - 6;
      P.forEach((p, i) => { const x = xs[i], w = p.tag.getComputedTextLength(), flip = x + 10 + w > edge;
        p.tag.setAttribute("text-anchor", flip ? "end" : "start"); p.tag.setAttribute("x", flip ? x - 10 : x + 10); });
    };
    const advance = () => {
      if (reached === target) { timer = null; yrs.classList.remove("moving"); items.forEach((li, i) => li.classList.toggle("at", i === reached)); paint(); return; }
      yrs.classList.add("moving"); items.forEach(li => li.classList.remove("at"));
      reached += reached < target ? 1 : -1; paint();
      timer = setTimeout(advance, still ? 0 : 420);
    };
    const aim = () => {
      const edge = yrs.scrollLeft + yrs.clientWidth - 40;
      let last = 0; items.forEach((li, i) => { if (li.offsetLeft <= edge) last = i; });
      target = last;
      if (!timer) advance();
    };
    const update = () => {
      yrs.style.setProperty("--rail", yrs.scrollWidth - 4 + "px");
      btns[0] && (btns[0].disabled = yrs.scrollLeft < 4);
      btns[1] && (btns[1].disabled = yrs.scrollLeft + yrs.clientWidth >= yrs.scrollWidth - 4);
      if (shown) aim(); paint();
    };
    new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && !shown) { shown = true; setTimeout(aim, 250); } }), { threshold: .45 }).observe(yrs);
    let raf = 0; yrs.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener("resize", () => { wave(); update(); paint(); }); wave(); update(); paint();
    btns.forEach(b => b.addEventListener("click", () => yrs.scrollBy({ left: +b.dataset.dir * 2 * step(), behavior: still ? "auto" : "smooth" })));
    let x0 = 0, s0 = 0, down = false;
    yrs.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; down = true; x0 = e.clientX; s0 = yrs.scrollLeft; yrs.classList.add("is-drag"); });
    addEventListener("pointermove", e => { if (down) yrs.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener("pointerup", () => { if (!down) return; down = false; yrs.classList.remove("is-drag");
      const s = step(); yrs.scrollTo({ left: Math.round(yrs.scrollLeft / s) * s, behavior: still ? "auto" : "smooth" }); });
    yrs.querySelectorAll("img").forEach(i => i.draggable = false);
  }

  // Vision: before/after slider.
  const ba = $("#ba");
  if (ba) {
    const r = $("input", ba), top = $(".ba-top", ba);
    const set = () => { top.style.clipPath = `inset(0 ${100 - r.value}% 0 0)`; ba.style.setProperty("--x", r.value + "%"); };
    r.addEventListener("input", set); set();
  }

  // ML: random split vs split by village.
  const sp = $("#split");
  if (sp) {
    const cv = $("canvas", sp), out = $(".split-out", sp), btns = sp.querySelectorAll("button");
    // villages drawn as hexagon tiles of a map; the grid shape follows the canvas so it fills any size
    let mode = "random", t = 1;
    const rnd = (v, i) => ((v * 31 + i * 17 + 7) % 100) / 100;
    const bar = $(".sp-bar i", sp), sc = $(".sp-score b", sp);
    const draw = () => {
      const r = devicePixelRatio || 1, b = cv.getBoundingClientRect(); cv.width = b.width * r; cv.height = b.height * r;
      const g = cv.getContext("2d"), W = cv.width, H = cv.height, k = still ? 1 : Math.min(1, t), hot = css("--ship");
      // pick columns so hexes stay roughly round, then rows to fill the height
      const cols = Math.max(3, Math.min(8, Math.round(Math.sqrt(16 * (W / H) * 0.87)))), s = W / ((cols - 1) * 1.75 + .875 + 1.646 + .3), rows = Math.max(2, Math.floor((H / s - 2.1) / 1.52) + 1);
      const V = cols * rows, held = new Set([...Array(V).keys()].filter(v => (v * 7 + 3) % V < Math.max(2, Math.round(V * .2))));
      const tw = ((cols - 1) * 1.75 + .875 + 1.646) * s, th = ((rows - 1) * 1.52 + 1.9) * s;  // hex is 1.646s wide, 1.9s tall
      const ox = (W - tw) / 2 + .823 * s, oy = (H - th) / 2 + .95 * s;
      g.clearRect(0, 0, W, H);
      for (let v = 0; v < V; v++) {
        const c = v % cols, rw = Math.floor(v / cols), cx = ox + c * 1.75 * s + (rw % 2) * .875 * s, cy = oy + rw * 1.52 * s, isHeld = mode === "village" && held.has(v);
        g.beginPath(); for (let q = 0; q < 6; q++) { const an = Math.PI / 6 + q * Math.PI / 3; g[q ? "lineTo" : "moveTo"](cx + .95 * s * Math.cos(an), cy + .95 * s * Math.sin(an)); } g.closePath();
        g.fillStyle = isHeld ? `rgba(217,60,26,${.14 * k})` : "#fff"; g.fill();
        g.strokeStyle = isHeld ? `rgba(217,60,26,${.6 * k})` : "#E1E4E9"; g.lineWidth = 1.5 * r; g.stroke();
        for (let i = 0; i < 7; i++) { const an = i / 7 * Math.PI * 2 + v, dd = i ? .48 * s : 0, test = mode === "random" ? rnd(v, i) < .28 : isHeld;
          g.fillStyle = test ? hot : "#B8BEC8"; g.beginPath(); g.arc(cx + Math.cos(an) * dd, cy + Math.sin(an) * dd, s * (test ? .12 : .1), 0, 7); g.fill(); }
      }
      bar.style.width = (mode === "random" ? 96 : 83) + "%"; bar.style.backgroundColor = mode === "random" ? "#9AA1AD" : hot;  // random bar is illustrative; 0.83 is measured
      sc.textContent = mode === "random" ? "too high" : "0.83";
      if (t < 1 && !still) { t += .06; requestAnimationFrame(draw); }
      g.globalAlpha = 1;
      out.innerHTML = mode === "random"
        ? "Test records sit inside villages the model already saw. <b>The score looks better than it is.</b>"
        : "Whole villages held out, like the real test. <b>0.830 in validation, 0.839 on the leaderboard.</b>";
      btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    };
    btns.forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; t = 0; draw(); }));
    addEventListener("resize", draw); new ResizeObserver(draw).observe(cv); draw();
  }

  // Data: scrub a one-month-ahead forecast over real East Africa water storage.
  const fc = $("#forecast");
  if (fc) fetch(fc.dataset.src).then(r => r.json()).then(D => {
    const v = D.v, n = v.length, cv = $("canvas", fc), sl = $("input", fc), out = $(".fc-out", fc);
    const y0 = new Date(D.start); sl.max = n - 2; sl.value = Math.floor(n * .55);
    const month = i => { const d = new Date(y0); d.setMonth(d.getMonth() + i); return d.toLocaleString("en", { month: "short", year: "numeric" }); };
    // the anchor plus the average change for that calendar month, learned only from months before t
    const predict = t => {
      if (v[t] == null) return null; let s = 0, k = 0;
      for (let j = 1; j <= t; j++) if ((j + 1) % 12 === (t + 1) % 12 && v[j] != null && v[j - 1] != null) { s += v[j] - v[j - 1]; k++; }
      return v[t] + (k ? s / k : 0);
    };
    const draw = () => {
      const t = +sl.value, r = devicePixelRatio || 1, b = cv.getBoundingClientRect(); cv.width = b.width * r; cv.height = b.height * r;
      const g = cv.getContext("2d"), W = cv.width, H = cv.height, pad = 14 * r;
      const vals = v.filter(x => x != null), lo = Math.min(...vals), hi = Math.max(...vals);
      const X = i => pad + i / (n - 1) * (W - 2 * pad), Y = y => H - pad - (y - lo) / (hi - lo) * (H - 2 * pad);
      g.clearRect(0, 0, W, H); g.lineWidth = 1.5 * r;
      // months with no satellite data are bridged with a faint dotted line instead of leaving a hole
      const line = (from, to, col, w) => {
        g.lineWidth = w * r; let last = -1;
        for (let i = from; i <= to; i++) {
          if (v[i] == null) continue;
          if (last >= 0) {
            const gap = i - last > 1;
            g.strokeStyle = gap ? css("--rule-strong") : col; g.setLineDash(gap ? [2 * r, 4 * r] : []);
            g.beginPath(); g.moveTo(X(last), Y(v[last])); g.lineTo(X(i), Y(v[i])); g.stroke();
          }
          last = i;
        }
        g.setLineDash([]);
      };
      line(0, n - 1, css("--rule-strong"), 1.5); line(0, t, css("--ink"), 2);
      const p = predict(t), a = v[t + 1];
      if (p != null) { g.fillStyle = css("--ship"); g.beginPath(); g.arc(X(t + 1), Y(p), 6 * r, 0, 7); g.fill(); }
      if (a != null) { g.strokeStyle = css("--ink"); g.lineWidth = 2 * r; g.beginPath(); g.arc(X(t + 1), Y(a), 6 * r, 0, 7); g.stroke(); }
      g.strokeStyle = css("--rule-strong"); g.setLineDash([3 * r, 4 * r]); g.beginPath(); g.moveTo(X(t), pad); g.lineTo(X(t), H - pad); g.stroke(); g.setLineDash([]);
      out.innerHTML = v[t] == null ? `<b>${month(t)}</b>: no satellite reading this month (the GRACE satellites had gaps). Move on to the next month.` : `Known up to <b>${month(t)}</b>. Forecast for ${month(t + 1)}: <b class="hot">${p.toFixed(2)}</b>` +
        (a == null ? "." : `, actual <b>${a.toFixed(2)}</b>.`);
    };
    sl.addEventListener("input", draw); addEventListener("resize", draw); new ResizeObserver(draw).observe(cv); draw();
  });

  // Language: toy Kiswahili/English search over sample report pages.
  const ks = $("#ksearch");
  if (ks) {
    const PAGES = [
      { p: 4, t: "Faida ya kampuni ilipanda kwa asilimia 12 mwaka 2025, hasa kutokana na mauzo ya saruji." },
      { p: 7, t: "Gawio la shilingi 45 kwa kila hisa litalipwa kwa wanahisa mwezi Juni." },
      { p: 11, t: "Revenue grew 9% while operating costs rose 4%, driven by fuel and transport." },
      { p: 15, t: "The board approved a new plant in Mbeya to raise capacity by a third." },
      { p: 18, t: "Deni la muda mrefu lilipungua hadi shilingi bilioni 210." },
      { p: 22, t: "Dividend policy: pay out about half of net profit each year." },
    ];
    const MAP = { faida: "profit", gawio: "dividend", hisa: "share", mauzo: "sales revenue", deni: "debt", mapato: "revenue", gharama: "costs", kiwanda: "plant" };
    const NEAR = { profit: ["faida", "revenue", "grew", "net"], dividend: ["gawio", "dividend", "payout", "pay"], debt: ["deni", "debt", "loan"], plant: ["plant", "capacity", "kiwanda"], revenue: ["revenue", "mauzo", "sales", "mapato"] };
    const words = s => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
    const expand = ws => ws.flatMap(w => [w, ...(MAP[w] ? MAP[w].split(" ") : [])]);
    const inp = $("input", ks), res = $(".ks-res", ks);
    const run = () => {
      const q = expand(words(inp.value)); if (!q.length) { res.innerHTML = ""; return; }
      const lex = PAGES.map(pg => ({ pg, s: q.filter(w => expand(words(pg.t)).includes(w)).length })).filter(x => x.s).sort((a, b) => b.s - a.s);
      const topics = Object.keys(NEAR).filter(k => q.includes(k) || NEAR[k].some(w => q.includes(w)));
      const sem = PAGES.map(pg => ({ pg, s: topics.reduce((a, k) => a + NEAR[k].filter(w => words(pg.t).includes(w)).length, 0) })).filter(x => x.s).sort((a, b) => b.s - a.s);
      const seen = new Set(), mix = [];
      for (let i = 0; i < 6; i++) [[sem[i], "meaning"], [lex[i], "words"]].forEach(([x, how]) => { if (x && !seen.has(x.pg.p)) { seen.add(x.pg.p); mix.push({ ...x, how }); } });
      const cited = new Set(mix.slice(0, 3).map(x => x.pg.p));
      grid && grid.querySelectorAll(".pg").forEach(el => el.classList.toggle("hit", cited.has(+el.dataset.p)));
      res.innerHTML = mix.slice(0, 3).map(x => `<li><span class="ks-how">${x.how}</span><span>${x.pg.t}</span><span class="ks-page">page ${x.pg.p}</span></li>`).join("")
        || `<li class="ks-none">Nothing in these six sample pages. Try "gawio" or "debt".</li>`;
    };
    const grid = $(".ks-grid", ks);
    if (grid) grid.innerHTML = PAGES.map(pg => `<div class="pg" data-p="${pg.p}"><b>page ${pg.p}</b><span>${pg.t}</span></div>`).join("");
    inp.addEventListener("input", run);
    ks.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { inp.value = c.textContent; run(); }));
    run();
  }
})();
