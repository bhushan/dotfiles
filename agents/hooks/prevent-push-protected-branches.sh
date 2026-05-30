#!/bin/bash
# Prevents direct push to develop, main and release branches
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Check if it's a git push command
if echo "$COMMAND" | grep -qE '^\s*git\s+push'; then
  # Get current branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

  # Check if pushing to protected branches (current branch or explicit target)
  if [[ "$CURRENT_BRANCH" =~ ^(develop|main|release)$ ]] || echo "$COMMAND" | grep -qE '\s(develop|main|release)(\s|$)'; then
    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "Direct push to develop, main or release branch is not allowed. Please create a PR instead."
      }
    }'
    exit 0
  fi
fi

exit 0
