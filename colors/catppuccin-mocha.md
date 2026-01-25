# Catppuccin Mocha Color Palette

This is the central color reference for all theme configurations in this dotfiles repository.

## Base Colors

| Name       | Hex       | Usage                           |
| ---------- | --------- | ------------------------------- |
| `base`     | `#1e1e2e` | Primary background              |
| `mantle`   | `#181825` | Darker background (panels)      |
| `crust`    | `#11111b` | Darkest background              |
| `surface0` | `#313244` | Secondary background, panels    |
| `surface1` | `#45475a` | Selection, visual mode, borders |
| `surface2` | `#585b70` | Inactive elements               |

## Text Colors

| Name       | Hex       | Usage                |
| ---------- | --------- | -------------------- |
| `text`     | `#cdd6f4` | Primary foreground   |
| `subtext1` | `#bac2de` | Secondary text       |
| `subtext0` | `#a6adc8` | Muted text, comments |
| `overlay2` | `#9399b2` | Dimmed text          |
| `overlay1` | `#7f849c` | More dimmed text     |
| `overlay0` | `#6c7086` | Very muted text      |

## Syntax Colors

| Name        | Hex       | Usage                       |
| ----------- | --------- | --------------------------- |
| `red`       | `#f38ba8` | Errors, deletions           |
| `maroon`    | `#eba0ac` | Warnings (alt)              |
| `peach`     | `#fab387` | Constants, numbers          |
| `yellow`    | `#f9e2af` | Warnings, strings           |
| `green`     | `#a6e3a1` | Success, additions, strings |
| `teal`      | `#94e2d5` | Info, types                 |
| `sky`       | `#89dceb` | Secondary info              |
| `sapphire`  | `#74c7ec` | Links (alt)                 |
| `blue`      | `#89b4fa` | Links, functions            |
| `lavender`  | `#b4befe` | Highlights                  |
| `mauve`     | `#cba6f7` | Keywords, special           |
| `pink`      | `#f5c2e7` | Punctuation, operators      |
| `flamingo`  | `#f2cdcd` | Tags                        |
| `rosewater` | `#f5e0dc` | Cursor, accent              |

## Terminal Colors (16-color)

| Name      | Normal    | Bright    |
| --------- | --------- | --------- |
| `black`   | `#45475a` | `#585b70` |
| `red`     | `#f38ba8` | `#f38ba8` |
| `green`   | `#a6e3a1` | `#a6e3a1` |
| `yellow`  | `#f9e2af` | `#f9e2af` |
| `blue`    | `#89b4fa` | `#89b4fa` |
| `magenta` | `#f5c2e7` | `#f5c2e7` |
| `cyan`    | `#94e2d5` | `#94e2d5` |
| `white`   | `#bac2de` | `#a6adc8` |

## Special Colors

| Name          | Hex       | Usage                       |
| ------------- | --------- | --------------------------- |
| `cursor`      | `#f5e0dc` | Cursor                      |
| `diff_add`    | `#1e3a2f` | Git diff added background   |
| `diff_delete` | `#3e2a2e` | Git diff deleted background |
| `diff_change` | `#3a3a1e` | Git diff changed background |

## Configurations Using This Palette

- `kitty/current-theme.conf` - Terminal emulator
- `tmux/tmux.conf` - Terminal multiplexer status line (uses variables)
- `nvim/lua/core/colors.lua` - **Shared Neovim color module** (source of truth for all Neovim plugins)
- `nvim/lua/plugins/ui/theme.lua` - Neovim colorscheme (`catppuccin/nvim`)
- `nvim/lua/plugins/ui/lualine.lua` - Neovim status line (uses `core.colors`)
- `nvim/lua/plugins/ui/snacks.lua` - Snacks.nvim highlights (uses `core.colors`)
- `vscode/settings.json` - VSCode editor (Catppuccin Mocha theme)
- `vscode/hide-top-bar.css` - VSCode title bar (base color)
- `lazygit/config.yml` - Lazygit GUI
- `gitconfig` - Delta diff viewer
