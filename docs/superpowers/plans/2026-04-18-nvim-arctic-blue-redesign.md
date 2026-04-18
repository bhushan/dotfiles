# Neovim Arctic Blue Stream Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing Neovim config into a polished, stream-ready editor with Arctic Blue custom theme, branded dashboard, smooth animations, and improved navigation — all built on top of the existing Catppuccin Mocha + Snacks + Noice foundation.

**Architecture:** Surgical enhancement approach — modify existing plugin configs via Catppuccin's `custom_highlights` API and Snacks' dashboard config, add 6 targeted new plugins (bufferline, barbecue, navic, mini.animate, mini.indentscope, indent-blankline) in dedicated config files. Single source of truth for colors in `core/colors.lua`.

**Tech Stack:** Neovim, Lua, lazy.nvim, Catppuccin, Snacks.nvim, Noice.nvim, Lualine

---

### Task 1: Update Color Palette — Arctic Blue

**Files:**
- Modify: `nvim/lua/core/colors.lua` (lines 1-41)

- [ ] **Step 1: Add Arctic Blue palette to colors.lua**

Add the Arctic Blue accent colors below the existing Catppuccin palette. Keep the original colors intact — they're used by other tools (kitty, tmux). The new `arctic` table provides the custom overrides.

```lua
--- Catppuccin Mocha color palette
--- Central color definitions for all Neovim plugins
--- Reference: colors/catppuccin-mocha.md
--- @module core.colors

local M = {}

-- Base colors
M.base = '#1e1e2e'
M.mantle = '#181825'
M.crust = '#11111b'
M.surface0 = '#313244'
M.surface1 = '#45475a'
M.surface2 = '#585b70'

-- Text colors
M.text = '#cdd6f4'
M.subtext1 = '#bac2de'
M.subtext0 = '#a6adc8'
M.overlay2 = '#9399b2'
M.overlay1 = '#7f849c'
M.overlay0 = '#6c7086'

-- Syntax colors
M.red = '#f38ba8'
M.maroon = '#eba0ac'
M.peach = '#fab387'
M.yellow = '#f9e2af'
M.green = '#a6e3a1'
M.teal = '#94e2d5'
M.sky = '#89dceb'
M.sapphire = '#74c7ec'
M.blue = '#89b4fa'
M.lavender = '#b4befe'
M.mauve = '#cba6f7'
M.pink = '#f5c2e7'
M.flamingo = '#f2cdcd'
M.rosewater = '#f5e0dc'

-- Arctic Blue accent palette (custom overrides for stream theme)
M.arctic = {
  ice = '#7dcfff',       -- keywords: local, return, function, if, for
  purple = '#bb9af7',    -- functions, method calls
  amber = '#e0af68',     -- strings
  teal = '#73daca',      -- types, classes
  mint = '#9ece6a',      -- built-in functions, require
  rose = '#f7768e',      -- constants, numbers, booleans
  comment = '#7a80a3',   -- comments (brighter than default overlay0)
  cursorline = '#292e42', -- cursor line background
  visual = '#33467c',    -- visual selection
  gutter = '#3b4261',    -- line numbers (active)
}

return M
```

- [ ] **Step 2: Verify module loads correctly**

Run: `nvim --headless -c "lua print(vim.inspect(require('core.colors').arctic))" -c "q"` 
Expected: Table with all arctic colors printed, no errors.

- [ ] **Step 3: Commit**

```bash
git add nvim/lua/core/colors.lua
git commit -m "feat(nvim): add Arctic Blue accent palette to core colors"
```

---

### Task 2: Apply Arctic Blue Theme via Catppuccin Custom Highlights

**Files:**
- Modify: `nvim/lua/plugins/ui/theme.lua` (lines 1-51)

- [ ] **Step 1: Add custom_highlights to Catppuccin config**

Replace the entire `theme.lua` with Arctic Blue overrides using Catppuccin's `custom_highlights` callback. This maps treesitter highlight groups and UI elements to the Arctic Blue palette.

```lua
-- Arctic Blue theme — custom Catppuccin Mocha overrides
-- Base: Catppuccin Mocha | Accents: Arctic Blue palette from core/colors.lua
return {
  'catppuccin/nvim',
  name = 'catppuccin',
  lazy = false,
  priority = 1000,
  config = function()
    local colors = require 'core.colors'
    local arctic = colors.arctic

    require('catppuccin').setup {
      flavour = 'mocha',
      transparent_background = false,
      dim_inactive = {
        enabled = false,
      },
      styles = {
        comments = { 'italic' },
        conditionals = { 'italic' },
        loops = {},
        functions = {},
        keywords = { 'bold' },
        strings = {},
        variables = {},
        numbers = {},
        booleans = { 'bold' },
        properties = {},
        types = { 'bold' },
        operators = {},
      },
      custom_highlights = function()
        return {
          -- Syntax: keywords
          ['@keyword'] = { fg = arctic.ice },
          ['@keyword.function'] = { fg = arctic.ice, bold = true },
          ['@keyword.return'] = { fg = arctic.ice, bold = true },
          ['@keyword.operator'] = { fg = arctic.ice },
          ['@conditional'] = { fg = arctic.ice, italic = true },
          ['@repeat'] = { fg = arctic.ice, italic = true },
          ['@include'] = { fg = arctic.ice },
          ['@exception'] = { fg = arctic.ice },
          Keyword = { fg = arctic.ice },
          Statement = { fg = arctic.ice },
          Conditional = { fg = arctic.ice, italic = true },
          Repeat = { fg = arctic.ice, italic = true },

          -- Syntax: functions
          ['@function'] = { fg = arctic.purple },
          ['@function.call'] = { fg = arctic.purple },
          ['@function.method'] = { fg = arctic.purple },
          ['@function.method.call'] = { fg = arctic.purple },
          ['@function.builtin'] = { fg = arctic.mint },
          ['@constructor'] = { fg = arctic.teal },
          Function = { fg = arctic.purple },

          -- Syntax: strings
          ['@string'] = { fg = arctic.amber },
          ['@string.escape'] = { fg = arctic.rose },
          ['@string.regex'] = { fg = arctic.rose },
          String = { fg = arctic.amber },

          -- Syntax: types
          ['@type'] = { fg = arctic.teal, bold = true },
          ['@type.builtin'] = { fg = arctic.teal },
          ['@type.definition'] = { fg = arctic.teal, bold = true },
          Type = { fg = arctic.teal },

          -- Syntax: variables and properties
          ['@variable'] = { fg = colors.text },
          ['@variable.builtin'] = { fg = arctic.rose, italic = true },
          ['@variable.parameter'] = { fg = colors.subtext1 },
          ['@property'] = { fg = colors.subtext1 },
          ['@field'] = { fg = colors.subtext1 },

          -- Syntax: constants and numbers
          ['@constant'] = { fg = arctic.rose },
          ['@constant.builtin'] = { fg = arctic.rose, bold = true },
          ['@number'] = { fg = arctic.rose },
          ['@boolean'] = { fg = arctic.rose, bold = true },
          Number = { fg = arctic.rose },
          Boolean = { fg = arctic.rose, bold = true },
          Constant = { fg = arctic.rose },

          -- Syntax: comments
          ['@comment'] = { fg = arctic.comment, italic = true },
          Comment = { fg = arctic.comment, italic = true },

          -- Syntax: operators and punctuation
          ['@operator'] = { fg = colors.overlay2 },
          ['@punctuation.bracket'] = { fg = colors.overlay2 },
          ['@punctuation.delimiter'] = { fg = colors.overlay2 },
          Operator = { fg = colors.overlay2 },

          -- Syntax: tags (HTML/JSX)
          ['@tag'] = { fg = arctic.rose },
          ['@tag.attribute'] = { fg = arctic.purple },
          ['@tag.delimiter'] = { fg = colors.overlay2 },

          -- UI: cursor and selection
          CursorLine = { bg = arctic.cursorline },
          CursorLineNr = { fg = arctic.ice, bold = true },
          Visual = { bg = arctic.visual },
          LineNr = { fg = colors.surface2 },

          -- UI: search
          Search = { bg = '#3d59a1', fg = colors.text },
          IncSearch = { bg = arctic.amber, fg = colors.base },
          CurSearch = { bg = arctic.amber, fg = colors.base, bold = true },

          -- UI: pmenu (completion popup)
          Pmenu = { bg = colors.mantle },
          PmenuSel = { bg = arctic.visual, bold = true },
          PmenuSbar = { bg = colors.surface0 },
          PmenuThumb = { bg = colors.surface2 },

          -- UI: floating windows
          FloatBorder = { fg = arctic.ice, bg = colors.mantle },
          NormalFloat = { bg = colors.mantle },

          -- UI: diagnostics
          DiagnosticError = { fg = arctic.rose },
          DiagnosticWarn = { fg = arctic.amber },
          DiagnosticInfo = { fg = arctic.ice },
          DiagnosticHint = { fg = arctic.teal },

          -- UI: git signs
          GitSignsAdd = { fg = arctic.teal },
          GitSignsChange = { fg = arctic.amber },
          GitSignsDelete = { fg = arctic.rose },

          -- UI: indent guides
          IblIndent = { fg = arctic.cursorline },
          IblScope = { fg = arctic.teal },

          -- UI: treesitter context
          TreesitterContext = { bg = arctic.cursorline },
          TreesitterContextLineNumber = { fg = arctic.ice },
        }
      end,
      integrations = {
        cmp = true,
        gitsigns = true,
        treesitter = true,
        notify = true,
        mason = true,
        which_key = true,
        snacks = true,
        noice = true,
        indent_blankline = {
          enabled = true,
          scope_color = 'teal',
        },
        barbecue = {
          dim_dirname = true,
          bold_basename = true,
          dim_context = false,
        },
        native_lsp = {
          enabled = true,
          underlines = {
            errors = { 'undercurl' },
            hints = { 'undercurl' },
            warnings = { 'undercurl' },
            information = { 'undercurl' },
          },
        },
      },
    }
    vim.cmd.colorscheme 'catppuccin'
  end,
}
```

- [ ] **Step 2: Open Neovim and verify theme loads**

Run: `nvim nvim/lua/core/colors.lua`
Expected: File opens with Arctic Blue syntax — ice blue keywords (`local`, `return`), amber strings, purple function names. No errors in `:messages`.

- [ ] **Step 3: Commit**

```bash
git add nvim/lua/plugins/ui/theme.lua
git commit -m "feat(nvim): apply Arctic Blue custom highlights via Catppuccin"
```

---

### Task 3: Update Lualine to Arctic Blue with Stream Features

**Files:**
- Modify: `nvim/lua/plugins/ui/lualine.lua` (lines 1-89)

- [ ] **Step 1: Rewrite lualine config with Arctic Blue colors and stream additions**

Add macro recording indicator and LSP server name. Update all section colors to use Arctic Blue palette.

```lua
-- Arctic Blue lualine — stream-optimized statusline
-- Uses shared color palette from core/colors.lua
local colors = require 'core.colors'
local arctic = colors.arctic

local custom_theme = {
  normal = {
    a = { bg = arctic.ice, fg = colors.base, gui = 'bold' },
    b = { bg = colors.surface0, fg = colors.text },
    c = { bg = colors.base, fg = colors.subtext0 },
  },
  insert = {
    a = { bg = arctic.mint, fg = colors.base, gui = 'bold' },
    b = { bg = colors.surface0, fg = colors.text },
    c = { bg = colors.base, fg = colors.subtext0 },
  },
  visual = {
    a = { bg = arctic.purple, fg = colors.base, gui = 'bold' },
    b = { bg = colors.surface0, fg = colors.text },
    c = { bg = colors.base, fg = colors.subtext0 },
  },
  replace = {
    a = { bg = arctic.rose, fg = colors.base, gui = 'bold' },
    b = { bg = colors.surface0, fg = colors.text },
    c = { bg = colors.base, fg = colors.subtext0 },
  },
  command = {
    a = { bg = arctic.amber, fg = colors.base, gui = 'bold' },
    b = { bg = colors.surface0, fg = colors.text },
    c = { bg = colors.base, fg = colors.subtext0 },
  },
  inactive = {
    a = { bg = colors.base, fg = colors.subtext0 },
    b = { bg = colors.base, fg = colors.subtext0 },
    c = { bg = colors.base, fg = colors.subtext0 },
  },
}

require('lualine').setup {
  options = {
    section_separators = '',
    component_separators = '',
    globalstatus = true,
    theme = custom_theme,
  },
  sections = {
    lualine_a = {
      'mode',
    },
    lualine_b = {
      'branch',
      {
        'diff',
        symbols = { added = '  ', modified = '  ', removed = '  ' },
      },
      {
        'diagnostics',
        symbols = { error = '  ', warn = '  ', info = '  ', hint = '  ' },
      },
    },
    lualine_c = {
      'filename',
    },
    lualine_x = {
      -- Macro recording indicator (visible to stream viewers)
      {
        function()
          local reg = vim.fn.reg_recording()
          if reg ~= '' then
            return '󰑋 REC @' .. reg
          end
          return ''
        end,
        color = { fg = arctic.rose, gui = 'bold' },
      },
      -- Active LSP server name
      {
        function()
          local clients = vim.lsp.get_clients { bufnr = 0 }
          if #clients == 0 then
            return ''
          end
          local names = {}
          for _, client in ipairs(clients) do
            table.insert(names, client.name)
          end
          return '  ' .. table.concat(names, ', ')
        end,
        color = { fg = arctic.teal },
      },
      {
        require('lazy.status').updates,
        cond = require('lazy.status').has_updates,
        color = { fg = arctic.amber },
      },
    },
    lualine_y = {
      'filetype',
      'encoding',
      'fileformat',
      function()
        return (vim.bo.expandtab and ' ' or ' ') .. vim.bo.shiftwidth
      end,
    },
    lualine_z = {
      'searchcount',
      'selectioncount',
      'location',
      'progress',
    },
  },
}
```

- [ ] **Step 2: Open Neovim, verify statusline**

Run: `nvim nvim/lua/plugins/ui/lualine.lua`
Expected: Statusline shows ice blue NORMAL mode, teal LSP name on the right. Record a macro with `qa` — should show red "REC @a" in statusline.

- [ ] **Step 3: Commit**

```bash
git add nvim/lua/plugins/ui/lualine.lua
git commit -m "feat(nvim): Arctic Blue lualine with macro recording and LSP name"
```

---

### Task 4: Branded Dashboard

**Files:**
- Modify: `nvim/lua/plugins/ui/snacks.lua` (lines 1-28, dashboard section only)

- [ ] **Step 1: Replace the dashboard section in snacks.lua**

Replace only the `dashboard` block inside `require('snacks').setup`. Keep all other Snacks config (notifier, input, picker, terminal, scroll, explorer) exactly as-is. Also add zen mode config.

Replace lines 1-33 of snacks.lua (the `require('snacks').setup {` opening through the end of the `dashboard` block's `preset`) with:

```lua
require('snacks').setup {
  dashboard = {
    enabled = true,
    sections = {
      { section = 'header' },
      { section = 'keys', gap = 1 },
      { section = 'recent_files', limit = 5, indent = 2, padding = 1 },
      { section = 'startup' },
    },
    preset = {
      header = [[
                                                          
        ██████╗ ██████╗                                   
        ██╔══██╗██╔══██╗                                  
        ██████╔╝██████╔╝                                  
        ██╔══██╗██╔══██╗                                  
        ██║  ██║██████╔╝                                  
        ╚═╝  ╚═╝╚═════╝                                   
                                                          
        engineering is beautiful ~ rb                      
      ]],
      keys = {
        { icon = ' ', key = 'f', desc = 'Find File', action = ':lua Snacks.picker.files()' },
        { icon = ' ', key = 'r', desc = 'Recent Files', action = ':lua Snacks.picker.recent()' },
        { icon = '󰺮 ', key = 'g', desc = 'Live Grep', action = ':lua Snacks.picker.grep()' },
        { icon = ' ', key = 'n', desc = 'New File', action = ':ene | startinsert' },
        { icon = ' ', key = 'p', desc = 'Projects', action = ':lua Snacks.picker.projects()' },
        { icon = ' ', key = 'q', desc = 'Quit', action = ':qa' },
      },
    },
  },

  notifier = {
    enabled = false, -- noice.nvim handles notifications
  },
  input = {
    enabled = true,
  },
  picker = {
    ui_select = true, -- Enable vim.ui.select integration
    sources = {
      explorer = {
        hidden = true,
        ignored = true,
        layout = {
          layout = {
            width = 0.4,
            position = 'right',
          },
        },
      },
    },
  },

  terminal = {
    win = {
      width = 0.8,
      height = 0.8,
    },
  },

  scroll = {
    enabled = true,
  },

  explorer = {
    enabled = true,
    replace_netrw = true,
  },

  zen = {
    enabled = true,
    toggles = {
      dim = false,
    },
    win = {
      backdrop = { transparent = false },
    },
  },
}
```

Keep the rest of the file (lines 75-181 — all the keymap.set calls, autocmds, etc.) exactly as-is.

- [ ] **Step 2: Add zen mode keymap**

Append this keymap after the existing Dashboard keymap (after line 171 in the original file):

```lua
vim.keymap.set('n', '<leader>z', function()
  require('snacks').zen()
end, { desc = 'Zen Mode' })
```

- [ ] **Step 3: Add dashboard highlight autocmd**

Add Arctic Blue colors to the dashboard header. Append after the existing `ColorScheme` autocmd (after line 180 in the original file):

```lua
-- Arctic Blue dashboard highlights
vim.api.nvim_create_autocmd('ColorScheme', {
  callback = function()
    local arctic = require('core.colors').arctic
    vim.api.nvim_set_hl(0, 'SnacksDashboardHeader', { fg = arctic.ice })
    vim.api.nvim_set_hl(0, 'SnacksDashboardKey', { fg = arctic.amber, bold = true })
    vim.api.nvim_set_hl(0, 'SnacksDashboardDesc', { fg = '#a9b1d6' })
    vim.api.nvim_set_hl(0, 'SnacksDashboardIcon', { fg = arctic.teal })
    vim.api.nvim_set_hl(0, 'SnacksDashboardFooter', { fg = arctic.comment })
  end,
})
```

- [ ] **Step 4: Open Neovim with no file to see dashboard**

Run: `nvim`
Expected: Dashboard shows "RB" ASCII art in ice blue, quote underneath, 6 quick action keys with amber highlights, recent files section, and startup time footer.

- [ ] **Step 5: Commit**

```bash
git add nvim/lua/plugins/ui/snacks.lua
git commit -m "feat(nvim): branded Arctic Blue dashboard with RB monogram and zen mode"
```

---

### Task 5: Animations — mini.animate + mini.indentscope + indent-blankline

**Files:**
- Create: `nvim/lua/plugins/ui/animate.lua`
- Modify: `nvim/lua/plugins/init.lua` (add import)

- [ ] **Step 1: Create animate.lua with all three plugins**

```lua
-- Animations and indent visualization
-- mini.animate: smooth cursor, scroll, window resize
-- mini.indentscope: animated active scope indicator
-- indent-blankline: static indent guides for all levels
return {
  -- Smooth animations for cursor jumps, scroll, and window resize
  {
    'echasnovski/mini.animate',
    event = 'VeryLazy',
    config = function()
      local animate = require 'mini.animate'
      animate.setup {
        cursor = {
          enable = true,
          timing = animate.gen_timing.linear { duration = 80, unit = 'total' },
        },
        scroll = {
          enable = true,
          timing = animate.gen_timing.linear { duration = 100, unit = 'total' },
        },
        resize = {
          enable = true,
          timing = animate.gen_timing.linear { duration = 80, unit = 'total' },
        },
        open = { enable = false },
        close = { enable = false },
      }
    end,
  },

  -- Animated indent scope line following cursor (teal)
  {
    'echasnovski/mini.indentscope',
    event = { 'BufReadPost', 'BufNewFile' },
    config = function()
      local colors = require('core.colors').arctic
      require('mini.indentscope').setup {
        symbol = '│',
        options = {
          try_as_border = true,
        },
        draw = {
          delay = 50,
          animation = require('mini.indentscope').gen_animation.linear { duration = 60, unit = 'total' },
        },
      }

      -- Disable for certain filetypes
      vim.api.nvim_create_autocmd('FileType', {
        pattern = { 'help', 'dashboard', 'lazy', 'mason', 'trouble', 'snacks_picker', 'snacks_dashboard' },
        callback = function()
          vim.b.miniindentscope_disable = true
        end,
      })

      -- Set scope color to Arctic teal
      vim.api.nvim_create_autocmd('ColorScheme', {
        callback = function()
          vim.api.nvim_set_hl(0, 'MiniIndentscopeSymbol', { fg = colors.teal })
        end,
      })
      -- Apply immediately
      vim.api.nvim_set_hl(0, 'MiniIndentscopeSymbol', { fg = colors.teal })
    end,
  },

  -- Static indent guides for all levels
  {
    'lukas-reineke/indent-blankline.nvim',
    main = 'ibl',
    event = { 'BufReadPost', 'BufNewFile' },
    opts = {
      indent = {
        char = '│',
      },
      scope = {
        enabled = false, -- mini.indentscope handles active scope
      },
      exclude = {
        filetypes = { 'help', 'dashboard', 'lazy', 'mason', 'trouble', 'snacks_picker', 'snacks_dashboard' },
      },
    },
  },
}
```

- [ ] **Step 2: Add import to plugins/init.lua**

Add this line after the existing `{ import = 'plugins.ui.theme' }` line (around line 238 in init.lua):

```lua
  --- Animations and indent visualization
  { import = 'plugins.ui.animate' },
```

- [ ] **Step 3: Open Neovim and verify animations**

Run: `nvim nvim/lua/plugins/ui/snacks.lua`
Expected:
- Indent guides visible as subtle vertical lines at each indent level
- Active scope highlighted with teal animated line
- Press `gg` then `G` — cursor animates smoothly to new position
- Press `<C-d>` — smooth scroll animation

- [ ] **Step 4: Commit**

```bash
git add nvim/lua/plugins/ui/animate.lua nvim/lua/plugins/init.lua
git commit -m "feat(nvim): add smooth animations and indent guides"
```

---

### Task 6: Bufferline — Visual Buffer Tabs

**Files:**
- Create: `nvim/lua/plugins/ui/bufferline.lua`
- Modify: `nvim/lua/plugins/init.lua` (add import)
- Modify: `nvim/lua/core/keymaps.lua` (add buffer keymaps)

- [ ] **Step 1: Create bufferline.lua**

```lua
-- Buffer tabs — visual buffer management for streams
-- Shows all open buffers at the top, Arctic Blue themed
return {
  'akinsho/bufferline.nvim',
  version = '*',
  dependencies = { 'nvim-tree/nvim-web-devicons' },
  event = { 'BufReadPost', 'BufNewFile' },
  config = function()
    local colors = require 'core.colors'
    local arctic = colors.arctic

    require('bufferline').setup {
      options = {
        mode = 'buffers',
        diagnostics = 'nvim_lsp',
        diagnostics_indicator = function(count, level)
          local icon = level:match 'error' and ' ' or ' '
          return ' ' .. icon .. count
        end,
        show_buffer_close_icons = false,
        show_close_icon = false,
        separator_style = 'thin',
        always_show_bufferline = false, -- only show when 2+ buffers
        offsets = {
          {
            filetype = 'snacks_picker',
            text = 'Explorer',
            highlight = 'Directory',
            text_align = 'left',
          },
        },
      },
      highlights = {
        fill = { bg = colors.mantle },
        background = { fg = colors.overlay0, bg = colors.mantle },
        buffer_selected = { fg = colors.text, bg = colors.base, bold = true },
        buffer_visible = { fg = colors.subtext0, bg = colors.mantle },
        close_button_selected = { fg = arctic.rose, bg = colors.base },
        indicator_selected = { fg = arctic.ice, bg = colors.base },
        modified = { fg = arctic.amber, bg = colors.mantle },
        modified_selected = { fg = arctic.amber, bg = colors.base },
        modified_visible = { fg = arctic.amber, bg = colors.mantle },
        separator = { fg = colors.mantle, bg = colors.mantle },
        separator_selected = { fg = colors.mantle, bg = colors.base },
        separator_visible = { fg = colors.mantle, bg = colors.mantle },
        tab = { fg = colors.overlay0, bg = colors.mantle },
        tab_selected = { fg = colors.text, bg = colors.base, bold = true },
        tab_separator = { fg = colors.mantle, bg = colors.mantle },
        tab_separator_selected = { fg = arctic.ice, bg = colors.base },
        diagnostic_selected = { bold = true },
        error_selected = { fg = arctic.rose, bg = colors.base, bold = true },
        error_diagnostic_selected = { fg = arctic.rose, bg = colors.base, bold = true },
        warning_selected = { fg = arctic.amber, bg = colors.base, bold = true },
        warning_diagnostic_selected = { fg = arctic.amber, bg = colors.base, bold = true },
      },
    }
  end,
}
```

- [ ] **Step 2: Add import to plugins/init.lua**

Add this line after the animate import added in Task 5:

```lua
  --- Buffer tabs
  { import = 'plugins.ui.bufferline' },
```

- [ ] **Step 3: Add buffer navigation keymaps to keymaps.lua**

Append at the end of `nvim/lua/core/keymaps.lua`:

```lua
--- Buffer navigation with Tab/Shift-Tab
--- Quick switching between open buffers visible in bufferline
vim.keymap.set('n', '<Tab>', '<cmd>bnext<CR>', { desc = 'Next buffer' })
vim.keymap.set('n', '<S-Tab>', '<cmd>bprevious<CR>', { desc = 'Previous buffer' })

--- Buffer management
vim.keymap.set('n', '<leader>bp', '<cmd>BufferLineTogglePin<CR>', { desc = '[B]uffer [p]in toggle' })
vim.keymap.set('n', '<leader>bc', '<cmd>BufferLineCloseOthers<CR>', { desc = '[B]uffer [c]lose others' })
vim.keymap.set('n', '<leader>bl', '<cmd>BufferLineCloseLeft<CR>', { desc = '[B]uffer close [l]eft' })
vim.keymap.set('n', '<leader>br', '<cmd>BufferLineCloseRight<CR>', { desc = '[B]uffer close [r]ight' })
```

- [ ] **Step 4: Open multiple files and verify**

Run: `nvim nvim/lua/core/colors.lua nvim/lua/core/keymaps.lua`
Expected: Buffer tabs visible at top showing both files. Press `<Tab>` to switch between them. Tabs styled with Arctic Blue — ice blue indicator on selected tab, dark mantle background on others.

- [ ] **Step 5: Commit**

```bash
git add nvim/lua/plugins/ui/bufferline.lua nvim/lua/plugins/init.lua nvim/lua/core/keymaps.lua
git commit -m "feat(nvim): add bufferline with Arctic Blue theme and Tab navigation"
```

---

### Task 7: Breadcrumbs — nvim-navic + barbecue.nvim

**Files:**
- Create: `nvim/lua/plugins/ui/barbecue.lua`
- Modify: `nvim/lua/plugins/init.lua` (add import)
- Modify: `nvim/lua/plugins/lsp/lspconfig.lua` (attach navic)

- [ ] **Step 1: Create barbecue.lua**

```lua
-- Winbar breadcrumbs — shows file > class > method context
-- Uses nvim-navic for LSP breadcrumb data, barbecue for the UI
return {
  'utilyre/barbecue.nvim',
  name = 'barbecue',
  version = '*',
  event = { 'BufReadPost', 'BufNewFile' },
  dependencies = {
    'SmiteshP/nvim-navic',
    'nvim-tree/nvim-web-devicons',
  },
  config = function()
    local colors = require 'core.colors'
    local arctic = colors.arctic

    require('barbecue').setup {
      theme = {
        normal = { fg = colors.subtext0, bg = colors.base },
        dirname = { fg = colors.overlay1 },
        basename = { fg = colors.text, bold = true },
        context = { fg = colors.subtext1 },
        context_file = { fg = arctic.teal },
        context_module = { fg = arctic.purple },
        context_namespace = { fg = arctic.purple },
        context_package = { fg = arctic.purple },
        context_class = { fg = arctic.teal },
        context_method = { fg = arctic.purple },
        context_property = { fg = colors.subtext1 },
        context_field = { fg = colors.subtext1 },
        context_constructor = { fg = arctic.teal },
        context_enum = { fg = arctic.teal },
        context_interface = { fg = arctic.teal },
        context_function = { fg = arctic.purple },
        context_variable = { fg = colors.text },
        context_constant = { fg = arctic.rose },
        context_string = { fg = arctic.amber },
        context_number = { fg = arctic.rose },
        context_boolean = { fg = arctic.rose },
        context_array = { fg = arctic.teal },
        context_object = { fg = arctic.teal },
        context_key = { fg = arctic.ice },
        context_null = { fg = arctic.rose },
        context_enum_member = { fg = arctic.rose },
        context_struct = { fg = arctic.teal },
        context_event = { fg = arctic.amber },
        context_operator = { fg = colors.overlay2 },
        context_type_parameter = { fg = arctic.teal },
        separator = { fg = colors.overlay0 },
        modified = { fg = arctic.amber },
        ellipsis = { fg = colors.overlay0 },
      },
      show_dirname = false,
      show_modified = true,
      exclude_filetypes = { 'snacks_dashboard', 'snacks_picker', 'toggleterm', 'help', 'lazy', 'mason' },
    }
  end,
}
```

- [ ] **Step 2: Add import to plugins/init.lua**

Add this line after the bufferline import added in Task 6:

```lua
  --- Winbar breadcrumbs
  { import = 'plugins.ui.barbecue' },
```

- [ ] **Step 3: Attach nvim-navic to LSP clients**

In `nvim/lua/plugins/lsp/lspconfig.lua`, add navic attachment inside the `LspAttach` callback. After the `local client = vim.lsp.get_client_by_id(event.data.client_id)` line (line 64), add:

```lua
    -- Attach nvim-navic for breadcrumbs
    if client and client.server_capabilities.documentSymbolProvider then
      local navic_ok, navic = pcall(require, 'nvim-navic')
      if navic_ok then
        navic.attach(client, event.buf)
      end
    end
```

- [ ] **Step 4: Open a PHP or Lua file with classes/functions and verify**

Run: `nvim nvim/lua/plugins/lsp/lspconfig.lua`
Expected: Winbar (top of buffer, below bufferline) shows breadcrumb path like `lspconfig.lua > LspAttach callback`. Navigate into a function — breadcrumb updates. Arctic Blue colors on the breadcrumb segments.

- [ ] **Step 5: Commit**

```bash
git add nvim/lua/plugins/ui/barbecue.lua nvim/lua/plugins/init.lua nvim/lua/plugins/lsp/lspconfig.lua
git commit -m "feat(nvim): add breadcrumb navigation with barbecue and nvim-navic"
```

---

### Task 8: Treesitter Context — Sticky Function Headers

**Files:**
- Modify: `nvim/lua/plugins/editor/treesitter.lua` (lines 1-26)

- [ ] **Step 1: Add nvim-treesitter-context as a dependency**

Replace the entire `treesitter.lua`:

```lua
return {
  {
    'nvim-treesitter/nvim-treesitter',
    lazy = false,
    build = ':TSUpdate',
    config = function()
      require('nvim-treesitter').setup {
        install_dir = vim.fn.stdpath 'data' .. '/site',
      }

      -- Install parsers (non-blocking)
      local parsers = { 'php', 'php_only', 'javascript', 'markdown', 'markdown_inline', 'json', 'css', 'lua', 'html' }
      require('nvim-treesitter').install(parsers)

      -- Enable highlighting, indentation, and folding per filetype
      vim.api.nvim_create_autocmd('FileType', {
        callback = function(args)
          if pcall(vim.treesitter.start, args.buf) then
            vim.bo[args.buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
            vim.wo[0][0].foldmethod = 'expr'
            vim.wo[0][0].foldexpr = 'v:lua.vim.treesitter.foldexpr()'
            vim.wo[0][0].foldenable = false
          end
        end,
      })
    end,
  },

  -- Sticky context: pin function/class header at top when scrolling
  {
    'nvim-treesitter/nvim-treesitter-context',
    event = { 'BufReadPost', 'BufNewFile' },
    opts = {
      enable = true,
      max_lines = 3,
      min_window_height = 20,
      multiline_threshold = 1,
      trim_scope = 'outer',
      mode = 'cursor',
    },
  },
}
```

- [ ] **Step 2: Open a file with long functions and scroll**

Run: `nvim nvim/lua/plugins/lsp/lspconfig.lua`
Expected: Scroll inside the `LspAttach` callback — the function header stays pinned at the top of the buffer with `arctic.cursorline` background (set in Task 2's custom_highlights). Shows max 3 lines of context.

- [ ] **Step 3: Commit**

```bash
git add nvim/lua/plugins/editor/treesitter.lua
git commit -m "feat(nvim): add sticky treesitter context for function headers"
```

---

### Task 9: Stream Readability — Options and Diagnostics

**Files:**
- Modify: `nvim/lua/core/options.lua` (lines 77-79, 130-139)

- [ ] **Step 1: Update signcolumn and add pumheight**

In `nvim/lua/core/options.lua`, change the signcolumn from `yes:2` to `yes:1` (line 79):

Replace:
```lua
vim.opt.signcolumn = 'yes:2'
```
With:
```lua
vim.opt.signcolumn = 'yes:1'
```

And add pumheight after the `confirm` option (after line 119):

```lua
--- Limit completion popup height
--- Prevents popup from overwhelming the screen on stream
vim.opt.pumheight = 12
```

- [ ] **Step 2: Update diagnostic signs with Arctic colors**

Replace the diagnostic config block (lines 130-139):

```lua
--- Diagnostic configuration with Arctic Blue colors
--- Custom icons and virtual text for stream readability
vim.diagnostic.config {
  signs = {
    text = {
      [vim.diagnostic.severity.ERROR] = '󰅚',
      [vim.diagnostic.severity.WARN] = '󰀪',
      [vim.diagnostic.severity.INFO] = '󰌶',
      [vim.diagnostic.severity.HINT] = '󰌵',
    },
  },
  virtual_text = {
    spacing = 4,
    prefix = '●',
  },
  float = {
    border = 'rounded',
    source = true,
  },
  severity_sort = true,
}
```

- [ ] **Step 3: Verify changes**

Run: `nvim nvim/lua/core/options.lua`
Expected: Sign column is narrower (1 column instead of 2). Trigger completion with `<C-Space>` — popup limited to 12 items max. Check `:set pumheight?` returns 12.

- [ ] **Step 4: Commit**

```bash
git add nvim/lua/core/options.lua
git commit -m "feat(nvim): optimize options for 1080p stream readability"
```

---

### Task 10: Noice.nvim — Notification Animations

**Files:**
- Modify: `nvim/lua/plugins/ui/noice.lua` (lines 1-55)

- [ ] **Step 1: Add notification route for fade-in effect**

Replace the entire `noice.lua`:

```lua
return {
  'folke/noice.nvim',
  event = 'VeryLazy',
  dependencies = {
    'MunifTanjim/nui.nvim',
  },
  opts = {
    cmdline = {
      view = 'cmdline_popup',
    },
    lsp = {
      override = {
        ['vim.lsp.util.convert_input_to_markdown_lines'] = true,
        ['vim.lsp.util.stylize_markdown'] = true,
        ['cmp.entry.get_documentation'] = true,
      },
    },
    presets = {
      command_palette = true,
      long_message_to_split = true,
      lsp_doc_border = true,
    },
    routes = {
      -- Skip "written" messages
      {
        filter = {
          event = 'msg_show',
          kind = '',
          find = 'written',
        },
        opts = { skip = true },
      },
    },
    views = {
      cmdline_popup = {
        position = {
          row = '40%',
          col = '50%',
        },
        size = {
          width = 60,
          height = 'auto',
        },
        border = {
          style = 'rounded',
          padding = { 0, 1 },
        },
      },
      popupmenu = {
        relative = 'editor',
        position = {
          row = '48%',
          col = '50%',
        },
        size = {
          width = 60,
          height = 10,
        },
        border = {
          style = 'rounded',
          padding = { 0, 1 },
        },
      },
      mini = {
        win_options = {
          winblend = 0,
        },
      },
    },
  },
}
```

- [ ] **Step 2: Verify notifications work**

Run: `nvim` then `:lua vim.notify("Arctic Blue test!", vim.log.levels.INFO)`
Expected: Notification appears with rounded border. "written" messages no longer show after saving files.

- [ ] **Step 3: Commit**

```bash
git add nvim/lua/plugins/ui/noice.lua
git commit -m "feat(nvim): improve noice notifications with cleaner routing"
```

---

### Task 11: Final Integration Verification

**Files:** None — verification only.

- [ ] **Step 1: Full restart test**

Close all Neovim instances. Run: `nvim`
Expected: Dashboard loads with RB monogram in ice blue, quote, 6 actions, recent files, startup time.

- [ ] **Step 2: Open a project file**

Press `f` on dashboard, open a PHP or Lua file.
Expected: 
- Bufferline visible at top with one tab
- Breadcrumbs in winbar showing file context
- Arctic Blue syntax highlighting (ice blue keywords, purple functions, amber strings)
- Indent guides visible
- Lualine at bottom with ice blue NORMAL mode

- [ ] **Step 3: Multi-file workflow test**

Open 3+ files with `:e <file>`.
Expected: All files show as tabs in bufferline. `<Tab>`/`<S-Tab>` cycles between them. `<leader>bp` pins a buffer.

- [ ] **Step 4: Scroll and animation test**

Scroll through a long file with `<C-d>` and `<C-u>`.
Expected: Smooth scroll animation. When inside a long function, treesitter context pins the function header. Mini.indentscope highlights active scope with teal.

- [ ] **Step 5: Zen mode test**

Press `<leader>z`.
Expected: Zen mode activates — statusline, line numbers, sign column hidden. Press `<leader>z` again to exit.

- [ ] **Step 6: Commit all-clear**

If all checks pass, no commit needed — each task already committed.
If any fixups required, commit them:
```bash
git add -u
git commit -m "fix(nvim): integration fixups for Arctic Blue stream setup"
```
