#!/bin/sh
# OSD para teclas Fn en i3 (dunst). Hace la acción y muestra el valor actual con barra.
# Uso: osd.sh vol-up|vol-down|vol-mute|mic-mute|bright-up|bright-down [paso]
step=${2:-5}
SINK=@DEFAULT_AUDIO_SINK@
SRC=@DEFAULT_AUDIO_SOURCE@

notify() { # tag icono texto [valor]
    if [ -n "$4" ]; then
        dunstify -a osd -u low -t 1500 -i "$2" \
            -h string:x-dunst-stack-tag:"$1" -h int:value:"$4" "$3"
    else
        dunstify -a osd -u low -t 1500 -i "$2" \
            -h string:x-dunst-stack-tag:"$1" "$3"
    fi
}

show_volume() {
    out=$(wpctl get-volume $SINK)               # "Volume: 0.65" o "Volume: 0.65 [MUTED]"
    pct=$(echo "$out" | awk '{printf "%d", $2*100 + 0.5}')
    if echo "$out" | grep -q MUTED; then
        notify osd-volume audio-volume-muted "Volumen: silenciado ($pct%)" "$pct"
    else
        if   [ "$pct" -eq 0 ];  then icon=audio-volume-muted
        elif [ "$pct" -lt 34 ]; then icon=audio-volume-low
        elif [ "$pct" -lt 67 ]; then icon=audio-volume-medium
        else icon=audio-volume-high; fi
        notify osd-volume "$icon" "Volumen: $pct%" "$pct"
    fi
}

show_brightness() {
    dev=intel_backlight
    max=$(cat /sys/class/backlight/$dev/max_brightness)
    cur=$(cat /sys/class/backlight/$dev/brightness)
    pct=$(( (cur * 100 + max / 2) / max ))
    notify osd-brightness display-brightness "Brillo: $pct%" "$pct"
}

case "$1" in
    vol-up)      wpctl set-mute $SINK 0; wpctl set-volume -l 1.0 $SINK "$step"%+; show_volume ;;
    vol-down)    wpctl set-volume $SINK "$step"%-; show_volume ;;
    vol-mute)    wpctl set-mute $SINK toggle; show_volume ;;
    mic-mute)
        wpctl set-mute $SRC toggle
        if wpctl get-volume $SRC | grep -q MUTED; then
            notify osd-mic microphone-sensitivity-muted "Micrófono: silenciado"
        else
            notify osd-mic microphone-sensitivity-high "Micrófono: activo"
        fi ;;
    bright-up)   ~/.local/bin/brightness.sh up "$step";   sleep 0.05; show_brightness ;;
    bright-down) ~/.local/bin/brightness.sh down "$step"; sleep 0.05; show_brightness ;;
    *) echo "uso: $0 vol-up|vol-down|vol-mute|mic-mute|bright-up|bright-down [paso]" >&2; exit 1 ;;
esac
