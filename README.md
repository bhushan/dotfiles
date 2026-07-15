# dotfiles

macOS dotfiles with a shared **AI OS**: one canonical config that every AI coding agent on the
machine reads, so Claude Code, Gemini CLI, OpenCode, Codex, and OpenAI agents all run the same brain.

One `install` script. Works on a fresh Mac or an existing one, and is safe to re-run.

```bash
mkdir -p ~/code && git clone https://github.com/bhushan/dotfiles.git ~/code/dotfiles
bash ~/code/dotfiles/install
```

## The AI OS

Most dotfiles configure each AI tool separately, then drift apart. This repo keeps one tree,
`agents/`, and symlinks it everywhere. Change a preference once and every agent picks it up.

```
agents/
├── instructions/AGENTS.md   the kernel: context, principles, registries
├── learnings/               durable memory, auto-loaded into every session
├── products/                per-product context packs
├── subagents/               six founder roles (strategist, tech-lead, ...)
├── commands/                shared slash commands (/ship, /security-audit, ...)
├── skills/                  shared skills (code-reviewer, frontend-designer)
└── hooks/                   safety hooks (destructive git, rm, SQL, secrets)
         │
         └── symlinked into ──► ~/.claude  ~/.gemini  ~/.config/opencode
                                ~/.codex   ~/.openai  ~/.agents
```

| Tool | Reads |
|------|-------|
| Claude Code | `~/.claude/CLAUDE.md` |
| Gemini CLI | `~/.gemini/GEMINI.md` |
| OpenCode | `~/.config/opencode/AGENTS.md` |
| Codex CLI | `~/.codex/AGENTS.md` |
| OpenAI agents | `~/.openai/AGENTS.md` |

All five are the same file. Any other harness that reads a global `AGENTS.md` works by pointing it
at `~/.dotfiles/agents/instructions/AGENTS.md`.

Ask any agent to remember something and it writes to `agents/learnings/`, never to a tool-specific
memory store. The next session, in any tool, already knows.

## Keeping it honest

Shared config rots quietly: a doc references a file that was renamed, a role is registered but its
file is gone, a documented command never existed. `doctor` compares every claim against the
filesystem and fails loudly.

```bash
bash doctor
```

```
==> AI OS health check

  symlinks               OK
  broken links           OK
  learnings              OK
  products               OK
  subagents              OK
  dead refs              OK
  dead links             OK
  commands               OK

==> AI OS healthy
```

It checks that every product, role, and learning the kernel registers exists on disk (and the
reverse), that every documented repo path and markdown link resolves, and that every documented
`bash <command>` is a real script. Exit code 1 on failure, so it can gate CI.

## Commands

```bash
bash install   # full setup: packages, symlinks, apps. Idempotent.
bash update    # brew, oh-my-zsh, tmux, neovim, composer, npm, then cleanup
bash doctor    # verify the AI OS and the docs
```

## Tests

```bash
bash scripts/doctor.test.sh   # doctor checks, against fixtures and the real repo
cd obs && npm test            # OBS config and scene tests
```

## What's inside

| | |
|---|---|
| **Editor** | Neovim ([bhushan/nvim](https://github.com/bhushan/nvim), submodule) |
| **Terminal** | Kitty, tmux, zsh with oh-my-zsh |
| **Git** | delta diffs, lazygit, global gitignore |
| **macOS** | Hammerspoon (window tiling, dock toggle), Karabiner (Caps Lock to Control/Escape) |
| **Languages** | PHP 8.4, Go, Node via nvm |
| **Recording** | OBS automation over `obs-websocket-js`, ProRes capture with per-source ISO files |
| **Theme** | Catppuccin Mocha everywhere ([palette](colors/catppuccin-mocha.md)) |

Packages live in `Brewfile`. The setup is deliberately slim, so plenty of entries are commented out
on purpose. `install` syncs it exactly: it installs what's listed and removes what isn't.

## Notes

- Edit files in `agents/`, never the generated home-directory symlinks. Then run `bash doctor`.
- `install` symlinks `~/.dotfiles` to the repo, so docs and commands stay free of machine-specific
  absolute paths.
- After a fresh install, open Kitty and launch `tmux`. Plugins install on first run.
- `cmd+opt+d` toggles the macOS dock.
- Agent guidance lives in [AGENTS.md](AGENTS.md). `CLAUDE.md` is a symlink to it.

## License

[MIT](LICENSE). Take anything you want, at your own risk.
