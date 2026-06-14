#!/bin/sh
# Menú de apagado para rofi — funciona en i3 y en XFCE
chosen=$(printf "  Apagar\n  Reiniciar\n  Suspender\n  Bloquear\n  Cerrar sesión" \
    | rofi -dmenu -i -p "Sesión" -theme-str 'window {width: 360px;} listview {lines: 5;}')

case "$chosen" in
    *Apagar)       systemctl poweroff ;;
    *Reiniciar)    systemctl reboot ;;
    *Suspender)    systemctl suspend ;;
    *Bloquear)     xflock4 ;;
    *"Cerrar sesión")
        # Logout según el entorno actual
        if pgrep -x i3 >/dev/null; then
            i3-msg exit
        elif command -v xfce4-session-logout >/dev/null && pgrep -x xfce4-session >/dev/null; then
            xfce4-session-logout --logout --fast
        else
            loginctl terminate-session "$XDG_SESSION_ID"
        fi
        ;;
esac
