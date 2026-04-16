#!/usr/bin/env bash
# Syncs Homebrew packages with Brewfile (Terraform-style: installs new, removes unlisted).

step "Syncing Homebrew packages..."
brew bundle --file="$DOTFILES/Brewfile"
brew bundle cleanup --force --file="$DOTFILES/Brewfile"
