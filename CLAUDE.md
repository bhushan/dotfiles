# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

- Always keep Claude.md file updated

## Overview

This is a personal dotfiles repository for macOS systems. It uses [Dotbot](https://github.com/anishathalye/dotbot) for installation and symlink management, configuring Neovim, Hammerspoon, Kitty, tmux, zsh, and various development tools.

## Installation & Setup

### Full Installation

```bash
bash install
```

This runs the `install` script which:

- Executes Dotbot with `install.conf.yaml` as the configuration
- Updates git submodules (Dotbot itself is a submodule)
- Creates symlinks from this repo to home directory locations

### Brewfile Installation

```bash
brew bundle
```

Installs all dependencies defined in `Brewfile`, including:

- **Core development tools**: neovim, tmux, git, gh, lazygit
- **Shell enhancements**: zsh-syntax-highlighting, zsh-autosuggestions, starship
- **Modern CLI tools**: fzf, ripgrep, fd, zoxide, bat, eza, delta, jq, yq
- **Formatters**: shfmt, stylua, prettier
- **System utilities**: htop, btop, tldr, tree
- **Language runtimes**: php, python, node (via nvm), java, composer
- **Databases**: mysql, sqlite
- **Cloud tools**: awscli
- **GUI applications**: kitty, claude-code, hammerspoon, docker, vscode, phpstorm, webstorm, alfred, maccy
- **Browsers**: arc
- **Media**: spotify, obs

### Post-Installation

- oh-my-zsh is automatically installed if not present
- TPM (Tmux Plugin Manager) is auto-installed
- Laravel Valet is configured and trusts `~/code` directory

### Keeping Software Updated

```bash
bash update
```

Runs the `update` script which automatically updates:

- Homebrew itself and all installed packages
- Brewfile bundle (installs any newly added packages)
- Dotbot (via git submodules)
- oh-my-zsh
- Tmux plugins (via TPM)
- Neovim plugins (via lazy.nvim)
- Composer global packages
- npm global packages
- Cleans up old versions and unused dependencies

## Code Formatting

### Lua (Neovim config)

```bash
stylua .
```

Configuration: `stylua.toml` (2 spaces, 120 column width)

### Shell Scripts

```bash
shfmt -w <file>
```

## Repository Architecture

### Dotbot Configuration (`install.conf.yaml`)

The central configuration file that defines:

- Which files/directories get symlinked where
- Shell commands to run during installation
- Directory creation tasks

Symlinks created:

- `nvim/` → `~/.config/nvim`
- `karabiner/` → `~/.config/karabiner`
- `kitty/` → `~/.config/kitty`
- `hammerspoon/` → `~/.hammerspoon`
- `tmux/tmux.conf` → `~/.tmux.conf`
- `aliases` → `~/.aliases`
- `vimrc` → `~/.vimrc`
- `ideavimrc` → `~/.ideavimrc`
- `gitconfig` → `~/.gitconfig`
- `global_gitignore` → `~/.global_gitignore`
- `vscode/keybindings.json` → `~/Library/Application Support/Code/User/keybindings.json`
- `vscode/settings.json` → `~/Library/Application Support/Code/User/settings.json`
- `lazygit/config.yml` → `~/Library/Application Support/lazygit/config.yml`
- `zsh/zshrc` → `~/.zshrc`
- `zsh/zprofile` → `~/.zprofile`
- `zsh/themes/custom.zsh-theme` → `~/.oh-my-zsh/themes/custom.zsh-theme`

### Neovim Configuration (`nvim/`)

Uses lazy.nvim plugin manager with modular structure:

**Core configuration** (`nvim/lua/core/`):

- `lazy.lua` - Plugin manager bootstrap and initialization
- `options.lua` - Editor settings (tabs, line numbers, search, etc.)
- `keymaps.lua` - Global key bindings
- `autocmds.lua` - Autocommands (file type settings, highlights, etc.)

**Plugin organization** (`nvim/lua/plugins/`):

- `init.lua` - Main plugin specifications with inline configs
- `editor/` - Editing enhancements (treesitter, cmp, autopairs, present)
- `ui/` - UI plugins (lualine, snacks, theme)
- `lsp/` - LSP configuration (language servers, formatters)
- `git/` - Git integration (gitsigns)
- `tools/` - Utility plugins (which-key)
- `lang/` - Language-specific tooling (php)

**Plugin management commands**:

- `:Lazy` - Open plugin manager
- `:Lazy update` - Update all plugins
- `:Lazy sync` - Install missing and update existing plugins

**Key plugins**:

- LSP via nvim-lspconfig with Mason for auto-installation
- Completion via nvim-cmp with multiple sources
- Formatting via conform.nvim (Pint for PHP, Stylua for Lua, Prettier for JS/TS)
- Treesitter for syntax highlighting
- Snacks.nvim for terminal, notifications, dashboard
- Custom coderunner.nvim for executing code (`<leader>x`)

### Hammerspoon Configuration (`hammerspoon/`)

Lua-based macOS automation:

- `init.lua` - Loads window management and shortcuts
- `window/` - Window tiling and arrangement
- `shortcuts/` - Global keyboard shortcuts
- `Spoons/ControlEscape` - Caps Lock → Control/Escape modifier

### Shell Aliases (`aliases`)

Loaded by zsh, defines shortcuts for:

- **Git**: `wip`, `nah`, `gl`, `push`, `pull`
- **PHP/Laravel**: `a` (artisan), `p` (pest), `pf` (pest --filter), `pint`, `sail`
- **Docker**: `d`, `dc`, `dcu`, `dcd`, `dps`
- **Editors**: `v` (vim), `n`/`nv`/`nvi` (nvim)
- **Database**: `db` function - opens database in TablePlus from .env

### Testing

Neovim includes vim-test integration with keybindings:

- `<C-t>` - Run nearest test
- `<C-S-t>` - Run last test
- `<Leader>rf` - Run test file
- `<Leader>rs` - Run test suite

For Laravel projects, use:

```bash
./vendor/bin/pest
./vendor/bin/pest --filter TestName
```

## Development Workflow

### Adding New Plugins to Neovim

1. Add plugin spec to `nvim/lua/plugins/init.lua` or create new file in `nvim/lua/plugins/<category>/`
2. Use `{ import = 'plugins.category.name' }` pattern for complex configs
3. Restart Neovim or run `:Lazy sync`

### Modifying Symlinks

1. Edit `install.conf.yaml`
2. Run `bash install` to update symlinks

### Updating Dotbot

```bash
git submodule update --remote dotbot
```

## Key Customizations

- **cmd+opt+d** toggles macOS dock (via Hammerspoon)
- Caps Lock remapped to Control/Escape (ControlEscape Spoon)
- Neovim format-on-save enabled with 500ms timeout
- Custom zsh theme at `zsh/themes/custom.zsh-theme`
- Git global ignore list at `global_gitignore`

## Modern CLI Tools

The Brewfile includes modern replacements for traditional Unix tools:

- **bat**: cat with syntax highlighting and git integration
- **eza**: Modern replacement for ls with git integration and icons
- **delta**: Better git diff viewer with syntax highlighting
- **zoxide**: Smarter cd command that learns your habits
- **btop**: Resource monitor (htop alternative) with modern UI
- **tldr**: Simplified man pages with practical examples
- **jq/yq**: JSON and YAML processors for CLI
- **starship**: Fast, customizable shell prompt
- **zsh-autosuggestions**: Fish-like autosuggestions for zsh

### Usage Examples

```bash
# Modern cat with syntax highlighting
bat file.js

# Modern ls with git status and icons
eza -la

# Jump to frequently used directories
z dotfiles

# Better git diffs (configured in gitconfig)
git diff

# Quick command examples
tldr git
```
