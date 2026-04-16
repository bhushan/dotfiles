#!/usr/bin/env bash
source "$(dirname "$0")/utils.sh"

step "Symlinking dotfiles..."

# Shell
link aliases                      "$HOME/.aliases"
link zsh/zshrc                    "$HOME/.zshrc"
link zsh/zprofile                 "$HOME/.zprofile"
link zsh/themes/custom.zsh-theme  "$HOME/.oh-my-zsh/themes/custom.zsh-theme"

# Git
link gitconfig                    "$HOME/.gitconfig"
link global_gitignore             "$HOME/.global_gitignore"

# Editors
link vimrc                        "$HOME/.vimrc"
link ideavimrc                    "$HOME/.ideavimrc"
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

# Claude Code
link claude/settings.json         "$HOME/.claude/settings.json"
link claude/hooks                 "$HOME/.claude/hooks"
link claude/commands              "$HOME/.claude/commands"
link claude/agents                "$HOME/.claude/agents"
link claude/CLAUDE.md             "$HOME/.claude/CLAUDE.md"

# Self-reference
ln -sfn "$DOTFILES" "$HOME/.dotfiles"

# Clean up broken symlinks in home dir
find "$HOME" -maxdepth 1 -type l ! -exec test -e {} \; -delete
