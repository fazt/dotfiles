#!/usr/bin/env bash
# Install personal Claude/agent skills via symlinks
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/skills"
DESTINATIONS=(
    "$HOME/.claude/skills"
    "$HOME/.agents/skills"
)

# Las skills fx* viven ahora en el repo de FXCode (skills/install.sh).
if [ ! -d "$SRC" ]; then
    echo "Sin skills locales: las fx* se instalan desde fazt/fxcode con skills/install.sh"
    DESTINATIONS=()
fi

for DEST in "${DESTINATIONS[@]}"; do
    mkdir -p "$DEST"

    for d in "$SRC"/*/; do
        [ -d "$d" ] || continue
        name="$(basename "$d")"
        link="$DEST/$name"
        if [ -e "$link" ] || [ -L "$link" ]; then
            rm -rf "$link"
        fi
        ln -s "$d" "$link"
        echo "Linked $name -> $d in $DEST"
    done
done

echo "Claude and agent skills installed!"

# Status line: se referencia por ruta desde settings.json en vez de enlazarse,
# asi este repo queda como la unica copia del script.
if command -v node >/dev/null 2>&1; then
    node "$SCRIPT_DIR/install-statusline.js"
    echo "Status line installed!"
else
    echo "node no encontrado - status line omitida (la status line necesita node)"
fi
