#!/bin/sh
# Menú de apagado estilo wlogout para rofi — funciona en i3 y en XFCE
theme="$HOME/.config/rofi/powermenu.rasi"
[ -f "$theme" ] || theme="$HOME/dotfiles/i3/powermenu.rasi"

# Botones (Nerd Font, en bytes UTF-8): apagar reiniciar suspender bloquear cerrar-sesión
#   U+F011 power  U+F021 refresh  U+F186 moon  U+F023 lock  U+F08B sign-out
# Usamos -format i (índice 0-4) para no depender de comparar glifos.
idx=$(printf '\357\200\221\n\357\200\241\n\357\206\206\n\357\200\243\n\357\202\213' \
    | rofi -dmenu -i -p "Sesión" -format i \
           -mesg "Apagar · Reiniciar · Suspender · Bloquear · Cerrar sesión" \
           -theme "$theme")

case "$idx" in
    0) systemctl poweroff ;;
    1) systemctl reboot ;;
    2) systemctl suspend ;;
    3) xflock4 ;;
    4) # Cerrar sesión según el entorno actual
        if pgrep -x i3 >/dev/null; then
            i3-msg exit
        elif command -v xfce4-session-logout >/dev/null && pgrep -x xfce4-session >/dev/null; then
            xfce4-session-logout --logout --fast
        else
            loginctl terminate-session "$XDG_SESSION_ID"
        fi
        ;;
    *) exit 0 ;;
esac
