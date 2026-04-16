#!/usr/bin/env bash
# Shared helpers — sourced by all scripts.

step() { echo ""; echo "==> $*"; }

# link <repo-relative-path> <destination>
# Safe to re-run. Handles both files and directories.
link() {
  local src="$DOTFILES/$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  [[ -d "$dst" && ! -L "$dst" ]] && rm -rf "$dst"
  ln -sfn "$src" "$dst"
  echo "  $dst"
}

# ensure <label> <check-command> <install-command>
# Runs install-command only if check-command fails.
ensure() {
  local label="$1" check="$2" install="$3"
  if eval "$check" &>/dev/null; then
    echo "  $label already installed"
  else
    echo "  installing $label"
    eval "$install"
  fi
}
