#!/usr/bin/env bash
# Install WezTerm config for Linux/macOS
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/.wezterm.lua"

cp "$SCRIPT_DIR/wezterm.lua" "$DEST"

echo "WezTerm config installed at $DEST"
