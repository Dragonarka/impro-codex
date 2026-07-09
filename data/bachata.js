/*
 * Cheat sheet de Bachata — contenido extraído de las notas (Taller con Valen / Clase de David).
 * Editable: agregá o cambiá lo que quieras, la vista se re-renderiza sola.
 *
 * Los patrones usan el conteo de 8 tiempos. Cada patrón lista los tiempos activos.
 * "sub" indica subdivisión en corcheas (contratiempo, la "y").
 */

const BACHATA = {
  // Instrumentos y su patrón sobre el 8-count (del pizarrón del taller)
  patterns: [
    { id: "guira",   name: "Güira / Congas", accent: "#46d19e", beats: [1,2,3,4,5,6,7,8], note: "Marca todos los tiempos — el pulso constante." },
    { id: "bongo",   name: "Bongó",          accent: "#ff7b3d", beats: [3,4,7,8],         note: "El martillo. Entra antes de cada cambio de compás." },
    { id: "bajo",    name: "Bajo",           accent: "#4ea8ff", beats: [1,3,5,7],         note: "Core beat / sincopado — el cimiento grave." },
    { id: "voz",     name: "Voz / Melodía",  accent: "#ffd24a", beats: [1,5],             note: "Acentos principales, arranque de cada mitad." },
    { id: "guitarra",name: "Guitarra",       accent: "#b06bff", beats: [2,4,6,8],         note: "Sincopado a contratiempo (offbeat)." },
    { id: "full",    name: "Full (Kolbi)",   accent: "#ff5d8f", beats: [1,2,3,4,5,6,7,8], sub: true, note: "Full count a contratiempo: 1y2y3y…8y." },
  ],

  // Formas de contar la música
  counts: [
    { pattern: "1 2 3 · 5 6 7", label: "Regular count", ex: "Bolero, básico sensual" },
    { pattern: "1 2 3 4 5 6 7 8", label: "Full count", ex: "El conteo completo" },
    { pattern: "1 · 3 · 5 · 7", label: "Core beat", ex: "Tiempos fuertes" },
    { pattern: "2 · 4 · 6 · 8", label: "Downbeat / offbeat", ex: "A contratiempo" },
    { pattern: "1y 2y 3y … 8y", label: "Full a contratiempo", ex: "Todas las corcheas" },
    { pattern: "AY1 AY2 AY3", label: "Tres tiempos", ex: "Frase de tres" },
  ],

  // Figuras rítmicas (duración en tiempos)
  figures: [
    { sym: "𝅝", name: "Redonda", val: "4 tiempos" },
    { sym: "𝅗𝅥", name: "Blanca", val: "2 tiempos" },
    { sym: "♩", name: "Negra", val: "1 tiempo" },
    { sym: "♪", name: "Corchea", val: "½ tiempo · bongó" },
  ],

  // Pasos básicos (Clase de David)
  steps: [
    "Básico normal estacionado", "Box step", "Línea bachata", "Twist", "Péndulo",
    "Side cross (Madrid) / Diagonal", "Lateral (el de Carlitos)", "Rebote / el de saltico",
    "Bolero en el puesto", "Básico en V", "Media luna", "Ajuste (paso a paso)",
  ],

  // Tipos, orígenes y subgéneros
  types: ["Tradicional", "Sensual", "Moderna", "Fusión"],
  origins: ["Bolero", "Merengue", "Son (RD/Cuba)", "Chachachá"],
  subgenres: ["Terrenas", "Santiago", "Bonao"],

  // Biomecánica del movimiento
  biomech: [
    { t: "Línea de gravedad", d: "Proyección del centro de masa. Da equilibrio." },
    { t: "Centro de masa", d: "Donde convergen las fuerzas del cuerpo (clave en los giros)." },
    { t: "Alineación postural", d: "Posición de las partes respecto a la línea de gravedad." },
    { t: "Ventaja", d: "Evitar lesiones y cuidar el cuerpo." },
  ],

  // Estilo / Sexy style
  style: [
    { t: "Interpretación", d: "El sexy style es una forma de interpretar, no un paso." },
    { t: "Energía binaria", d: "Masculino → hombros y espalda · Femenino → crestas ilíacas." },
    { t: "Confianza", d: "Lo sexy es la confianza. Línea fina entre sensual y sexual." },
    { t: "Refs de jazz", d: "Dégagé = dobladito · Tendu = estirado." },
  ],
};

if (typeof window !== "undefined") window.BACHATA = BACHATA;
