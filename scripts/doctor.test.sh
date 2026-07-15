#!/usr/bin/env bash
# Tests for scripts/doctor.sh, run: bash scripts/doctor.test.sh
#
# Pure list/parse functions are tested against throwaway fixtures, then the
# real repo is asserted against its own kernel. Fixtures keep the tests honest
# when the real tree happens to be healthy.

set -uo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export DOTFILES

source "$DOTFILES/scripts/doctor.sh"

_pass=0
_fail=0

is() { # is <label> <expected> <actual>
  if [[ "$2" == "$3" ]]; then
    _pass=$((_pass + 1))
  else
    _fail=$((_fail + 1))
    echo "  FAIL  $1"
    echo "        expected: [$2]"
    echo "        actual:   [$3]"
  fi
}

# ── Fixture ────────────────────────────────────────────────────────────
# A miniature AI OS: two products, two roles, two learnings, one kernel that
# registers only some of them. The gaps are what doctor must report.

FIXTURE="$(mktemp -d)"
trap 'rm -rf "$FIXTURE"' EXIT

mkdir -p "$FIXTURE/agents/products/shipped/assets"
mkdir -p "$FIXTURE/agents/products/unregistered"
mkdir -p "$FIXTURE/agents/products/no-pack"
mkdir -p "$FIXTURE/agents/subagents"
mkdir -p "$FIXTURE/agents/learnings"

echo "# Shipped" >"$FIXTURE/agents/products/shipped/PRODUCT.md"
echo "# Unregistered" >"$FIXTURE/agents/products/unregistered/PRODUCT.md"
# no-pack/ has no PRODUCT.md, so it is not a product at all

echo "---" >"$FIXTURE/agents/subagents/tech-lead.md"
echo "---" >"$FIXTURE/agents/subagents/copywriter.md"

echo "- pref" >"$FIXTURE/agents/learnings/preferences.md"
echo "- ux" >"$FIXTURE/agents/learnings/ux-principles.md"
echo "# readme" >"$FIXTURE/agents/learnings/README.md"

cat >"$FIXTURE/agents/kernel.md" <<'KERNEL'
# Kernel

@./learnings/preferences.md
@./learnings/deleted-file.md

| Product | Context pack |
| --- | --- |
| Shipped | `~/.config/agents/products/shipped/PRODUCT.md` |
| Ghost | `~/.config/agents/products/ghost/PRODUCT.md` |

| Role | Use for |
| --- | --- |
| tech-lead | Architecture |
| data-analyst | Metrics |

See `agents/learnings/preferences.md` and `agents/nope/missing.md`.

```bash
bash install
bash phantom
```
KERNEL

echo "==> doctor.sh unit tests"

# ── Products ───────────────────────────────────────────────────────────
is "products on disk (needs PRODUCT.md)" \
  "shipped
unregistered" \
  "$(list_products_on_disk "$FIXTURE/agents")"

is "products registered in kernel" \
  "ghost
shipped" \
  "$(list_products_registered "$FIXTURE/agents/kernel.md")"

is "product on disk but not registered" \
  "unregistered" \
  "$(missing_from "$(list_products_on_disk "$FIXTURE/agents")" "$(list_products_registered "$FIXTURE/agents/kernel.md")")"

is "product registered but missing on disk" \
  "ghost" \
  "$(missing_from "$(list_products_registered "$FIXTURE/agents/kernel.md")" "$(list_products_on_disk "$FIXTURE/agents")")"

# ── Subagents ──────────────────────────────────────────────────────────
is "subagents on disk" \
  "copywriter
tech-lead" \
  "$(list_subagents_on_disk "$FIXTURE/agents")"

is "subagents registered (lowercase role rows only)" \
  "data-analyst
tech-lead" \
  "$(list_subagents_registered "$FIXTURE/agents/kernel.md")"

is "subagent registered but has no role file" \
  "data-analyst" \
  "$(missing_from "$(list_subagents_registered "$FIXTURE/agents/kernel.md")" "$(list_subagents_on_disk "$FIXTURE/agents")")"

# ── Learnings ──────────────────────────────────────────────────────────
is "learnings on disk (README excluded)" \
  "preferences.md
ux-principles.md" \
  "$(list_learnings_on_disk "$FIXTURE/agents")"

is "learnings imported by kernel" \
  "deleted-file.md
preferences.md" \
  "$(list_learnings_imported "$FIXTURE/agents/kernel.md")"

is "learning on disk but never imported" \
  "ux-principles.md" \
  "$(missing_from "$(list_learnings_on_disk "$FIXTURE/agents")" "$(list_learnings_imported "$FIXTURE/agents/kernel.md")")"

is "learning imported but file deleted" \
  "deleted-file.md" \
  "$(missing_from "$(list_learnings_imported "$FIXTURE/agents/kernel.md")" "$(list_learnings_on_disk "$FIXTURE/agents")")"

# ── Dead references ────────────────────────────────────────────────────
# This is the check that would have caught `agents/learnings/alfred-scholar.md`.
is "dead repo-path reference in docs" \
  "agents/nope/missing.md" \
  "$(list_dead_refs "$FIXTURE/agents/kernel.md" "$FIXTURE")"

# ── Phantom commands ───────────────────────────────────────────────────
# This is the check that would have caught `bash update`.
touch "$FIXTURE/install"
is "documented root command that does not exist" \
  "phantom" \
  "$(list_missing_root_commands "$FIXTURE/agents/kernel.md" "$FIXTURE")"

# ── Dead markdown links ────────────────────────────────────────────────
# Relative links only. External URLs and anchors are not ours to verify.
cat >"$FIXTURE/readme.md" <<'READ'
See the [palette](colors/palette.md) and the [license](LICENSE).
Read [the kernel](agents/kernel.md) too.
External [site](https://example.com) and an [anchor](#setup) are not checked.
An ![image](assets/logo.png) counts as a link.
READ
mkdir -p "$FIXTURE/colors"
echo "# palette" >"$FIXTURE/colors/palette.md"

is "dead relative markdown links (external/anchors ignored)" \
  "LICENSE
assets/logo.png" \
  "$(list_dead_md_links "$FIXTURE/readme.md" "$FIXTURE")"

touch "$FIXTURE/LICENSE"
mkdir -p "$FIXTURE/assets" && touch "$FIXTURE/assets/logo.png"
is "no dead links once targets exist" \
  "" \
  "$(list_dead_md_links "$FIXTURE/readme.md" "$FIXTURE")"

# ── Broken symlinks ────────────────────────────────────────────────────
# Only links we created (pointing into the repo) are ours to report. Agent
# tools keep their own runtime state alongside our symlinks, and a check that
# cries wolf about someone else's stale debug log gets ignored.
HOMEDIR="$FIXTURE/home"
mkdir -p "$HOMEDIR/.tool" "$FIXTURE/real"
echo "x" >"$FIXTURE/real/target.md"

ln -s "$FIXTURE/real/target.md" "$HOMEDIR/.tool/good"                   # ours, resolves
ln -s "$FIXTURE/real/deleted.md" "$HOMEDIR/.tool/ours-broken"           # ours, broken
ln -s "/tmp/some-tool-runtime-state.log" "$HOMEDIR/.tool/theirs-broken" # not ours

is "broken symlinks pointing into the repo are reported" \
  "$HOMEDIR/.tool/ours-broken" \
  "$(list_broken_repo_symlinks "$HOMEDIR/.tool" "$FIXTURE")"

# ── Real repo: the kernel must actually describe what is on disk ────────
echo "==> real repo assertions"

AGENTS_DIR="$DOTFILES/agents"
KERNEL="$AGENTS_DIR/instructions/AGENTS.md"

is "every product on disk is registered in the kernel" \
  "" \
  "$(missing_from "$(list_products_on_disk "$AGENTS_DIR")" "$(list_products_registered "$KERNEL")")"

is "every product the kernel registers exists on disk" \
  "" \
  "$(missing_from "$(list_products_registered "$KERNEL")" "$(list_products_on_disk "$AGENTS_DIR")")"

is "every subagent on disk is registered in the kernel" \
  "" \
  "$(missing_from "$(list_subagents_on_disk "$AGENTS_DIR")" "$(list_subagents_registered "$KERNEL")")"

is "every role the kernel registers has a file" \
  "" \
  "$(missing_from "$(list_subagents_registered "$KERNEL")" "$(list_subagents_on_disk "$AGENTS_DIR")")"

is "every learning on disk is imported by the kernel" \
  "" \
  "$(missing_from "$(list_learnings_on_disk "$AGENTS_DIR")" "$(list_learnings_imported "$KERNEL")")"

is "every learning the kernel imports exists" \
  "" \
  "$(missing_from "$(list_learnings_imported "$KERNEL")" "$(list_learnings_on_disk "$AGENTS_DIR")")"

is "kernel has no dead repo-path references" \
  "" \
  "$(list_dead_refs "$KERNEL" "$DOTFILES")"

is "root AGENTS.md has no dead repo-path references" \
  "" \
  "$(list_dead_refs "$DOTFILES/AGENTS.md" "$DOTFILES")"

is "root AGENTS.md documents no phantom commands" \
  "" \
  "$(list_missing_root_commands "$DOTFILES/AGENTS.md" "$DOTFILES")"

is "agents/README.md has no dead repo-path references" \
  "" \
  "$(list_dead_refs "$AGENTS_DIR/README.md" "$DOTFILES")"

is "README.md has no dead repo-path references" \
  "" \
  "$(list_dead_refs "$DOTFILES/README.md" "$DOTFILES")"

is "README.md documents no phantom commands" \
  "" \
  "$(list_missing_root_commands "$DOTFILES/README.md" "$DOTFILES")"

is "README.md has no dead links" \
  "" \
  "$(list_dead_md_links "$DOTFILES/README.md" "$DOTFILES")"

is "root AGENTS.md has no dead links" \
  "" \
  "$(list_dead_md_links "$DOTFILES/AGENTS.md" "$DOTFILES")"

# ── Summary ────────────────────────────────────────────────────────────
echo ""
if [[ $_fail -eq 0 ]]; then
  echo "==> $_pass passed"
  exit 0
fi
echo "==> $_pass passed, $_fail failed"
exit 1
