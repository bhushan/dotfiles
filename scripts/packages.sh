#!/usr/bin/env bash
source "$(dirname "$0")/utils.sh"

step "Syncing Homebrew packages (this may take a while on first run)..."
brew bundle --file="$DOTFILES/Brewfile" --verbose

step "Removing packages not in Brewfile..."
brew bundle cleanup --force --file="$DOTFILES/Brewfile"
