# i3

i3 tiling window manager setup (X11) — dark theme matching Orchis-Dark.

## Contents

| File | Installed to | Description |
|------|--------------|-------------|
| `config` | `~/.config/i3/config` | Main i3 config |
| `i3status.config` | `~/.config/i3status/config` | Status bar (network, battery, volume, CPU usage, CPU temp, memory, load, disk, clock) with Font Awesome icons |
| `rofi.rasi` | `~/.config/rofi/config.rasi` | Black rofi launcher theme |
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

`i3`, `i3status`, `rofi`, `wezterm`, `thunar`, `nm-applet`, `xfsettingsd` (applies the GTK theme),
`xfce4-screenshooter`, `xclip`, `wireplumber` (`wpctl`). Fonts: Noto Sans, Font Awesome 4.

## Install

```bash
git clone https://github.com/fazt/dotfiles.git
cd dotfiles/i3
bash install.sh
i3-msg reload
```
