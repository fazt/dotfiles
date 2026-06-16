#!/usr/bin/env bash
# Mostrar escritorio (toggle estilo Win+D) para Hyprland en modo Lua.
# 1ra pulsacion: oculta TODAS las ventanas (todos los monitores) a un workspace especial.
# 2da pulsacion: las restaura exactamente en su workspace original.
#
# En modo Lua, "hyprctl dispatch X" evalua X como Lua, por eso usamos
# hl.dsp.window.move({ workspace = ..., window = "address:0x.." }).

SPECIAL="special:minimized"
STATE="/tmp/hypr-showdesktop.state"

mv_window() {  # $1 = address, $2 = workspace (numero o "special:...")
    local addr="$1" ws="$2"
    if [[ "$ws" == special:* ]]; then
        hyprctl dispatch "hl.dsp.window.move({ workspace = \"$ws\", window = \"address:$addr\" })" >/dev/null
    else
        hyprctl dispatch "hl.dsp.window.move({ workspace = $ws, window = \"address:$addr\" })" >/dev/null
    fi
}

if [ -f "$STATE" ]; then
    # ---- Restaurar ----
    while IFS=$'\t' read -r addr ws; do
        [ -n "$addr" ] && mv_window "$addr" "$ws"
    done < "$STATE"
    rm -f "$STATE"
else
    # ---- Minimizar todo (solo workspaces normales: id > 0) ----
    hyprctl clients -j | jq -r '.[] | select(.workspace.id > 0) | "\(.address)\t\(.workspace.id)"' > "$STATE"
    if [ ! -s "$STATE" ]; then
        rm -f "$STATE"   # no habia nada que minimizar
        exit 0
    fi
    while IFS=$'\t' read -r addr ws; do
        [ -n "$addr" ] && mv_window "$addr" "$SPECIAL"
    done < "$STATE"
fi
