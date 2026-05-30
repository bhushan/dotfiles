# .files

Personal dotfiles for macOS. Take anything you want, but at your own risk.

## Setup

```bash
mkdir -p ~/code && git clone https://github.com/bhushan/dotfiles.git ~/code/dotfiles && bash ~/code/dotfiles/install
```

Re-run `bash ~/code/dotfiles/install` anytime to sync. The installer also creates `~/.dotfiles` as a portable self-reference, so commands and docs can avoid machine-specific absolute paths.

## What it does

1. Installs Xcode Command Line Tools (if missing, re-run after)
2. Installs Homebrew (if missing)
3. Syncs all Homebrew packages from `Brewfile` (installs new, removes unlisted)
4. Creates all symlinks, including shared agent config for Claude Code, Gemini CLI, OpenCode, OpenAI Codex CLI, generic OpenAI agents, and global skills
5. Installs oh-my-zsh, TPM, Composer, and Laravel Valet

## Shared agents and skills

Global agent configuration lives in `agents/`:

- `agents/instructions/AGENTS.md` is the shared instruction file.
- `agents/commands/` contains reusable slash-command prompts.
- `agents/skills/` contains only `code-reviewer` and `frontend-designer` and is symlinked to `~/.agents/skills`. Gemini uses this global skills path directly, so `~/.gemini/skills` is intentionally not linked.
- `agents/learnings/` stores shared cross-agent memory. When any agent is asked to remember something or store something in memory, it should update this folder.
- Tool-specific settings live in `agents/claude`, `agents/gemini`, `agents/opencode`, `agents/codex`, and `agents/openai`.

Edit files in `agents/` first, then re-run `bash ~/.dotfiles/install` to refresh symlinks.

## Notes

- `cmd+opt+d` toggles macOS dock (Hammerspoon)
- After a fresh install, open Kitty and launch `tmux`; plugins install on first run

## Always work in Progress...
