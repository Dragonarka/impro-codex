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
    id: "obsession-walk",
    name: "Caminada de Obsession",
    source: "Aventura",
    emoji: "😱",
    concept:
      "Retroceso lento con control absoluto y calidad inquietante: caminar hacia atrás como en peli de terror, sin rebote, arrastrando el peso. Domina el espacio y genera tensión alejándote.",
    cue: "Pasajes oscuros o tensos, o cuando querés crear suspenso separándote del público.",
    drill:
      "8 tiempos hacia atrás, un pie por tiempo, mirada fija al frente. Que cada paso 'arrastre' el peso. Sumá una pausa cada 4 para cargar la tensión.",
    tags: ["espacio", "control", "tensión", "retroceso"],
    bpm: 90,
  },
  {
    id: "doctor-strange",
    name: "Círculo de Doctor Strange",
    source: "Marvel",
    emoji: "🌀",
    concept:
      "Mandalas en el aire: círculos concéntricos con manos y muñecas, fluidos y precisos, como abrir un portal. Aislación de brazos + continuidad circular sin cortes.",
    cue: "Capas melódicas sostenidas o sintes que giran. Cuando querés 'dibujar' en el aire (enlaza con el dibujar en el suelo de bachata).",
    drill:
      "Dibujá dos círculos simultáneos con las manos en planos distintos, con el centro quieto. Cambiá tamaño y velocidad sin cortar el trazo.",
    tags: ["aislación", "círculos", "fluidez", "manos"],
    bpm: 110,
  },
  {
    id: "var-slowmo",
    name: "El VAR (repetición lenta)",
    source: "Fútbol",
    emoji: "📺",
    concept:
      "Hacés un movimiento a tiempo real y lo 'revisás' en cámara lenta, como una repetición del VAR. Puro contraste de velocidad: normal → ultra-lento con todo el detalle.",
    cue: "Cuando la música se abre o hay un breakdown. Para remarcar un gesto y darle drama.",
    drill:
      "Elegí un gesto de 1 tiempo. Hacelo normal, congelá ('revisión'), y repetilo en 4 tiempos en cámara lenta controlando cada micro-etapa.",
    tags: ["dinámica", "cámara lenta", "contraste", "freeze"],
    bpm: 100,
  },
  {
    id: "haaland-zen",
    name: "Haaland Zen (hu hu)",
    source: "Fútbol",
    emoji: "🧘",
    concept:
      "Pausa de meditación: te aquietás en calma total en medio del caos, como la celebración zen de Haaland. Contraste por ausencia de movimiento — el silencio como recurso.",
    cue: "Breaks, silencios o para resetear la energía. El 'no-movimiento' que resalta lo que viene.",
    drill:
      "En pleno groove, cortá a una pose de calma (sentado o piernas cruzadas) y sostené 4 tiempos respirando. Volvé de golpe.",
    tags: ["pausa", "calma", "contraste", "freeze"],
    bpm: 90,
  },
  {
    id: "granada",
    name: "Granada en el corte",
    source: "Acción",
    emoji: "💣",
    concept:
      "Anticipás un corte musical como una granada que lanzás: cae justo en el break y explotás con un salto desde lejos, aterrizando en el acento. Timing + explosión + espacio.",
    cue: "Cuando escuchás venir un golpe/drop. Preparás desde lejos y 'detonás' en el corte exacto.",
    drill:
      "Contá los tiempos hasta el corte. 'Lanzá' (gesto) 2 tiempos antes, cubrí distancia y saltá aterrizando exacto en el acento. Repetí afinando el timing.",
    tags: ["musicalidad", "salto", "explosión", "espacio", "timing"],
    bpm: 128,
  },
  {
    id: "wingardium",
    name: "Wingardium Leviosa",
    source: "Harry Potter",
    emoji: "🪄",
    concept:
      "Levitación: elevás una parte del cuerpo (o tu partner imaginario) lento y suspendido, con la varita marcando el ascenso. Control de subida y suspensión.",
    cue: "Subidas melódicas y swells. Cuando querés dar sensación de flotar o elevar algo.",
    drill:
      "Con un gesto de varita, elevá el brazo contrario en 4 tiempos como si levitara un objeto. Que suba parejo, sin saltos, y sostené arriba.",
    tags: ["suspensión", "control", "subida", "manos"],
    bpm: 100,
  },
  {
    id: "expelliarmus",
    name: "Expelliarmus",
    source: "Harry Potter",
    emoji: "💥",
    concept:
      "Hechizo de desarme: un empuje seco y direccional que 'expulsa' energía hacia afuera. Acento explosivo con parada firme en seco.",
    cue: "Hits fuertes o un golpe puntual. Para rematar una frase empujando hacia una dirección.",
    drill:
      "Carga mínima y lanzá el 'hechizo' en 1 tiempo hacia un punto, frenando en seco. Cambiá la dirección en cada repetición.",
    tags: ["acento", "empuje", "dirección", "explosión"],
    bpm: 120,
  },
  {
    id: "expecto-patronum",
    name: "Expecto Patronum",
    source: "Harry Potter",
    emoji: "🦌",
    concept:
      "Escudo expansivo: desde el centro irradiás energía en 360°, luminosa y protectora. Expansión total del cuerpo desde el core.",
    cue: "Momentos épicos o luminosos, cuando la música se agranda. Para abrirte al máximo.",
    drill:
      "Desde una posición cerrada, expandí todo el cuerpo (brazos, pecho, mirada) en 2 tiempos irradiando desde el ombligo. Sostené la amplitud.",
    tags: ["expansión", "épico", "core", "amplitud"],
    bpm: 110,
  },
  {
    id: "dybala-mask",
    name: "La Máscara de Dybala",
    source: "Fútbol",
    emoji: "🎭",
    concept:
      "Gesto de máscara: las manos cubren y descubren el rostro como un gladiador, enmarcando la cara. Presentación y personaje — un momento de pura actitud.",
    cue: "Para presentarte, cerrar con actitud o marcar un cambio de personaje. Contacto visual fuerte.",
    drill:
      "Pasá las manos frente a la cara 'colocando la máscara' en 2 tiempos y revelá la mirada con actitud. Gesto limpio, la cara cambia.",
    tags: ["personaje", "presentación", "manos", "actitud"],
    bpm: 100,
  },
  {
    id: "siuuu-cr7",
    name: "SIUUU (CR7)",
    source: "Fútbol",
    emoji: "🙌",
    concept:
      "Salto con medio giro en el aire y aterrizaje firme con brazos abiertos, como el 'SIUUU' de Cristiano. Remate explosivo con presentación triunfal.",
    cue: "Cierre de frase, un gran acento o el final. Cuando querés rematar con presencia total.",
    drill:
      "Impulso, medio giro en el aire y aterrizá con base ancha y brazos abiertos, congelando 1 tiempo. Buscá el silencio en el aterrizaje.",
    tags: ["salto", "giro", "presentación", "remate", "aterrizaje"],
    bpm: 128,
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
