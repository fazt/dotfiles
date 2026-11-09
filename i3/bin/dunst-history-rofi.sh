#!/usr/bin/env bash
# Toggle del drawer de notificaciones eww.

dunst 2>/dev/null &

if eww windows 2>/dev/null | grep -q "^notif-drawer$"; then
    eww close notif-drawer
    eww update notif-open=false
else
    eww update notif-open=true
    eww open notif-drawer
fi
