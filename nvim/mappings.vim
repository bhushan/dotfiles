"-------------General Settings--------------"
"map escape to jj
inoremap jj <Esc>
set clipboard+=unnamed "universal Clipboard
let mapleader = ',' "them default leader is \, but a comma is much better.
set backspace=indent,eol,start "make backspace work as usual

syntax enable "syntax highlighting enabled
colorscheme carbon "use carbon theme
set relativenumber number "enable relative line numbers

set showtabline=0 "hide all tabs

set belloff=all "off annoying notification bell
set foldcolumn=2 "fake left padding
"match fold column color to fake left padding
hi FoldColumn guibg=bg guifg=bg

"disable arrow keys
noremap <Up> <Nop>
noremap <Down> <Nop>
noremap <Left> <Nop>
noremap <Right> <Nop>

"quit
nnoremap <leader>q :q<cr>
"force quit
nnoremap <leader>fq :q!<cr>
"save buffer
nnoremap <leader>w :w<cr>

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
nmap <leader>ev :tabedit $MYVIMRC<cr>

"make it easy to edit the plugins file.
nmap <leader>ep :tabedit ~/.config/nvim/plugins.vim<cr>

"add simple highlight removal.
nmap <silent> <leader><space> :nohlsearch<cr>

"move line up and down in normal mode
nnoremap J :m .+1<cr>==
nnoremap K :m .-2<cr>==
"move line up and down in visual mode
vnoremap J :m '>+1<cr>gv=gv
vnoremap L :m '<-2<cr>gv=gv

" Config: prettier
"disable auto formatting
let g:prettier#autoformat = 0

" Mappings: prettier
"format current buffer using prettier
nnoremap <leader>pf :silent %!prettier --stdin-filepath %<cr>

"nvim specific plugins
if has('nvim')

" Mappings: toggleterm
"opens horizontal terminal instead of float
nnoremap <leader>` :ToggleTerm size=40 direction=horizontal<cr>

" Mappings: telescope
nnoremap <leader>tf <cmd>Telescope find_files<cr>
nnoremap <leader>tg <cmd>Telescope live_grep<cr>
nnoremap <leader>tb <cmd>Telescope buffers<cr>
nnoremap <leader>th <cmd>Telescope help_tags<cr>
"open nvim configs in telescope
nnoremap <silent> <leader>tn :lua require'telescope.builtin'.edit_vim{}<cr>
"open dotfiles folder in telescope
nnoremap <silent> <leader>td :lua require'telescope.builtin'.dotfiles{}<cr>

" Mappings: sourcery
function! SourceryMappings()
  nmap <buffer> gp <Plug>SourceryGoToRelatedPluginDefinition
  nmap <buffer> gm <Plug>SourceryGoToRelatedMappings
  nmap <buffer> gc <Plug>SourceryGoToRelatedConfig

"plugins install and update shortcuts
nnoremap <buffer><nowait> <leader>pi <cmd>PlugInstall<cr>
nnoremap <buffer><nowait> <leader>pu <cmd>PlugUpdate<cr>
endfunction

endif
