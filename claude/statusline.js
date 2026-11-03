#!/usr/bin/env node
// Claude Code statusline — zash Oh My Posh theme style
//
// Line 1 (zash-style):  account email  ➜  path  git(branch ✗)  [vim mode]
//                       ⇅remote when Remote Control is active
//                       (falls back to @user when the account can't be read)
// Line 2 (claude info): Model | ctx bar N%/size
// Line 3 (5h quota):            | 5h  bar N% + reset time   (omitted if absent)
// Line 4 (7d quota):            | 7d  bar N% + reset time   (omitted if absent)
//
// The three bars mean the same thing: filled = consumed, N% = consumed, and
// color goes green (<60%), orange (>=60%), red (>=80%).

const { spawnSync, spawn } = require('child_process');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

// Correo de la cuenta con la sesion iniciada (p. ej. "fazt@faztweb.com").
// Claude Code no manda la cuenta por stdin: vive en oauthAccount.emailAddress
// de ~/.claude.json (o de $CLAUDE_CONFIG_DIR/.claude.json), que /login
// reescribe al cambiar de cuenta. Ese archivo es grande y la statusline corre
// en cada repintado, asi que el resultado se cachea en disco con la clave
// mtime+size del archivo: si no cambio, solo se hace un stat y se lee el
// cache pequeno. Sin red. Devuelve null si no se puede determinar la cuenta
// (sin archivo, sin login, JSON invalido, correo raro) y quien llama cae al
// usuario del sistema.
//
// ACCOUNT_CACHE_VERSION invalida caches escritos con otra forma (la version
// anterior guardaba solo el dominio): sin esto, un cache viejo con el mismo
// mtime+size se leeria como "sin cuenta".
const ACCOUNT_CACHE_VERSION = 2;

function accountEmail() {
  try {
    const dir  = process.env.CLAUDE_CONFIG_DIR;
    const file = dir ? path.join(dir, '.claude.json')
                     : path.join(os.homedir(), '.claude.json');
    const st = fs.statSync(file);
    const cachePath = path.join(os.tmpdir(), 'claude-statusline-account.json');

    let cache = null;
    try { cache = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch (_) {}
    const sameFile = !!cache && cache.v === ACCOUNT_CACHE_VERSION && cache.file === file;
    if (sameFile && cache.mtimeMs === st.mtimeMs && cache.size === st.size) {
      return cache.email || null;
    }

    let email = null;
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'))?.oauthAccount?.emailAddress;
      // Lista blanca de caracteres: el correo se pinta tal cual en la terminal,
      // asi que no puede arrastrar espacios ni secuencias de escape.
      email = typeof raw === 'string' &&
              /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(raw) ? raw : null;
    } catch (_) {
      // Archivo a medio escribir por Claude Code: conserva el ultimo valor
      // bueno en vez de parpadear.
      return sameFile ? (cache.email || null) : null;
    }

    try {
      fs.writeFileSync(cachePath, JSON.stringify({
        v: ACCOUNT_CACHE_VERSION, file, mtimeMs: st.mtimeMs, size: st.size, email,
      }));
    } catch (_) {}
    return email;
  } catch (_) {
    return null;
  }
}

// ¿Esta sesion esta bajo Remote Control (gobernable desde claude.ai o la app
// movil)? Claude Code NO lo manda por stdin: el payload de la statusline trae
// session_id, model, context_window, rate_limits y poco mas. Pero el registro
// local de sesiones si lo sabe: cuando el puente se activa, Claude Code
// escribe bridgeSessionId en ~/.claude/sessions/<pid>.json, y lo pone en null
// al soltarlo.
//
// El nombre del archivo es el PID de Claude Code, que esta statusline no
// conoce (process.ppid es el proceso intermedio que la lanza, no claude), asi
// que hay que emparejar por sessionId. Para no releer el directorio en cada
// repintado -cada 3 s- se cachea en disco el archivo que resolvio la ultima
// vez y se reintenta ese primero; solo si deja de coincidir se vuelve a
// escanear. Devuelve false ante cualquier duda.
const SESSION_CACHE_VERSION = 1;

function readRecord(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return null; }
}

function isRemoteControlled(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) return false;
  const bridged = rec =>
    !!rec && rec.sessionId === sessionId && typeof rec.bridgeSessionId === 'string'
    && rec.bridgeSessionId.length > 0;
  try {
    const base = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
    const dir  = path.join(base, 'sessions');
    const cachePath = path.join(os.tmpdir(), `claude-statusline-session-${sessionId}.json`);

    let cached = null;
    try { cached = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch (_) {}
    if (cached && cached.v === SESSION_CACHE_VERSION && typeof cached.file === 'string') {
      const rec = readRecord(cached.file);
      if (rec && rec.sessionId === sessionId) return bridged(rec);
    }

    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.json')) continue;
      const file = path.join(dir, name);
      const rec  = readRecord(file);
      if (rec && rec.sessionId === sessionId) {
        try {
          fs.writeFileSync(cachePath, JSON.stringify({ v: SESSION_CACHE_VERSION, file }));
        } catch (_) {}
        return bridged(rec);
      }
    }
  } catch (_) {}
  return false;
}

// Seguro contra procesos huerfanos: si Claude Code aborta el repintado y la
// entrada nunca llega a cerrarse, este node se quedaba esperando para siempre
// (se encontraron 300, algunos de hace un dia). Pintar tarda milisegundos.
setTimeout(() => process.exit(0), 10000).unref();

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(Buffer.concat(chunks).toString()); } catch (_) {}

  // ── ANSI color helpers (truecolor to match zash palette) ─────────────────
  const RESET   = '\x1b[0m';
  const DIM     = '\x1b[2m';
  const WHITE   = '\x1b[97m';
  // zash colors
  const RED     = '\x1b[38;2;227;100;100m';   // #E36464  @username
  const GREEN   = '\x1b[38;2;98;237;139m';    // #62ED8B  ➜ arrow
  const CYAN    = '\x1b[38;2;86;182;194m';    // #56B6C2  path
  const PURPLE  = '\x1b[38;2;212;170;252m';   // #D4AAFC  git branch text
  const GOLD    = '\x1b[38;2;221;177;95m';    // #DDB15F  git( ) wrapper
  const YELLOW  = '\x1b[38;2;220;185;119m';   // #DCB977  dirty marker
  // secondary info colors
  const LGRAY   = '\x1b[38;2;180;180;180m';   // soft gray for model/separators
  const LGREEN  = '\x1b[38;2;98;237;139m';    // ctx ok
  const ORANGE  = '\x1b[38;2;230;170;90m';    // ctx warn
  const CRED    = '\x1b[38;2;235;110;110m';   // ctx danger
  const BLUE    = '\x1b[38;2;110;160;255m';   // #6EA0FF  Remote Control

  // ── Data extraction ───────────────────────────────────────────────────────
  const userName  = process.env.USERNAME || process.env.USER || 'user';
  const cwdRaw    = data?.workspace?.current_dir ?? data?.cwd ?? process.cwd();
  const homedir   = process.env.USERPROFILE || process.env.HOME || '';

  // full-ish path: collapse home to ~, keep the last 3 segments
  let fullPath = (cwdRaw || '').replace(/\\/g, '/');
  const homeNorm = homedir.replace(/\\/g, '/');
  if (homeNorm && fullPath.toLowerCase().startsWith(homeNorm.toLowerCase())) {
    fullPath = '~' + fullPath.slice(homeNorm.length);
  }
  const segs = fullPath.split('/').filter(Boolean);
  const shortPath = segs.length > 3
    ? '…/' + segs.slice(-3).join('/')
    : fullPath;

  const model     = data?.model?.display_name ?? data?.model?.id ?? 'Claude';
  const usedPct   = data?.context_window?.used_percentage;
  const ctxSize   = data?.context_window?.context_window_size;
  const vimMode   = data?.vim?.mode ?? null;
  const rl        = data?.rate_limits;

  // ── Git branch ────────────────────────────────────────────────────────────
  // Claude Code does not send the current branch (workspace.repo.name is the
  // repo name, worktree.branch only exists in --worktree sessions), so ask git.
  function git(args) {
    const r = spawnSync('git', ['-C', cwdRaw, ...args], {
      encoding: 'utf8',
      timeout: 800,
      windowsHide: true,
    });
    if (r.status !== 0 || !r.stdout) return null;
    return r.stdout.trim();
  }

  let branch = data?.worktree?.branch ?? null;
  let dirty  = false;
  if (!branch) {
    branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    if (branch === 'HEAD') {
      const sha = git(['rev-parse', '--short', 'HEAD']);
      branch = sha ? `detached@${sha}` : null;
    }
  }
  if (branch) {
    const status = git(['status', '--porcelain']);
    dirty = !!(status && status.length);
  }
  const wtName = data?.workspace?.git_worktree ?? data?.worktree?.name ?? null;

  // ── Worktrees y ramas olvidadas ───────────────────────────────────────────
  // Los agentes dejan worktrees y ramas sin subir en cada repo que tocan, y es
  // facil olvidar que estan ahi. Dos recuentos, con costes muy distintos:
  //
  //   repo actual  una llamada a `git worktree list`, barata, siempre al dia.
  //   global       lo calcula scripts/git-sweep recorriendo todos los repos,
  //                demasiado lento para una statusline que se repinta cada 3 s,
  //                asi que aqui solo se LEE su cache y, si vencio, se lanza el
  //                barrido en segundo plano (detached) para la proxima vez.
  //
  // Nunca bloquea: si no hay cache todavia, el indicador global no se pinta.
  const SWEEP_TTL_MS  = 10 * 60 * 1000;
  const SWEEP_LOCK_MS = 15 * 60 * 1000;   // > SWEEP_MAX_S: nunca hay dos barridos a la vez
  const SWEEP_MAX_S   = 600;

  function sweepGlobal() {
    const cache = path.join(os.tmpdir(), 'claude-statusline-sweep.json');
    let out = null;
    let fresh = false;
    try {
      const st = fs.statSync(cache);
      out = JSON.parse(fs.readFileSync(cache, 'utf8'));
      fresh = (Date.now() - st.mtimeMs) < SWEEP_TTL_MS;
    } catch { /* sin cache o ilegible: se refresca abajo */ }
    if (fresh) return out;
    // Candado: con refreshInterval=3 este script corre cada 3 s y un barrido tarda
    // minutos en Windows, asi que sin candado se lanzaba uno nuevo en cada repintado
    // mientras la cache seguia vencida (llegaron a ser cientos de bash/git/node vivos
    // y el PC iba lento). Un barrido a la vez, y si falla no se reintenta enseguida.
    const lock = path.join(os.tmpdir(), 'claude-statusline-sweep.lock');
    try {
      if (Date.now() - fs.statSync(lock).mtimeMs < SWEEP_LOCK_MS) return out;
    } catch { /* sin candado: se puede lanzar */ }
    try { fs.writeFileSync(lock, String(process.pid)); } catch { return out; }
    try {
      const script = path.join(os.homedir(), 'dotfiles', 'scripts', 'git-sweep');
      if (fs.existsSync(script)) {
        // escribe a .tmp y renombra, para que un repintado no lea un JSON a medias;
        // `timeout` mata un barrido colgado (un git atascado lo dejaba vivo horas)
        const child = spawn(
          'bash',
          ['-c', `timeout ${SWEEP_MAX_S} "${script}" --json > "${cache}.tmp" 2>/dev/null && mv -f "${cache}.tmp" "${cache}"`],
          { detached: true, stdio: 'ignore', windowsHide: true },
        );
        child.unref();
      }
    } catch { /* sin bash: el indicador global se queda sin pintar */ }
    return out;   // cache vencida, pero mejor un dato viejo que ninguno
  }

  let wtCount = 0;
  if (branch) {
    const wl = git(['worktree', 'list']);
    if (wl) {
      const LF = String.fromCharCode(10);
      const rows = wl.split(LF).filter((x) => x.trim().length > 0);
      wtCount = Math.max(0, rows.length - 1);   // la primera es el repo principal
    }
  }
  const sweep = branch ? sweepGlobal() : null;
  const unpushed = sweep?.unpushed ?? 0;
  const globalWt = sweep?.worktrees ?? 0;

  // ── Line 1: zash-style prompt ─────────────────────────────────────────────
  // Identidad al inicio de la linea: el correo de la cuenta con la sesion
  // iniciada, coloreado por cuenta para distinguirla de un vistazo (dominio
  // desconocido en gris). Sustituye al @usuario del sistema, que en esta
  // maquina siempre es el mismo; solo si no se puede determinar la cuenta se
  // cae a @usuario.
  const ACCOUNT_COLORS = {
    'faztweb.com': '\x1b[38;2;240;140;190m',   // rosa
    'fazt.dev':    '\x1b[38;2;110;160;255m',   // azul
  };
  const acctEmail = accountEmail();
  const userPart = acctEmail
    ? `${ACCOUNT_COLORS[acctEmail.split('@').pop().toLowerCase()] || LGRAY}${acctEmail}${RESET}`
    : `${RED}@${userName}${RESET}`;
  const arrow    = `${GREEN}➜${RESET}`;
  const dirPart  = `${CYAN}${shortPath}${RESET}`;

  let gitPart = '';
  if (branch) {
    const mark = dirty ? ` ${YELLOW}✗${RESET}` : '';
    const wt   = wtName ? `${DIM}:${wtName}${RESET}` : '';
    // ⑂N  worktrees de este repo (N>0);  !N  ramas sin copia en ningun remoto,
    // contando todos los repos: es lo unico irrecuperable si se pierde el disco.
    const wtN  = wtCount > 0 ? ` ${DIM}⑂${wtCount}${RESET}` : '';
    const warn = unpushed > 0 ? ` ${RED}!${unpushed}${RESET}` : '';
    gitPart = ` ${GOLD}git(${RESET}${PURPLE}${branch}${RESET}${wt}${mark}${wtN}${warn}${GOLD})${RESET}`;
  }

  let statusPart = '';
  if (vimMode) {
    const modeColors = {
      'INSERT':      '\x1b[32m',  // green
      'NORMAL':      '\x1b[34m',  // blue
      'VISUAL':      '\x1b[33m',  // yellow
      'VISUAL LINE': '\x1b[33m',
    };
    const mc = modeColors[vimMode] || WHITE;
    statusPart = ` ${mc}[${vimMode}]${RESET}`;
  }

  // Distintivo de Remote Control: si el puente esta activo, esta sesion se puede
  // manejar desde claude.ai o el movil, y conviene verlo sin abrir /config. Se
  // pinta un texto fijo, nunca el bridgeSessionId.
  const rcPart = isRemoteControlled(data?.session_id) ? ` ${BLUE}⇅remote${RESET}` : '';

  const line1 = `${userPart} ${arrow} ${dirPart}${gitPart}${statusPart}${rcPart}`;

  // ── Line 2: Claude info ───────────────────────────────────────────────────
  const sep = ` ${DIM}|${RESET} `;

  const modelPart = `${WHITE}${model}${RESET}`;

  // Barra delgada: tramo lleno con ━ (coloreado) y tramo vacio con ─ (tenue).
  const BAR_WIDTH = 20;   // 5% por celda
  // Etiquetas rellenadas al mismo ancho para que las tres barras arranquen en
  // la misma columna y se comparen de un vistazo.
  const LABEL_W  = 3;     // "ctx", la mas larga ("5h" y "7d" se rellenan)
  const barLabel = s => `${LGRAY}${s.padEnd(LABEL_W)}${RESET}`;
  const clampPct = v => Math.max(0, Math.min(100, Math.round(v)));
  // Color por consumo, comun a las tres barras (lleno = gastado): verde hasta
  // 60%, naranja desde 60% y rojo desde 80%.
  const usageColor = n => n >= 80 ? CRED : n >= 60 ? ORANGE : LGREEN;
  function thinBar(pct, color) {
    const filled = Math.round((clampPct(pct) / 100) * BAR_WIDTH);
    return `${color}${'━'.repeat(filled)}${RESET}${DIM}${'─'.repeat(BAR_WIDTH - filled)}${RESET}`;
  }
  const emptyBar = `${DIM}${'─'.repeat(BAR_WIDTH)}${RESET}`;

  // context usage: barra delgada que se LLENA a medida que se consume
  let ctxPart;
  if (usedPct != null) {
    const n = clampPct(usedPct);
    const color = usageColor(n);
    const sizeLabel = !ctxSize ? '' :
      ctxSize >= 1000000 ? `${+(ctxSize / 1000000).toFixed(1)}M`
                         : `${Math.round(ctxSize / 1000)}k`;
    const size = sizeLabel ? `${DIM}/${sizeLabel}${RESET}` : '';
    ctxPart = `${barLabel('ctx')} ${thinBar(n, color)} ${color}${n}%${RESET}${size}`;
  } else {
    ctxPart = `${barLabel('ctx')} ${emptyBar} ${DIM}-${RESET}`;
  }

  // Hora absoluta del reset, no cuenta regresiva: la status line solo se
  // redibuja cuando llega un mensaje, asi que un "1h51m" se queda viejo
  // mientras la sesion esta quieta, mientras que una hora fija sigue siendo
  // correcta. Se agrega el dia cuando el reset no cae hoy.
  function resetAt(epochSec) {
    if (!epochSec) return '';
    const d = new Date(epochSec * 1000);
    if (Number.isNaN(d.getTime())) return '';

    const hhmm = d.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    });

    const now = new Date();
    const startOfDay = x => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const days = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
    if (days <= 0) return hhmm;
    if (days < 7) {
      const wd = d.toLocaleDateString('es-ES', { weekday: 'short' })
        .replace('.', '').slice(0, 3);
      return `${wd} ${hhmm}`;
    }
    return `${d.getDate()}/${d.getMonth() + 1} ${hhmm}`;
  }

  // Barra de una ventana de cuota de suscripcion. Igual que ctx: lleno =
  // consumido. La barra, el numero y el color salen del mismo porcentaje
  // consumido (used_percentage) y usan los mismos cortes (usageColor). Cada
  // ventana tiene su propia hora de reinicio. rate_limits solo llega a
  // suscriptores Pro/Max y recien despues de la primera respuesta de la API,
  // asi que cada ventana puede faltar por separado: en ese caso devuelve null
  // y esa linea no se dibuja.
  function quotaLine(label, window) {
    if (!window) return null;
    const used = window.used_percentage;
    if (typeof used !== 'number' || !Number.isFinite(used)) return null;
    const n     = clampPct(used);
    const color = usageColor(n);
    const at    = resetAt(window.resets_at);
    const reset = at ? ` ⟳${DIM}${at}${RESET}` : '';
    return `${barLabel(label)} ${thinBar(n, color)} ${color}${n}%${RESET}${reset}`;
  }

  // Una barra por linea: contexto, 5h y 7d. Las de cuota solo se dibujan si su
  // ventana llego; sin rate_limits queda unicamente la de contexto.
  const rows = [
    ctxPart,
    quotaLine('5h', rl?.five_hour),
    quotaLine('7d', rl?.seven_day),
  ].filter(Boolean);

  // El modelo va en la primera fila; en las demas se rellena con el ancho
  // visible del modelo para que el "|" y las barras queden alineados.
  const indent = ' '.repeat([...String(model)].length);
  const lines  = rows.map((row, i) => `${i === 0 ? modelPart : indent}${sep}${row}`);

  process.stdout.write([line1, ...lines].join('\n') + '\n');
});
