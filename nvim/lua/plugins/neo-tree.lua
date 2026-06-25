return {
  "nvim-neo-tree/neo-tree.nvim",
  branch = "v3.x",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-tree/nvim-web-devicons",
    "MunifTanjim/nui.nvim",
  },
  cmd = "Neotree",
  keys = {
    { "<leader>e",  "<cmd>Neotree toggle<cr>",      desc = "Toggle Neo-tree" },
    { "<leader>gs", "<cmd>Neotree git_status<cr>",  desc = "Neo-tree git status" },
  },
  opts = {
    default_component_configs = {
      indent = {
        indent_size = 3,
        padding = 1,
        with_markers = true,
        indent_marker = "│",
        last_indent_marker = "└",
      },
    },
    source_selector = {
      winbar = true,
      sources = {
        { source = "filesystem" },
        { source = "buffers" },
        { source = "git_status" },
      },
    },
    window = {
      width = 28,
    },
    filesystem = {
      filtered_items = {
        visible = true,
        hide_dotfiles = false,
        hide_gitignored = false,
      },
    },
  },
  config = function(_, opts)
    require("neo-tree").setup(opts)

    local bg = "#0a0a0a"
    local function set_dark()
      vim.api.nvim_set_hl(0, "NeoTreeNormal",      { bg = bg })
      vim.api.nvim_set_hl(0, "NeoTreeNormalNC",    { bg = bg })
      vim.api.nvim_set_hl(0, "NeoTreeEndOfBuffer", { bg = bg })
      vim.api.nvim_set_hl(0, "NeoTreeWinSeparator",{ bg = bg, fg = bg })
      vim.api.nvim_set_hl(0, "NeoTreeStatusLine",  { bg = bg })
    end
    set_dark()
    vim.api.nvim_create_autocmd("ColorScheme", { callback = set_dark })
  end,
}
