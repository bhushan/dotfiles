#!/bin/bash
# Prevents writing to credential and secret files
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")
DIRPATH=$(dirname "$FILE_PATH")

# Block writing to SSH keys
if [[ "$DIRPATH" == *"/.ssh"* ]] && [[ "$BASENAME" =~ ^(id_|authorized_keys|known_hosts|config).*$ ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Writing to SSH credential files is not allowed. These files are security-critical and should be managed manually."
    }
  }'
  exit 0
fi

# Block writing to AWS credentials
if [[ "$DIRPATH" == *"/.aws"* ]] && [[ "$BASENAME" =~ ^(credentials|config)$ ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Writing to AWS credential files is not allowed. Use aws configure or environment variables instead."
    }
  }'
  exit 0
fi

# Block writing to .env files
if [[ "$BASENAME" =~ ^\.env(\..*)?$ ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Writing to .env files is not allowed. These files contain secrets and should be managed manually."
    }
  }'
  exit 0
fi

# Block writing to kubeconfig
if [[ "$BASENAME" == "kubeconfig" ]] || [[ "$DIRPATH" == *"/.kube"* && "$BASENAME" == "config" ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Writing to Kubernetes config is not allowed. Use kubectl config commands instead."
    }
  }'
  exit 0
fi

# Block writing to terraform state files
if [[ "$BASENAME" =~ ^terraform\.tfstate(\.backup)?$ ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Writing to Terraform state files is not allowed. State should be managed by Terraform itself or via terraform state commands."
    }
  }'
  exit 0
fi

exit 0
