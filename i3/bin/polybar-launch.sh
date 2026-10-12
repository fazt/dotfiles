#!/usr/bin/env bash
# Lanza Polybar (mata instancias previas primero). Llamado desde i3 con exec_always.
pkill -x polybar 2>/dev/null
# esperar a que mueran
for _ in 1 2 3 4 5 6 7 8 9 10; do
  pgrep -x polybar >/dev/null || break
  sleep 0.2
done
polybar -c "$HOME/.config/polybar/config.ini" main >/tmp/polybar.log 2>&1 &

# Applets de la bandeja (red y bluetooth). Se lanzan aquí y no en la config de i3
# porque tienen que arrancar DESPUÉS de que exista la bandeja de Polybar: si salen
# antes, o si Polybar se relanza al recargar i3, quedan huérfanos y el icono/menú
# aparece roto. Por eso se matan y se vuelven a lanzar cada vez.
for _ in $(seq 1 50); do   # hasta ~10 s
  xwininfo -root -tree 2>/dev/null | grep -q '("polybar" "Polybar")' && break
  sleep 0.2
done
sleep 0.5   # margen para que la bandeja tome la selección _NET_SYSTEM_TRAY

pkill -x nm-applet 2>/dev/null
pkill -f '/usr/bin/blueman-(applet|tray)' 2>/dev/null
sleep 0.3
command -v nm-applet >/dev/null && setsid -f nm-applet >/dev/null 2>&1
command -v blueman-applet >/dev/null && setsid -f blueman-applet >/dev/null 2>&1
