# Cấu Tạo Skill - Giải Thích Thật

## TL;DR

**Hầu hết skills = CHỈ 1 file SKILL.md**

Chỉ có `/browse` và `/qa` phức tạp vì cần browser thật.

---

## Cấu Trúc Thực Tế

### 95% Skills: CHỈ MARKDOWN

```
/ship          → ship/SKILL.md (14KB - 1 file duy nhất!)
/plan-ceo      → plan-ceo-review/SKILL.md (33KB - 1 file!)
/retro         → retro/SKILL.md (1 file)
```

**Đây là toàn bộ code:**
- SKILL.md = prompt instructions
- Claude Code đọc file này → thực hiện theo workflow trong đó
- **KHÔNG CÓ SERVER, KHÔNG CÓ BINARY!**

---

### `/review` - 3 files (vẫn chỉ markdown)

```
review/
├── SKILL.md           # Main workflow (4.8KB)
├── checklist.md       # Danh sách check lỗi (6.9KB)
└── greptile-triage.md # Cách xử lý Greptile comments (4.4KB)
```

**Tại sao tách?**
- SKILL.md quá dài → tách checklist riêng
- Dễ maintain (sửa checklist không động vào workflow)
- Vẫn 100% markdown, KHÔNG CÓ CODE

---

### `/browse` - Ngoại lệ duy nhất

```
browse/
├── SKILL.md          # Prompt (4KB)
├── src/              # TypeScript code
│   ├── cli.ts       # Command line
│   ├── server.ts    # Browser server
│   └── ...
├── dist/browse       # Binary đã compile (~58MB)
└── test/            # Tests
```

**Tại sao phức tạp?**
- Cần BROWSER THẬT (Playwright/Chromium)
- Claude không thể điều khiển browser trực tiếp
- → Cần binary riêng làm "tay chân"

**Workflow:**
1. User: `/browse goto example.com`
2. Claude đọc browse/SKILL.md
3. SKILL.md bảo: "Call `browse goto example.com`"
4. Claude gọi Bash tool → chạy binary `browse`
5. Binary khởi động Chromium → vào example.com
6. Trả kết quả về cho Claude

---

## So Sánh

| Skill | Files | Có code? | Tại sao |
|-------|-------|----------|---------|
| `/ship` | 1 file .md | ❌ Không | Workflow thuần túy (git, tests, PR) |
| `/review` | 3 files .md | ❌ Không | Workflow + checklist dài |
| `/plan-ceo` | 1 file .md | ❌ Không | Chỉ là câu hỏi + ASCII diagrams |
| `/retro` | 1 file .md | ❌ Không | Phân tích git log |
| `/browse` | SKILL.md + src/ | ✅ CÓ | Cần điều khiển browser |
| `/qa` | SKILL.md + src/ | ✅ CÓ | Dùng `/browse` infrastructure |

---

## Ví Dụ: `/ship` Làm Việc Như Thế Nào

**File duy nhất: ship/SKILL.md**

```markdown
# Ship: Fully Automated Ship Workflow

## Step 1: Pre-flight
1. Check current branch. If on `main`, abort.
2. Run `git status`
3. Run `git diff main...HEAD --stat`

## Step 2: Merge origin/main
git fetch origin main && git merge origin/main --no-edit

## Step 3: Run tests
bin/test-lane 2>&1 | tee /tmp/ship_tests.txt &
npm run test 2>&1 | tee /tmp/ship_vitest.txt &
wait

If any test fails: STOP.

## Step 4: Version bump
Read VERSION file, auto-decide MICRO/PATCH, write new version

## Step 5: CHANGELOG
Auto-generate from git log main..HEAD

## Step 6: Commit
git add VERSION CHANGELOG.md
git commit -m "chore: bump version..."

## Step 7: Push
git push -u origin <branch>

## Step 8: Create PR
gh pr create --title "..." --body "..."
```

**Đó là TẤT CẢ!**

Claude đọc file này → thực hiện từng step → xong.

Không server, không binary, không TypeScript, không gì hết.

---

## Khi Nào Cần Code?

**Chỉ khi:**
1. ✅ Cần persistent state (browser tabs, DB connection)
2. ✅ Cần external process (Chromium, language server)
3. ✅ Cần binary performance (parsing 100MB logs)

**Không cần khi:**
- ❌ Chỉ gọi git, npm, bash commands → SKILL.md đủ
- ❌ Chỉ phân tích text, diff → SKILL.md đủ
- ❌ Chỉ hỏi user, đưa ra options → SKILL.md đủ

---

## Cách Tạo Skill Đơn Giản

### Skill Type 1: Pure Workflow (95% trường hợp)

**Bước 1:** Tạo folder
```bash
mkdir ~/.claude/skills/my-skill
```

**Bước 2:** Tạo SKILL.md
```bash
cat > ~/.claude/skills/my-skill/SKILL.md <<'EOF'
---
name: my-skill
description: What this skill does
allowed-tools:
  - Bash
  - Read
  - Edit
---

# My Skill

## Step 1: Do something
bash command here


## Step 2: Do next thing
another command

EOF
```

**Bước 3:** Xong! Dùng `/my-skill`

---

### Skill Type 2: With Helper Files (như `/review`)

```bash
mkdir ~/.claude/skills/my-skill
cd ~/.claude/skills/my-skill

# Main workflow
cat > SKILL.md <<'EOF'
# My Skill
Read `.claude/skills/my-skill/checklist.md`
Apply checklist to current code
EOF

# Helper checklist
cat > checklist.md <<'EOF'
## Check these:
- Thing 1
- Thing 2
EOF
```

---

### Skill Type 3: With Binary (chỉ khi THỰC SỰ cần)

**Đừng làm này trừ khi:**
- Cần browser automation (như `/browse`)
- Cần language server (LSP)
- Cần parse cực nhanh (100MB+ files)

**Nếu không chắc → dùng Type 1 (pure markdown)!**

---

## Tóm Lại

### Hiểu Lầm Của Bạn ✅ ĐÚNG!

> "Tôi cứ tưởng chỉ là 1 file .md thôi"

**→ Đúng 95%!** Hầu hết skills chỉ là markdown.

### Sự Thật

- **/ship, /plan-ceo, /retro** = Chỉ .md
- **/review** = 3 files .md (tách cho dễ đọc)
- **/browse, /qa** = .md + TypeScript (cần browser)

### Để Tạo 100 Skills

**Không cần học TypeScript!**
**Không cần học Bun!**
**Không cần compile binary!**

**Chỉ cần:**
1. Tạo folder: `~/.claude/skills/skill-name/`
2. Viết SKILL.md với workflow
3. Xong!

---

## Template Tối Giản

```bash
mkdir ~/.claude/skills/analyze-deps
cat > ~/.claude/skills/analyze-deps/SKILL.md <<'EOF'
---
name: analyze-deps
description: Analyze project dependencies for security issues
allowed-tools: [Bash, Read, Grep]
---

# Dependency Analyzer

## Step 1: Find dependency files
```bash
find . -name "package.json" -o -name "Gemfile" -o -name "requirements.txt"
```

## Step 2: Run security audit
```bash
npm audit
bundle audit
pip-audit
```

## Step 3: Report findings
If CRITICAL vulnerabilities found:
- List each with CVE number
- Suggest fix (update version)

EOF

# Dùng ngay
/analyze-deps
```

**60 giây. Không cần code. Chạy ngay.**

---

## Kết Luận

**Bạn đúng rồi:**
- Skill = 1 file .md (trong 95% trường hợp)
- Chỉ `/browse` và `/qa` đặc biệt vì cần browser

**Để tạo 100 skills:**
- Viết 100 files .md
- KHÔNG CẦN code (trừ khi browser/LSP)
- Copy template, sửa workflow, xong

**gstack "phức tạp" chỉ vì `/browse` cần Chromium. Còn lại đơn giản hơn bạn nghĩ nhiều!**
