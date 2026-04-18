# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

- Always update CLAUDE.md after each change to the dotfiles (new tools, config changes, etc.)

## Overview

This is a personal dotfiles repository for macOS systems. A single `install` script handles everything — Homebrew, symlinks, packages, and dev tooling — for both fresh and existing machines.

## Installation & Setup

### Full Installation

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/bhushan/dotfiles/master/install)"
```

Works on a fresh Mac or an existing one. If the repo is already cloned:

```bash
bash ~/code/dotfiles/install
```

The `install` script:

1. Installs Xcode CLT if missing (re-run after)
2. Installs Homebrew if missing
3. Clones this repo to `~/code/dotfiles` if missing
4. Runs `scripts/packages.sh` — syncs Brewfile (install new, remove unlisted)
5. Runs `scripts/links.sh` — creates all symlinks
6. Runs `scripts/apps.sh` — installs oh-my-zsh, TPM, Composer, Valet

### Brewfile

Installs all dependencies defined in `Brewfile`, including:

- **Core development tools**: neovim, tmux, git, gh, lazygit
- **Shell enhancements**: zsh-syntax-highlighting, zsh-autosuggestions, starship
- **Modern CLI tools**: fzf, ripgrep, fd, zoxide, bat, eza, delta, jq, yq
- **Formatters**: shfmt, stylua, prettier
- **System utilities**: htop, btop, tldr, tree
- **Language runtimes**: php@8.4 (pinned), node (via nvm)
- **PHP build dependencies**: pkg-config, openssl, brotli, pcre2 (for PECL extensions)
- **Databases**: postgresql@17, pgvector, redis, DBngin (manages mysql, postgresql, redis)
- **Cloud tools**: awscli, terraform, session-manager-plugin
- **GUI applications**: kitty, claude, claude-code, hammerspoon, docker, vscode, phpstorm, webstorm, alfred, maccy
- **Browsers**: arc
- **Media**: spotify, obs

### Post-Installation

- oh-my-zsh is automatically installed if not present
- TPM (Tmux Plugin Manager) is auto-installed
- Composer is installed via php@8.4 directly (not brew, to avoid pulling in unversioned php which could upgrade to 8.5+)
- Laravel Valet is configured and trusts `~/code` directory

### PHP Extensions (Redis & Swoole)

After installing Homebrew packages, install PHP extensions via PECL:

```bash
# Install Redis extension
pecl install redis

# Install Swoole with sockets, openssl, and curl support (for Laravel Octane)
# Answer: yes, yes, no, yes, no, no, no, no, no, no, no, no, no
printf 'yes\nyes\nno\nyes\nno\nno\nno\nno\nno\nno\nno\nno\nno\n' | pecl install swoole
```

Verify extensions are installed:

```bash
php -m | grep -E "(redis|swoole)"
```

**Note**: PHP extensions need to be reinstalled after PHP version upgrades via Homebrew.

### Keeping Software Updated

```bash
bash update
```

Runs the `update` script which automatically updates:

- Homebrew itself and all installed packages
- Brewfile bundle (installs any newly added packages)
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

### Install Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `scripts/packages.sh` | Syncs Homebrew packages from `Brewfile` (installs new, removes unlisted) |
| `scripts/links.sh` | Creates all symlinks from dotfiles repo to their target locations |
| `scripts/apps.sh` | Installs oh-my-zsh, TPM, Composer, and Laravel Valet |

**Symlinks** (managed in `scripts/links.sh`):

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
- `claude/settings.json` → `~/.claude/settings.json`
- `claude/hooks` → `~/.claude/hooks`
- `claude/commands` → `~/.claude/commands`
- `claude/agents` → `~/.claude/agents`
- `claude/CLAUDE.md` → `~/.claude/CLAUDE.md`

### OBS Studio Configuration (`obs/`)

Automated OBS setup via Node.js scripts using `obs-websocket-js`. Profiles are generated dynamically by the `/obs-setup` Claude skill, which researches top creators in your niche and generates a fully wired scene collection.

**Generate a new profile:**

Use the `/obs-setup` skill in Claude Code — it interactively asks about your niche, platform, and brand, then researches best practices and generates `obs/scenes/<slug>.js` automatically.

**Run a generated profile:**

```bash
cd obs && npm install  # first time only
node setup.js --profile <slug>
```

Requires OBS Studio running with WebSocket server enabled (Tools > WebSocket Server Settings, port 4455, no auth).

**Scene files** (`obs/scenes/`) are generated by `/obs-setup` — each produces 6+ YouTube (16:9) scenes and 3+ Instagram Reels (9:16) vertical scenes with hotkeys, mic filters, and brand overlays tailored to the niche.

**Assets:** Background videos, camera masks, animated lower thirds, and stinger transitions are in `obs/assets/` directory.

**Scene transitions:** The setup script auto-configures per-scene transition overrides using `SetSceneSceneTransitionOverride`. If `obs/assets/transition.webm` exists, a Stinger transition is wired to all YouTube scenes; otherwise it falls back to Fade (500ms). Scene 7 (the visual transition) always uses a Cut override. To enable the Stinger: screen-record `assets/scenes/transition.html` with transparency and save as `obs/assets/transition.webm`.

### Claude Code Configuration (`claude/`)

Global Claude Code settings, hooks, custom commands, and agents managed via symlinks in `scripts/links.sh`.

**Hooks** (`claude/hooks/`):

- `prevent-push-protected-branches.sh` - Blocks `git push` to `develop`, `main`, and `release` branches (use PRs instead)
- `prevent-destructive-git.sh` - Blocks `git reset --hard`, `git clean -fd`, `git checkout -- .`, `git push --force`, `git branch -D`
- `prevent-rm-dangerous.sh` - Blocks `rm -rf` on critical paths (/, ~, node_modules, .git, .ssh, etc.)
- `prevent-read-env.sh` - Blocks reading `.env` files to protect secrets and credentials
- `prevent-write-credentials.sh` - Blocks writing to SSH keys, AWS credentials, .env files, kubeconfig, terraform state
- `prevent-dangerous-sql.sh` - Blocks DROP DATABASE, TRUNCATE TABLE, DELETE without WHERE

**Custom Commands** (`claude/commands/`) - Use with `/` prefix in Claude Code:

| Command | Description |
|---------|-------------|
| `/laravel-feature` | Scaffold a complete Laravel feature (model, migration, controller, routes, tests) |
| `/laravel-api` | Design and implement RESTful API endpoints in Laravel |
| `/laravel-test` | Write comprehensive Pest tests for Laravel code |
| `/laravel-migration` | Create database migrations with best practices |
| `/frontend-design` | Create production-grade frontend interfaces (React, Vue, Tailwind) via plugin |
| `/terraform-module` | Create Terraform modules with proper structure and security |
| `/aws-iac` | Design and implement AWS infrastructure (ECS, Lambda, RDS, S3, etc.) |
| `/docker-service` | Create Docker/Compose configurations with best practices |
| `/security-audit` | Comprehensive security audit (OWASP, Laravel, frontend, infrastructure) |
| `/performance-review` | Analyze code for performance issues (N+1, bundle size, caching) |
| `/refactor` | Systematic code refactoring with SOLID principles |
| `/debug` | Systematic debugging workflow (reproduce, hypothesize, fix, verify) |
| `/api-design` | Design RESTful APIs with pagination, filtering, error handling |
| `/git-worktree` | Set up git worktrees for feature development |
| `/deploy-checklist` | Pre-deployment verification checklist |
| `/obs-setup` | Research a content niche, generate OBS scenes/hotkeys/audio tailored to top creators in that field, and run setup |

**Agents** (`claude/agents/`) - Background agents for automated code quality:

| Agent | Model | Description |
|-------|-------|-------------|
| `orchestrator` | opus | Monitors all agents, provides unified status reports |
| `code-reviewer` | sonnet | Proactive code review after changes |
| `test-writer` | sonnet | Automatic test writing and execution |
| `architecture-reviewer` | sonnet | Reviews system design and architectural patterns |
| `compliance-reviewer` | sonnet | Checks code against compliance requirements (SOC2, HIPAA) |
| `doc-generator` | haiku | Writes project documentation after code changes |

**Settings** (`claude/settings.json`):

- Registers PreToolUse hooks (Bash, Read, Write, Edit matchers)
- Manages enabled plugins (claude-mem, frontend-design, laravel-boost, claude-hud)

### Neovim Configuration (`nvim/`)

Uses lazy.nvim plugin manager with modular structure:

**Core configuration** (`nvim/lua/core/`):

- `lazy.lua` - Plugin manager bootstrap and initialization
- `options.lua` - Editor settings (tabs, line numbers, search, etc.)
- `keymaps.lua` - Global key bindings
- `autocmds.lua` - Autocommands (file type settings, highlights, etc.)
- `colors.lua` - Catppuccin Mocha color palette (shared by all UI plugins)

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
- Snacks.nvim for terminal, notifications, dashboard, and vim.ui.select integration
- PHP refactoring via phprefactoring.nvim (`<C-e>` in PHP files)
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

1. Edit `scripts/links.sh`
2. Run `bash install` to re-apply

## Key Customizations

- **cmd+opt+d** toggles macOS dock (via Hammerspoon)
- Caps Lock remapped to Control/Escape (ControlEscape Spoon)
- Neovim format-on-save enabled with 500ms timeout
- Custom zsh theme at `zsh/themes/custom.zsh-theme`
- Git global ignore list at `global_gitignore`

## Theme: Catppuccin Mocha

All tools use a unified **Catppuccin Mocha** color scheme. The central color reference is at `colors/catppuccin-mocha.md`.

### Configured Applications

| Application | Config File                          | Theme Plugin/Config                   |
| ----------- | ------------------------------------ | ------------------------------------- |
| Kitty       | `kitty/current-theme.conf`           | Custom colors                         |
| tmux        | `tmux/tmux.conf`                     | Custom status line colors (variables) |
| Neovim      | `nvim/lua/plugins/ui/theme.lua`      | `catppuccin/nvim` with integrations   |
| Lualine     | `nvim/lua/plugins/ui/lualine.lua`    | Uses `core/colors.lua` shared palette |
| Snacks      | `nvim/lua/plugins/ui/snacks.lua`     | Uses `core/colors.lua` shared palette |
| VSCode      | `vscode/settings.json`               | Catppuccin Mocha theme                |
| lazygit     | `lazygit/config.yml`                 | Custom GUI theme                      |
| delta       | `gitconfig`                          | Nord syntax theme                     |

### Key Colors

- **Background**: `#1e1e2e`
- **Foreground**: `#cdd6f4`
- **Blue (accent)**: `#89b4fa`
- **Green (success)**: `#a6e3a1`
- **Red (error)**: `#f38ba8`
- **Mauve (keywords)**: `#cba6f7`

See `colors/catppuccin-mocha.md` for the complete palette.

### Arctic Blue Accent Palette

For streaming and content creation, Neovim includes an **Arctic Blue** palette in `nvim/lua/core/colors.lua` under the `arctic` table. This provides custom color overrides for syntax highlighting optimized for 1080p video:

- `ice` (`#7dcfff`) - keywords (local, return, function, if, for)
- `purple` (`#bb9af7`) - functions and method calls
- `amber` (`#e0af68`) - strings
- `teal` (`#73daca`) - types and classes
- `mint` (`#9ece6a`) - built-in functions, require
- `rose` (`#f7768e`) - constants, numbers, booleans
- `comment` (`#7a80a3`) - comments (brighter than default)
- `cursorline` (`#292e42`) - cursor line background
- `visual` (`#33467c`) - visual selection
- `gutter` (`#3b4261`) - active line numbers

Access via `require('core.colors').arctic` in Neovim plugin configs.

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
