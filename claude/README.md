# Claude Code

Personal [Claude Code](https://claude.com/claude-code) skills y la status line.

## Install

Each skill in `skills/` gets linked into both `~/.claude/skills/<name>` and `~/.agents/skills/<name>` so editing the dotfiles repo updates Claude Code and other local agents directly. Los instaladores tambien apuntan el `statusLine` de `~/.claude/settings.json` al [`statusline.js`](statusline.js) de este repo.

**Windows (PowerShell)** — uses symlinks when available and falls back to junctions:

```powershell
cd dotfiles/claude
.\install.ps1
```

**Linux / macOS:**

```bash
cd dotfiles/claude
bash install.sh
```

Both scripts are idempotent — re-running them re-creates the links.

## Status line

[`statusline.js`](statusline.js) dibuja dos lineas al estilo del tema [zash](https://ohmyposh.dev/docs/themes#zash) de oh-my-posh, para que combine con el prompt de la terminal:

```
@fazt ➜ …/Projects/fazt/faztdev git(master ✗)
Opus 5 (1M context) | ctx ████░░░░░░ 42%/1M | left 5h:84% ⟳04:18  7d:97% ⟳jue 02:27
```

| Segmento | De donde sale |
| --- | --- |
| Ruta | `workspace.current_dir`, con `~` colapsado y las ultimas 3 secciones |
| `git(rama)` | `git rev-parse --abbrev-ref HEAD`. La `✗` amarilla marca cambios sin commitear y `detached@sha` el HEAD suelto. Desaparece fuera de un repo |
| Modelo | `model.display_name` |
| `ctx` | `context_window.used_percentage` — barra de 10 bloques, verde `<60%`, naranja `≥60%`, rojo `≥80%`, con el tamaño de la ventana |
| `left 5h` / `7d` | Cuota de suscripcion **restante**, de `rate_limits`, con la hora del reset de cada ventana tras el `⟳` |
| `[INSERT]` | `vim.mode`, solo si el modo vim esta activo |

Ojo con los dos porcentajes, que corren en direcciones opuestas: `ctx` es lo **gastado** (sube mientras trabajas, y ahi rojo = lleno), mientras que `left` es lo que **queda** de la suscripcion (baja mientras trabajas, y ahi rojo = casi sin cuota). Los umbrales de `left` son naranja `≤40%` y rojo `≤15%`.

El reset se muestra como **hora absoluta**, no como cuenta regresiva: `⟳04:18` hoy, `⟳jue 02:27` dentro de la semana, `⟳30/8 02:27` mas alla. Es a proposito — la status line solo se redibuja cuando llega un mensaje, asi que un `1h51m` se queda viejo mientras la sesion esta quieta, mientras que una hora fija sigue siendo correcta sin necesidad de configurar `refreshInterval`.

`rate_limits` solo llega a suscriptores Pro/Max y recien despues de la primera respuesta de la API, y cada ventana puede faltar por separado, asi que el segmento se omite cuando no hay datos. Es lo unico que expone Claude Code sobre la suscripcion: porcentaje y momento de reset, sin conteo de tokens ni mensajes.

La rama **se consulta con `git`** a proposito: Claude Code no la manda en el JSON. `workspace.repo.name` es el nombre del repo, no la rama, y `worktree.branch` solo existe en sesiones `--worktree`.

A diferencia de las skills, la status line no se enlaza: `install-statusline.js` escribe la ruta de este repo en `~/.claude/settings.json`, que queda como unica copia. Ese archivo no se versiona aca porque tambien guarda hooks y credenciales.

```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"C:/Users/fazt/dotfiles/claude/statusline.js\"",
    "refreshInterval": 3
  }
}
```

`refreshInterval` hace falta por la ruta y la rama. Claude Code solo redibuja la status line con ciertos eventos — inicio de sesion, mensaje nuevo del asistente, `/compact`, cambio de modo de permisos, vim mode — y **cambiar de directorio no es uno de ellos**, asi que despues de un `/cd` la ruta se queda vieja hasta el siguiente mensaje. Con el temporizador se pone al dia en 3 segundos. Lo mismo aplica a la `✗` de git, que cambia cuando editas archivos fuera de un turno.

Cuesta ~200 ms por tick (un `node` mas dos `git`). Subir el numero si se nota en un repo grande, donde `git status --porcelain` es la parte cara.

> **Ojo con los backslashes.** Claude Code corre el comando a traves de un shell POSIX (Git Bash en Windows), asi que una ruta como `C:\Users\fazt\...` llega como `Usersfazt...` y el script muere con `MODULE_NOT_FOUND` **sin mostrar ningun error** — la status line simplemente no se dibuja. Siempre forward slashes. Para depurar, correr el comando tal cual con `sh -c '<comando>'`.

Necesita `node` en el `PATH`. Los cambios se ven en la siguiente actualizacion de la status line (cada mensaje nuevo), sin reiniciar la sesion.

## Skills

| Skill | Trigger | What it does |
| --- | --- | --- |
| [`fxbrowser`](skills/fxbrowser/) | testear feature en navegador | Abre el navegador con chrome-devtools MCP o Playwright y prueba la feature |
| [`fxbuild`](skills/fxbuild/) | revisar build | Corre el build hasta que pase y arregla errores de linting |
| [`fxquestionme`](skills/fxquestionme/) | `"question me"` | Te interroga sin parar (una pregunta a la vez) hasta resolver toda ambigüedad sobre tu plan/diseño |
| [`fxstyle`](skills/fxstyle/) | construir admin de usuarios | Blueprint para una página Users Management (CRUD, búsqueda, filtros por columna, paginación, copiar email) |
| [`fxcommit`](skills/fxcommit/) | hacer commit | `git status` → stage → bump de versión si es web → commit con mensaje corto → push |
| [`fxdocker`](skills/fxdocker/) | docker compose de dev | Reglas para `docker-compose` de desarrollo (chequea puerto libre, sin volúmenes) |
| [`fzvideos`](skills/fzvideos/) | listar/renombrar videos | Lista los videos de una carpeta con su duración (ffprobe) y los renombra en orden (`1.mkv`, `2.mkv`, …) |
