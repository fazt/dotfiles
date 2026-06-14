#!/usr/bin/env sh
# Volumen para Polybar usando wpctl (PipeWire/WirePlumber).
v=$(wpctl get-volume @DEFAULT_AUDIO_SINK@ 2>/dev/null)
if echo "$v" | grep -q MUTED; then
  echo " muted"
else
  p=$(echo "$v" | awk '{printf "%d", $2*100}')
  echo " ${p}%"
fi
