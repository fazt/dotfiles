#!/usr/bin/env sh
# Renombra el workspace actual conservando su número (para que Súper+1..5 lo sigan
# encontrando) y lo pinta como un RECUADRO de color por número, usando el formato de
# Polybar (%{B#hex} fondo, %{F#hex} texto). Pide el nombre con rofi.
# El "N:" del principio es solo para que i3 conserve el número; Polybar lo oculta
# (strip-wsnumbers) y muestra el recuadro.
num=$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused).num')
name=$(rofi -dmenu -l 0 -p "Nombre del workspace") || exit 0
[ -z "$name" ] && exit 0

# Color de fondo del recuadro, fijo por número de workspace.
case "$num" in
  1) c="#5294e2" ;;  # azul
  2) c="#8ae234" ;;  # verde
  3) c="#e08e3c" ;;  # naranja
  4) c="#b57edc" ;;  # morado
  5) c="#e9c46a" ;;  # amarillo
  *) c="#888888" ;;  # gris (6+ o sin número)
esac

if [ "$num" -ge 0 ] 2>/dev/null; then
  i3-msg "rename workspace to \"$num: %{B$c}%{F#111111} $num: $name %{B-}%{F-}\""
else
  i3-msg "rename workspace to \"$name\""
fi
