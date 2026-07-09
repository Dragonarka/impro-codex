/* ============================================================
   Cheat sheet de Bachata — render en formato tablero (TV)
   ============================================================ */
(function () {
  const B = window.BACHATA;
  const board = document.getElementById("bachata-board");
  if (!B || !board) return;

  // Tira de 8 tiempos con los activos encendidos. sub=true muestra las corcheas "y".
  function beatStrip(active, accent, sub) {
    const on = new Set(active);
    let cells = "";
    for (let i = 1; i <= 8; i++) {
      cells += `<span class="bs-cell ${on.has(i) ? "on" : ""}" style="--c:${accent}">${i}</span>`;
      if (sub) cells += `<span class="bs-cell sub ${on.has(i) ? "on" : ""}" style="--c:${accent}">y</span>`;
    }
    return `<div class="beatstrip ${sub ? "has-sub" : ""}">${cells}</div>`;
  }

  const panel = (cls, title, icon, body) =>
    `<section class="panel ${cls}">
       <h2 class="panel-title">${icon ? `<span>${icon}</span>` : ""}${title}</h2>
       <div class="panel-body">${body}</div>
     </section>`;

  // --- Patrones por instrumento (el pizarrón) ---
  const patterns = B.patterns
    .map(
      (p) => `
      <div class="pat-row" style="--c:${p.accent}">
        <div class="pat-name">${p.name}</div>
        ${beatStrip(p.beats, p.accent, p.sub)}
        <div class="pat-note">${p.note}</div>
      </div>`
    )
    .join("");

  // --- Conteos ---
  const counts = B.counts
    .map(
      (c) => `
      <div class="count-row">
        <code class="count-pat">${c.pattern}</code>
        <div class="count-meta"><b>${c.label}</b><span>${c.ex}</span></div>
      </div>`
    )
    .join("");

  // --- Figuras rítmicas ---
  const figures = B.figures
    .map(
      (f) => `<div class="fig"><span class="fig-sym">${f.sym}</span><div><b>${f.name}</b><span>${f.val}</span></div></div>`
    )
    .join("");

  // --- Pasos básicos (agrupados, chips grandes) ---
  const steps = B.steps
    .map(
      (grp) => `
      <div class="step-group">
        <span class="step-group-label">${grp.group}</span>
        <div class="step-chips">${grp.items.map((s) => `<span class="step-chip">${s}</span>`).join("")}</div>
      </div>`
    )
    .join("");

  // --- Tipos / orígenes ---
  const chips = (arr) => arr.map((x) => `<span class="chip">${x}</span>`).join("");
  const originsBody = `
    <div class="sub-block"><span class="sub-label">Tipos</span>${chips(B.types)}</div>
    <div class="sub-block"><span class="sub-label">Orígenes</span>${chips(B.origins)}</div>
    <div class="sub-block"><span class="sub-label">Subgéneros</span>${chips(B.subgenres)}</div>`;

  // --- Biomecánica / Estilo ---
  const defList = (arr) =>
    arr.map((x) => `<div class="def"><b>${x.t}</b><span>${x.d}</span></div>`).join("");

  board.innerHTML = `
    <div class="board-head">
      <h1 class="board-title">Cheat sheet · <b>Bachata</b></h1>
      <button class="go-sim" id="go-sim">🥁 Abrir simulador de ritmo →</button>
    </div>
    <div class="board-grid">
      ${panel("span-2 accent-guira", "Patrones por instrumento", "🥁", `<div class="patterns">${patterns}</div>
        <p class="panel-foot">Sobre el conteo de 8 tiempos. Estos son los que combina el simulador.</p>`)}
      ${panel("accent-voz", "Conteos", "🔢", `<div class="counts">${counts}</div>`)}
      ${panel("span-2 accent-bajo", "Pasos básicos · mi guía", "👟", `<div class="step-groups">${steps}</div>`)}
      ${panel("accent-bongo", "Partes de la bachata", "🎼", defList(B.parts))}
      ${panel("accent-bongo", "Figuras rítmicas", "🎵", `<div class="figures">${figures}</div>
        <p class="panel-foot">La percusión no se alarga: <b>seco</b> o <b>redoble</b>.</p>`)}
      ${panel("accent-guira", "Tipos & orígenes", "🌎", originsBody)}
      ${panel("accent-guitarra", "Biomecánica", "🦴", defList(B.biomech))}
      ${panel("accent-full", "Estilo · Sexy style", "🔥", defList(B.style))}
    </div>`;

  const goSim = document.getElementById("go-sim");
  if (goSim)
    goSim.addEventListener("click", () => {
      const btn = document.querySelector('.tab[data-view="sim"]');
      if (btn) btn.click();
    });
})();
