#!/usr/bin/env bash
# Lanza Polybar (mata instancias previas primero). Llamado desde i3 con exec_always.
pkill -x polybar 2>/dev/null
# esperar a que mueran
for _ in 1 2 3 4 5 6 7 8 9 10; do
  pgrep -x polybar >/dev/null || break
  sleep 0.2
done
polybar -c "$HOME/.config/polybar/config.ini" main >/tmp/polybar.log 2>&1 &
