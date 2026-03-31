---
description: Design and implement AWS infrastructure (ECS, Lambda, RDS, S3, etc.) with security, monitoring, and cost optimization.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: [infrastructure-description]
model: opus
---

Design and implement AWS infrastructure for: $ARGUMENTS

Follow this approach:

1. **Architecture Review**:
   - Identify required AWS services
   - Design for the appropriate tier (dev/staging/production)
   - Consider multi-AZ for production workloads
   - Plan networking (VPC, subnets, security groups)
   - Identify cost implications

2. **Implementation** (Terraform preferred, check project):
   - Create modular Terraform configs (or CloudFormation if project uses it)
   - Use AWS provider best practices
   - Implement proper state management (S3 backend + DynamoDB lock)
   - Use workspaces or directory structure for environment separation

3. **Common Patterns**:
   - **ECS/Fargate**: Task definitions, services, ALB, auto-scaling
   - **Lambda**: Function code, API Gateway, IAM roles, CloudWatch
   - **RDS**: Instance/cluster, parameter groups, subnet groups, backups
   - **S3**: Bucket policies, lifecycle rules, versioning, replication
   - **CloudFront**: Distribution, origins, cache behaviors, WAF
   - **SQS/SNS**: Queues, topics, dead-letter queues, subscriptions

4. **Security**:
   - IAM roles with least-privilege policies
   - Security groups with minimal exposure
   - VPC endpoints for AWS service access
   - KMS keys for encryption
   - Secrets Manager for credentials
   - Enable CloudTrail and VPC Flow Logs

5. **Monitoring & Alerting**:
   - CloudWatch alarms for critical metrics
   - SNS topics for notifications
   - Log groups with appropriate retention
   - X-Ray tracing for distributed systems

6. **Cost Optimization**:
   - Right-size instances
   - Use Reserved Instances or Savings Plans for steady-state
   - Enable auto-scaling
   - S3 lifecycle policies for storage tiering
   - Tag everything for cost allocation

Standards:
- Always use tags: Name, Environment, Project, ManagedBy
- Use SSM Parameter Store for non-secret config, Secrets Manager for secrets
- Enable encryption everywhere (EBS, S3, RDS, ElastiCache)
- Design for failure (multi-AZ, health checks, circuit breakers)
