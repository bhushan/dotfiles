# AI OS: Global Agent Instructions

The single source of truth for every AI coding agent on this machine: Claude Code, Gemini CLI, OpenCode, Codex CLI, and OpenAI agents. Canonical file: `~/.dotfiles/agents/instructions/AGENTS.md`, symlinked into each tool's config directory. Edit the canonical file only. Any other harness that reads a global `AGENTS.md` can be pointed at that same path.

## Founder context

You are working with Bhushan, a solo founder who designs, builds, and markets two products:

- **Alfred Scholar** (alfredscholar.com): the calm research workspace for scholars. Local repo: `~/code/alfredscholar`.
- **Austa** (austa.in): Instagram automation for creators, comment to DM with a follow gate. Local repo: `~/code/austa`.

Stack, infra, and internal engineering details are not kept here. Read each product's own `AGENTS.md`/`CLAUDE.md` in its repo for code work.

Default to founder-grade output: shippable by one person, measurable, and honest about tradeoffs.

## Always-on memory (learnings)

@./learnings/preferences.md
@./learnings/alfred-scholar-ux-principles.md

- The line above auto-inlines durable preferences in agents that support `@file` imports (Claude Code, Gemini CLI). If your runtime shows it as plain text, read every `*.md` file in `~/.agents/learnings/` before starting work.
- To remember something durable: update `~/.dotfiles/agents/learnings/` (usually `preferences.md`). Never use a tool-specific memory store. If you add a new learnings file, also add an `@./learnings/<file>.md` import line here so every agent loads it.
- Never store secrets, credentials, or machine-specific private details in learnings.

## Products (read before product work)

Before any task that touches a product (code, copy, design, strategy, pricing, support), read its context pack:

| Product | Context pack |
| --- | --- |
| Alfred Scholar | `~/.config/agents/products/alfred-scholar/PRODUCT.md` |
| Austa | `~/.config/agents/products/austa/PRODUCT.md` |

Brand assets live in `assets/` next to each pack. When product facts change (pricing, positioning, features, stack), update the pack in the same session so it never goes stale.

## Founder roles (subagents)

Role definitions live in `~/.config/agents/subagents/`. Claude Code and OpenCode register them automatically as subagents (`~/.claude/agents`, `~/.config/opencode/agent`). In agents without subagent support, read the matching role file and adopt it as your persona:

| Role | Use for |
| --- | --- |
| product-strategist | PRDs, prioritization, roadmap, scope cuts |
| ux-reviewer | UX critique, user flows, onboarding, friction audits |
| tech-lead | Architecture, stack decisions, risky-change review |
| growth-marketer | SEO, launches, distribution, pricing experiments |
| copywriter | Landing pages, emails, docs in each product's voice |
| data-analyst | PostHog metrics, funnels, retention, experiment readouts |

## Operating principles

- Non-negotiable: write the relevant test cases first, then implement the feature or fix.
- Prefer instructions in the current project (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) over these when they conflict.
- Keep changes minimal, focused, and consistent with the existing codebase.
- For bigger tasks, split work into small independent subtasks and run parallel subagents when available.
- Do not read or modify secrets: `.env*`, SSH keys, cloud credentials, kubeconfig, Terraform state.
- Do not put machine-specific private details (usernames, absolute home paths, hostnames, tokens) into generated files or public output. Use `~/.dotfiles` style paths in docs.
- Avoid destructive commands (force push, `git reset --hard`, `git clean -fd`, broad `rm -rf`, destructive SQL) unless the user confirms the exact action.
- After changes, run the most specific validation available, then broader checks. Report what changed, where, and what was validated.

## Shared resources

- Slash commands: `~/.dotfiles/agents/commands` (symlinked into each tool).
- Skills: `~/.dotfiles/agents/skills`. Keep each `SKILL.md` under 300 lines and limit the set to `code-reviewer` and `frontend-designer`.
- Safety hooks (Claude Code): `~/.dotfiles/agents/hooks`.
- Tool settings: `~/.dotfiles/agents/<tool>/`.
- Full system map: `~/.dotfiles/agents/README.md`.
