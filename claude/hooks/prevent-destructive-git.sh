#!/bin/bash
# Prevents destructive git commands that can cause data loss
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block git reset --hard (destroys uncommitted changes)
if echo "$COMMAND" | grep -qE '^\s*git\s+reset\s+--hard'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "git reset --hard destroys uncommitted changes. Use git stash or create a commit first. If you truly need this, ask the user to run it manually."
    }
  }'
  exit 0
fi

# Block git clean -fd/-fx (deletes untracked files permanently)
if echo "$COMMAND" | grep -qE '^\s*git\s+clean\s+-[a-z]*[fd]'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "git clean permanently deletes untracked files. Use git stash -u to safely stash them instead. If you truly need this, ask the user to run it manually."
    }
  }'
  exit 0
fi

# Block git checkout -- . or git restore . (discards all working changes)
if echo "$COMMAND" | grep -qE '^\s*git\s+(checkout\s+--\s+\.|restore\s+\.)'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "This discards all working directory changes. Use git stash or commit first. If you truly need this, ask the user to run it manually."
    }
  }'
  exit 0
fi

# Block git push --force to any branch (--force-with-lease is also risky on shared branches)
if echo "$COMMAND" | grep -qE '^\s*git\s+push\s+.*--force'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Force pushing can overwrite remote history. Ask the user to run this manually if absolutely necessary."
    }
  }'
  exit 0
fi

# Block git branch -D (force delete, may lose unmerged work)
if echo "$COMMAND" | grep -qE '^\s*git\s+branch\s+-D\s'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "git branch -D force-deletes branches even with unmerged changes. Use git branch -d (lowercase) for safe deletion, or ask the user to run this manually."
    }
  }'
  exit 0
fi

exit 0
