#!/usr/bin/env node
// Claude Code statusline — zash Oh My Posh theme style
//
// Line 1 (zash-style):  @user  ➜  path  git(branch ✗)  [vim mode]
// Line 2 (claude info): Model | ctx N% (bar) | rate limits

const { spawnSync } = require('child_process');

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

  // ── Line 1: zash-style prompt ─────────────────────────────────────────────
  const userPart = `${RED}@${userName}${RESET}`;
  const arrow    = `${GREEN}➜${RESET}`;
  const dirPart  = `${CYAN}${shortPath}${RESET}`;

  let gitPart = '';
  if (branch) {
    const mark = dirty ? ` ${YELLOW}✗${RESET}` : '';
    const wt   = wtName ? `${DIM}:${wtName}${RESET}` : '';
    gitPart = ` ${GOLD}git(${RESET}${PURPLE}${branch}${RESET}${wt}${mark}${GOLD})${RESET}`;
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

  const line1 = `${userPart} ${arrow} ${dirPart}${gitPart}${statusPart}`;

  // ── Line 2: Claude info ───────────────────────────────────────────────────
  const sep = ` ${DIM}|${RESET} `;

  const modelPart = `${WHITE}${model}${RESET}`;

  // context usage: percentage + small bar, colored by threshold
  let ctxPart;
  if (usedPct != null) {
    const n = Math.max(0, Math.min(100, Math.round(usedPct)));
    const color = n >= 80 ? CRED : n >= 60 ? ORANGE : LGREEN;
    const width = 10;
    const filled = Math.round((n / 100) * width);
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
    const sizeLabel = !ctxSize ? '' :
      ctxSize >= 1000000 ? `${+(ctxSize / 1000000).toFixed(1)}M`
                         : `${Math.round(ctxSize / 1000)}k`;
    const size = sizeLabel ? `${DIM}/${sizeLabel}${RESET}` : '';
    ctxPart = `${LGRAY}ctx${RESET} ${color}${bar}${RESET} ${color}${n}%${RESET}${size}`;
  } else {
    ctxPart = `${LGRAY}ctx${RESET} ${DIM}-${RESET}`;
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

  // Cuota de suscripcion restante. rate_limits solo llega a suscriptores
  // Pro/Max y recien despues de la primera respuesta de la API, asi que cada
  // ventana puede faltar por separado.
  function quota(label, window) {
    if (!window) return null;
    const used = window.used_percentage;
    if (used == null) return null;
    const left  = Math.max(0, Math.min(100, Math.round(100 - used)));
    // Poco disponible = alerta, al reves que el contexto.
    const color = left <= 15 ? CRED : left <= 40 ? ORANGE : LGREEN;
    const at    = resetAt(window.resets_at);
    const reset = at ? ` ⟳${DIM}${at}${RESET}` : '';
    return `${label}:${color}${left}%${RESET}${reset}`;
  }

  let ratePart = '';
  if (rl) {
    const parts = [
      quota('5h', rl.five_hour),
      quota('7d', rl.seven_day),
    ].filter(Boolean);
    // "left" evita que se lea como porcentaje consumido.
    if (parts.length) ratePart = `${LGRAY}left${RESET} ` + parts.join('  ');
  }

  const line2Parts = [modelPart, ctxPart];
  if (ratePart) line2Parts.push(ratePart);
  const line2 = line2Parts.join(sep);

  process.stdout.write(line1 + '\n' + line2 + '\n');
});
