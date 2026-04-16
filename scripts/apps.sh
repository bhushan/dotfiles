#!/usr/bin/env bash
# Installs shell tooling and dev environment apps.
# Safe to re-run: each step checks before acting.

step "Setting up apps..."

# Hush the "last login" message
[ -f "$HOME/.hushlogin" ] || touch "$HOME/.hushlogin"

# oh-my-zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  echo "  installing oh-my-zsh"
  RUNZSH=no KEEP_ZSHRC=yes /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
else
  echo "  oh-my-zsh already installed"
fi

# Tmux Plugin Manager
if [ ! -d "$HOME/.tmux/plugins/tpm" ]; then
  echo "  installing TPM"
  git clone https://github.com/tmux-plugins/tpm "$HOME/.tmux/plugins/tpm"
else
  echo "  TPM already installed"
fi

# Composer (via php@8.4 from Homebrew, not brew's own php to avoid version drift)
if ! command -v composer &>/dev/null; then
  echo "  installing Composer"
  php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
  php composer-setup.php --quiet
  php -r "unlink('composer-setup.php');"
  mv composer.phar /opt/homebrew/bin/composer
  chmod +x /opt/homebrew/bin/composer
else
  echo "  Composer already installed"
fi

# Laravel Valet
export PATH="$PATH:$HOME/.composer/vendor/bin"
if ! command -v valet &>/dev/null; then
  echo "  installing Laravel Valet"
  mkdir -p "$HOME/code"
  composer global require laravel/valet
  "$HOME/.composer/vendor/bin/valet" install
  "$HOME/.composer/vendor/bin/valet" trust
  "$HOME/.composer/vendor/bin/valet" park "$HOME/code"
else
  echo "  Valet already installed"
fi
