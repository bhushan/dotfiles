#!/usr/bin/env bash
source "$(dirname "$0")/utils.sh"

step "Setting up apps..."

[ -f "$HOME/.hushlogin" ] || touch "$HOME/.hushlogin"

ensure "oh-my-zsh" \
  "[ -d $HOME/.oh-my-zsh ]" \
  "RUNZSH=no KEEP_ZSHRC=yes /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)\""

ensure "TPM" \
  "[ -d $HOME/.tmux/plugins/tpm ]" \
  "git clone https://github.com/tmux-plugins/tpm $HOME/.tmux/plugins/tpm"

export PATH="$(brew --prefix)/opt/php@8.4/bin:$PATH"

ensure "Composer" \
  "command -v composer" \
  "php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\" &&
   php composer-setup.php --quiet &&
   php -r \"unlink('composer-setup.php');\" &&
   mv composer.phar \$(brew --prefix)/bin/composer &&
   chmod +x \$(brew --prefix)/bin/composer"

export PATH="$PATH:$HOME/.composer/vendor/bin"

ensure "Valet" \
  "command -v valet" \
  "composer global require laravel/valet &&
   $HOME/.composer/vendor/bin/valet install &&
   $HOME/.composer/vendor/bin/valet trust &&
   $HOME/.composer/vendor/bin/valet park $HOME/code"

valet use php@8.4 --force
