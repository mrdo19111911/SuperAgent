# How to Build Skills (gstack Way)

This is how gstack builds skills. Not generic templates — real patterns distilled from `/browse`, `/review`, `/ship`, `/qa`, `/retro`.

You want to mass-produce 100 skills at this quality level. Here's how.

---

## Three Architectures

gstack uses three patterns. Pick the right one for your skill.

### Pattern 1: Persistent Server (`/browse`, `/qa`)

**When:** You need state between commands. Browser tabs, database connections, file watchers. Cold start >1s.

**Structure:**

```
browse/
├── SKILL.md                    # The prompt
├── src/
│   ├── cli.ts                 # Entry: ensure server → send command
│   ├── server.ts              # Bun.serve, routes, auth
│   ├── browser-manager.ts     # State (tabs, refs, buffers)
│   ├── handlers/              # read.ts, write.ts, meta.ts
│   └── buffers.ts             # CircularBuffer for logs
├── dist/browse                # Compiled binary (~58MB)
├── .gstack/browse.json        # Runtime state (pid, port, token)
└── setup