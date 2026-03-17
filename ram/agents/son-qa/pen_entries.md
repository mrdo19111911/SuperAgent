## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (Never Repeat)

1. **Lazy review — 0 bugs found in bad code** (-30)
   - Test pass GREEN but Mộc/Phúc catch bugs later
   - Fix: ALWAYS run chaos tests (empty, null, 10MB, SQL injection) even if unit tests pass

2. **Báo BLOCKER sai (no data loss)** (-30)
   - Bug có workaround nhưng classify BLOCKER → Dev panic, sprint dở
   - Fix: BLOCKER = data loss OR security breach OR RLS bypass ONLY

### P1 HIGH (Learn From)

3. **Phóng đại severity (MAJOR → CRITICAL)** (-15)
   - Không có lý do rõ ràng, dev waste time
   - Fix: CRITICAL = core feature broken + no workaround

4. **Bug report thiếu repro steps** (-10)
   - Dev không reproduce được
   - Fix: ALWAYS include: 1) Steps, 2) Expected, 3) Actual, 4) Log/screenshot

5. **Test hollow — fake GREEN coverage** (-10)
   - Test case chỉ để tăng coverage %, không test thực
   - Fix: Verify test FAILS when code breaks (delete logic → test should fail)

### P2 MEDIUM (Avoid)

6. **Không test RLS với non-superuser account** (-10)
   - PostgreSQL superuser BYPASSRLS → sai results
   - Fix: Test RLS with `SET ROLE app_user;`

7. **Thiếu edge case testing** (-8)
   - Chỉ test happy path, không test null/negative/max int
   - Fix: Test matrix: null, undefined, "", -1, 0, MAX_INT, special chars (UTF-8, emoji)

8. **Không classify root cause type** (-8)
   - Report bug không rõ FE-only vs BE-only
   - Fix: Debug trước khi report (network tab, console log, backend log)

9. **BUG_LIST.md format sai** (-5)
   - Thiếu severity, repro steps, evidence
   - Fix: Follow template (Severity, Root cause type, Repro, Evidence, Expected, Actual)

10. **Không test auth bypass scenarios** (-5)
    - Chỉ test logged-in user, không test unauthorized access
    - Fix: Test: 1) No token, 2) Expired token, 3) Wrong user, 4) RLS bypass

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **Tìm RLS bypass (data leak prevention)** (+30, 2026-02-10)
   - User A thấy data của User B trong multi-tenant app
   - Root cause: Missing `WHERE tenant_id = current_user_tenant()` in query
   - Impact: Prevented production data breach

2. **Critical bug: Payment gateway không handle timeout** (+20, 2026-02-25)
   - Dev không test network failure → double charge khách hàng
   - Chaos test: Kill connection mid-request → bug found
   - Impact: Saved production incident

3. **BUG_LIST.md approved 1st try (đầy đủ format)** (+10, 2026-03-01)
   - 15 bugs classified đúng severity, đầy đủ repro steps
   - Dũng PM approve không cần revision
   - Impact: Dev fix nhanh, không back-and-forth

4. **SQL injection prevented** (+15, 2026-02-15)
   - Input field không sanitize → chaos test với `'; DROP TABLE--` string
   - Impact: Security vulnerability fixed before deploy

5. **Test hollow detection (80% coverage nhưng không test gì)** (+10, 2026-03-05)
   - Test suite pass GREEN nhưng không catch bugs
   - Audit: Delete business logic → tests still pass → hollow tests found
   - Impact: Team rewrite tests to actually validate logic

_Full history: See LEDGER_

---
