# SUPERAGENT SKILL STANDARD — V1.0

> **Roles:** Dũng PM (Orchestrator), Thesis (Executor), Anti-Thesis (Reviewer).
> **Objective:** Define the mandatory structure and design principles for building "Skills" (Specialized Weapons) within the SuperAgent ecosystem.
> **Source:** Reverse-engineered from `gstack` core architectural patterns.

---

## 📐 Skill Anatomy

A Skill in SuperAgent is a self-contained directory within the `system/skills/` path.

```text
system/skills/
└── <skill-name>/
    ├── SKILL.md               # ⭐ MAIN ENTRY - Read by agents
    ├── <supporting>.md        # Modular sub-prompts or checklists
    └── bin/                   # Optional: Compiled binaries or scripts
```

---

## ⚡ Core Components

### 1. YAML Front Matter (The Firewall)
Every `SKILL.md` must start with metadata to define the execution boundary.

| Field | Description |
|-------|-------------|
| `name` | The unique identifier (slash command). |
| `version` | SemVer for tracking evolution. |
| `description` | Concise summary for agent discovery. |
| `allowed-tools` | **FIREWALL**: Strict list of tools the agent is permitted to use. |

**Example:**
```yaml
---
name: review
version: 1.0.0
description: "Pre-landing PR review for safety and correctness."
allowed-tools: [Bash, Read, Edit, Grep, AskUserQuestion]
---
```

### 2. Procedural Workflow
Linear, step-by-step instructions ensure predictable execution.

- **Checkpoints**: Explicitly check for state before proceeding (e.g., `git branch`).
- **Stop Conditions**: Bolded **STOP** instructions for failure states.
- **Code Blocks**: Copy-paste ready CLI commands.

### 3. Modular References
Tách concerns bằng cách sử dụng external `.md` files.

- **Checklists**: Huge validation lists should be in separate files.
- **Reusability**: Shared components (e.g., `safety_checklist.md`) can be referenced by multiple skills.

---

## 🎯 Design Principles (The 10 Techniques)

| Technique | Principle | Logic |
|-----------|-----------|-------|
| **1. Non-Interactive** | Default to EXECUTION | AskUserQuestion only for genuine, high-stakes decisions. |
| **2. Explicit Stop** | NO silent failures | **STOP** and report immediately on error or test failure. |
| **3. Two-Pass Architecture** | Tiered Urgency | Pass 1: CRITICAL (Blocking) / Pass 2: INFORMATIONAL (Suggestions). |
| **4. Structured Output** | Consistency | Use templates for reports (file:line, problem, fix). |
| **5. Error Mapping** | Tabular Thinking | Map specific exceptions to rescue actions (e.g., Timeout → Retry). |
| **6. Suppressions** | Signal-over-Noise | Maintain lists of known false positives to prevent "nagging". |
| **7. Graceful Degradation** | Optional Hooks | Skip optional integrations (e.g., external APIs) silently if unavailable. |
| **8. History Learning** | Accumulative Intel | Read past logs (e.g., `history.md`) to avoid repeating mistakes. |
| **9. Bisectable Commits** | Git Hygiene | Split implementation into small, valid, independently testable commits. |
| **10. Mode Switching** | Cognitive Framing | Switch between `EXPANSION` (Creative) and `REDUCTION` (Ruthless MVP). |

---

## 📊 Skill Archetypes

| Archetype | Example | Complexity | Implementation Pattern |
|-----------|---------|------------|------------------------|
| **Pure Prompt** | `/plan-ceo` | HIGH | Extensive logic described entirely in `SKILL.md`. |
| **Prompt + Checklist** | `/review` | MEDIUM | `SKILL.md` controls the flow; `.md` files contain the data. |
| **Prompt + Binary** | `/browse` | LOW | `SKILL.md` acts as a thin wrapper for a CLI tool/binary. |

---

## 🎓 Compliance Standards

### ✅ DO's
- Enforce `allowed-tools` as a firewall.
- Use **numbered steps** for linear workflows.
- Bold **critical actions** and **stop conditions**.
- Provide evidence (file:line, logs) for every finding.
- Modularize large prompts into checklists.

### ❌ DON'Ts
- **No vague instructions**: Be specific (e.g., "Check line 50", not "Check the file").
- **No silent failures**: Always report why you stopped.
- **No monolithic prompts**: If a checklist is >50 lines, move it to a separate file.
- **No hardcoded paths**: Use environment variables or relative root markers.

---

## 🧬 Skill DNA Summary
A perfect SuperAgent skill combines **Metadata** (Security), **Workflow** (Precision), **Modularity** (Scalability), **Intelligence** (Learning), and **UX** (Autonomy).
ure
    - Structured outputs
  
  UX:
    - Non-interactive default
    - AskUserQuestion for genuine decisions only
    - Graceful degradation
    - Progress visibility
Update Todos

Nghiên cứu cách gstack chế tạo skills (vũ khí)

Đọc source code của từng skill

Phân tích kỹ thuật tối ưu

Tổng hợp chuẩn mực chế tạo vũ khí