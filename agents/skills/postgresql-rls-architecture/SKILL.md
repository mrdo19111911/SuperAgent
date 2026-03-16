# PostgreSQL RLS Security Setup

Setup NOBYPASSRLS roles, RLS policies, and secure connection pools.

---

## 1. Create NOBYPASSRLS Role

```sql
CREATE ROLE app_user NOBYPASSRLS LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mydb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Verify
SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'app_user';
-- rolbypassrls = 'f' ✅
```

---

## 2. Enable RLS + Create Policy

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Read policy
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::TEXT);

-- Write policy
CREATE POLICY tenant_isolation_write ON projects
  FOR INSERT, UPDATE
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::TEXT);
```

---

## 3. Connection Pool (Node.js)

```typescript
const pool = new Pool({
  user: 'app_user',  // NOT 'postgres'
  password: process.env.DB_APP_PASSWORD
});
```

---

## 4. SET LOCAL Middleware

```typescript
app.use(async (req, res, next) => {
  const tenantId = req.user.tenant_id;
  const client = await pool.connect();

  await client.query("BEGIN");
  await client.query("SET LOCAL app.current_tenant_id = $1", [tenantId]);

  req.dbClient = client;
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    req.dbClient?.query("COMMIT").finally(() => req.dbClient.release());
  });
  next();
});
```

**Use `SET LOCAL` (transaction-scoped), NOT `SET` (session-scoped).**

---

## Checklist

- [ ] `app_user` role with NOBYPASSRLS
- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] Policy: `USING (tenant_id = current_setting(...))`
- [ ] `WITH CHECK` for INSERT/UPDATE
- [ ] Pool uses `app_user`
- [ ] `SET LOCAL` in middleware

---

## Test Isolation

```sql
SET ROLE app_user;
BEGIN;
SET LOCAL app.current_tenant_id = 'tenant_A';

INSERT INTO projects (id, tenant_id, name) VALUES ('p1', 'tenant_A', 'OK');
-- ✅

INSERT INTO projects (id, tenant_id, name) VALUES ('p2', 'tenant_B', 'FAIL');
-- ❌ ERROR: violates row-level security

COMMIT;
```

---

## Pitfalls

| Wrong | Right |
|-------|-------|
| `user: 'postgres'` | `user: 'app_user'` |
| `SET app.current_tenant_id` | `SET LOCAL app.current_tenant_id` |
| Only `USING` policy | `USING` + `WITH CHECK` |
