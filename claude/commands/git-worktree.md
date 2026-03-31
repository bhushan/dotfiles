---
description: Set up git worktrees for isolated feature development, list existing worktrees, or clean up merged ones.
allowed-tools: Bash(git *), Read, Glob
argument-hint: [action|branch-name]
model: haiku
---

Set up a git worktree for: $ARGUMENTS

This command helps manage git worktree-based feature development.

1. **Determine the action** from the arguments:
   - If a feature/branch name is given: create a new worktree
   - If "list" or "ls": show existing worktrees
   - If "clean" or "prune": clean up merged worktrees

2. **Create New Worktree**:
   ```bash
   # Ensure we're in the bare repo or main worktree
   git worktree list

   # Create worktree with proper branch naming
   # Convention: feature/name, bugfix/name, hotfix/name
   git worktree add ../.feature-name origin/develop -b feature/name
   ```

3. **Post-Setup**:
   - Copy relevant local config (but NOT .env - use .env.example)
   - Install dependencies if package.json/composer.json exists:
     ```bash
     composer install  # PHP
     npm ci            # Node.js
     ```
   - Run migrations if it's a Laravel project:
     ```bash
     php artisan migrate
     ```
   - Report the worktree path

4. **Cleanup** (when done):
   ```bash
   # Remove a specific worktree
   git worktree remove ../.feature-name

   # Prune stale worktrees
   git worktree prune
   ```

5. **Tips**:
   - Each worktree is isolated (different branch, different working directory)
   - Share the same .git history across worktrees
   - Perfect for: reviewing PRs while working on something else, running tests on one branch while coding on another
   - Use the user's existing aliases: `gwl` (list), `gwp` (prune), `gwa` (add), `gwr` (remove)

Follow the user's naming convention: worktree directories are prefixed with `.` (e.g., `.feature-name`).
