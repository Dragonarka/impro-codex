# Sonidos

Poné acá tus clips de audio (`.mp3`, `.m4a`, `.ogg`).

El nombre del archivo tiene que coincidir con el `src` que declaraste en `data/moves.js`.
Por ejemplo, si en `moves.js` tenés:

```js
sounds: [{ type: "file", label: "SFX carga", src: "assets/sounds/kamehameha.mp3" }]
```

entonces el archivo debe llamarse `kamehameha.mp3` y vivir en esta carpeta.

Mientras no exista el archivo, el botón de la tarjeta aparece punteado y te avisa qué falta.
