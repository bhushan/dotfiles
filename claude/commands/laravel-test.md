Write comprehensive Pest tests for: $ARGUMENTS

Analyze the code being tested and create thorough test coverage:

1. **Read the source code first** - Understand every code path, condition, and edge case

2. **Feature Tests** (HTTP/Integration):
   - Happy path for each endpoint/action
   - Validation failures (each rule individually)
   - Authorization (authenticated, unauthorized, forbidden)
   - Edge cases (empty data, boundary values, duplicate entries)
   - Response structure assertions (JSON structure, status codes)
   - Database assertions (assertDatabaseHas, assertDatabaseMissing)
   - Event/Job/Mail assertions where applicable

3. **Unit Tests** (isolated logic):
   - Model relationships (hasMany, belongsTo, etc.)
   - Model scopes and accessors
   - Service/Action class methods
   - Value objects and DTOs
   - Helper functions

4. **Test Organization**:
   - Use `describe()` blocks to group related tests
   - Use `it()` with clear descriptions ("it creates a user with valid data")
   - Use `beforeEach()` for shared setup
   - Use datasets for parameterized tests
   - Use factories with states for different scenarios

5. **Standards**:
   - Use Pest syntax (not PHPUnit)
   - Use `expect()` API for assertions
   - Use `actingAs()` for authenticated requests
   - Use RefreshDatabase trait
   - Avoid testing framework internals
   - Each test should be independent (no shared state between tests)
   - Name tests descriptively: `it('returns 422 when email is missing')`
   - Use `freezeTime()` for time-dependent tests
