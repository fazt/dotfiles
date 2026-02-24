# dotfiles

Personal dotfiles for Windows and Linux.

## Contents

| Program | Description |
|---------|-------------|
| [Alacritty](alacritty/) | Terminal emulator config |

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

### Prerequisites

- [Alacritty](https://alacritty.org/)
- [JetBrainsMono Nerd Font](https://www.nerdfonts.com/font-downloads) — install with `oh-my-posh font install JetBrainsMono`
- [Oh My Posh](https://ohmyposh.dev/) (optional, for prompt theme)
