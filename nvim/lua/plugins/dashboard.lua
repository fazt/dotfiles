return {
  "nvimdev/dashboard-nvim",
  event = "VimEnter",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  opts = {
    theme = "doom",
    config = {
      header = {
        "",
        "",
        " ⣇⣿⠘⣿⣿⣿⡿⡿⣟⣟⢟⢟⢝⠵⡝⣿⡿⢂⣼⣿⣷⣌⠩⡫⡻⣝⠹⢿⣿⣷ ",
        " ⡆⣿⣆⠱⣝⡵⣝⢅⠙⣿⢕⢕⢕⢕⢝⣥⢒⠁⣿⣿⣿⡟⣰⣶⣦⣶⣶⣦⣶⣶ ",
        " ⡿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⠿⠿ ",
        " ⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⣿⡿⢿⣿⣿⣿⣿⠿⣿⡿⠿⢿⣿⡇⠀⠀⠀⠀⠀ ",
        " ⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⣿⡇⠀⠈⢻⣿⠁⠀⣿⡇⠀⠀⣿⡇⠀⠀⠀⠀⠀ ",
        " ⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⣿⡇⠀⠀⢸⣿⠀⠀⣿⡇⠀⠀⣿⡇⠀⠀⠀⠀⠀ ",
        " ⣿⣿⣿⣿⣿⣿⣿⣧⣤⣤⣤⣿⣧⣤⣤⣼⣿⣤⣤⣿⣧⣤⣤⣿⣧⣤⣤⣤⣤⣤ ",
        "",
        "",
      },
      center = {
        { action = "Telescope find_files", desc = " Find file", icon = "󰈞 ", key = "f" },
        { action = "ene | startinsert", desc = " New file", icon = " ", key = "n" },
        { action = "Telescope oldfiles", desc = " Recent files", icon = "󰊄 ", key = "r" },
        { action = "Telescope live_grep", desc = " Find text", icon = "󰊄 ", key = "g" },
        { action = "Lazy", desc = " Plugins", icon = "󰒲 ", key = "p" },
        { action = "qa", desc = " Quit", icon = " ", key = "q" },
      },
      footer = {},
    },
  },
}
