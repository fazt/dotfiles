#!/bin/bash
# Install shell aliases
set -e

SHELL_DIR="$(cd "$(dirname "$0")" && pwd)"
ALIASES_FILE="$SHELL_DIR/aliases.sh"

# Detect shell config
SHELL_RC="$HOME/.bashrc"
[ -f "$HOME/.zshrc" ] && SHELL_RC="$HOME/.zshrc"

if ! grep -q "aliases.sh" "$SHELL_RC" 2>/dev/null; then
  echo "" >> "$SHELL_RC"
  echo "# Dotfiles aliases" >> "$SHELL_RC"
  echo "source \"$ALIASES_FILE\"" >> "$SHELL_RC"
  echo "Aliases added to $SHELL_RC"
else
  echo "Aliases already configured"
fi

echo "Shell aliases installed! Run 'source $SHELL_RC' to apply."
