#!/bin/bash
# Prevents dangerous rm commands on critical paths
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only check rm commands
if ! echo "$COMMAND" | grep -qE '(^|\||\;|\&\&)\s*rm\s'; then
  exit 0
fi

# Block rm -rf / or rm -rf ~
if echo "$COMMAND" | grep -qE 'rm\s+(-[a-z]*r[a-z]*f|[a-z]*f[a-z]*r)\s+(/\s|/\*|~/|~\s|\$HOME)'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Refusing to run rm -rf on root or home directory. This would destroy the entire filesystem or home directory."
    }
  }'
  exit 0
fi

# Block rm -rf on common critical directories
CRITICAL_DIRS="node_modules|vendor|.git|.env|.ssh|.aws|.claude|.config|Desktop|Documents|Downloads|code"
if echo "$COMMAND" | grep -qE "rm\s+(-[a-z]*r[a-z]*f|[a-z]*f[a-z]*r)\s+[\"']?(\./)?($CRITICAL_DIRS)[\"']?\s*$"; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Refusing to recursively delete a critical directory. Please be more specific about what to remove, or ask the user to run this manually."
    }
  }'
  exit 0
fi

exit 0
