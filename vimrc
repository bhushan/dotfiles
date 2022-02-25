"load all plugins
so ~/.vim/plugins.vim

"-------------General Settings--------------"
inoremap jj <Esc>
set clipboard+=unnamed "Universal Clipboard
let mapleader = ',' "The default leader is \, but a comma is much better.

set backspace=indent,eol,start "make backspace work as usual
syntax enable "syntax highlighting enabled
set belloff=all "off annoying notification bell

colorscheme carbon "use carbon theme
set relativenumber number "enable relative line numbers

"-------------Search--------------"
set hlsearch "highlight search
set incsearch "highlight matches while searching

"-------------Mappings--------------"
"Make it easy to edit the Vimrc file.
nmap <Leader>ev :tabedit $MYVIMRC<cr>

"Add simple highlight removal.
nmap <Leader><space> :nohlsearch<cr>

"-------------Prettier Settings--------------"
let g:prettier#autoformat = 0
nnoremap <Leader>ff :silent %!prettier --stdin-filepath %<CR>

"-------------Auto-Commands--------------"
"Automatically source the Vimrc file on save.
augroup autosourcing
	autocmd!
	autocmd BufWritePost .vimrc source %
augroup END
