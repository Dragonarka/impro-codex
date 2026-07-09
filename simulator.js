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

  /* ---------- Definición de instrumentos (samples reales) ---------- */
  // preset: pasos activos (0..15). Los sonidos se cargan desde assets/audio/.
  const INSTRUMENTS = [
    { id: "guira",    name: "Güira",    accent: "#46d19e", preset: [0, 2, 4, 6, 8, 10, 12, 14] },
    { id: "bongo",    name: "Bongó",    accent: "#ff7b3d", preset: [4, 6, 12, 14] },
    { id: "bajo",     name: "Bajo",     accent: "#4ea8ff", preset: [0, 4, 8, 12] },
    { id: "guitarra", name: "Guitarra", accent: "#b06bff", preset: [2, 6, 10, 14] },
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

  /* ---------- Samples reales (assets/audio) ---------- */
  const FILES = {
    guira_hit1:   "assets/audio/guira_hit1.wav",
    guira_hit2:   "assets/audio/guira_hit2.wav",
    guira_accent: "assets/audio/guira_accent.wav",
    bongo_hi:     "assets/audio/bongo_hi.wav",
    bongo_lo:     "assets/audio/bongo_lo.wav",
    bajo:         "assets/audio/bajo_e2.mp3",
    guitarra_a3:  "assets/audio/guitarra_a3.mp3",
    guitarra_e4:  "assets/audio/guitarra_e4.mp3",
  };
  const buffers = {};
  let loaded = false, loading = false;

  /* ---------- Estado ---------- */
  let ctx = null, master = null, reverb = null;
  let bpm = 130, playing = false, timer = null, nextTime = 0, step = 0;
  const tracks = []; // { id, pattern:Set, muted }

  /* ---------- Motor de audio (samples + reverb) ---------- */
  function makeImpulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.95;
    const comp = ctx.createDynamicsCompressor(); // pega la mezcla
    comp.threshold.value = -12; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ctx.destination);
    reverb = ctx.createConvolver(); reverb.buffer = makeImpulse(1.4, 2.4);
    const rGain = ctx.createGain(); rGain.gain.value = 0.85;
    reverb.connect(rGain); rGain.connect(comp); // sala pequeña, da aire
  }

  async function loadSamples() {
    if (loaded || loading) return;
    loading = true; setLoadingUI(true); ensureCtx();
    await Promise.all(
      Object.entries(FILES).map(async ([k, url]) => {
        try {
          const ab = await (await fetch(url)).arrayBuffer();
          buffers[k] = await ctx.decodeAudioData(ab);
        } catch (e) { console.warn("No se pudo cargar", url, e); }
      })
    );
    loaded = true; loading = false; setLoadingUI(false);
  }

  function setLoadingUI(on) {
    if (!playBtn) return;
    playBtn.disabled = on;
    if (on) playBtn.innerHTML = "⏳ <span>Cargando…</span>";
    else if (!playing) playBtn.innerHTML = "▶ <span>Play</span>";
  }

  // Reproduce un sample con ganancia, tono (rate) y envío a reverb.
  function playSample(name, time, gain, rate, send) {
    const buf = buffers[name]; if (!buf) return;
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate || 1;
    const g = ctx.createGain(); g.gain.value = gain == null ? 1 : gain;
    src.connect(g); g.connect(master);
    if (send > 0 && reverb) { const s = ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(reverb); }
    src.start(time);
  }

  let rrIdx = 0;
  const rr = (arr) => arr[rrIdx++ % arr.length];

  // Traduce cada instrumento a samples reales según el paso/acento.
  function triggerVoice(id, time, s, accent) {
    const beat = s / 2 + 1; // nº de tiempo en los pasos "fuertes"
    if (id === "guira") {
      if (accent) playSample("guira_accent", time, 0.5, 1, 0.08);
      else playSample(rr(["guira_hit1", "guira_hit2"]), time, 0.36, 1, 0.06);
    } else if (id === "bongo") {
      // martillo: hembra (agudo) en tiempos pares, macho (grave) en impares
      const hi = beat % 2 === 0;
      playSample(hi ? "bongo_hi" : "bongo_lo", time, accent ? 0.85 : 0.7, 1, 0.13);
    } else if (id === "bajo") {
      const alt = beat === 3 || beat === 7; // leve movimiento
      playSample("bajo", time, 0.9, alt ? 1.06 : 1.0, 0.04);
    } else if (id === "guitarra") {
      playSample("guitarra_a3", time, 0.5, 1, 0.18);
      playSample("guitarra_e4", time + 0.012, 0.4, 1, 0.18);
    }
  }

  function stepDur() { return 60 / bpm / 2; }

  function scheduler() {
    while (nextTime < ctx.currentTime + 0.12) {
      const s = step;
      const isDown = s % 2 === 0;
      tracks.forEach((tr) => {
        if (tr.muted || !tr.pattern.has(s)) return;
        triggerVoice(tr.id, nextTime, s, isDown);
      });
      const at = nextTime;
      setTimeout(() => paintHead(s), Math.max(0, (at - ctx.currentTime) * 1000));
      nextTime += stepDur();
      step = (step + 1) % STEPS;
    }
  }

  async function play() {
    ensureCtx();
    if (!loaded) await loadSamples();
    if (ctx.state === "suspended") await ctx.resume();
    playing = true; step = 0; nextTime = ctx.currentTime + 0.1;
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

  // Al entrar a la vista precargamos los samples; al salir, frenamos el audio.
  window.addEventListener("view:show", (e) => {
    if (e.detail === "sim") loadSamples();
    else if (playing) stop();
  });

  renderPalette();
  renderTracks();
})();
