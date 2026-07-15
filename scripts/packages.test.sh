#!/usr/bin/env bash
# Tests for scripts/packages.sh, run: bash scripts/packages.test.sh
#
# packages.sh is sourced by `install` under `set -e`, so any non-zero command
# aborts the whole run and silently skips links.sh and apps.sh. These tests pin
# down which failures are allowed to do that: syncing the Brewfile is load
# bearing and must abort, cleanup is opportunistic disk hygiene and must not.
#
# brew is stubbed on PATH so the tests never touch the real Homebrew.

set -uo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$DOTFILES"
export DOTFILES

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
# A stub brew whose failure mode is chosen per-test via $STUB_FAIL_ON:
# "cleanup" fails only `brew bundle cleanup`, "bundle" fails only the sync.

FIXTURE="$(mktemp -d)"
trap 'rm -rf "$FIXTURE"' EXIT

mkdir -p "$FIXTURE/bin"
echo "brew 'git'" >"$FIXTURE/Brewfile"

cat >"$FIXTURE/bin/brew" <<'STUB'
#!/usr/bin/env bash
# $1 is always "bundle" here; "cleanup" appears as $2 only for the cleanup call.
if [[ "${2:-}" == "cleanup" ]]; then
  [[ "${STUB_FAIL_ON:-}" == "cleanup" ]] && { echo "stub: cleanup failed" >&2; exit 1; }
  exit 0
fi
[[ "${STUB_FAIL_ON:-}" == "bundle" ]] && { echo "stub: bundle failed" >&2; exit 1; }
exit 0
STUB
chmod +x "$FIXTURE/bin/brew"

# run_packages <fail-on> -> prints the exit code install would see
run_packages() {
  (
    set -e
    export PATH="$FIXTURE/bin:$PATH"
    export DOTFILES="$FIXTURE"
    export STUB_FAIL_ON="$1"
    source "$REPO/scripts/utils.sh"
    source "$REPO/scripts/packages.sh"
  ) >/dev/null 2>&1
  echo $?
}

# ── Tests ──────────────────────────────────────────────────────────────

is "a healthy run exits 0" \
  "0" \
  "$(run_packages none)"

# The regression this file exists for: root-owned kegs left behind by Valet's
# `sudo brew services` make `brew cleanup` exit 1 forever. Under set -e that
# aborted install before a single symlink was created, and the failure looked
# like success because cleanup still prints "freed approximately N MB".
is "a cleanup failure does not abort install" \
  "0" \
  "$(run_packages cleanup)"

# The other half: making cleanup non-fatal must not mask a real sync failure.
is "a Brewfile sync failure still aborts install" \
  "1" \
  "$(run_packages bundle)"

# ── Summary ────────────────────────────────────────────────────────────
echo ""
if [[ $_fail -eq 0 ]]; then
  echo "==> $_pass passed"
  exit 0
fi
echo "==> $_pass passed, $_fail failed"
exit 1
