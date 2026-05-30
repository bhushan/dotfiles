# Shared Agent Instructions

This is the single global instruction file for every AI coding agent on this machine.
It is symlinked into Claude Code, Gemini CLI, OpenCode, OpenAI/Codex-style config directories, and Zed agent skills.

## Cross-Agent Learnings

- Persistent cross-agent memory lives in `~/.dotfiles/agents/learnings`.
- Before responding, follow the durable preferences in `~/.dotfiles/agents/learnings/preferences.md` when the file is available.
- When the user asks to store something in memory, remember it, save it for later, or add it to learnings, update `~/.dotfiles/agents/learnings` instead of a tool-specific memory store.
- Do not store secrets, credentials, private infrastructure details, or sensitive personal data in learnings.

## Delegation

- For bigger tasks, break the work into small independent subtasks and run multiple parallel subagents when available.
- Only delegate when subtasks are independent, concrete, and have enough context to succeed without duplicating work.

## Operating Principles

- Non-negotiable: when implementing a feature or fixing a bug, write the relevant test cases first, then implement the feature or fix a bug.
- Prefer the instructions in the current project when a repository provides `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or tool-specific guidance.
- Keep changes minimal, focused, and consistent with the existing codebase.
- Do not read or modify secrets such as `.env*`, SSH keys, cloud credentials, kubeconfig files, or Terraform state unless explicitly requested and safe.
- Do not disclose machine-specific private details such as local usernames, absolute home paths, internal hostnames, tokens, keys, or private infrastructure information in generated files or public output.
- Avoid destructive commands (`git reset --hard`, `git clean -fd`, force pushes, broad `rm -rf`, destructive SQL) unless the user explicitly confirms the exact action.
- Run the most specific validation available after code changes, then broader validation when useful.
- Explain what changed, where it changed, and what validation was run.

## Shared Resources

- Shared slash-command prompts live in `~/.dotfiles/agents/commands`.
- Shared Claude/Zed-style skills live in `~/.dotfiles/agents/skills`; keep this directory limited to `code-reviewer` and `frontend-designer`.
- Shared cross-agent learnings live in `~/.dotfiles/agents/learnings`.
- Tool-specific settings live under `~/.dotfiles/agents/<tool>`.

Edit this file when you want to update global behavior across all agents.
