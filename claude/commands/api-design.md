---
description: Design RESTful APIs with endpoints, pagination, filtering, error handling, auth, and versioning strategy.
allowed-tools: Read, Write, Edit, Grep, Glob
argument-hint: [api-description]
model: opus
---

Design a RESTful API for: $ARGUMENTS

Provide a comprehensive API design document:

1. **Resource Identification**:
   - Identify the core resources/entities
   - Define resource relationships (1:1, 1:N, M:N)
   - Determine resource naming (plural nouns, kebab-case)

2. **Endpoint Design**:
   For each resource, define:
   ```
   METHOD /api/v1/resource-name
   - Description
   - Auth required: yes/no
   - Request headers
   - Request body (JSON schema)
   - Query parameters (filtering, sorting, pagination)
   - Response body (JSON schema)
   - Status codes (success + error cases)
   ```

3. **Standard Patterns**:
   - `GET /resources` - List with pagination, filtering, sorting
   - `POST /resources` - Create
   - `GET /resources/{id}` - Show
   - `PUT /resources/{id}` - Full update
   - `PATCH /resources/{id}` - Partial update
   - `DELETE /resources/{id}` - Soft delete
   - Nested resources: `GET /resources/{id}/sub-resources`

4. **Cross-Cutting Concerns**:
   - **Authentication**: Bearer token (Sanctum) or API key
   - **Pagination**: Cursor-based for feeds, offset for admin panels
   - **Filtering**: `?filter[status]=active&filter[created_after]=2024-01-01`
   - **Sorting**: `?sort=-created_at,name` (- prefix for desc)
   - **Includes**: `?include=author,comments` (eager loading)
   - **Fields**: `?fields[posts]=title,body` (sparse fieldsets)
   - **Rate Limiting**: Per-endpoint limits with headers
   - **Versioning**: URL prefix (`/api/v1/`)

5. **Error Format**:
   ```json
   {
     "message": "Human readable message",
     "errors": { "field": ["Validation error"] },
     "code": "VALIDATION_ERROR"
   }
   ```

6. **After Design**, implement the first endpoint as a reference implementation.

Standards:
- Use HTTP methods correctly (GET is safe+idempotent, PUT is idempotent, POST is neither)
- Use appropriate status codes (201, 204, 404, 409, 422, 429)
- Return consistent response envelopes
- Document breaking changes and deprecation strategy
