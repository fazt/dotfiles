#!/usr/bin/env bash
# Install personal Claude/agent skills via symlinks
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/skills"
DESTINATIONS=(
    "$HOME/.claude/skills"
    "$HOME/.agents/skills"
)

for DEST in "${DESTINATIONS[@]}"; do
    mkdir -p "$DEST"

    for d in "$SRC"/*/; do
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
