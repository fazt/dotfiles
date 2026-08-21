#!/usr/bin/env node
// Apunta el statusLine de Claude Code a este repo de dotfiles.
//
// Se llama desde install.ps1 / install.sh. Parchea unicamente la clave
// "statusLine" de ~/.claude/settings.json y deja el resto del archivo intacto,
// porque ese archivo tambien guarda hooks y credenciales que no viven aqui.
const fs = require('fs');
const path = require('path');
const os = require('os');

const script = path.join(__dirname, 'statusline.js').split(path.sep).join('/');
const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');

// Forward slashes a proposito: Claude Code ejecuta el comando a traves de un
// shell POSIX (Git Bash en Windows), que se come los backslashes de una ruta
// tipo C:\Users\... y hace fallar el script en silencio.
const command = `node "${script}"`;

let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (err) {
    console.error(`No pude parsear ${settingsPath}: ${err.message}`);
    console.error('Arreglalo o agrega el statusLine a mano:');
    console.error(`  "statusLine": { "type": "command", "command": ${JSON.stringify(command)} }`);
    process.exit(1);
  }
} else {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
}

// refreshInterval re-corre el script por temporizador ademas de los eventos.
// Sin esto la ruta se queda vieja tras un `/cd`, porque cambiar de directorio
// no es uno de los eventos que redibujan la status line.
settings.statusLine = { type: 'command', command, refreshInterval: 3 };
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
console.log(`statusLine -> ${command}`);
