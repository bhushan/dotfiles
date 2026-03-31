---
description: Run a pre-deployment verification checklist covering code quality, database, security, performance, and rollback.
allowed-tools: Bash, Read, Grep, Glob
argument-hint: [project-path]
model: haiku
---

Run a pre-deployment checklist for: $ARGUMENTS

If no specific context given, analyze the current project.

## Pre-Deployment Verification

### 1. Code Quality
- [ ] All tests pass (`php artisan test` / `npm test`)
- [ ] No linting errors (`pint --test` / `eslint .`)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Code has been reviewed (check for open PR reviews)

### 2. Database
- [ ] Migrations are up to date and reversible
- [ ] No destructive migrations without data backup plan
- [ ] Seeders still work (`php artisan db:seed --class=DatabaseSeeder`)
- [ ] Check for missing indexes on new columns

### 3. Environment & Config
- [ ] All new env variables documented in `.env.example`
- [ ] Config cached properly (`php artisan config:cache`)
- [ ] Routes cached (`php artisan route:cache`)
- [ ] Views cached (`php artisan view:cache`)

### 4. Security
- [ ] No hardcoded secrets in committed code
- [ ] APP_DEBUG=false in production
- [ ] CSRF protection on all forms
- [ ] API authentication on protected routes
- [ ] File upload validation (type, size)
- [ ] No SQL injection risks (raw queries)

### 5. Performance
- [ ] N+1 queries resolved (eager loading)
- [ ] Database queries optimized (check slow query log)
- [ ] Static assets minified and versioned
- [ ] Images optimized
- [ ] Cache strategy in place for heavy queries

### 6. Infrastructure
- [ ] Build succeeds (`npm run build`)
- [ ] Docker images build cleanly (if applicable)
- [ ] Terraform plan shows expected changes (if applicable)
- [ ] Auto-scaling configured for expected load
- [ ] Monitoring/alerting in place

### 7. Rollback Plan
- [ ] Database rollback tested (`php artisan migrate:rollback`)
- [ ] Previous version tagged for quick revert
- [ ] Feature flags for gradual rollout (if applicable)

For each item, I'll check what I can programmatically and report the status.
