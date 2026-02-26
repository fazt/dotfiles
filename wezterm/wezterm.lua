local wezterm = require "wezterm"
local config = wezterm.config_builder()

config.default_prog = { "C:/Program Files/PowerShell/7/pwsh.exe", "-NoLogo" }

config.font = wezterm.font("JetBrainsMono Nerd Font")
config.font_size = 14

config.color_scheme = "Vibrant Ink (Gogh)"
config.window_background_opacity = 0.95

config.window_padding = {
  left = 8,
  right = 8,
  top = 8,
  bottom = 8,
}

config.default_cursor_style = "BlinkingBar"
config.scrollback_lines = 50000

config.window_decorations = "TITLE | RESIZE"
config.hide_tab_bar_if_only_one_tab = true

config.initial_cols = 110
config.initial_rows = 30

config.mouse_bindings = {
  {
    event = { Up = { streak = 1, button = "Left" } },
    mods = "CTRL",
    action = wezterm.action.OpenLinkAtMouseCursor,
  },
}

return config
