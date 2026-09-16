# herdr

Config for [herdr](https://herdr.dev), the terminal workspace manager for AI coding agents.

Theme `tokyo-night`, PowerShell 7 as the default shell, and a session picker on `Ctrl+P`.

## Ctrl+P session picker

herdr ships a session navigator (`goto`, on `prefix+g`), but it opens in navigation mode —
you have to press `/` before you can type. `scripts/goto.mjs` is a replacement that filters
from the first keystroke, built on fzf:

- One row per tab, searchable by tab name, workspace, agent title and cwd.
- Status dot per row, matching the native sidebar indicator (`●` blocked/working/done, `○` idle, `·` unknown).
- Colors are ANSI indices, never hardcoded hex, so they follow whichever herdr theme is active.
- Picking a row focuses that workspace and tab through the herdr socket API.

Inspect the rows without opening fzf:

```powershell
$env:HERDR_GOTO_DRYRUN=1; node "$env:APPDATA\herdr\scripts\goto.mjs"
```

### Why not a plugin

herdr has a real plugin system, but a `[[keys.command]]` popup plus a script needs no manifest,
no build step and no per-platform packaging. The cost is startup: the popup spawns a process
every time, about 90ms on Windows. A plugin would stay resident and answer instantly.

## Requirements

- [herdr](https://herdr.dev) 0.9+
- Node.js — the picker script
- [fzf](https://github.com/junegunn/fzf) — the picker UI

## Install

**Windows (PowerShell):**

```powershell
git clone https://github.com/fazt/dotfiles.git
cd dotfiles/herdr
.\install.ps1
```

There is no `install.sh` yet. On Linux and macOS the config lives in `~/.config/herdr/`
instead of `%APPDATA%\herdr\`, so the `command` line in `config.toml` needs the Unix path
and `default_shell` needs changing.
