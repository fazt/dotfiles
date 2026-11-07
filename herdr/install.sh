#!/usr/bin/env bash
# Install herdr config for Linux/macOS
#
# config.toml es la version de Windows. Aqui se genera la de Unix a partir de
# ella, cambiando solo el shell y la ruta del selector, para no mantener dos copias.
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/herdr"

# zsh si esta instalado; si no, el shell del usuario. HERDR_SHELL lo fuerza.
SHELL_BIN="${HERDR_SHELL:-$(command -v zsh || echo "${SHELL:-/bin/bash}")}"

# Ruta absoluta de node: el popup usa el PATH del servidor de herdr, que puede
# no incluir node si viene de mise, nvm o ~/.local/bin.
NODE_BIN="$(command -v node || echo node)"

mkdir -p "$DEST/scripts"
cp "$DIR/scripts/goto.mjs" "$DEST/scripts/goto.mjs"

sed \
  -e "s|^default_shell = .*|default_shell = '$SHELL_BIN'|" \
  -e "s|^command = 'node .*goto.mjs.*'|command = '$NODE_BIN \"$DEST/scripts/goto.mjs\"'|" \
  -e "s|^# El comando pasa por cmd.exe.*|# Ruta generada por install.sh para esta maquina.|" \
  "$DIR/config.toml" > "$DEST/config.toml"

# El servidor lee config.toml en caliente; si no corre, no pasa nada.
herdr server reload-config >/dev/null 2>&1 || true

echo "herdr config installed in $DEST (shell: $SHELL_BIN)"
for bin in node fzf; do
  command -v "$bin" >/dev/null 2>&1 || echo "Falta $bin en el PATH: Ctrl+P no funcionara sin el."
done
