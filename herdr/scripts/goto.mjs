// Selector de sesiones que abre ya filtrando, sin tener que pulsar "/".
// Un solo snapshot de la API: el popup arranca en frio y cada proceso extra se nota.
import { execFileSync, spawnSync } from "node:child_process";

const snap = JSON.parse(execFileSync("herdr", ["api", "snapshot"], { encoding: "utf8" })).result.snapshot;
const labels = new Map(snap.workspaces.map((w) => [w.workspace_id, w.label]));

// Colores por indice ANSI, no por hex: asi los resuelve el tema activo de herdr
// y el popup sigue cuadrando si algun dia cambias de tema.
const C = {
  red: "\x1b[31m",
  amber: "\x1b[33m",
  mint: "\x1b[32m",
  gray: "\x1b[90m",
  dim: "\x1b[2;90m",
  off: "\x1b[0m",
};

// Glifos calcados del indicador nativo de la barra lateral (modo "dots").
const MARK = {
  blocked: [C.red, "●"],
  working: [C.amber, "●"],
  done: [C.mint, "●"],
  idle: [C.gray, "○"],
};
const UNKNOWN = [C.dim, "·"];

const SEP = /[\\/]/;
const pad = (s, n) => (s.length >= n ? s.slice(0, n - 1) + "…" : s + " ".repeat(n - s.length));

// Un panel sin agente reporta la ruta del ejecutable; ahi solo interesa el nombre.
const short = (s) => (SEP.test(s) ? s.split(SEP).pop().replace(/\.exe$/i, "") : s);

// La fila es el tab, no el panel: el nombre que tu le pusiste vive ahi, y es
// por el que buscas. El titulo que reporta el agente va detras como extra.
const first = new Map();
for (const p of snap.panes) if (!first.has(p.tab_id)) first.set(p.tab_id, p);

// El tab_id viaja en la primera columna y fzf la oculta con --with-nth 2.
const rows = snap.tabs.map((t) => {
  const [color, glyph] = MARK[t.agent_status] ?? UNKNOWN;
  const ws = labels.get(t.workspace_id) ?? t.workspace_id;
  const pane = first.get(t.tab_id);
  const title = pane ? short(pane.terminal_title_stripped || pane.agent || "") : "";
  const extra = title && title.toLowerCase() !== t.label.toLowerCase() ? title : "";
  const home = process.env.USERPROFILE ?? "";
  const cwd = (pane?.cwd ?? "").replace(home, "~");
  const tail = [extra, cwd].filter(Boolean).join("  ");
  return `${t.tab_id}\t${color}${glyph}${C.off}  ${C.gray}${pad(ws, 13)}${C.off} ${pad(t.label, 24)} ${C.dim}${tail}${C.off}`;
});

// Para inspeccionar las filas sin abrir fzf: HERDR_GOTO_DRYRUN=1 node goto.mjs
if (process.env.HERDR_GOTO_DRYRUN) {
  console.log(rows.join("\n"));
  process.exit(0);
}

// La fila activa no pinta fondo. El tema de herdr colorea su UI con tokens
// propios (active_row_bg, selection_bg) que no llegan al panel, asi que
// cualquier fondo que eligieramos aqui desentonaria con el tema. Se marca
// con el cursor en color de acento y el texto en negrita, que no chocan.
const colors = [
  "fg:-1", "fg+:-1:bold", "bg:-1", "bg+:-1", "gutter:-1",
  "hl:3", "hl+:3:bold",
  "border:8", "label:3",
  "prompt:3", "pointer:3", "marker:3", "info:8", "spinner:3",
].join(",");

const fzf = spawnSync(
  "fzf",
  [
    "--ansi",
    "--delimiter", "\t",
    "--with-nth", "2",
    "--layout", "reverse",
    "--height", "100%",
    // Sin marco propio: el popup de herdr ya dibuja uno y dos marcos anidados cargan la vista.
    "--border", "none",
    "--padding", "0,1",
    "--prompt", "❯ ",
    "--pointer", "▌",
    "--marker", "▌",
    "--highlight-line",
    "--info", "inline-right",
    "--no-multi",
    "--cycle",
    "--scrollbar", "│",
    "--color", colors,
  ],
  { input: rows.join("\n"), stdio: ["pipe", "pipe", "inherit"], encoding: "utf8" },
);

const pick = (fzf.stdout || "").trim();
if (!pick) process.exit(0);

const tab = pick.split("\t")[0];
execFileSync("herdr", ["workspace", "focus", tab.split(":")[0]], { stdio: "ignore" });
execFileSync("herdr", ["tab", "focus", tab], { stdio: "ignore" });
