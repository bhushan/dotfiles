so ~/.vim/plugins.vim

"-------------General Settings--------------"
inoremap jj <Esc>
set clipboard+=unnamed	"Universal Clipboard
let mapleader = ',' "The default leader is \, but a comma is much better.
syntax enable
set belloff=all

colorscheme carbon
set relativenumber number

let g:airline_powerline_fonts = 1
let g:airline_section_x=''
let g:airline_section_y=''
let g:airline_section_z=''

"-------------Search--------------"
set hlsearch
set incsearch

"-------------Mappings--------------"
"Make it easy to edit the Vimrc file.
nmap <Leader>ev :tabedit $MYVIMRC<cr>

"Add simple highlight removal.
nmap <Leader><space> :nohlsearch<cr>

"-------------Auto-Commands--------------"
"Automatically source the Vimrc file on save.
augroup autosourcing
	autocmd!
	autocmd BufWritePost .vimrc source %
augroup END

call plug#begin()
  source ~/.vim/plugins.vim
call plug#end()

call sourcery#init()

function! SourceryMappings()
	nmap <buffer> gp <Plug>SourceryGoToRelatedPluginDefinition
	nmap <buffer> gm <Plug>SourceryGoToRelatedMappings
	nmap <buffer> gc <Plug>SourceryGoToRelatedConfig
endfunction
