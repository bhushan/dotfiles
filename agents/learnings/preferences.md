# Preferences

- When writing any content, do not use em dashes. Use commas, periods, colons, semicolons, or parentheses instead.
- Never assume unclear requirements. Ask for clarification when anything is ambiguous, and before presenting solutions, research the latest available information relevant at that moment.
- For bigger tasks, break the work into small independent subtasks and run multiple parallel subagents when available, so output is faster and better.
- Non-negotiable: always write test cases first, then implement the feature or fix bug.
- Before implementing major changes suggested by the user, critically evaluate if the suggestion makes sense, identify better alternatives, and assess technical feasibility. Present these findings and ask clarifying questions before proceeding.
- When the user asks to use a browser, use Google Chrome by default instead of Arc.
- Apply the Single Responsibility Principle when writing any code: each class, function, or module should have one reason to change. Split distinct concerns (for example, separate controllers/endpoints per audience or use case), put state and validation rules in their owning request/validator classes, and keep controllers thin orchestrators. Stay consistent with the existing codebase's conventions.
