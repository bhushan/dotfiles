"-------------General Settings--------------"
"map escape to jj
inoremap jj <Esc>
set clipboard+=unnamed "universal Clipboard
let mapleader = ',' "them default leader is \, but a comma is much better.
set backspace=indent,eol,start "make backspace work as usual

syntax enable "syntax highlighting enabled
colorscheme gruvbox "use gruvbox theme
set relativenumber number "enable relative line numbers

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
nmap <Leader>ep :tabedit ~/.config/nvim/plugins.vim<CR>

"add simple highlight removal.
nmap <Leader><space> :nohlsearch<CR>

"make NERDTreeToggle easy
nmap <Leader>1 :NERDTreeToggle<CR>
"make NERDTree open in right side
let g:NERDTreeWinPos = "right"

"plugins install and update shortcuts
nnoremap <buffer><nowait> <leader>pi <cmd>PlugInstall<cr>
nnoremap <buffer><nowait> <leader>pu <cmd>PlugUpdate<cr>

"move line up and down in normal mode
nnoremap J :m .+1<CR>==
nnoremap K :m .-2<CR>==
"move line up and down in visual mode
vnoremap J :m '>+1<CR>gv=gv
vnoremap L :m '<-2<CR>gv=gv

" Config: prettier
"disable auto formatting
let g:prettier#autoformat = 0

" Mappings: prettier
"format current buffer using prettier
nnoremap <Leader>ff :silent %!prettier --stdin-filepath %<CR>

" Mappings: toggleterm
"opens horizontal terminal instead of float
nnoremap <Leader>` :ToggleTerm size=40 direction=horizontal<CR>

" Mappings: telescope
nmap <Leader>f :Telescope find_files<CR>
nmap <Leader>/ :Telescope live_grep<CR>
nmap <Leader>b :Telescope buffers<CR>
nmap <Leader>h :Telescope help_tags<CR>

" Mappings: sourcery
function! SourceryMappings()
  nmap <buffer> gp <Plug>SourceryGoToRelatedPluginDefinition
  nmap <buffer> gm <Plug>SourceryGoToRelatedMappings
  nmap <buffer> gc <Plug>SourceryGoToRelatedConfig
endfunction
