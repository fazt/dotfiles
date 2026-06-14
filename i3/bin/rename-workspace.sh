#!/usr/bin/env sh
# Renombra el workspace actual conservando su número, para que los atajos
# Súper+1..5 (workspace number N) sigan encontrándolo. Pide el nombre con rofi.
num=$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused).num')
name=$(rofi -dmenu -l 0 -p "Nombre del workspace") || exit 0
[ -z "$name" ] && exit 0
if [ "$num" -ge 0 ] 2>/dev/null; then
  i3-msg "rename workspace to \"$num: $name\""
else
  i3-msg "rename workspace to \"$name\""
fi
