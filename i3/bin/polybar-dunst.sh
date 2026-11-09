#!/usr/bin/env bash
# Muestra campana + conteo de notificaciones en espera. Pausa/reanuda dunst al click.

WAITING=$(dunstctl count waiting 2>/dev/null || echo 0)
PAUSED=$(dunstctl is-paused 2>/dev/null || echo false)

if [ "$PAUSED" = "true" ]; then
    echo "󰂛 DND"
elif [ "$WAITING" -gt 0 ]; then
    echo "󰂚 $WAITING"
else
    echo "󰂜"
fi
