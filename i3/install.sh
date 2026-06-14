#!/usr/bin/env bash
# Install i3 config (and i3status, rofi, helper scripts) for Linux.
# Creates symlinks so i3 reads directly from this repo.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$HOME/.config/i3" "$HOME/.config/i3status" "$HOME/.config/rofi" \
         "$HOME/.config/polybar" "$HOME/.local/bin"

ln -sf "$SCRIPT_DIR/config"          "$HOME/.config/i3/config"
ln -sf "$SCRIPT_DIR/i3status.config" "$HOME/.config/i3status/config"
ln -sf "$SCRIPT_DIR/rofi.rasi"       "$HOME/.config/rofi/config.rasi"
ln -sf "$SCRIPT_DIR/polybar.ini"     "$HOME/.config/polybar/config.ini"

for s in screenshot.sh brightness.sh powermenu.sh rename-workspace.sh polybar-vol.sh polybar-launch.sh; do
  ln -sf "$SCRIPT_DIR/bin/$s" "$HOME/.local/bin/$s"
done
chmod +x "$SCRIPT_DIR"/bin/*.sh

echo "i3 config installed (symlinks → $SCRIPT_DIR)."
echo "Reload with: i3-msg reload"
