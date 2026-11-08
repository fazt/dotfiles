# herdr

Config for [herdr](https://herdr.dev), the terminal workspace manager for AI coding agents.

Theme `plomo` (a monochrome graphite built on `vesper`), PowerShell 7 as the default shell on
Windows (zsh on Linux/macOS), a session picker on `Ctrl+P`, and shortcuts for nvim, lazygit and a
side file explorer.

`config.toml` is the Windows version. On Linux/macOS, `install.sh` generates the local one from it:
it swaps the shell, points every script at `~/.config/herdr/scripts` and runs `lazygit` from the
`PATH`, so there is a single copy to maintain.

## Shortcuts

| Key | Does |
| --- | --- |
| `Ctrl+P` | session picker (see below) |
| `prefix+g` | herdr's native navigator |
| `prefix+Shift+E` | nvim in the focused pane's directory; in a Claude pane, in the project of the last file it edited (`scripts/nvim-here.mjs`) |
| `prefix+Shift+L` | lazygit in the focused pane's directory |
| `prefix+Shift+F` | file explorer (yazi) in a pane on the right |
| `prefix+Shift+G` / `prefix+Alt+G` / `prefix+Alt+D` | new / open / remove worktree |

## Side file explorer (`prefix+Shift+F`)

One per tab, and the same key closes it — `scripts/side-files.mjs` tags the pane it creates
with `pane rename` and closes every tagged pane in the tab before opening a new one, so
pressing the key from inside the explorer closes it instead of spawning a second.

It needs a script because `[[keys.command]]` with `type = "pane"` ignores `direction` and
`ratio` (the validator says `unknown config key`), so there is no way to ask for a pane on
the right from the config alone. The binding is `type = "shell"` and the script does the
`pane split --direction right --ratio 0.5` itself.

`yazi-side/yazi.toml` is passed as `YAZI_CONFIG_HOME` so the side pane runs two columns
(`[mgr] ratio = [0, 1, 1]`, no parent column) while a full-screen `yazi` keeps its three.
Override with `HERDR_SIDE_RATIO`, `HERDR_SIDE_CMD` or `HERDR_SIDE_YAZI_CONFIG`.

Detection goes by the pane `label` that `pane rename` sets, not the terminal title: the
title is overwritten by whatever runs inside the pane.

## Ctrl+P session picker

herdr ships a session navigator (`goto`, on `prefix+g`), but it opens in navigation mode —
you have to press `/` before you can type. `scripts/goto.mjs` is a replacement that filters
from the first keystroke, built on fzf:

- One row per tab, searchable by tab name, workspace, agent title and cwd.
- Status dot per row, matching the native sidebar indicator (`●` blocked/working/done, `○` idle, `·` unknown).
- Colors are ANSI indices, never hardcoded hex, so they follow whichever herdr theme is active.
- Picking a row runs `herdr tab focus`, which also switches workspace when needed.
- fzf and the snapshot start in parallel, so the picker is on screen while herdr answers.
- Sessions on saved SSH machines (`herdr machine list`, e.g. the Raspberry Pi) are listed
  too, prefixed with the machine label. They arrive ~1 s later over SSH and are appended
  without holding up the local rows; an unreachable machine shows a dimmed "sin conexión" row.
- Picking a remote row **cannot jump there**: switching machines is a client-side action
  (sidebar click or `prefix+w`) that neither the API nor the CLI exposes, and
  `--machine … tab focus` only moves focus inside that server. It shows a notification
  saying where the session lives instead. (`%LOCALAPPDATA%\herdr\client\endpoint-selection.json`
  looks like a selector but is persistence only: the running client ignores edits to it.)

Inspect the rows without opening fzf:

```powershell
$env:HERDR_GOTO_DRYRUN=1; node "$env:APPDATA\herdr\scripts\goto.mjs"
```

```bash
HERDR_GOTO_DRYRUN=1 node ~/.config/herdr/scripts/goto.mjs
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

**Linux/macOS:**

```bash
cd dotfiles/herdr
bash install.sh
```

`config.toml` is the Windows version. `install.sh` writes a Unix copy to `~/.config/herdr/`
with two lines changed: `default_shell` becomes zsh (or your `$SHELL` if zsh is missing;
override with `HERDR_SHELL=/bin/bash bash install.sh`) and the `Ctrl+P` command points to
`~/.config/herdr/scripts/goto.mjs`. Edit `config.toml` here and rerun the installer.
