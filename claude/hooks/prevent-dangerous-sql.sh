#!/bin/bash
# Prevents dangerous SQL commands that could cause data loss
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Check for SQL commands via mysql/psql/sqlite CLI or piped SQL
if ! echo "$COMMAND" | grep -qiE '(mysql|psql|sqlite|artisan|tinker|DROP|TRUNCATE|DELETE\s+FROM)'; then
  exit 0
fi

# Block DROP DATABASE
if echo "$COMMAND" | grep -qiE 'DROP\s+(DATABASE|SCHEMA)\s'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "DROP DATABASE/SCHEMA is extremely destructive. Ask the user to run this manually if absolutely necessary."
    }
  }'
  exit 0
fi

# Block TRUNCATE TABLE (deletes all data without logging)
if echo "$COMMAND" | grep -qiE 'TRUNCATE\s+(TABLE\s+)?\S'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "TRUNCATE TABLE permanently deletes all data. Use DELETE with a WHERE clause, or ask the user to run this manually."
    }
  }'
  exit 0
fi

# Block DELETE without WHERE clause (deletes all rows)
if echo "$COMMAND" | grep -qiE 'DELETE\s+FROM\s+\S+\s*;' | grep -qviE 'WHERE'; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "DELETE without a WHERE clause deletes all rows. Add a WHERE clause, or ask the user to run this manually."
    }
  }'
  exit 0
fi

exit 0
