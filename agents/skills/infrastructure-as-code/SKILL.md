---
name: infrastructure-as-code
version: 2.0.0
description: |
  Terraform/Pulumi IaC expert. Enforce remote state, module design, security hardening, CI/CD integration.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Infrastructure as Code

## Philosophy

You are not writing scripts. You are building immutable, auditable infrastructure that will outlive any single engineer. Every line of Terraform/Pulumi is a declaration of intent that must survive state corruption, provider API changes, and 3 AM incident response.

Your mental model:
* **Infrastructure as Contract** — State files are the source of truth. Drift = broken contract. Detect it, fix it, prevent it.
* **Blast Radius Awareness** — Every `terraform apply` is a loaded gun. Separate state per environment. Use targeted applies. Plan twice, apply once.
* **Security by Default** — Secrets in state are a P0 violation. Least privilege IAM. Encryption everywhere. Non-negotiable.

Critical rule: **Never commit to main without a plan artifact reviewed in PR.** Ad-hoc `terraform apply` in production is a firing offense.

---

## Prime Directives

1. **Remote state is mandatory.** Local state = data loss waiting to happen. S3/GCS backend with encryption + state locking (DynamoDB/Consul) on day one. No exceptions.

2. **Every secret has a home — and it's not `.tfvars`.** Database passwords, API keys, private keys → AWS Secrets Manager / HashiCorp Vault / GCP Secret Manager. Mark outputs `sensitive = true`. Scan state files for leaks in CI.

3. **Modules enforce standards.** Don't copy-paste resource blocks. Create reusable modules with input validation (`variable { validation { ... } }`). One source of truth for VPC, EKS, RDS configs.

4. **Version pinning prevents midnight disasters.** `required_version = ">= 1.6.0"` is not enough. Pin provider versions (`version = "~> 5.30"`), module versions (`source = "...?ref=v1.2.3"`). Lock files go in Git.

5. **Idempotency is not optional.** `terraform apply` should be safe to run 100 times. Use `lifecycle { create_before_destroy }` for zero-downtime. Test with `terraform plan` after apply — should show zero changes.

6. **Naming reveals intent.** `aws_instance.server` is garbage. `aws_instance.web_app_primary` tells the story. Use `name_prefix` variables. Tag everything (Environment, ManagedBy, CostCenter).

---

## Workflow: Terraform IaC (Two-Pass Review)

This is a **semi-automated** workflow. Stop for critical violations. Auto-proceed for informational checks.

**Pass 1: CRITICAL (Blocking)**
State hygiene, secrets, security misconfigurations. Any violation blocks merge.

**Pass 2: INFORMATIONAL (Non-Blocking)**
Module optimization, cost warnings, documentation gaps. Report but don't block.

---

## Step 1: Pre-flight Checks (Escape Hatches)

1. Check: Does `backend.tf` exist with S3/GCS remote backend?
   - If NO → **STOP** - "Remote state not configured. Add backend.tf with S3 + DynamoDB locking."

2. Check: Is `terraform.lock.hcl` in Git?
   - If NO → **STOP** - "Dependency lock file missing. Run `terraform init` and commit `.terraform.lock.hcl`."

3. Check: Are there `.tfvars` files with secrets (regex: `password|secret|key.*=`)?
   - If YES → **STOP** - "Secrets detected in tfvars. Use AWS Secrets Manager + `data.aws_secretsmanager_secret`."

4. Run: `terraform fmt -check -recursive`
   - If fails → **STOP** - "Formatting violations. Run `terraform fmt -recursive` and commit."

---

## Step 2: Pass 1 — CRITICAL Security & State Audit

For every Terraform file, check this table:

| FILE | REMOTE STATE? | STATE LOCK? | SECRETS HARDCODED? | ENCRYPTION? | IAM LEAST PRIVILEGE? |
|------|---------------|-------------|---------------------|-------------|----------------------|
| backend.tf | ✅ S3/GCS | ✅ DynamoDB | — | ✅ encrypt=true | — |
| providers.tf | — | — | ❌ access_key in code? | — | ✅ assume_role ARN |
| *.tf modules | — | — | ❌ passwords in vars? | ✅ kms_key_id set | ✅ minimal perms |

**Rules:**
- `SECRETS HARDCODED?` = ❌ → **CRITICAL VIOLATION** (P0 -30 points)
- `ENCRYPTION?` = ❌ for RDS/EBS/S3 → **CRITICAL VIOLATION** (P1 -20 points)
- `IAM LEAST PRIVILEGE?` = ❌ (`Action: "*"` or `Resource: "*"`) → **CRITICAL VIOLATION** (P1 -20 points)

**Shadow Paths for State Management:**
1. **Happy path:** Remote state exists, locking works, `terraform plan` shows expected changes.
2. **Corruption path:** State file deleted/corrupted — can you recover from `terraform import`? Document import commands in `RUNBOOK.md`.
3. **Drift path:** Manual changes in AWS console — does `terraform plan` detect them? Run `terraform refresh` before apply.
4. **Lock conflict path:** Two engineers run `terraform apply` concurrently — does DynamoDB lock prevent corruption? Test with `terraform force-unlock` safety.

**Output for Pass 1:**
```
CRITICAL Violations: N issues

[file:line] Problem description
Fix: specific action

If N = 0: ✅ Pass 1 Complete — No critical violations.
```

---

## Step 3: Pass 2 — INFORMATIONAL Best Practices

Check for these patterns (report, don't block):

1. **Module Reusability** — Count resource blocks with identical patterns (e.g., 3+ `aws_subnet` blocks → suggest module extraction).

2. **Input Validation** — Variables missing `validation { condition = ... }` for CIDRs, instance types, region names.

3. **Output Design** — Outputs missing `description` attribute. Sensitive outputs not marked `sensitive = true`.

4. **Resource Tagging** — Resources missing `tags { Environment, ManagedBy, CostCenter }`. Use `default_tags` in provider block.

5. **Version Constraints** — Provider/module versions using ">=" (too permissive) instead of "~>" (safe minor upgrades).

6. **Documentation Gaps** — Missing `README.md` in module directories. No `terraform-docs` annotations.

**Output for Pass 2:**
```
INFORMATIONAL Recommendations: N suggestions

- [file:line] Suggestion description
  Improvement: specific change

If N = 0: ✅ Pass 2 Complete — Best practices followed.
```

---

## Step 4: CI/CD Integration Validation

For repositories with `.github/workflows/*.yml` or `.gitlab-ci.yml`, verify:

| STAGE | COMMAND | PR GATE | MERGE GATE | POST-MERGE |
|-------|---------|---------|------------|------------|
| Format | `terraform fmt -check` | ✅ Required | — | — |
| Validate | `terraform validate` | ✅ Required | — | — |
| Security Scan | `tfsec . --format=json` | ✅ Required | — | — |
| Plan | `terraform plan -out=tfplan` | ✅ Required | ✅ Review artifact | — |
| Apply | `terraform apply tfplan` | — | — | ✅ Auto-apply |
| Drift Detection | `terraform plan -detailed-exitcode` | — | — | ✅ Daily cron |

**GAP Detection:**
- If "Plan" not in PR → **VIOLATION** (Teams merge without reviewing changes)
- If "Apply" runs on PR → **VIOLATION** (Should only run post-merge)
- If "Drift Detection" missing → **WARNING** (Manual changes go undetected)

---

## Module Design Checklist

When creating reusable Terraform modules:

```hcl
# modules/networking/variables.tf
variable "vpc_cidr" {
  description = "CIDR block for VPC (e.g., 10.0.0.0/16)"
  type        = string

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be valid CIDR notation."
  }
}

variable "environment" {
  description = "Environment name (dev/staging/production)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Must be dev, staging, or production."
  }
}

# modules/networking/outputs.tf
output "vpc_id" {
  description = "VPC identifier for resource attachment"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs for EKS/RDS placement"
  value       = aws_subnet.private[*].id
}
```

**Module Catalog Template:**

| Module | Purpose | Inputs | Outputs | Version |
|--------|---------|--------|---------|---------|
| `networking` | VPC + Subnets + NAT | vpc_cidr, azs, env | vpc_id, subnet_ids | v1.2.0 |
| `compute/eks` | EKS cluster + node groups | cluster_name, k8s_version | cluster_endpoint, ca_cert | v2.1.3 |
| `database/rds` | PostgreSQL RDS with backups | instance_class, db_name | endpoint, connection_string | v1.5.0 |

---

## Suppressions (DO NOT flag)

**Never flag:**
- Multiple `aws_subnet` resources when using `count` or `for_each` (intentional iteration, not duplication)
- `depends_on` when resource dependencies are implicit (Terraform handles graph automatically, but explicit `depends_on` is defense-in-depth)
- Missing `default` values for required variables (forcing explicit values prevents dangerous defaults)
- Using community modules instead of writing from scratch (DRY principle, vetted by community)

---

## Real-World Failure Examples

**Example 1: Hardcoded Secrets in State**
```hcl
# ❌ BAD
resource "aws_db_instance" "main" {
  password = "SuperSecret123"  # Goes into state file in plaintext!
}

# ✅ GOOD
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/db/master-password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}
```

**Example 2: State Locking Forgotten**
Scenario: Two engineers run `terraform apply` in production simultaneously. No DynamoDB locking configured. State file becomes corrupted with partial writes from both sessions. 200+ resources now orphaned from state.

**How this skill would catch it:**
Step 1 checks for `dynamodb_table` in `backend.tf`. Blocks merge if missing.

**Example 3: IAM Wildcard Permissions**
```hcl
# ❌ BAD
resource "aws_iam_role_policy" "app" {
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = "*"              # Nuclear permission
      Resource = "*"
    }]
  })
}

# ✅ GOOD
resource "aws_iam_role_policy" "app" {
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject"]
      Resource = "arn:aws:s3:::my-bucket/*"
    }]
  })
}
```

---

## Provider Comparison Table

| Feature | AWS (Terraform) | GCP (Terraform) | Azure (Terraform) | Pulumi (All Clouds) |
|---------|-----------------|-----------------|-------------------|---------------------|
| **State Backend** | S3 + DynamoDB | GCS + locking | Azure Blob + lease | S3/Azure/Pulumi Cloud |
| **Secrets Mgmt** | Secrets Manager | Secret Manager | Key Vault | Native language secrets |
| **IAM Complexity** | High (roles/policies) | Medium (IAM bindings) | Medium (RBAC) | Same as provider |
| **Module Registry** | registry.terraform.io | Same | Same | pulumi.com/registry |
| **Language** | HCL | HCL | HCL | TypeScript/Python/Go |
| **Drift Detection** | `terraform plan -detailed-exitcode` | Same | Same | `pulumi refresh` |
| **Best For** | AWS-native orgs | GCP-native orgs | Azure-native orgs | Multi-cloud + devs prefer code |

---

## Terraform Commands Reference

```bash
# Initialize with backend config
terraform init -backend-config="bucket=my-tf-state" -backend-config="key=prod/terraform.tfstate"

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Security scan
tfsec . --minimum-severity MEDIUM

# Plan with detailed output
terraform plan -out=tfplan -var-file=production.tfvars

# Show plan in JSON (for PR review)
terraform show -json tfplan > plan.json

# Apply from plan artifact (safe)
terraform apply tfplan

# Targeted apply (blast radius minimization)
terraform apply -target=module.networking.aws_vpc.main

# Import existing resource
terraform import module.networking.aws_vpc.main vpc-abc123

# State management
terraform state list
terraform state show module.eks.aws_eks_cluster.main
terraform state mv module.old.resource module.new.resource
terraform state rm module.deprecated.resource

# Drift detection (exit code 2 = changes detected)
terraform plan -detailed-exitcode

# Destroy (with confirmation)
terraform destroy -var-file=production.tfvars

# Workspace management (alternative to separate state files)
terraform workspace new production
terraform workspace select production
terraform workspace list
```

---

## Priority Hierarchy Under Token Pressure

Step 1 (Pre-flight) > Pass 1 (CRITICAL) > CI/CD Integration > Pass 2 (INFORMATIONAL) > Module Catalog.

**Never skip:**
- Pre-flight checks (prevents broken state)
- Pass 1 CRITICAL violations (security/compliance)
- Real-world failure examples (teaches from production incidents)

**Drop first:**
- Module catalog (reference material)
- Suppressions (edge case handling)
- Provider comparison table (informational)

---

## Output Format

**Final Report:**
```
Infrastructure as Code Review: N issues (X critical, Y informational)

CRITICAL (blocking merge):
- backend.tf:5 No state locking configured
  Fix: Add dynamodb_table = "terraform-state-lock" to backend config

- main.tf:23 Hardcoded password in aws_db_instance
  Fix: Use data.aws_secretsmanager_secret_version

INFORMATIONAL (best practices):
- modules/compute/variables.tf:12 Missing validation for instance_type
  Improvement: Add validation { condition = contains(["t3.micro", ...], var.instance_type) }

If no issues: ✅ IaC Review Complete — Ready for terraform plan.
```

Be terse. One line problem, one line fix. File:line citations mandatory.

---

**Reference:** Terraform 1.6+, AWS Provider 5.30+, Pulumi 3.95+, NIST Cybersecurity Framework, CIS Benchmarks
