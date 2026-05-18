#!/usr/bin/env bash
# Install personal Claude Code skills via symlinks
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/skills"
DEST="$HOME/.claude/skills"

mkdir -p "$DEST"

for d in "$SRC"/*/; do
    name="$(basename "$d")"
    link="$DEST/$name"
    if [ -e "$link" ] || [ -L "$link" ]; then
        rm -rf "$link"
    fi
    ln -s "$d" "$link"
    echo "Linked $name -> $d"
done

echo "Claude skills installed!"
