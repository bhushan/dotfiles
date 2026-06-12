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

- **Core development tools**: neovim, tmux, git, gh, lazygit, OpenCode
- **Shell enhancements**: zsh-syntax-highlighting, zsh-autosuggestions, starship
- **Modern CLI tools**: fzf, ripgrep, fd, zoxide, bat, eza, delta, jq, yq
- **Formatters**: shfmt, stylua, prettier
- **System utilities**: htop, btop, tldr, tree
- **Language runtimes**: php@8.4 (pinned), node (via nvm), go
- **PHP build dependencies**: pkg-config, openssl, brotli, pcre2 (for PECL extensions)
- **Databases**: postgresql@17, pgvector, redis, DBngin (manages mysql, postgresql, redis)
- **Cloud tools**: awscli, terraform, session-manager-plugin
- **GUI applications**: kitty, claude, claude-code, hammerspoon, docker, vscode, phpstorm, webstorm, alfred, maccy
- **Browsers**: arc
- **Media**: spotify, obs, drawpen (on-screen annotation)

### Post-Installation

- oh-my-zsh is automatically installed if not present
- TPM (Tmux Plugin Manager) is auto-installed
- Composer is installed via php@8.4 directly (not brew, to avoid pulling in unversioned php which could upgrade to 8.5+)
- Laravel Valet is configured and trusts `~/code` directory
- Valet switches to php@8.4 when run interactively; non-interactive installs skip the sudo-backed PHP switch

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
- `gitconfig` → `~/.gitconfig`
- `global_gitignore` → `~/.global_gitignore`
- `vscode/keybindings.json` → `~/Library/Application Support/Code/User/keybindings.json`
- `vscode/settings.json` → `~/Library/Application Support/Code/User/settings.json`
- `lazygit/config.yml` → `~/Library/Application Support/lazygit/config.yml`
- `zsh/zshrc` → `~/.zshrc`
- `zsh/zprofile` → `~/.zprofile`
- `zsh/themes/custom.zsh-theme` → `~/.oh-my-zsh/themes/custom.zsh-theme`
- `agents/` → `~/.config/agents`
- `agents/skills` → `~/.agents/skills`
- `agents/learnings` → `~/.agents/learnings`, `~/.claude/learnings`, `~/.gemini/learnings`, `~/.config/opencode/learnings`, `~/.codex/learnings`, `~/.openai/learnings`
- `agents/subagents` → `~/.claude/agents`, `~/.config/opencode/agent` (founder role subagents)
- `agents/claude/settings.json` → `~/.claude/settings.json`
- `agents/instructions/AGENTS.md` → `~/.claude/CLAUDE.md`, `~/.claude/AGENTS.md`, `~/.gemini/GEMINI.md`, `~/.config/opencode/AGENTS.md`, `~/.codex/AGENTS.md`, `~/.openai/AGENTS.md`
- `agents/commands` → Claude, Gemini, OpenCode, Codex, and OpenAI prompt/command directories
- `agents/hooks` → `~/.claude/hooks`
- `agents/opencode/opencode.jsonc` → `~/.config/opencode/opencode.jsonc`
- `agents/opencode/tui.json` → `~/.config/opencode/tui.json`
- `agents/opencode/themes/catppuccin-mocha.json` → `~/.config/opencode/themes/catppuccin-mocha.json`
- `agents/codex/config.toml` → seeded (copied once, not symlinked) to `~/.codex/config.toml`; Codex writes machine-specific state there
- `agents/openai/settings.json` → `~/.openai/settings.json`

### OBS Studio Configuration (`obs/`)

Minimal, high-quality recording setup via Node.js scripts using `obs-websocket-js`. Designed to capture isolated source files for post-production in DaVinci Resolve.

**Setup:**

```bash
cd obs && npm install  # first time only
node setup.js --profile technical-tutorials
```

Requires OBS Studio running with WebSocket server enabled (Tools > WebSocket Server Settings, port 4455, no auth).

**What it creates:** A single recording scene with screen capture, camera, mic (with noise suppression/gate/compressor), and system audio. No overlays, no transitions, no cropping — just clean source capture.

**ISO recordings (obs-source-record):** Each recording session produces isolated files alongside the main combined output. Install the plugin first:

```bash
bash obs/install-source-record.sh
```

Screen and camera ISOs are created automatically when recording starts. Audio is extracted automatically when recording stops (via auto-extract watcher). Manual extraction:

```bash
bash obs/extract-audio.sh
```

This produces a clean session folder:

```
~/Downloads/recordings/2026-04-24_15-25-17/
  ├── combined.mov   — ProRes 422 main recording (all sources)
  ├── screen.mkv     — screen capture only (H.264 hw, 10Mbps)
  ├── camera.mkv     — camera only (x264 sw, 8Mbps)
  ├── mic.wav        — microphone (extracted from main Track 2)
  └── system.wav     — system audio (extracted from main Track 3)
```

**System audio** requires BlackHole virtual audio driver (`brew install --cask blackhole-2ch`) and a Multi-Output Device in Audio MIDI Setup. Run `bash obs/setup-multi-output.sh` to configure.

**Recording quality:**

| Output | Encoder | Bitrate | Format |
|--------|---------|---------|--------|
| Main (combined) | Apple ProRes 422 Hardware | ~150 Mbps | MOV |
| Screen ISO | Apple VT H.264 Hardware | 10 Mbps CBR | MKV |
| Camera ISO | x264 Software | 8 Mbps CBR | MKV |
| Audio | PCM 16-bit | lossless | WAV |

Canvas: 1920x1080 @ 30fps. Zero frame drops on M2 Pro.

### Shared Agent Configuration (`agents/`): the AI OS

`agents/` is the single source of truth for global AI-agent configuration across Claude Code, Gemini CLI, OpenCode, OpenAI Codex CLI, generic OpenAI agents, and Zed/global skills. Full system map: `agents/README.md`.

**Canonical files:**

| Path | Purpose |
|------|---------|
| `agents/instructions/AGENTS.md` | The kernel: founder context, learnings import, product/role registries, operating principles. Symlinked into each agent's config dir |
| `agents/learnings/` | Always-on cross-agent memory; `preferences.md` is auto-loaded into every agent's context (Claude/Gemini via `@./learnings/preferences.md` import, OpenCode via `instructions` glob, others via read directive) |
| `agents/products/` | Product context packs: `alfred-scholar/` and `austa/`, each with `PRODUCT.md` plus `assets/` (logos, og-images, favicons) |
| `agents/subagents/` | Founder role subagents: product-strategist, ux-reviewer, tech-lead, growth-marketer, copywriter, data-analyst. Frontmatter is Claude + OpenCode compatible |
| `agents/commands/` | Shared slash-command prompts, including `/security-audit`, `/performance-review`, `/ship`, and `/obs-setup` |
| `agents/skills/` | Shared skill packages, limited to `code-reviewer` and `frontend-designer`, each under 300 lines; `skills/.system/` is Codex-managed. Gemini uses `~/.agents/skills` directly to avoid duplicate skill warnings |
| `agents/hooks/` | Claude Code safety hooks for destructive commands, secret reads/writes, and dangerous SQL |
| `agents/claude/` | Claude Code settings |
| `agents/gemini/` | Gemini CLI settings |
| `agents/opencode/` | OpenCode settings, TUI config, MCP servers, and themes |
| `agents/codex/` | OpenAI Codex CLI settings |
| `agents/openai/` | Generic OpenAI agent settings |

`agents/instructions/learnings` is a repo-relative symlink to `../learnings` so the `@./learnings/...` import resolves whether tools follow the home symlink or the real path.

Edit files under `agents/` first; the home-directory locations are generated symlinks. Use `~/.dotfiles` in docs and commands instead of machine-specific absolute paths so the repo remains portable and safe to publish. When the user asks any agent to store something in memory, save it in `agents/learnings/` so all agents share the same learnings. Product facts (positioning, pricing, features, brand) belong in `agents/products/<product>/PRODUCT.md`, not in learnings.

**Installed shared skills:**

| Skill | Path | Purpose |
|-------|------|---------|
| `code-reviewer` | `agents/skills/code-reviewer/SKILL.md` | Strict maintainability and code-quality review skill based on Cursor's thermo-nuclear review skill |
| `frontend-designer` | `agents/skills/frontend-designer/SKILL.md` | Production-grade frontend UI design skill based on Anthropic's frontend-design skill |

### Neovim Configuration (`nvim/`)

Uses lazy.nvim plugin manager with modular structure:

**Core configuration** (`nvim/lua/core/`):

- `lazy.lua` - Plugin manager bootstrap and initialization
- `options.lua` - Editor settings (tabs, line numbers, search, etc.)
- `keymaps.lua` - Global key bindings
- `autocmds.lua` - Autocommands (file type settings, highlights, etc.)
- `colors.lua` - Catppuccin Mocha + Arctic Blue color palette (shared by all UI plugins)

**Plugin organization** (`nvim/lua/plugins/`):

- `init.lua` - Main plugin specifications with inline configs
- `editor/` - Editing enhancements (treesitter, treesitter-context, cmp, autopairs, present)
- `ui/` - UI plugins (lualine, snacks, theme, bufferline, barbecue, animate, noice, grug-far)
- `lsp/` - LSP configuration (language servers, formatters)
- `git/` - Git integration (gitsigns)
- `tools/` - Utility plugins (which-key)
- `lang/` - Language-specific tooling (php, go)

**Plugin management commands**:

- `:Lazy` - Open plugin manager
- `:Lazy update` - Update all plugins
- `:Lazy sync` - Install missing and update existing plugins

**Key plugins**:

- LSP via nvim-lspconfig with Mason for auto-installation (intelephense, vtsls + eslint, gopls, basedpyright + ruff, lua_ls, and web servers)
- Completion via blink.cmp (fast Rust-based engine) with LSP, path, snippets, and buffer sources
- Formatting via conform.nvim (Pint for PHP, Stylua for Lua, Prettier for JS/TS, goimports + gofumpt for Go, Ruff for Python)
- Go tooling via gopher.nvim (`:GoTagAdd`, `:GoImpl`, `:GoIfErr`), command-driven with no keybindings
- Treesitter for syntax highlighting + treesitter-context for sticky function headers
- Snacks.nvim for terminal, dashboard (branded RB + quote), zen mode, and pickers
- Bufferline.nvim for visual buffer tabs (`<Tab>`/`<S-Tab>` to switch)
- Barbecue.nvim + nvim-navic for winbar breadcrumbs (file > class > method)
- mini.animate for smooth cursor/scroll/resize animations
- mini.indentscope for animated active indent scope (teal)
- indent-blankline.nvim for static indent guides
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
| OpenCode    | `opencode/themes/catppuccin-mocha.json` | Custom Catppuccin Mocha theme      |

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
