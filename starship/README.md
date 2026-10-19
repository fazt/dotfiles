# Starship

Prompt multiplataforma en Rust. Un solo `starship.toml` para zsh (Linux) y PowerShell (Windows).

Es el prompt más rápido de las opciones habituales (Oh My Posh, Oh My Zsh). El tema replica el
estilo `robbyrussell` de Oh My Zsh: `➜  carpeta git:(rama) ✗` (flecha verde/roja según el último
comando, `✗` amarillo si hay cambios). Hay presets powerline con `starship preset --list`.

## Instalación

**Windows (PowerShell):**

```powershell
cd dotfiles/starship
.\install.ps1
```

**Linux / macOS:**

```bash
cd dotfiles/starship
./install.sh
```

Instala starship si falta, copia la config a `~/.config/starship.toml` y añade el init al perfil
(`$PROFILE` en PowerShell, `.zshrc` / `.bashrc` en Linux).

## Requisitos

- Una [Nerd Font](https://www.nerdfonts.com/) en la terminal (ver `wezterm/README.md`)

## Rendimiento

En Windows el cuello de botella suele ser el arranque de PowerShell, no el prompt. Evita `posh-git`
y `Terminal-Icons` si notas lentitud al abrir la terminal.
