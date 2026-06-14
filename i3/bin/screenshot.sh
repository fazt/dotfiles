#!/bin/sh
# Capturas para i3 usando xfce4-screenshooter
dir="$(xdg-user-dir PICTURES 2>/dev/null || echo "$HOME/Pictures")/Capturas"
case "$1" in
    clip)   # región → portapapeles (vía xclip, que persiste en i3)
        tmp="$(mktemp /tmp/ss-XXXXXX.png)"
        if xfce4-screenshooter -r -s "$tmp" && [ -s "$tmp" ]; then
            xclip -selection clipboard -t image/png -i "$tmp"
        fi
        rm -f "$tmp"
        ;;
    region) mkdir -p "$dir"; xfce4-screenshooter -r -s "$dir/captura-$(date +%Y%m%d-%H%M%S).png" ;;
    full)   mkdir -p "$dir"; xfce4-screenshooter -f -s "$dir/captura-$(date +%Y%m%d-%H%M%S).png" ;;
    *)      xfce4-screenshooter ;;
esac
