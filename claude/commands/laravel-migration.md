Create a Laravel database migration for: $ARGUMENTS

Follow this approach:

1. **Schema Design**:
   - Choose appropriate column types (use the most specific type: ulid, json, decimal, etc.)
   - Add proper indexes for columns used in WHERE/ORDER BY/JOIN clauses
   - Add foreign key constraints with appropriate ON DELETE behavior
   - Consider nullable vs default values carefully
   - Use timestamps() unless there's a reason not to

2. **Migration File**:
   - Use descriptive migration name following Laravel conventions
   - Implement both `up()` and `down()` methods (rollback must be safe)
   - Group related schema changes in one migration
   - Add comments for non-obvious column purposes

3. **Best Practices**:
   - Use `ulid()` or `uuid()` for public-facing IDs, keep `id()` for internal use
   - Use `foreignUlid()`/`foreignId()` with `constrained()` for relationships
   - Add composite indexes for multi-column queries
   - Use `softDeletes()` for data that should be recoverable
   - Consider `after('column')` for logical column ordering
   - Use enums via string columns (not MySQL ENUM type) for portability

4. **If modifying existing table**:
   - Check current schema first
   - Make changes backward-compatible when possible
   - Consider data migration needs (not just schema changes)
   - Ensure rollback won't lose data

5. **After creating migration**, also:
   - Update the Model's `$fillable`, `$casts`, and relationships if needed
   - Update or create Factory with the new columns
   - Suggest relevant seeder updates
