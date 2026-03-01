return {
  "echasnovski/mini.map",
  event = "VeryLazy",
  config = function()
    local map = require("mini.map")
    map.setup({
      integrations = {
        map.gen_integration.builtin_search(),
        map.gen_integration.diagnostic(),
      },
      symbols = {
        encode = map.gen_encode_symbols.dot("4x2"),
      },
      window = {
        width = 10,
        winblend = 50,
      },
    })
    vim.keymap.set("n", "<leader>mo", map.toggle, { desc = "Toggle minimap" })
    vim.keymap.set("n", "<leader>mf", map.toggle_focus, { desc = "Focus minimap" })
    vim.keymap.set("n", "<leader>mr", map.refresh, { desc = "Refresh minimap" })
    map.open()
  end,
}
