# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell"

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git jsontools)

source $ZSH/oh-my-zsh.sh

source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

export NVM_DIR="$HOME/.nvm"
  [ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"  # This loads nvm
  [ -s "$(brew --prefix nvm)/etc/bash_completion.d/nvm" ] && . "$(brew --prefix nvm)/etc/bash_completion.d/nvm"  # This loads nvm bash_completion

source ~/.aliases

export PATH="$HOME/.composer/vendor/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"
export PATH="$HOME/.symfony/bin:$PATH"
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

# -------- Dynamically switch light and dark mode -------- #
# currently to enable dark mode, comment export line below
# export LIGHT_MODE="enabled"

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

if [  "$TERMINAL_EMULATOR" != "JetBrains-JediTerm" ]; then
  if [  "$TERM_PROGRAM" != "vscode" ]; then
    # Ensure attached to session when opening new terminal windows
    if [ -z "$TMUX" ]; then
    setITermProfile
    # needs to be excuted after iterm profile is set properly
    ta
    fi
  fi
fi
# -------- tmux session config end -------- #


# -------- Recursively create directory and touch file if exists -------- #
rtouch () {
  if [ -n "$1" ]; then
    local _file=$1
    mkdir -p "${_file%/*}";
    touch "${_file}";
    return
  fi

  echo "Please provide file path ex. rtouch ~/code/temp/example.js"
}
# -------- Recursively create directory and touch file if exists end -------- #

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# -------- For Office specific settings -------- #
local FILE=~/.org_zshrc

if [[ -f "$FILE" ]]; then
  source $FILE
fi
# -------- For Office specific settings end -------- #

# -------- VI MODE on terminal -------- #
# Basic auto/tab complete:
autoload -U compinit
zstyle ':completion:*' menu select
zmodload zsh/complist
compinit
_comp_options+=(globdots)		# Include hidden files.
bindkey -v
export KEYTIMEOUT=1

# Use vim keys in tab complete menu:
bindkey -M menuselect 'h' vi-backward-char
bindkey -M menuselect 'k' vi-up-line-or-history
bindkey -M menuselect 'l' vi-forward-char
bindkey -M menuselect 'j' vi-down-line-or-history
bindkey -v '^?' backward-delete-char

# Change cursor shape for different vi modes.
function zle-keymap-select {
  if [[ ${KEYMAP} == vicmd ]] ||
     [[ $1 = 'block' ]]; then
    echo -ne '\e[1 q'
  elif [[ ${KEYMAP} == main ]] ||
       [[ ${KEYMAP} == viins ]] ||
       [[ ${KEYMAP} = '' ]] ||
       [[ $1 = 'beam' ]]; then
    echo -ne '\e[5 q'
  fi
}
zle -N zle-keymap-select
zle-line-init() {
    zle -K viins # initiate `vi insert` as keymap (can be removed if `bindkey -V` has been set elsewhere)
    echo -ne "\e[5 q"
}
zle -N zle-line-init
echo -ne '\e[5 q' # Use beam shape cursor on startup.
preexec() { echo -ne '\e[5 q' ;} # Use beam shape cursor for each new prompt.

# Edit line in vim with ctrl-e:
autoload edit-command-line; zle -N edit-command-line
bindkey '^e' edit-command-line
# -------- VI MODE on terminal end -------- #
