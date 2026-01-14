# GitHub Dimmed Color Palette

This is the central color reference for all theme configurations in this dotfiles repository.

## Core Colors

| Name               | Hex       | Usage                          |
| ------------------ | --------- | ------------------------------ |
| `bg`               | `#22272e` | Primary background             |
| `bg_highlight`     | `#2d333b` | Secondary background, panels   |
| `bg_visual`        | `#444c56` | Selection, visual mode         |
| `border`           | `#444c56` | Borders, separators            |
| `fg`               | `#adbac7` | Primary foreground             |
| `fg_muted`         | `#768390` | Comments, secondary text       |
| `fg_subtle`        | `#636e7b` | Very muted text                |

## Syntax Colors

| Name      | Hex       | Usage                                  |
| --------- | --------- | -------------------------------------- |
| `red`     | `#f47067` | Errors, deletions                      |
| `orange`  | `#e0823d` | Warnings, constants                    |
| `yellow`  | `#c69026` | Warnings, strings                      |
| `green`   | `#57ab5a` | Success, additions, strings            |
| `cyan`    | `#76e3ea` | Info, types                            |
| `blue`    | `#539bf5` | Links, functions                       |
| `purple`  | `#b083f0` | Keywords, special                      |
| `pink`    | `#e275ad` | Punctuation, operators                 |

## Bright Variants (Terminal Colors)

| Name            | Hex       |
| --------------- | --------- |
| `bright_black`  | `#636e7b` |
| `bright_red`    | `#ff938a` |
| `bright_green`  | `#6bc46d` |
| `bright_yellow` | `#daaa3f` |
| `bright_blue`   | `#6cb6ff` |
| `bright_purple` | `#dcbdfb` |
| `bright_cyan`   | `#96d0ff` |
| `bright_white`  | `#cdd9e5` |

## Special Colors

| Name            | Hex       | Usage                          |
| --------------- | --------- | ------------------------------ |
| `cursor`        | `#539bf5` | Cursor                         |
| `diff_add`      | `#2b3d32` | Git diff added background      |
| `diff_delete`   | `#3d2b2b` | Git diff deleted background    |
| `diff_change`   | `#3b3323` | Git diff changed background    |

## Configurations Using This Palette

- `kitty/current-theme.conf` - Terminal emulator
- `tmux/tmux.conf` - Terminal multiplexer status line
- `nvim/lua/plugins/ui/theme.lua` - Neovim colorscheme
