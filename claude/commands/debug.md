---
description: Systematic debugging workflow - reproduce, gather evidence, hypothesize, investigate, fix, and verify.
allowed-tools: Read, Grep, Glob, Bash
argument-hint: [issue-description]
model: sonnet
---

Debug the following issue: $ARGUMENTS

Follow a systematic debugging approach:

1. **Reproduce**:
   - Understand the expected behavior vs actual behavior
   - Identify the exact steps to reproduce
   - Check if it's environment-specific (dev vs prod, OS, browser)

2. **Gather Evidence**:
   - Read relevant error messages, stack traces, and logs
   - Check recent git changes that might have introduced the bug (`git log --oneline -20`, `git diff`)
   - Look at the specific code path involved
   - Check for related issues in the codebase (similar patterns that work)

3. **Hypothesize**:
   - Form 2-3 most likely causes based on the evidence
   - Rank by probability
   - Start investigating the most likely cause first

4. **Investigate**:
   - Read the code path from entry point to the error
   - Check input/output at each step
   - Look for:
     - Type mismatches or null values
     - Race conditions or timing issues
     - Missing error handling
     - Incorrect assumptions about data shape
     - Environment or configuration differences
     - Dependency version mismatches

5. **Fix**:
   - Make the minimal change that fixes the root cause (not just the symptom)
   - Add a regression test that would have caught this bug
   - Check for similar patterns elsewhere that might have the same issue

6. **Verify**:
   - Run the test suite to ensure no regressions
   - Verify the fix resolves the original issue
   - Check edge cases around the fix

Useful commands for debugging:
- `git log --oneline -20` - Recent changes
- `git blame <file>` - Who changed what
- `git bisect` - Find the commit that introduced the bug
- `php artisan tinker` - Interactive Laravel REPL
- `node --inspect` - Node.js debugger
- Check `.env` values match expectations (without reading the file directly)
