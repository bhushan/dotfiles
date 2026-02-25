#!/bin/bash
# Prevents reading .env files
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$(basename "$FILE_PATH")" =~ ^\.env(\..*)?$ ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Reading .env files is not allowed. These files may contain secrets and sensitive credentials."
    }
  }'
  exit 0
fi

exit 0
