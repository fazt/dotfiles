// Selector de sesiones que abre ya filtrando, sin tener que pulsar "/".
// Un solo snapshot de la API: el popup arranca en frio y cada proceso extra se nota.
import { execFile, execFileSync, spawn } from "node:child_process";

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

// Nombre legible de cada fila remota, para el aviso al elegirla.
const remoteName = new Map();

// machine es el perfil guardado (herdr machine list) cuando el snapshot viene
// de otra maquina; sin el, las filas son de Local.
function rowsFrom(json, machine) {
  const snap = JSON.parse(json).result.snapshot;
  const labels = new Map(snap.workspaces.map((w) => [w.workspace_id, w.label]));

  // La fila es el tab, no el panel: el nombre que tu le pusiste vive ahi, y es
  // por el que buscas. El titulo que reporta el agente va detras como extra.
  const first = new Map();
  for (const p of snap.panes) if (!first.has(p.tab_id)) first.set(p.tab_id, p);

  // Los ids de tab solo valen dentro de su servidor (el Pi tambien tiene w1:t1),
  // asi que los remotos llevan delante el id del perfil: m:<perfil>:<tab>.
  const prefix = machine ? `m:${machine.id}:` : "";
  const tilde = machine
    ? (s) => s.replace(/^\/home\/[^/]+|^\/root/, "~")
    : (s) => s.replace(process.env.USERPROFILE ?? "", "~");

  // El tab_id viaja en la primera columna y fzf la oculta con --with-nth 2.
  return snap.tabs.map((t) => {
    const [color, glyph] = MARK[t.agent_status] ?? UNKNOWN;
    const wsLabel = labels.get(t.workspace_id) ?? t.workspace_id;
    const ws = machine ? `${machine.label} ${wsLabel}` : wsLabel;
    const pane = first.get(t.tab_id);
    const title = pane ? short(pane.terminal_title_stripped || pane.agent || "") : "";
    const extra = title && title.toLowerCase() !== t.label.toLowerCase() ? title : "";
    const cwd = tilde(pane?.cwd ?? "");
    const tail = [extra, cwd].filter(Boolean).join("  ");
    // En el Pi los tabs se llaman "1"; el titulo de la sesion dice mas.
    if (machine) remoteName.set(prefix + t.tab_id, `${ws} · ${extra || t.label}`);
    return `${prefix}${t.tab_id}\t${color}${glyph}${C.off}  ${C.gray}${pad(ws, 13)}${C.off} ${pad(t.label, 24)} ${C.dim}${tail}${C.off}`;
  });
}

// Los hijos quedan anotados para matarlos si eliges antes de que respondan:
// un SSH al Pi colgado no debe dejar el popup abierto.
const kids = [];
const herdrOut = (args, timeout = 0) =>
  new Promise((ok, fail) => {
    kids.push(
      execFile("herdr", args, { encoding: "utf8", maxBuffer: 16 << 20, timeout }, (err, out) =>
        err ? fail(err) : ok(out),
      ),
    );
  });

// Las maquinas guardadas (el Pi) van por SSH: ~0.8 s cada una contra ~60 ms de
// Local. Se piden en paralelo y sus filas se agregan al final cuando llegan, asi
// que la lista local no las espera. Una maquina caida deja una fila atenuada en
// vez de desaparecer sin explicacion.
async function remoteRows() {
  let machines;
  try {
    machines = JSON.parse(await herdrOut(["machine", "list", "--json"], 3000)).filter((m) => m.enabled);
  } catch {
    return [];
  }
  const each = await Promise.all(
    machines.map((m) =>
      herdrOut(["--machine", m.id, "api", "snapshot"], 8000).then(
        (out) => rowsFrom(out, m),
        () => [`-\t${C.dim}·  ${pad(m.label, 13)} ${pad("sin conexión", 24)}${C.off}`],
      ),
    ),
  );
  return each.flat();
}

const local = herdrOut(["api", "snapshot"]).then((out) => rowsFrom(out));
const remote = remoteRows();

// Para inspeccionar las filas sin abrir fzf: HERDR_GOTO_DRYRUN=1 node goto.mjs
if (process.env.HERDR_GOTO_DRYRUN) {
  const [l, r] = await Promise.all([local, remote]);
  console.log([...l, ...r].join("\n"));
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

// fzf y el snapshot arrancan a la vez, no uno detras del otro: fzf ya esta en
// pantalla aceptando teclas mientras herdr responde, y las filas le llegan por
// stdin en cuanto estan. Con la maquina cargada cada proceso puede tardar casi
// un segundo en arrancar, asi que solaparlos es lo que mas se nota.
const fzf = spawn(
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
  { stdio: ["pipe", "pipe", "inherit"] },
);

// Si se cierra fzf (Esc) antes de que llegue el snapshot, escribir en su stdin
// daria EPIPE; no importa, ya no hay a quien mostrarle nada.
fzf.stdin.on("error", () => {});

// fzf lee en streaming: las filas locales se escriben en cuanto llegan y stdin
// sigue abierto (con el spinner girando) hasta que contestan las remotas.
local.then(
  (rows) => fzf.stdin.write(rows.join("\n") + "\n"),
  (err) => {
    console.error(`herdr api snapshot fallo: ${err.message}`);
    fzf.kill();
    process.exit(1);
  },
);
Promise.all([local, remote]).then(
  ([, rows]) => fzf.stdin.end(rows.length ? rows.join("\n") + "\n" : ""),
  () => {},
);

let picked = "";
fzf.stdout.setEncoding("utf8").on("data", (d) => (picked += d));

fzf.on("close", () => {
  for (const k of kids) k.kill();
  const pick = picked.trim();
  if (!pick) process.exit(0);
  const id = pick.split("\t")[0];
  if (id === "-") process.exit(0);

  // Una sesion de otra maquina no se puede abrir desde aqui: cambiar de maquina
  // es cosa del cliente (sidebar o prefix+w) y ni la API ni la CLI lo exponen;
  // un "tab focus" con --machine solo mueve el foco dentro de ese servidor.
  // Se avisa de donde esta en vez de saltar a otro sitio por error.
  if (id.startsWith("m:")) {
    execFileSync(
      "herdr",
      [
        "notification", "show", remoteName.get(id) ?? id,
        "--body", "Está en otra máquina: pulsa prefix+w, baja hasta ella y Enter.",
        "--position", "top-right",
        "--sound", "none",
      ],
      { stdio: "ignore" },
    );
    process.exit(0);
  }

  // tab focus cambia tambien de espacio si el tab es de otro, asi que no hace
  // falta un workspace focus antes: es un proceso menos tras elegir.
  execFileSync("herdr", ["tab", "focus", id], { stdio: "ignore" });
  process.exit(0);
});
