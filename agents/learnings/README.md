# Cross-Agent Learnings

Shared always-on memory for all agents (Claude Code, Gemini CLI, OpenCode, Codex, OpenAI agents, Zed).

How it loads: `../instructions/AGENTS.md` imports `preferences.md` via an `@./learnings/preferences.md` line. Claude Code and Gemini CLI inline it natively; OpenCode loads it through the `instructions` array in `opencode.jsonc`; every other agent is instructed to read this folder at session start.

## Files

- `preferences.md`: durable user preferences and working rules. This is the default place for new learnings.

## Rules

- When the user says remember this, save this, or add to learnings, write it here, never to a tool-specific store.
- Product knowledge belongs in `../products/<product>/PRODUCT.md`, not here. Keep learnings for preferences and cross-product working rules.
- If you add a new file here, add a matching `@./learnings/<file>.md` line in `../instructions/AGENTS.md` so it stays in every agent's context.
- Keep entries concise and actionable. Prefer updating an existing entry over adding duplicates.
- No secrets, credentials, or machine-specific absolute paths. Use `~/.dotfiles` style paths.
