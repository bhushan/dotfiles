# Shared Agent Configuration

`agents/` is the single source of truth for global AI-agent configuration in these dotfiles.

## Layout

| Path | Purpose |
| --- | --- |
| `instructions/AGENTS.md` | Canonical global instructions. Symlinked as `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` where tools expect those names. |
| `commands/` | Shared slash-command prompt files. Claude uses this directly; other agents get the same files as prompts/commands where supported. |
| `skills/` | Shared skill packages. Keep this limited to `code-reviewer` and `frontend-designer`. |
| `learnings/` | Shared cross-agent memory for durable user preferences and learnings. |
| `hooks/` | Safety hooks currently used by Claude Code. |
| `claude/` | Claude Code settings. |
| `gemini/` | Gemini CLI settings. |
| `opencode/` | OpenCode settings, TUI config, commands, MCP servers, and themes. |
| `codex/` | OpenAI Codex CLI settings. |
| `openai/` | Generic OpenAI agent settings/prompts directory. |

## Symlink Targets

Run `bash install` or source `scripts/links.sh` to create `~/.dotfiles` and link these into:

- `~/.claude`
- `~/.gemini`
- `~/.config/opencode`
- `~/.codex`
- `~/.openai`
- `~/.agents/skills` for Zed/global agent skills and Gemini CLI skill discovery
- `~/.agents/learnings`, `~/.claude/learnings`, `~/.gemini/learnings`, `~/.config/opencode/learnings`, `~/.codex/learnings`, and `~/.openai/learnings` for shared memory

## Editing

- Change global behavior in `instructions/AGENTS.md`.
- Add reusable prompts in `commands/`.
- Add reusable skills in `skills/<skill-name>/SKILL.md`.
- Installed skills are limited to `code-reviewer` and `frontend-designer`.
- Add tool-specific settings in the relevant tool directory.
- Store durable cross-agent memory in `learnings/`, especially when the user says to remember something, store something in memory, or save it for later.
- Do not add a `~/.gemini/skills` symlink; Gemini loads `~/.agents/skills` and will warn about duplicate skill names if both locations contain the same shared skills.
- Do not commit private machine details such as absolute home paths, local usernames, hostnames, API keys, or internal infrastructure names.
