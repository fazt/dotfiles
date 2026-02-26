# Neovim Config

Leader key: `Space`

## Plugins

| Plugin | Descripcion |
|---|---|
| [lazy.nvim](https://github.com/folke/lazy.nvim) | Plugin manager |
| [telescope.nvim](https://github.com/nvim-telescope/telescope.nvim) | Fuzzy finder / buscador |
| [telescope-fzf-native.nvim](https://github.com/nvim-telescope/telescope-fzf-native.nvim) | Sorting nativo para Telescope |
| [oxocarbon.nvim](https://github.com/nyoom-engineering/oxocarbon.nvim) | Colorscheme (dark) |
| [neo-tree.nvim](https://github.com/nvim-neo-tree/neo-tree.nvim) | Explorador de archivos |
| [nvim-web-devicons](https://github.com/nvim-tree/nvim-web-devicons) | Iconos para Neo-tree |
| [dashboard-nvim](https://github.com/nvimdev/dashboard-nvim) | Pantalla de inicio |
| [lualine.nvim](https://github.com/nvim-lualine/lualine.nvim) | Barra de estado |
| [gitsigns.nvim](https://github.com/lewis6991/gitsigns.nvim) | Indicadores de git en el margen |
| [nvim-autopairs](https://github.com/windwp/nvim-autopairs) | Cierra parentesis, llaves, comillas |
| [indent-blankline.nvim](https://github.com/lukas-reineke/indent-blankline.nvim) | Guias de indentacion |

## Atajos

### Telescope

| Atajo | Accion |
|---|---|
| `Ctrl+p` | Buscar archivos |
| `Space ff` | Buscar archivos |
| `Space fg` | Buscar texto (live grep) |
| `Space fb` | Buffers abiertos |
| `Space fh` | Help tags |
| `Space fr` | Archivos recientes |
| `Space fw` | Grep palabra bajo el cursor |

Dentro de Telescope:

| Atajo | Accion |
|---|---|
| `Ctrl+j` | Siguiente resultado |
| `Ctrl+k` | Resultado anterior |

### Dashboard

| Atajo | Accion |
|---|---|
| `f` | Buscar archivo |
| `n` | Nuevo archivo |
| `r` | Archivos recientes |
| `g` | Buscar texto |
| `p` | Plugins (Lazy) |
| `q` | Salir |

### Neo-tree

| Atajo | Accion |
|---|---|
| `Space e` | Abrir/cerrar explorador de archivos |

## Requisitos

- [fd](https://github.com/sharkdp/fd) (para busqueda rapida de archivos)
- [ripgrep](https://github.com/BurntSushi/ripgrep) (para live grep)
- [cmake](https://cmake.org/) (solo Windows, para compilar telescope-fzf-native)
- Una [Nerd Font](https://www.nerdfonts.com/) (para iconos en Neo-tree)

## Instalacion

### Windows

```powershell
# PowerShell como Admin
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\nvim" -Target "$HOME\dotfiles\nvim"
```

### Linux / macOS

```bash
ln -s ~/dotfiles/nvim ~/.config/nvim
```
