# dotfiles

Personal dotfiles for Windows and Linux/macOS.

## Contents

| Program | Description |
|---------|-------------|
| [Alacritty](alacritty/) | Terminal emulator config |
| [WezTerm](wezterm/) | Terminal emulator config |
| [Claude](claude/) | Personal Claude Code skills (`fx*`) and status line |
| [Neovim](nvim/) | Neovim config (lazy.nvim, telescope, neo-tree, dashboard) |
| [Packages](packages.txt) | Package list for quick setup on Linux/WSL |
| [Scripts](scripts/) | Custom utility scripts (Linux/macOS) |
| [Shell](shell/) | Aliases for bash/zsh and PowerShell |

## Alacritty

Configs include: Monokai Charcoal theme, JetBrainsMono Nerd Font, beam cursor, 50k scroll history, Ctrl+Click to open URLs, Ctrl+Shift+N new window, F11 fullscreen.

### Install

**Windows (PowerShell):**

```powershell
git clone https://github.com/fazt/dotfiles.git
cd dotfiles/alacritty
.\install.ps1
```

**Linux/macOS:**

```bash
git clone https://github.com/fazt/dotfiles.git
cd dotfiles/alacritty
bash install.sh
```

## WezTerm

Configs include: Tomorrow Night Bright theme, JetBrainsMono Nerd Font, PowerShell 7, beam cursor, 50k scroll history, 140x30 window.

### Install

**Windows (PowerShell):**

```powershell
cd dotfiles/wezterm
.\install.ps1
```

## Neovim

Neovim config based on [lazy.nvim](https://github.com/folke/lazy.nvim) with telescope, neo-tree, dashboard, lualine, gitsigns and material theme. Leader key is `Space`. See [nvim/README.md](nvim/README.md) for shortcuts and the full plugin list.

### Install

**Windows (PowerShell as Admin):**

```powershell
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\nvim" -Target "$HOME\dotfiles\nvim"
```

**Linux/macOS:**

```bash
ln -s ~/dotfiles/nvim ~/.config/nvim
```

## Claude

Personal [Claude Code](https://claude.com/claude-code) skills (all prefixed with `fx`) plus a two-line status line showing path, git branch, model, context usage and remaining subscription quota, styled to match the oh-my-posh `zash` prompt. See [claude/README.md](claude/README.md) for the full list and install instructions.

```
@fazt ➜ …/Projects/fazt/faztdev git(master ✗)
Opus 5 (1M context) | ctx ████░░░░░░ 42%/1M | left 5h:84% ⟳04:18  7d:97% ⟳jue 02:27
```

| Skill | What it does |
|-------|--------------|
| `fxbrowser` | Tests a feature using chrome-devtools MCP or Playwright |
| `fxbuild` | Runs the build and fixes errors / lint issues |
| `fxquestionme` | Interrogates you about your plan until every ambiguity is resolved |
| `fxstyle` | Blueprint for a Users Management admin page (CRUD table, search, filters, pagination) |
| `fxcommit` | `git status` → stage → version bump (web) → commit → push |
| `fxdocker` | Generates a dev `docker-compose` (checks free ports, no volumes) |
| `fzvideos` | Lists a folder's videos with their duration (ffprobe) and renames them in order (`1.mkv`, `2.mkv`, …) |

## Scripts

Utility scripts for Linux/macOS. Added to `$PATH` on install.

| Script | Description |
|--------|-------------|
| `update` | Update and upgrade system packages (apt, dnf, pacman) |
| `cleanup` | Clean cache, logs, and unused packages |
| `mkproject` | Create a new project with git init |
| `ports` | Show processes listening on ports |
| `extract` | Extract any compressed file (.tar.gz, .zip, .7z, .rar, etc.) |

### Install

```bash
cd dotfiles/scripts
bash install.sh
```

## Packages

A list of common dev packages for quick setup on Linux/WSL (Debian/Ubuntu).

```bash
sudo apt install -y $(cat ~/dotfiles/packages.txt)
```

## Shell Aliases

Shortcuts loaded in every terminal session.

| Alias | Command |
|-------|---------|
| `r` | `ranger` (cd on quit) |
| `cl` | `claude --dangerously-skip-permissions` |
| `cm message` | `git commit -m "message"` |
| `cma message` | `git add -A && git commit -m "message"` |
| `gs` | `git status` |
| `ga` | `git add` |
| `gaa` | `git add -A` |
| `gp` | `git push` |
| `gl` | `git pull` |
| `glog` | `git log --oneline --graph` |
| `nd` | `npm run dev` |
| `ni` | `npm install` |
| `c` | `clear` |
| `..` | `cd ..` |

### Install

**Windows (PowerShell):**

```powershell
cd dotfiles/shell
.\install.ps1
```

**Linux/macOS:**

```bash
cd dotfiles/shell
bash install.sh
```

### Prerequisites

- [Alacritty](https://alacritty.org/) or [WezTerm](https://wezfurlong.org/wezterm/)
- [JetBrainsMono Nerd Font](https://www.nerdfonts.com/font-downloads) — install with `oh-my-posh font install JetBrainsMono`
- [Oh My Posh](https://ohmyposh.dev/) (optional, for prompt theme)
