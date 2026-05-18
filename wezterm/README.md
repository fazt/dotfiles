# WezTerm Config

Configuración personal de [WezTerm](https://wezfurlong.org/wezterm/).

## Instalación

En Windows, el archivo se carga desde `~/.wezterm.lua`. Yo uso un symlink:

```powershell
New-Item -ItemType SymbolicLink -Path $HOME\.wezterm.lua -Target $HOME\dotfiles\wezterm\wezterm.lua
```

## Apariencia

| Setting | Valor |
| --- | --- |
| Fuente | `JetBrainsMono Nerd Font` 12pt |
| Color scheme | `Vibrant Ink (Gogh)` |
| Opacidad | `0.95` |
| Cursor | `BlinkingBar` |
| Padding | `8px` en los 4 lados |
| Decoraciones | `TITLE | RESIZE` |
| Tab bar | Se oculta cuando hay un solo tab |
| Scrollbar | Visible, thumb `#555555` |
| Scrollback | 50 000 líneas |

Ventana inicial: `110 columnas × 30 filas`.

## Shell por defecto

En Windows arranca **PowerShell 7** (`C:/Program Files/PowerShell/7/pwsh.exe -NoLogo`). En otros SOs usa el shell del sistema.

## Status bar

Esquina derecha muestra el workspace activo: `  [workspace-name] `.

## Atajos de teclado

### Ventana

| Tecla | Acción |
| --- | --- |
| `F11` | Toggle fullscreen |
| `F2` | Renombrar tab actual (prompt) |

### Workspaces

| Tecla | Acción |
| --- | --- |
| `Alt+S` | Launcher fuzzy de workspaces |
| `Alt+W` | Crear / cambiar a workspace por nombre |

### Tabs

| Tecla | Acción |
| --- | --- |
| `Alt+1` … `Alt+8` | Saltar al tab N |
| `Alt+9` | Saltar al último tab |
| `Ctrl+Shift+←` | Mover tab a la izquierda |
| `Ctrl+Shift+→` | Mover tab a la derecha |

### Scroll

| Tecla | Acción |
| --- | --- |
| `Ctrl+Shift+↑` | Scroll una línea arriba |
| `Ctrl+Shift+↓` | Scroll una línea abajo |

## Mouse

| Acción | Resultado |
| --- | --- |
| Click izquierdo | Selecciona texto (celda) |
| Doble click | Selecciona palabra |
| Triple click | Selecciona línea |
| Arrastrar con izquierdo | Extiende la selección |
| `Ctrl+Click` | Abre el link bajo el cursor |
| Click derecho | Pega del portapapeles |

## Portapapeles

`canonicalize_pasted_newlines = "None"` — al copiar líneas largas no se insertan saltos de línea en los puntos de wrap.
