local wezterm = require "wezterm"
local config = wezterm.config_builder()

local is_windows = wezterm.target_triple:find("windows") ~= nil

if is_windows then
  config.default_prog = { "C:/Program Files/PowerShell/7/pwsh.exe", "-NoLogo" }
end

config.font = wezterm.font("JetBrainsMono Nerd Font")
config.font_size = 12

config.color_scheme = "Tomorrow Night Bright"
config.window_background_opacity = 0.95

config.window_padding = {
  left = 8,
  right = 8,
  top = 8,
  bottom = 8,
}

config.default_cursor_style = "BlinkingBar"
config.scrollback_lines = 50000
config.enable_scroll_bar = true
config.colors = {
  scrollbar_thumb = "#555555",
  tab_bar = {
    background = "#0a0a0a",
    inactive_tab_edge = "#0a0a0a",
    active_tab = { bg_color = "#000000", fg_color = "#eaeaea" },
    inactive_tab = { bg_color = "#0a0a0a", fg_color = "#707070" },
    inactive_tab_hover = { bg_color = "#161616", fg_color = "#eaeaea" },
    new_tab = { bg_color = "#0a0a0a", fg_color = "#707070" },
    new_tab_hover = { bg_color = "#161616", fg_color = "#eaeaea" },
  },
}

config.window_frame = {
  active_titlebar_bg = "#0a0a0a",
  inactive_titlebar_bg = "#0a0a0a",
}

config.window_decorations = "TITLE | RESIZE"
config.hide_tab_bar_if_only_one_tab = true

config.initial_cols = 110
config.initial_rows = 30

-- Preserve long lines when copying (don't insert newlines at wrapping points)
config.canonicalize_pasted_newlines = "None"

config.mouse_bindings = {
  -- Ctrl+Click to open links
  {
    event = { Up = { streak = 1, button = "Left" } },
    mods = "CTRL",
    action = wezterm.action.OpenLinkAtMouseCursor,
  },
  -- Restore default: click selects text
  {
    event = { Down = { streak = 1, button = "Left" } },
    mods = "NONE",
    action = wezterm.action.SelectTextAtMouseCursor "Cell",
  },
  {
    event = { Drag = { streak = 1, button = "Left" } },
    mods = "NONE",
    action = wezterm.action.ExtendSelectionToMouseCursor "Cell",
  },
  -- Double-click selects word
  {
    event = { Down = { streak = 2, button = "Left" } },
    mods = "NONE",
    action = wezterm.action.SelectTextAtMouseCursor "Word",
  },
  -- Triple-click selects line
  {
    event = { Down = { streak = 3, button = "Left" } },
    mods = "NONE",
    action = wezterm.action.SelectTextAtMouseCursor "Line",
  },
  -- Right-click paste
  {
    event = { Down = { streak = 1, button = "Right" } },
    mods = "NONE",
    action = wezterm.action.PasteFrom "Clipboard",
  },
}

wezterm.on("update-right-status", function(window)
  window:set_right_status("  [" .. window:active_workspace() .. "] ")
end)

config.keys = {
  { key = "F11", action = wezterm.action.ToggleFullScreen },

  { key = "s", mods = "ALT", action = wezterm.action.ShowLauncherArgs { flags = "FUZZY|WORKSPACES" } },
  { key = "w", mods = "ALT", action = wezterm.action.PromptInputLine {
      description = "Enter workspace name",
      action = wezterm.action_callback(function(window, pane, line)
        if line and line ~= "" then
          window:perform_action(wezterm.action.SwitchToWorkspace { name = line }, pane)
        end
      end),
    },
  },
  { key = "W", mods = "ALT|SHIFT", action = wezterm.action.PromptInputLine {
      description = "Rename workspace to:",
      action = wezterm.action_callback(function(window, _, line)
        if line and line ~= "" then
          wezterm.mux.rename_workspace(window:active_workspace(), line)
        end
      end),
    },
  },

  {
    key = "F2",
    action = wezterm.action.PromptInputLine {
      description = "Enter new tab title",
      action = wezterm.action_callback(function(window, _, line)
        if line then
          window:active_tab():set_title(line)
        end
      end),
    },
  },

  { key = "UpArrow",    mods = "CTRL|SHIFT", action = wezterm.action.ScrollByPage(-0.5) },
  { key = "DownArrow",  mods = "CTRL|SHIFT", action = wezterm.action.ScrollByPage(0.5) },
  { key = "LeftArrow",  mods = "CTRL|SHIFT", action = wezterm.action.MoveTabRelative(-1) },
  { key = "RightArrow", mods = "CTRL|SHIFT", action = wezterm.action.MoveTabRelative(1) },

  { key = "1", mods = "ALT", action = wezterm.action.ActivateTab(0) },
  { key = "2", mods = "ALT", action = wezterm.action.ActivateTab(1) },
  { key = "3", mods = "ALT", action = wezterm.action.ActivateTab(2) },
  { key = "4", mods = "ALT", action = wezterm.action.ActivateTab(3) },
  { key = "5", mods = "ALT", action = wezterm.action.ActivateTab(4) },
  { key = "6", mods = "ALT", action = wezterm.action.ActivateTab(5) },
  { key = "7", mods = "ALT", action = wezterm.action.ActivateTab(6) },
  { key = "8", mods = "ALT", action = wezterm.action.ActivateTab(7) },
  { key = "9", mods = "ALT", action = wezterm.action.ActivateTab(-1) },
}

return config
