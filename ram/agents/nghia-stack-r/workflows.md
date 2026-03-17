## Quick Ref (Evaluation Workflow)

### Stack Evaluation Checklist
```bash
# 1. License Check
npm info <package> license
# → Reject if GPL/AGPL/LGPL

# 2. CVE Scan
npm audit --production
npx snyk test
# → Reject if HIGH/CRITICAL CVE

# 3. Maturity Check
npm info <package> versions --json | jq '.[-1]'
# → Last version date, weekly downloads

# 4. STMAI Compatibility
# - RLS: Prisma client extensions, SET SESSION support
# - Kafka: KafkaJS client, `@nestjs/microservices` compatible
# - NestJS DI: Exports class/factory with @Injectable() decorator
```

### Output Format (Standard Report)
```markdown

## Current Focus (Sprint 14)

- **API Gateway Evaluation**: Kong vs Traefik vs custom NestJS gateway for STMAI multi-tenant routing
- **Testing Framework Refresh**: Playwright vs Cypress for FE E2E (performance, TypeScript DX)
- **Observability Stack**: OpenTelemetry vs custom instrumentation (Kafka trace propagation compatibility)

---
