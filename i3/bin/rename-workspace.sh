#!/usr/bin/env sh
# Renombra el workspace actual conservando su número (para que Súper+1..5 lo sigan
# encontrando) y lo colorea por número con el formato de Polybar (%{F#hex}).
# Pide el nombre con rofi.
num=$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused).num')
name=$(rofi -dmenu -l 0 -p "Nombre del workspace") || exit 0
[ -z "$name" ] && exit 0

# Color fijo por número de workspace (lo interpreta Polybar; en i3bar se vería literal).
case "$num" in
  1) c="#5294e2" ;;  # azul
  2) c="#8ae234" ;;  # verde
  3) c="#e08e3c" ;;  # naranja
  4) c="#b57edc" ;;  # morado
  5) c="#e9c46a" ;;  # amarillo
  *) c="#cccccc" ;;  # gris (6+ o sin número)
esac

if [ "$num" -ge 0 ] 2>/dev/null; then
  i3-msg "rename workspace to \"$num: %{F$c}$name%{F-}\""
else
  i3-msg "rename workspace to \"$name\""
fi
