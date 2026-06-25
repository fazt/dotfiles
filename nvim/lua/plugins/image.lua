return {
  "3rd/image.nvim",
  event = "VeryLazy",
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
