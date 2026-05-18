# Claude Code

Personal [Claude Code](https://claude.com/claude-code) skills.

## Install (Windows / PowerShell)

Skills live at `~/.claude/skills/<name>/SKILL.md`. Copy them into place:

```powershell
Copy-Item -Recurse -Force $HOME\dotfiles\claude\skills\* $HOME\.claude\skills\
```

Or symlink each one (requires Developer Mode or admin):

```powershell
Get-ChildItem $HOME\dotfiles\claude\skills | ForEach-Object {
  New-Item -ItemType SymbolicLink `
    -Path "$HOME\.claude\skills\$($_.Name)" `
    -Target $_.FullName
}
```

## Install (Linux / macOS)

```bash
ln -sf ~/dotfiles/claude/skills/* ~/.claude/skills/
```

## Skills

| Skill | Trigger | What it does |
| --- | --- | --- |
| [`fx-browser`](skills/fx-browser/) | testear feature en navegador | Abre el navegador con chrome-devtools MCP o Playwright y prueba la feature |
| [`fx-build`](skills/fx-build/) | revisar build | Corre el build hasta que pase y arregla errores de linting |
| [`fx-question-me`](skills/fx-question-me/) | `"question me"` | Te interroga sin parar (una pregunta a la vez) hasta resolver toda ambigüedad sobre tu plan/diseño |
| [`fx-style`](skills/fx-style/) | construir admin de usuarios | Blueprint para una página Users Management (CRUD, búsqueda, filtros por columna, paginación, copiar email) |
| [`fxcommit`](skills/fxcommit/) | hacer commit | `git status` → stage → bump de versión si es web → commit con mensaje corto → push |
| [`fxdocker`](skills/fxdocker/) | docker compose de dev | Reglas para `docker-compose` de desarrollo (chequea puerto libre, sin volúmenes) |
