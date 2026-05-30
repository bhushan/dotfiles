#!/usr/bin/env bash
step "Symlinking dotfiles..."

link_learnings() {
  local dst="$1"
  mkdir -p "$(dirname "$dst")"

  if [[ -e "$dst" && ! -L "$dst" ]]; then
    echo "  $dst exists and was not replaced. Move any local learnings into $DOTFILES/agents/learnings, then remove $dst to enable the shared symlink."
    return
  fi

  ln -sfn "$DOTFILES/agents/learnings" "$dst"
  echo "  $dst"
}

# Shell
link aliases                      "$HOME/.aliases"
link zsh/zshrc                    "$HOME/.zshrc"
link zsh/zprofile                 "$HOME/.zprofile"
link zsh/themes/custom.zsh-theme  "$HOME/.oh-my-zsh/themes/custom.zsh-theme"

# Git
link gitconfig                    "$HOME/.gitconfig"
link global_gitignore             "$HOME/.global_gitignore"

# Editors
link nvim                         "$HOME/.config/nvim"
link vscode/keybindings.json      "$HOME/Library/Application Support/Code/User/keybindings.json"
link vscode/settings.json         "$HOME/Library/Application Support/Code/User/settings.json"

# Terminal / multiplexer
link kitty                        "$HOME/.config/kitty"
link tmux/tmux.conf               "$HOME/.tmux.conf"

# Tools
link karabiner                    "$HOME/.config/karabiner"
link hammerspoon                  "$HOME/.hammerspoon"
link lazygit/config.yml           "$HOME/Library/Application Support/lazygit/config.yml"

# Shared AI agents single source of truth
link agents                       "$HOME/.config/agents"
link agents/skills                "$HOME/.agents/skills"
link_learnings                    "$HOME/.agents/learnings"

# Claude Code
link agents/claude/settings.json  "$HOME/.claude/settings.json"
link agents/instructions/AGENTS.md "$HOME/.claude/CLAUDE.md"
link agents/instructions/AGENTS.md "$HOME/.claude/AGENTS.md"
link agents/commands             "$HOME/.claude/commands"
link agents/hooks                "$HOME/.claude/hooks"
link agents/skills               "$HOME/.claude/skills"
link_learnings                   "$HOME/.claude/learnings"
if [[ -L "$HOME/.claude/agents" ]]; then
  rm "$HOME/.claude/agents"
fi

# Gemini CLI
link agents/gemini/settings.json "$HOME/.gemini/settings.json"
link agents/instructions/AGENTS.md "$HOME/.gemini/GEMINI.md"
link agents/commands            "$HOME/.gemini/commands"
link_learnings                  "$HOME/.gemini/learnings"
# Gemini also loads ~/.agents/skills; linking ~/.gemini/skills creates duplicate skill warnings.
if [[ -L "$HOME/.gemini/skills" ]]; then
  rm "$HOME/.gemini/skills"
fi

# OpenCode
link agents/opencode/opencode.jsonc "$HOME/.config/opencode/opencode.jsonc"
link agents/opencode/tui.json       "$HOME/.config/opencode/tui.json"
link agents/opencode/themes/catppuccin-mocha.json "$HOME/.config/opencode/themes/catppuccin-mocha.json"
link agents/instructions/AGENTS.md  "$HOME/.config/opencode/AGENTS.md"
link agents/commands                "$HOME/.config/opencode/commands"
link agents/skills                  "$HOME/.config/opencode/skills"
link_learnings                      "$HOME/.config/opencode/learnings"
if [[ -L "$HOME/.config/opencode/agents" ]]; then
  rm "$HOME/.config/opencode/agents"
fi

# OpenAI Codex CLI
link agents/codex/config.toml      "$HOME/.codex/config.toml"
link agents/instructions/AGENTS.md "$HOME/.codex/AGENTS.md"
link agents/commands               "$HOME/.codex/prompts"
link agents/skills                 "$HOME/.codex/skills"
link_learnings                     "$HOME/.codex/learnings"

# Generic OpenAI agents
link agents/openai/settings.json   "$HOME/.openai/settings.json"
link agents/instructions/AGENTS.md "$HOME/.openai/AGENTS.md"
link agents/commands               "$HOME/.openai/prompts"
link agents/skills                 "$HOME/.openai/skills"
link_learnings                     "$HOME/.openai/learnings"

# Self-reference
ln -sfn "$DOTFILES" "$HOME/.dotfiles"

# Clean up broken symlinks in home dir
find "$HOME" -maxdepth 1 -type l ! -exec test -e {} \; -delete
