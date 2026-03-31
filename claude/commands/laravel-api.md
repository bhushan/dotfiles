---
description: Design and implement RESTful API endpoints in Laravel with routes, form requests, controllers, resources, and tests.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: [endpoint-description]
model: sonnet
---

Design and implement a RESTful API endpoint in Laravel for: $ARGUMENTS

Follow this approach:

1. **API Design** - Define the endpoint structure:
   - HTTP method and URL pattern (RESTful conventions)
   - Request payload schema with validation rules
   - Response payload schema with proper HTTP status codes
   - Error response format
   - Pagination strategy (cursor vs offset) for list endpoints

2. **Implementation**:
   - Route definition in `routes/api.php` with proper middleware (auth:sanctum, throttle, etc.)
   - Form Request for validation with custom messages
   - Controller with single-responsibility actions
   - API Resource/Collection for response transformation
   - Repository or Service class for complex business logic

3. **Security**:
   - Authentication via Sanctum (token or SPA)
   - Authorization via Policy
   - Rate limiting configuration
   - Input sanitization
   - Mass assignment protection

4. **Testing** (Pest):
   - Test each HTTP status code scenario
   - Test validation failures with specific messages
   - Test authorization (forbidden for unauthorized users)
   - Test pagination, filtering, and sorting
   - Test edge cases (empty results, not found, etc.)

5. **Documentation**:
   - Add PHPDoc blocks to controller methods
   - Document request/response examples in comments

Standards:
- Use consistent JSON:API or Laravel Resource format
- Always return proper HTTP status codes (201 for create, 204 for delete, etc.)
- Use cursor pagination for large datasets
- Include `X-Request-Id` header for traceability
- Never expose internal IDs in URLs if using UUIDs
