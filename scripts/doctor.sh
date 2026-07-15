#!/usr/bin/env bash
# AI OS health check: sourced by the root `doctor` entry point.
#
# Answers one question: does the AI OS actually match what the docs claim?
# The kernel (agents/instructions/AGENTS.md) registers products, roles, and
# learnings. Those registries are hand-maintained, so they rot. Every check
# here compares a claim against the filesystem.
#
# Functions are pure and take explicit paths so scripts/doctor.test.sh can
# exercise them against fixtures. Only doctor_main() touches the real machine.

# Repo top-level directories that may legitimately appear in a doc reference.
# Refs are only validated when rooted at one of these, which keeps generic
# mentions (package.json, .env, ~/.claude/...) from raising false alarms.
DOCTOR_REPO_DIRS='agents|scripts|nvim|obs|zsh|kitty|vscode|hammerspoon|colors|lazygit|tmux|bin|karabiner|fonts'

# ── Pure list/parse helpers ────────────────────────────────────────────

# missing_from <list-a> <list-b>: newline-separated items in A but not in B
missing_from() {
  comm -23 \
    <(printf '%s\n' "$1" | sed '/^[[:space:]]*$/d' | LC_ALL=C sort -u) \
    <(printf '%s\n' "$2" | sed '/^[[:space:]]*$/d' | LC_ALL=C sort -u)
}

# list_products_on_disk <agents_dir>: a product is a dir holding a PRODUCT.md
list_products_on_disk() {
  local dir="$1/products" d
  [[ -d "$dir" ]] || return 0
  for d in "$dir"/*/; do
    [[ -f "$d/PRODUCT.md" ]] || continue
    basename "$d"
  done | LC_ALL=C sort
}

# list_products_registered <kernel_file>: slugs from the products table
list_products_registered() {
  grep -oE 'products/[a-zA-Z0-9._-]+/PRODUCT\.md' "$1" 2>/dev/null |
    sed -E 's#products/(.+)/PRODUCT\.md#\1#' | LC_ALL=C sort -u
}

# list_subagents_on_disk <agents_dir>
list_subagents_on_disk() {
  local dir="$1/subagents" f
  [[ -d "$dir" ]] || return 0
  for f in "$dir"/*.md; do
    [[ -f "$f" ]] || continue
    basename "$f" .md
  done | LC_ALL=C sort
}

# list_subagents_registered <kernel_file>
# Role rows are the lowercase-slug table rows (`| tech-lead | ... |`).
# Product rows use display names ("| Alfred Scholar |") and separator rows use
# dashes, so neither collides.
list_subagents_registered() {
  grep -oE '^\|[[:space:]]*[a-z][a-z0-9-]*[[:space:]]*\|' "$1" 2>/dev/null |
    sed -E 's#^\|[[:space:]]*##; s#[[:space:]]*\|$##' | LC_ALL=C sort -u
}

# list_learnings_on_disk <agents_dir>: README.md documents the dir, it is not a learning
list_learnings_on_disk() {
  local dir="$1/learnings" f b
  [[ -d "$dir" ]] || return 0
  for f in "$dir"/*.md; do
    [[ -f "$f" ]] || continue
    b="$(basename "$f")"
    [[ "$b" == "README.md" ]] && continue
    echo "$b"
  done | LC_ALL=C sort
}

# list_learnings_imported <kernel_file>: the @./learnings/*.md import lines
list_learnings_imported() {
  grep -oE '^@\./learnings/[a-zA-Z0-9._-]+\.md' "$1" 2>/dev/null |
    sed -E 's#^@\./learnings/##' | LC_ALL=C sort -u
}

# list_dead_refs <file> <repo_root>: backticked repo paths that do not exist
list_dead_refs() {
  local file="$1" root="$2" ref p
  [[ -f "$file" ]] || return 0
  grep -oE "\`($DOCTOR_REPO_DIRS)/[a-zA-Z0-9._/-]+\`" "$file" 2>/dev/null |
    tr -d '`' | LC_ALL=C sort -u | while read -r ref; do
    [[ -n "$ref" ]] || continue
    p="${ref%/}"
    [[ -e "$root/$p" ]] || echo "$ref"
  done
}

# list_dead_md_links <file> <repo_root>: relative markdown links that resolve nowhere.
# External URLs, protocol-relative links, mailto, and #anchors are skipped: they
# are not ours to verify. Links are resolved from the repo root, matching how
# GitHub renders a top-level doc.
list_dead_md_links() {
  local file="$1" root="$2" target
  [[ -f "$file" ]] || return 0
  grep -oE '\]\([^)]+\)' "$file" 2>/dev/null |
    sed -E 's/^\]\(//; s/\)$//; s/[[:space:]]+".*"$//' | LC_ALL=C sort -u |
    while read -r target; do
      [[ -n "$target" ]] || continue
      case "$target" in
      http://* | https://* | //* | mailto:* | \#*) continue ;;
      esac
      target="${target%%#*}"
      [[ -n "$target" ]] || continue
      [[ -e "$root/${target%/}" ]] || echo "$target"
    done
}

# list_missing_root_commands <file> <repo_root>: `bash <cmd>` naming a missing root script
list_missing_root_commands() {
  local file="$1" root="$2" cmd
  [[ -f "$file" ]] || return 0
  grep -oE '^bash [a-z][a-z0-9-]*$' "$file" 2>/dev/null | awk '{print $2}' | LC_ALL=C sort -u |
    while read -r cmd; do
      [[ -n "$cmd" ]] || continue
      [[ -e "$root/$cmd" ]] || echo "$cmd"
    done
}

# ── Reporting ──────────────────────────────────────────────────────────

DOCTOR_FAILURES=0

# report <label> <failure-list>: prints OK or each failure line
report() {
  local label="$1" failures="$2" line
  if [[ -z "${failures//[[:space:]]/}" ]]; then
    printf '  %-22s OK\n' "$label"
    return 0
  fi
  printf '  %-22s FAIL\n' "$label"
  while IFS= read -r line; do
    [[ -n "$line" ]] && echo "      - $line"
  done <<<"$failures"
  DOCTOR_FAILURES=$((DOCTOR_FAILURES + 1))
}

# ── Live machine checks ────────────────────────────────────────────────

# The kernel must reach every harness the docs claim to support. This list is
# the contract; if a harness is added to links.sh, add it here too.
doctor_kernel_reach() {
  local p
  for p in \
    "$HOME/.claude/CLAUDE.md" \
    "$HOME/.gemini/GEMINI.md" \
    "$HOME/.config/opencode/AGENTS.md" \
    "$HOME/.codex/AGENTS.md" \
    "$HOME/.openai/AGENTS.md" \
    "$HOME/.config/agents" \
    "$HOME/.agents/learnings" \
    "$HOME/.agents/skills"; do
    [[ -e "$p" ]] || echo "$p does not resolve (run: bash install)"
  done
}

# list_broken_repo_symlinks <search_dir> <repo_root>: broken symlinks that point
# into the repo, meaning links.sh created them and they are ours to fix. Links
# pointing elsewhere are tool-managed runtime state (Claude Code's debug logs,
# for one) and are deliberately ignored.
list_broken_repo_symlinks() {
  local search_dir="$1" repo_root="$2" l target
  [[ -d "$search_dir" ]] || return 0
  find "$search_dir" -maxdepth 2 -type l -print 2>/dev/null | LC_ALL=C sort |
    while read -r l; do
      [[ -e "$l" ]] && continue
      target="$(readlink "$l")"
      case "$target" in
      "$repo_root"/*) echo "$l" ;;
      esac
    done
}

# Broken symlinks across every directory the AI OS links into.
doctor_broken_symlinks() {
  local d
  for d in "$HOME/.claude" "$HOME/.gemini" "$HOME/.config/opencode" \
    "$HOME/.codex" "$HOME/.openai" "$HOME/.agents" "$HOME/.config/agents"; do
    list_broken_repo_symlinks "$d" "$DOTFILES"
  done
}

doctor_main() {
  local agents_dir="$DOTFILES/agents"
  local kernel="$agents_dir/instructions/AGENTS.md"
  local doc

  echo ""
  echo "==> AI OS health check"
  echo ""

  report "symlinks" "$(doctor_kernel_reach)"
  report "broken links" "$(doctor_broken_symlinks)"

  report "learnings" "$(
    missing_from "$(list_learnings_on_disk "$agents_dir")" "$(list_learnings_imported "$kernel")" |
      sed 's/$/ on disk but never imported by the kernel/'
    missing_from "$(list_learnings_imported "$kernel")" "$(list_learnings_on_disk "$agents_dir")" |
      sed 's/$/ imported by the kernel but missing on disk/'
  )"

  report "products" "$(
    missing_from "$(list_products_on_disk "$agents_dir")" "$(list_products_registered "$kernel")" |
      sed 's/$/ has a PRODUCT.md but is not registered in the kernel/'
    missing_from "$(list_products_registered "$kernel")" "$(list_products_on_disk "$agents_dir")" |
      sed 's/$/ is registered in the kernel but has no PRODUCT.md/'
  )"

  report "subagents" "$(
    missing_from "$(list_subagents_on_disk "$agents_dir")" "$(list_subagents_registered "$kernel")" |
      sed 's/$/ has a role file but is not registered in the kernel/'
    missing_from "$(list_subagents_registered "$kernel")" "$(list_subagents_on_disk "$agents_dir")" |
      sed 's/$/ is registered in the kernel but has no role file/'
  )"

  report "dead refs" "$(
    for doc in "$DOTFILES/AGENTS.md" "$DOTFILES/README.md" "$kernel" "$agents_dir/README.md"; do
      list_dead_refs "$doc" "$DOTFILES" | sed "s#^#${doc#$DOTFILES/} references missing #"
    done
  )"

  report "dead links" "$(
    for doc in "$DOTFILES/AGENTS.md" "$DOTFILES/README.md" "$agents_dir/README.md"; do
      list_dead_md_links "$doc" "$DOTFILES" | sed "s#^#${doc#$DOTFILES/} links to missing #"
    done
  )"

  report "commands" "$(
    for doc in "$DOTFILES/AGENTS.md" "$DOTFILES/README.md" "$agents_dir/README.md"; do
      list_missing_root_commands "$doc" "$DOTFILES" |
        sed "s#^#${doc#$DOTFILES/} documents \`bash #;s#\$#\` but no such script exists#"
    done
  )"

  echo ""
  if [[ $DOCTOR_FAILURES -eq 0 ]]; then
    echo "==> AI OS healthy"
    return 0
  fi
  echo "==> $DOCTOR_FAILURES check(s) failed"
  return 1
}
