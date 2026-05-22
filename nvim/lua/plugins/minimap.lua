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

    local excluded_filetypes = {
      [""] = true,
      ["snacks_dashboard"] = true,
      ["dashboard"] = true,
      ["alpha"] = true,
      ["starter"] = true,
      ["neo-tree"] = true,
      ["NvimTree"] = true,
      ["TelescopePrompt"] = true,
      ["lazy"] = true,
      ["mason"] = true,
      ["help"] = true,
      ["qf"] = true,
      ["lspinfo"] = true,
      ["checkhealth"] = true,
      ["man"] = true,
      ["notify"] = true,
      ["noice"] = true,
      ["Trouble"] = true,
      ["which-key"] = true,
    }

    local function should_show()
      local buf = vim.api.nvim_get_current_buf()
      local ft = vim.bo[buf].filetype
      local bt = vim.bo[buf].buftype
      local name = vim.api.nvim_buf_get_name(buf)
      if bt ~= "" then return false end
      if excluded_filetypes[ft] then return false end
      if name == "" then return false end
      return true
    end

    local group = vim.api.nvim_create_augroup("MiniMapAutoToggle", { clear = true })
    vim.api.nvim_create_autocmd({ "BufEnter", "BufWinEnter", "FileType" }, {
      group = group,
      callback = function()
        vim.schedule(function()
          if should_show() then
            map.open()
          else
            map.close()
          end
        end)
      end,
    })
  end,
}
