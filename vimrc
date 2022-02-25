"set encoding to utf-8
set encoding=UTF-8

"load all plugins
so ~/.vim/plugins.vim

"-------------General Settings--------------"
"map escape to jj
inoremap jj <Esc>
set clipboard+=unnamed "universal Clipboard
let mapleader = ',' "them default leader is \, but a comma is much better.
set backspace=indent,eol,start "make backspace work as usual

syntax enable "syntax highlighting enabled
colorscheme carbon "use carbon theme
set relativenumber number "enable relative line numbers

let g:airline_theme='term' "use term airline theme
let g:airline_powerline_fonts = 1 "use powerline fonts for airline
let g:airline_section_z='' "remove last section of airline

set belloff=all "off annoying notification bell

"-------------Search--------------"
set hlsearch "highlight search
set incsearch "highlight matches while searching
set ignorecase "always do a case-insensitive search
set smartcase "override ignorecase if uppercase chars present

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
nmap <Leader>ev :tabedit $MYVIMRC<CR>

"make it easy to edit the plugins file.
nmap <Leader>ep :tabedit ~/.vim/plugins.vim<CR>

"add simple highlight removal.
nmap <Leader><space> :nohlsearch<CR>

"make NERDTreeToggle easy
nmap <Leader>1 :NERDTreeToggle<CR>

"plugins install and update shortcuts
nnoremap <buffer><nowait> <leader>pi <cmd>PlugInstall<cr>
nnoremap <buffer><nowait> <leader>pu <cmd>PlugUpdate<cr>

"-------------Prettier Settings--------------"
"disable auto formatting
let g:prettier#autoformat = 0
"format current buffer using prettier
nnoremap <Leader>ff :silent %!prettier --stdin-filepath %<CR>

"-------------Auto-Commands--------------"
"automatically source the Vimrc file on save.
augroup autosourcing
 autocmd!
 autocmd BufWritePost .vimrc source %
augroup END
