Refactor the following code: $ARGUMENTS

Follow this systematic approach:

1. **Analysis Phase** (read and understand first):
   - Read the target code thoroughly
   - Identify code smells: duplication, long methods, god classes, feature envy, etc.
   - Map dependencies (what calls this code, what does it call)
   - Check for existing tests (refactoring without tests is risky)

2. **Plan the Refactoring**:
   - Identify specific patterns to apply:
     - Extract Method/Class for long functions
     - Replace conditionals with polymorphism
     - Introduce parameter objects for long parameter lists
     - Replace magic numbers/strings with named constants
     - Apply SOLID principles where violated
     - Simplify nested conditionals (guard clauses, early returns)
   - Ensure each step keeps the code working (atomic changes)

3. **Execute**:
   - Make one refactoring at a time
   - Preserve existing behavior exactly (no feature changes)
   - Maintain the public API unless explicitly asked to change it
   - Update imports and references
   - Keep git history clean (logical commits)

4. **Validation**:
   - Run existing tests after each change
   - Verify no regressions
   - Check that the refactored code is actually simpler (fewer lines isn't always better)

5. **Standards**:
   - PHP: PSR-12, use PHP 8.4 features (readonly, enums, match, named args, first-class callables)
   - TypeScript: Strict types, no `any`, proper generics
   - Follow existing project conventions (naming, structure, patterns)
   - Don't over-abstract (YAGNI - You Aren't Gonna Need It)
   - Prefer composition over inheritance
   - Keep functions small and focused (single responsibility)

Do NOT:
- Change behavior while refactoring (separate concerns)
- Add features during refactoring
- Refactor code without reading it first
- Create abstractions for single-use patterns
- Gold-plate (make it "perfect" beyond what's needed)
