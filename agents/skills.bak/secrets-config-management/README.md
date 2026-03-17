# Secrets & Config Management

Secure secrets handling with AWS Secrets Manager, rotation, and leak prevention.

## Purpose

**You are a vault keeper.** Prevent production breaches from hardcoded secrets, leaked credentials in logs, and compromised secrets staying valid indefinitely. This skill enforces the axiom: **"If it's sensitive, it's in a vault. If it's in code or logs, it's a P0 incident."**

## Target Agents

**Primary:** Thanh Lai (Security & Deployment)

**Secondary:** Hung (DevOps), Thuc (TypeScript Dev), Tuan (Go Dev), Huyen-Py (Python Dev), Hoang (.NET Dev)

## When to Use

- Setting up new environments (dev/staging/prod)
- Storing API keys, DB passwords, JWT secrets, encryption keys
- Implementing secret rotation (DB passwords every 90 days)
- Preventing secrets from entering git history
- Responding to security incidents (leaked credentials)

## Core Principles

### Three Operational Modes

**1. CRITICAL (Blocks Deployment)**
- Hardcoded secrets in source code → P0 violation
- Secrets in logs or git history → P0 violation
- `.env` files committed to repository → P0 violation

**2. INFORMATIONAL (Improve Security Posture)**
- Rotation frequency optimization (90 days → 60 days)
- Secret caching strategies (5min vs 1min)
- Audit log analysis (detect unusual access patterns)

**3. PREVENTION (Proactive Defense)**
- Pre-commit hooks block secrets before git
- SAST tools (truffleHog) scan codebase
- CI/CD pipeline enforces security gates

### Secret Storage Solutions

| Solution | Best For | Cost | Rotation |
|----------|----------|------|----------|
| **AWS Secrets Manager** | Production AWS workloads | $0.40/secret/month | Auto (Lambda) |
| **HashiCorp Vault** | Multi-cloud, Kubernetes | Self-hosted | Manual/Auto |
| **Doppler** | Startups, simple workflows | $10/user/month | Manual |
| **.env files** | **Local dev ONLY** | Free | Manual |

### Prime Directives (Non-Negotiable)

1. **NEVER** hardcode secrets in source code
2. **NEVER** log secrets (redact in error messages)
3. Use secret management service (not .env in production)
4. Rotate secrets on schedule (DB passwords every 90 days, API keys every 180 days)
5. Least-privilege access (only services that need secret X can read it)
6. Multi-tenant isolation (tenant A cannot read tenant B's secrets)
7. .env files NEVER committed to git

## Real Production Breach Example

```
Incident: GitHub repository with hardcoded AWS access key
Impact: Attacker spawned 500 EC2 instances for crypto mining
Cost: $47,000 AWS bill in 72 hours
Root cause: Developer committed .env file with AKIA... key
Prevention: Pre-commit hook would have blocked commit
```

## Integration

**Load secrets at startup (NOT per request):**
```typescript
async function main() {
  const dbPassword = await getSecret('prod/db/password');
  process.env.DATABASE_URL = `postgresql://user:${dbPassword}@db:5432/prod`;

  const app = createApp();
  app.listen(3000);
}
```

**Pre-commit hook (block secrets):**
```bash
# .git/hooks/pre-commit
if git diff --cached | grep -E 'AKIA|sk_live|password\s*='; then
  echo "❌ ERROR: Secret detected"
  exit 1
fi
```

**Automatic rotation (AWS Lambda):**
```bash
aws secretsmanager rotate-secret \
  --secret-id prod/db/password \
  --rotation-lambda-arn arn:aws:lambda:...:function:rotate-db-password \
  --rotation-rules AutomaticallyAfterDays=90
```

## Security Gates

**Quick scan (one-line audit):**
```bash
git grep -E 'AKIA|sk_live|password\s*=' | wc -l  # Expected: 0
```

**Full scan (gates/security.sh):**
```bash
bash gates/security.sh || exit 1  # Blocks deployment if secrets detected
```

## Checklist

**Before Development:**
- [ ] .env added to .gitignore
- [ ] Pre-commit hook installed
- [ ] Secrets stored in AWS Secrets Manager (production)

**During Development:**
- [ ] No hardcoded secrets in code
- [ ] Secrets loaded at startup (cached in memory)
- [ ] Logs redact sensitive values (`[REDACTED]`)

**Before Deployment:**
- [ ] Run `gates/security.sh` (no secrets detected)
- [ ] Rotation Lambda deployed for DB passwords
- [ ] IAM policies enforce least-privilege access

## Stopping Policy

**STOP IMMEDIATELY if:**
1. Secrets detected in git history → Purge with `git filter-repo` → Rotate ALL secrets
2. Production logs show secrets → Redact logs → Rotate leaked secrets
3. Pre-commit hook finds secrets → Fix before committing → Audit recent commits
