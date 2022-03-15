# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell"

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git)

source $ZSH/oh-my-zsh.sh

source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

export NVM_DIR="$HOME/.nvm"
  [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
  [ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && . "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion

source ~/.aliases

export PATH="$HOME/.composer/vendor/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"
export PATH="$HOME/.symfony/bin:$PATH"

export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

# -------- Dynamically switch light and dark mode -------- #
# currently to enable dark mode, comment export line below
# export LIGHT_MODE="set-to-something"

setITermProfile() {
  if [ -n "$1" ]; then
    # Set iTerm2 profile based on argument
    echo -e "\033]50;SetProfile=$1\a"
    return
  fi

  if [ -z ${LIGHT_MODE+x} ]; then
    # Set iTerm2 profile to dark mode
    echo -e "\033]50;SetProfile=dark\a"
    return
  fi

  # Set iTerm2 profile to light mode
  echo -e "\033]50;SetProfile=light\a"
}
# -------- Dynamically switch light and dark mode end -------- #

# -------- tmux session config -------- #
# Attach to session
ta() {
  if [ -n "$1" ]; then
    tmux attach -t $1
    return
  fi

  tmux ls && read tmux_session && tmux attach -t ${tmux_session:-main} || tmux new -s ${tmux_session:-main}
}

# Ensure attached to session when opening new terminal windows
if [ -z "$TMUX" ]; then
  setITermProfile
  # needs to be excuted after iterm profile is set properly
  ta
fi
# -------- tmux session config end -------- #
