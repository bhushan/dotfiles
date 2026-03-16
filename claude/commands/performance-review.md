Analyze code for performance issues: $ARGUMENTS

If no specific target is given, analyze the current project's critical paths.

Check these areas systematically:

1. **Database Performance** (Laravel/SQL):
   - N+1 query problems (missing eager loading)
   - Missing database indexes on queried columns
   - Unnecessary SELECT * (select only needed columns)
   - Large result sets without pagination
   - Complex queries that could use caching
   - Missing database query caching
   - Slow migrations (locking large tables)
   - Unoptimized joins and subqueries

2. **PHP/Backend Performance**:
   - Blocking I/O operations
   - Missing caching (Redis/Memcached) for expensive computations
   - Unnecessary object creation in loops
   - Large collection operations (use lazy collections for big datasets)
   - Missing queue jobs for heavy operations (email, file processing)
   - Inefficient string operations
   - Memory leaks in long-running processes

3. **Frontend Performance**:
   - Bundle size analysis (large dependencies)
   - Unnecessary re-renders (missing memo, useMemo, useCallback)
   - Large images without optimization (WebP, lazy loading, srcset)
   - Missing code splitting / lazy loading for routes
   - Blocking scripts in the head
   - Layout shifts (CLS issues)
   - Expensive DOM operations

4. **API Performance**:
   - Missing response caching (ETags, Cache-Control)
   - Over-fetching data (return only needed fields)
   - Missing compression (gzip/brotli)
   - Chatty APIs (too many small requests instead of batched)
   - Missing pagination for list endpoints

5. **Infrastructure**:
   - Missing CDN for static assets
   - Unoptimized Docker images (large layers, no multi-stage)
   - Missing auto-scaling configuration
   - Inefficient log volume
   - Missing connection pooling

Output format:
- **Impact**: High/Medium/Low (estimated performance improvement)
- **Effort**: Quick fix / Moderate / Major refactor
- **Location**: Specific file and line numbers
- **Current behavior**: What's slow and why
- **Recommended fix**: Concrete implementation with code examples
- **Expected improvement**: Estimated performance gain

Prioritize by impact-to-effort ratio (quick wins first).
