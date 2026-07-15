# AGENTS.md

Guidance for any AI agent or harness working in this repository.

This is the **canonical** instruction file. `CLAUDE.md` is a symlink to it, so Claude Code, Codex,
OpenCode, Cursor, Zed, Copilot, and anything else that reads `AGENTS.md` or `CLAUDE.md` all get the
same bytes. There is no second copy to keep in sync. Edit this file.

## Overview

Personal macOS dotfiles, plus an **AI OS**: one canonical tree (`agents/`) that configures every AI
coding agent on the machine from a single source of truth. A single `install` script handles
Homebrew, symlinks, packages, and dev tooling on both fresh and existing machines.

## Commands

```bash
bash install   # full setup, idempotent: packages, symlinks, apps
bash update    # update brew, oh-my-zsh, tmux, neovim, composer, npm, then clean up
bash doctor    # verify the AI OS is wired and these docs still match reality
```

Fresh machine:

```bash
mkdir -p ~/code && git clone https://github.com/bhushan/dotfiles.git ~/code/dotfiles
bash ~/code/dotfiles/install
```

`install` clones to `~/code/dotfiles` and symlinks `~/.dotfiles` to it, so docs and commands can use
portable `~/.dotfiles` paths instead of machine-specific absolute paths.

## Verification

Non-negotiable: **write the test first, then implement.**

```bash
bash doctor              # AI OS health: symlinks, registries, dead refs, phantom commands
bash scripts/doctor.test.sh   # unit tests for the doctor checks
cd obs && npm test            # OBS config/scene tests (node --test)
```

`doctor` exists because this repo's docs drifted from reality for months without anyone noticing. It
compares claims against the filesystem: every product/role/learning the kernel registers must exist,
every one on disk must be registered, every backticked repo path and markdown link in the docs must
resolve, and every documented `bash <command>` must be a real script. It exits 1 on failure.
**Run it after any change to `agents/`.**

When adding a check, add its test to `scripts/doctor.test.sh` first. Keep the check scoped to things
this repo owns: symlinks pointing into the repo are ours, a tool's own runtime state is not.

## Repository map

| Path | Purpose |
|------|---------|
| `install`, `update`, `doctor` | Entry points. Idempotent, safe to re-run. |
| `scripts/` | Install internals, sourced by the entry points (see below). |
| `agents/` | **The AI OS.** Single source of truth for all agent config. |
| `nvim/` | Neovim config. **Git submodule** ([bhushan/nvim](https://github.com/bhushan/nvim)) with its own README. |
| `obs/` | OBS Studio automation via `obs-websocket-js`. |
| `zsh/`, `aliases`, `gitconfig` | Shell and git configuration. |
| `kitty/`, `tmux/tmux.conf` | Terminal and multiplexer. |
| `hammerspoon/`, `karabiner/` | macOS automation and key remapping. |
| `vscode/`, `lazygit/` | Editor and git TUI settings. |
| `bin/` | Small scripts on `PATH` (`t`, `term-colors`). |
| `colors/catppuccin-mocha.md` | Canonical color reference for every tool. |
| `Brewfile` | All packages. Commented-out lines are deliberate; do not re-enable without asking. |

### Install internals (`scripts/`)

| Script | Purpose |
|--------|---------|
| `scripts/utils.sh` | Shared helpers (`step`, `link`, `ensure`). Sourced by everything. |
| `scripts/packages.sh` | Syncs `Brewfile` (installs new, removes unlisted). |
| `scripts/links.sh` | Creates every symlink. |
| `scripts/apps.sh` | Installs oh-my-zsh, TPM, Composer, Laravel Valet. |
| `scripts/doctor.sh` | AI OS health checks. Pure functions, sourced by `doctor`. |
| `scripts/doctor.test.sh` | Tests for the above. |

## The AI OS (`agents/`)

`agents/` is the single source of truth for global AI-agent configuration. `scripts/links.sh`
symlinks it into each tool's config directory, so every agent runs the same brain. Full system map
and extension guide: `agents/README.md`.

| Path | Purpose |
|------|---------|
| `agents/instructions/AGENTS.md` | **The kernel.** Founder context, learnings imports, product/role registries, operating principles. Symlinked as each tool's global instruction file. |
| `agents/learnings/` | Always-on cross-agent memory, auto-loaded into every session. |
| `agents/products/` | Product context packs (`alfred-scholar/`, `austa/`), each with `PRODUCT.md` and `assets/`. |
| `agents/subagents/` | Six founder roles: product-strategist, ux-reviewer, tech-lead, growth-marketer, copywriter, data-analyst. |
| `agents/commands/` | Shared slash-command prompts: `/ship`, `/security-audit`, `/performance-review`, `/obs-setup`. |
| `agents/skills/` | Shared skills, limited to `code-reviewer` and `frontend-designer`. Each `SKILL.md` stays under 300 lines. `agents/skills/.system` is Codex-managed; leave it alone. |
| `agents/hooks/` | Claude Code safety hooks: destructive git, dangerous `rm`, dangerous SQL, secret reads/writes, protected-branch pushes. |
| `agents/claude/`, `agents/gemini/`, `agents/opencode/`, `agents/codex/`, `agents/openai/` | Tool-specific settings only. |

### Wired harnesses

Five, all verified by `bash doctor`:

| Tool | Instruction file | Learnings reach context via |
|------|------------------|-----------------------------|
| Claude Code | `~/.claude/CLAUDE.md` | `@./learnings/*.md` imports |
| Gemini CLI | `~/.gemini/GEMINI.md` | same `@` imports |
| OpenCode | `~/.config/opencode/AGENTS.md` | `instructions` glob in `agents/opencode/opencode.jsonc` |
| Codex CLI | `~/.codex/AGENTS.md` | read directive in the kernel |
| OpenAI agents | `~/.openai/AGENTS.md` | read directive in the kernel |

Any other harness that reads a global `AGENTS.md` works by pointing it at `~/.dotfiles/agents/instructions/AGENTS.md`.

### Rules

- **Edit files under `agents/` only.** The home-directory locations are generated symlinks.
- Use portable paths (`~/.dotfiles`, `~/.config/agents`). Never machine-specific usernames, absolute
  home paths, hostnames, or keys. This repo is public and runs on multiple Macs.
- No secrets anywhere in this tree.
- When asked to remember something durable, write it to `agents/learnings/`, never a tool-specific
  memory store. Add a matching `@./learnings/<file>.md` import to the kernel so every agent loads it.
- Product facts (pricing, positioning, features) belong in `agents/products/<slug>/PRODUCT.md`, not
  in learnings.
- After changing `agents/`, run `bash doctor`.

### Two exceptions worth knowing

- `agents/codex/config.toml` is **copied**, not symlinked, to `~/.codex/config.toml` on first
  install. Codex writes machine-specific state into it (project trust, marketplaces, notify hooks),
  which must never land in the repo. Keep only portable defaults in the seed.
- `~/.gemini/skills` is deliberately **not** linked. Gemini already loads `~/.agents/skills`;
  linking both produces duplicate-skill warnings.

## Toolchain

`Brewfile` is the source of truth. Many entries are commented out on purpose (the setup is
deliberately slim), so **check `Brewfile` before assuming a tool exists.**

- **Core**: neovim, tmux, git, gh, lazygit, opencode, gemini-cli, claude, claude-code@latest
- **CLI**: fzf, ripgrep, fd, zoxide, git-delta, bat, eza, jq, yq, htop, btop, tldr, tree
- **Formatters**: shfmt, stylua
- **Languages**: php@8.4 (pinned), go, node (via nvm)
- **Databases**: postgresql@17, pgvector, redis
- **Cloud**: awscli, tfenv, session-manager-plugin
- **Media**: ffmpeg-full, whisper-cpp, obs, blackhole-2ch, drawpen
- **Apps**: kitty, hammerspoon, alfred, maccy, stats, docker-desktop, tableplus, postman, arc, spotify

Deliberately absent (commented out, **not available**): `prettier` and `starship` are redundant here
(Neovim formats via Mason's `prettierd`; the prompt is a custom zsh theme), plus VSCode, PhpStorm,
WebStorm, DBngin, and MySQL.

The `claude-code@latest` cask tracks current releases. Plain `claude-code` is a different, pinned,
older cask; listing it would make `brew bundle cleanup` uninstall the version actually in use.

### Formatting

```bash
stylua .        # Lua, config in stylua.toml (2 spaces, 120 cols)
shfmt -w <file> # Shell
```

Neovim formats on save via conform.nvim using Mason-installed tools (`prettierd`, `gofumpt`,
`goimports`, `ruff`) plus project-local Pint for PHP. Those live in Mason, not on `PATH`.

### PHP extensions

Reinstall after any PHP version upgrade:

```bash
pecl install redis
printf 'yes\nyes\nno\nyes\nno\nno\nno\nno\nno\nno\nno\nno\nno\n' | pecl install swoole
php -m | grep -E "(redis|swoole)"
```

## Neovim (`nvim/`)

A **git submodule** pointing at [bhushan/nvim](https://github.com/bhushan/nvim), symlinked to
`~/.config/nvim`. It has its own README and lifecycle. **Do not document its internals here.** That
is what drifted before. Read `nvim/README.md` and the config itself for plugin structure, LSP,
keymaps, and the Catppuccin + Arctic Blue palettes in `nvim/lua/core/colors.lua`.

Update: `bash update` runs `nvim --headless "+Lazy! sync" +qa`.

## OBS (`obs/`)

Node scripts driving OBS over `obs-websocket-js`. Requires OBS running with the WebSocket server
enabled (Tools > WebSocket Server Settings, port 4455, no auth).

```bash
cd obs && npm install       # first time
npm run setup:technical     # screen + camera + mic + system audio, ISO recordings
npm run setup:camera        # camera-only, for green-screen footage
npm test                    # config and scene tests
```

Two profiles live in `obs/scenes/`:

| Profile | Scene | Canvas | Use |
|---------|-------|--------|-----|
| `technical-tutorials` | screen, camera, mic, system audio | display size (1920x1080 fallback) @ 30fps | Tutorials, with per-source ISO files for editing |
| `youtube-shorts` | `1 [YS] Camera Only` | 3840x2160 @ 60fps | Raw green-screen camera for DaVinci Resolve |

Both record Apple ProRes 422 Hardware MOV to `~/Downloads/recordings`. Chroma Key is attached to the
camera but disabled by default, so the editor receives unkeyed footage.

ISO recording needs the `obs-source-record` plugin (`bash obs/install-source-record.sh`). System
audio needs BlackHole plus a Multi-Output Device (`bash obs/setup-multi-output.sh`).

## Theme

Everything is **Catppuccin Mocha**. Canonical palette: `colors/catppuccin-mocha.md`.

| Application | Config |
|-------------|--------|
| Kitty | `kitty/current-theme.conf` |
| tmux | `tmux/tmux.conf` |
| Neovim | `nvim/` submodule (catppuccin + Arctic Blue overrides) |
| lazygit | `lazygit/config.yml` |
| delta | `gitconfig` (Nord syntax theme) |
| OpenCode | `agents/opencode/themes/catppuccin-mocha.json` |
| VSCode | `vscode/settings.json` (settings symlinked; VSCode itself is not installed) |

Key colors: background `#1e1e2e`, foreground `#cdd6f4`, blue `#89b4fa`, green `#a6e3a1`,
red `#f38ba8`, mauve `#cba6f7`.

## Conventions

- Keep changes minimal, focused, and consistent with the surrounding code.
- Match the existing shell style: `#!/usr/bin/env bash`, `step` for section headers, `link` for
  symlinks, `ensure` for conditional installs.
- Symlink changes go in `scripts/links.sh`, then re-run `bash install`.
- Avoid destructive commands (force push, `git reset --hard`, `git clean -fd`, broad `rm -rf`)
  unless explicitly confirmed.
- Never commit secrets or machine-specific private details. This repo is public.
- **Update this file when the repo changes, then run `bash doctor` to prove it is still true.**
