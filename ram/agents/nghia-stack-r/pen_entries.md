## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (Never Recommend)
1. **GPL License Recommendation** (2026-02-18, -30, BUG-756)
   - Recommended library with GPL-3.0 license → IP liability for STMAI commercial product
   - Fix: ALWAYS check license in evaluation matrix BEFORE verdict
   - Filter: `npm info <pkg> license` → reject if GPL/AGPL/LGPL

2. **Known CVE in Production Library** (2026-03-01, -30, BUG-801)
   - Recommended `axios@0.21.1` with CVE-2021-3749 (HIGH severity) → Security risk
   - Fix: ALWAYS run `npm audit` + check Snyk/GitHub advisories
   - Rule: Any HIGH/CRITICAL CVE = AUTO-REJECT

### P1 HIGH (Compatibility Failures)
3. **RLS-Incompatible ORM** (2026-02-25, -20, BUG-789)
   - Recommended TypeORM without RLS capability check → Re-architecture required
   - Fix: MUST verify RLS support (Prisma Row-Level-Security, PostgREST RLS policies)
   - Test: Check if ORM allows SET SESSION for tenant_id context

4. **No Kafka Integration Path** (2026-03-05, -20, BUG-812)
   - Recommended event library without Kafka adapter → Event-driven redesign
   - Fix: MUST verify Kafka client compatibility (KafkaJS, Confluent, RedPanda)

### P2 MEDIUM (Incomplete Analysis)
5. **Missing Performance Benchmark** (2026-02-20, -15, REVIEW-203)
   - Verdict "RECOMMEND" without load test data for STMAI scale (1000+ shipments/day)
   - Fix: MUST include benchmark (req/sec, latency p95, memory footprint)

6. **Verdict Without Justification** (2026-03-08, -15, REVIEW-215)
   - Verdict "DEFER" without clear reason → Đôn Synth rejected report
   - Fix: ALWAYS include 3-sentence justification (why RECOMMEND/DEFER/REJECT)

7. **Incomplete Maturity Scan** (2026-02-15, -10, REVIEW-198)
   - Missing last updated date in evaluation matrix → Risk of unmaintained library
   - Fix: ALWAYS check GitHub last commit, npm publish date, maintainer activity

8. **No CVE Check for Dependencies** (2026-03-10, -10, REVIEW-220)
   - Checked main library but not transitive dependencies → Hidden vulnerabilities
   - Fix: Run `npm audit --production` to scan full dependency tree

9. **Biased Recommendation (No Trade-offs)** (2026-02-28, -10, REVIEW-210)
   - Only listed pros, no cons → Overly optimistic evaluation
   - Fix: MUST include trade-offs (performance vs ease-of-use, features vs bundle size)

10. **Missing NestJS DI Test** (2026-03-12, -10, REVIEW-225)
    - Recommended library without verifying NestJS injectable compatibility
    - Fix: Check if library exports class/factory compatible with `@Injectable()` decorator

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **Prisma ORM Validation** (2026-02-10, +25, RESEARCH-045)
   - Comprehensive RLS + Kafka + NestJS compatibility check
   - Result: Adopted as STMAI default ORM (0 CVE, MIT license, 4M+ weekly downloads)
   - Impact: Zero re-architecture for multi-tenancy

2. **Kafka Library Comparison** (2026-02-22, +20, RESEARCH-051)
   - Evaluated KafkaJS vs Confluent Kafka Node.js (performance, type safety, NestJS DI)
   - Result: KafkaJS selected (TypeScript-first, easier mocking, NestJS module available)
   - Impact: Faster development, better test coverage

3. **React State Management Decision** (2026-03-03, +20, RESEARCH-058)
   - Zustand vs Redux Toolkit vs Jotai trade-off analysis
   - Result: Zustand recommended (minimal boilerplate, TypeScript-friendly, 2.5M weekly downloads)
   - Impact: -30% state management code, +15% developer velocity

4. **License Audit Save** (2026-02-12, +15, RESEARCH-047)
   - Caught GPL-3.0 license in `react-grid-layout@1.3.0` before adoption
   - Result: Switched to `react-grid-layout@1.4.0` (MIT license)
   - Impact: Prevented IP liability for STMAI commercial SaaS

5. **CVE Prevention** (2026-03-06, +15, RESEARCH-060)
   - Detected CVE-2022-24999 in `express@4.17.1` during evaluation
   - Result: Recommended `express@4.18.2` (patched version)
   - Impact: Zero production security incident

_Full history: See LEDGER_

---
