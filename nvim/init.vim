"install vim-plug if it is not already installed
let data_dir = has('nvim') ? stdpath('data') . '/site' : '~/.vim'
if empty(glob(data_dir . '/autoload/plug.vim'))
    silent execute '!curl -fLo '.data_dir.'/autoload/plug.vim --create-dirs  https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'
    autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

"load all plugins
call plug#begin()
    source ~/.config/nvim/plugins.vim
call plug#end()

"specific to nvim
if has('nvim')
call sourcery#init()
endif

"manually source file as vim-sourcery only works with nvim
if !has('nvim')
source nvim/mappings.vim
endif
