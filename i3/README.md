# i3

i3 tiling window manager setup (X11) — dark theme matching Orchis-Dark.

## Contents

| File | Installed to | Description |
|------|--------------|-------------|
| `config` | `~/.config/i3/config` | Main i3 config |
| `polybar.ini` | `~/.config/polybar/config.ini` | Main status bar — Polybar (workspaces, CPU, temp, memory, disk, wifi, ethernet, volume, battery, clock, tray) with Nerd Font icons |
| `i3status.config` | `~/.config/i3status/config` | Legacy i3bar status (kept for the commented-out i3bar fallback in `config`) |
| `rofi.rasi` | `~/.config/rofi/config.rasi` | Black rofi launcher theme |
| `bin/polybar-launch.sh` | `~/.local/bin/polybar-launch.sh` | Launches Polybar (kills previous instances); run from i3 `exec_always` |
| `bin/polybar-vol.sh` | `~/.local/bin/polybar-vol.sh` | Volume readout for Polybar via `wpctl` (PipeWire) |
| `bin/screenshot.sh` | `~/.local/bin/screenshot.sh` | Region/full screenshots (clipboard via xclip, or save to file) |
| `bin/brightness.sh` | `~/.local/bin/brightness.sh` | Screen brightness via logind (no root) |
| `bin/powermenu.sh` | `~/.local/bin/powermenu.sh` | rofi power menu (shutdown/reboot/suspend/lock/logout) |

## Key bindings

| Shortcut | Action |
|----------|--------|
| `Super+Enter` | Terminal (wezterm) |
| `Super+R` | App launcher (rofi) |
| `Super+E` | File manager (Thunar) |
| `Super+Tab` | Window switcher (all workspaces) |
| `Super+Shift+Q` / `Alt+F4` | Close window |
| `Super+F` | Fullscreen |
| `Super+1..5` | Switch workspace |
| `Super+Shift+1..5` | Move window to workspace |
| `Super+N` | Rename current workspace (rofi; keeps the number) |
| `Super+arrows` | Focus window |
| `Super+Shift+arrows` | Move window |
| `Super+Y` | Resize mode |
| `Super+Shift+- / Super+-` | Scratchpad hide / show |
| `Print` / `Super+Shift+S` | Region screenshot → clipboard |
| `Super+Shift+P` | Power menu |
| `Super+Shift+R` | Restart i3 |

Media keys (`XF86Audio*`, `XF86MonBrightness*`) and `Super+F1..F6` mirror the ThinkPad function row.

## Dependencies

`i3`, `polybar`, `rofi`, `wezterm`, `thunar`, `nm-applet`, `xfsettingsd` (applies the GTK theme),
`xfce4-screenshooter`, `xclip`, `wireplumber` (`wpctl`), `jq`. Fonts: JetBrainsMono Nerd Font
(Polybar icons), Noto Sans. `i3status` + Font Awesome only needed for the commented i3bar fallback.

## Install

```bash
git clone https://github.com/fazt/dotfiles.git
cd dotfiles/i3
bash install.sh
i3-msg reload
```
