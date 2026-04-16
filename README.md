# .files

Personal dotfiles for macOS. Take anything you want, but at your own risk.

## Setup

```bash
mkdir -p ~/code && git clone https://github.com/bhushan/dotfiles.git ~/code/dotfiles && bash ~/code/dotfiles/install
```

Re-run `bash ~/code/dotfiles/install` anytime to sync.

## What it does

1. Installs Xcode Command Line Tools (if missing — re-run after)
2. Installs Homebrew (if missing)
3. Syncs all Homebrew packages from `Brewfile` (installs new, removes unlisted)
4. Creates all symlinks
5. Installs oh-my-zsh, TPM, Composer, and Laravel Valet

## Notes

- `cmd+opt+d` toggles macOS dock (Hammerspoon)
- After a fresh install, open Kitty and launch `tmux` — plugins install on first run

## Always work in Progress...
