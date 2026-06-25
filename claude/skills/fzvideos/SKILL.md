---
name: fzvideos
description: Lista los videos de una carpeta con su duracion y los renombra en orden (1.mkv, 2.mkv, ...)
---

1. Lista los archivos de video de la carpeta (mkv, mp4, mov, webm, avi).
1. Saca la duracion de cada uno con ffprobe:
   `ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"`
1. Muestra una tabla: nombre, duracion (mm:ss) y tamaño, ordenada por fecha de modificacion.
1. Si el usuario pide renombrar: ordena por fecha y renombra a `1.ext`, `2.ext`, ... respetando la extension. Conserva los que ya tengan nombre numerico si lo pide.
1. Reporta el mapeo viejo -> nuevo al terminar.
