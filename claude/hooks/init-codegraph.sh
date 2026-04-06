#!/bin/bash
# Auto-initialize CodeGraph if not already present in a git repo

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd')

cd "$CWD" || exit 0

# Only init in git repos that don't already have codegraph
if [ -d ".git" ] && [ ! -d ".codegraph" ]; then
  codegraph init -i 2>/dev/null
fi

exit 0
