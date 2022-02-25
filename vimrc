"load all plugins
so ~/.vim/plugins.vim

"-------------General Settings--------------"
"map escape to jj
inoremap jj <Esc>
set clipboard+=unnamed "universal Clipboard
let mapleader = ',' "them default leader is \, but a comma is much better.

set backspace=indent,eol,start "make backspace work as usual
syntax enable "syntax highlighting enabled
set belloff=all "off annoying notification bell

colorscheme carbon "use carbon theme
set relativenumber number "enable relative line numbers

"-------------Search--------------"
set hlsearch "highlight search
set incsearch "highlight matches while searching

"-------------Split Management--------------"
set splitbelow
set splitright

"focus up window
nmap <C-K> <C-W>k
"focus down window
nmap <C-J> <C-W>j
"focus left window
nmap <C-H> <C-W>h
"focus right window
nmap <C-L> <C-W>l

"-------------Mappings--------------"
"make it easy to edit the Vimrc file.
nmap <Leader>ev :tabedit $MYVIMRC<cr>

"add simple highlight removal.
nmap <Leader><space> :nohlsearch<cr>

"-------------Prettier Settings--------------"
let g:prettier#autoformat = 0
nnoremap <Leader>ff :silent %!prettier --stdin-filepath %<CR>

"-------------Auto-Commands--------------"
"automatically source the Vimrc file on save.
augroup autosourcing
 autocmd!
 autocmd BufWritePost .vimrc source %
augroup END
