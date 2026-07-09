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
      // Güira: raspado metálico (ruido filtrado en agudos, corto y seco).
      id: "guira", name: "Güira", accent: "#46d19e", preset: [0, 2, 4, 6, 8, 10, 12, 14],
      make(ctx, t, out, accent) {
        const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx);
        const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 4500;
        const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 8500; bp.Q.value = 1.1;
        const g = ctx.createGain();
        const v = accent ? 0.42 : 0.24;
        g.gain.setValueAtTime(v, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (accent ? 0.06 : 0.035));
        src.connect(hp).connect(bp).connect(g).connect(out); src.start(t); src.stop(t + 0.08);
      },
    },
    {
      // Bongó: membrana afinada con caída de tono + transitorio de "slap".
      id: "bongo", name: "Bongó", accent: "#ff7b3d", preset: [4, 6, 12, 14],
      make(ctx, t, out, accent) {
        const f = accent ? 430 : 300;
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(f * 1.7, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.045);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.7, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.15);
        // slap
        const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx);
        const nb = ctx.createBiquadFilter(); nb.type = "bandpass"; nb.frequency.value = 1900; nb.Q.value = 1.2;
        const ng = ctx.createGain(); ng.gain.setValueAtTime(0.28, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        n.connect(nb).connect(ng).connect(out); n.start(t); n.stop(t + 0.04);
      },
    },
    {
      // Bajo de guitarra: cuerda pulsada (saw+triangle por lowpass con envolvente de pluck).
      id: "bajo", name: "Bajo", accent: "#4ea8ff", preset: [0, 4, 8, 12],
      make(ctx, t, out) {
        const f = 98; // Sol grave, redondo
        const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = f;
        const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = f;
        o1.frequency.setValueAtTime(f * 1.03, t); o1.frequency.exponentialRampToValueAtTime(f, t + 0.05);
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 7;
        lp.frequency.setValueAtTime(1400, t);
        lp.frequency.exponentialRampToValueAtTime(160, t + 0.28);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.9, t + 0.008);   // ataque de púa
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o1.connect(lp); o2.connect(lp); lp.connect(g).connect(out);
        o1.start(t); o2.start(t); o1.stop(t + 0.42); o2.stop(t + 0.42);
      },
    },
    {
      // Guitarra (requinto): rasgueo de 3 cuerdas escalonado, pulsado y brillante.
      id: "guitarra", name: "Guitarra", accent: "#b06bff", preset: [2, 6, 10, 14],
      make(ctx, t, out) {
        const freqs = [587, 740, 880];
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 2;
        lp.frequency.setValueAtTime(3600, t); lp.frequency.exponentialRampToValueAtTime(1100, t + 0.2);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        freqs.forEach((fr, i) => {
          const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr;
          const og = ctx.createGain(); og.gain.value = i === 0 ? 0.55 : 0.3;
          o.connect(og).connect(lp); o.start(t + i * 0.007); o.stop(t + 0.26);
        });
        lp.connect(g).connect(out);
      },
    },
    {
      // Full: click de referencia (bloque de madera), acento en el 1.
      id: "full", name: "Full (click)", accent: "#ff5d8f", preset: Array.from({ length: 16 }, (_, i) => i),
      make(ctx, t, out, accent) {
        const o = ctx.createOscillator(); o.type = "square";
        const g = ctx.createGain();
        o.frequency.value = accent ? 1500 : 1000;
        g.gain.setValueAtTime(accent ? 0.28 : 0.14, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.04);
      },
    },
  ];
  const byId = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));

  const ALL16 = Array.from({ length: 16 }, (_, i) => i);
  const DOWN = [0, 2, 4, 6, 8, 10, 12, 14];
  // Secciones de una canción de bachata — cada una arma su combinación de instrumentos.
  const SECTIONS = {
    intro:   { bajo: [0, 8],           guira: [0, 4, 8, 12] },
    verso:   { bajo: [0, 4, 8, 12],    guira: DOWN,          bongo: [4, 6, 12, 14] },
    majao:   { bajo: [0, 4, 8, 12],    guira: ALL16,         bongo: DOWN,           guitarra: [2, 6, 10, 14] },
    derecho: { bajo: [0, 4, 8, 12],    guira: ALL16,         bongo: [4, 6, 12, 14], guitarra: [2, 6, 10, 14] },
  };

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
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); // pega la mezcla y evita saturar
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.2;
    master.connect(comp).connect(ctx.destination);
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
            <span class="sec-label">Sección:</span>
            <button class="mini-btn" data-sec="intro">Intro</button>
            <button class="mini-btn" data-sec="verso">Verso</button>
            <button class="mini-btn" data-sec="majao">Majao</button>
            <button class="mini-btn" data-sec="derecho">Derecho</button>
            <button class="mini-btn ghost" data-sec="clear">Vaciar</button>
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

  function applySection(name) {
    tracks.length = 0;
    if (name !== "clear") {
      Object.entries(SECTIONS[name]).forEach(([id, steps]) =>
        tracks.push({ id, pattern: new Set(steps), muted: false })
      );
    }
    renderTracks(); renderPalette();
    document.querySelectorAll(".sim-presets [data-sec]").forEach((b) =>
      b.classList.toggle("active-sec", b.dataset.sec === name)
    );
  }
  document.querySelectorAll(".sim-presets [data-sec]").forEach((b) =>
    b.addEventListener("click", () => applySection(b.dataset.sec))
  );

  // Al salir de la vista, frenar el audio.
  window.addEventListener("view:show", (e) => { if (e.detail !== "sim" && playing) stop(); });

  renderPalette();
  renderTracks();
})();
