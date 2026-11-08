// Pane lateral con yazi, a la derecha del pane enfocado. Actua como interruptor:
// si ya hay uno abierto en la misma pestana, lo cierra.
//
// herdr no permite elegir direccion en [[keys.command]] con type = "pane" (ignora
// direction y ratio), asi que el atajo usa type = "shell" y el split se hace aqui.
//
// El pane se renombra con TAG para reconocerlo luego. `pane rename` escribe el
// campo `label`, que es independiente del titulo del terminal: el titulo lo
// sobrescribe el proceso que corre dentro (pwsh, yazi...), el label no.

import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Los valores por defecto de abajo son los de Windows; en Linux/macOS yazi, file y
// la config del pane estan donde los deja install.sh.
const WIN = process.platform === 'win32';

const TAG = 'archivos';
const RATIO = process.env.HERDR_SIDE_RATIO || '0.5';
// Ruta con barras normales a proposito: dentro de un string de JS las barras
// invertidas son escapes (\U, \f...), asi que la ruta se corrompe en silencio y
// pwsh recibe "C:Usersazt...". Windows acepta las barras normales igual.
const CMD = process.env.HERDR_SIDE_CMD || (WIN
  ? `${process.env.LOCALAPPDATA}/Microsoft/WinGet/Packages/sxyazi.yazi_Microsoft.Winget.Source_8wekyb3d8bbwe/yazi-x86_64-pc-windows-msvc/yazi.exe`
  : 'yazi');

// Se llama por nombre, no por la ruta resuelta: el ejecutable vive en un
// directorio con la version dentro (.herdr/packages/standalone/releases/<ver>/)
// y una actualizacion lo dejaria invalido.
const HERDR = process.env.HERDR_BIN || 'herdr';

// Config propia de yazi solo para este pane (ratio = [0, 1, 1], dos columnas).
// Se pasa como variable de entorno al hacer el split, asi que un `yazi` normal
// a pantalla completa conserva sus tres columnas.
const YAZI_CFG = process.env.HERDR_SIDE_YAZI_CONFIG || (WIN
  ? `${process.env.APPDATA}/herdr/yazi-side`
  : join(dirname(fileURLToPath(import.meta.url)), '..', 'yazi-side'));

// yazi necesita el comando `file` para saber el tipo MIME y elegir previsualizador.
// En Windows no lo busca en el PATH: hay que senalarlo con YAZI_FILE_ONE, y sin
// el la columna de vista previa sale vacia con "Cannot find `file`". Git lo trae.
const FILE_ONE = process.env.YAZI_FILE_ONE
  || (WIN ? `${process.env.ProgramFiles}/Git/usr/bin/file.exe` : 'file');

function herdr(...args) {
  const out = execFileSync(HERDR, args, { encoding: 'utf8', windowsHide: true });
  return out.trim() ? JSON.parse(out) : null;
}

const panes = herdr('pane', 'list')?.result?.panes ?? [];

// El pane de referencia: el que herdr inyecta, y si no, el que tiene el foco.
const selfId = process.env.HERDR_PANE_ID;
const base = panes.find((p) => p.pane_id === selfId)
  || panes.find((p) => p.focused)
  || panes[0];
if (!base) {
  console.error('no encuentro ningun pane');
  process.exit(1);
}

// Interruptor: uno por pestana. Si ya hay alguno etiquetado, cerrarlos y salir.
//
// No se excluye el pane que llama: pulsar la tecla estando DENTRO del
// explorador tiene que cerrarlo, no abrir un segundo. Y se cierran todos los
// que haya, no solo el primero, para que un duplicado accidental se limpie.
const abiertos = panes.filter((p) => p.tab_id === base.tab_id && p.label === TAG);
if (abiertos.length > 0) {
  for (const p of abiertos) herdr('pane', 'close', p.pane_id);
  process.exit(0);
}

const cwd = process.env.HERDR_ACTIVE_PANE_CWD || base.cwd || process.cwd();

const res = herdr(
  'pane', 'split', '--pane', base.pane_id,
  '--direction', 'right', '--ratio', RATIO,
  '--cwd', cwd,
  '--env', `YAZI_CONFIG_HOME=${YAZI_CFG}`,
  '--env', `YAZI_FILE_ONE=${FILE_ONE}`,
  '--focus',
);
const paneId = res?.result?.pane?.pane_id;
if (!paneId) {
  console.error('el split no devolvio un pane:', JSON.stringify(res));
  process.exit(1);
}

herdr('pane', 'rename', paneId, TAG);
herdr('pane', 'run', paneId, CMD);
