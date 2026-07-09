/* ============================================================
   Simulador de ritmo de bachata — "metrónomo evolucionado".
   Poné BPM, agregá instrumentos uno por uno y se combinan en loop.
   Patrones sobre 8 tiempos con subdivisión en corcheas (16 pasos).
   ============================================================ */
(function () {
  const root = document.getElementById("sim-root");
  if (!root) return;

  const STEPS = 16; // 8 tiempos × 2 (la "y")
  const beatOf = (s) => s / 2 + 1; // paso -> nº de tiempo (solo pares)

  /* ---------- Definición de instrumentos ---------- */
  // preset: pasos activos (0..15). make(): sintetiza el sonido con Web Audio.
  const INSTRUMENTS = [
    {
      id: "guira", name: "Güira", accent: "#46d19e", preset: [0, 2, 4, 6, 8, 10, 12, 14],
      make(ctx, t, out, accent) {
        const buf = noiseBuffer(ctx);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 6000; bp.Q.value = 0.8;
        const g = ctx.createGain();
        const v = accent ? 0.5 : 0.32;
        g.gain.setValueAtTime(v, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        src.connect(bp).connect(g).connect(out); src.start(t); src.stop(t + 0.05);
      },
    },
    {
      id: "bongo", name: "Bongó", accent: "#ff7b3d", preset: [4, 6, 12, 14],
      make(ctx, t, out, accent) {
        const o = ctx.createOscillator(); o.type = "triangle";
        const g = ctx.createGain();
        const f = accent ? 380 : 300;
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.08);
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.12);
      },
    },
    {
      id: "bajo", name: "Bajo", accent: "#4ea8ff", preset: [0, 4, 8, 12],
      make(ctx, t, out) {
        const o = ctx.createOscillator(); o.type = "sine";
        const g = ctx.createGain();
        o.frequency.setValueAtTime(90, t);
        o.frequency.exponentialRampToValueAtTime(70, t + 0.15);
        g.gain.setValueAtTime(0.7, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.24);
      },
    },
    {
      id: "voz", name: "Voz", accent: "#ffd24a", preset: [0, 8],
      make(ctx, t, out) {
        const o = ctx.createOscillator(); o.type = "triangle";
        const o2 = ctx.createOscillator(); o2.type = "sine"; o2.detune.value = 7;
        const g = ctx.createGain();
        o.frequency.value = 330; o2.frequency.value = 330;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.32, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        o.connect(g); o2.connect(g); g.connect(out);
        o.start(t); o2.start(t); o.stop(t + 0.3); o2.stop(t + 0.3);
      },
    },
    {
      id: "guitarra", name: "Guitarra", accent: "#b06bff", preset: [2, 6, 10, 14],
      make(ctx, t, out) {
        const o = ctx.createOscillator(); o.type = "triangle";
        const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.detune.value = -12;
        const g = ctx.createGain();
        o.frequency.value = 620; o2.frequency.value = 930;
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        o.connect(g); o2.connect(g); g.connect(out);
        o.start(t); o2.start(t); o.stop(t + 0.15); o2.stop(t + 0.15);
      },
    },
    {
      id: "full", name: "Full (click)", accent: "#ff5d8f", preset: Array.from({ length: 16 }, (_, i) => i),
      make(ctx, t, out, accent) {
        const o = ctx.createOscillator(); o.type = "square";
        const g = ctx.createGain();
        o.frequency.value = accent ? 1500 : 1000;
        g.gain.setValueAtTime(accent ? 0.3 : 0.16, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.04);
      },
    },
  ];
  const byId = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));

  let _noise;
  function noiseBuffer(ctx) {
    if (_noise) return _noise;
    _noise = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const d = _noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return _noise;
  }

  /* ---------- Estado ---------- */
  let ctx = null, master = null;
  let bpm = 130, playing = false, timer = null, nextTime = 0, step = 0;
  const tracks = []; // { id, pattern:Set, muted }

  /* ---------- Motor de audio (lookahead scheduler) ---------- */
  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  }
  function stepDur() { return 60 / bpm / 2; }

  function scheduler() {
    while (nextTime < ctx.currentTime + 0.12) {
      const s = step;
      const isDown = s % 2 === 0;
      const isOne = s === 0;
      tracks.forEach((tr) => {
        if (tr.muted || !tr.pattern.has(s)) return;
        const accent = tr.id === "full" ? isOne : isDown;
        byId[tr.id].make(ctx, nextTime, master, accent);
      });
      const at = nextTime;
      setTimeout(() => paintHead(s), Math.max(0, (at - ctx.currentTime) * 1000));
      nextTime += stepDur();
      step = (step + 1) % STEPS;
    }
  }

  function play() {
    ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    playing = true; step = 0; nextTime = ctx.currentTime + 0.06;
    timer = setInterval(scheduler, 25);
    playBtn.classList.add("playing");
    playBtn.innerHTML = "⏹ <span>Stop</span>";
  }
  function stop() {
    playing = false; clearInterval(timer);
    playBtn.classList.remove("playing");
    playBtn.innerHTML = "▶ <span>Play</span>";
    document.querySelectorAll(".step.head, .rl-cell.head").forEach((e) => e.classList.remove("head"));
  }
  function setBpm(v) {
    bpm = Math.min(170, Math.max(90, Math.round(v) || 130));
    bpmNum.value = bpm; bpmRange.value = bpm;
  }

  /* ---------- Render ---------- */
  root.innerHTML = `
    <div class="sim">
      <div class="sim-head">
        <h1 class="sim-title">🥁 Simulador de <b>bachata</b></h1>
        <div class="sim-transport">
          <button class="play-btn" id="sim-play">▶ <span>Play</span></button>
          <div class="sim-bpm">
            <input type="range" id="bpm-range" min="90" max="170" value="130" aria-label="BPM slider" />
            <div class="bpm-read"><input type="number" id="bpm-num" min="90" max="170" value="130" aria-label="BPM" /><span>BPM</span></div>
            <button class="mini-btn" id="sim-tap">Tap</button>
          </div>
          <div class="sim-presets">
            <button class="mini-btn" data-preset="full">Bachata completa</button>
            <button class="mini-btn" data-preset="perc">Solo percusión</button>
            <button class="mini-btn ghost" data-preset="clear">Vaciar</button>
          </div>
        </div>
      </div>

      <div class="seq">
        <div class="ruler" id="ruler"></div>
        <div class="sim-tracks" id="sim-tracks"></div>
        <p class="sim-empty" id="sim-empty">Agregá instrumentos abajo y se van combinando 👇</p>
      </div>

      <div class="palette">
        <span class="palette-label">Añadir instrumento:</span>
        <div class="palette-chips" id="palette"></div>
      </div>
    </div>`;

  const playBtn = document.getElementById("sim-play");
  const bpmRange = document.getElementById("bpm-range");
  const bpmNum = document.getElementById("bpm-num");
  const ruler = document.getElementById("ruler");
  const tracksEl = document.getElementById("sim-tracks");
  const paletteEl = document.getElementById("palette");
  const emptyEl = document.getElementById("sim-empty");

  // Regla de conteo
  ruler.innerHTML =
    `<div class="rl-name"></div><div class="rl-cells">` +
    Array.from({ length: STEPS }, (_, s) =>
      `<span class="rl-cell ${s % 2 ? "sub" : "down"}" data-step="${s}">${s % 2 ? "y" : beatOf(s)}</span>`
    ).join("") + `</div>`;

  // Paleta de instrumentos
  function renderPalette() {
    paletteEl.innerHTML = INSTRUMENTS.map((i) => {
      const added = tracks.some((t) => t.id === i.id);
      return `<button class="pal-chip ${added ? "added" : ""}" data-inst="${i.id}" style="--c:${i.accent}">
        ${added ? "✓ " : "+ "}${i.name}</button>`;
    }).join("");
  }

  function renderTracks() {
    emptyEl.hidden = tracks.length > 0;
    tracksEl.innerHTML = tracks.map((tr) => {
      const inst = byId[tr.id];
      const cells = Array.from({ length: STEPS }, (_, s) =>
        `<button class="step ${tr.pattern.has(s) ? "on" : ""} ${s % 2 ? "sub" : "down"}" data-step="${s}" aria-label="paso ${s + 1}"></button>`
      ).join("");
      return `<div class="track ${tr.muted ? "muted" : ""}" data-id="${tr.id}" style="--c:${inst.accent}">
        <div class="track-name">
          <button class="t-mute" title="Silenciar">${tr.muted ? "🔇" : "🔊"}</button>
          <span>${inst.name}</span>
          <button class="t-del" title="Quitar">✕</button>
        </div>
        <div class="track-cells">${cells}</div>
      </div>`;
    }).join("");
  }

  function addInstrument(id) {
    if (tracks.some((t) => t.id === id)) return;
    tracks.push({ id, pattern: new Set(byId[id].preset), muted: false });
    renderTracks(); renderPalette();
  }
  function removeInstrument(id) {
    const i = tracks.findIndex((t) => t.id === id);
    if (i >= 0) tracks.splice(i, 1);
    renderTracks(); renderPalette();
  }

  function paintHead(s) {
    document.querySelectorAll(".step.head, .rl-cell.head").forEach((e) => e.classList.remove("head"));
    document.querySelectorAll(`[data-step="${s}"]`).forEach((e) => e.classList.add("head"));
  }

  /* ---------- Eventos ---------- */
  playBtn.addEventListener("click", () => (playing ? stop() : play()));
  bpmRange.addEventListener("input", () => setBpm(+bpmRange.value));
  bpmNum.addEventListener("change", () => setBpm(+bpmNum.value));

  let taps = [];
  document.getElementById("sim-tap").addEventListener("click", () => {
    const now = performance.now();
    taps = taps.filter((t) => now - t < 2000); taps.push(now);
    if (taps.length >= 2) {
      const gaps = taps.slice(1).map((t, i) => t - taps[i]);
      setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
    }
  });

  paletteEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".pal-chip"); if (!chip) return;
    const id = chip.dataset.inst;
    tracks.some((t) => t.id === id) ? removeInstrument(id) : addInstrument(id);
  });

  tracksEl.addEventListener("click", (e) => {
    const track = e.target.closest(".track"); if (!track) return;
    const id = track.dataset.id; const tr = tracks.find((t) => t.id === id);
    if (e.target.closest(".t-del")) return removeInstrument(id);
    if (e.target.closest(".t-mute")) { tr.muted = !tr.muted; return renderTracks(); }
    const cell = e.target.closest(".step");
    if (cell) {
      const s = +cell.dataset.step;
      tr.pattern.has(s) ? tr.pattern.delete(s) : tr.pattern.add(s);
      cell.classList.toggle("on");
    }
  });

  document.querySelectorAll(".sim-presets [data-preset]").forEach((b) =>
    b.addEventListener("click", () => {
      const p = b.dataset.preset;
      tracks.length = 0;
      if (p === "full") ["bajo", "guira", "bongo", "guitarra", "voz"].forEach(addInstrument);
      else if (p === "perc") ["guira", "bongo"].forEach(addInstrument);
      renderTracks(); renderPalette();
    })
  );

  // Al salir de la vista, frenar el audio.
  window.addEventListener("view:show", (e) => { if (e.detail !== "sim" && playing) stop(); });

  renderPalette();
  renderTracks();
})();
