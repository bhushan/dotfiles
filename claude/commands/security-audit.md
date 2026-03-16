Perform a security audit on: $ARGUMENTS

If no specific target is given, audit the current project.

Systematically check for vulnerabilities across these categories:

1. **Injection Vulnerabilities**:
   - SQL injection (raw queries, string concatenation in queries)
   - XSS (unescaped output, innerHTML, dangerouslySetInnerHTML)
   - Command injection (exec, system, shell_exec, child_process)
   - LDAP injection, XML injection, template injection
   - Check for parameterized queries and prepared statements

2. **Authentication & Authorization**:
   - Weak password policies
   - Missing rate limiting on auth endpoints
   - Insecure session management
   - Missing CSRF protection
   - Broken access control (IDOR, privilege escalation)
   - JWT implementation issues (algorithm confusion, weak secrets)
   - Missing auth middleware on protected routes

3. **Data Exposure**:
   - Sensitive data in logs (passwords, tokens, PII)
   - API responses exposing internal data
   - Debug mode enabled in production configs
   - Hardcoded secrets, API keys, or credentials
   - .env files or config files in public directories
   - Stack traces exposed to users

4. **Dependency Security**:
   - Check composer.lock / package-lock.json for known vulnerabilities
   - Outdated packages with security patches
   - Unused dependencies increasing attack surface

5. **Infrastructure Security** (if applicable):
   - S3 bucket policies (public access)
   - Security group rules (overly permissive)
   - IAM policies (excessive permissions)
   - Unencrypted data at rest or in transit
   - Missing SSL/TLS enforcement

6. **Laravel-Specific** (if Laravel project):
   - Mass assignment vulnerabilities (missing $fillable/$guarded)
   - Unvalidated file uploads
   - Missing request validation
   - Blade templates with {!! !!} (unescaped output)
   - Debug bar / Telescope accessible in production
   - APP_DEBUG=true in production

7. **Frontend-Specific** (if frontend code):
   - CSP headers missing or overly permissive
   - CORS misconfiguration
   - Clickjacking protection (X-Frame-Options)
   - localStorage/sessionStorage storing sensitive data
   - Third-party script integrity (SRI)

Output a prioritized report with:
- **Critical**: Must fix immediately (active exploitation risk)
- **High**: Fix soon (significant security risk)
- **Medium**: Fix in next sprint (defense-in-depth)
- **Low**: Improve when convenient (hardening)

For each finding, provide the specific file/line, the vulnerability, and a concrete fix.
