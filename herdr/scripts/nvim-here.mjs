// nvim en la carpeta donde se esta trabajando. En un pane normal es la carpeta del
// pane. En uno de Claude, la raiz del repo del ultimo archivo que Claude edito: su
// carpeta no cambia al trabajar en otro proyecto, asi que herdr no la conoce.
//
// Es una deduccion: lo que Claude cambia con un comando o solo lee no queda como
// edicion en su historial. Sin ediciones utiles se usa la carpeta del pane.
//
// Para ver que carpeta elige sin abrir nvim:
//   $env:HERDR_NVIM_DRYRUN=1; $env:HERDR_ACTIVE_PANE_ID='w4:p4'; node nvim-here.mjs

import { execFileSync, spawnSync } from 'node:child_process';
import { closeSync, existsSync, openSync, readdirSync, readSync, statSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative } from 'node:path';

const HERDR = process.env.HERDR_BIN_PATH || 'herdr';
const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
const EDIT_TOOLS = new Set(['Write', 'Edit', 'NotebookEdit']);
// Suficiente para llegar a una edicion sin cargar en memoria un historial enorme.
const MAX_TAIL = 64 * 1024 * 1024;

// Temporales y memoria de Claude: se editan en cualquier proyecto y no dicen nada
// sobre cual es el que se esta trabajando.
const IGNORED = [tmpdir(), CLAUDE_DIR];

function isInside(parent, path) {
  const rel = relative(parent, path);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

function claudeSessionId(paneId) {
  const out = execFileSync(HERDR, ['pane', 'get', paneId], {
    encoding: 'utf8',
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const session = JSON.parse(out)?.result?.pane?.agent_session;
  return session?.agent === 'claude' && session.kind === 'id' ? session.value : null;
}

function findTranscript(sessionId) {
  const projects = join(CLAUDE_DIR, 'projects');
  for (const project of readdirSync(projects)) {
    const file = join(projects, project, `${sessionId}.jsonl`);
    if (existsSync(file)) return file;
  }
  return null;
}

function readTail(file) {
  const { size } = statSync(file);
  const length = Math.min(size, MAX_TAIL);
  const buffer = Buffer.alloc(length);
  const fd = openSync(file, 'r');
  readSync(fd, buffer, 0, length, size - length);
  closeSync(fd);
  return buffer.toString('utf8');
}

function lastEditedPath(transcript) {
  const lines = readTail(transcript).split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].includes('_path"')) continue;
    let entry;
    try {
      entry = JSON.parse(lines[i]);
    } catch {
      continue; // la primera linea del trozo leido suele venir cortada
    }
    const blocks = entry.message?.content;
    if (!Array.isArray(blocks)) continue;
    for (const block of blocks.toReversed()) {
      if (block.type !== 'tool_use' || !EDIT_TOOLS.has(block.name)) continue;
      const path = block.input?.file_path || block.input?.notebook_path;
      if (!path || IGNORED.some((dir) => isInside(dir, path))) continue;
      if (existsSync(dirname(path))) return path;
    }
  }
  return null;
}

function projectRoot(path) {
  const start = dirname(path);
  for (let dir = start; ; dir = dirname(dir)) {
    if (existsSync(join(dir, '.git'))) return dir;
    if (dirname(dir) === dir) return start;
  }
}

function claudeWorkDir(paneId) {
  const sessionId = paneId && claudeSessionId(paneId);
  const transcript = sessionId && findTranscript(sessionId);
  const path = transcript && lastEditedPath(transcript);
  return path ? projectRoot(path) : null;
}

let cwd = null;
try {
  cwd = claudeWorkDir(process.env.HERDR_ACTIVE_PANE_ID);
} catch {
  // Sin datos de Claude el atajo tiene que seguir abriendo nvim.
}
cwd ||= process.env.HERDR_ACTIVE_PANE_CWD || process.cwd();

if (process.env.HERDR_NVIM_DRYRUN) {
  console.log(cwd);
} else {
  // Sin argumentos: "nvim ." abriria el explorador en vez de la pantalla de inicio.
  const result = spawnSync('nvim', [], { cwd, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status ?? 1;
}
