#!/bin/sh
# Sube/baja el brillo vía logind (sin root). Uso: brightness.sh up|down [paso%]
dev=intel_backlight
max=$(cat /sys/class/backlight/$dev/max_brightness)
cur=$(cat /sys/class/backlight/$dev/brightness)
step=$(( max * ${2:-5} / 100 ))
[ "$step" -lt 1 ] && step=1
case "$1" in
    up)   new=$(( cur + step )) ;;
    down) new=$(( cur - step )) ;;
    *)    new=$cur ;;
esac
[ "$new" -gt "$max" ] && new=$max
min=$(( max / 100 )); [ "$min" -lt 1 ] && min=1
[ "$new" -lt "$min" ] && new=$min
busctl call org.freedesktop.login1 /org/freedesktop/login1/session/auto \
    org.freedesktop.login1.Session SetBrightness ssu backlight $dev "$new" >/dev/null 2>&1
