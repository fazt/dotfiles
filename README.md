# dotfiles

Personal dotfiles for Windows and Linux.

## Contents

| Program | Description |
|---------|-------------|
| [Alacritty](alacritty/) | Terminal emulator config |
| [Scripts](scripts/) | Custom Linux utility scripts |

## Alacritty

Configs include: Monokai Charcoal theme, JetBrainsMono Nerd Font, beam cursor, 50k scroll history, Ctrl+Click to open URLs, Ctrl+Shift+N new window, F11 fullscreen.

### Install

**Windows (PowerShell):**

```powershell
git clone https://github.com/fazt/dotfiles.git
cd dotfiles/alacritty
.\install.ps1
```

**Linux:**

```bash
git clone https://github.com/fazt/dotfiles.git
cd dotfiles/alacritty
bash install.sh
```

## Scripts

Utility scripts for Linux. Added to `$PATH` on install.

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

### Prerequisites

- [Alacritty](https://alacritty.org/)
- [JetBrainsMono Nerd Font](https://www.nerdfonts.com/font-downloads) — install with `oh-my-posh font install JetBrainsMono`
- [Oh My Posh](https://ohmyposh.dev/) (optional, for prompt theme)
