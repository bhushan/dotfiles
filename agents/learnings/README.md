# Cross-Agent Learnings

This folder is shared memory for all configured agents.

When the user says to store something in memory, remember it, save it for later, or add it to learnings, update files in this folder instead of a tool-specific memory store. These learnings should be treated as global preferences across Claude Code, Gemini CLI, OpenCode, Codex, OpenAI agents, and Zed.

## Files

- `preferences.md` stores durable user preferences and writing/style rules.
- `alfred-scholar.md` stores public product context for AlfredScholar.

## Rules

- Keep learnings concise and actionable.
- Do not store secrets, credentials, private infrastructure details, or sensitive personal data.
- Prefer updating an existing learning over adding duplicates.
- Use portable paths like `~/.dotfiles`; never store machine-specific absolute home paths.
