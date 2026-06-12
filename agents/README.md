# AI OS: Shared Agent Configuration

`agents/` is the single source of truth for every AI coding agent on this machine. One canonical tree, symlinked into each tool by `scripts/links.sh`, so Claude Code, Gemini CLI, OpenCode, Codex CLI, OpenAI-style agents, and any future tool all run the same brain.

## Layout

| Path | Purpose |
| --- | --- |
| `instructions/AGENTS.md` | The kernel: founder context, learnings import, product and role registries, operating principles. Symlinked as `CLAUDE.md`, `GEMINI.md`, or `AGENTS.md` per tool. |
| `learnings/` | Always-on memory. `preferences.md` is loaded into every agent's context at session start. |
| `products/` | On-demand product context packs: `alfred-scholar/` and `austa/`, each with `PRODUCT.md` plus `assets/` for logos and brand files. |
| `subagents/` | Founder role agents: product-strategist, ux-reviewer, tech-lead, growth-marketer, copywriter, data-analyst. |
| `commands/` | Shared slash-command prompts (`/ship`, `/security-audit`, `/performance-review`, `/obs-setup`). |
| `skills/` | Shared skills, each `SKILL.md` under 300 lines. Limited to `code-reviewer` and `frontend-designer`. `skills/.system/` is Codex-managed; leave it alone. |
| `hooks/` | Claude Code safety hooks (destructive git, dangerous rm, dangerous SQL, secret reads and writes, protected branch pushes). |
| `claude/`, `gemini/`, `opencode/`, `codex/`, `openai/` | Tool-specific settings only. |

## How context assembles per tool

| Tool | Instructions | Learnings in context | Subagents | Commands |
| --- | --- | --- | --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` symlink | `@./learnings/preferences.md` import | `~/.claude/agents` symlink | `~/.claude/commands` |
| Gemini CLI | `~/.gemini/GEMINI.md` symlink | same `@` import | persona via role files | `~/.gemini/commands` |
| OpenCode | `~/.config/opencode/AGENTS.md` symlink | `instructions` glob in `opencode.jsonc` | `~/.config/opencode/agent` symlink | command table in `opencode.jsonc` |
| Codex CLI | `~/.codex/AGENTS.md` symlink | read directive in AGENTS.md | persona via role files | `~/.codex/prompts` |
| OpenAI agents | `~/.openai/AGENTS.md` symlink | read directive in AGENTS.md | persona via role files | `~/.openai/prompts` |

`instructions/learnings` is a repo-relative symlink to `../learnings`, so the `@./learnings/...` import resolves correctly whether a tool follows the home-directory symlink or the real file path.

## How to extend

- New durable preference: append to `learnings/preferences.md`.
- New learnings file: create it, then add an `@./learnings/<file>.md` line in `instructions/AGENTS.md` so it loads everywhere.
- New product: create `products/<slug>/PRODUCT.md` plus `assets/`, then register it in the products table in `instructions/AGENTS.md`.
- New role: create `subagents/<role>.md` with `name`, `description`, and `mode: subagent` frontmatter, then register it in the roles table in `instructions/AGENTS.md`.
- New command: drop a `.md` file in `commands/`, and mirror it in the `command` table in `opencode/opencode.jsonc`.
- New skill: only if it earns its tokens. Keep `SKILL.md` under 300 lines.
- After structural changes, re-link: `bash install`, or `DOTFILES="$HOME/code/dotfiles" bash -c 'source scripts/utils.sh; source scripts/links.sh'`.

## Rules

- Edit files here, never the home-directory symlinks.
- Portable paths only (`~/.dotfiles`, `~/.config/agents`). No machine-specific usernames, absolute home paths, or keys.
- No secrets anywhere in this tree.
- Do not add a `~/.gemini/skills` symlink; Gemini already loads `~/.agents/skills` and would warn about duplicates.
