# 📜 Códice de Impro

Mi arsenal personal de *jutsus* para improvisar bailando. Cada tarjeta es un concepto de baile guardado bajo la referencia que uso para acordarme de él (Kamehameha, Chidori, Teletransportación, El Pájaro Loco…), con **sonido**, **gif** y un **drill** para entrenarlo.

Sitio estático, sin build. Se puede abrir con doble clic o servir en GitHub Pages / Vercel.

## Cómo verlo en local

```bash
# Opción rápida (Python)
python3 -m http.server 8000
# luego abrí http://localhost:8000

# o con Node
npx serve .
```

> También funciona abriendo `index.html` directamente en el navegador.

## Cómo añadir un movimiento

Editá `data/moves.js` y copiá un bloque `{ ... }`. Campos:

| Campo    | Qué es                                                        |
|----------|--------------------------------------------------------------|
| `id`     | identificador único, en kebab-case                           |
| `name`   | nombre de la referencia                                      |
| `source` | de dónde sale (anime, dibujo, etc.)                          |
| `emoji`  | ícono de la tarjeta                                          |
| `concept`| qué concepto de baile representa                             |
| `cue`    | cuándo usarlo en la impro                                    |
| `drill`  | ejercicio para entrenarlo                                    |
| `tags`   | etiquetas para filtrar                                       |
| `bpm`    | (opcional) tempo sugerido → botón que carga el metrónomo     |
| `gif`    | (opcional) `assets/gifs/archivo.gif`                         |
| `sounds` | (opcional) lista de `{ type, label, src }`                   |

## Cómo añadir sonidos y gifs

- **Sonidos** → poné el archivo (`.mp3`, `.m4a`, `.ogg`) en `assets/sounds/` con el nombre que declaraste en `moves.js`. Si el archivo no existe todavía, el botón te avisa.
- **GIFs** → poné el `.gif` en `assets/gifs/`. Si no existe, la tarjeta muestra el emoji.
- **Metrónomo** → funciona sin archivos (se genera con Web Audio). Cada tarjeta con `bpm` tiene un botón para cargarlo.

## Estructura

```
impro-codex/
├── index.html
├── styles.css
├── app.js
├── data/moves.js       ← acá vive tu contenido
└── assets/
    ├── sounds/         ← tus clips de audio
    └── gifs/           ← tus gifs
```
