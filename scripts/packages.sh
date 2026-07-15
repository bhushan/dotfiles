#!/usr/bin/env bash
step "Syncing Homebrew packages (this may take a while on first run)..."
brew bundle --file="$DOTFILES/Brewfile" --verbose

step "Removing packages not in Brewfile..."
# Opportunistic disk hygiene, never load bearing: root-owned kegs (Valet runs
# nginx/dnsmasq via `sudo brew services`) make this exit 1 indefinitely. Under
# install's `set -e` that skipped links.sh and apps.sh entirely, so keep it
# non-fatal and let the run finish.
brew bundle cleanup --force --file="$DOTFILES/Brewfile" ||
  warn "package cleanup incomplete (see above); continuing"
