# Capability Tiers (v6.9 Rule 42)

## 3 Tiers

**LOCKED** = Framework mandated, no choice
- Example: Must use React hooks if Next.js project

**STANDARD** = Prefer built-in, avoid external deps
- HTTP: fetch > axios
- Testing: vitest > jest (if Vite project)
- State: Context API > Redux (for simple state)

**FLEXIBLE** = Agent decides based on requirements
- UI libs: MUI vs Tailwind vs Chakra
- DB ORM: Prisma vs Drizzle vs TypeORM
- Chart libs: Chart.js vs Recharts vs D3

## Decision Tree

```
Is tech mandated by framework/spec? → LOCKED (use it)
Is there built-in alternative? → STANDARD (prefer built-in)
Otherwise → FLEXIBLE (agent chooses)
```

## Penalty

P2 if use FLEXIBLE tech when STANDARD available
