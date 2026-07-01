/*
 * Base de datos de movimientos / jutsus de improvisación.
 * Para añadir un movimiento nuevo, copiá un bloque { ... } y editalo.
 *
 * Campos:
 *   id       -> identificador único (kebab-case). Sirve para el enlace directo.
 *   name     -> nombre de la referencia ("Kamehameha").
 *   source   -> de dónde sale ("Dragon Ball Z").
 *   emoji    -> ícono de la tarjeta.
 *   concept  -> qué concepto de baile representa.
 *   cue      -> cuándo usarlo en la impro.
 *   drill    -> ejercicio para entrenarlo.
 *   tags     -> etiquetas para filtrar (dinámica, aislación, etc.).
 *   bpm      -> (opcional) tempo sugerido; aparece un botón que carga el metrónomo.
 *   gif      -> (opcional) ruta a un gif: "assets/gifs/archivo.gif".
 *   sounds   -> (opcional) lista de sonidos. Cada uno:
 *                 { type: "file",  label: "SFX carga", src: "assets/sounds/x.mp3" }
 *                 { type: "music", label: "Track",     src: "assets/sounds/y.mp3" }
 *               Si el archivo todavía no existe, el botón te avisa cómo añadirlo.
 */

const MOVES = [
  {
    id: "kamehameha",
    name: "Kamehameha",
    source: "Dragon Ball Z",
    emoji: "🌊",
    concept:
      "Carga y descarga. Acumulás energía y tensión LENTO (respiración, contracción, foco en un punto) y la liberás DE GOLPE en una explosión direccional. Es puro contraste de dinámica: lento-controlado → rápido-explosivo.",
    cue: "Cuando la música tiene un build-up largo antes de un drop. Cargás durante la subida, soltás en el drop.",
    drill:
      "8 tiempos cargando (micro-movimiento, tensión creciente hacia el centro) + 1 tiempo de explosión hacia una dirección clara. Repetí cambiando la dirección de salida cada vez.",
    tags: ["dinámica", "contraste", "musicalidad", "control"],
    bpm: 90,
    gif: "assets/gifs/kamehameha.gif",
    sounds: [
      { type: "file", label: "SFX carga", src: "assets/sounds/kamehameha.mp3" },
    ],
  },
  {
    id: "chidori",
    name: "Chidori",
    source: "Naruto",
    emoji: "⚡",
    concept:
      "Aislaciones rápidas y staccato con calidad ELÉCTRICA: manos y brazos vibrando, hits secos y agudos, energía nerviosa concentrada en las extremidades. El sonido de mil pájaros = mil micro-acentos.",
    cue: "Para hi-hats rápidos, redobles o capas agudas de la música. Cuando querés textura nerviosa y detalle fino.",
    drill:
      "Aislá una mano y hacé 16 hits rápidos en el sitio marcando solo con muñeca y dedos. Sumá vibración (tremor) entre hit y hit sin perder el tempo.",
    tags: ["aislación", "staccato", "velocidad", "textura"],
    bpm: 160,
    gif: "assets/gifs/chidori.gif",
    sounds: [
      { type: "file", label: "SFX eléctrico", src: "assets/sounds/chidori.mp3" },
    ],
  },
  {
    id: "invocacion",
    name: "Invocación (Kuchiyose)",
    source: "Naruto",
    emoji: "🐸",
    concept:
      "Invocás algo de la nada: un gesto RITUAL de preparación (sellos con las manos, plantar la palma en el piso) seguido de una APARICIÓN súbita — un cambio total de personaje, o una parte del cuerpo que cobra vida.",
    cue: "Transiciones. Cuando querés introducir un elemento nuevo (un nivel bajo, un personaje, un partner imaginario) con intención ceremonial.",
    drill:
      "Diseñá un 'sello' de 2 tiempos con las manos + planta + aparición. Que lo que aparece tenga SIEMPRE una calidad distinta a lo que venías haciendo. Debe sorprender.",
    tags: ["transición", "narrativa", "ritual", "contraste"],
    gif: "assets/gifs/invocacion.gif",
    sounds: [
      { type: "file", label: "SFX invocación", src: "assets/sounds/invocacion.mp3" },
    ],
  },
  {
    id: "teletransportacion",
    name: "Teletransportación (Instant Transmission)",
    source: "Dragon Ball Z",
    emoji: "✨",
    concept:
      "Corte súbito de posición, nivel o dirección con calidad DESAPARECER-REAPARECER. El truco es la AUSENCIA de transición: estás acá, y al frame siguiente estás allá. (Dedos en la frente, opcional.)",
    cue: "Silencios y cortes en la música, o glitches. Para moverte por el escenario sin que se vea el camino.",
    drill:
      "Marcá un punto A y un punto B. Movete de A a B eliminando TODO movimiento intermedio: congelás en A, blackout interno, aparecés ya congelado en B. Puliendo la limpieza del corte.",
    tags: ["espacio", "corte", "freeze", "ilusión"],
    gif: "assets/gifs/teletransportacion.gif",
    sounds: [
      { type: "file", label: "SFX teleport", src: "assets/sounds/teletransportacion.mp3" },
    ],
  },
  {
    id: "pajaro-loco",
    name: "El Pájaro Loco",
    source: "Woody Woodpecker",
    emoji: "🐦",
    concept:
      "Groove cómico y errático: rebote de cabeza y torso tipo PICOTEO, acentos impredecibles, actitud burlona. Ligereza y humor por encima de la técnica. La referencia que todo hispanohablante entiende.",
    cue: "Música juguetona, swing, breaks graciosos. Cuando querés romper la seriedad y jugar con el público.",
    drill:
      "Picoteo de cabeza en negras + acentos random con los hombros. Exagerá la cara. Rompé el patrón cada 4 tiempos para que nunca sea predecible.",
    tags: ["groove", "humor", "musicalidad", "personaje"],
    bpm: 120,
    gif: "assets/gifs/pajaro-loco.gif",
    sounds: [
      { type: "file", label: "Risa Pájaro Loco", src: "assets/sounds/pajaro-loco.mp3" },
    ],
  },
  {
    id: "toydai",
    name: "Toydai — por definir ✍️",
    source: "?",
    emoji: "❓",
    concept:
      "TODO: Daniel, contame qué es 'toydai' y qué concepto de baile representa para vos, y completo la tarjeta. (¿Referencia de anime? ¿Un sonido? ¿Un personaje?)",
    cue: "—",
    drill: "—",
    tags: ["por-definir"],
  },
];

// Exponer los datos tanto si se abre el archivo directamente como si se sirve por HTTP.
if (typeof window !== "undefined") window.MOVES = MOVES;
