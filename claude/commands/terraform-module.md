---
description: Create Terraform modules with proper structure, variables, outputs, security controls, and lifecycle management.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: [module-description]
model: opus
---

Create a Terraform module for: $ARGUMENTS

Follow this approach:

1. **Module Structure**:
   - `main.tf` - Primary resource definitions
   - `variables.tf` - Input variables with descriptions, types, and validation
   - `outputs.tf` - Output values for consumers
   - `versions.tf` - Required providers and Terraform version constraints
   - `locals.tf` - Computed local values and naming conventions
   - `data.tf` - Data sources (if needed)

2. **Variables**:
   - Use descriptive names with clear descriptions
   - Set appropriate types (string, number, bool, list, map, object)
   - Add validation blocks for constrained inputs
   - Use sensible defaults where appropriate
   - Mark sensitive variables with `sensitive = true`
   - Use variable objects for related configuration groups

3. **Resources**:
   - Use consistent naming: `"${var.project}-${var.environment}-${purpose}"`
   - Add meaningful tags (Name, Environment, Project, ManagedBy=terraform)
   - Use `lifecycle` blocks where appropriate (prevent_destroy, create_before_destroy)
   - Reference other resources by attribute, not hardcoded values

4. **Security**:
   - Follow least-privilege for IAM policies
   - Enable encryption at rest and in transit
   - Use security groups with minimal port exposure
   - Enable logging and monitoring
   - Never hardcode secrets (use SSM Parameter Store or Secrets Manager)

5. **Best Practices**:
   - Use `for_each` over `count` for resources that need stable addressing
   - Use `depends_on` sparingly (only when implicit dependencies aren't sufficient)
   - Keep modules focused (one concern per module)
   - Use moved blocks for refactoring without destroying resources
   - Add `# tfsec:ignore` comments only with justification

6. **Outputs**:
   - Export IDs, ARNs, and endpoints that consumers will need
   - Use descriptive output names and descriptions
   - Mark sensitive outputs appropriately
