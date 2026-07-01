/* ============================================================
   Códice de Impro — lógica del sitio (vanilla JS, sin build)
   ============================================================ */

const moves = window.MOVES || [];
const grid = document.getElementById("grid");
const emptyMsg = document.getElementById("empty");
const searchInput = document.getElementById("search");
const tagFilters = document.getElementById("tag-filters");
const countEl = document.getElementById("count");

let activeTag = null;
let query = "";

/* ---------- Estado de audio de archivos ---------- */
let currentAudio = null;
let currentBtn = null;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (currentBtn) {
    currentBtn.classList.remove("playing");
    currentBtn = null;
  }
}

function playSound(sound, btn) {
  // Si ya sonaba este botón, lo paramos (toggle).
  if (currentBtn === btn) {
    stopCurrentAudio();
    return;
  }
  stopCurrentAudio();

  const audio = new Audio(sound.src);
  audio.addEventListener("ended", stopCurrentAudio);
  audio.addEventListener("error", () => {
    btn.classList.remove("playing");
    btn.classList.add("missing");
    btn.title =
      "Todavía no hay clip. Poné el archivo en " + sound.src + " y recargá.";
    currentAudio = null;
    currentBtn = null;
  });
  audio.play().then(() => {
    currentAudio = audio;
    currentBtn = btn;
    btn.classList.add("playing");
  }).catch(() => {
    btn.classList.add("missing");
    btn.title = "No se pudo reproducir. ¿Existe " + sound.src + "?";
  });
}

/* ---------- Metrónomo (Web Audio, sin archivos) ---------- */
const Metro = (() => {
  let ctx = null;
  let timer = null;
  let nextTick = 0;
  let bpm = 120;
  let playing = false;

  const toggleBtn = document.getElementById("metro-toggle");
  const stateLabel = document.getElementById("metro-state");
  const bpmInput = document.getElementById("bpm");

  function click(time) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.5, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  function scheduler() {
    while (nextTick < ctx.currentTime + 0.1) {
      click(nextTick);
      nextTick += 60 / bpm;
    }
  }

  function start() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    playing = true;
    nextTick = ctx.currentTime + 0.05;
    timer = setInterval(scheduler, 25);
    toggleBtn.classList.add("playing");
    stateLabel.textContent = "Stop";
  }

  function stop() {
    playing = false;
    clearInterval(timer);
    toggleBtn.classList.remove("playing");
    stateLabel.textContent = "Play";
  }

  function setBpm(v) {
    bpm = Math.min(240, Math.max(30, Math.round(v) || 120));
    bpmInput.value = bpm;
  }

  toggleBtn.addEventListener("click", () => (playing ? stop() : start()));
  bpmInput.addEventListener("change", () => setBpm(+bpmInput.value));
  document.getElementById("bpm-up").addEventListener("click", () => setBpm(bpm + 5));
  document.getElementById("bpm-down").addEventListener("click", () => setBpm(bpm - 5));

  // Tap tempo
  let taps = [];
  document.getElementById("tap").addEventListener("click", () => {
    const now = performance.now();
    taps = taps.filter((t) => now - t < 2000);
    taps.push(now);
    if (taps.length >= 2) {
      const gaps = [];
      for (let i = 1; i < taps.length; i++) gaps.push(taps[i] - taps[i - 1]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      setBpm(60000 / avg);
    }
  });

  return {
    loadAndPlay(v) {
      setBpm(v);
      if (!playing) start();
      document.getElementById("metronome").scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  };
})();

/* ---------- Lightbox de gifs ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.hidden = false;
}
document.getElementById("lightbox-close").addEventListener("click", () => (lightbox.hidden = true));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") lightbox.hidden = true; });

/* ---------- Render ---------- */
function allTags() {
  const set = new Set();
  moves.forEach((m) => (m.tags || []).forEach((t) => set.add(t)));
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

function matches(move) {
  if (activeTag && !(move.tags || []).includes(activeTag)) return false;
  if (!query) return true;
  const hay = [
    move.name, move.source, move.concept, move.cue, move.drill,
    ...(move.tags || []),
  ].join(" ").toLowerCase();
  return hay.includes(query);
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function renderCard(move) {
  const card = el("article", "card");
  card.id = "move-" + move.id;

  // Media (gif o emoji)
  const media = el("div", "card-media");
  if (move.gif) {
    const img = el("img");
    img.loading = "lazy";
    img.alt = move.name;
    img.src = move.gif;
    img.addEventListener("error", () => {
      media.innerHTML = "";
      media.appendChild(el("span", "placeholder-emoji", move.emoji || "🎞️"));
      media.appendChild(el("span", "gif-hint", "añadí " + move.gif));
    });
    media.appendChild(img);
    media.appendChild(el("span", "gif-hint", "ampliar"));
    media.addEventListener("click", () => {
      if (media.querySelector("img")) openLightbox(move.gif, move.name);
    });
  } else {
    media.appendChild(el("span", "placeholder-emoji", move.emoji || "🎴"));
  }
  card.appendChild(media);

  const body = el("div", "card-body");

  // Encabezado
  const head = el("div", "card-head");
  head.appendChild(el("span", "card-emoji", move.emoji || ""));
  head.appendChild(el("h3", "card-name", move.name));
  if (move.source && move.source !== "?") head.appendChild(el("span", "card-source", move.source));
  body.appendChild(head);

  // Concepto
  body.appendChild(el("p", "card-concept", move.concept || ""));

  // Sonidos + bpm
  const soundRow = el("div", "sound-row");
  (move.sounds || []).forEach((sound) => {
    const icon = sound.type === "music" ? "🎵" : "🔊";
    const btn = el("button", "sound-btn", icon + " " + (sound.label || "Sonido"));
    btn.addEventListener("click", () => playSound(sound, btn));
    soundRow.appendChild(btn);
  });
  if (move.bpm) {
    const bpmBtn = el("button", "bpm-btn", "🥁 " + move.bpm + " BPM");
    bpmBtn.title = "Cargar este tempo en el metrónomo";
    bpmBtn.addEventListener("click", () => Metro.loadAndPlay(move.bpm));
    soundRow.appendChild(bpmBtn);
  }
  if (soundRow.children.length) body.appendChild(soundRow);

  // Detalle (cue + drill)
  if ((move.cue && move.cue !== "—") || (move.drill && move.drill !== "—")) {
    const det = el("details", "card-detail");
    det.appendChild(el("summary", null, "Cómo usarlo"));
    if (move.cue && move.cue !== "—")
      det.appendChild(el("p", "detail-block", "<b>Cuándo:</b> " + move.cue));
    if (move.drill && move.drill !== "—")
      det.appendChild(el("p", "detail-block", "<b>Drill:</b> " + move.drill));
    body.appendChild(det);
  }

  // Tags
  if ((move.tags || []).length) {
    const tags = el("div", "card-tags");
    move.tags.forEach((t) => {
      const chip = el("span", "card-tag", "#" + t);
      chip.addEventListener("click", () => setTag(activeTag === t ? null : t));
      tags.appendChild(chip);
    });
    body.appendChild(tags);
  }

  card.appendChild(body);
  return card;
}

function render() {
  stopCurrentAudio();
  const visible = moves.filter(matches);
  grid.innerHTML = "";
  visible.forEach((m) => grid.appendChild(renderCard(m)));
  emptyMsg.hidden = visible.length > 0;
  countEl.textContent =
    visible.length + (visible.length === 1 ? " movimiento" : " movimientos");
}

function renderTagChips() {
  tagFilters.innerHTML = "";
  const all = el("button", "tag-chip" + (activeTag ? "" : " active"), "Todos");
  all.addEventListener("click", () => setTag(null));
  tagFilters.appendChild(all);
  allTags().forEach((t) => {
    const chip = el("button", "tag-chip" + (activeTag === t ? " active" : ""), "#" + t);
    chip.addEventListener("click", () => setTag(activeTag === t ? null : t));
    tagFilters.appendChild(chip);
  });
}

function setTag(t) {
  activeTag = t;
  renderTagChips();
  render();
}

searchInput.addEventListener("input", () => {
  query = searchInput.value.trim().toLowerCase();
  render();
});

/* ---------- Init ---------- */
renderTagChips();
render();
