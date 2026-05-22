-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Leader key (antes de cargar plugins)
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Números de línea
vim.opt.number = true
vim.opt.relativenumber = true

-- Navegación entre ventanas desde modo terminal
-- (no se remapea <Esc> para no romper el cancelar prompt de Claude)
vim.keymap.set("t", "<C-h>", [[<C-\><C-n><C-w>h]], { desc = "Ventana izquierda" })
vim.keymap.set("t", "<C-j>", [[<C-\><C-n><C-w>j]], { desc = "Ventana abajo" })
vim.keymap.set("t", "<C-k>", [[<C-\><C-n><C-w>k]], { desc = "Ventana arriba" })
vim.keymap.set("t", "<C-l>", [[<C-\><C-n><C-w>l]], { desc = "Ventana derecha" })

-- Mismos atajos en modo normal para simetría
vim.keymap.set("n", "<C-h>", "<C-w>h", { desc = "Ventana izquierda" })
vim.keymap.set("n", "<C-j>", "<C-w>j", { desc = "Ventana abajo" })
vim.keymap.set("n", "<C-k>", "<C-w>k", { desc = "Ventana arriba" })
vim.keymap.set("n", "<C-l>", "<C-w>l", { desc = "Ventana derecha" })

-- Cargar plugins
require("lazy").setup("plugins")
