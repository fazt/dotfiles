// lazygit en la carpeta del pane enfocado. Si esa carpeta no esta dentro de un
// repo pero contiene repos (como ~/projects/fazt, con faztdev-platform,
// faztdev-api...), los busca hasta dos niveles: uno solo se abre directo y con
// varios se elige con fzf. Sin ninguno, lazygit se abre ahi y da su aviso de
// siempre.
//
// Para ver que haria sin abrir nada:
//   HERDR_LAZYGIT_DRYRUN=1 HERDR_ACTIVE_PANE_CWD=~/projects/fazt node lazygit-here.mjs

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join, relative } from 'node:path';

const WIN = process.platform === 'win32';

// El pane hereda el PATH del servidor de herdr, que en Linux puede arrancar sin
// ~/.local/bin ni los shims de mise (donde viven lazygit y fzf).
if (!WIN) {
  const extra = ['.local/bin', '.local/share/mise/shims', '.cargo/bin'].map((d) => join(homedir(), d));
  process.env.PATH = [...extra, process.env.PATH].join(delimiter);
}

// En Windows, la ruta de winget: el servidor de herdr arranco antes de instalar
// lazygit y su PATH no lo incluye. Si no esta ahi, se prueba por el PATH.
const WINGET = `${process.env.LOCALAPPDATA}/Microsoft/WinGet/Packages/JesseDuffield.lazygit_Microsoft.Winget.Source_8wekyb3d8bbwe/lazygit.exe`;
const LAZYGIT = process.env.HERDR_LAZYGIT_CMD || (WIN && existsSync(WINGET) ? WINGET : 'lazygit');

const MAX_DEPTH = 2;
// Carpetas que nunca son un proyecto propio y que pueden ser enormes.
const SKIP = new Set(['node_modules', 'vendor', 'target', 'dist', 'build']);

const cwd = process.env.HERDR_ACTIVE_PANE_CWD || process.cwd();
const dry = !!process.env.HERDR_LAZYGIT_DRYRUN;

function repoRoot(dir) {
  const r = spawnSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', windowsHide: true });
  return r.status === 0 ? r.stdout.trim() : null;
}

// .git puede ser carpeta (repo normal) o archivo (worktree o submodulo).
// Al encontrar un repo no se baja dentro: sus subcarpetas son suyas.
function findRepos(dir, depth = 1) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const repos = [];
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const path = join(dir, e.name);
    if (existsSync(join(path, '.git'))) repos.push(path);
    else if (depth < MAX_DEPTH) repos.push(...findRepos(path, depth + 1));
  }
  return repos.sort();
}

function pick(repos) {
  const r = spawnSync('fzf', [
    '--layout', 'reverse',
    '--height', '100%',
    '--border', 'none',
    '--padding', '0,1',
    '--prompt', 'lazygit ❯ ',
    '--pointer', '▌',
    '--highlight-line',
    '--info', 'inline-right',
    '--no-multi',
    '--cycle',
    '--color', 'fg:-1,fg+:-1:bold,bg:-1,bg+:-1,gutter:-1,hl:3,hl+:3:bold,prompt:3,pointer:3,info:8',
  ], {
    input: repos.map((p) => relative(cwd, p)).join('\n'),
    stdio: ['pipe', 'pipe', 'inherit'],
    encoding: 'utf8',
    windowsHide: false,
  });
  // Esc o Ctrl+C: no se abre nada y el pane se cierra.
  const choice = r.status === 0 ? r.stdout.trim() : '';
  return choice ? join(cwd, choice) : null;
}

function lazygit(args) {
  if (dry) {
    console.log([LAZYGIT, ...args].join(' '));
    process.exit(0);
  }
  const r = spawnSync(LAZYGIT, args, { cwd, stdio: 'inherit', windowsHide: false });
  process.exit(r.status ?? 1);
}

const root = repoRoot(cwd);
if (root) lazygit(['-p', root]);

const repos = findRepos(cwd);
if (dry && repos.length > 1) {
  console.log(`${repos.length} repos (fzf):\n` + repos.map((p) => '  ' + relative(cwd, p)).join('\n'));
  process.exit(0);
}
if (repos.length === 1) lazygit(['-p', repos[0]]);
if (repos.length > 1) {
  const chosen = pick(repos);
  if (chosen) lazygit(['-p', chosen]);
  process.exit(0);
}
// Ningun repo: lazygit en la carpeta, con su aviso de siempre.
lazygit([]);
