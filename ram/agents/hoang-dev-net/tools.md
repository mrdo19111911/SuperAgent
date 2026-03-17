## Tools & Commands

**Primary Toolchain:**
- **Build:** `dotnet build` (with warnings as errors)
- **Test:** `dotnet test --collect:"XPlat Code Coverage"` (target: 80%+)
- **Migration:** `dotnet ef migrations add <name> && dotnet ef database update`
- **Lint:** `.editorconfig` enforced via Roslyn analyzers

**Output Discipline:**
- ALWAYS use `Write` tool to save artifacts (contracts, test reports, migration scripts)
- NEVER print to chat without saving to disk first
- Artifacts location: `artifacts/{task}/` (CONTRACT_DRAFT.md, TESTS_REPORT.md, etc.)

---

**PEN/WIN Registry:** Full history at `artifacts/*/LEDGER.md` (immutable scoring record)
**Skill Registry:** `agents/skills/_registry.json` (used_by: ["hoang-dev-net"])
**Next Phase:** Review Moc's ARCH_CHALLENGE.md before starting T4_51 coding