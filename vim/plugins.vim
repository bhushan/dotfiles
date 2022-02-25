call plug#begin()

"themes
Plug 'morhetz/gruvbox'
Plug 'michaeldyrynda/carbon'

Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

" post install (npm install) then load plugin only for editing supported files
Plug 'prettier/vim-prettier', { 'do': 'npm install --frozen-lockfile --production' }

" Improve behaviour of built-in netrw
Plug 'tpope/vim-vinegar'

Plug 'preservim/nerdtree'
Plug 'ryanoasis/vim-devicons'

call plug#end()
