# Neovim Redesign — Arctic Blue Stream Edition

## Context

- **Stream**: 1080p, live coding + teaching, viewers on phones/laptops
- **Approach**: Surgical enhancement — build on existing config, ~6-8 new plugins, custom Catppuccin overrides
- **Theme**: Arctic Blue — ice blue keywords, soft purple functions, teal types, warm amber strings on Catppuccin Mocha base
- **Dashboard quote preserved**: "engineering is beautiful ~ rb"

---

## 1. Arctic Blue Theme — Custom Highlights

Override Catppuccin Mocha defaults via `custom_highlights` in `nvim/lua/plugins/ui/theme.lua`. Update `nvim/lua/core/colors.lua` as single source of truth.

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Keywords (`local`, `return`, `function`) | Ice blue | `#7dcfff` |
| Functions / method calls | Soft purple | `#bb9af7` |
| Strings | Warm amber | `#e0af68` |
| Types / classes | Teal | `#73daca` |
| Built-in functions | Mint green | `#9ece6a` |
| Constants / numbers | Soft rose | `#f7768e` |
| Comments | Brighter overlay | `#7a80a3` |
| Cursor line background | Blue-tinted surface | `#292e42` |
| Visual selection | Deep blue | `#33467c` |
| Foreground (unchanged) | Catppuccin text | `#cdd6f4` |
| Background (unchanged) | Catppuccin base | `#1e1e2e` |

### Files Changed

- `nvim/lua/core/colors.lua` — add Arctic Blue colors alongside existing Catppuccin palette
- `nvim/lua/plugins/ui/theme.lua` — add `custom_highlights` function mapping treesitter/LSP groups to Arctic Blue
- `nvim/lua/plugins/ui/lualine.lua` — update section colors to Arctic Blue palette
- `nvim/lua/plugins/git/gitsigns.lua` — signs use teal (add), amber (change), rose (delete)

---

## 2. Branded Dashboard

Rewrite the Snacks dashboard section in `nvim/lua/plugins/ui/snacks.lua`.

### Layout (top to bottom)

1. **ASCII art header** — geometric "RB" monogram using ice blue + teal highlight groups
2. **Quote** — `engineering is beautiful ~ rb` — soft italic, centered, subtle color
3. **Quick actions** — 6 single-key actions in a clean grid:
   - `f` Find File, `r` Recent Files, `g` Live Grep
   - `n` New File, `p` Projects, `q` Quit
4. **Recent files** — last 5, relative paths
5. **Footer** — startup time + nvim version, very subtle

### Design Principles

- Generous vertical spacing — breathing room, stream-readable
- Header uses 2-3 Arctic Blue colors
- No clutter (no git status, no session info on dashboard)

---

## 3. Animations & Visual Polish

### New Plugins

| Plugin | Purpose | Config Location |
|--------|---------|-----------------|
| `mini.animate` | Smooth cursor jumps, window resize, scroll easing | `nvim/lua/plugins/ui/animate.lua` |
| `mini.indentscope` | Animated indent scope line following cursor (teal) | `nvim/lua/plugins/ui/animate.lua` |
| `indent-blankline.nvim` | Static indent guides for all levels (subtle `#292e42`) | `nvim/lua/plugins/ui/animate.lua` |

### Enhanced Existing Plugins

- **Noice.nvim** — notification slide-in animation from top-right, fade out
- **Snacks.nvim** — enable smooth scroll in pickers; add zen mode toggle (`<leader>z`)

### What's NOT Added

- No minimap (clutters 1080p)
- No cursor trails/sparkles (gimmicky)
- No window opening animations (lag risk with LSP popups)

---

## 4. Navigation & Context Awareness

### New Plugins

| Plugin | Purpose | Config Location |
|--------|---------|-----------------|
| `bufferline.nvim` | Visual buffer tabs at top of screen | `nvim/lua/plugins/ui/bufferline.lua` |
| `nvim-navic` | LSP breadcrumbs data provider | `nvim/lua/plugins/lsp/lspconfig.lua` (attach) |
| `barbecue.nvim` | Winbar breadcrumbs UI (file > class > method) | `nvim/lua/plugins/ui/barbecue.lua` |
| `nvim-treesitter-context` | Sticky function/class header at top of buffer | `nvim/lua/plugins/editor/treesitter.lua` |

### New Keymaps

| Key | Action | Context |
|-----|--------|---------|
| `<Tab>` | Next buffer | Normal mode |
| `<S-Tab>` | Previous buffer | Normal mode |
| `<leader>bp` | Pin buffer | Bufferline |
| `<leader>bc` | Close other buffers | Bufferline |
| `<leader>bl` | Close buffers to the left | Bufferline |
| `<leader>br` | Close buffers to the right | Bufferline |
| `<leader>z` | Toggle zen mode | Snacks zen |

### What This Gives You

- **Bufferline** at the top: see all open files, click or Tab/S-Tab to switch. Pinned buffers stay left.
- **Breadcrumbs** in the winbar: always know where you are — `models/User.php > User > scopeActive`. Viewers can follow along.
- **Sticky context** at top: when scrolling inside a long function, the function signature stays pinned at the top. Critical for teaching on stream.

---

## 5. Stream Readability Tweaks

### Options Changes (`nvim/lua/core/options.lua`)

- `signcolumn = 'yes:1'` — reduce from `yes:2` to `yes:1` (reclaim horizontal space for code)
- `cursorline = true` always (already done via autocmd, but ensure it's visible with Arctic Blue bg)
- `pumheight = 12` — limit completion popup height so it doesn't overwhelm the screen

### Lualine Enhancements

- Mode section uses bold Arctic Blue accent colors — immediately visible which mode you're in
- Macro recording indicator in lualine (viewers see when you're recording)
- Show current LSP server name (viewers know what tooling is active)

### Diagnostic Display

- Use Arctic Blue palette for diagnostic signs:
  - Error: `#f7768e` (soft rose)
  - Warning: `#e0af68` (amber)
  - Info: `#7dcfff` (ice blue)  
  - Hint: `#73daca` (teal)

---

## 6. Complete File Change List

### Modified Files

| File | Changes |
|------|---------|
| `nvim/lua/core/colors.lua` | Add Arctic Blue palette alongside Catppuccin |
| `nvim/lua/core/options.lua` | `signcolumn`, `pumheight` adjustments |
| `nvim/lua/core/keymaps.lua` | Add `<Tab>`/`<S-Tab>` buffer switching, `<leader>z` zen, `<leader>b*` buffer management |
| `nvim/lua/plugins/ui/theme.lua` | Add `custom_highlights` for Arctic Blue treesitter/LSP groups |
| `nvim/lua/plugins/ui/lualine.lua` | Arctic Blue section colors, macro indicator, LSP name |
| `nvim/lua/plugins/ui/snacks.lua` | Rewrite dashboard, add zen mode, enable smooth scroll |
| `nvim/lua/plugins/ui/noice.lua` | Notification animation config |
| `nvim/lua/plugins/lsp/lspconfig.lua` | Attach `nvim-navic` on LSP attach |
| `nvim/lua/plugins/editor/treesitter.lua` | Add `nvim-treesitter-context` |
| `nvim/lua/plugins/git/gitsigns.lua` | Arctic Blue sign colors |
| `nvim/lua/plugins/init.lua` | Import new plugin modules |

### New Files

| File | Contents |
|------|----------|
| `nvim/lua/plugins/ui/animate.lua` | `mini.animate` + `mini.indentscope` + `indent-blankline.nvim` |
| `nvim/lua/plugins/ui/bufferline.lua` | `bufferline.nvim` config with Arctic Blue highlights |
| `nvim/lua/plugins/ui/barbecue.lua` | `barbecue.nvim` + `nvim-navic` winbar breadcrumbs |

---

## 7. Plugin Summary

### New Plugins (6)

| Plugin | Purpose |
|--------|---------|
| `akinsho/bufferline.nvim` | Buffer tabs |
| `SmiteshP/nvim-navic` | LSP breadcrumb data |
| `utilyre/barbecue.nvim` | Winbar breadcrumbs UI |
| `echasnovski/mini.animate` | Cursor, scroll, window resize animations |
| `echasnovski/mini.indentscope` | Animated active indent scope |
| `lukas-reineke/indent-blankline.nvim` | Static indent guides |

### Enhanced Existing Plugins (5)

| Plugin | Enhancement |
|--------|-------------|
| `catppuccin/nvim` | Arctic Blue custom highlights |
| `nvim-lualine/lualine.nvim` | Arctic Blue colors, macro indicator, LSP name |
| `folke/snacks.nvim` | Branded dashboard, zen mode, smooth scroll |
| `folke/noice.nvim` | Notification animations |
| `nvim-treesitter/nvim-treesitter` | Add treesitter-context for sticky headers |

### Existing Plugins (unchanged)

Everything else stays as-is: nvim-cmp, grug-far, which-key, conform, trouble, todo-comments, gitsigns (colors only), vim-surround, vim-unimpaired, autopairs, comment, vim-test, vim-tmux-navigator, phprefactoring, coderunner, present.

---

## 8. What You'll Notice

**On stream:**
- Unique Arctic Blue color scheme — not default anything, distinctly yours
- Branded dashboard with your quote when you open nvim
- Smooth cursor and scroll animations viewers can see
- Breadcrumbs showing exactly where you are in code
- Sticky function headers when scrolling — viewers never lose context
- Buffer tabs showing all open files
- Animated indent guides highlighting active code block

**For your workflow:**
- `<Tab>`/`<S-Tab>` for instant buffer switching
- Pin important buffers with `<leader>bp`
- Zen mode (`<leader>z`) for focused moments
- Better completion popup sizing
- Macro recording visible in statusline

---

## 9. Risk & Rollback

- All changes are additive — no existing functionality removed
- If any animation causes lag: disable `mini.animate` (one line change)
- If bufferline feels cluttered: remove `bufferline.lua` (one file delete)
- Catppuccin custom highlights can be reverted by removing the `custom_highlights` function
- Git tracks everything — `git checkout nvim/` reverts the entire thing
