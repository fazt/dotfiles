return {
  "3rd/image.nvim",
  event = "VeryLazy",
  -- Solo en Unix. En Windows el backend sixel consulta el tamano del terminal
  -- con una llamada que ahi no existe, asi que al cargarse suelta
  -- "image.nvim: unsupported OS - cannot query terminal size" y deja a nvim
  -- esperando un Enter en cada arranque. En el Pi y en i3 funciona igual.
  --
  -- cond y no enabled: asi sigue instalado y lazy no lo marca para limpieza
  -- cuando se abre el mismo dotfiles desde Linux.
  cond = function()
    return vim.fn.has("win32") == 0
  end,
  opts = {
    backend = "sixel",        -- WezTerm soporta sixel; "kitty" no es confiable en WezTerm
    processor = "magick_cli", -- usa el CLI de ImageMagick (no requiere luarocks)
    integrations = {
      markdown = {
        enabled = true,
        clear_in_insert_mode = false,
        only_render_image_at_cursor = true,        -- mejor rendimiento con sixel
        only_render_image_at_cursor_mode = "popup",
        filetypes = { "markdown", "vimwiki" },
      },
    },
    max_width_window_percentage = 80,
    max_height_window_percentage = 50,
    window_overlap_clear_enabled = true,
    hijack_file_patterns = { "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.avif" },
  },
}
