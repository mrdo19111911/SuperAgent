---
name: secrets-config-management
description: Secure secrets handling with AWS Secrets Manager, rotation, and leak prevention
allowed-tools: [Bash, Read, Write, Grep]
mode: TWO_PASS
---

## Philosophy

You are a **vault keeper**. Prime axiom: **"If it's sensitive, it's in a vault. If it's in code or logs, it's a P0 incident."**

**Modes:** CRITICAL (blocks deployment) | INFORMATIONAL (improves posture) | PREVENTION (proactive defense)

**Vault Analogy:** Physical vault = AWS Secrets Manager/Vault/Doppler | Key = IAM roles | Contents = API keys, DB passwords, JWT secrets | Access log = CloudTrail | Rotation = 90d DB, 180d API keys

**Examples:** Hardcoded secret → P0 | Logged secret → P0 | `.env` in git → P0 | No rotation 200d → P2

---

## Prime Directives

**1. NEVER hardcode secrets**
```typescript
// ❌ const stripeKey = "sk_live_51HxYz...";
// ✅ const stripeKey = await getSecret('prod/stripe/api-key');
```

**2. NEVER log secrets**
```typescript
// ❌ console.log("DB URL:", process.env.DATABASE_URL);
// ✅ console.log("Database connected");
```

**3. Use secret management service (not .env in production)**

**4. Rotate:** DB 90d, API keys 180d, JWT 365d, service tokens 30d

**5. Least-privilege access:** Only services needing secret X can read it

**6. Multi-tenant isolation:** Tenant A ≠ tenant B's secrets

**7. .env NEVER committed**
```bash
# .gitignore (MANDATORY): .env, .env.*, *.key, *.pem, secrets/
```

### Anti-Patterns

| Pattern | Why Dangerous | Penalty |
|---------|--------------|---------|
| `.env` committed | Secrets in git history forever | P0 (-30) |
| `console.log(apiKey)` | Secrets in CloudWatch/Datadog | P0 (-30) |
| Same secret dev/prod | Dev breach = prod breach | P1 (-20) |
| Secrets in stack traces | Exception logs expose data | P0 (-30) |
| No rotation > 180d | Compromised secrets stay valid | P2 (-15) |
| Shared across services | Blast radius = entire infra | P1 (-20) |
| Hardcoded encryption keys | Attackers decrypt all data | P0 (-30) |

---

## Secret Storage Solutions

| Solution | Best For | Rotation | Cost | Pros | Cons |
|----------|----------|----------|------|------|------|
| **AWS Secrets Manager** | AWS workloads | Auto (Lambda) | $0.40/secret/mo | Managed rotation, KMS | AWS lock-in, 50-100ms |
| **HashiCorp Vault** | Multi-cloud, K8s | Manual/Auto | Self-hosted | Dynamic secrets | Ops complexity |
| **Doppler** | Startups | Manual | $10/user/mo | Git-like UX | Limited enterprise |
| **.env** | **Local dev ONLY** | Manual | Free | Simple | ❌ NOT production |

**Decision:** AWS? → Secrets Manager | Multi-cloud? → Vault | Startup? → Doppler | Local? → .env

---

## AWS Secrets Manager (TypeScript)

**Read Secret:**
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretName: string): Promise<string> {
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
  if (!response.SecretString) throw new Error(`No SecretString: ${secretName}`);
  return response.SecretString;
}

// Cache 5min (reduce cost, avoid rate limits)
let cachedPassword: string | null = null;
let cacheExpiry = 0;

async function getCachedPassword(): Promise<string> {
  if (cachedPassword && Date.now() < cacheExpiry) return cachedPassword;
  cachedPassword = await getSecret('prod/db/postgres-password');
  cacheExpiry = Date.now() + 5 * 60 * 1000;
  return cachedPassword;
}
```

**Lambda Rotation (4 Steps):**
```typescript
export async function handler(event: RotationEvent) {
  const { SecretId, Token, Step } = event;

  switch (Step) {
    case 'createSecret':
      const newPassword = crypto.randomBytes(32).toString('base64');
      await client.send(new PutSecretValueCommand({
        SecretId, SecretString: newPassword, VersionStages: ['AWSPENDING'], ClientRequestToken: Token
      }));
      break;
    case 'setSecret':
      const pendingPassword = await getSecretVersion(SecretId, 'AWSPENDING');
      await pgClient.query(`ALTER USER app_user PASSWORD '${pendingPassword}'`);
      break;
    case 'testSecret':
      await new PgClient({ password: await getSecretVersion(SecretId, 'AWSPENDING') }).connect();
      break;
    case 'finishSecret':
      await client.send(new UpdateSecretVersionStageCommand({
        SecretId, VersionStage: 'AWSCURRENT', MoveToVersionId: Token
      }));
  }
}
```

**Schedule:**
```bash
aws secretsmanager rotate-secret --secret-id prod/db/postgres-password \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:rotate-db-password \
  --rotation-rules AutomaticallyAfterDays=90
```

---

## Production Breaches

**1. GitHub AWS Key → $47K (72h):** Developer committed `.env` with `AKIA...` → 500 EC2s crypto mining. Prevention: Pre-commit hook.

**2. CircleCI → 150K accounts:** API tokens in public repo (2019). Prevention: git-secrets + truffleHog.

---

## Leak Prevention

### Pre-Commit Hook
```bash
#!/bin/bash
echo "🔍 Scanning for secrets..."
git diff --cached | grep -E 'AKIA[0-9A-Z]{16}' && echo "❌ AWS Key" && exit 1
git diff --cached | grep -E 'sk_live_[0-9a-zA-Z]{24,}' && echo "❌ Stripe key" && exit 1
git diff --cached | grep -E 'BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY' && echo "❌ Private key" && exit 1
git diff --cached --name-only | grep -E '^\.env$' && echo "❌ .env staged" && exit 1
echo "✅ No secrets detected"
```

### Log Redaction
```typescript
function redactSecrets(message: string): string {
  return message
    .replace(/api[_-]?key["\s:=]+[\w-]+/gi, 'api_key=[REDACTED]')
    .replace(/password["\s:=]+.+/gi, 'password=[REDACTED]')
    .replace(/AKIA[0-9A-Z]{16}/g, 'AKIA[REDACTED]')
    .replace(/sk_live_[0-9a-zA-Z]{24,}/g, 'sk_live_[REDACTED]')
    .replace(/Bearer\s+[\w-]+/g, 'Bearer [REDACTED]')
    .replace(/postgresql:\/\/[^@]+@/g, 'postgresql://[REDACTED]@');
}
```

---

## Two-Pass Workflow

### CRITICAL (Blocks Deployment)
**P0:** Hardcoded secrets | Secrets in git history | Secrets in logs | `.env` committed | Private keys in codebase

**P1:** DB password > 180d | API key > 365d | No rotation Lambda

### INFORMATIONAL
Cache duration (5min → 1min) | Rotation frequency (90d → 60d) | Audit log analysis | Multi-region replication

---

## Meta-Instructions

### Audit Checklist
```bash
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
git grep -E '(AKIA|sk_live|password\s*=\s*"[^"]{8,}")' -- '*.ts' '*.js' '*.py' '*.go'
test -f .git/hooks/pre-commit && echo "✅ Hook installed" || echo "❌ Missing"
```

**During Work:** [ ] Secrets in AWS Secrets Manager [ ] Loaded at startup [ ] Logs redact [ ] Pre-commit hook active

### Stopping Policy
**STOP if:** Secrets in git → `git filter-repo --path .env --invert-paths` → Rotate ALL | Pre-commit finds secrets → Fix + audit | Logs show secrets → Redact + rotate

**Purge:**
```bash
pip install git-filter-repo
git filter-repo --path .env --invert-paths
git push origin --force --all
```

**After:** Rotate ALL + invalidate clones + review logs

---

## Quick Reference

### Installation
```bash
cp gates/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

### AWS CLI
```bash
# Create: aws secretsmanager create-secret --name prod/db/password --secret-string "$(openssl rand -base64 32)"
# Read: aws secretsmanager get-secret-value --secret-id prod/db/password
# Delete: aws secretsmanager delete-secret --secret-id prod/api-key --recovery-window-in-days 30
```

### Rotation
DB: 90d | API keys: 180d | JWT: 365d | Service tokens: 30d

### Emergency
1. Detect (unauthorized calls) 2. Revoke (`--force-delete-without-recovery`) 3. Rotate (deploy + restart)
