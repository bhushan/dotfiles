"map escape to jj
inoremap jj <Esc>
set clipboard+=unnamed "universal Clipboard

" Reselect visual selection after indenting
xnoremap > >gv
xnoremap < <gv

let data_dir = '~/.vim'

if empty(glob(data_dir . '/autoload/plug.vim'))
  silent execute '!curl -fLo '.data_dir.'/autoload/plug.vim --create-dirs  https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'
  autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

call plug#begin('~/.vim/plugged')

Plug 'tpope/vim-surround'

call plug#end()
