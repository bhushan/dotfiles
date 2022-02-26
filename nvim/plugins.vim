"themes
Plug 'morhetz/gruvbox'
Plug 'michaeldyrynda/carbon'

"post install (npm install) then load plugin only for editing supported files
Plug 'prettier/vim-prettier', { 'do': 'npm install --frozen-lockfile --production' }

"improve behaviour of built-in netrw
Plug 'tpope/vim-vinegar'

"file explorer
Plug 'preservim/nerdtree'

"awesome status line with icons
Plug 'nvim-lualine/lualine.nvim'
Plug 'kyazdani42/nvim-web-devicons'

"dependency for below two plugins
Plug 'nvim-lua/plenary.nvim'
"awesome file search
Plug 'nvim-telescope/telescope.nvim'
"show git diff
Plug 'sindrets/diffview.nvim'

"float horizontal and vertical terminal
Plug 'akinsho/toggleterm.nvim'

"auto source all files
Plug 'jesseleite/vim-sourcery'
