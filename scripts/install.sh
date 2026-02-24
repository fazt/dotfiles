#!/bin/bash
# Install scripts: make executable and add to PATH
set -e

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

chmod +x "$SCRIPTS_DIR/update"
chmod +x "$SCRIPTS_DIR/cleanup"
chmod +x "$SCRIPTS_DIR/mkproject"
chmod +x "$SCRIPTS_DIR/ports"
chmod +x "$SCRIPTS_DIR/extract"

# Add to PATH in .bashrc if not already present
SHELL_RC="$HOME/.bashrc"
[ -f "$HOME/.zshrc" ] && SHELL_RC="$HOME/.zshrc"

if ! grep -q "$SCRIPTS_DIR" "$SHELL_RC" 2>/dev/null; then
  echo "" >> "$SHELL_RC"
  echo "# Dotfiles scripts" >> "$SHELL_RC"
  echo "export PATH=\"$SCRIPTS_DIR:\$PATH\"" >> "$SHELL_RC"
  echo "Added scripts to PATH in $SHELL_RC"
else
  echo "Scripts already in PATH"
fi

echo "Scripts installed!"
