# Claude Code

Personal [Claude Code](https://claude.com/claude-code) skills.

## Install

Each skill in `skills/` gets linked into both `~/.claude/skills/<name>` and `~/.agents/skills/<name>` so editing the dotfiles repo updates Claude Code and other local agents directly.

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
