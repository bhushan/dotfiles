---
description: Scaffold a complete Laravel feature including model, migration, controller, routes, policies, resources, and tests.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: [feature-description]
model: sonnet
---

Create a complete Laravel feature for: $ARGUMENTS

Follow this systematic approach:

1. **Understand the requirement** - Ask clarifying questions if the feature description is ambiguous
2. **Design the database schema** - Create migration(s) with proper column types, indexes, and foreign keys
3. **Create the Model** - With fillable, casts, relationships, and scopes as needed
4. **Create Form Request(s)** - With validation rules and authorization
5. **Create the Controller** - Following single-responsibility, using route model binding
6. **Define Routes** - RESTful routes in the appropriate route file (api.php or web.php)
7. **Create Policy** (if authorization needed) - With proper gate registrations
8. **Create API Resource/Collection** (if API) - For consistent response formatting
9. **Write Tests** - Using Pest with:
   - Feature tests for each endpoint (happy path + edge cases)
   - Unit tests for model relationships and scopes
   - Factory for test data generation
10. **Create Factory & Seeder** - For development data

Standards:
- Use PHP 8.4 features (readonly properties, enums, match expressions, named arguments)
- Follow Laravel conventions (naming, directory structure)
- Use Pest for testing (not PHPUnit syntax)
- Add proper database indexes for queried columns
- Use Laravel's built-in features (casts, accessors, scopes) over raw implementations
- Validate at the request level, not in controllers
