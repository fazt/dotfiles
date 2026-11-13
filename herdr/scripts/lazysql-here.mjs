// lazysql con la base de datos del proyecto del pane enfocado. Busca, desde la
// raiz del repo (o la carpeta si no es un repo) y hasta tres niveles:
//   - URLs de conexion en archivos .env* (DATABASE_URL, POSTGRES_URL, *_DB_URL...):
//     postgres, mysql, sqlserver y sqlite/file;
//   - archivos SQLite (.db, .sqlite, .sqlite3).
// Una sola se abre directo; con varias se elige con fzf (la ultima fila abre las
// conexiones guardadas de lazysql). Sin ninguna, lazysql abre su selector.
//
// Las bases que no estan en esta maquina (host distinto de localhost) se abren en
// modo solo lectura: mirar produccion no deberia poder romperla. HERDR_LAZYSQL_RW=1
// lo desactiva.
//
// Para ver que haria sin abrir nada:
//   HERDR_LAZYSQL_DRYRUN=1 HERDR_ACTIVE_PANE_CWD=~/projects/trackhome node lazysql-here.mjs

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join, relative, resolve } from 'node:path';

const WIN = process.platform === 'win32';

// El pane hereda el PATH del servidor de herdr, que puede arrancar sin
// ~/.local/bin ni los shims de mise (donde viven lazysql y fzf).
const extra = WIN
  ? [join(process.env.LOCALAPPDATA || '', 'mise', 'shims')]
  : ['.local/bin', '.local/share/mise/shims', '.cargo/bin', 'go/bin'].map((d) => join(homedir(), d));
process.env.PATH = [...extra, process.env.PATH].join(delimiter);

const LAZYSQL = process.env.HERDR_LAZYSQL_CMD || 'lazysql';
const MAX_DEPTH = 3;
const SKIP = new Set(['node_modules', 'vendor', 'target', 'dist', 'build', '.git', '.next', '.venv', 'venv', '__pycache__']);
const DB_FILE = /\.(db|sqlite3?)$/i;
const ENV_FILE = /^\.env(\..+)?$/;
// Claves que suelen llevar la conexion; el valor tiene que tener un esquema conocido.
const ENV_KEY = /(DATABASE|DB|POSTGRES|PG|MYSQL|SQLITE|MSSQL)\w*(URL|URI|DSN)$|^DATABASE$/i;
const SCHEME = /^(postgres(ql)?|mysql|sqlserver|mssql|sqlite3?|file):/i;

const cwd = process.env.HERDR_ACTIVE_PANE_CWD || process.cwd();
const dry = !!process.env.HERDR_LAZYSQL_DRYRUN;

function repoRoot(dir) {
  const r = spawnSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', windowsHide: true });
  return r.status === 0 ? r.stdout.trim() : null;
}

const base = repoRoot(cwd) || cwd;

function walk(dir, depth, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const path = join(dir, e.name);
    if (e.isDirectory()) {
      if (depth < MAX_DEPTH && !SKIP.has(e.name) && (!e.name.startsWith('.') || e.name === '.data')) walk(path, depth + 1, out);
    } else if (e.isFile()) {
      if (ENV_FILE.test(e.name) && !/\.(example|sample|template)$/i.test(e.name)) out.env.push(path);
      else if (DB_FILE.test(e.name)) out.db.push(path);
    }
  }
}

// sqlite:./data/app.db o file:dev.db son relativos a la carpeta del .env.
function sqlitePath(url, from) {
  const p = url.replace(/^(sqlite3?|file):(\/\/)?/i, '').split('?')[0];
  return resolve(from, p);
}

function parseEnv(file) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const found = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][\w]*)\s*=\s*(.*)$/);
    if (!m || !ENV_KEY.test(m[1])) continue;
    const value = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    // ${VAR} sin resolver no es una URL utilizable.
    if (!SCHEME.test(value) || value.includes('${')) continue;
    found.push({ key: m[1], value });
  }
  return found;
}

const isLocal = (url) => {
  if (/^(sqlite3?|file):/i.test(url)) return true;
  try {
    const host = new URL(url).hostname;
    return ['localhost', '127.0.0.1', '::1', ''].includes(host) || host.endsWith('.localhost');
  } catch {
    return false;
  }
};

// Parametros que solo entiende Prisma: Postgres los tomaria como ajustes de sesion
// y rechazaria la conexion ("unrecognized configuration parameter").
const PRISMA_PARAMS = ['schema', 'connection_limit', 'pool_timeout', 'pgbouncer', 'socket_timeout', 'statement_cache_size'];
function stripPrisma(url) {
  const i = url.indexOf('?');
  if (i < 0) return url;
  const q = new URLSearchParams(url.slice(i + 1));
  for (const p of PRISMA_PARAMS) q.delete(p);
  const rest = q.toString();
  return url.slice(0, i) + (rest ? `?${rest}` : '');
}

// Ocultar la contraseña en la lista.
const mask = (url) => url.replace(/(\/\/[^:/@]+:)[^@]*@/, '$1***@');

// Fuera de un repo (como ~/projects), cada repo de debajo se recorre desde su raiz,
// igual que lazygit-here.mjs; asi un .env en apps/api no queda fuera de alcance.
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
    try {
      statSync(join(path, '.git'));
      repos.push(path);
    } catch {
      if (depth < 2) repos.push(...findRepos(path, depth + 1));
    }
  }
  return repos;
}

const files = { env: [], db: [] };
const roots = repoRoot(cwd) ? [base] : [base, ...findRepos(base)];
for (const r of roots) walk(r, 1, files);
files.env = [...new Set(files.env)];
files.db = [...new Set(files.db)];

const targets = [];
const seen = new Set();
const add = (t) => {
  if (seen.has(t.url)) return;
  seen.add(t.url);
  targets.push(t);
};
for (const f of files.env.sort()) {
  for (const { key, value } of parseEnv(f)) {
    const isFile = /^(sqlite3?|file):/i.test(value);
    const url = isFile ? `file:${sqlitePath(value, join(f, '..'))}` : stripPrisma(value);
    add({ url, label: `${key.padEnd(14)} ${relative(base, f)}  ${isFile ? relative(base, url.slice(5)) : mask(value)}` });
  }
}
for (const f of files.db.sort()) {
  try {
    if (statSync(f).size === 0) continue;
  } catch {
    continue;
  }
  add({ url: `file:${f}`, label: `sqlite         ${relative(base, f)}` });
}

const SAVED = 'conexiones guardadas de lazysql';

function pick(rows) {
  const r = spawnSync('fzf', [
    '--layout', 'reverse',
    '--height', '100%',
    '--border', 'none',
    '--padding', '0,1',
    '--prompt', 'lazysql ❯ ',
    '--pointer', '▌',
    '--highlight-line',
    '--info', 'inline-right',
    '--no-multi',
    '--cycle',
    '--color', 'fg:-1,fg+:-1:bold,bg:-1,bg+:-1,gutter:-1,hl:3,hl+:3:bold,prompt:3,pointer:3,info:8',
  ], {
    input: [...rows.map((t) => t.label), SAVED].join('\n'),
    stdio: ['pipe', 'pipe', 'inherit'],
    encoding: 'utf8',
    windowsHide: false,
  });
  if (r.status !== 0) return undefined; // Esc o Ctrl+C: se cierra el pane.
  const choice = r.stdout.trim();
  return choice === SAVED ? null : rows.find((t) => t.label === choice);
}

// lazysql (lib/pq) pide SSL por defecto y un Postgres local o de Docker no lo tiene
// ("pq: SSL is not enabled on the server"). Prisma y los demas no lo exigen, asi que
// los .env no lo dicen: en local se apaga salvo que la URL ya diga sslmode.
function withSslmode(url) {
  if (!/^postgres(ql)?:/i.test(url) || !isLocal(url) || /[?&]sslmode=/.test(url)) return url;
  return url + (url.includes('?') ? '&' : '?') + 'sslmode=disable';
}

function lazysql(target) {
  if (target) target = { ...target, url: withSslmode(target.url) };
  const args = ['-no-telemetry'];
  if (target && !isLocal(target.url) && !process.env.HERDR_LAZYSQL_RW) args.push('-read-only');
  if (target) args.push(target.url);
  if (dry) {
    console.log([LAZYSQL, ...args.map((a) => mask(a))].join(' '));
    process.exit(0);
  }
  const r = spawnSync(LAZYSQL, args, { cwd: base, stdio: 'inherit', windowsHide: false });
  if (r.error) {
    console.error(`No se pudo ejecutar ${LAZYSQL}: ${r.error.message}\nInstálalo con: mise use -g github:jorgerojas26/lazysql`);
    spawnSync(WIN ? 'pause' : 'sh', WIN ? [] : ['-c', 'read -r _'], { stdio: 'inherit', shell: WIN });
  }
  process.exit(r.status ?? 1);
}

if (dry && targets.length > 1) {
  console.log(`${targets.length} bases en ${base} (fzf):\n` + targets.map((t) => '  ' + t.label).join('\n'));
  process.exit(0);
}
if (targets.length === 0) lazysql(null);
if (targets.length === 1) lazysql(targets[0]);
const chosen = pick(targets);
if (chosen === undefined) process.exit(0);
lazysql(chosen);
