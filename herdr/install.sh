#!/usr/bin/env bash
# Install herdr config for Linux/macOS
#
# config.toml es la version de Windows. Aqui se genera la de Unix a partir de
# ella, para no mantener dos copias: cambia el shell, apunta cada script a
# $DEST/scripts con la ruta absoluta de node y lanza lazygit desde el PATH.
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/herdr"

# zsh si esta instalado; si no, el shell del usuario. HERDR_SHELL lo fuerza.
SHELL_BIN="${HERDR_SHELL:-$(command -v zsh || echo "${SHELL:-/bin/bash}")}"

# Ruta absoluta de node: el popup usa el PATH del servidor de herdr, que puede
# no incluir node si viene de mise, nvm o ~/.local/bin.
NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  echo "Falta node en el PATH: hace falta para generar la config y para los atajos." >&2
  exit 1
fi

mkdir -p "$DEST/scripts" "$DEST/yazi-side"
cp "$DIR"/scripts/*.mjs "$DEST/scripts/"
cp "$DIR"/yazi-side/* "$DEST/yazi-side/"

# Las rutas de Windows llevan barras invertidas y %VARIABLES%: con sed habria
# que escaparlas dos veces, asi que la transformacion va en node.
"$NODE_BIN" - "$DIR/config.toml" "$DEST" "$SHELL_BIN" "$NODE_BIN" >"$DEST/config.toml" <<'JS'
const fs = require("fs");
const [src, dest, shell, node] = process.argv.slice(2);
const q = (s) => `'${s}'`;
let out = fs.readFileSync(src, "utf8").replace(/\r\n/g, "\n");
out = out.replace(/^default_shell = .*$/m, `default_shell = ${q(shell)}`);
// node "%APPDATA%\herdr\scripts\X.mjs" -> /ruta/a/node "$DEST/scripts/X.mjs"
out = out.replace(/^command = 'node "%APPDATA%\\herdr\\scripts\\([\w.-]+\.mjs)"'$/gm,
  (_, f) => `command = ${q(`${node} "${dest}/scripts/${f}"`)}`);
// lazygit: en Windows va por cmd con la ruta de winget; aqui, por el PATH.
out = out.replace(/^command = 'cd \/d "%HERDR_ACTIVE_PANE_CWD%" && .*lazygit\.exe"'$/m,
  `command = ${q('cd "$HERDR_ACTIVE_PANE_CWD" && lazygit')}`);
out = out.replace(/^# El comando pasa por cmd\.exe.*$/m, "# Ruta generada por install.sh para esta maquina.");
// Lo que siga teniendo rutas de Windows quedaria roto en silencio: mejor fallar.
const left = out.split("\n").filter((l) => /^command = .*(%[A-Z_]+%|cmd |\\)/.test(l));
if (left.length) {
  console.error("Comandos de Windows sin traducir en config.toml:\n" + left.join("\n"));
  process.exit(1);
}
process.stdout.write(out);
JS

# El servidor lee config.toml en caliente; si no corre, no pasa nada.
herdr server reload-config >/dev/null 2>&1 || true

echo "herdr config installed in $DEST (shell: $SHELL_BIN)"
for bin in fzf nvim lazygit yazi; do
  command -v "$bin" >/dev/null 2>&1 || echo "Falta $bin en el PATH: su atajo no funcionara."
done
