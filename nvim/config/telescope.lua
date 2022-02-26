-- Config: telescope
local telescope = require('telescope')
local actions = require('telescope.actions')
local builtin = require('telescope.builtin')

telescope.setup {
  defaults = {
    mappings = {
      i = {
        ["<esc>"] = actions.close,
      },
    },

    preview = false,

    file_ignore_patterns = { 'node_modules' },

    winblend = 10,

    layout_config = {
      prompt_position = 'top',
      width = 0.75
    },
  },

  pickers = {},

  extensions = {}
}

-- Custom finders
builtin.edit_vim = function ()
  builtin.find_files(require('telescope.themes').get_dropdown{
    cwd = "$HOME/.config/nvim",
    prompt_title = "nvim config",
    previewer = false
  })
end

builtin.dotfiles = function ()
  builtin.find_files(require('telescope.themes').get_dropdown{
    cwd = "$HOME/.dotfiles",
    prompt_title = 'Dotfiles',
    previewer = false,
    file_ignore_patterns = { 'plugged' },
  })
end

telescope.load_extension('sourcery')
