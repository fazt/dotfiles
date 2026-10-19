#!/bin/bash
# Install Starship prompt config for Linux/macOS
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v starship >/dev/null 2>&1; then
  curl -sS https://starship.rs/install.sh | sh -s -- -y
fi

mkdir -p "$HOME/.config"
cp "$DIR/starship.toml" "$HOME/.config/starship.toml"

SHELL_RC="$HOME/.bashrc"; INIT='eval "$(starship init bash)"'
if [ -f "$HOME/.zshrc" ]; then SHELL_RC="$HOME/.zshrc"; INIT='eval "$(starship init zsh)"'; fi

if ! grep -q "starship init" "$SHELL_RC" 2>/dev/null; then
  printf '\n# Starship prompt\n%s\n' "$INIT" >> "$SHELL_RC"
  echo "Starship init added to $SHELL_RC"
else
  echo "Starship already configured"
fi

echo "Starship installed! Run 'source $SHELL_RC' to apply."
