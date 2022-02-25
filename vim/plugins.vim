call plug#begin()

Plug 'morhetz/gruvbox'
Plug 'michaeldyrynda/carbon'
Plug 'vim-airline/vim-airline'
" post install (npm install) then load plugin only for editing supported files
Plug 'prettier/vim-prettier', { 'do': 'npm install --frozen-lockfile --production' }

call plug#end()
